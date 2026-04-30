export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  region?: string;
  isActive: boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
