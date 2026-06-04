// backend/src/modules/jobs/dto/update-job-status.dto.ts

import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export type JobStatus = 'draft' | 'published' | 'closed' | 'expired' | 'archived';

const VALID_STATUSES: JobStatus[] = ['draft', 'published', 'closed', 'expired', 'archived'];

export class UpdateJobStatusDto {
  @IsString({ message: 'Le statut doit être une chaîne de caractères' })
  @IsIn(VALID_STATUSES, { 
    message: 'Le statut doit être: draft, published, closed, expired ou archived' 
  })
  @IsNotEmpty({ message: 'Le statut est requis' })
  status: JobStatus;
}