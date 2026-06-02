import { Controller, Get, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { LanguageService } from './language.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get()
  async getAll() {
    return this.languageService.getAllTranslations();
  }

  @Get(':key')
  async getOne(@Param('key') key: string) {
    return this.languageService.getTranslation(key);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrUpdate(
    @Body() body: { key: string; value_fr: string; value_mg: string },
  ) {
    return this.languageService.createOrUpdate(body.key, body.value_fr, body.value_mg);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':key')
  async delete(@Param('key') key: string) {
    return this.languageService.deleteTranslation(key);
  }
}
