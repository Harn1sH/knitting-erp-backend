import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {

    constructor(private readonly dashboardService: DashboardService) { }

    @UseGuards(JwtAuthGuard)
    @Get('get-dashbaord-tiles')
    getDashboard() {
        return this.dashboardService.getDashboard();
    }
}
