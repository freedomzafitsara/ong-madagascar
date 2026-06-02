// backend/src/modules/jobs/dto/update-job-offer.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateJobOfferDto } from './create-job-offer.dto';

export class UpdateJobOfferDto extends PartialType(CreateJobOfferDto) {}