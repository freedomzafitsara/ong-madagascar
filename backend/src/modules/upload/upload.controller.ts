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
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../../entities/user.entity';
import { UploadService } from './upload.service';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // ============================================================
  // SECTION 1 : UPLOAD GENERAL (POUR EVENEMENTS, PROJETS, ETC)
  // ============================================================

  @Post('single')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const result = await this.uploadService.uploadToCloudinary(file, 'ymad/uploads');

    return {
      success: true,
      url: result.secureUrl,
      publicId: result.publicId,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  // ============================================================
  // SECTION 2 : UPLOAD PHOTO DE PROFIL
  // ============================================================

  @Post('profile')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF, UserRole.MEMBER, UserRole.VOLUNTEER)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePhoto(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const result = await this.uploadService.uploadProfilePhoto(file, req.user.id);

    return {
      success: true,
      url: result.secureUrl,
      publicId: result.publicId,
      bytes: result.bytes,
      format: result.format,
      message: 'Photo de profil mise a jour avec succes',
    };
  }

  // ============================================================
  // SECTION 3 : UPLOAD CV
  // ============================================================

  @Post('cv')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF, UserRole.MEMBER)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCV(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const jobOfferId = req.body.jobOfferId;
    if (!jobOfferId) {
      throw new BadRequestException('Identifiant de l offre manquant');
    }

    const result = await this.uploadService.uploadCV(file, req.user.id, jobOfferId);

    return {
      success: true,
      url: result.secureUrl,
      publicId: result.publicId,
      bytes: result.bytes,
      format: result.format,
      message: 'CV telecharge avec succes',
    };
  }

  // ============================================================
  // SECTION 4 : UPLOAD DOCUMENT (DIPLOME, ATTESTATION)
  // ============================================================

  @Post('document')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF, UserRole.MEMBER)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const documentType = req.body.documentType;
    if (!documentType || !['diploma', 'attestation'].includes(documentType)) {
      throw new BadRequestException('Type de document invalide. Utilisez diploma ou attestation');
    }

    const result = await this.uploadService.uploadDocument(file, req.user.id, documentType);

    return {
      success: true,
      url: result.secureUrl,
      publicId: result.publicId,
      documentType: documentType,
      message: `${documentType === 'diploma' ? 'Diplome' : 'Attestation'} telecharge avec succes`,
    };
  }

  // ============================================================
  // SECTION 5 : UPLOAD IMAGE BLOG
  // ============================================================

  @Post('blog')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  @UseInterceptors(FileInterceptor('file'))
  async uploadBlogImage(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const blogPostId = req.body.blogPostId;
    if (!blogPostId) {
      throw new BadRequestException('Identifiant de l article manquant');
    }

    const result = await this.uploadService.uploadBlogImage(file, blogPostId);

    return {
      success: true,
      url: result.secureUrl,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      message: 'Image de l article telechargee avec succes',
    };
  }

  // ============================================================
  // SECTION 6 : UPLOAD IMAGE PROJET
  // ============================================================

  @Post('project')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProjectImage(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const projectId = req.body.projectId;
    if (!projectId) {
      throw new BadRequestException('Identifiant du projet manquant');
    }

    const isGallery = req.body.isGallery === 'true';
    const result = await this.uploadService.uploadProjectImage(file, projectId, isGallery);

    return {
      success: true,
      url: result.secureUrl,
      publicId: result.publicId,
      isGallery: isGallery,
      message: isGallery ? 'Image ajoutee a la galerie' : 'Image du projet telechargee',
    };
  }

  // ============================================================
  // SECTION 7 : UPLOAD FOND D ECRAN
  // ============================================================

  @Post('background')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadBackground(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const pageName = req.body.pageName;
    if (!pageName) {
      throw new BadRequestException('Nom de la page manquant');
    }

    const result = await this.uploadService.uploadBackground(file, pageName);

    return {
      success: true,
      url: result.secureUrl,
      publicId: result.publicId,
      pageName: pageName,
      message: `Fond d ecran pour la page ${pageName} telecharge avec succes`,
    };
  }

  // ============================================================
  // SECTION 8 : SUPPRESSION DE FICHIER
  // ============================================================

  @Delete()
  async deleteFile(@Query('publicId') publicId: string) {
    if (!publicId) {
      throw new BadRequestException('Identifiant public du fichier non fourni');
    }

    const deleted = await this.uploadService.deleteFromCloudinary(publicId);

    if (deleted) {
      return {
        success: true,
        message: 'Fichier supprime avec succes',
      };
    }

    throw new BadRequestException('Impossible de supprimer le fichier');
  }

  // ============================================================
  // SECTION 9 : URL OPTIMISEE
  // ============================================================

  @Get('optimized-url')
  getOptimizedUrl(@Query('publicId') publicId: string, @Query('width') width: string, @Query('height') height: string) {
    if (!publicId) {
      throw new BadRequestException('Identifiant public du fichier non fourni');
    }

    const url = this.uploadService.getOptimizedUrl(publicId, {
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
      crop: 'fill',
    });

    return {
      success: true,
      url: url,
    };
  }

  // ============================================================
  // SECTION 10 : TEST ENDPOINT
  // ============================================================

  @Public()
  @Get('test')
  async test() {
    return {
      success: true,
      message: 'Upload endpoint is working',
      status: 'ok',
      endpoints: {
        single: 'POST /api/upload/single',
        profile: 'POST /api/upload/profile',
        cv: 'POST /api/upload/cv',
        document: 'POST /api/upload/document',
        blog: 'POST /api/upload/blog',
        project: 'POST /api/upload/project',
        background: 'POST /api/upload/background',
        delete: 'DELETE /api/upload?publicId=xxx',
        optimizedUrl: 'GET /api/upload/optimized-url?publicId=xxx&width=300',
      },
    };
  }
}