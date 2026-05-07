export class CreateJobOfferDto {
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  companyName: string;
  location?: string;
  region?: string;
  jobType: string;
  salary?: string;
  sector?: string;
  deadline?: Date;
  isFeatured?: boolean;
}

export class UpdateJobOfferDto {
  title?: string;
  title_mg?: string;
  description?: string;
  description_mg?: string;
  companyName?: string;
  location?: string;
  region?: string;
  jobType?: string;
  salary?: string;
  sector?: string;
  deadline?: Date;
  status?: string;
  isFeatured?: boolean;
}

export class UpdateJobStatusDto {
  status: string;
}