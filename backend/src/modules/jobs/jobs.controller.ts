import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { JobsService } from './jobs.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';
import { CreateJobApplicationDto, UpdateApplicationStatusDto } from './dto/create-job-application.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Contrôleur pour la gestion des offres d'emploi et des candidatures
 * @description API REST pour les opérations CRUD sur les offres et candidatures
 */
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // ============================================================
  // ROUTES SPÉCIFIQUES (doivent être avant les routes avec :id)
  // ============================================================
  
  /**
   * Récupère les offres d'emploi publiées (front-office)
   */
  @Get('offers/public')
  async findPublic(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.jobsService.findPublished({ page, limit });
  }

  /**
   * Récupère les offres d'emploi à la une
   */
  @Get('offers/featured')
  async findFeatured() {
    return this.jobsService.findFeatured();
  }

  /**
   * Récupère les statistiques des offres d'emploi
   */
  @Get('offers/stats')
  async getStats() {
    return this.jobsService.getStats();
  }

  /**
   * Exporte les candidatures au format CSV
   * ⚠️ DOIT être AVANT @Get('applications/:id')
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Get('applications/export')
  async exportApplications(
    @Query('jobId') jobId: string,
    @Res() res: Response
  ) {
    const csv = await this.jobsService.exportApplicationsToCSV(jobId);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=candidatures_${new Date().toISOString().split('T')[0]}.csv`);
    res.setHeader('Content-Length', Buffer.byteLength(csv));
    
    return res.send(csv);
  }

  // ============================================================
  // ROUTES CRUD OFFRES (Back-office)
  // ============================================================

  /**
   * Crée une nouvelle offre d'emploi
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Post('offers')
  async create(@Body() createJobOfferDto: CreateJobOfferDto) {
    return this.jobsService.create(createJobOfferDto);
  }

  /**
   * Récupère toutes les offres d'emploi (back-office avec filtres)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Get('offers')
  async findAll(
    @Query('page') page = 1, 
    @Query('limit') limit = 10, 
    @Query('status') status?: string,
    @Query('contract_type') contractType?: string,
    @Query('search') search?: string
  ) {
    return this.jobsService.findAll({ page, limit, status, contract_type: contractType, search });
  }

  /**
   * Récupère une offre d'emploi par son ID
   * ⚠️ Route dynamique - DOIT être APRÈS les routes spécifiques
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Get('offers/:id')
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  /**
   * Met à jour une offre d'emploi
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Patch('offers/:id')
  async update(@Param('id') id: string, @Body() updateJobOfferDto: UpdateJobOfferDto) {
    return this.jobsService.update(id, updateJobOfferDto);
  }

  /**
   * Met à jour le statut d'une offre d'emploi
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Patch('offers/:id/status')
  async updateStatus(@Param('id') id: string, @Body() updateJobStatusDto: UpdateJobStatusDto) {
    return this.jobsService.updateStatus(id, updateJobStatusDto);
  }

  /**
   * Supprime une offre d'emploi
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Delete('offers/:id')
  async remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }

  // ============================================================
  // ROUTES CANDIDATURES
  // ============================================================

  /**
   * Soumet une nouvelle candidature (accès public)
   */
  @Post('apply')
  async apply(@Body() createJobApplicationDto: CreateJobApplicationDto) {
    return this.jobsService.apply(createJobApplicationDto);
  }

  /**
   * Récupère toutes les candidatures (back-office)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Get('applications')
  async getAllApplications(
    @Query('page') page = 1, 
    @Query('limit') limit = 10, 
    @Query('status') status?: string,
    @Query('job_offer_id') jobOfferId?: string
  ) {
    return this.jobsService.getAllApplications({ page, limit, status, job_offer_id: jobOfferId });
  }

  /**
   * Récupère les statistiques des candidatures
   * ⚠️ DOIT être AVANT @Get('applications/:id')
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Get('applications/stats')
  async getApplicationStats() {
    return this.jobsService.getApplicationStats();
  }

  /**
   * Récupère les candidatures pour une offre spécifique
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Get('offers/:id/applications')
  async getApplicationsByJob(
    @Param('id') id: string, 
    @Query('page') page = 1, 
    @Query('limit') limit = 10
  ) {
    return this.jobsService.getApplicationsByJob(id, { page, limit });
  }

  /**
   * Met à jour le statut d'une candidature
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Patch('applications/:id/status')
  async updateApplicationStatus(
    @Param('id') id: string, 
    @Body() updateDto: UpdateApplicationStatusDto
  ) {
    return this.jobsService.updateApplicationStatus(id, updateDto);
  }

  /**
   * Supprime une candidature
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Delete('applications/:id')
  async removeApplication(@Param('id') id: string) {
    return this.jobsService.deleteApplication(id);
  }
}