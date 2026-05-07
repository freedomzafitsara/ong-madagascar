export class CreateBlogPostDto {
  title: string;
  title_mg: string;
  content: string;
  content_mg: string;
  summary: string;
  summary_mg: string;
  type: string;
  tags?: string[];
  imageUrl?: string;
}

export class UpdateBlogPostDto {
  title?: string;
  title_mg?: string;
  content?: string;
  content_mg?: string;
  summary?: string;
  summary_mg?: string;
  type?: string;
  tags?: string[];
  imageUrl?: string;
  status?: string;
}