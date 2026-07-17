// backend/src/modules/upload/upload.service.ts

import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UploadedFile } from '../../entities/uploaded-file.entity';
import { User } from '../../entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadsPath = path.join(process.cwd(), 'uploads');

  // ✅ Types MIME autorises (complets)
  private readonly VALID_MIME_TYPES = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/webp', 
    'image/gif', 
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'image/heic',
    'image/heif',
    'application/pdf'
  ];

  constructor(
    @InjectRepository(UploadedFile)
    private fileRepository: Repository<UploadedFile>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist(): void {
    if (!fs.existsSync(this.uploadsPath)) {
      fs.mkdirSync(this.uploadsPath, { recursive: true });
      this.logger.log('Dossier uploads cree');
    }

    const subDirs = ['job', 'project', 'blog', 'profile', 'banner', 'logo', 'background', 'cv', 'diploma', 'attestation'];
    for (const dir of subDirs) {
      const subPath = path.join(this.uploadsPath, dir);
      if (!fs.existsSync(subPath)) {
        fs.mkdirSync(subPath, { recursive: true });
        this.logger.log(`Dossier cree: uploads/${dir}`);
      }
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    entityType: string,
    entityId?: string,
  ): Promise<UploadedFile> {
    this.logger.log(`Upload: ${file.originalname}, MIME: ${file.mimetype}, Taille: ${file.size}`);

    this.validateFile(file);

    try {
      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substring(2, 8);
      const ext = this.getExtensionFromMimeType(file.mimetype.toLowerCase());
      const finalFileName = `${timestamp}-${uniqueId}.${ext}`;
      
      const relativePath = `uploads/${entityType}/${finalFileName}`;
      const fullPath = path.join(this.uploadsPath, entityType, finalFileName);

      const entityDir = path.join(this.uploadsPath, entityType);
      if (!fs.existsSync(entityDir)) {
        fs.mkdirSync(entityDir, { recursive: true });
      }

      fs.writeFileSync(fullPath, file.buffer);

      const fileUrl = `/uploads/${entityType}/${finalFileName}`;

      this.logger.log(`Fichier sauvegarde: ${fullPath}`);
      this.logger.log(`URL: ${fileUrl}`);

      const fileEntity = this.fileRepository.create({
        url: fileUrl,
        filePath: relativePath,
        filename: finalFileName,
        originalName: file.originalname,
        format: ext,
        size: file.size,
        type: entityType,
        entityId: entityId || null,
      });

      const savedFile = await this.fileRepository.save(fileEntity);
      
      this.logger.log(`Fichier stocke: ${savedFile.id} - ${savedFile.filename}`);

      // Mise a jour de l'utilisateur pour l'avatar
      await this.updateUserAvatarIfNeeded(entityType, entityId, fileUrl);
      
      return savedFile;
    } catch (error) {
      this.logger.error(`Erreur upload: ${error.message}`);
      throw new BadRequestException(`Erreur lors de l'upload: ${error.message}`);
    }
  }

  private validateFile(file: Express.Multer.File): void {
    const mimeType = file.mimetype.toLowerCase();
    
    // ✅ Vérifier si le type MIME est valide
    if (!this.VALID_MIME_TYPES.includes(mimeType)) {
      throw new BadRequestException(
        `Format non supporte. Types acceptes: JPG, PNG, WEBP, GIF, SVG, BMP, TIFF, HEIC, PDF. Format recu: ${file.mimetype}`
      );
    }

    // ✅ Vérifier la taille
    const maxSize = this.isAvatar(file) ? 5 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(
        `Fichier trop grand. Maximum ${maxSize / 1024 / 1024} Mo.`
      );
    }
  }

  private isAvatar(file: Express.Multer.File): boolean {
    const avatarTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    return avatarTypes.includes(file.mimetype.toLowerCase()) && file.size <= 5 * 1024 * 1024;
  }

  private async updateUserAvatarIfNeeded(
    entityType: string, 
    entityId: string | undefined, 
    fileUrl: string
  ): Promise<void> {
    if (entityType !== 'profile' || !entityId) return;

    try {
      const userRepository = this.dataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: entityId } });
      
      if (!user) {
        this.logger.warn(`Utilisateur ${entityId} non trouve pour la mise a jour de l'avatar`);
        return;
      }

      const baseUrl = process.env.API_URL || 'http://localhost:4001';
      const avatarUrl = `${baseUrl}${fileUrl}`;
      
      if (user.avatar_url) {
        const oldFileName = path.basename(user.avatar_url);
        const oldPath = path.join(this.uploadsPath, 'profile', oldFileName);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
            this.logger.log(`Ancien avatar supprime: ${oldPath}`);
          } catch (unlinkError) {
            this.logger.warn(`Impossible de supprimer l'ancien avatar: ${unlinkError.message}`);
          }
        }
      }
      
      user.avatar_url = avatarUrl;
      await userRepository.save(user);
      this.logger.log(`Avatar mis a jour pour l'utilisateur ${entityId}: ${avatarUrl}`);
    } catch (error) {
      this.logger.error(`Erreur mise a jour avatar utilisateur: ${error.message}`);
    }
  }

  // ============================================================
  // UPLOAD AVATAR - METHODE DEDIEE
  // ============================================================

  async uploadAvatar(
    file: Express.Multer.File,
    userId: string,
  ): Promise<UploadedFile> {
    this.logger.log(`Upload avatar pour utilisateur ${userId}: ${file.originalname}`);

    const mimeType = file.mimetype.toLowerCase();
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    
    if (!validTypes.includes(mimeType)) {
      throw new BadRequestException(
        `Format non supporte. Types acceptes: JPG, PNG, WEBP, GIF. Format recu: ${file.mimetype}`
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Avatar trop grand. Maximum 5 Mo.');
    }

    try {
      const oldAvatars = await this.fileRepository.find({
        where: {
          type: 'profile',
          entityId: userId,
        },
      });

      for (const oldAvatar of oldAvatars) {
        await this.deleteFile(oldAvatar.id);
        this.logger.log(`Ancien avatar supprime: ${oldAvatar.id}`);
      }

      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substring(2, 8);
      const ext = this.getExtensionFromMimeType(mimeType);
      const finalFileName = `avatar-${userId}-${timestamp}-${uniqueId}.${ext}`;
      
      const relativePath = `uploads/profile/${finalFileName}`;
      const fullPath = path.join(this.uploadsPath, 'profile', finalFileName);

      const entityDir = path.join(this.uploadsPath, 'profile');
      if (!fs.existsSync(entityDir)) {
        fs.mkdirSync(entityDir, { recursive: true });
      }

      fs.writeFileSync(fullPath, file.buffer);

      const fileUrl = `/uploads/profile/${finalFileName}`;

      this.logger.log(`Avatar sauvegarde: ${fullPath}`);
      this.logger.log(`URL: ${fileUrl}`);

      const fileEntity = this.fileRepository.create({
        url: fileUrl,
        filePath: relativePath,
        filename: finalFileName,
        originalName: file.originalname,
        format: ext,
        size: file.size,
        type: 'profile',
        entityId: userId,
      });

      const savedFile = await this.fileRepository.save(fileEntity);
      
      this.logger.log(`Avatar stocke: ${savedFile.id} - ${savedFile.filename}`);

      await this.updateUserAvatar(userId, fileUrl);
      
      return savedFile;
    } catch (error) {
      this.logger.error(`Erreur upload avatar: ${error.message}`);
      throw new BadRequestException(`Erreur lors de l'upload de l'avatar: ${error.message}`);
    }
  }

  private async updateUserAvatar(userId: string, fileUrl: string): Promise<void> {
    try {
      const userRepository = this.dataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });
      
      if (!user) {
        this.logger.warn(`Utilisateur ${userId} non trouve`);
        return;
      }

      const baseUrl = process.env.API_URL || 'http://localhost:4001';
      const avatarUrl = `${baseUrl}${fileUrl}`;
      
      if (user.avatar_url) {
        const oldFileName = path.basename(user.avatar_url);
        const oldPath = path.join(this.uploadsPath, 'profile', oldFileName);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
            this.logger.log(`Ancien avatar physique supprime: ${oldPath}`);
          } catch (unlinkError) {
            this.logger.warn(`Impossible de supprimer l'ancien avatar: ${unlinkError.message}`);
          }
        }
      }
      
      user.avatar_url = avatarUrl;
      await userRepository.save(user);
      this.logger.log(`Avatar mis a jour pour l'utilisateur ${userId}: ${avatarUrl}`);
    } catch (error) {
      this.logger.error(`Erreur mise a jour utilisateur: ${error.message}`);
    }
  }

  private getExtensionFromMimeType(mimeType: string): string {
    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
      'image/bmp': 'bmp',
      'image/tiff': 'tiff',
      'image/heic': 'heic',
      'image/heif': 'heif',
      'application/pdf': 'pdf',
    };
    return mimeMap[mimeType] || 'bin';
  }

  async getFileById(id: string): Promise<UploadedFile> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`Fichier ${id} non trouve`);
    }
    return file;
  }

  async getFilesByEntity(entityType: string, entityId?: string): Promise<UploadedFile[]> {
    const query: any = { type: entityType };
    if (entityId) {
      query.entityId = entityId;
    }
    
    return this.fileRepository.find({
      where: query,
      order: { createdAt: 'DESC' },
    });
  }

  async deleteFile(id: string): Promise<void> {
    const file = await this.getFileById(id);
    
    try {
      const fullPath = path.join(process.cwd(), file.filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        this.logger.log(`Fichier physique supprime: ${fullPath}`);
      }
    } catch (error) {
      this.logger.warn(`Impossible de supprimer le fichier physique: ${error.message}`);
    }
    
    await this.fileRepository.remove(file);
    this.logger.log(`Fichier supprime: ${id}`);
  }

  async deleteFilesByEntity(entityType: string, entityId: string): Promise<void> {
    const files = await this.getFilesByEntity(entityType, entityId);
    for (const file of files) {
      await this.deleteFile(file.id);
    }
    this.logger.log(`Fichiers supprimes pour ${entityType}/${entityId}: ${files.length}`);
  }

  getImageUrl(id: string): string {
    const baseUrl = process.env.API_URL || 'http://localhost:4001';
    return `${baseUrl}/uploads/${id}`;
  }
}