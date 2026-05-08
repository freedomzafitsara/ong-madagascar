import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'applications',
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Format non supporté. Utilisez JPG, PNG ou PDF');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Fichier trop volumineux (max 5MB)');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `y-mad/${folder}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(new BadRequestException('Erreur lors de l\'upload'));
          } else {
            resolve(result.secure_url);
          }
        },
      );

      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  async uploadMultipleFiles(
    files: { cv?: Express.Multer.File; photo?: Express.Multer.File; diploma?: Express.Multer.File; attestation?: Express.Multer.File },
  ): Promise<{ cvUrl?: string; photoUrl?: string; diplomaUrl?: string; attestationUrl?: string }> {
    const result: any = {};

    if (files.cv) {
      result.cvUrl = await this.uploadFile(files.cv, 'cvs');
    }
    if (files.photo) {
      result.photoUrl = await this.uploadFile(files.photo, 'photos');
    }
    if (files.diploma) {
      result.diplomaUrl = await this.uploadFile(files.diploma, 'diplomas');
    }
    if (files.attestation) {
      result.attestationUrl = await this.uploadFile(files.attestation, 'attestations');
    }

    return result;
  }
}