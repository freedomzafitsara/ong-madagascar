// backend/src/modules/preferences/dto/update-preferences.dto.ts

import { IsBoolean, IsOptional, IsString, IsIn } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsString()
  @IsIn(['fr', 'mg'])
  language?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  @IsIn(['light', 'dark', 'system'])
  theme?: string;

  @IsOptional()
  @IsString()
  @IsIn(['small', 'medium', 'large'])
  font_size?: string;

  @IsOptional()
  @IsBoolean()
  sidebar_collapsed?: boolean;

  @IsOptional()
  @IsBoolean()
  animations_enabled?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['compact', 'comfortable', 'spacious'])
  density?: string;

  @IsOptional()
  @IsBoolean()
  email_notifications?: boolean;

  @IsOptional()
  @IsBoolean()
  push_notifications?: boolean;

  @IsOptional()
  @IsBoolean()
  job_alerts?: boolean;

  @IsOptional()
  @IsBoolean()
  project_updates?: boolean;

  @IsOptional()
  @IsBoolean()
  blog_updates?: boolean;

  @IsOptional()
  @IsBoolean()
  system_updates?: boolean;
}