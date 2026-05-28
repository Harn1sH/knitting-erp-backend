// Architectural Decision: MERGED APPROACH
// Reasoning: The `getJobCard` method already fetches both `yarnInwards` and `deliveries`
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
                    // jobNumber: `JOB-${Date.now()}`,  Added because this field is mandatory and unique in schema
                    customerName: jobCardData.customerName,
                    // createdAt:jobCardData.recievedDate,
                    deliveryDate: jobCardData.deliveryDate,
                    status: 'IN_PROGRESS',
                    remarks: jobCardData.remarks,
                    fabricType: jobCardData.fabricType,
                    gsm: jobCardData.gsm,
                    dia: jobCardData.dia,
                    count: jobCardData.yarnCount.toString(), // Fix: converted number to string
                    quality: jobCardData.quality,
                    composition: jobCardData.yarnComposition,
                    rate: jobCardData.ratePerKG,
                    orderQuantity: jobCardData.orderQuantity,
                    totalYarnNeeded: jobCardData.totalYarnNeeded,
                    machine: jobCardData.machine,
                    brand: jobCardData.brand,
                    machineNote: jobCardData.machineNote,
                    jobNumber,
                },
            });
        });
        console.log(temp);

        return { message: "Job Card Created Successfully" }
    }

    async getJobCard(jobNumber: string) {
        const jobCard = await this.prisma.jobCard.findUnique({
            where: {
                jobNumber: jobNumber
            },
            include:{
                yarnInwards: {
                    include: {
                        supplier: true
                    }
                },
                deliveries: true
            }
        })

        if (!jobCard) {
            throw new NotFoundException("No Job Card Found")
        }

        const totalYarnReceived = jobCard.yarnInwards.reduce((sum, item) => sum + item.netWeight, 0);
        const totalFabricDelivered = jobCard.deliveries.reduce((sum, item) => sum + item.quantityKg, 0);

        const yarnInwardLogs = jobCard.yarnInwards.map(y => ({
             date: new Date(y.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
             supplier: y.supplier?.name || 'Unknown',
             type: y.yarnName,
             count: jobCard.count,
             bags: y.bags,
             cones: y.cones,
             weight: `${y.netWeight.toFixed(2)} Kg`,
             status: "Received"
        }));

        let cumulativeDelivery = 0;
        const dispatchRecords = jobCard.deliveries.map(d => {
             cumulativeDelivery += d.quantityKg;
             const balance = jobCard.orderQuantity - cumulativeDelivery;
             return {
                 date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                 dcNo: d.dcNo,
                 qty: `${d.quantityKg.toFixed(2)} Kg`,
                 balance: `${Math.max(0, balance).toFixed(2)} Kg`,
                 vehicle: d.vehicle,
                 status: "Dispatched"
             };
        });

        return {
            ...jobCard,
            totalYarnReceived,
            totalFabricDelivered,
            yarnInwardLogs,
            dispatchRecords
        };
    }

    async getAllJobCards(jobNumber?: string) {
        const where: Prisma.JobCardWhereInput = {};

        if (jobNumber) {
            where.jobNumber = jobNumber;
        }



        const jobCards = await this.prisma.jobCard.findMany({ where })

        return jobCards;
    }

    async getAllActiveJobCardNames() {

        const result = await this.prisma.$queryRaw<
            { value: string }[]
        >`SELECT "jobNumber" || ' ' || "customerName" AS value
            FROM "JobCard"`;

        return result;
    }
}
