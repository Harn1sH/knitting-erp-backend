import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateYarnInwardChallanDto } from 'src/dto/yarnInwards/create-yarn-inward-challan.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class YarnInwardsService {
    constructor(private readonly prismaService: PrismaService) { }

    async getNextGrnNumber() {
        const fullYear = new Date().getFullYear();
        const yy = String(fullYear).slice(-2);

        const counter = await this.prismaService.challanCounter.findUnique({
            where: { type_year: { type: 'GRN', year: fullYear } },
        });

        const nextNumber = (counter?.lastNumber ?? 0) + 1;
        return { grnNo: `GRN-${yy}-${String(nextNumber).padStart(4, '0')}` };
    }

    async createYarnInwardChallan(dto: CreateYarnInwardChallanDto) {
        return this.prismaService.$transaction(
            async (tx) => {
                const jobCard = await tx.jobCard.findUnique({
                    where: { jobNumber: dto.jobCardId },
                    include: { fabricItems: true },
                });

                if (!jobCard) {
                    throw new BadRequestException('Job Card not found');
                }

                const fabricItemIds = [...new Set(dto.items.map((i) => i.fabricItemId))];

                const receivedTotals = await tx.yarnInwardItem.groupBy({
                    by: ['fabricItemId'],
                    where: {
                        fabricItemId: { in: fabricItemIds },
                        challan: { jobCardId: jobCard.id },
                    },
                    _sum: {
                        netWeight: true,
                    },
                });

                const receivedMap = new Map<string, number>(
                    receivedTotals.map((row) => [row.fabricItemId, row._sum.netWeight ?? 0]),
                );

                const accumulatedYarn = new Map<string, number>();

                for (const item of dto.items) {
                    const fabricItem = jobCard.fabricItems.find(
                        (f) => f.id === item.fabricItemId,
                    );

                    if (!fabricItem) {
                        throw new BadRequestException(
                            `Fabric Item ${item.fabricItemId} not found in this Job Card`,
                        );
                    }

                    const alreadyReceived = receivedMap.get(item.fabricItemId) ?? 0;
                    const accumulated = accumulatedYarn.get(item.fabricItemId) ?? 0;
                    const remaining =
                        fabricItem.totalYarnNeeded - alreadyReceived - accumulated;

                    if (item.netWeight > remaining) {
                        throw new BadRequestException(
                            `Cannot receive ${item.netWeight} kg for fabric "${fabricItem.composition} / ${fabricItem.gsm} GSM". Only ${remaining.toFixed(
                                2,
                            )} kg remaining.`,
                        );
                    }

                    accumulatedYarn.set(
                        item.fabricItemId,
                        accumulated + item.netWeight,
                    );
                }

                const fullYear = new Date().getFullYear();
                const yy = String(fullYear).slice(-2);

                const counter = await tx.challanCounter.upsert({
                    where: { type_year: { type: 'GRN', year: fullYear } },
                    create: { type: 'GRN', year: fullYear, lastNumber: 1 },
                    update: { lastNumber: { increment: 1 } },
                });

                const grnNo = `GRN-${yy}-${String(counter.lastNumber).padStart(4, '0')}`;

                await tx.yarnInwardChallan.create({
                    data: {
                        grnNo,
                        jobCardId: jobCard.id,
                        supplierId: dto.supplierId,
                        partyDcNumber: dto.partyDcNumber ?? null,
                        vehicleNumber: dto.vehicleNumber ?? null,
                        entryDate: dto.entryDate,
                        remarks: dto.remarks ?? null,
                        items: {
                            create: dto.items.map((item) => ({
                                fabricItemId: item.fabricItemId,
                                supplierId: item.supplierId ?? null,
                                yarnName: item.yarnName,
                                color: item.color ?? null,
                                bags: item.bags,
                                cones: item.cones,
                                wtPerCone: item.wtPerCone,
                                netWeight: item.netWeight,
                                weightPerBag: item.weightPerBag,
                            })),
                        },
                    },
                });

                return {
                    status: 201,
                    message: 'Yarn inward challan saved successfully',
                    grnNo,
                };
            },
            {
                maxWait: 10000,
                timeout: 20000,
            },
        );
    }
}