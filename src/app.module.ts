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
import { YarnReturnsModule } from './yarn-returns/yarn-returns.module';
import { ProductionModule } from './production/production.module';
import { StockModule } from './stock/stock.module';

@Module({
  imports: [PrismaModule, ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }), AuthModule, DashboardModule, JobcardModule, MasterModule, YarnInwardsModule, DeliveryModule, YarnReturnsModule, ProductionModule, StockModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
