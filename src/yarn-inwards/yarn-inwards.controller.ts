import { Body, Controller, Post } from '@nestjs/common';
import { YarnInwardsService } from './yarn-inwards.service';
import { CreateYarnInwardDto } from 'src/dto/yarnInwards/create-yarn-inwards.dto';

@Controller('yarn-inwards')
export class YarnInwardsController {
    constructor(private readonly yarnInwardsService: YarnInwardsService){}

    @Post('create-yarn-inward')
    createYarnInward(@Body() yarnInwardData: CreateYarnInwardDto) {
        return this.yarnInwardsService.createYarnInward(yarnInwardData);
    }    
}
