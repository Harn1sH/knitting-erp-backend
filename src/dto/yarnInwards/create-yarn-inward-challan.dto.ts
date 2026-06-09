import { Type } from "class-transformer"
import { IsArray, IsDate, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"

export class YarnInwardItemDto {
    @IsString()
    fabricItemId: string

    @IsOptional()
    @IsString()
    supplierId?: string

    @IsString()
    yarnName: string

    @IsOptional()
    @IsString()
    color?: string

    @IsNumber()
    @Type(() => Number)
    bags: number

    @IsNumber()
    @Type(() => Number)
    cones: number

    @IsNumber()
    @Type(() => Number)
    weightPerBag: number

    @IsNumber()
    @Type(() => Number)
    wtPerCone: number

    @IsNumber()
    @Type(() => Number)
    netWeight: number
}

export class CreateYarnInwardChallanDto {
    @IsString()
    @Type(() => String)
    jobCardId: string

    @IsString()
    supplierId: string

    @IsDate()
    @Type(() => Date)
    entryDate: Date

    @IsOptional()
    @IsString()
    remarks?: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => YarnInwardItemDto)
    items: YarnInwardItemDto[]
}
