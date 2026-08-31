import { IsString, IsNumber, IsDateString, IsOptional, IsEnum } from "class-validator";
import { Shift } from "./create-production-log.dto";

export class UpdateProductionLogDto {
    @IsString()
    @IsOptional()
    jobCardId?: string;

    @IsString()
    @IsOptional()
    employeeId?: string;

    @IsString()
    @IsOptional()
    fabricType?: string;

    @IsString()
    @IsOptional()
    dia?: string;

    @IsNumber()
    @IsOptional()
    rollsCompleted?: number;

    @IsNumber()
    @IsOptional()
    weight?: number;

    @IsDateString()
    @IsOptional()
    date?: string;

    @IsEnum(Shift)
    @IsOptional()
    shift?: Shift;
}
