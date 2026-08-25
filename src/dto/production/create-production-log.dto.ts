import { IsString, IsNumber, IsDateString, IsEnum, IsOptional } from "class-validator";

export enum Shift {
    DAY = "DAY",
    NIGHT = "NIGHT"
}

export class CreateProductionLogDto {
    @IsString()
    employeeId: string;

    @IsString()
    fabricType: string;

    @IsString()
    dia: string;

    @IsNumber()
    rollsCompleted: number;

    @IsNumber()
    weight: number;

    @IsDateString()
    date: string;

    @IsEnum(Shift)
    @IsOptional()
    shift?: Shift;
}
