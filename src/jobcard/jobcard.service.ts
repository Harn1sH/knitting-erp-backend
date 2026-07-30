// Architectural Decision: MERGED APPROACH
// Reasoning: The `getJobCard` method already fetches both `yarnInwardChallans` and `deliveryChallans`
// relationships to calculate total quantities. Making separate endpoints would cause redundant
// database queries and network requests. By mapping the already-fetched relations to the shapes
// expected by the frontend (`yarnInwardLogs` and `dispatchRecords`), we save 2 HTTP requests
// and 2 database queries per page load.
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateJobCardDto } from 'src/dto/jobcard/create-jobcard.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JobcardService {
    constructor(private readonly prisma: PrismaService) { }

    async createJobCard(jobCardData: CreateJobCardDto) {
        const fullYear = new Date().getFullYear(); // 2025
        const yy = String(fullYear).slice(-2);     // "25"

        const temp = await this.prisma.$transaction(async (tx) => {
            const counter = await tx.jobCardCounter.upsert({
                where: { year: fullYear },
                create: {
                    year: fullYear,
                    lastNumber: 1,
                },
                update: {
                    lastNumber: {
                        increment: 1,
                    },
                },
            });

            const jobNumber = `${yy}-${String(counter.lastNumber).padStart(4, "0")}`;

            return tx.jobCard.create({
                data: {
                    customerName: jobCardData.customerName,
                    status: 'IN_PROGRESS',
                    jobReceivedDate: jobCardData.jobReceivedDate,
                    remarks: jobCardData.remarks,
                    machine: jobCardData.machine,
                    brand: jobCardData.brand,
                    machineNote: jobCardData.machineNote,
                    jobNumber,
                    fabricItems: {
                        create: jobCardData.fabricItems.map(item => ({
                            gsm: item.gsm,
                            count: item.count.toString(),
                            composition: item.composition,
                            quality: item.quality,
                            mill: item.mill,
                            rate: item.rate,
                            orderQuantity: item.orderQuantity,
                            gg: item.gg,
                            ll: item.ll,
                        }))
                    }
                },
            });
        }, {
            maxWait: 5000, // 5 seconds max wait to connect, default 2
            timeout: 10000, // 10 seconds
        });
        console.log(temp);

        return { message: "Job Card Created Successfully" }
    }

    async getJobCard(jobNumber: string) {
        const jobCard = await this.prisma.jobCard.findUnique({
            where: {
                jobNumber: jobNumber
            },
            include: {
                yarnInwardChallans: {
                    include: {
                        supplier: true,
                        items: true
                    }
                },
                yarnReturns: {
                    include: {
                        supplier: true,
                        items: true
                    }
                },
                deliveryChallans: {
                    include: {
                        items: {
                            include: {
                                fabricItem: true
                            }
                        }
                    }
                },
                fabricItems: {
                    include: {
                        yarnInwardItems: {
                            include: {
                                challan: { include: { supplier: true } },
                                supplier: true
                            }
                        },
                        deliveryItems: {
                            include: {
                                challan: true
                            }
                        }
                    }
                }
            }
        })

        if (!jobCard) {
            throw new NotFoundException("No Job Card Found")
        }

        const client = await this.prisma.client.findFirst({
            where: { name: jobCard.customerName }
        });

        // Global totals from all challan items
        const totalYarnReceived = jobCard.yarnInwardChallans.reduce(
            (sum, challan) => sum + challan.items.reduce((s, item) => s + item.netWeight, 0), 0
        );
        const totalFabricDelivered = jobCard.deliveryChallans.reduce(
            (sum, challan) => sum + challan.items.reduce((s, item) => s + item.quantityKg, 0), 0
        );

        // Flatten yarn inward challan items into log rows
        const yarnInwardLogs = jobCard.yarnInwardChallans.flatMap(challan =>
            challan.items.map(item => ({
                date: new Date(challan.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                grnNo: challan.grnNo,
                partyDcNumber: challan.partyDcNumber ?? '—',
                vehicleNumber: challan.vehicleNumber ?? '',
                supplier: challan.supplier?.name || 'Unknown',
                type: item.yarnName,
                bags: item.bags,
                weight: `${item.netWeight.toFixed(2)} Kg`,
                netWeight: item.netWeight,
                status: 'Received',
                remarks: challan.remarks ?? '',
                isUnassigned: !item.fabricItemId,
                fabricItemId: item.fabricItemId,
                customFabricItem: item.customFabricItem || null,
                dia: item.dia
            }))
        );

        // Flatten yarn return items into return rows
        const yarnReturns = jobCard.yarnReturns.flatMap(challan =>
            challan.items.map(item => ({
                date: new Date(challan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                dcNo: challan.dcNumber,
                vehicleNumber: challan.vehicleNumber ?? '',
                supplier: challan.supplier?.name || 'Unknown',
                type: item.yarnName,
                bags: item.bags,
                weight: `${item.netWeight.toFixed(2)} Kg`,
                netWeight: item.netWeight,
                status: 'Returned',
                remarks: challan.remarks ?? '',
                fabricItemId: item.fabricItemId
            }))
        );

        // Flatten delivery challan items into dispatch rows
        let cumulativeDelivery = 0;
        const totalOrderQuantity = jobCard.fabricItems.reduce((sum, item) => sum + item.orderQuantity, 0);
        const dispatchRecords = jobCard.deliveryChallans.flatMap(challan =>
            challan.items.map(item => {
                cumulativeDelivery += item.quantityKg;
                const balance = totalOrderQuantity - cumulativeDelivery;
                return {
                    date: new Date(challan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    dcNo: challan.dcNo,
                    qty: `${item.quantityKg.toFixed(2)} Kg`,
                    balance: `${Math.max(0, balance).toFixed(2)} Kg`,
                    vehicle: challan.vehicle,
                    rolls: item.rolls,
                    status: 'Dispatched',
                    dia: item.dia || item.fabricItem?.dia,
                    fabricType: item.fabricType,
                    fabricName: item.fabricName || (item.fabricItem ? `${item.fabricItem.composition} / ${item.fabricItem.gsm} GSM` : 'Unknown')
                };
            })
        );

        // Per-fabric-item summaries
        const fabricItemSummaries = jobCard.fabricItems.map(item => {
            const totalYarnReceived = Math.round(
                item.yarnInwardItems.reduce((sum, y) => sum + y.netWeight, 0) * 1000
            ) / 1000;
            const totalFabricDelivered = Math.round(
                item.deliveryItems.reduce((sum, d) => sum + d.quantityKg, 0) * 1000
            ) / 1000;

            const yarnInwardLogs = item.yarnInwardItems.map(y => ({
                date: new Date(y.challan.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                grnNo: y.challan.grnNo,
                partyDcNumber: y.challan.partyDcNumber ?? '—',
                vehicleNumber: y.challan.vehicleNumber ?? '',
                supplier: y.challan.supplier?.name || 'Unknown',
                type: y.yarnName,
                bags: y.bags,
                weight: `${y.netWeight.toFixed(2)} Kg`,
                status: 'Received',
                remarks: y.challan.remarks ?? '',
                dia: y.dia
            }));

            let cumulative = 0;
            const dispatchRecords = item.deliveryItems.map(d => {
                cumulative += d.quantityKg;
                const balance = item.orderQuantity - cumulative;
                return {
                    date: new Date(d.challan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    dcNo: d.challan.dcNo,
                    qty: `${d.quantityKg.toFixed(2)} Kg`,
                    balance: `${Math.max(0, balance).toFixed(2)} Kg`,
                    vehicle: d.challan.vehicle,
                    rolls: d.rolls,
                    status: 'Dispatched',
                    dia: d.dia || item.dia,
                    fabricType: d.fabricType,
                    fabricName: d.fabricName || `${item.composition} / ${item.gsm} GSM`
                };
            });

            // Derive last-used supplier for this fabric item (from the most recent yarn inward)
            const lastYarnInward = item.yarnInwardItems.length > 0
                ? item.yarnInwardItems[item.yarnInwardItems.length - 1]
                : null;
            const lastSupplierId = lastYarnInward?.supplierId ?? lastYarnInward?.challan?.supplierId ?? null;
            const lastSupplierName = lastYarnInward?.supplier?.name ?? lastYarnInward?.challan?.supplier?.name ?? null;

            return {
                id: item.id,
                gsm: item.gsm,
                dia: item.dia,
                count: item.count,
                composition: item.composition,
                quality: item.quality,
                mill: item.mill,
                gg: item.gg,
                ll: item.ll,
                orderQuantity: item.orderQuantity,
                rate: item.rate,
                totalYarnReceived,
                totalFabricDelivered,
                remainingDelivery: Math.round(Math.max(0, item.orderQuantity - totalFabricDelivered) * 1000) / 1000,
                deliveryPercent: Math.round(Math.min(100, item.orderQuantity ? (totalFabricDelivered / item.orderQuantity) * 100 : 0) * 10) / 10,
                lastSupplierId,
                lastSupplierName,
                yarnInwardLogs,
                dispatchRecords
            };
        });

        return {
            ...jobCard,
            totalYarnReceived,
            totalFabricDelivered,
            yarnInwardLogs,
            yarnReturns,
            dispatchRecords,
            fabricItemSummaries,
            fabricItems: jobCard.fabricItems,
            clientAddress: client?.address || '',
            clientGstNumber: client?.gstNumber || ''
        };
    }

    async generateInvoice(jobNumber: string, rates: any) {
        const fullYear = new Date().getFullYear();

        const jobCard = await this.prisma.jobCard.findUnique({
            where: { jobNumber },
        });

        if (!jobCard) {
            throw new NotFoundException("No Job Card Found");
        }

        let newInvoiceNumber = jobCard.invoiceNumber;
        let invoiceDate = jobCard.invoiceDate;

        if (!newInvoiceNumber) {
            const counter = await this.prisma.invoiceCounter.upsert({
                where: { year: fullYear },
                create: {
                    year: fullYear,
                    lastNumber: 1,
                },
                update: {
                    lastNumber: {
                        increment: 1,
                    },
                },
            });

            newInvoiceNumber = String(counter.lastNumber).padStart(3, "0");
            invoiceDate = new Date();
        }

        const updatedJobCard = await this.prisma.jobCard.update({
            where: { jobNumber },
            data: {
                invoiceNumber: newInvoiceNumber,
                invoiceDate: invoiceDate,
                invoiceRates: rates,
            },
        });

        const client = await this.prisma.client.findFirst({
            where: { name: jobCard.customerName }
        });

        return {
            invoiceNumber: updatedJobCard.invoiceNumber,
            invoiceDate: updatedJobCard.invoiceDate,
            invoiceRates: updatedJobCard.invoiceRates,
            clientAddress: client?.address || '',
            clientGstNumber: client?.gstNumber || '',
        };
    }

    async getAllJobCards(jobNumber?: string, page: number = 1, limit: number = 10) {
        const where: Prisma.JobCardWhereInput = {};

        if (jobNumber) {
            where.jobNumber = { contains: jobNumber, mode: 'insensitive' };
        }

        const skip = (page - 1) * limit;

        const [jobCards, total] = await Promise.all([
            this.prisma.jobCard.findMany({ 
                where,
                include: {
                    fabricItems: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit,
            }),
            this.prisma.jobCard.count({ where })
        ]);

        const data = jobCards.map(job => {
            return {
                ...job,
                gsm: job.fabricItems.map(f => f.gsm).filter(Boolean).join(', '),
                orderQuantity: job.fabricItems.reduce((acc, f) => acc + (f.orderQuantity || 0), 0),
                dia: job.fabricItems.map(f => f.dia).filter(Boolean).join(', '),
                composition: job.fabricItems.map(f => f.composition).filter(Boolean).join(', '),
                count: job.fabricItems.map(f => f.count).filter(Boolean).join(', '),
                rate: job.fabricItems.reduce((acc, f) => acc + (f.rate || 0), 0),
                machine: job.machine && job.brand ? `${job.machine} (${job.brand})` : (job.machine || job.brand || ''),
            };
        });

        return {
            data,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit)
            }
        };
    }

    async getAllActiveJobCardNames() {

        const result = await this.prisma.$queryRaw<
            { value: string }[]
        >`SELECT "jobNumber" || ' ' || "customerName" AS value
            FROM "JobCard"`;

        return result;
    }
}
