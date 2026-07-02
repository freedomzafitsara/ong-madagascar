// backend/src/modules/upload/upload.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { UploadedFile } from '../../entities/uploaded-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UploadedFile])],
  controllers: [UploadController],
  providers: [UploadService], //  Utiliser la classe UploadService
  exports: [UploadService], //  Exporter la classe UploadService
})
export class UploadModule {}