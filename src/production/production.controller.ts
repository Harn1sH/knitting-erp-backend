import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProductionService } from './production.service';
import { CreateEmployeeDto } from '../dto/production/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/production/update-employee.dto';
import { CreateProductionLogDto } from '../dto/production/create-production-log.dto';
import { UpdateProductionLogDto } from '../dto/production/update-production-log.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('production')
export class ProductionController {
    constructor(private readonly productionService: ProductionService) {}

    // ── Employee Master ──────────────────────────────────────

    @Post("employees")
    createEmployee(@Body() body: CreateEmployeeDto) {
        return this.productionService.createEmployee(body);
    }

    @Get("employees")
    getEmployees(@Query('all') all?: boolean) {
        return this.productionService.getEmployees(all);
    }

    @Patch("employees/:id")
    updateEmployee(@Param('id') id: string, @Body() body: UpdateEmployeeDto) {
        return this.productionService.updateEmployee(id, body);
    }

    // ── Production Logs ──────────────────────────────────────

    @Post("logs")
    createLog(@Body() body: CreateProductionLogDto) {
        return this.productionService.createLog(body);
    }

    @Get("logs")
    getLogs(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('employeeId') employeeId?: string,
        @Query('jobCardId') jobCardId?: string,
    ) {
        return this.productionService.getLogs(startDate, endDate, employeeId, jobCardId);
    }

    @Patch("logs/:id")
    updateLog(@Param('id') id: string, @Body() body: UpdateProductionLogDto) {
        return this.productionService.updateLog(id, body);
    }

    @Delete("logs/:id")
    deleteLog(@Param('id') id: string) {
        return this.productionService.deleteLog(id);
    }

    @Get("summary")
    getSummary(
        @Query('period') period: 'day' | 'week' | 'month',
        @Query('year') year?: string,
        @Query('month') month?: string,
        @Query('week') week?: string,
        @Query('jobCardId') jobCardId?: string,
    ) {
        return this.productionService.getSummary(period, year, month, week, jobCardId);
    }

    @Get("job-cards-summary")
    getJobCardsWithProduction() {
        return this.productionService.getJobCardsWithProduction();
    }
}
