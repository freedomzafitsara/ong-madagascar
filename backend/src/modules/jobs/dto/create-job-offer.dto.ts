import { JobType, JobStatus } from '../../../entities/job-offer.entity';

export class CreateJobOfferDto {
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  company_name: string;
  image_url?: string;        // ← Image de couverture
  location?: string;
  region?: string;
  job_type: JobType;
  sector?: string;
  salary?: string;
  requirements?: string;
  requirements_mg?: string;
  benefits?: string;
  deadline?: Date;
  is_featured?: boolean;
  contact_email?: string;
  contact_phone?: string;
  status?: JobStatus;
}

export class UpdateJobOfferDto {
  title?: string;
  title_mg?: string;
  description?: string;
  description_mg?: string;
  company_name?: string;
  image_url?: string;        // ← Image de couverture
  location?: string;
  region?: string;
  job_type?: JobType;
  sector?: string;
  salary?: string;
  requirements?: string;
  requirements_mg?: string;
  benefits?: string;
  deadline?: Date;
  is_featured?: boolean;
  contact_email?: string;
  contact_phone?: string;
  status?: JobStatus;
}