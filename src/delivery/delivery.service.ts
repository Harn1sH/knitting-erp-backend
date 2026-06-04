import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDeliveryChallanDto } from 'src/dto/delivery/create-delivery-challan.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DeliveryService {
    constructor(private readonly prismaService: PrismaService) {}

    async getNextDcNumber() {
        const fullYear = new Date().getFullYear();
        const yy = String(fullYear).slice(-2);

        const counter = await this.prismaService.challanCounter.findUnique({
            where: { type_year: { type: 'DC', year: fullYear } }
        });

        const nextNumber = (counter?.lastNumber ?? 0) + 1;
        return { dcNo: `DC-${yy}-${String(nextNumber).padStart(4, '0')}` };
    }

    async createDeliveryChallan(dto: CreateDeliveryChallanDto) {
        return this.prismaService.$transaction(async (tx) => {
            const jobCard = await tx.jobCard.findUnique({
                where: { jobNumber: dto.jobCardId },
                include: { fabricItems: true }
            });

            if (!jobCard) {
                throw new BadRequestException('Job Card not found');
            }

            // Validate each line item's remaining quantity
            for (const item of dto.items) {
                const fabricItem = jobCard.fabricItems.find(f => f.id === item.fabricItemId);
                if (!fabricItem) {
                    throw new BadRequestException(`Fabric Item ${item.fabricItemId} not found in this Job Card`);
                }

                const deliveryAgg = await tx.deliveryItem.aggregate({
                    _sum: { quantityKg: true },
                    where: {
                        fabricItemId: item.fabricItemId,
                        challan: { jobCardId: jobCard.id }
                    }
                });
                const alreadyDelivered = deliveryAgg._sum.quantityKg || 0;
                const remaining = fabricItem.orderQuantity - alreadyDelivered;

                if (item.quantityKg > remaining) {
                    throw new BadRequestException(
                        `Cannot dispatch ${item.quantityKg} kg for fabric "${fabricItem.composition} / ${fabricItem.gsm} GSM". Only ${remaining.toFixed(2)} kg remaining.`
                    );
                }
            }

            // Generate DC number
            const fullYear = new Date().getFullYear();
            const yy = String(fullYear).slice(-2);

            const counter = await tx.challanCounter.upsert({
                where: { type_year: { type: 'DC', year: fullYear } },
                create: { type: 'DC', year: fullYear, lastNumber: 1 },
                update: { lastNumber: { increment: 1 } },
            });

            const dcNo = `DC-${yy}-${String(counter.lastNumber).padStart(4, '0')}`;

            // Create challan with nested items
            await tx.deliveryChallan.create({
                data: {
                    dcNo,
                    jobCardId: jobCard.id,
                    vehicle: dto.vehicle ?? null,
                    companyName: dto.companyName ?? null,
                    date: dto.date,
                    items: {
                        create: dto.items.map(item => ({
                            fabricItemId: item.fabricItemId,
                            quantityKg: item.quantityKg,
                            numberOfRolls: item.numberOfRolls ?? null,
                            weightPerRoll: item.weightPerRoll ?? null,
                            fabricName: item.fabricName ?? null,
                        }))
                    }
                },
            });

            return { status: 201, message: "Delivery challan saved successfully", dcNo };
        });
    }
}
