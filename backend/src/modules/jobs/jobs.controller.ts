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
  Put,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException
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
import { Public } from '../auth/decorators/public.decorator';
import { UploadService } from '../upload/upload.service';
import { memoryStorage } from 'multer';
import { UserRole } from '../auth/entities/user.entity';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly uploadService: UploadService,
  ) {}

  // ============================================================
  // ROUTES PUBLIQUES
  // ============================================================

  @Public()
  @Get('offers/public')
  async findPublic(@Query() queryDto: JobOfferQueryDto) {
    return this.jobsService.findPublished(queryDto);
  }

  @Public()
  @Get('offers/featured')
  async findFeatured() {
    return this.jobsService.findFeatured();
  }

  // ============================================================
  // ROUTES ADMIN - OFFRES
  // ============================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('offers/stats')
  async getStats() {
    return this.jobsService.getStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post('offers')
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 },
  }))
  async create(
    @Body() createJobOfferDto: CreateJobOfferDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const job = await this.jobsService.create(createJobOfferDto);
    
    if (file) {
      try {
        const uploadedFile = await this.uploadService.uploadFile(
          file,
          'job',
          job.id,
        );
        
        const baseUrl = process.env.API_URL || 'http://localhost:4001';
        const imageUrl = `${baseUrl}${this.uploadService.getImageUrl(uploadedFile.id)}`;
        
        await this.jobsService.updateImageUrl(job.id, imageUrl);
        await this.jobsService.updateMainImage(job.id, uploadedFile.id);
        
        return {
          ...job,
          imageUrl,
          imageId: uploadedFile.id,
        };
      } catch (error) {
        return job;
      }
    }
    
    return job;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post('offers/:id/upload-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 },
  }))
  async uploadOfferImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    
    const job = await this.jobsService.findOne(id);
    if (!job) {
      throw new NotFoundException('Offre non trouvee');
    }
    
    const uploadedFile = await this.uploadService.uploadFile(
      file,
      'job',
      id,
    );
    
    const baseUrl = process.env.API_URL || 'http://localhost:4001';
    const imageUrl = `${baseUrl}${this.uploadService.getImageUrl(uploadedFile.id)}`;
    
    await this.jobsService.updateImageUrl(id, imageUrl);
    await this.jobsService.updateMainImage(id, uploadedFile.id);
    
    return {
      success: true,
      image: {
        id: uploadedFile.id,
        url: imageUrl,
        fileName: uploadedFile.filename,
        originalName: uploadedFile.originalName,
        fileSize: uploadedFile.size,
        format: uploadedFile.format,
      },
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('offers')
  async findAll(@Query() queryDto: JobOfferQueryDto) {
    const result = await this.jobsService.findAll(queryDto);
    
    const enrichedData = await Promise.all(
      result.data.map(async (job) => {
        let imageUrl = null;
        let imageId = null;
        
        if (job.main_image_id) {
          try {
            const file = await this.uploadService.getFileById(job.main_image_id);
            const baseUrl = process.env.API_URL || 'http://localhost:4001';
            imageUrl = `${baseUrl}${this.uploadService.getImageUrl(file.id)}`;
            imageId = file.id;
          } catch (error) {
            // Ignorer l'erreur
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
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('offers/:id')
  async findOne(@Param('id') id: string) {
    const job = await this.jobsService.findOne(id);
    
    let mainImageUrl = null;
    let images = [];
    const baseUrl = process.env.API_URL || 'http://localhost:4001';
    
    if (job.main_image_id) {
      try {
        const file = await this.uploadService.getFileById(job.main_image_id);
        mainImageUrl = `${baseUrl}${this.uploadService.getImageUrl(file.id)}`;
        images.push({
          id: file.id,
          url: mainImageUrl,
          fileName: file.filename,
          originalName: file.originalName,
          fileSize: file.size,
          format: file.format,
          isMain: true,
        });
      } catch (error) {
        // Ignorer
      }
    }
    
    try {
      const otherFiles = await this.uploadService.getFilesByEntity('job', id);
      for (const file of otherFiles) {
        if (file.id !== job.main_image_id) {
          images.push({
            id: file.id,
            url: `${baseUrl}${this.uploadService.getImageUrl(file.id)}`,
            fileName: file.filename,
            originalName: file.originalName,
            fileSize: file.size,
            format: file.format,
            isMain: false,
          });
        }
      }
    } catch (error) {
      // Ignorer
    }
    
    return {
      ...job,
      mainImageUrl,
      images,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch('offers/:id')
  async update(@Param('id') id: string, @Body() updateJobOfferDto: UpdateJobOfferDto) {
    return this.jobsService.update(id, updateJobOfferDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch('offers/:id/status')
  async updateStatus(@Param('id') id: string, @Body() updateJobStatusDto: UpdateJobStatusDto) {
    return this.jobsService.updateStatus(id, updateJobStatusDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete('offers/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.uploadService.deleteFilesByEntity('job', id);
    await this.jobsService.remove(id);
    return { success: true, message: 'Offre supprimee avec succes' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete('offers/:id/images/:imageId')
  async removeImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    await this.uploadService.deleteFile(imageId);
    return { success: true, message: 'Image supprimee avec succes' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Put('offers/:id/images/:imageId/main')
  async setMainImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    const file = await this.uploadService.getFileById(imageId);
    const baseUrl = process.env.API_URL || 'http://localhost:4001';
    const imageUrl = `${baseUrl}${this.uploadService.getImageUrl(imageId)}`;
    
    await this.jobsService.updateMainImage(id, imageId);
    await this.jobsService.updateImageUrl(id, imageUrl);
    
    return {
      success: true,
      image: {
        id: file.id,
        url: imageUrl,
        fileName: file.filename,
        isMain: true,
      },
    };
  }

  // ============================================================
  // ROUTES CANDIDATURES (PUBLIC)
  // ============================================================

  @Public()
  @Post('apply')
  async apply(@Body() createJobApplicationDto: CreateJobApplicationDto) {
    return this.jobsService.apply(createJobApplicationDto);
  }

  // ============================================================
  // ROUTES CANDIDATURES (ADMIN)
  // ============================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('applications')
  async getAllApplications(@Query() queryDto: ApplicationQueryDto) {
    return this.jobsService.getAllApplications(queryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('applications/stats')
  async getApplicationStats() {
    return this.jobsService.getApplicationStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('offers/:id/applications')
  async getApplicationsByJob(
    @Param('id') id: string, 
    @Query() queryDto: ApplicationQueryDto
  ) {
    return this.jobsService.getApplicationsByJob(id, queryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch('applications/:id/status')
  async updateApplicationStatus(
    @Param('id') id: string, 
    @Body() updateDto: UpdateApplicationStatusDto
  ) {
    return this.jobsService.updateApplicationStatus(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete('applications/:id')
  async removeApplication(@Param('id') id: string) {
    return this.jobsService.deleteApplication(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
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