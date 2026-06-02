// backend/src/modules/jobs/dto/update-job-status.dto.ts

import { IsEnum, IsNotEmpty } from 'class-validator';
import { JobStatus } from '../../../entities/job-offer.entity';

export class UpdateJobStatusDto {
  @IsEnum(JobStatus, { message: 'Le statut doit être une valeur valide parmi: draft, published, closed, expired, archived' })
  @IsNotEmpty({ message: 'Le statut est requis' })
  status: JobStatus;
}