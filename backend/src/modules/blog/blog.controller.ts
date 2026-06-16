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
import { UserRole } from '../auth/enums/roles.enum';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async create(@Body() createDto: CreateBlogPostDto, @Request() req: any) {
    return this.blogService.create(createDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('category_id') category_id?: string,
    @Query('search') search?: string,
  ) {
    return this.blogService.findAll(
      parseInt(page), 
      parseInt(limit), 
      {
        status,
        type,
        category_id,
        search,
      }
    );
  }

  @Get('public')
  @Public()
  async findPublic(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.blogService.findPublic(parseInt(page), parseInt(limit));
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getStats() {
    return this.blogService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @Get('public/slug/:slug')
  @Public()
  async findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @Get('public/:id')
  @Public()
  async findOnePublic(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateDto: UpdateBlogPostDto, @Request() req: any) {
    const cleanedDto = Object.fromEntries(
      Object.entries(updateDto).filter(([_, v]) => v !== undefined && v !== null)
    );
    
    if (Object.keys(cleanedDto).length === 0) {
      throw new BadRequestException('Aucune donnee a mettre a jour');
    }
    
    return this.blogService.update(id, cleanedDto as UpdateBlogPostDto, req.user.id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.blogService.updateStatus(id, status);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async publish(@Param('id') id: string) {
    return this.blogService.publish(id);
  }

  @Patch(':id/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async unpublish(@Param('id') id: string) {
    return this.blogService.unpublish(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    await this.blogService.remove(id);
    return { success: true, message: 'Article supprime avec succes' };
  }
}