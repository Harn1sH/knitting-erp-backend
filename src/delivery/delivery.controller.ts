import { Body, Controller, Post } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryDto } from 'src/dto/delivery/create-delivery.dto';

@Controller('delivery')
export class DeliveryController {
    constructor(private readonly deliveryService: DeliveryService) {}

    @Post('create-delivery')
    createDelivery(@Body() deliveryData: CreateDeliveryDto) {
        return this.deliveryService.createDelivery(deliveryData);
    }
}
