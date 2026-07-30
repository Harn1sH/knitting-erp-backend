import { Module } from '@nestjs/common';
import { YarnReturnsController } from './yarn-returns.controller';
import { YarnReturnsService } from './yarn-returns.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [YarnReturnsController],
  providers: [YarnReturnsService],
})
export class YarnReturnsModule {}
