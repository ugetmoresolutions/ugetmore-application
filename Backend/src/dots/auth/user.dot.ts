import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, IsOptional, IsPhoneNumber } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    public email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(32)
    public password: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(10)
    public role: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(32)
    public fullName: string;

    @IsOptional()  
    @IsString()
    @MaxLength(6)
    public otp?: string;

}
