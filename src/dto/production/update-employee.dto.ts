import { IsString, IsOptional, IsBoolean } from "class-validator";

export class UpdateEmployeeDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
