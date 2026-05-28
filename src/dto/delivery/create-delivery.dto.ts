import { Type } from "class-transformer"
import { IsDate, IsInt, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateDeliveryDto {
    @IsString()
    @Type(() => String)
    jobCardId: string

    @IsNumber()
    @Type(() => Number)
    quantityKg: number

    @IsString()
    dcNo: string

    @IsString()
    @IsOptional()
    vehicle: string

    @IsDate()
    @Type(() => Date)
    date: Date

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    numberOfRolls?: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    weightPerRoll?: number

    @IsOptional()
    @IsString()
    companyName?: string

    @IsOptional()
    @IsString()
    fabricName?: string
}
