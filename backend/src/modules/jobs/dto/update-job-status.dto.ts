import { JobStatus } from '../../../entities/job-offer.entity';

export class UpdateJobStatusDto {
  status: JobStatus;
}