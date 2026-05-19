// backend/src/modules/jobs/dto/create-job-application.dto.ts

import { ApplicationStatus } from '../../../entities/job-application.entity';

export class CreateJobApplicationDto {
  job_offer_id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  experience_years?: number;
  cover_letter?: string;
  message?: string;
}

export class UpdateApplicationStatusDto {
  status: ApplicationStatus;
  notes?: string;
}