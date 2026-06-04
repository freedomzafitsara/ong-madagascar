// backend/src/modules/language/language.controller.ts

import { Controller, Get, Post, Body, Delete, Param, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { LanguageService } from './language.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  // ============================================================
  // ROUTES PUBLIQUES
  // ============================================================

  /**
   * Récupère toutes les traductions (public)
   */
  @Public()
  @Get()
  async getAll() {
    return this.languageService.getAllTranslations();
  }

  /**
   * Récupère les traductions par locale (FR ou MG)
   */
  @Public()
  @Get('locale/:locale')
  async getByLocale(@Param('locale') locale: string) {
    return this.languageService.getTranslationsByLocale(locale);
  }

  /**
   * Récupère une traduction spécifique par sa clé (public)
   */
  @Public()
  @Get(':key')
  async getOne(@Param('key') key: string) {
    return this.languageService.getTranslation(key);
  }

  /**
   * Exporte toutes les traductions en JSON (public)
   */
  @Public()
  @Get('export/json')
  async exportTranslations() {
    return this.languageService.exportTranslations();
  }

  // ============================================================
  // ROUTES ADMIN (authentification requise)
  // ============================================================

  /**
   * Crée ou met à jour une traduction (admin uniquement)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrUpdate(
    @Body() body: { key: string; value_fr: string; value_mg: string },
  ) {
    return this.languageService.createOrUpdate(body.key, body.value_fr, body.value_mg);
  }

  /**
   * Met à jour uniquement la version française
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Post(':key/fr')
  async updateFrench(
    @Param('key') key: string,
    @Body('value') value: string,
  ) {
    return this.languageService.updateFrench(key, value);
  }

  /**
   * Met à jour uniquement la version malgache
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Post(':key/mg')
  async updateMalagasy(
    @Param('key') key: string,
    @Body('value') value: string,
  ) {
    return this.languageService.updateMalagasy(key, value);
  }

  /**
   * Importe des traductions depuis un fichier JSON
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Post('import')
  async importTranslations(
    @Body() body: { fr: Record<string, string>; mg: Record<string, string> },
  ) {
    return this.languageService.importTranslations(body);
  }

  /**
   * Supprime une traduction (admin uniquement)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Delete(':key')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('key') key: string) {
    return this.languageService.deleteTranslation(key);
  }

  /**
   * Supprime toutes les traductions (super admin uniquement)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Delete('all/clear')
  @HttpCode(HttpStatus.OK)
  async deleteAll() {
    return this.languageService.deleteAllTranslations();
  }

  /**
   * Compte le nombre de traductions (admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Get('stats/count')
  async count() {
    const count = await this.languageService.countTranslations();
    return { count };
  }
}