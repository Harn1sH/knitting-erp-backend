import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { JobcardModule } from './jobcard/jobcard.module';
import { MasterModule } from './master/master.module';
import { YarnInwardsModule } from './yarn-inwards/yarn-inwards.module';
import { DeliveryModule } from './delivery/delivery.module';

@Module({
  imports: [PrismaModule, ConfigModule.forRoot({ isGlobal: true }), AuthModule, DashboardModule, JobcardModule, MasterModule, YarnInwardsModule, DeliveryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
