import { Module } from '@nestjs/common';
import { JobcardService } from './jobcard.service';
import { JobcardController } from './jobcard.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports:[PrismaModule],
  controllers: [JobcardController],
  providers: [JobcardService]
})
export class JobcardModule {}
