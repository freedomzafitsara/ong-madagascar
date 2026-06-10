// backend/src/modules/upload/upload.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
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
import { UploadService } from './upload.service';
import { UploadImageDto, UpdateImageAltDto, ReorderImagesDto } from './dto/upload-image.dto';
import { memoryStorage } from 'multer';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('single')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: {
      fileSize: 100 * 1024 * 1024,
    },
    fileFilter: (req, file, callback) => {
      let mimeType = file.mimetype.toLowerCase();
      const fileName = file.originalname.toLowerCase();
      
      // CORRECTION: Accepter application/octet-stream pour les PDF
      if (mimeType === 'application/octet-stream' && fileName.endsWith('.pdf')) {
        mimeType = 'application/pdf';
        file.mimetype = 'application/pdf';
      }
      
      const allowedImages = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      const allowedDocuments = ['application/pdf'];
      
      const isImage = allowedImages.includes(mimeType);
      const isDocument = allowedDocuments.includes(mimeType);
      
      if (isImage || isDocument) {
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

    const result = await this.uploadService.uploadImage(
      file,
      uploadDto.entityType,
      uploadDto.entityId,
      uploadDto.isMain || false,
      uploadDto.displayOrder || 0,
    );
    
    return {
      success: true,
      id: result.id,
      url: this.uploadService.getImageUrl(result.id),
      fileName: result.fileName,
      originalName: result.originalName,
      fileSize: result.fileSize,
      mimeType: result.mimeType,
      isMain: result.isMain,
      displayOrder: result.displayOrder,
      createdAt: result.createdAt,
    };
  }

  @Get()
  async getImages(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId?: string,
  ) {
    if (!entityType) {
      throw new BadRequestException('entityType est requis');
    }

    const images = await this.uploadService.getImagesByEntity(entityType, entityId);
    
    return {
      success: true,
      images: images.map(img => ({
        id: img.id,
        url: this.uploadService.getImageUrl(img.id),
        fileName: img.fileName,
        originalName: img.originalName,
        fileSize: img.fileSize,
        mimeType: img.mimeType,
        isMain: img.isMain,
        displayOrder: img.displayOrder,
        altTextFr: img.altTextFr,
        altTextMg: img.altTextMg,
        createdAt: img.createdAt,
      })),
    };
  }

  @Get('main')
  async getMainImage(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    if (!entityType || !entityId) {
      throw new BadRequestException('entityType et entityId sont requis');
    }

    const image = await this.uploadService.getMainImage(entityType, entityId);
    
    if (!image) {
      return { success: true, image: null };
    }
    
    return {
      success: true,
      image: {
        id: image.id,
        url: this.uploadService.getImageUrl(image.id),
        fileName: image.fileName,
        mimeType: image.mimeType,
        isMain: image.isMain,
      },
    };
  }

  @Get('image/:id')
  async serveImage(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const image = await this.uploadService.getImageById(id);
    
    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(image.fileName)}"`);
    
    return res.send(image.imageData);
  }

  @Put(':id/alt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async updateImageAlt(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateImageAltDto,
  ) {
    const image = await this.uploadService.updateImageAlt(
      id,
      updateDto.altTextFr,
      updateDto.altTextMg,
    );
    
    return {
      success: true,
      image: {
        id: image.id,
        altTextFr: image.altTextFr,
        altTextMg: image.altTextMg,
      },
    };
  }

  @Put('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async reorderImages(@Body() reorderDto: ReorderImagesDto) {
    if (!reorderDto.imageIds || !reorderDto.imageIds.length) {
      throw new BadRequestException('imageIds est requis');
    }
    
    await this.uploadService.reorderImages(reorderDto.imageIds);
    return { success: true, message: 'Ordre mis a jour' };
  }

  @Put(':id/main')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async setMainImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    if (!entityType || !entityId) {
      throw new BadRequestException('entityType et entityId sont requis');
    }
    
    const image = await this.uploadService.setMainImage(id, entityType, entityId);
    
    return {
      success: true,
      image: {
        id: image.id,
        url: this.uploadService.getImageUrl(image.id),
        fileName: image.fileName,
        mimeType: image.mimeType,
        isMain: image.isMain,
      },
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async deleteImage(@Param('id', ParseUUIDPipe) id: string) {
    await this.uploadService.deleteImage(id);
    return { success: true, message: 'Fichier supprime avec succes' };
  }
}