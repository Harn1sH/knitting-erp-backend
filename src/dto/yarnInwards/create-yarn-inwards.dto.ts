import { Type } from "class-transformer"
import { IsDate, IsNumber, IsOptional, IsString } from "class-validator"

export class  CreateYarnInwardDto {
    @IsString()
    @Type(()=>String)
    jobCardId: string

    @IsString()
    supplierId: string

    @IsString()
    yarnName: string

    @IsString()
    color: string

    @IsNumber()
    @Type(()=>Number)
    bags: number

    @IsNumber()
    @Type(() => Number)
    cones: number

    @IsNumber()
    @Type(() => Number)
    netWeight: number

    @IsDate()
    @Type(() => Date)
    entryDate: Date

    @IsNumber()
    @Type(() => Number)
    weightPerBag: number

    @IsString()
    @IsOptional()
    remarks: string

    @IsString()
    @IsOptional()
    fabricItemId?: string;
}