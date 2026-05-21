import { IsString, IsOptional, IsBoolean, IsNumber, IsDate, IsEnum, Min, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType, EventStatus } from '../../../entities/event.entity';

export class CreateEventDto {
  @IsString()
  @Length(5, 255)
  title: string;

  @IsOptional()
  @IsString()
  @Length(5, 255)
  title_mg?: string;

  @IsString()
  @Length(20, 5000)
  description: string;

  @IsOptional()
  @IsString()
  @Length(20, 5000)
  description_mg?: string;

  @IsEnum(EventType)
  type: EventType;

  @IsString()
  @Length(3, 255)
  location: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  region?: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsNumber()
  @Min(0)
  maxCapacity: number;

  @IsBoolean()
  isFree: boolean;

  @IsNumber()
  @Min(0)
  price: number;

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
  @IsEnum(EventStatus)
  status?: EventStatus;
}