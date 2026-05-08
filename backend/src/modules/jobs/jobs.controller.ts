import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JobStatus } from '../../entities/job-offer.entity';
import { ApplicationStatus } from '../../entities/job-application.entity';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

@Controller('jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // ========== OFFRES D'EMPLOI ==========

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF, UserRole.PARTNER)
  @Post('offers')
  async createOffer(@Body() createDto: CreateJobOfferDto, @Req() req: RequestWithUser) {
    return this.jobsService.createOffer(createDto, req.user.sub);
  }

  @Public()
  @Get('offers')
  async findAllOffers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('jobType') jobType?: string,
    @Query('sector') sector?: string,
    @Query('region') region?: string,
    @Query('search') search?: string,
  ) {
    return this.jobsService.findAllOffers(parseInt(page), parseInt(limit), status, jobType, sector, region, search);
  }

  @Public()
  @Get('offers/featured')
  async getFeaturedOffers() {
    return this.jobsService.getFeaturedOffers();
  }

  @Public()
  @Get('offers/stats')
  async getStats() {
    return this.jobsService.getStats();
  }

  @Public()
  @Get('offers/:id')
  async findOneOffer(@Param('id') id: string) {
    return this.jobsService.findOneOffer(id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF, UserRole.PARTNER)
  @Patch('offers/:id')
  async updateOffer(
    @Param('id') id: string,
    @Body() updateDto: UpdateJobOfferDto,
    @Req() req: RequestWithUser,
  ) {
    return this.jobsService.updateOffer(id, updateDto, req.user.role, req.user.sub);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch('offers/:id/status')
  async updateOfferStatus(
    @Param('id') id: string,
    @Body('status') status: JobStatus,
    @Req() req: RequestWithUser,
  ) {
    return this.jobsService.updateOfferStatus(id, status, req.user.role);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete('offers/:id')
  async deleteOffer(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.jobsService.deleteOffer(id, req.user.role);
  }

  // ========== CANDIDATURES ==========

  @Public()
  @Post('apply')
  async apply(@Body() createDto: CreateJobApplicationDto) {
    return this.jobsService.apply(createDto);
  }

  @Post('apply/auth')
  async applyAuth(@Body() createDto: CreateJobApplicationDto, @Req() req: RequestWithUser) {
    return this.jobsService.apply(createDto, req.user.sub);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  @Get('offers/:id/applications')
  async getApplicationsByOffer(@Param('id') id: string) {
    return this.jobsService.getApplicationsByOffer(id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  @Get('applications/:id')
  async getApplicationById(@Param('id') id: string) {
    return this.jobsService.getApplicationById(id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  @Patch('applications/:id/status')
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body('status') status: ApplicationStatus,
    @Req() req: RequestWithUser,
  ) {
    return this.jobsService.updateApplicationStatus(id, status, req.user.role);
  }

  @Get('applications/my')
  async getMyApplications(@Req() req: RequestWithUser) {
    return this.jobsService.getMyApplications(req.user.sub);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('applications/all')
  async getAllApplications() {
    return this.jobsService.getApplicationsByOffer('');
  }
}