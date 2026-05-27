// backend/src/modules/reports/dto/create-report.dto.ts

import { IsString, IsEnum, IsOptional, IsDateString, IsObject } from 'class-validator';

export type ReportType = 'activity' | 'financial' | 'impact' | 'beneficiaries' | 'volunteers' | 'jobs' | 'donations';
export type ReportPeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';

export class CreateReportDto {
  @IsEnum(['activity', 'financial', 'impact', 'beneficiaries', 'volunteers', 'jobs', 'donations'])
  type: ReportType;

  @IsString()
  title: string;

  @IsEnum(['week', 'month', 'quarter', 'year', 'all'])
  @IsOptional()
  period?: ReportPeriod;

  @IsDateString()
  @IsOptional()
  period_start?: string;

  @IsDateString()
  @IsOptional()
  period_end?: string;

  @IsObject()
  @IsOptional()
  data?: any;

  @IsObject()
  @IsOptional()
  stats?: any;

  @IsString()
  @IsOptional()
  file_url?: string;
}