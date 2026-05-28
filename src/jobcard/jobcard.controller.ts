import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
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
    getAllJobCards(@Query('jobNumber') jobNumber?: string) {
        return this.jobcardService.getAllJobCards(jobNumber)
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
}
