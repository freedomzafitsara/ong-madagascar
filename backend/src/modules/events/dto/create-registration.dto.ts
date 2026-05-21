import { IsString, IsEmail, IsOptional, IsNotEmpty, Length } from 'class-validator';

export class CreateRegistrationDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  @Length(9, 20)
  phone?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}