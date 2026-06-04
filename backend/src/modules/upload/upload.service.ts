import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadedFile } from '../../entities/uploaded-file.entity';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @InjectRepository(UploadedFile)
    private uploadedFileRepository: Repository<UploadedFile>,
    private configService: ConfigService,
  ) {
    // Configuration Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
    this.logger.log('Cloudinary configuré avec succès');
  }

  /**
   * Upload d'un fichier vers Cloudinary
   */
  async uploadToCloudinary(
    file: Express.Multer.File,
    type: string,
    entityId?: string,
  ): Promise<UploadedFile> {
    try {
      // Upload vers Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `y-mad/${type}`,
            transformation: [
              { quality: 'auto', fetch_format: 'auto' },
              { flags: 'attachment' }
            ],
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        uploadStream.end(file.buffer);
      });

      const uploaded = result as any;

      // Sauvegarde en base de données
      const uploadedFile = this.uploadedFileRepository.create({
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        filename: uploaded.original_filename || file.originalname,
        originalName: file.originalname,
        type: type,
        entityId: entityId,
        format: uploaded.format,
        size: uploaded.bytes,
        width: uploaded.width,
        height: uploaded.height,
      });

      const savedFile = await this.uploadedFileRepository.save(uploadedFile);
      this.logger.log(`Image uploadee vers Cloudinary: ${savedFile.url} (${type})`);
      
      return savedFile;
    } catch (error) {
      this.logger.error(`Erreur upload Cloudinary: ${error.message}`);
      throw new BadRequestException(`Erreur lors de l'upload: ${error.message}`);
    }
  }

  /**
   * Récupère toutes les images
   */
  async getImages(type?: string, entityId?: string): Promise<UploadedFile[]> {
    const query: any = {};
    if (type) query.type = type;
    if (entityId) query.entityId = entityId;

    return this.uploadedFileRepository.find({
      where: query,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Récupère une image par son ID
   */
  async getImageById(id: string): Promise<UploadedFile> {
    const image = await this.uploadedFileRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image avec l'id ${id} non trouvee`);
    }
    return image;
  }

  /**
   * Supprime une image de Cloudinary et de la base
   */
  async deleteFromCloudinary(url: string): Promise<void> {
    try {
      // Extraire le public_id depuis l'URL Cloudinary
      const publicId = this.extractPublicIdFromUrl(url);
      
      if (publicId) {
        // Supprimer de Cloudinary
        await cloudinary.uploader.destroy(publicId);
        this.logger.log(`Image supprimee de Cloudinary: ${publicId}`);
      }

      // Supprimer de la base de données
      await this.uploadedFileRepository.delete({ url });
      this.logger.log(`Image supprimee de la base: ${url}`);
    } catch (error) {
      this.logger.error(`Erreur suppression Cloudinary: ${error.message}`);
      throw new BadRequestException(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  /**
   * Supprime toutes les images d'une entité
   */
  async deleteByEntity(entityId: string, type: string): Promise<void> {
    const files = await this.getImages(type, entityId);
    for (const file of files) {
      await this.deleteFromCloudinary(file.url);
    }
    this.logger.log(`Toutes les images supprimees pour ${type}/${entityId}`);
  }

  /**
   * Extrait le public_id depuis l'URL Cloudinary
   */
  private extractPublicIdFromUrl(url: string): string | null {
    const regex = /\/upload\/(?:v\d+\/)?(.+?)\.\w+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Génère une URL optimisée avec transformations Cloudinary
   */
  getOptimizedUrl(url: string, options?: { width?: number; height?: number; quality?: number }): string {
    if (!url.includes('cloudinary')) return url;
    
    const transformations = [];
    if (options?.width) transformations.push(`w_${options.width}`);
    if (options?.height) transformations.push(`h_${options.height}`);
    if (options?.quality) transformations.push(`q_${options.quality}`);
    
    if (transformations.length === 0) return url;
    
    return url.replace('/upload/', `/upload/${transformations.join(',')}/`);
  }
}