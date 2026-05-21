import { IsString, IsOptional, IsBoolean, IsNumber, IsDate, IsEnum, IsArray, Min, Max, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType, EventStatus } from '../../../entities/event.entity';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @Length(5, 255)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(5, 255)
  title_mg?: string;

  @IsOptional()
  @IsString()
  @Length(20, 5000)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(20, 5000)
  description_mg?: string;

  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsString()
  @Length(3, 255)
  location?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  region?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxCapacity?: number;

  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  program?: string;

  @IsOptional()
  @IsString()
  speakers?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryImages?: string[];
}