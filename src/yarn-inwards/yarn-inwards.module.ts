import { Module } from '@nestjs/common';
import { YarnInwardsController } from './yarn-inwards.controller';
import { YarnInwardsService } from './yarn-inwards.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports:[PrismaModule],
  controllers: [YarnInwardsController],
  providers: [YarnInwardsService]
})
export class YarnInwardsModule {}
