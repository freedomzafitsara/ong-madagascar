// backend/src/modules/jobs/jobs.controller.ts

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
import { JobsService } from './jobs.service';
import { CreateJobOfferDto, UpdateJobOfferDto, UpdateJobStatusDto, JobOfferQueryDto } from './dto/create-job-offer.dto';
import { CreateJobApplicationDto, UpdateApplicationStatusDto, JobApplicationQueryDto } from './dto/create-job-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // ============================================================
  // OFFRES D'EMPLOI - Routes publiques
  // ============================================================
  @Get('offers/public')
  @Public()
  async findPublicOffers(@Query() query: JobOfferQueryDto) {
    return this.jobsService.findPublished(query);
  }

  @Get('offers/featured')
  @Public()
  async findFeatured() {
    return this.jobsService.findFeatured();
  }

  @Get('offers/:id')
  @Public()
  async findOneOffer(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  // ============================================================
  // OFFRES D'EMPLOI - Routes admin
  // ============================================================
  @Post('offers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async createOffer(@Body() createDto: CreateJobOfferDto, @Request() req: any) {
    return this.jobsService.create(createDto, req.user.id);
  }

  @Get('offers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async findAllOffers(@Query() query: JobOfferQueryDto) {
    return this.jobsService.findAll(query);
  }

  @Get('offers/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async getStats() {
    return this.jobsService.getStats();
  }

  @Patch('offers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async updateOffer(@Param('id') id: string, @Body() updateDto: UpdateJobOfferDto) {
    return this.jobsService.update(id, updateDto);
  }

  @Patch('offers/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async updateOfferStatus(@Param('id') id: string, @Body() updateDto: UpdateJobStatusDto) {
    return this.jobsService.updateStatus(id, updateDto.is_published ? 'published' : 'draft');
  }

  @Delete('offers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async removeOffer(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }

  // ============================================================
  // CANDIDATURES - Routes publiques
  // ============================================================
  @Post('apply')
  @Public()
  async apply(@Body() createDto: CreateJobApplicationDto) {
    return this.jobsService.apply(createDto, null, null);
  }

  // ============================================================
  // CANDIDATURES - Routes admin
  // ============================================================
  @Get('applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async getAllApplications(@Query() query: JobApplicationQueryDto) {
    return this.jobsService.getAllApplications(query);
  }

  @Get('offers/:id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async getApplicationsByJob(@Param('id') id: string, @Query() query: JobApplicationQueryDto) {
    return this.jobsService.getApplicationsByJob(id, query);
  }

  @Get('applications/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async getApplicationStats() {
    return this.jobsService.getApplicationStats();
  }

  @Patch('applications/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateApplicationStatusDto,
    @Request() req: any,
  ) {
    return this.jobsService.updateApplicationStatus(id, updateDto, req.user.id);
  }

  @Get('applications/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async exportApplications(@Query('jobId') jobId?: string) {
    const csv = await this.jobsService.exportApplicationsToCSV(jobId);
    return { csv };
  }

  @Delete('applications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async deleteApplication(@Param('id') id: string) {
    return this.jobsService.deleteApplication(id);
  }
}
