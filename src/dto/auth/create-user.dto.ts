import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export enum Role {
    ADMIN = 'ADMIN',
    EMPLOYEE = 'EMPLOYEE',
}

export class CreateUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;

    @IsEnum(Role)
    role: Role;
}