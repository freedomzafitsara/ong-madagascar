// backend/src/modules/jobs/jobs.module.ts

import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobOffer } from '../../entities/job-offer.entity';
import { JobApplication } from '../../entities/job-application.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobOffer, JobApplication, User]),
    // UploadModule a été supprimé car non nécessaire pour le thème
    // Si vous avez besoin de l'upload, décommentez la ligne ci-dessous
    // mais assurez-vous que le module existe
    // UploadModule,
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