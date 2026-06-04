import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Body,
  Query,
  Delete,
  Get,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UploadService } from './upload.service';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('single')
  @Roles('super_admin', 'admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp|gif)$/i }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('type') type: string,
    @Body('entityId') entityId?: string,
  ) {
    const result = await this.uploadService.uploadToCloudinary(file, type, entityId);
    return {
      success: true,
      id: result.id,
      url: result.url,
      filename: result.filename,
      publicId: result.publicId,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.size,
      type: result.type,
      entityId: result.entityId,
      createdAt: result.createdAt,
    };
  }

  @Get()
  async getImages(
    @Query('type') type?: string,
    @Query('entityId') entityId?: string,
  ) {
    const files = await this.uploadService.getImages(type, entityId);
    return {
      success: true,
      files,
    };
  }

  @Delete()
  @Roles('super_admin', 'admin')
  async deleteImage(@Query('url') url: string) {
    await this.uploadService.deleteFromCloudinary(url);
    return { success: true, message: 'Image supprimee avec succes' };
  }
}

