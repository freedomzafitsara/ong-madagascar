// frontend/src/types/contact.ts

export type ContactStatus = 'unread' | 'read' | 'replied' | 'archived';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: ContactStatus;
  admin_notes?: string | null;
  ip_address?: string | null;
  read_at?: string | null;
  replied_at?: string | null;
  created_at: string;
  updated_at: string;
  status_label?: string;
  status_color?: string;
}

export interface ContactStats {
  total: number;
  unread: number;
  read: number;
  replied: number;
  archived: number;
  thisWeek?: number;
  thisMonth?: number;
  pending?: number;
}

export interface CreateContactDto {
  full_name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface UpdateContactStatusDto {
  status: ContactStatus;
  admin_notes?: string;
}

export interface ReplyContactDto {
  reply: string;
  admin_notes?: string;
  cc?: string;
}

export interface PaginatedMessagesResponse {
  data: ContactMessage[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}