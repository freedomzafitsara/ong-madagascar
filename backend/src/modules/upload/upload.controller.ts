// backend/src/modules/upload/upload.controller.ts

import {
  Controller,
  Post,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Body,
  Param,
  Query,
  Res,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UploadService } from './upload.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { memoryStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { UserRole } from '../auth/entities/user.entity';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // ✅ RENDRE L'UPLOAD PUBLIC
  @Public()
  @Post('single')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
      if (allowed.includes(file.mimetype.toLowerCase())) {
        callback(null, true);
      } else {
        callback(new BadRequestException(
          `Format non supporte. Types acceptes: JPG, PNG, WEBP, GIF, PDF. Format recu: ${file.mimetype}`
        ), false);
      }
    },
  }))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier recu');
    }

    if (!uploadDto.entityType) {
      throw new BadRequestException('entityType est requis');
    }

    const result = await this.uploadService.uploadFile(
      file,
      uploadDto.entityType,
      uploadDto.entityId,
    );
    
    return {
      success: true,
      id: result.id,
      url: this.uploadService.getImageUrl(result.id),
      fileName: result.filename,
      originalName: result.originalName,
      fileSize: result.size,
      format: result.format,
      type: result.type,
      entityId: result.entityId,
      createdAt: result.createdAt,
    };
  }

  @Public()
  @Get('file/:id')
  async serveFile(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const file = await this.uploadService.getFileById(id);
    
    const fullPath = path.join(process.cwd(), file.filePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Fichier non trouve' });
    }
    
    const mimeType = this.getMimeTypeFromExtension(file.format);
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName)}"`);
    
    return res.sendFile(fullPath);
  }

  @Public()
  @Get()
  async getFiles(
    @Query('type') type: string,
    @Query('entityId') entityId?: string,
  ) {
    if (!type) {
      throw new BadRequestException('type est requis');
    }

    const files = await this.uploadService.getFilesByEntity(type, entityId);
    
    return {
      success: true,
      files: files.map(f => ({
        id: f.id,
        url: this.uploadService.getImageUrl(f.id),
        fileName: f.filename,
        originalName: f.originalName,
        fileSize: f.size,
        format: f.format,
        type: f.type,
        entityId: f.entityId,
        createdAt: f.createdAt,
      })),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async deleteFile(@Param('id', ParseUUIDPipe) id: string) {
    await this.uploadService.deleteFile(id);
    return { success: true, message: 'Fichier supprime avec succes' };
  }

  private getMimeTypeFromExtension(ext?: string): string {
    const mimeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
    };
    return mimeMap[ext?.toLowerCase() || ''] || 'application/octet-stream';
  }
}