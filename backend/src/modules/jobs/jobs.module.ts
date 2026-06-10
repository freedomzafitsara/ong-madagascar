// backend/src/modules/jobs/jobs.module.ts

import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobOffer } from '../../entities/job-offer.entity';
import { JobApplication } from '../../entities/job-application.entity';
import { User } from '../../entities/user.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobOffer, JobApplication, User]),
    UploadModule,
  ],
  controllers: [JobsController],
  providers: [
    JobsService,
    {
      provide: 'JOBS_LOGGER',
      useFactory: () => new Logger('JobsModule'),
    },
  ],
  exports: [
    JobsService,
    TypeOrmModule,
  ],
})
export class JobsModule {}  