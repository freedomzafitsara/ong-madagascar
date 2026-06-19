// backend/src/modules/pages/pages.controller.ts

import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Req, 
  Put,
  BadRequestException,
  Logger
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { UpdatePageContentDto } from './dto/update-page-content.dto';
import { UpdatePageBackgroundDto } from './dto/update-page-background.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../entities/user.entity';

@Controller('pages')
export class PagesController {
  private readonly logger = new Logger(PagesController.name);

  constructor(private readonly pagesService: PagesService) {}

  // ============================================================
  // ROUTES ADMIN - GESTION DES FONDS D'ECRAN
  // ============================================================

  // ✅ ROUTE SPECIFIQUE - DOIT ETRE EN PREMIER
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('backgrounds/all')
  async getAllBackgrounds(@Req() req: any) {
    this.logger.log(`Get all backgrounds by user: ${req.user.email}`);
    const result = await this.pagesService.getAllBackgrounds(req.user.role);
    this.logger.log(`Returning ${result.length} backgrounds`);
    return result;
  }

  // ✅ ROUTE ADMIN PAR PAGE
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('backgrounds/admin/:page')
  async getBackgroundAdmin(@Param('page') page: string, @Req() req: any) {
    this.logger.log(`Get background admin: ${page} by ${req.user.email}`);
    return this.pagesService.getBackgroundForAdmin(page, req.user.role);
  }

  // ✅ ROUTE ADMIN - MODIFICATION
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Put('backgrounds/:page')
  async updateBackground(
    @Param('page') page: string,
    @Body() updateDto: UpdatePageBackgroundDto,
    @Req() req: any,
  ) {
    this.logger.log(`Update background: ${page} by ${req.user.email}`);
    return this.pagesService.createOrUpdateBackground(
      page, 
      updateDto, 
      req.user.id, 
      req.user.role
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Put('backgrounds/:page/image')
  async updateBackgroundImage(
    @Param('page') page: string,
    @Body('imageUrl') imageUrl: string,
    @Req() req: any,
  ) {
    this.logger.log(`Update background image: ${page} by ${req.user.email}`);
    if (!imageUrl) {
      throw new BadRequestException('Le champ imageUrl est requis');
    }
    return this.pagesService.updateBackgroundImage(
      page, 
      imageUrl, 
      req.user.id, 
      req.user.role
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('backgrounds/:page/toggle')
  async toggleBackground(
    @Param('page') page: string,
    @Req() req: any,
  ) {
    this.logger.log(`Toggle background: ${page} by ${req.user.email}`);
    return this.pagesService.toggleBackgroundActive(page, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete('backgrounds/:id')
  async deleteBackground(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    this.logger.log(`Delete background: ${id} by ${req.user.email}`);
    return this.pagesService.deleteBackground(id, req.user.role);
  }

  // ============================================================
  // ROUTES PUBLIQUES
  // ============================================================

  // ✅ ROUTE PUBLIQUE GENERIQUE - EN DERNIER
  @Public()
  @Get('backgrounds/:page')
  async getBackground(@Param('page') page: string) {
    this.logger.log(`Get public background: ${page}`);
    return this.pagesService.getBackgroundByPage(page);
  }

  @Public()
  @Get('public/:page')
  async getPublicPage(@Param('page') page: string) {
    this.logger.log(`Get public page: ${page}`);
    return this.pagesService.getPageBySlug(page);
  }

  // ============================================================
  // ROUTES ADMIN - GESTION DU CONTENU
  // ============================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get()
  async getAllPages(@Req() req: any) {
    this.logger.log(`Get all pages by user: ${req.user.email}`);
    return this.pagesService.getAllPages(req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get(':page')
  async getPage(@Param('page') page: string, @Req() req: any) {
    this.logger.log(`Get page: ${page} by ${req.user.email}`);
    return this.pagesService.getPageForAdmin(page, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Put(':page')
  async updatePage(
    @Param('page') page: string,
    @Body() updateDto: UpdatePageContentDto,
    @Req() req: any,
  ) {
    this.logger.log(`Update page: ${page} by ${req.user.email}`);
    return this.pagesService.createOrUpdatePageContent(
      page, 
      updateDto, 
      req.user.id, 
      req.user.role
    );
  }

  // ============================================================
  // ROUTE D'INITIALISATION
  // ============================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('initialize')
  async initializePages(@Req() req: any) {
    this.logger.log(`Initialize pages by ${req.user.email}`);
    return this.pagesService.initializeDefaultPages(req.user.id, req.user.role);
  }
}