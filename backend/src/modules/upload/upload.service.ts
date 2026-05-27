import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Volunteer } from '../../entities/volunteer.entity';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;
  private isConfigured: boolean = false;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Volunteer)
    private volunteerRepository: Repository<Volunteer>,
    private configService: ConfigService,
  ) {
    this.configureCloudinary();
    this.uploadDir = path.join(process.cwd(), 'temp_uploads');
    this.ensureTempDirectory();
  }

  // ============================================================
  // SECTION 1 : CONFIGURATION
  // ============================================================

  private configureCloudinary(): void {
    const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.warn('Cloudinary non configure. Veuillez verifier vos variables d environnement.');
      this.isConfigured = false;
      return;
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    
    this.isConfigured = true;
    this.logger.log('Cloudinary configure avec succes');
  }

  private ensureTempDirectory(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`Dossier temporaire cree: ${this.uploadDir}`);
    }
  }

  // ============================================================
  // SECTION 2 : METHODES PRIVEES
  // ============================================================

  private async saveTempFile(file: Express.Multer.File): Promise<string> {
    const tempPath = path.join(this.uploadDir, `${Date.now()}-${file.originalname}`);
    await fs.promises.writeFile(tempPath, file.buffer);
    return tempPath;
  }

  private async saveBufferToTempFile(buffer: Buffer, filename: string): Promise<string> {
    const tempPath = path.join(this.uploadDir, filename);
    await fs.promises.writeFile(tempPath, buffer);
    return tempPath;
  }

  private async deleteTempFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      this.logger.warn(`Erreur suppression fichier temporaire: ${error.message}`);
    }
  }

  private checkCloudinaryConfig(): void {
    if (!this.isConfigured) {
      throw new InternalServerErrorException(
        'Cloudinary n est pas configure. Verifiez vos variables d environnement.'
      );
    }
  }

  // ============================================================
  // SECTION 3 : UPLOAD VERS CLOUDINARY
  // ============================================================

  async uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
    transformations?: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
      format?: string;
    },
  ): Promise<CloudinaryUploadResult> {
    this.checkCloudinaryConfig();
    
    let tempPath: string | null = null;
    
    try {
      tempPath = await this.saveTempFile(file);
      
      const result: UploadApiResponse = await cloudinary.uploader.upload(tempPath, {
        folder: folder,
        transformation: [
          {
            width: transformations?.width || 1200,
            height: transformations?.height || 800,
            crop: transformations?.crop || 'limit',
            quality: transformations?.quality || 'auto',
          },
          {
            fetch_format: transformations?.format || 'auto',
          },
        ],
        resource_type: 'auto',
      });
      
      this.logger.log(`Upload reussi: ${result.secure_url}`);
      
      return {
        url: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      this.logger.error(`Erreur Cloudinary: ${error.message}`);
      throw new InternalServerErrorException(`Upload echoue: ${error.message}`);
    } finally {
      if (tempPath) {
        await this.deleteTempFile(tempPath);
      }
    }
  }

  // ============================================================
  // SECTION 4 : UPLOAD DE PDF GENERES
  // ============================================================

  async uploadGeneratedPDF(buffer: Buffer, filename: string, folder: string): Promise<CloudinaryUploadResult> {
    this.checkCloudinaryConfig();
    
    let tempPath: string | null = null;
    
    try {
      tempPath = await this.saveBufferToTempFile(buffer, filename);
      
      const result: UploadApiResponse = await cloudinary.uploader.upload(tempPath, {
        folder: folder,
        resource_type: 'auto',
        public_id: filename.replace('.pdf', ''),
        access_mode: 'public',
        type: 'upload',
      });
      
      this.logger.log(`PDF uploade sur Cloudinary: ${result.secure_url}`);
      
      return {
        url: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      this.logger.error(`Erreur upload PDF: ${error.message}`);
      throw new InternalServerErrorException(`Erreur lors de l upload du PDF: ${error.message}`);
    } finally {
      if (tempPath) {
        await this.deleteTempFile(tempPath);
      }
    }
  }

  // ============================================================
  // SECTION 5 : UPLOAD DE PHOTO DE PROFIL
  // ============================================================

  async uploadProfilePhoto(file: Express.Multer.File, userId: string): Promise<CloudinaryUploadResult> {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Format non supporte. Utilisez JPG, PNG ou WebP.');
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('Photo trop volumineuse. Maximum 2 Mo.');
    }

    const result = await this.uploadToCloudinary(file, `ymad/profiles/${userId}`, {
      width: 400,
      height: 400,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    });

    await this.userRepository.update(userId, { avatar_url: result.secureUrl });
    this.logger.log(`Photo de profil mise a jour pour l utilisateur ${userId}`);

    return result;
  }

  // ============================================================
  // SECTION 6 : UPLOAD DE CV
  // ============================================================

  async uploadCV(file: Express.Multer.File, userId: string, jobOfferId: string): Promise<CloudinaryUploadResult> {
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Le CV doit etre au format PDF');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('CV trop volumineux. Maximum 5 Mo.');
    }

    return this.uploadToCloudinary(file, `ymad/cvs/${userId}/${jobOfferId}`, {
      format: 'pdf',
    });
  }

  // ============================================================
  // SECTION 7 : UPLOAD DE DOCUMENTS
  // ============================================================

  async uploadDocument(
    file: Express.Multer.File,
    userId: string,
    documentType: 'diploma' | 'attestation',
  ): Promise<CloudinaryUploadResult> {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Format non supporte. Utilisez PDF, JPG ou PNG.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Document trop volumineux. Maximum 5 Mo.');
    }

    return this.uploadToCloudinary(file, `ymad/documents/${userId}/${documentType}`, {
      quality: 'auto',
    });
  }

  // ============================================================
  // SECTION 8 : UPLOAD D IMAGE POUR BLOG
  // ============================================================

  async uploadBlogImage(file: Express.Multer.File, blogPostId: string): Promise<CloudinaryUploadResult> {
    return this.uploadToCloudinary(file, `ymad/blog/${blogPostId}`, {
      width: 1200,
      height: 630,
      crop: 'limit',
      quality: 'auto',
      format: 'auto',
    });
  }

  // ============================================================
  // SECTION 9 : UPLOAD D IMAGE POUR PROJET
  // ============================================================

  async uploadProjectImage(file: Express.Multer.File, projectId: string, isGallery: boolean = false): Promise<CloudinaryUploadResult> {
    const folder = isGallery ? `ymad/projects/${projectId}/gallery` : `ymad/projects/${projectId}`;
    return this.uploadToCloudinary(file, folder, {
      width: isGallery ? 800 : 1200,
      height: isGallery ? 600 : 800,
      crop: 'limit',
      quality: 'auto',
    });
  }

  // ============================================================
  // SECTION 10 : UPLOAD DE FOND D ECRAN
  // ============================================================

  async uploadBackground(file: Express.Multer.File, pageName: string): Promise<CloudinaryUploadResult> {
    return this.uploadToCloudinary(file, `ymad/backgrounds/${pageName}`, {
      width: 1920,
      height: 1080,
      crop: 'limit',
      quality: 'auto',
    });
  }

  // ============================================================
  // SECTION 11 : SUPPRESSION DE FICHIER
  // ============================================================

  async deleteFromCloudinary(publicId: string): Promise<boolean> {
    this.checkCloudinaryConfig();
    
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Fichier supprime: ${publicId}, Resultat: ${result.result}`);
      return result.result === 'ok';
    } catch (error) {
      this.logger.error(`Erreur suppression: ${error.message}`);
      return false;
    }
  }

  // ============================================================
  // SECTION 12 : URL OPTIMISEE
  // ============================================================

  getOptimizedUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'limit' | 'thumb';
    quality?: number;
  }): string {
    this.checkCloudinaryConfig();
    
    let url = `https://res.cloudinary.com/${this.configService.get('CLOUDINARY_CLOUD_NAME')}/image/upload`;
    
    if (options) {
      const transformations = [];
      if (options.width) transformations.push(`w_${options.width}`);
      if (options.height) transformations.push(`h_${options.height}`);
      if (options.crop) transformations.push(`c_${options.crop}`);
      if (options.quality) transformations.push(`q_${options.quality}`);
      
      if (transformations.length > 0) {
        url += `/${transformations.join(',')}`;
      }
    }
    
    url += `/${publicId}`;
    return url;
  }

  // ============================================================
  // SECTION 13 : METADONNEES
  // ============================================================

  async getFileMetadata(publicId: string): Promise<any> {
    this.checkCloudinaryConfig();
    
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      this.logger.error(`Erreur recuperation metadonnees: ${error.message}`);
      return null;
    }
  }

  // ============================================================
  // SECTION 14 : MISE A JOUR PHOTO UTILISATEUR
  // ============================================================

  async updateUserPhoto(userId: string, photoUrl: string): Promise<User> {
    await this.userRepository.update(userId, { avatar_url: photoUrl });
    return this.userRepository.findOne({ where: { id: userId } });
  }

  // ============================================================
  // SECTION 15 : MISE A JOUR PHOTO BENEVOLE
  // ============================================================

  async updateVolunteerPhoto(volunteerId: string, photoUrl: string): Promise<void> {
    await this.volunteerRepository.update(volunteerId, { photo_url: photoUrl });
    this.logger.log(`Photo du benevole ${volunteerId} mise a jour avec succes: ${photoUrl}`);
  }
}