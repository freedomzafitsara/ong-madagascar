export interface CreateProjectDto {
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  location?: string;
  category?: string;
  region?: string;
  status?: string;
  budget?: number;
  beneficiaries_count?: number;
  youth_impact?: number;
  jobs_created?: number;
  progress?: number;
  start_date?: Date;
  end_date?: Date;
  image_url?: string;
  gallery_images?: string[];
  is_featured?: boolean;
}
