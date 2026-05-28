import { IsOptional, IsString } from "class-validator";

export class UpdateMasterEntryDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;
}
