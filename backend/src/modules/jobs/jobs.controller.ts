import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobOfferDto, UpdateJobOfferDto, UpdateJobStatusDto } from './dto/job-offer.dto';
import { CreateJobApplicationDto, UpdateApplicationStatusDto } from './dto/job-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../../entities/user.entity';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // ==================== OFFRES D'EMPLOI (PUBLIC) ====================

  @Public()
  @Get('offers')
  async findAllOffers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('jobType') jobType?: string,
    @Query('sector') sector?: string,
    @Query('region') region?: string,
    @Query('search') search?: string,
  ) {
    return this.jobsService.findAllJobOffers(page, limit, jobType, sector, region, search);
  }

  @Public()
  @Get('offers/featured')
  async findFeaturedOffers() {
    return this.jobsService.findFeaturedJobOffers();
  }

  @Public()
  @Get('offers/:id')
  async findOfferById(@Param('id') id: string) {
    return this.jobsService.findJobOfferById(id);
  }

  // ==================== OFFRES D'EMPLOI (ADMIN) ====================

  @Post('offers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.PARTNER)
  async createJobOffer(@Body() createJobOfferDto: CreateJobOfferDto, @CurrentUser() user: any) {
    return this.jobsService.createJobOffer(createJobOfferDto, user.id);
  }

  @Put('offers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateJobOffer(@Param('id') id: string, @Body() updateJobOfferDto: UpdateJobOfferDto) {
    return this.jobsService.updateJobOffer(id, updateJobOfferDto);
  }

  @Put('offers/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateJobOfferStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateJobStatusDto) {
    return this.jobsService.updateJobOfferStatus(id, updateStatusDto.status);
  }

  @Delete('offers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async deleteJobOffer(@Param('id') id: string) {
    return this.jobsService.deleteJobOffer(id);
  }

  @Get('offers/stats/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getJobOffersStats() {
    return this.jobsService.getJobOffersStats();
  }

  // ==================== CANDIDATURES ====================

  @Public()
  @Post('apply')
  @UseInterceptors(FilesInterceptor('files'))
  async applyToJob(
    @Body() createApplicationDto: CreateJobApplicationDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const cvFile = files?.find(f => f.fieldname === 'cv');
    const photoFile = files?.find(f => f.fieldname === 'photo');
    const diplomaFile = files?.find(f => f.fieldname === 'diploma');
    
    return this.jobsService.applyToJob(createApplicationDto, null, cvFile, photoFile, diplomaFile);
  }

  @Post('apply/auth')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async applyToJobAuth(
    @Body() createApplicationDto: CreateJobApplicationDto,
    @CurrentUser() user: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const cvFile = files?.find(f => f.fieldname === 'cv');
    const photoFile = files?.find(f => f.fieldname === 'photo');
    const diplomaFile = files?.find(f => f.fieldname === 'diploma');
    
    return this.jobsService.applyToJob(createApplicationDto, user.id, cvFile, photoFile, diplomaFile);
  }

  @Get('applications/my')
  @UseGuards(JwtAuthGuard)
  async getMyApplications(@CurrentUser() user: any, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.jobsService.getUserApplications(user.id, page, limit);
  }

  @Get('offers/:id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getJobApplications(@Param('id') id: string, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.jobsService.getApplicationsByJob(id, page, limit);
  }

  @Get('applications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getApplicationById(@Param('id') id: string) {
    return this.jobsService.getApplicationById(id);
  }

  @Put('applications/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateApplicationStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateApplicationStatusDto) {
    return this.jobsService.updateApplicationStatus(id, updateStatusDto.status);
  }

  @Get('applications/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getAllApplications(@Query('page') page: number = 1, @Query('limit') limit: number = 10, @Query('status') status?: string) {
    return this.jobsService.getAllApplications(page, limit, status);
  }
}