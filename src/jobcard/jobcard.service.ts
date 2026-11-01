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
                    dia: jobCardData.dia || null,
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
                            fabricType: item.fabricType || null,
                            fabricConstruction: item.fabricConstruction || null,
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

    async getJobCard(jobNumber: string, tab?: string) {
        if (tab === 'core') {
            return this.getJobCardCore(jobNumber);
        }
        if (tab === 'yarn') {
            return this.getYarnLogs(jobNumber);
        }
        if (tab === 'dispatch') {
            return this.getDispatchRecords(jobNumber);
        }
        if (tab === 'yarnReturn') {
            return this.getYarnReturns(jobNumber);
        }

        return this.getFullJobCard(jobNumber);
    }

    async getJobCardCore(jobNumber: string) {
        const jobCardData = await this.prisma.jobCard.findUnique({
            where: { jobNumber },
            include: { invoices: true, fabricItems: true }
        });

        if (!jobCardData) {
            throw new NotFoundException("No Job Card Found");
        }

        const [client, yarnSum, deliverySum, stockOutSum, productionSum] = await Promise.all([
            this.prisma.client.findFirst({
                where: { name: jobCardData.customerName }
            }),
            this.prisma.yarnInwardItem.aggregate({
                where: { challan: { jobCardId: jobCardData.id } },
                _sum: { netWeight: true }
            }),
            this.prisma.deliveryItem.aggregate({
                where: { challan: { jobCardId: jobCardData.id } },
                _sum: { quantityKg: true }
            }),
            this.prisma.yarnStockLedger.aggregate({
                where: { targetJobCardId: jobCardData.id, type: 'OUT' },
                _sum: { netWeight: true }
            }),
            this.prisma.productionLog.aggregate({
                where: { jobCardId: jobCardData.id },
                _sum: { weight: true }
            })
        ]);

        const totalYarnReceived = (yarnSum._sum.netWeight || 0) + (stockOutSum._sum.netWeight || 0);
        const totalFabricDelivered = deliverySum._sum.quantityKg || 0;
        const totalProductionWeight = productionSum._sum.weight || 0;

        const fabricItemSummaries = jobCardData.fabricItems.map(item => ({
            id: item.id,
            gsm: item.gsm,
            count: item.count,
            composition: item.composition,
            quality: item.quality,
            mill: item.mill,
            dia: jobCardData.dia,
            gg: item.gg,
            ll: item.ll,
            fabricType: item.fabricType,
            fabricConstruction: item.fabricConstruction,
            orderQuantity: item.orderQuantity,
            rate: item.rate,
            totalYarnReceived: 0,
            totalFabricDelivered: 0,
            remainingDelivery: item.orderQuantity,
            deliveryPercent: 0,
            lastSupplierId: null,
            lastSupplierName: null,
            yarnInwardLogs: [],
            dispatchRecords: []
        }));

        const invoice = jobCardData.invoices.length > 0 ? jobCardData.invoices[jobCardData.invoices.length - 1] : null;
        let finalInvoiceNumber = invoice?.invoiceNumber || null;
        let finalInvoiceDate = invoice?.date || null;
        if (jobCardData.invoices?.length > 0) {
            finalInvoiceNumber = jobCardData.invoices.map((inv: any) => inv.invoiceNumber).join(', ');
            finalInvoiceDate = jobCardData.invoices[0].date;
        }
        const finalRates = invoice?.rates || {};

        return {
            ...jobCardData,
            totalYarnReceived,
            totalFabricDelivered,
            totalProductionWeight,
            yarnInwardLogs: [],
            yarnReturns: [],
            dispatchRecords: [],
            fabricItems: jobCardData.fabricItems.map(f => ({ ...f, dia: jobCardData.dia })),
            fabricItemSummaries,
            clientAddress: client?.address || '',
            clientGstNumber: client?.gstNumber || '',
            invoiceNumber: finalInvoiceNumber,
            invoiceDate: finalInvoiceDate,
            invoiceRates: finalRates as any
        };
    }

    async getYarnLogs(jobNumber: string) {
        const jobCard = await this.prisma.jobCard.findUnique({
            where: { jobNumber },
            select: { id: true, dia: true, fabricItems: true }
        });

        if (!jobCard) {
            throw new NotFoundException("No Job Card Found");
        }

        const [yarnInwardChallans, stockTransfersIn, stockTransfersOut] = await Promise.all([
            this.prisma.yarnInwardChallan.findMany({
                where: { jobCardId: jobCard.id },
                include: { supplier: true, items: true }
            }),
            this.prisma.yarnStockLedger.findMany({
                where: { sourceJobCardId: jobCard.id, type: 'IN' }
            }),
            this.prisma.yarnStockLedger.findMany({
                where: { targetJobCardId: jobCard.id, type: 'OUT' },
                include: {
                    linkedChallan: { include: { supplier: true } }
                }
            })
        ]);

        const yarnItemsByFabric = new Map<string, any[]>();
        for (const challan of yarnInwardChallans) {
            for (const item of challan.items) {
                if (item.fabricItemId) {
                    const arr = yarnItemsByFabric.get(item.fabricItemId) || [];
                    arr.push({ ...item, challan });
                    yarnItemsByFabric.set(item.fabricItemId, arr);
                }
            }
        }

        const totalYarnReceived = yarnInwardChallans.reduce(
            (sum: number, challan: any) => sum + challan.items.reduce((s: number, item: any) => s + item.netWeight, 0), 0
        );

        const yarnInwardLogs: any[] = yarnInwardChallans.flatMap((challan: any) =>
            challan.items.map((item: any) => {
                const stockTransfersForThisItem = stockTransfersIn.filter((st: any) => 
                    st.linkedChallanId === challan.id && 
                    (st.yarnName || null) === (item.yarnName || null) && 
                    (st.color || null) === (item.color || null) && 
                    (st.dia || null) === (item.dia || null)
                );
                const transferredWeight = stockTransfersForThisItem.reduce((sum, st: any) => sum + st.netWeight, 0);
                const transferredBags = stockTransfersForThisItem.reduce((sum, st: any) => sum + st.bags, 0);

                return {
                    id: item.id,
                    challanId: challan.id,
                    date: new Date(challan.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    grnNo: challan.grnNo,
                    partyDcNumber: challan.partyDcNumber ?? '—',
                    vehicleNumber: challan.vehicleNumber ?? '',
                    supplier: challan.supplier?.name || 'Unknown',
                    type: item.yarnName || item.customFabricItem || 'Fabric Item',
                    color: item.color,
                    bags: item.bags,
                    weight: item.netWeight,
                    netWeight: item.netWeight,
                    weightPerBag: item.weightPerBag || (item.bags > 0 ? item.netWeight / item.bags : 0),
                    transferredWeight,
                    transferredBags,
                    availableWeight: item.netWeight - transferredWeight,
                    status: 'Received',
                    remarks: challan.remarks ?? '',
                    isUnassigned: !item.fabricItemId,
                    fabricItemId: item.fabricItemId,
                    customFabricItem: item.customFabricItem || null,
                    dia: item.dia,
                    isFromStock: false
                };
            })
        );

        const stockLogs = stockTransfersOut.map((st: any) => ({
            id: st.id,
            date: new Date(st.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            grnNo: st.linkedChallan?.grnNo || 'Stock Transfer',
            partyDcNumber: st.linkedChallan?.partyDcNumber ?? '—',
            vehicleNumber: st.linkedChallan?.vehicleNumber ?? '',
            supplier: st.linkedChallan?.supplier?.name || 'Stock',
            type: st.yarnName,
            color: st.color,
            bags: st.bags,
            weight: st.netWeight,
            netWeight: st.netWeight,
            weightPerBag: st.weightPerBag || (st.bags > 0 ? st.netWeight / st.bags : 0),
            transferredWeight: 0,
            transferredBags: 0,
            availableWeight: st.netWeight,
            status: 'Received',
            remarks: st.remarks ?? '',
            isUnassigned: true,
            fabricItemId: null,
            customFabricItem: null,
            dia: st.dia,
            isFromStock: true
        }));

        yarnInwardLogs.push(...stockLogs);
        const totalYarnReceivedFinal = totalYarnReceived + stockLogs.reduce((sum, st) => sum + st.netWeight, 0);

        const fabricItemSummaries = jobCard.fabricItems.map(item => {
            const yarnItems = yarnItemsByFabric.get(item.id) || [];
            const totalItemYarnReceived = Math.round(
                yarnItems.reduce((sum, y) => sum + y.netWeight, 0) * 1000
            ) / 1000;

            const innerLogs = yarnItems.map(y => ({
                date: new Date(y.challan.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                grnNo: y.challan.grnNo,
                partyDcNumber: y.challan.partyDcNumber ?? '—',
                vehicleNumber: y.challan.vehicleNumber ?? '',
                supplier: y.challan.supplier?.name || 'Unknown',
                type: y.yarnName || y.customFabricItem || 'Fabric Item',
                bags: y.bags,
                weight: y.netWeight,
                status: 'Received',
                remarks: y.challan.remarks ?? '',
                dia: y.dia
            }));

            const lastYarnInward = yarnItems.length > 0 ? yarnItems[yarnItems.length - 1] : null;
            const lastSupplierId = lastYarnInward?.challan?.supplierId ?? null;
            const lastSupplierName = lastYarnInward?.challan?.supplier?.name ?? null;

            return {
                id: item.id,
                dia: jobCard.dia,
                totalYarnReceived: totalItemYarnReceived,
                lastSupplierId,
                lastSupplierName,
                yarnInwardLogs: innerLogs
            };
        });

        return {
            yarnInwardLogs,
            totalYarnReceived: totalYarnReceivedFinal,
            fabricItemSummaries
        };
    }

    async getDispatchRecords(jobNumber: string) {
        const jobCard = await this.prisma.jobCard.findUnique({
            where: { jobNumber },
            select: { id: true, dia: true, fabricItems: true }
        });

        if (!jobCard) {
            throw new NotFoundException("No Job Card Found");
        }

        const [deliveryChallans, productionAgg] = await Promise.all([
            this.prisma.deliveryChallan.findMany({
                where: { jobCardId: jobCard.id },
                include: { items: true }
            }),
            this.prisma.productionLog.aggregate({
                where: { jobCardId: jobCard.id },
                _sum: { weight: true }
            })
        ]);
        const totalProductionWeight = productionAgg._sum.weight || 0;

        const deliveryItemsByFabric = new Map<string, any[]>();
        for (const challan of deliveryChallans) {
            for (const item of challan.items) {
                if (item.fabricItemId) {
                    const arr = deliveryItemsByFabric.get(item.fabricItemId) || [];
                    arr.push({ ...item, challan });
                    deliveryItemsByFabric.set(item.fabricItemId, arr);
                }
            }
        }

        const totalFabricDelivered = deliveryChallans.reduce(
            (sum: number, challan: any) => sum + challan.items.reduce((s: number, item: any) => s + item.quantityKg, 0), 0
        );

        let cumulativeDelivery = 0;
        const totalOrderQuantity = jobCard.fabricItems.reduce((sum: number, item: any) => sum + (item.orderQuantity || 0), 0);
        const fabricItemsMap = new Map(jobCard.fabricItems.map((f: any) => [f.id, f]));

        const dispatchRecords = deliveryChallans.flatMap((challan: any) =>
            challan.items.map((item: any) => {
                cumulativeDelivery += item.quantityKg;
                const balance = totalOrderQuantity - cumulativeDelivery;
                const relatedFabricItem = (item.fabricItemId ? fabricItemsMap.get(item.fabricItemId) : null) as any;
                
                return {
                    id: challan.id,
                    invoiceId: challan.invoiceId,
                    date: new Date(challan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    dcNo: challan.dcNo,
                    partyDcNo: challan.partyDcNo ?? '',
                    qty: `${item.quantityKg.toFixed(2)} Kg`,
                    balance: `${Math.max(0, balance).toFixed(2)} Kg`,
                    vehicle: challan.vehicle,
                    rolls: item.rolls,
                    status: 'Dispatched',
                    dia: item.dia || jobCard.dia || null,
                    gg: item.gg,
                    ll: item.ll,
                    fabricType: item.fabricType,
                    fabricConstruction: relatedFabricItem?.fabricConstruction ?? null,
                    fabricName: item.fabricName || (relatedFabricItem ? `${relatedFabricItem.composition} / ${relatedFabricItem.gsm} GSM` : 'Unknown')
                };
            })
        );

        const fabricItemSummaries = jobCard.fabricItems.map(item => {
            const deliveryItems = deliveryItemsByFabric.get(item.id) || [];
            const totalItemFabricDelivered = Math.round(
                deliveryItems.reduce((sum, d) => sum + d.quantityKg, 0) * 1000
            ) / 1000;

            let cumulative = 0;
            const records = deliveryItems.map(d => {
                cumulative += d.quantityKg;
                const balance = item.orderQuantity - cumulative;
                return {
                    id: d.challan.id,
                    invoiceId: d.challan.invoiceId,
                    date: new Date(d.challan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    dcNo: d.challan.dcNo,
                    partyDcNo: d.challan.partyDcNo ?? '',
                    qty: `${d.quantityKg.toFixed(2)} Kg`,
                    balance: `${Math.max(0, balance).toFixed(2)} Kg`,
                    vehicle: d.challan.vehicle,
                    rolls: d.rolls,
                    status: 'Dispatched',
                    dia: d.dia ?? jobCard.dia ?? null,
                    gg: d.gg,
                    ll: d.ll,
                    fabricType: d.fabricType,
                    fabricConstruction: item.fabricConstruction ?? null,
                    fabricName: d.fabricName || `${item.composition} / ${item.gsm} GSM`
                };
            });

            return {
                id: item.id,
                dia: jobCard.dia,
                totalFabricDelivered: totalItemFabricDelivered,
                remainingDelivery: Math.round(Math.max(0, item.orderQuantity - totalItemFabricDelivered) * 1000) / 1000,
                deliveryPercent: Math.round(Math.min(100, item.orderQuantity ? (totalItemFabricDelivered / item.orderQuantity) * 100 : 0) * 10) / 10,
                dispatchRecords: records
            };
        });

        return {
            dispatchRecords,
            totalFabricDelivered,
            totalProductionWeight,
            fabricItemSummaries
        };
    }

    async getYarnReturns(jobNumber: string) {
        const jobCard = await this.prisma.jobCard.findUnique({
            where: { jobNumber },
            select: { id: true }
        });

        if (!jobCard) {
            throw new NotFoundException("No Job Card Found");
        }

        const [yarnReturnsData, yarnInwardChallans] = await Promise.all([
            this.prisma.yarnReturn.findMany({
                where: { jobCardId: jobCard.id },
                include: { supplier: true, items: true }
            }),
            this.prisma.yarnInwardChallan.findMany({
                where: { jobCardId: jobCard.id },
                include: { supplier: true, items: true },
                orderBy: { entryDate: 'asc' }
            })
        ]);

        const yarnReturns = yarnReturnsData.flatMap((challan: any) =>
            challan.items.map((item: any) => ({
                date: new Date(challan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                dcNo: challan.dcNumber,
                partyDcNumber: challan.partyDcNumber ?? '—',
                vehicleNumber: challan.vehicleNumber ?? '',
                supplier: challan.supplier?.name || 'Unknown',
                type: item.yarnName,
                bags: item.bags,
                weight: item.netWeight,
                netWeight: item.netWeight,
                status: 'Returned',
                remarks: challan.remarks ?? '',
                fabricItemId: item.fabricItemId
            }))
        );

        const yarnInwardLogs = yarnInwardChallans.flatMap((challan: any) =>
            challan.items.map((item: any) => ({
                id: item.id,
                challanId: challan.id,
                date: new Date(challan.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                grnNo: challan.grnNo,
                partyDcNumber: challan.partyDcNumber ?? '—',
                vehicleNumber: challan.vehicleNumber ?? '',
                supplier: challan.supplier?.name || 'Unknown',
                supplierId: challan.supplierId,
                type: item.yarnName || item.customFabricItem || 'Fabric Item',
                bags: item.bags,
                weight: item.netWeight,
                netWeight: item.netWeight,
                status: 'Received',
                remarks: challan.remarks ?? '',
                fabricItemId: item.fabricItemId,
                customFabricItem: item.customFabricItem || null,
                dia: item.dia
            }))
        );

        return { yarnReturns, yarnInwardLogs };
    }

    async getFullJobCard(jobNumber: string) {
        const jobCardData = await this.prisma.jobCard.findUnique({
            where: { jobNumber },
            include: { invoices: true, fabricItems: true }
        });

        if (!jobCardData) {
            throw new NotFoundException("No Job Card Found");
        }

        const jobId = jobCardData.id;

        const [client, yarnInwardChallans, yarnReturnsData, deliveryChallans, stockTransfersIn, stockTransfersOut, productionSum] = await Promise.all([
            this.prisma.client.findFirst({
                where: { name: jobCardData.customerName }
            }),
            this.prisma.yarnInwardChallan.findMany({
                where: { jobCardId: jobId },
                include: { supplier: true, items: true }
            }),
            this.prisma.yarnReturn.findMany({
                where: { jobCardId: jobId },
                include: { supplier: true, items: true }
            }),
            this.prisma.deliveryChallan.findMany({
                where: { jobCardId: jobId },
                include: { items: true }
            }),
            this.prisma.yarnStockLedger.findMany({
                where: { sourceJobCardId: jobId, type: 'IN' }
            }),
            this.prisma.yarnStockLedger.findMany({
                where: { targetJobCardId: jobId, type: 'OUT' },
                include: {
                    linkedChallan: { include: { supplier: true } }
                }
            }),
            this.prisma.productionLog.aggregate({
                where: { jobCardId: jobId },
                _sum: { weight: true }
            })
        ]);
        const totalProductionWeight = productionSum._sum.weight || 0;

        const yarnItemsByFabric = new Map<string, any[]>();
        const deliveryItemsByFabric = new Map<string, any[]>();

        for (const challan of yarnInwardChallans) {
            for (const item of challan.items) {
                if (item.fabricItemId) {
                    const arr = yarnItemsByFabric.get(item.fabricItemId) || [];
                    arr.push({ ...item, challan });
                    yarnItemsByFabric.set(item.fabricItemId, arr);
                }
            }
        }

        for (const challan of deliveryChallans) {
            for (const item of challan.items) {
                if (item.fabricItemId) {
                    const arr = deliveryItemsByFabric.get(item.fabricItemId) || [];
                    arr.push({ ...item, challan });
                    deliveryItemsByFabric.set(item.fabricItemId, arr);
                }
            }
        }

        const totalYarnReceived = yarnInwardChallans.reduce(
            (sum: number, challan: any) => sum + challan.items.reduce((s: number, item: any) => s + item.netWeight, 0), 0
        );
        const totalFabricDelivered = deliveryChallans.reduce(
            (sum: number, challan: any) => sum + challan.items.reduce((s: number, item: any) => s + item.quantityKg, 0), 0
        );

        const yarnInwardLogs: any[] = yarnInwardChallans.flatMap((challan: any) =>
            challan.items.map((item: any) => {
                const stockTransfersForThisItem = stockTransfersIn.filter((st: any) => 
                    st.linkedChallanId === challan.id && 
                    (st.yarnName || null) === (item.yarnName || null) && 
                    (st.color || null) === (item.color || null) && 
                    (st.dia || null) === (item.dia || null)
                );
                const transferredWeight = stockTransfersForThisItem.reduce((sum, st: any) => sum + st.netWeight, 0);
                const transferredBags = stockTransfersForThisItem.reduce((sum, st: any) => sum + st.bags, 0);

                return {
                    id: item.id,
                    challanId: challan.id,
                    date: new Date(challan.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    grnNo: challan.grnNo,
                    partyDcNumber: challan.partyDcNumber ?? '—',
                    vehicleNumber: challan.vehicleNumber ?? '',
                    supplier: challan.supplier?.name || 'Unknown',
                    type: item.yarnName || item.customFabricItem || 'Fabric Item',
                    color: item.color,
                    bags: item.bags,
                    weight: item.netWeight,
                    netWeight: item.netWeight,
                    weightPerBag: item.weightPerBag || (item.bags > 0 ? item.netWeight / item.bags : 0),
                    transferredWeight,
                    transferredBags,
                    availableWeight: item.netWeight - transferredWeight,
                    status: 'Received',
                    remarks: challan.remarks ?? '',
                    isUnassigned: !item.fabricItemId,
                    fabricItemId: item.fabricItemId,
                    customFabricItem: item.customFabricItem || null,
                    dia: item.dia,
                    isFromStock: false
                };
            })
        );

        const stockLogs = stockTransfersOut.map((st: any) => ({
            id: st.id,
            date: new Date(st.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            grnNo: st.linkedChallan?.grnNo || 'Stock Transfer',
            partyDcNumber: st.linkedChallan?.partyDcNumber ?? '—',
            vehicleNumber: st.linkedChallan?.vehicleNumber ?? '',
            supplier: st.linkedChallan?.supplier?.name || 'Stock',
            type: st.yarnName,
            color: st.color,
            bags: st.bags,
            weight: st.netWeight,
            netWeight: st.netWeight,
            weightPerBag: st.weightPerBag || (st.bags > 0 ? st.netWeight / st.bags : 0),
            transferredWeight: 0,
            transferredBags: 0,
            availableWeight: st.netWeight,
            status: 'Received',
            remarks: st.remarks ?? '',
            isUnassigned: true,
            fabricItemId: null,
            customFabricItem: null,
            dia: st.dia,
            isFromStock: true
        }));

        yarnInwardLogs.push(...stockLogs);
        const totalYarnReceivedFinal = totalYarnReceived + stockLogs.reduce((sum, st) => sum + st.netWeight, 0);

        const yarnReturns = yarnReturnsData.flatMap((challan: any) =>
            challan.items.map((item: any) => ({
                date: new Date(challan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                dcNo: challan.dcNumber,
                partyDcNumber: challan.partyDcNumber ?? '—',
                vehicleNumber: challan.vehicleNumber ?? '',
                supplier: challan.supplier?.name || 'Unknown',
                type: item.yarnName,
                bags: item.bags,
                weight: item.netWeight,
                netWeight: item.netWeight,
                status: 'Returned',
                remarks: challan.remarks ?? '',
                fabricItemId: item.fabricItemId
            }))
        );

        let cumulativeDelivery = 0;
        const totalOrderQuantity = jobCardData.fabricItems.reduce((sum: number, item: any) => sum + (item.orderQuantity || 0), 0);
        const fabricItemsMap = new Map(jobCardData.fabricItems.map((f: any) => [f.id, f]));

        const dispatchRecords = deliveryChallans.flatMap((challan: any) =>
            challan.items.map((item: any) => {
                cumulativeDelivery += item.quantityKg;
                const balance = totalOrderQuantity - cumulativeDelivery;
                const relatedFabricItem = (item.fabricItemId ? fabricItemsMap.get(item.fabricItemId) : null) as any;
                
                return {
                    id: challan.id,
                    invoiceId: challan.invoiceId,
                    date: new Date(challan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    dcNo: challan.dcNo,
                    partyDcNo: challan.partyDcNo ?? '',
                    qty: `${item.quantityKg.toFixed(2)} Kg`,
                    balance: `${Math.max(0, balance).toFixed(2)} Kg`,
                    vehicle: challan.vehicle,
                    rolls: item.rolls,
                    status: 'Dispatched',
                    dia: item.dia,
                    gg: item.gg,
                    ll: item.ll,
                    fabricType: item.fabricType,
                    fabricConstruction: relatedFabricItem?.fabricConstruction ?? null,
                    fabricName: item.fabricName || (relatedFabricItem ? `${relatedFabricItem.composition} / ${relatedFabricItem.gsm} GSM` : 'Unknown')
                };
            })
        );

        const fabricItemSummaries = jobCardData.fabricItems.map(item => {
            const yarnItems = yarnItemsByFabric.get(item.id) || [];
            const deliveryItems = deliveryItemsByFabric.get(item.id) || [];

            const totalItemYarnReceived = Math.round(
                yarnItems.reduce((sum, y) => sum + y.netWeight, 0) * 1000
            ) / 1000;
            const totalItemFabricDelivered = Math.round(
                deliveryItems.reduce((sum, d) => sum + d.quantityKg, 0) * 1000
            ) / 1000;

            const innerLogs = yarnItems.map(y => ({
                date: new Date(y.challan.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                grnNo: y.challan.grnNo,
                partyDcNumber: y.challan.partyDcNumber ?? '—',
                vehicleNumber: y.challan.vehicleNumber ?? '',
                supplier: y.challan.supplier?.name || 'Unknown',
                type: y.yarnName || y.customFabricItem || 'Fabric Item',
                bags: y.bags,
                weight: y.netWeight,
                status: 'Received',
                remarks: y.challan.remarks ?? '',
                dia: y.dia
            }));

            let cumulative = 0;
            const innerDispatchRecords = deliveryItems.map(d => {
                cumulative += d.quantityKg;
                const balance = item.orderQuantity - cumulative;
                return {
                    id: d.challan.id,
                    invoiceId: d.challan.invoiceId,
                    date: new Date(d.challan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    dcNo: d.challan.dcNo,
                    partyDcNo: d.challan.partyDcNo ?? '',
                    qty: `${d.quantityKg.toFixed(2)} Kg`,
                    balance: `${Math.max(0, balance).toFixed(2)} Kg`,
                    vehicle: d.challan.vehicle,
                    rolls: d.rolls,
                    status: 'Dispatched',
                    dia: d.dia ?? jobCardData.dia ?? null,
                    gg: d.gg,
                    ll: d.ll,
                    fabricType: d.fabricType,
                    fabricConstruction: item.fabricConstruction ?? null,
                    fabricName: d.fabricName || `${item.composition} / ${item.gsm} GSM`
                };
            });

            const lastYarnInward = yarnItems.length > 0 ? yarnItems[yarnItems.length - 1] : null;
            const lastSupplierId = lastYarnInward?.challan?.supplierId ?? null;
            const lastSupplierName = lastYarnInward?.challan?.supplier?.name ?? null;

            return {
                id: item.id,
                gsm: item.gsm,
                count: item.count,
                composition: item.composition,
                quality: item.quality,
                mill: item.mill,
                dia: jobCardData.dia,
                gg: item.gg,
                ll: item.ll,
                fabricType: item.fabricType,
                fabricConstruction: item.fabricConstruction,
                orderQuantity: item.orderQuantity,
                rate: item.rate,
                totalYarnReceived: totalItemYarnReceived,
                totalFabricDelivered: totalItemFabricDelivered,
                remainingDelivery: Math.round(Math.max(0, item.orderQuantity - totalItemFabricDelivered) * 1000) / 1000,
                deliveryPercent: Math.round(Math.min(100, item.orderQuantity ? (totalItemFabricDelivered / item.orderQuantity) * 100 : 0) * 10) / 10,
                lastSupplierId,
                lastSupplierName,
                yarnInwardLogs: innerLogs,
                dispatchRecords: innerDispatchRecords
            };
        });

        const invoice = jobCardData.invoices.length > 0 ? jobCardData.invoices[jobCardData.invoices.length - 1] : null;
        let finalInvoiceNumber = invoice?.invoiceNumber || null;
        let finalInvoiceDate = invoice?.date || null;
        if (jobCardData.invoices?.length > 0) {
            finalInvoiceNumber = jobCardData.invoices.map((inv: any) => inv.invoiceNumber).join(', ');
            finalInvoiceDate = jobCardData.invoices[0].date;
        }
        const finalRates = invoice?.rates || {};

        return {
            ...jobCardData,
            totalYarnReceived: totalYarnReceivedFinal,
            totalFabricDelivered,
            totalProductionWeight,
            yarnInwardLogs,
            yarnReturns,
            dispatchRecords,
            fabricItems: jobCardData.fabricItems.map(f => ({ ...f, dia: jobCardData.dia })),
            fabricItemSummaries,
            clientAddress: client?.address || '',
            clientGstNumber: client?.gstNumber || '',
            invoiceNumber: finalInvoiceNumber,
            invoiceDate: finalInvoiceDate,
            invoiceRates: finalRates as any
        };
    }

    async generateInvoice(jobNumber: string, rates: any, selectedDcIds: string[]) {
        const jobCard = await this.prisma.jobCard.findUnique({
            where: { jobNumber },
        });

        if (!jobCard) {
            throw new NotFoundException("No Job Card Found");
        }

        const existingDcs = await this.prisma.deliveryChallan.findMany({
            where: { id: { in: selectedDcIds } }
        });
        const existingInvoiceId = existingDcs.find(dc => dc.invoiceId)?.invoiceId;

        let finalInvoiceNumber: string;
        let finalInvoiceDate: Date;
        let finalRates: any;

        if (existingInvoiceId) {
            const updatedInvoice = await this.prisma.invoice.update({
                where: { id: existingInvoiceId },
                data: { rates: rates }
            });

            await this.prisma.jobCard.update({
                where: { jobNumber },
                data: { invoiceRates: rates }
            });

            finalInvoiceNumber = updatedInvoice.invoiceNumber;
            finalInvoiceDate = updatedInvoice.date;
            finalRates = updatedInvoice.rates;
        } else {
            const fullYear = new Date().getFullYear();
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

            finalInvoiceNumber = String(counter.lastNumber).padStart(3, "0");
            finalInvoiceDate = new Date();

            const newInvoice = await this.prisma.invoice.create({
                data: {
                    invoiceNumber: finalInvoiceNumber,
                    jobCardId: jobCard.id,
                    date: finalInvoiceDate,
                    rates: rates,
                    deliveryChallans: {
                        connect: selectedDcIds.map(dcId => ({ id: dcId }))
                    }
                }
            });

            await this.prisma.jobCard.update({
                where: { jobNumber },
                data: {
                    invoiceNumber: finalInvoiceNumber,
                    invoiceDate: finalInvoiceDate,
                    invoiceRates: rates,
                },
            });

            finalRates = newInvoice.rates;
        }

        const client = await this.prisma.client.findFirst({
            where: { name: jobCard.customerName }
        });

        return {
            invoiceNumber: finalInvoiceNumber,
            invoiceDate: finalInvoiceDate,
            invoiceRates: finalRates as any,
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

        const jobCards = await this.prisma.jobCard.findMany({ 
            where,
            include: {
                fabricItems: true,
                productionLogs: {
                    select: {
                        weight: true,
                    },
                },
                deliveryChallans: {
                    select: {
                        items: {
                            select: {
                                quantityKg: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit,
        });
        
        const total = await this.prisma.jobCard.count({ where });

        const data = jobCards.map(job => {
            const totalProductionWeight = job.productionLogs.reduce((sum, p) => sum + (p.weight || 0), 0);
            const totalFabricDelivered = job.deliveryChallans.reduce(
                (sum, dc) => sum + dc.items.reduce((s, item) => s + (item.quantityKg || 0), 0),
                0,
            );
            const availableProduced = Math.max(0, Math.round((totalProductionWeight - totalFabricDelivered) * 100) / 100);

            return {
                ...job,
                gsm: job.fabricItems.map(f => f.gsm).filter(Boolean).join(', '),
                orderQuantity: job.fabricItems.reduce((acc, f) => acc + (f.orderQuantity || 0), 0),
                composition: job.fabricItems.map(f => f.composition).filter(Boolean).join(', '),
                count: job.fabricItems.map(f => f.count).filter(Boolean).join(', '),
                rate: job.fabricItems.reduce((acc, f) => acc + (f.rate || 0), 0),
                machine: job.machine && job.brand ? `${job.machine} (${job.brand})` : (job.machine || job.brand || ''),
                totalProductionWeight,
                totalFabricDelivered,
                availableProduced,
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
            { id: string; value: string }[]
        >`SELECT "id", "jobNumber" || ' ' || "customerName" AS value
            FROM "JobCard" WHERE status = 'IN_PROGRESS'`;

        return result;
    }

    async getActiveJobCardsByDia(dia: string) {
        if (!dia) return [];

        const jobCards = await this.prisma.jobCard.findMany({
            where: {
                status: 'IN_PROGRESS',
                dia: dia,
            },
            include: {
                fabricItems: true,
                productionLogs: {
                    select: {
                        weight: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return jobCards.map(jc => {
            const firstFabric = jc.fabricItems[0] || null;
            const totalProductionWeight = jc.productionLogs.reduce((sum, log) => sum + (log.weight || 0), 0);

            return {
                id: jc.id,
                jobNumber: jc.jobNumber,
                customerName: jc.customerName,
                dia: jc.dia,
                fabricItem: firstFabric ? {
                    id: firstFabric.id,
                    fabricType: firstFabric.fabricType,
                    orderQuantity: firstFabric.orderQuantity,
                } : null,
                totalProductionWeight: Math.round(totalProductionWeight * 100) / 100,
            };
        });
    }

    async getJobCardById(id: string) {
        const jobCard = await this.prisma.jobCard.findUnique({
            where: { id },
            include: {
                fabricItems: true,
                productionLogs: {
                    select: {
                        id: true,
                        weight: true,
                    },
                },
            },
        });

        if (!jobCard) {
            throw new NotFoundException("Job Card not found");
        }

        const firstFabric = jobCard.fabricItems[0] || null;
        const totalProductionWeight = jobCard.productionLogs.reduce((sum, log) => sum + (log.weight || 0), 0);

        return {
            id: jobCard.id,
            jobNumber: jobCard.jobNumber,
            customerName: jobCard.customerName,
            dia: jobCard.dia,
            fabricItem: firstFabric ? {
                id: firstFabric.id,
                fabricType: firstFabric.fabricType,
                orderQuantity: firstFabric.orderQuantity,
            } : null,
            totalProductionWeight: Math.round(totalProductionWeight * 100) / 100,
        };
    }

    async getAllActiveJobCards(clientName?: string) {
        const whereClause: Prisma.JobCardWhereInput = { status: 'IN_PROGRESS' };
        if (clientName) {
            whereClause.customerName = clientName;
        }

        const jobCards = await this.prisma.jobCard.findMany({
            where: whereClause,
            include: { fabricItems: true }
        });

        return jobCards.map(jc => ({
            id: jc.jobNumber,
            jobId: jc.id,
            customerName: jc.customerName,
            quality: jc.fabricItems.map(f => f.quality).filter(Boolean).join(', ') || 'N/A'
        }));
    }
}
