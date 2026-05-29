import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDeliveryDto } from 'src/dto/delivery/create-delivery.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DeliveryService {
    constructor(private readonly prismaService: PrismaService) {}

    async createDelivery(deliveryData: CreateDeliveryDto) {
        return this.prismaService.$transaction(async (tx) => {
            const jobCard = await tx.jobCard.findUnique({
                where: { jobNumber: deliveryData.jobCardId },
                include: { fabricItems: true }
            });

            if (!jobCard) {
                throw new Error('Job Card not found');
            }

            const deliveryAgg = await tx.delivery.aggregate({
                _sum: { quantityKg: true },
                where: { jobCardId: jobCard.id }
            });
            const alreadyDelivered = deliveryAgg._sum.quantityKg || 0;
            const totalOrderQuantity = jobCard.fabricItems.reduce((sum, item) => sum + item.orderQuantity, 0);
            const remaining = totalOrderQuantity - alreadyDelivered;
            const newQuantity = deliveryData.quantityKg;

            if (newQuantity > remaining) {
                throw new BadRequestException(`Cannot dispatch ${newQuantity} kg. Only ${remaining} kg remaining out of ${totalOrderQuantity} kg total.`);
            }

            await tx.delivery.create({
                data: {
                    jobCardId: jobCard.id,
                    quantityKg: deliveryData.quantityKg,
                    dcNo: deliveryData.dcNo,
                    vehicle: deliveryData.vehicle,
                    date: deliveryData.date,
                    numberOfRolls: deliveryData.numberOfRolls,
                    weightPerRoll: deliveryData.weightPerRoll,
                    companyName: deliveryData.companyName,
                    fabricName: deliveryData.fabricName,
                },
            });

            return { status: 201, message: "Saved delivery successfully" };
        });
    }
}
