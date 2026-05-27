import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFiles, Res } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { CreateJobApplicationDto, UpdateApplicationStatusDto } from './dto/create-job-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UserRole } from '../../entities/user.entity';
import { Response } from 'express';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // ============================================================
  // SECTION 1 : ROUTES PUBLIQUES POUR LES OFFRES D EMPLOI
  // ============================================================

  @Public()
  @Get('offers')
  async findAllOffers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('jobType') jobType?: string,
    @Query('search') search?: string,
    @Query('region') region?: string,
  ) {
    return this.jobsService.findAll(parseInt(page), parseInt(limit), status, jobType, search, region);
  }

  @Public()
  @Get('offers/public')
  async findPublicOffers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '9',
    @Query('jobType') jobType?: string,
    @Query('region') region?: string,
  ) {
    return this.jobsService.findPublished(parseInt(page), parseInt(limit), jobType, region);
  }

  @Public()
  @Get('offers/featured')
  async findFeaturedOffers() {
    return this.jobsService.findFeatured();
  }

  @Public()
  @Get('offers/stats')
  async getStats() {
    return this.jobsService.getStats();
  }

  @Public()
  @Get('offers/:id')
  async findOneOffer(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  // ============================================================
  // SECTION 2 : ROUTES PROTEGEES POUR LA GESTION DES OFFRES
  // ============================================================

  @Post('offers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF, UserRole.PARTNER)
  async createOffer(@Body() createDto: CreateJobOfferDto, @CurrentUser() user: any) {
    return this.jobsService.create(createDto, user.id);
  }

  @Patch('offers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF, UserRole.PARTNER)
  async updateOffer(@Param('id') id: string, @Body() updateDto: UpdateJobOfferDto) {
    return this.jobsService.update(id, updateDto);
  }

  @Patch('offers/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF, UserRole.PARTNER)
  async updateOfferStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateJobStatusDto) {
    return this.jobsService.updateStatus(id, updateStatusDto.status);
  }

  @Delete('offers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async removeOffer(@Param('id') id: string) {
    await this.jobsService.remove(id);
    return { success: true, message: 'Offre supprimee avec succes' };
  }

  // ============================================================
  // SECTION 3 : ROUTES PUBLIQUES POUR DEPOSER UNE CANDIDATURE
  // ============================================================

  @Public()
  @Post('apply')
  @UseInterceptors(FilesInterceptor('files'))
  async apply(@Body() createDto: CreateJobApplicationDto, @UploadedFiles() files: any) {
    return this.jobsService.apply(createDto, files);
  }

  @Post('apply/auth')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async applyAuth(@Body() createDto: CreateJobApplicationDto, @UploadedFiles() files: any, @CurrentUser() user: any) {
    return this.jobsService.apply(createDto, files, user.id);
  }

  // ============================================================
  // SECTION 4 : ROUTES ADMIN POUR LES CANDIDATURES
  // ⚠️ L'ORDRE EST IMPORTANT : LES ROUTES SPECIFIQUES AVANT :id
  // ============================================================

  // 1. Route specifique "all" - DOIT ETRE AVANT :id
  @Get('applications/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async getAllApplications(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
  ) {
    return this.jobsService.getAllApplications(parseInt(page), parseInt(limit), status);
  }

  // 2. Route specifique "my" - DOIT ETRE AVANT :id
  @Get('applications/my')
  @UseGuards(JwtAuthGuard)
  async getMyApplications(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.jobsService.getUserApplications(user.id, parseInt(page), parseInt(limit));
  }

  // 3. Route specifique "export" - DOIT ETRE AVANT :id
  @Get('applications/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async exportApplications(@Res() res: Response) {
    const csv = await this.jobsService.exportApplicationsToCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=candidatures_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  }

  // 4. Route specifique "stats" - DOIT ETRE AVANT :id
  @Get('applications/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async getApplicationStats() {
    return this.jobsService.getApplicationStats();
  }

  // 5. Route generique :id - DOIT ETRE APRES les routes specifiques
  @Get('applications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async getApplication(@Param('id') id: string) {
    return this.jobsService.getApplication(id);
  }

  // 6. Route pour modifier le statut
  @Patch('applications/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateApplicationStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.jobsService.updateApplicationStatus(id, updateDto, user.id);
  }

  // 7. Route pour supprimer une candidature
  @Delete('applications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async deleteApplication(@Param('id') id: string) {
    await this.jobsService.deleteApplication(id);
    return { success: true, message: 'Candidature supprimee avec succes' };
  }

  // 8. Route pour lister les candidatures d'une offre
  @Get('offers/:id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async getApplicationsByJob(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
  ) {
    return this.jobsService.getApplicationsByJob(id, parseInt(page), parseInt(limit), status);
  }
}