// backend/src/modules/upload/upload.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {

  // Upload d'un seul fichier (max 50MB)
  @Post('single')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
      // ✅ CORRECTION: Utiliser une expression régulière valide
      const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|webp/;
      const extnameCheck = allowedTypes.test(extname(file.originalname).toLowerCase());
      const mimetypeCheck = allowedTypes.test(file.mimetype.toLowerCase());
      
      if (mimetypeCheck && extnameCheck) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Format de fichier non supporté'), false);
      }
    },
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  async uploadSingle(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier uploadé');
    }
    return {
      message: 'Fichier uploadé avec succès',
      filename: file.filename,
      url: `/uploads/${file.filename}`,
      size: file.size,
    };
  }

  // Upload de plusieurs fichiers (max 50MB total)
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10, {
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB par fichier
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|webp/;
      const extnameCheck = allowedTypes.test(extname(file.originalname).toLowerCase());
      const mimetypeCheck = allowedTypes.test(file.mimetype.toLowerCase());
      
      if (mimetypeCheck && extnameCheck) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Format de fichier non supporté'), false);
      }
    },
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier uploadé');
    }
    return {
      message: `${files.length} fichier(s) uploadé(s) avec succès`,
      files: files.map(f => ({
        filename: f.filename,
        url: `/uploads/${f.filename}`,
        size: f.size,
      })),
    };
  }
}