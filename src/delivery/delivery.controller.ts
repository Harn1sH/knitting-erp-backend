import { Body, Controller, Get, Post, Patch, Param } from '@nestjs/common';
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

    @Patch(':id/party-dc')
    updatePartyDcNo(@Param('id') id: string, @Body() data: { partyDcNo: string }) {
        return this.deliveryService.updatePartyDcNo(id, data.partyDcNo);
    }
}
