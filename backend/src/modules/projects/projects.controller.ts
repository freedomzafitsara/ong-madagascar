// backend/src/modules/projects/projects.controller.ts

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
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../../entities/user.entity';
import { ProjectStatus } from '../../entities/project.entity';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async create(@Body() createDto: CreateProjectDto, @Request() req: any) {
    return this.projectsService.create(createDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: ProjectStatus,
    @Query('region') region?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.projectsService.findAll(parseInt(page), parseInt(limit), {
      status,
      region,
      category,
      search,
    });
  }

  @Get('featured')
  @Public()
  async findFeatured() {
    return this.projectsService.findFeatured();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async getStats() {
    return this.projectsService.getStats();
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProjectDto,
    @Request() req: any,
  ) {
    return this.projectsService.update(id, updateDto, req.user.id, req.user.role);
  }

  @Patch(':id/progress')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async updateProgress(
    @Param('id') id: string,
    @Body('progress') progress: number,
    @Request() req: any,
  ) {
    return this.projectsService.updateProgress(id, progress, req.user.id, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.projectsService.remove(id, req.user.id, req.user.role);
    return { success: true, message: 'Projet supprimé avec succès' };
  }
}