// backend/src/modules/pages/dto/update-page-content.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreatePageContentDto } from './create-page-content.dto';
import { IsOptional, IsString, IsUUID, IsBoolean, IsObject } from 'class-validator';

export class UpdatePageContentDto extends PartialType(CreatePageContentDto) {
  @IsOptional()
  @IsUUID()
  updated_by?: string;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;
}