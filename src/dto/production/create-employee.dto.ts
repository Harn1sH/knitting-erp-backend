import { IsString, IsOptional } from "class-validator";

export class CreateEmployeeDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    phone?: string;
}
