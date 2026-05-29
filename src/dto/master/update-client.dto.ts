import { IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateClientDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @IsString()
    @IsOptional()
    altPhoneNumber?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    gstNumber?: string;

    @IsString()
    @IsOptional()
    panNumber?: string;

    @IsString()
    @IsOptional()
    bankName?: string;

    @IsString()
    @IsOptional()
    accountNumber?: string;

    @IsString()
    @IsOptional()
    ifscCode?: string;

    @IsString()
    @IsOptional()
    remarks?: string;

    @IsString()
    @IsOptional()
    pincode?: string;
}
