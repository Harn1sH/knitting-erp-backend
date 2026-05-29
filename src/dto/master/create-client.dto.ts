import { IsEmail, IsOptional, IsString } from "class-validator";

export class CreateClientDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string

    @IsString()
    phoneNumber: string

    @IsString()
    @IsOptional()
    altPhoneNumber: string

    @IsString()
    address: string

    @IsString()
    city: string

    @IsString()
    state: string

    @IsString()
    gstNumber: string

    @IsString()
    panNumber: string

    @IsString()
    bankName: string

    @IsString()
    accountNumber: string

    @IsString()
    ifscCode: string

    @IsString()
    @IsOptional()
    remarks: string

    @IsString()
    pincode: string
}
