import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  async getStock() {
    return this.stockService.getStock();
  }

  @Post('transfer-in')
  async transferToStock(@Body() body: {
    sourceJobCardId: string;
    yarnName: string;
    bags: number;
    netWeight: number;
    remarks?: string;
  }) {
    if (!body.sourceJobCardId || !body.yarnName || body.bags === undefined || body.netWeight === undefined) {
      throw new BadRequestException("Missing required fields");
    }
    return this.stockService.transferToStock(body);
  }

  @Post('transfer-out')
  async transferToJobCard(@Body() body: {
    targetJobCardId: string;
    yarnName: string;
    bags: number;
    netWeight: number;
    remarks?: string;
  }) {
    if (!body.targetJobCardId || !body.yarnName || body.bags === undefined || body.netWeight === undefined) {
      throw new BadRequestException("Missing required fields");
    }
    return this.stockService.transferToJobCard(body);
  }
}
