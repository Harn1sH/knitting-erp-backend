import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString, IsNotEmpty, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { CreateFabricItemDto } from './create-fabric-item.dto';

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

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateFabricItemDto)
    @ArrayMinSize(1)
    fabricItems: CreateFabricItemDto[];

    @IsString()
    machine: string;

    @IsString()
    brand: string;

    @IsString()
    machineNote: string;
}