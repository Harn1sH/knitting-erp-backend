import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from '../dto/production/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/production/update-employee.dto';
import { CreateProductionLogDto } from '../dto/production/create-production-log.dto';
import { UpdateProductionLogDto } from '../dto/production/update-production-log.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductionService {
    constructor(private prisma: PrismaService) {}

    async createEmployee(body: CreateEmployeeDto) {
        try {
            const employee = await this.prisma.employee.create({
                data: body,
            });
            return { status: 200, message: "Employee created successfully", data: employee };
        } catch (error) {
            return { status: 400, message: "Failed to create employee" };
        }
    }

    async getEmployees(all?: boolean) {
        try {
            const whereClause = all ? {} : { isActive: true };
            const employees = await this.prisma.employee.findMany({
                where: whereClause,
                orderBy: { name: 'asc' }
            });
            return { status: 200, data: employees };
        } catch (error) {
            return { status: 400, message: "Failed to fetch employees" };
        }
    }

    async updateEmployee(id: string, body: UpdateEmployeeDto) {
        try {
            const employee = await this.prisma.employee.update({
                where: { id },
                data: body,
            });
            return { status: 200, message: "Employee updated successfully", data: employee };
        } catch (error) {
            return { status: 400, message: "Failed to update employee" };
        }
    }

    async createLog(body: CreateProductionLogDto) {
        try {
            const log = await this.prisma.productionLog.create({
                data: {
                    ...body,
                    date: new Date(body.date),
                },
            });
            return { status: 200, message: "Production log created successfully", data: log };
        } catch (error) {
            console.error("Error creating production log:", error);
            return { status: 400, message: "Failed to create production log" };
        }
    }

    async getLogs(startDate?: string, endDate?: string, employeeId?: string, jobCardId?: string) {
        try {
            const whereClause: Prisma.ProductionLogWhereInput = {};
            
            if (startDate || endDate) {
                whereClause.date = {};
                if (startDate) whereClause.date.gte = new Date(startDate);
                if (endDate) whereClause.date.lte = new Date(endDate);
            }
            if (employeeId) {
                whereClause.employeeId = employeeId;
            }
            if (jobCardId) {
                whereClause.jobCardId = jobCardId;
            }

            const logs = await this.prisma.productionLog.findMany({
                where: whereClause,
                include: { employee: true },
                orderBy: { date: 'desc' }
            });
            return { status: 200, data: logs };
        } catch (error) {
            return { status: 400, message: "Failed to fetch production logs" };
        }
    }

    async updateLog(id: string, body: UpdateProductionLogDto) {
        try {
            const dataToUpdate: any = { ...body };
            if (body.date) {
                dataToUpdate.date = new Date(body.date);
            }

            const log = await this.prisma.productionLog.update({
                where: { id },
                data: dataToUpdate,
            });
            return { status: 200, message: "Production log updated successfully", data: log };
        } catch (error) {
            return { status: 400, message: "Failed to update production log" };
        }
    }

    async deleteLog(id: string) {
        try {
            await this.prisma.productionLog.delete({
                where: { id },
            });
            return { status: 200, message: "Production log deleted successfully" };
        } catch (error) {
            return { status: 400, message: "Failed to delete production log" };
        }
    }

    async getSummary(period: 'day' | 'week' | 'month', year?: string, month?: string, week?: string, jobCardId?: string) {
        try {
            let startDate: Date;
            let endDate: Date;
            const now = new Date();
            
            if (period === 'day') {
                startDate = new Date(now.setHours(0, 0, 0, 0));
                endDate = new Date(now.setHours(23, 59, 59, 999));
            } else if (period === 'month') {
                const y = year ? parseInt(year) : now.getFullYear();
                const m = month ? parseInt(month) - 1 : now.getMonth();
                startDate = new Date(y, m, 1);
                endDate = new Date(y, m + 1, 0, 23, 59, 59, 999);
            } else {
                // week or default
                const y = year ? parseInt(year) : now.getFullYear();
                const currentDay = now.getDay();
                const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
                startDate = new Date(now.setDate(diff));
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6);
                endDate.setHours(23, 59, 59, 999);
            }

            const whereClause: Prisma.ProductionLogWhereInput = {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            };
            
            if (jobCardId) {
                whereClause.jobCardId = jobCardId;
            }

            const aggregateResult = await this.prisma.productionLog.aggregate({
                where: whereClause,
                _sum: { rollsCompleted: true, weight: true },
                _count: { id: true }
            });
            
            const groupByResult = await this.prisma.productionLog.groupBy({
                by: ['employeeId', 'shift'],
                where: whereClause,
                _sum: { rollsCompleted: true, weight: true }
            });

            const employeeIds = groupByResult.map(g => g.employeeId);
            const employees = await this.prisma.employee.findMany({
                where: { id: { in: employeeIds } }
            });

            const employeeMap = new Map(employees.map(e => [e.id, e.name]));

            const employeesSummary = groupByResult.map(g => ({
                employeeId: g.employeeId,
                employeeName: employeeMap.get(g.employeeId) || 'Unknown',
                shift: g.shift,
                rolls: g._sum.rollsCompleted || 0,
                weight: g._sum.weight || 0
            }));

            return {
                status: 200,
                data: [{
                    period: period,
                    totalRolls: aggregateResult._sum.rollsCompleted || 0,
                    totalWeight: aggregateResult._sum.weight || 0,
                    entryCount: aggregateResult._count.id,
                    employees: employeesSummary
                }]
            };
        } catch (error) {
            return { status: 400, message: "Failed to fetch production summary" };
        }
    }

    async getJobCardsWithProduction() {
        try {
            const groupByResult = await this.prisma.productionLog.groupBy({
                by: ['jobCardId'],
                where: {
                    jobCardId: { not: null }
                },
                _sum: {
                    rollsCompleted: true,
                    weight: true
                },
                _max: {
                    date: true
                }
            });
            
            const jobCardIds = groupByResult.map(g => g.jobCardId as string);
            const jobCards = await this.prisma.jobCard.findMany({
                where: { id: { in: jobCardIds } }
            });
            const jobCardMap = new Map(jobCards.map(j => [j.id, j]));

            const result = groupByResult.map(g => {
                const jc = jobCardMap.get(g.jobCardId as string);
                return {
                    jobCardId: g.jobCardId,
                    jobNumber: jc?.jobNumber,
                    customerName: jc?.customerName,
                    totalRolls: g._sum.rollsCompleted || 0,
                    totalWeight: g._sum.weight || 0,
                    lastProductionDate: g._max.date
                };
            });

            // Sort by latest production date descending
            result.sort((a, b) => {
                const dateA = a.lastProductionDate ? new Date(a.lastProductionDate).getTime() : 0;
                const dateB = b.lastProductionDate ? new Date(b.lastProductionDate).getTime() : 0;
                return dateB - dateA;
            });

            return { status: 200, data: result };
        } catch (error) {
            return { status: 400, message: "Failed to fetch job cards production summary" };
        }
    }
}
