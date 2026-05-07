export class CreateJobApplicationDto {
  jobOfferId: string;
  fullName: string;
  email: string;
  address: string;
  phone?: string;
  experience?: string;
  coverLetter?: string;
}

export class UpdateApplicationStatusDto {
  status: string;
}