// backend/src/modules/donations/dto/create-donation.dto.ts

import { IsString, IsNumber, IsOptional, IsEmail, IsBoolean, IsEnum, Min } from 'class-validator';
import { PaymentProvider, DonationStatus, RecurringInterval } from '../../../entities/donation.entity';

export class CreateDonationDto {
  @IsNumber()
  @Min(100)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string = 'MGA';

  @IsEnum(PaymentProvider)
  payment_provider: PaymentProvider;

  @IsString()
  @IsOptional()
  phone_number?: string;

  @IsString()
  @IsOptional()
  donor_name?: string;

  @IsEmail()
  @IsOptional()
  donor_email?: string;

  @IsString()
  @IsOptional()
  donor_phone?: string;

  @IsString()
  @IsOptional()
  project_id?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsBoolean()
  @IsOptional()
  is_anonymous?: boolean;

  @IsBoolean()
  @IsOptional()
  is_recurring?: boolean;

  @IsEnum(RecurringInterval)
  @IsOptional()
  recurring_interval?: RecurringInterval;
}

export class UpdateDonationStatusDto {
  @IsEnum(DonationStatus)
  status: DonationStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}