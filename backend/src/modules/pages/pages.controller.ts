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
  NotFoundException,
  BadRequestException,
  Logger
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { UpdatePageContentDto } from './dto/create-page-content.dto';
import { UpdatePageBackgroundDto } from './dto/create-page-background.dto';
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
  // ROUTES PUBLIQUES
  // ============================================================

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
  // ROUTES ADMIN
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
  @Get('backgrounds/all')
  async getAllBackgrounds(@Req() req: any) {
    this.logger.log(`Get all backgrounds by user: ${req.user.email}`);
    return this.pagesService.getAllBackgrounds(req.user.role);
  }

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
  @Roles(UserRole.SUPER_ADMIN)
  @Post('initialize')
  async initializePages(@Req() req: any) {
    this.logger.log(`Initialize pages by ${req.user.email}`);
    return this.pagesService.initializeDefaultPages(req.user.id, req.user.role);
  }
}