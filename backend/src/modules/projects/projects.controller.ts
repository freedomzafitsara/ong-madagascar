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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ============================================================
  // CRÉER UN PROJET (Admin uniquement)
  // ============================================================
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async create(@Body() createDto: CreateProjectDto) {
    return this.projectsService.create(createDto);
  }

  // ============================================================
  // LISTER TOUS LES PROJETS (Admin)
  // ============================================================
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async findAll(@Query() query: ProjectQueryDto) {
    return this.projectsService.findAll(query);
  }

  // ============================================================
  // LISTER LES PROJETS PUBLIÉS (Public)
  // ============================================================
  @Get('public')
  @Public()
  async findPublic(@Query() query: ProjectQueryDto) {
    return this.projectsService.findPublic(query);
  }

  // ============================================================
  // PROJETS À LA UNE (Public)
  // ============================================================
  @Get('featured')
  @Public()
  async findFeatured() {
    return this.projectsService.findFeatured();
  }

  // ============================================================
  // STATISTIQUES (Admin)
  // ============================================================
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async getStats() {
    return this.projectsService.getStats();
  }

  // ============================================================
  // TROUVER UN PROJET PAR ID (Public)
  // ============================================================
  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  // ============================================================
  // METTRE À JOUR UN PROJET (Admin)
  // ============================================================
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async update(@Param('id') id: string, @Body() updateDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateDto);
  }

  // ============================================================
  // CHANGER LE STATUT D'UN PROJET (Admin)
  // ============================================================
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.projectsService.updateStatus(id, status);
  }

  // ============================================================
  // SUPPRIMER UN PROJET (Super Admin uniquement)
  // ============================================================
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}