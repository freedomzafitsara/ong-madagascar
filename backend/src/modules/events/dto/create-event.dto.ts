export class CreateEventDto {
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  type: string;
  location?: string;
  region?: string;
  startDate: Date;
  endDate: Date;
  maxCapacity?: number;
  isFree?: boolean;
  price?: number;
  imageUrl?: string;
  program?: string;
  speakers?: string;
}

export class RegisterToEventDto {
  eventId: string;
}