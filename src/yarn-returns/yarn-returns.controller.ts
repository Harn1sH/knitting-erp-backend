import { Body, Controller, Get, Post } from '@nestjs/common';
import { YarnReturnsService } from './yarn-returns.service';
import { CreateYarnReturnDto } from 'src/dto/yarnReturns/create-yarn-return.dto';

@Controller('yarn-returns')
export class YarnReturnsController {
    constructor(private readonly yarnReturnsService: YarnReturnsService) {}

    @Get('next-dc-number')
    getNextDcNumber() {
        return this.yarnReturnsService.getNextDcNumber();
    }

    @Post('create')
    createYarnReturn(@Body() yarnReturnData: CreateYarnReturnDto) {
        return this.yarnReturnsService.createYarnReturn(yarnReturnData);
    }
}
