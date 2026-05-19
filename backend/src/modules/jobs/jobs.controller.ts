import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
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

enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  STAFF = 'staff',
  PARTNER = 'partner',
}

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // ============================================================
  // OFFRES D'EMPLOI
  // ============================================================

  @Post('offers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF, UserRole.PARTNER)
  async createOffer(@Body() createDto: CreateJobOfferDto, @CurrentUser() user: any) {
    return this.jobsService.create(createDto, user.id);
  }

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
    return { success: true, message: 'Offre supprimée avec succès' };
  }

  // ============================================================
  // CANDIDATURES
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

  @Get('applications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async getApplication(@Param('id') id: string) {
    return this.jobsService.getApplication(id);
  }

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

  @Get('applications/my')
  @UseGuards(JwtAuthGuard)
  async getMyApplications(@CurrentUser() user: any, @Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    return this.jobsService.getUserApplications(user.id, parseInt(page), parseInt(limit));
  }

  @Get('applications/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async getAllApplications(@Query('page') page: string = '1', @Query('limit') limit: string = '10', @Query('status') status?: string) {
    return this.jobsService.getAllApplications(parseInt(page), parseInt(limit), status);
  }
}