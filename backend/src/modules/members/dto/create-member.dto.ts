import { IsString, IsOptional, IsNumber, IsDateString, IsIn } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  @IsIn(['standard', 'premium', 'student', 'honorary'])
  membershipType: string;

  @IsOptional()
  @IsString()
  @IsIn(['mvola', 'orange_money', 'airtel', 'bank'])
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class RenewMemberDto {
  @IsString()
  @IsIn(['standard', 'premium', 'student', 'honorary'])
  membershipType: string;

  @IsOptional()
  @IsString()
  @IsIn(['mvola', 'orange_money', 'airtel', 'bank'])
  paymentMethod?: string;
}

export class UpdateMemberStatusDto {
  @IsString()
  @IsIn(['pending', 'active', 'expired', 'suspended'])
  status: string;
}

export class MemberResponseDto {
  id: string;
  memberNumber: string;
  userId: string;
  status: string;
  membershipType: string;
  startDate: Date;
  expiryDate: Date;
  amountPaid: number;
  paymentMethod: string;
  cardUrl: string;
  qrCode: string;
  createdAt: Date;
  updatedAt: Date;
}