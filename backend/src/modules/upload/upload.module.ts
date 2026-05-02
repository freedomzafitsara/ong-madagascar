import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';

@Module({
  providers: [UploadService],
  exports: [UploadService],  // ← IMPORTANT: exporter le service
})
export class UploadModule {}