// backend/src/modules/members/dto/create-member.dto.ts
// VERSION FINALE - CORRECTE

import { IsString, IsOptional, IsIn } from 'class-validator';

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

  @IsOptional()
  @IsString()
  userId?: string;
}

export class UpdateMemberStatusDto {
  @IsString()
  @IsIn(['pending', 'active', 'expired', 'suspended'])
  status: string;
}