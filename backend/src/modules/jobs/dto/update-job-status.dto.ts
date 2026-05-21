import { IsEnum, IsNotEmpty } from 'class-validator';
import { JobStatus } from '../../../entities/job-offer.entity';

export class UpdateJobStatusDto {
  @IsEnum(JobStatus)
  @IsNotEmpty()
  status: JobStatus;
}