import { Body, Controller, Get, Post } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryChallanDto } from 'src/dto/delivery/create-delivery-challan.dto';

@Controller('delivery')
export class DeliveryController {
    constructor(private readonly deliveryService: DeliveryService) {}

    @Get('next-dc-number')
    getNextDcNumber() {
        return this.deliveryService.getNextDcNumber();
    }

    @Post('create-delivery')
    createDelivery(@Body() deliveryData: CreateDeliveryChallanDto) {
        return this.deliveryService.createDeliveryChallan(deliveryData);
    }
}
