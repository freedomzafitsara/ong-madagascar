import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { MembershipType, PaymentMethod } from '../../../entities/member.entity';

export class CreateMemberUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  region?: string;
}

export class CreateMemberDto {
  @IsNotEmpty()
  user: CreateMemberUserDto;

  @IsEnum(MembershipType)
  membershipType: MembershipType;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsNumber()
  amountPaid: number;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;
}

// Ajout de UpdateMemberStatusDto
export class UpdateMemberStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;
}