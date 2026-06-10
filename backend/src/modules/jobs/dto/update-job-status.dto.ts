// backend/src/modules/jobs/dto/update-job-status.dto.ts

import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export const JOB_STATUSES = ['draft', 'published', 'closed', 'expired', 'archived'] as const;
export type JobStatus = typeof JOB_STATUSES[number];

export class UpdateJobStatusDto {
  @IsString({ message: 'Le statut doit être une chaîne de caractères' })
  @IsIn(JOB_STATUSES, { 
    message: 'Le statut doit être: draft, published, closed, expired ou archived' 
  })
  @IsNotEmpty({ message: 'Le statut est requis' })
  status: JobStatus;
}