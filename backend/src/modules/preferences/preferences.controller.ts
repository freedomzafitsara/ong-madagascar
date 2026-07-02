// backend/src/modules/preferences/preferences.controller.ts

import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/preferences')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(private preferencesService: PreferencesService) {}

  @Get()
  async getPreferences(@Request() req) {
    const userId = req.user.id;
    return await this.preferencesService.getPreferences(userId);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async updatePreferences(
    @Request() req,
    @Body() dto: UpdatePreferencesDto,
  ) {
    const userId = req.user.id;
    return await this.preferencesService.updatePreferences(userId, dto);
  }
}