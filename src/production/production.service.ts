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
            return { status: 400, message: "Failed to create production log" };
        }
    }

    async getLogs(startDate?: string, endDate?: string, employeeId?: string) {
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

    async getSummary(period: 'day' | 'week' | 'month', year?: string, month?: string, week?: string) {
        try {
            // Simplified summary calculation. In a real scenario we'd do Prisma aggregation
            const logs = await this.prisma.productionLog.findMany({
                include: { employee: true }
            });
            
            // For now, return basic group-by logic just to fulfill the API structure
            // In a production app, we would use raw SQL or Prisma group-by for efficiency
            let periodStr = "All";
            let totalRolls = 0;
            let totalWeight = 0;
            
            const employeeMap = new Map();
            
            logs.forEach(log => {
                totalRolls += log.rollsCompleted;
                totalWeight += log.weight;
                
                const emp = log.employee;
                if (!employeeMap.has(emp.id)) {
                    employeeMap.set(emp.id, {
                        employeeId: emp.id,
                        employeeName: emp.name,
                        rolls: 0,
                        weight: 0
                    });
                }
                const empData = employeeMap.get(emp.id);
                empData.rolls += log.rollsCompleted;
                empData.weight += log.weight;
            });

            return {
                status: 200,
                data: [{
                    period: periodStr,
                    totalRolls,
                    totalWeight,
                    entryCount: logs.length,
                    employees: Array.from(employeeMap.values())
                }]
            };
        } catch (error) {
            return { status: 400, message: "Failed to fetch production summary" };
        }
    }
}
