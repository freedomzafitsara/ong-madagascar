// backend/src/modules/events/dto/update-event.dto.ts
// DTO POUR LA MISE A JOUR DES EVENEMENTS

export class UpdateEventDto {
  title?: string;
  title_mg?: string;
  description?: string;
  description_mg?: string;
  type?: string;
  status?: string;
  location?: string;
  region?: string;
  startDate?: Date;
  endDate?: Date;
  maxCapacity?: number;
  isFree?: boolean;
  price?: number;
  imageUrl?: string;
  program?: string;
  speakers?: string;
  galleryImages?: string[];
}