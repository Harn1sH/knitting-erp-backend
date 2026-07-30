import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateYarnReturnDto } from 'src/dto/yarnReturns/create-yarn-return.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class YarnReturnsService {
    constructor(private readonly prismaService: PrismaService) { }

    async getNextDcNumber() {
        const fullYear = new Date().getFullYear();
        const yy = String(fullYear).slice(-2);

        const counter = await this.prismaService.challanCounter.findUnique({
            where: { type_year: { type: 'YRN_RET', year: fullYear } },
        });

        const nextNumber = (counter?.lastNumber ?? 0) + 1;
        return { dcNumber: `YR-${yy}-${String(nextNumber).padStart(4, '0')}` };
    }

    async createYarnReturn(dto: CreateYarnReturnDto) {
        return this.prismaService.$transaction(
            async (tx) => {
                const jobCard = await tx.jobCard.findUnique({
                    where: { jobNumber: dto.jobCardId },
                });

                if (!jobCard) {
                    throw new BadRequestException('Job Card not found');
                }

                const fullYear = new Date().getFullYear();
                const yy = String(fullYear).slice(-2);

                const counter = await tx.challanCounter.upsert({
                    where: { type_year: { type: 'YRN_RET', year: fullYear } },
                    create: { type: 'YRN_RET', year: fullYear, lastNumber: 1 },
                    update: { lastNumber: { increment: 1 } },
                });

                const dcNumber = `YR-${yy}-${String(counter.lastNumber).padStart(4, '0')}`;

                await tx.yarnReturn.create({
                    data: {
                        dcNumber,
                        jobCardId: jobCard.id,
                        supplierId: dto.supplierId,
                        date: new Date(dto.date),
                        vehicleNumber: dto.vehicleNumber ?? null,
                        remarks: dto.remarks ?? null,
                        items: {
                            create: dto.items.map((item) => ({
                                fabricItemId: item.fabricItemId ?? null,
                                yarnName: item.yarnName,
                                bags: item.bags,
                                netWeight: item.netWeight,
                                weightPerBag: item.weightPerBag,
                            })),
                        },
                    },
                });

                return {
                    status: 201,
                    message: 'Yarn return saved successfully',
                    dcNumber,
                };
            },
            {
                maxWait: 10000,
                timeout: 20000,
            }
        );
    }
}
