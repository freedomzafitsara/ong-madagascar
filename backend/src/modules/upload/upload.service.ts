// backend/src/modules/upload/upload.service.ts
import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseImage } from '../../entities/database-image.entity';

const sharp = require('sharp');

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @InjectRepository(DatabaseImage)
    private imageRepository: Repository<DatabaseImage>,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
    entityType: string,
    entityId?: string,
    isMain: boolean = false,
    displayOrder: number = 0,
  ): Promise<DatabaseImage> {
    // CORRECTION: Normalisation du MIME type
    let mimeType = file.mimetype.toLowerCase();
    const fileName = file.originalname.toLowerCase();
    
    // Correction pour les fichiers PDF envoyés avec application/octet-stream
    if (mimeType === 'application/octet-stream' && fileName.endsWith('.pdf')) {
      mimeType = 'application/pdf';
      file.mimetype = 'application/pdf';
      this.logger.log(`Correction MIME: application/octet-stream -> application/pdf pour ${file.originalname}`);
    }
    
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const validDocumentTypes = ['application/pdf'];
    
    const isImage = validImageTypes.includes(mimeType);
    const isDocument = validDocumentTypes.includes(mimeType);
    
    this.logger.log(`Upload: ${file.originalname}, MIME: ${mimeType}, isImage: ${isImage}, isDocument: ${isDocument}`);
    
    // CORRECTION: Message d'erreur plus clair
    if (!isImage && !isDocument) {
      this.logger.error(`Type refuse: ${file.mimetype}`);
      throw new BadRequestException(
        `Format non supporte. Types acceptes: JPG, PNG, WEBP, GIF, PDF. Format recu: ${file.mimetype}`
      );
    }

    if (file.size > 100 * 1024 * 1024) {
      throw new BadRequestException('Fichier trop grand. Maximum 100 Mo.');
    }

    try {
      let processedBuffer = file.buffer;
      let finalMimeType = mimeType;
      let finalFileName = file.originalname;
      
      // Sharp uniquement pour les IMAGES (pas les PDF)
      if (isImage && file.size > 1024 * 1024) {
        try {
          processedBuffer = await sharp(file.buffer)
            .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();
          
          finalMimeType = 'image/jpeg';
          finalFileName = file.originalname.replace(/\.[^/.]+$/, '') + '.jpg';
          
          this.logger.log(`Image optimisee: ${(file.size / 1024 / 1024).toFixed(2)} Mo`);
        } catch (sharpError) {
          this.logger.warn(`Erreur Sharp, utilisation originale: ${sharpError.message}`);
          processedBuffer = file.buffer;
          finalMimeType = mimeType;
          finalFileName = file.originalname;
        }
      }

      // Si c'est une image principale, retirer le flag des autres
      if (isMain && entityId && isImage) {
        await this.imageRepository.update(
          { entityType, entityId, isMain: true },
          { isMain: false }
        );
      }

      const image = this.imageRepository.create({
        entityType,
        entityId,
        fileName: finalFileName,
        originalName: file.originalname,
        mimeType: finalMimeType,
        fileSize: processedBuffer.length,
        imageData: processedBuffer,
        isMain: (isImage && isMain),
        displayOrder,
      });

      const savedImage = await this.imageRepository.save(image);
      
      this.logger.log(`Fichier stocke: ${savedImage.id} - Type: ${savedImage.mimeType} - Taille: ${(savedImage.fileSize / 1024).toFixed(2)} KB`);
      
      return savedImage;
    } catch (error) {
      this.logger.error(`Erreur upload: ${error.message}`);
      throw new BadRequestException(`Erreur lors de l'upload: ${error.message}`);
    }
  }

  async getImageById(id: string): Promise<DatabaseImage> {
    const image = await this.imageRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Fichier ${id} non trouve`);
    }
    return image;
  }

  async getImagesByEntity(entityType: string, entityId?: string): Promise<DatabaseImage[]> {
    const query: any = { entityType };
    if (entityId) {
      query.entityId = entityId;
    }
    
    return this.imageRepository.find({
      where: query,
      order: { isMain: 'DESC', displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async getMainImage(entityType: string, entityId: string): Promise<DatabaseImage | null> {
    return this.imageRepository.findOne({
      where: { entityType, entityId, isMain: true },
    });
  }

  async updateImageAlt(id: string, altTextFr?: string, altTextMg?: string): Promise<DatabaseImage> {
    const image = await this.getImageById(id);
    
    if (altTextFr !== undefined) image.altTextFr = altTextFr;
    if (altTextMg !== undefined) image.altTextMg = altTextMg;
    
    return this.imageRepository.save(image);
  }

  async reorderImages(imageIds: string[]): Promise<void> {
    for (let i = 0; i < imageIds.length; i++) {
      await this.imageRepository.update(imageIds[i], { displayOrder: i });
    }
    this.logger.log(`Reordonnancement de ${imageIds.length} fichiers`);
  }

  async setMainImage(id: string, entityType: string, entityId: string): Promise<DatabaseImage> {
    const image = await this.getImageById(id);
    
    if (!image.mimeType.startsWith('image/')) {
      throw new BadRequestException('Seules les images peuvent etre definies comme principales');
    }
    
    await this.imageRepository.update(
      { entityType, entityId, isMain: true },
      { isMain: false }
    );
    
    await this.imageRepository.update(id, { isMain: true });
    
    this.logger.log(`Image principale mise a jour: ${id}`);
    
    return this.getImageById(id);
  }

  async deleteImage(id: string): Promise<void> {
    const image = await this.getImageById(id);
    await this.imageRepository.remove(image);
    this.logger.log(`Fichier supprime: ${id}`);
  }

  async deleteImagesByEntity(entityType: string, entityId: string): Promise<void> {
    const result = await this.imageRepository.delete({ entityType, entityId });
    this.logger.log(`Fichiers supprimes pour ${entityType}/${entityId}: ${result.affected || 0}`);
  }

  getImageUrl(id: string): string {
    return `/api/upload/image/${id}`;
  }
}