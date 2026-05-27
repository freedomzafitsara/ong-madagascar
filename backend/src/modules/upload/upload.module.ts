import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { User } from '../../entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { Volunteer } from 'src/entities/volunteer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Volunteer]),
    ConfigModule,
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}