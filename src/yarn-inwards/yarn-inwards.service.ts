import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateYarnInwardChallanDto } from 'src/dto/yarnInwards/create-yarn-inward-challan.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class YarnInwardsService {
    constructor(private readonly prismaService: PrismaService) {}

    async getNextGrnNumber() {
        const fullYear = new Date().getFullYear();
        const yy = String(fullYear).slice(-2);

        const counter = await this.prismaService.challanCounter.findUnique({
            where: { type_year: { type: 'GRN', year: fullYear } }
        });

        const nextNumber = (counter?.lastNumber ?? 0) + 1;
        return { grnNo: `GRN-${yy}-${String(nextNumber).padStart(4, '0')}` };
    }

    async createYarnInwardChallan(dto: CreateYarnInwardChallanDto) {
        return this.prismaService.$transaction(async (tx) => {
            const jobCard = await tx.jobCard.findUnique({
                where: { jobNumber: dto.jobCardId },
                include: { fabricItems: true }
            });

            if (!jobCard) {
                throw new BadRequestException('Job Card not found');
            }

            const accumulatedYarn = new Map<string, number>();

            // Validate fabric items exist and check remaining quantity
            for (const item of dto.items) {
                const fabricItem = jobCard.fabricItems.find(f => f.id === item.fabricItemId);
                if (!fabricItem) {
                    throw new BadRequestException(`Fabric Item ${item.fabricItemId} not found in this Job Card`);
                }

                const yarnAgg = await tx.yarnInwardItem.aggregate({
                    _sum: { netWeight: true },
                    where: {
                        fabricItemId: item.fabricItemId,
                        challan: { jobCardId: jobCard.id }
                    }
                });
                
                const alreadyReceived = yarnAgg._sum.netWeight || 0;
                const accumulated = accumulatedYarn.get(item.fabricItemId) || 0;
                const remaining = fabricItem.totalYarnNeeded - alreadyReceived - accumulated;

                if (item.netWeight > remaining) {
                    throw new BadRequestException(
                        `Cannot receive ${item.netWeight} kg for fabric "${fabricItem.composition} / ${fabricItem.gsm} GSM". Only ${remaining.toFixed(2)} kg remaining.`
                    );
                }

                accumulatedYarn.set(item.fabricItemId, accumulated + item.netWeight);
            }

            // Generate GRN number
            const fullYear = new Date().getFullYear();
            const yy = String(fullYear).slice(-2);

            const counter = await tx.challanCounter.upsert({
                where: { type_year: { type: 'GRN', year: fullYear } },
                create: { type: 'GRN', year: fullYear, lastNumber: 1 },
                update: { lastNumber: { increment: 1 } },
            });

            const grnNo = `GRN-${yy}-${String(counter.lastNumber).padStart(4, '0')}`;

            // Create challan with nested items
            await tx.yarnInwardChallan.create({
                data: {
                    grnNo,
                    jobCardId: jobCard.id,
                    supplierId: dto.supplierId,
                    entryDate: dto.entryDate,
                    remarks: dto.remarks ?? null,
                    items: {
                        create: dto.items.map(item => ({
                            fabricItemId: item.fabricItemId,
                            supplierId: item.supplierId ?? null,
                            yarnName: item.yarnName,
                            color: item.color ?? null,
                            bags: item.bags,
                            cones: item.cones,
                            wtPerCone: item.wtPerCone,
                            netWeight: item.netWeight,
                            weightPerBag: item.weightPerBag,
                        }))
                    }
                },
            });

            return { status: 201, message: "Yarn inward challan saved successfully", grnNo };
        });
    }
}
