// backend/src/modules/upload/upload.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Get,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
// Ajout de 'Req' dans les imports ↑
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { UploadService } from './upload.service';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('profile')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF, UserRole.MEMBER, UserRole.VOLUNTEER)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'profiles');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueName = `profile_${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new BadRequestException('Format de fichier non supporté'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadProfilePhoto(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const baseUrl = process.env.API_URL || 'http://localhost:4001';
    const fileUrl = `${baseUrl}/uploads/profiles/${file.filename}`;

    const updatedUser = await this.uploadService.updateUserPhoto(req.user.id, fileUrl);

    return {
      success: true,
      url: fileUrl,
      filename: file.filename,
      message: 'Photo de profil mise à jour avec succès',
      user: updatedUser,
    };
  }

  @Post('single')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/)) {
          return cb(new BadRequestException('Format de fichier non supporté'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadSingle(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const baseUrl = process.env.API_URL || 'http://localhost:4001';
    const fileUrl = `${baseUrl}/uploads/${file.filename}`;

    return {
      success: true,
      url: fileUrl,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Get()
  async getImages() {
    const uploadPath = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadPath)) {
      return { files: [] };
    }

    const files = fs.readdirSync(uploadPath);
    const baseUrl = process.env.API_URL || 'http://localhost:4001';
    
    const images = files.map(filename => ({
      filename,
      url: `${baseUrl}/uploads/${filename}`,
    }));

    return { files: images };
  }

  @Delete()
  async deleteImage(@Query('url') url: string) {
    if (!url) {
      throw new BadRequestException('URL non fournie');
    }
    
    const filename = url.split('/').pop();
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true, message: 'Image supprimée' };
    }
    
    return { success: false, message: 'Fichier non trouvé' };
  }
}