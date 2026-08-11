import { Type } from "class-transformer"
import { IsArray, IsDate, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"

export class YarnReturnItemDto {
    @IsOptional()
    @IsString()
    fabricItemId?: string;

    @IsString()
    yarnName: string;

    @IsNumber()
    @Type(() => Number)
    bags: number;

    @IsNumber()
    @Type(() => Number)
    netWeight: number;

    @IsNumber()
    @Type(() => Number)
    weightPerBag: number;
}

export class CreateYarnReturnDto {
    @IsString()
    jobCardId: string;

    @IsString()
    supplierId: string;

    @IsDate()
    @Type(() => Date)
    date: Date;

    @IsOptional()
    @IsString()
    vehicleNumber?: string;

    @IsOptional()
    @IsString()
    partyDcNumber?: string;

    @IsOptional()
    @IsString()
    remarks?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => YarnReturnItemDto)
    items: YarnReturnItemDto[];
}
