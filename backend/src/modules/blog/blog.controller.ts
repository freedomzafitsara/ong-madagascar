// backend/src/modules/blog/blog.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/create-blog-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // ============================================================
  // CRÉER UN ARTICLE (Admin uniquement)
  // ============================================================
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async create(@Body() createDto: CreateBlogPostDto, @Request() req: any) {
    return this.blogService.create(createDto, req.user.id);
  }

  // ============================================================
  // LISTER TOUS LES ARTICLES (Admin)
  // ============================================================
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('is_published') is_published?: string,
    @Query('search') search?: string,
  ) {
    return this.blogService.findAll(
      parseInt(page), 
      parseInt(limit), 
      {
        status,
        type,
        is_published: is_published === 'true',
        search,
      }
    );
  }

  // ============================================================
  // LISTER LES ARTICLES PUBLIÉS (Public)
  // ============================================================
  @Get('public')
  @Public()
  async findPublic(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.blogService.findPublic(parseInt(page), parseInt(limit));
  }

  // ============================================================
  // STATISTIQUES (Admin)
  // ============================================================
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async getStats() {
    return this.blogService.getStats();
  }

  // ============================================================
  // TROUVER UN ARTICLE PAR ID (Admin)
  // ============================================================
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  // ============================================================
  // TROUVER UN ARTICLE PUBLIC PAR ID (Public)
  // ============================================================
  @Get('public/:id')
  @Public()
  async findOnePublic(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  // ============================================================
  // METTRE À JOUR UN ARTICLE (Admin)
  // ============================================================
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async update(@Param('id') id: string, @Body() updateDto: UpdateBlogPostDto, @Request() req: any) {
    // Nettoyer le DTO pour enlever les champs undefined
    const cleanedDto = Object.fromEntries(
      Object.entries(updateDto).filter(([_, v]) => v !== undefined && v !== null)
    );
    
    if (Object.keys(cleanedDto).length === 0) {
      throw new BadRequestException('Aucune donnee a mettre a jour');
    }
    
    return this.blogService.update(id, cleanedDto as UpdateBlogPostDto, req.user.id);
  }

  // ============================================================
  // PUBLIER/DÉPUBLIER UN ARTICLE (Admin)
  // ============================================================
  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async publish(@Param('id') id: string) {
    return this.blogService.updatePublishStatus(id, true);
  }

  @Patch(':id/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async unpublish(@Param('id') id: string) {
    return this.blogService.updatePublishStatus(id, false);
  }

  // ============================================================
  // SUPPRIMER UN ARTICLE (Admin uniquement)
  // ============================================================
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async remove(@Param('id') id: string) {
    await this.blogService.remove(id);
    return { success: true, message: 'Article supprime avec succes' };
  }
}
