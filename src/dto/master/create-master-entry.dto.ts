import { IsOptional, IsString } from "class-validator";

export class CreateMasterEntryDto {
    @IsString()
    category: string;

    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}
