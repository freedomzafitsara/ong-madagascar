import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { UploadService } from '../upload/upload.service';
import { JobOffer } from '../../entities/job-offer.entity';
import { JobApplication } from '../../entities/job-application.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobOffer, JobApplication, User])],
  controllers: [JobsController],
  providers: [JobsService, UploadService],
  exports: [JobsService],
})
export class JobsModule {}