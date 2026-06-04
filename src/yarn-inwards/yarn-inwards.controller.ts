import { Body, Controller, Get, Post } from '@nestjs/common';
import { YarnInwardsService } from './yarn-inwards.service';
import { CreateYarnInwardChallanDto } from 'src/dto/yarnInwards/create-yarn-inward-challan.dto';

@Controller('yarn-inwards')
export class YarnInwardsController {
    constructor(private readonly yarnInwardsService: YarnInwardsService) {}

    @Get('next-grn-number')
    getNextGrnNumber() {
        return this.yarnInwardsService.getNextGrnNumber();
    }

    @Post('create-yarn-inward')
    createYarnInward(@Body() yarnInwardData: CreateYarnInwardChallanDto) {
        return this.yarnInwardsService.createYarnInwardChallan(yarnInwardData);
    }
}
