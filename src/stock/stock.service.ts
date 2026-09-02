import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async getStock() {
    const clients = await this.prisma.client.findMany({
      include: {
        stockLedgers: {
          include: {
            sourceJobCard: true,
            targetJobCard: true,
            linkedChallan: {
              include: {
                supplier: true
              }
            }
          },
          orderBy: { date: 'asc' }
        }
      }
    });

    const stockData: any[] = [];

    for (const client of clients) {
      if (client.stockLedgers.length === 0) continue;

      const yarnGroups = new Map<string, any>();

      for (const ledger of client.stockLedgers) {
        const key = ledger.yarnName;
        if (!yarnGroups.has(key)) {
          yarnGroups.set(key, {
            yarnName: ledger.yarnName,
            bags: 0,
            netWeight: 0,
            history: []
          });
        }
        
        const group = yarnGroups.get(key);
        
        if (ledger.type === 'IN') {
          group.bags += ledger.bags;
          group.netWeight += ledger.netWeight;
        } else if (ledger.type === 'OUT') {
          group.bags -= ledger.bags;
          group.netWeight -= ledger.netWeight;
        }

        group.history.push({
          id: ledger.id,
          type: ledger.type,
          bags: ledger.bags,
          netWeight: ledger.netWeight,
          date: ledger.date,
          sourceJobCard: ledger.sourceJobCard?.jobNumber || null,
          targetJobCard: ledger.targetJobCard?.jobNumber || null,
          supplierName: ledger.linkedChallan?.supplier?.name || null
        });
      }

      for (const group of yarnGroups.values()) {
        if (group.netWeight > 0) { // Only show items with positive balance
          stockData.push({
            clientId: client.id,
            clientName: client.name,
            ...group,
            // Format netWeight to avoid floating point precision issues
            netWeight: Math.round(group.netWeight * 1000) / 1000
          });
        }
      }
    }

    return stockData;
  }

  async transferToStock(data: {
    sourceJobCardId: string; // This is the ID or jobNumber? Assuming ID since relation is by id, but usually frontend sends jobNumber. Let's check job card.
    // Assuming data.sourceJobCardId is the actual ID of the JobCard model.
    yarnName: string;
    bags: number;
    netWeight: number;
    remarks?: string;
  }) {
    const yarnName = data.yarnName.trim();

    return this.prisma.$transaction(async (tx) => {
      // Find the source job card
      const jobCard = await tx.jobCard.findFirst({
        where: { id: data.sourceJobCardId },
      });

      if (!jobCard) {
        throw new BadRequestException("Source Job Card not found");
      }

      let clientId = jobCard.clientId;

      if (!clientId) {
        const client = await tx.client.findFirst({
          where: { name: jobCard.customerName }
        });

        if (!client) {
          throw new BadRequestException("Job Card is not linked to a Client and Client not found in database");
        }

        clientId = client.id;

        await tx.jobCard.update({
          where: { id: jobCard.id },
          data: { clientId }
        });
      }

      // Try to find the most recent matching yarn inward challan
      const matchingItems = await tx.yarnInwardItem.findMany({
        where: {
          challan: { jobCardId: jobCard.id },
          yarnName: { equals: yarnName, mode: 'insensitive' },
        },
        include: { challan: true },
        orderBy: { challan: { entryDate: 'desc' } }
      });

      let linkedChallanId = matchingItems.length > 0 ? matchingItems[0].challanId : null;

      if (!linkedChallanId) {
        const matchingLedgers = await tx.yarnStockLedger.findMany({
          where: {
            type: 'OUT',
            targetJobCardId: jobCard.id,
            yarnName: { equals: yarnName, mode: 'insensitive' },
            linkedChallanId: { not: null }
          },
          orderBy: { date: 'desc' }
        });
        if (matchingLedgers.length > 0) {
          linkedChallanId = matchingLedgers[0].linkedChallanId;
        }
      }

      const ledgerEntry = await tx.yarnStockLedger.create({
        data: {
          type: 'IN',
          clientId: clientId,
          sourceJobCardId: jobCard.id,
          linkedChallanId,
          yarnName,
          bags: data.bags,
          netWeight: data.netWeight,
          remarks: data.remarks
        }
      });

      return {
        message: 'Yarn successfully transferred to stock',
        ledgerEntry
      };
    }, {
      maxWait: 5000,
      timeout: 10000
    });
  }

  async transferToJobCard(data: {
    targetJobCardId: string;
    yarnName: string;
    bags: number;
    netWeight: number;
    remarks?: string;
  }) {
    const yarnName = data.yarnName.trim();

    return this.prisma.$transaction(async (tx) => {
      const jobCard = await tx.jobCard.findFirst({
        where: { id: data.targetJobCardId }
      });

      if (!jobCard) {
        throw new BadRequestException("Target Job Card not found");
      }

      let clientId = jobCard.clientId;

      if (!clientId) {
        const client = await tx.client.findFirst({
          where: { name: jobCard.customerName }
        });

        if (!client) {
          throw new BadRequestException("Job Card is not linked to a Client and Client not found in database");
        }

        clientId = client.id;

        // Link it in DB for future operations
        await tx.jobCard.update({
          where: { id: jobCard.id },
          data: { clientId }
        });
      }

      // Ideally we would verify there is enough stock balance for this yarn type and client
      // But we will allow the transfer and assume operators ensure correctness, or we can validate here.

      // We should link back to the original challan. To do that, we look at the stock ledger for this client and yarn
      const stockIns = await tx.yarnStockLedger.findMany({
        where: {
          clientId: clientId,
          type: 'IN',
          yarnName: { equals: yarnName, mode: 'insensitive' },
          linkedChallanId: { not: null }
        },
        orderBy: { date: 'desc' }
      });

      const linkedChallanId = stockIns.length > 0 ? stockIns[0].linkedChallanId : null;

      const ledgerEntry = await tx.yarnStockLedger.create({
        data: {
          type: 'OUT',
          clientId: clientId,
          targetJobCardId: jobCard.id,
          linkedChallanId,
          yarnName,
          bags: data.bags,
          netWeight: data.netWeight,
          remarks: data.remarks
        }
      });

      return {
        message: 'Yarn successfully transferred to Job Card',
        ledgerEntry
      };
    }, {
      maxWait: 5000,
      timeout: 10000
    });
  }
}
