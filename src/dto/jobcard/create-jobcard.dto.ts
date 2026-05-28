import { Type } from 'class-transformer';
import { IsDate,IsNumber, IsString } from 'class-validator';

export class CreateJobCardDto {
    @IsString()
    customerName: string;

    @IsDate()
    @Type(() => Date)
    recievedDate: Date

    @IsDate()
    @Type(() => Date)
    deliveryDate: Date


    @IsString()
    remarks: string

    @IsString()
    fabricType: string

    @IsNumber()
    @Type(() => Number)
    gsm: number

    @IsNumber()
    @Type(() => Number)
    @Type(() => Number)
    dia: number

    @IsString()
    yarnCount: string

    @IsString()
    yarnComposition: string

    @IsNumber()
    @Type(() => Number)
    ratePerKG: number

    @IsNumber()
    @Type(() => Number)
    orderQuantity: number

    @IsNumber()
    @Type(() => Number)
    totalYarnNeeded: number

    @IsString()
    machine: string

    @IsString()
    brand: string

    @IsString()
    machineNote: string
}