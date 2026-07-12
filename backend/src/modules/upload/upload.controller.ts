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
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UploadService } from './upload.service';
import { 
  UploadImageDto, 
  UpdateImageAltDto, 
  ReorderImagesDto,
  UploadResponseDto,
  ImagesListResponseDto,
  DeleteResponseDto
} from './dto/upload-image.dto';
import { memoryStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { UserRole } from '../auth/entities/user.entity';

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  // ============================================================
  // UPLOAD D'UN FICHIER - PROTEGE PAR JWT
  // ============================================================

  @UseGuards(JwtAuthGuard)
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
    @CurrentUser() currentUser: any,
  ) {
    // Verifier l'authentification
    if (!currentUser) {
      throw new UnauthorizedException('Vous devez etre connecte pour uploader un fichier.');
    }

    this.logger.log(`Upload demande par ${currentUser.email} (${currentUser.role})`);

    if (!file) {
      throw new BadRequestException('Aucun fichier recu');
    }

    // ✅ Utiliser entityType ou type (compatibilite frontend)
    const entityType = uploadDto.entityType || uploadDto.type;
    if (!entityType) {
      throw new BadRequestException('entityType ou type est requis');
    }

    // ✅ Utiliser entityId ou entity_id (compatibilite frontend)
    const entityId = uploadDto.entityId || uploadDto.entity_id;

    try {
      const result = await this.uploadService.uploadFile(
        file,
        entityType,
        entityId,
      );
      
      this.logger.log(`Upload reussi: ${result.id} - ${result.filename} par ${currentUser.email}`);
      
      // ✅ Construction de l'URL complete
      const baseUrl = process.env.API_URL || 'http://localhost:4001';
      const imageUrl = `${baseUrl}${result.url}`;
      
      return {
        success: true,
        id: result.id,
        url: imageUrl,
        fileName: result.filename,
        originalName: result.originalName,
        fileSize: result.size,
        format: result.format,
        type: result.type,
        entityId: result.entityId,
        createdAt: result.createdAt,
      };
    } catch (error) {
      this.logger.error(`Erreur upload: ${error.message}`);
      throw new BadRequestException(`Erreur lors de l'upload: ${error.message}`);
    }
  }

  // ============================================================
  // LECTURE D'UN FICHIER - PUBLIC
  // ============================================================

  @Public()
  @Get('file/:id')
  async serveFile(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    try {
      const file = await this.uploadService.getFileById(id);
      
      if (!file) {
        throw new NotFoundException('Fichier non trouve');
      }

      const fullPath = path.join(process.cwd(), file.filePath);
      
      if (!fs.existsSync(fullPath)) {
        this.logger.warn(`Fichier physique non trouve: ${fullPath}`);
        throw new NotFoundException('Fichier non trouve');
      }
      
      const mimeType = this.getMimeTypeFromExtension(file.format);
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName)}"`);
      
      return res.sendFile(fullPath);
    } catch (error) {
      this.logger.error(`Erreur lecture fichier ${id}: ${error.message}`);
      throw error;
    }
  }

  // ============================================================
  // LISTE DES FICHIERS - PROTEGE PAR JWT
  // ============================================================

  @UseGuards(JwtAuthGuard)
  @Get()
  async getFiles(
    @Query('type') type: string,
    @Query('entityId') entityId?: string,
  ) {
    if (!type) {
      throw new BadRequestException('type est requis');
    }

    try {
      const files = await this.uploadService.getFilesByEntity(type, entityId);
      
      const baseUrl = process.env.API_URL || 'http://localhost:4001';
      
      return {
        success: true,
        files: files.map(f => ({
          id: f.id,
          url: `${baseUrl}${f.url}`,
          fileName: f.filename,
          originalName: f.originalName,
          fileSize: f.size,
          format: f.format,
          type: f.type,
          entityId: f.entityId,
          createdAt: f.createdAt,
        })),
      };
    } catch (error) {
      this.logger.error(`Erreur liste fichiers: ${error.message}`);
      throw new BadRequestException('Erreur lors de la recuperation des fichiers');
    }
  }

  // ============================================================
  // SUPPRESSION D'UN FICHIER - ADMIN UNIQUEMENT
  // ============================================================

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async deleteFile(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.uploadService.deleteFile(id);
      this.logger.log(`Fichier supprime: ${id}`);
      return { 
        success: true, 
        message: 'Fichier supprime avec succes' 
      };
    } catch (error) {
      this.logger.error(`Erreur suppression fichier ${id}: ${error.message}`);
      throw new BadRequestException('Erreur lors de la suppression');
    }
  }

  // ============================================================
  // VERIFICATION DE SANTE - PUBLIC
  // ============================================================

  @Public()
  @Get('health')
  async health() {
    try {
      const uploadsPath = path.join(process.cwd(), 'uploads');
      const exists = fs.existsSync(uploadsPath);
      
      return {
        status: 'ok',
        uploadsDirectory: exists ? 'ready' : 'creating',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ============================================================
  // UTILITAIRES PRIVES
  // ============================================================

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