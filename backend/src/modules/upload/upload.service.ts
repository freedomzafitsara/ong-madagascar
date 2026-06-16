// backend/src/modules/upload/upload.service.ts

import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadedFile } from '../../entities/uploaded-file.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadsPath = path.join(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(UploadedFile)
    private fileRepository: Repository<UploadedFile>,
  ) {
    // Créer le dossier uploads s'il n'existe pas
    if (!fs.existsSync(this.uploadsPath)) {
      fs.mkdirSync(this.uploadsPath, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    entityType: string,
    entityId?: string,
  ): Promise<UploadedFile> {
    this.logger.log(`Upload: ${file.originalname}, MIME: ${file.mimetype}, Taille: ${file.size}`);

    const mimeType = file.mimetype.toLowerCase();
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    
    if (!validTypes.includes(mimeType)) {
      throw new BadRequestException(
        `Format non supporte. Types acceptes: JPG, PNG, WEBP, GIF, PDF. Format recu: ${file.mimetype}`
      );
    }

    if (file.size > 100 * 1024 * 1024) {
      throw new BadRequestException('Fichier trop grand. Maximum 100 Mo.');
    }

    try {
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substring(2, 8);
      const ext = this.getExtensionFromMimeType(mimeType);
      const finalFileName = `${timestamp}-${uniqueId}.${ext}`;
      const relativePath = `uploads/${entityType}/${finalFileName}`;
      const fullPath = path.join(this.uploadsPath, entityType, finalFileName);

      // Créer le dossier du type d'entité
      const entityDir = path.join(this.uploadsPath, entityType);
      if (!fs.existsSync(entityDir)) {
        fs.mkdirSync(entityDir, { recursive: true });
      }

      // Sauvegarder le fichier sur le disque
      fs.writeFileSync(fullPath, file.buffer);

      // Créer l'URL du fichier
      const fileUrl = `/${relativePath}`;

      // Sauvegarder dans uploaded_files
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
      
      return savedFile;
    } catch (error) {
      this.logger.error(`Erreur upload: ${error.message}`);
      throw new BadRequestException(`Erreur lors de l'upload: ${error.message}`);
    }
  }

  private getExtensionFromMimeType(mimeType: string): string {
    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
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

  async getMainFile(entityType: string, entityId: string): Promise<UploadedFile | null> {
    const files = await this.getFilesByEntity(entityType, entityId);
    return files.length > 0 ? files[0] : null;
  }

  async getFileUrl(id: string): Promise<string> {
    const file = await this.getFileById(id);
    return file.url;
  }

  async deleteFile(id: string): Promise<void> {
    const file = await this.getFileById(id);
    
    // Supprimer le fichier physique
    try {
      const fullPath = path.join(process.cwd(), file.filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        this.logger.log(`Fichier physique supprime: ${fullPath}`);
      }
    } catch (error) {
      this.logger.warn(`Impossible de supprimer le fichier physique: ${error.message}`);
    }
    
    // Supprimer l'entrée en base
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
    return `/api/upload/file/${id}`;
  }
}