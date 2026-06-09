import { Type } from "class-transformer"
import { IsArray, IsDate, IsInt, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"

export class DeliveryItemDto {
    @IsString()
    fabricItemId: string

    @IsNumber()
    @Type(() => Number)
    quantityKg: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    numberOfRolls?: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    weightPerRoll?: number

    @IsOptional()
    @IsString()
    fabricName?: string

    @IsInt()
    @Type(() => Number)
    rolls: number

    @IsNumber()
    @Type(() => Number)
    wtPerRoll: number
}

export class CreateDeliveryChallanDto {
    @IsString()
    @Type(() => String)
    jobCardId: string

    @IsOptional()
    @IsString()
    vehicle?: string

    @IsOptional()
    @IsString()
    companyName?: string

    @IsDate()
    @Type(() => Date)
    date: Date

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DeliveryItemDto)
    items: DeliveryItemDto[]
}
