// backend/src/modules/jobs/jobs.controller.ts

import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Query, 
  Res, 
  UploadedFile, 
  UseInterceptors,
  Put
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobsService } from './jobs.service';
import { CreateJobOfferDto, UpdateJobOfferDto, JobOfferQueryDto } from './dto/job-offer.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { 
  CreateJobApplicationDto, 
  UpdateApplicationStatusDto, 
  ApplicationQueryDto 
} from './dto/application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UploadService } from '../upload/upload.service';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly uploadService: UploadService,
  ) {}

  // ============================================================
  // ROUTES PUBLIQUES
  // ============================================================

  @Get('offers/public')
  async findPublic(@Query() queryDto: JobOfferQueryDto) {
    return this.jobsService.findPublished(queryDto);
  }

  @Get('offers/featured')
  async findFeatured() {
    return this.jobsService.findFeatured();
  }

  @Get('offers/stats')
  async getStats() {
    return this.jobsService.getStats();
  }

  // ============================================================
  // ROUTES ADMIN - OFFRES
  // ============================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Post('offers')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createJobOfferDto: CreateJobOfferDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const job = await this.jobsService.create(createJobOfferDto);
    
    if (file) {
      const image = await this.uploadService.uploadImage(
        file,
        'job',
        job.id,
        true,
        0,
      );
      
      await this.jobsService.updateImageUrl(job.id, this.uploadService.getImageUrl(image.id));
      await this.jobsService.updateMainImage(job.id, image.id);
      
      return {
        ...job,
        imageUrl: this.uploadService.getImageUrl(image.id),
        imageId: image.id,
      };
    }
    
    return job;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Post('offers/:id/upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadOfferImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('isMain') isMain?: string,
  ) {
    const job = await this.jobsService.findOne(id);
    if (!job) {
      throw new Error('Offre non trouvee');
    }
    
    const isMainImage = isMain === 'true';
    
    const image = await this.uploadService.uploadImage(
      file,
      'job',
      id,
      isMainImage,
      0,
    );
    
    if (isMainImage) {
      await this.jobsService.updateImageUrl(id, this.uploadService.getImageUrl(image.id));
      await this.jobsService.updateMainImage(id, image.id);
    }
    
    return {
      success: true,
      image: {
        id: image.id,
        url: this.uploadService.getImageUrl(image.id),
        isMain: image.isMain,
        fileName: image.fileName,
      },
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Get('offers')
  async findAll(@Query() queryDto: JobOfferQueryDto) {
    const result = await this.jobsService.findAll(queryDto);
    
    const enrichedData = await Promise.all(
      result.data.map(async (job) => {
        let imageUrl = null;
        let imageId = null;
        
        if (job.main_image_id) {
          try {
            const image = await this.uploadService.getImageById(job.main_image_id);
            imageUrl = this.uploadService.getImageUrl(image.id);
            imageId = image.id;
          } catch (error) {
            // Ignorer
          }
        }
        
        return {
          ...job,
          imageUrl,
          imageId,
        };
      })
    );
    
    return {
      ...result,
      data: enrichedData,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Get('offers/:id')
  async findOne(@Param('id') id: string) {
    const job = await this.jobsService.findOne(id);
    
    const images = await this.uploadService.getImagesByEntity('job', id);
    
    return {
      ...job,
      images: images.map(img => ({
        id: img.id,
        url: this.uploadService.getImageUrl(img.id),
        isMain: img.isMain,
        fileName: img.fileName,
        fileSize: img.fileSize,
        mimeType: img.mimeType,
      })),
      mainImageUrl: job.main_image_id ? this.uploadService.getImageUrl(job.main_image_id) : null,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Patch('offers/:id')
  async update(@Param('id') id: string, @Body() updateJobOfferDto: UpdateJobOfferDto) {
    return this.jobsService.update(id, updateJobOfferDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Patch('offers/:id/status')
  async updateStatus(@Param('id') id: string, @Body() updateJobStatusDto: UpdateJobStatusDto) {
    return this.jobsService.updateStatus(id, updateJobStatusDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Delete('offers/:id')
  async remove(@Param('id') id: string) {
    await this.uploadService.deleteImagesByEntity('job', id);
    return this.jobsService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Delete('offers/:id/images/:imageId')
  async removeImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    await this.uploadService.deleteImage(imageId);
    return { success: true, message: 'Image supprimee avec succes' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Put('offers/:id/images/:imageId/main')
  async setMainImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    const image = await this.uploadService.setMainImage(imageId, 'job', id);
    await this.jobsService.updateMainImage(id, imageId);
    await this.jobsService.updateImageUrl(id, this.uploadService.getImageUrl(imageId));
    
    return {
      success: true,
      image: {
        id: image.id,
        url: this.uploadService.getImageUrl(image.id),
        isMain: image.isMain,
      },
    };
  }

  // ============================================================
  // ROUTES CANDIDATURES
  // ============================================================

  @Post('apply')
  async apply(@Body() createJobApplicationDto: CreateJobApplicationDto) {
    return this.jobsService.apply(createJobApplicationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Get('applications')
  async getAllApplications(@Query() queryDto: ApplicationQueryDto) {
    return this.jobsService.getAllApplications(queryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Get('applications/stats')
  async getApplicationStats() {
    return this.jobsService.getApplicationStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Get('offers/:id/applications')
  async getApplicationsByJob(
    @Param('id') id: string, 
    @Query() queryDto: ApplicationQueryDto
  ) {
    return this.jobsService.getApplicationsByJob(id, queryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Patch('applications/:id/status')
  async updateApplicationStatus(
    @Param('id') id: string, 
    @Body() updateDto: UpdateApplicationStatusDto
  ) {
    return this.jobsService.updateApplicationStatus(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Delete('applications/:id')
  async removeApplication(@Param('id') id: string) {
    return this.jobsService.deleteApplication(id);
  }

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
    
    return res.send(csv);
  }
}