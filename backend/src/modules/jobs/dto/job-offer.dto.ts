// backend/src/modules/jobs/dto/create-job-offer.dto.ts

import { JobType, JobStatus } from '../../../entities/job-offer.entity';

export class CreateJobOfferDto {
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  company_name: string;        // ← snake_case pour correspondre à la BDD
  location?: string;
  region?: string;
  job_type: string;            // ← snake_case
  salary?: string;
  sector?: string;
  requirements?: string;       // ← Ajouté
  deadline?: Date;
  status?: JobStatus;          // ← Ajouté avec enum
  is_featured?: boolean;       // ← snake_case
  contact_email?: string;      // ← Ajouté
  contact_phone?: string;      // ← Ajouté
}

export class UpdateJobOfferDto {
  title?: string;
  title_mg?: string;
  description?: string;
  description_mg?: string;
  company_name?: string;       // ← snake_case
  location?: string;
  region?: string;
  job_type?: string;           // ← snake_case
  salary?: string;
  sector?: string;
  requirements?: string;
  deadline?: Date;
  status?: JobStatus;
  is_featured?: boolean;
  contact_email?: string;
  contact_phone?: string;
}

export class UpdateJobStatusDto {
  status: JobStatus;           // ← Utiliser l'enum pour type-safety
}