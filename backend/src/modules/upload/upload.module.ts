// backend/src/modules/upload/upload.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { DatabaseImage } from '../../entities/database-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DatabaseImage])],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}