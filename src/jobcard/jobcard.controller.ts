import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { JobcardService } from './jobcard.service';
import { CreateJobCardDto } from 'src/dto/jobcard/create-jobcard.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('jobcard')
export class JobcardController {
    constructor(private readonly jobcardService: JobcardService) { }

    @UseGuards(JwtAuthGuard)
    @Post('create-jobcard')
    createJobCard(@Body() jobCardData: CreateJobCardDto) {
        return this.jobcardService.createJobCard(jobCardData);
    }

    @UseGuards(JwtAuthGuard)
    @Get('get-all-jobcards')
    getAllJobCards(
        @Query('jobNumber') jobNumber?: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10
    ) {
        return this.jobcardService.getAllJobCards(jobNumber, page, limit);
    }

    @UseGuards(JwtAuthGuard)
    @Get('get-jobcard/:jobNumber')
    getJobCard(@Param('jobNumber') jobNumber: string) {
        return this.jobcardService.getJobCard(jobNumber);
    }

    @UseGuards(JwtAuthGuard)
    @Get('get-all-active-jobcard-names')
    getAllActiveJobCardNames(){
        return this.jobcardService.getAllActiveJobCardNames();
    }

    @UseGuards(JwtAuthGuard)
    @Get('get-all-active-jobcards')
    getAllActiveJobCards(@Query('clientName') clientName?: string) {
        return this.jobcardService.getAllActiveJobCards(clientName);
    }

    @UseGuards(JwtAuthGuard)
    @Post('generate-invoice/:jobNumber')
    generateInvoice(
        @Param('jobNumber') jobNumber: string,
        @Body() body: { rates: any, selectedDcIds: string[] }
    ) {
        return this.jobcardService.generateInvoice(jobNumber, body.rates, body.selectedDcIds);
    }
}
