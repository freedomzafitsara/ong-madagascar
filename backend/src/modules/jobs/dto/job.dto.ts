export class CreateJobOfferDto {
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  location?: string;
  region?: string;
  jobType?: string;
  sector?: string;
  salaryRange?: string;
  requirements?: string;
  requirements_mg?: string;
  benefits?: string;
  deadline?: Date;
  isFeatured?: boolean;
}

export class UpdateJobOfferDto extends CreateJobOfferDto {
  status?: string;
}

export class CreateJobApplicationDto {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  experienceYears?: number;
  coverLetter?: string;
  photoUrl?: string;
  cvUrl: string;
  diplomaUrl?: string;
  attestationUrl?: string;
}