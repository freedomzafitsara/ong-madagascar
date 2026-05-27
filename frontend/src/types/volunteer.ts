// src/types/volunteer.ts

// ============================================================
// TYPES PRINCIPAUX
// ============================================================

export interface Volunteer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  birthDate?: string;
  gender?: 'M' | 'F' | 'other';
  profession?: string;
  skills: string[];
  interests: string[];
  availability: Availability;
  status: 'pending' | 'active' | 'inactive' | 'suspended';
  registeredAt: string;
  updatedAt: string;
  region?: string;
  photoUrl?: string;
}

export interface Availability {
  weekdays: boolean;
  weekends: boolean;
  evenings: boolean;
  fullTime: boolean;
  specificDays?: string[];
}

// ============================================================
// TYPES POUR LES MISSIONS (ASSIGNMENTS)
// ============================================================

export interface VolunteerAssignment {
  id: string;
  volunteerId: string;
  volunteerName?: string;
  projectId: string;
  projectName: string;
  role: string;
  tasks: string[];
  startDate: string;
  endDate: string | null;
  status: 'active' | 'completed' | 'cancelled';
  hoursLogged?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// TYPES POUR LES HEURES DE BENEVOLAT
// ============================================================

export interface VolunteerHour {
  id: string;
  volunteerId: string;
  volunteerName?: string;
  assignmentId: string;
  assignmentName?: string;
  date: string;
  hours: number;
  description: string;
  projectId: string;
  projectName: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// TYPES POUR LES STATISTIQUES
// ============================================================

export interface VolunteerStats {
  totalHours: number;
  monthlyHours: number;
  weeklyHours: number;
  assignmentsCount: number;
  activeAssignments: number;
  completedAssignments: number;
  hoursByProject: Record<string, number>;
  hoursByMonth: Record<string, number>;
  rank: 'bronze' | 'silver' | 'gold' | 'platinum';
  nextRankHours: number;
  rankColor: string;
}

// ============================================================
// TYPES POUR LES ATTESTATIONS (CERTIFICATES)
// ============================================================

export interface Certificate {
  id: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail?: string;
  totalHours: number;
  periodStart: string;
  periodEnd: string;
  issuedAt: string;
  certificateNumber: string;
  signedBy: string;
  signatureUrl?: string;
  projects?: string[];
}

// ============================================================
// TYPES POUR LES FILTRES ET REQUETES
// ============================================================

export interface VolunteerFilters {
  search?: string;
  region?: string;
  status?: string;
  skills?: string[];
  availability?: Partial<Availability>;
  page?: number;
  limit?: number;
}

export interface AssignmentFilters {
  search?: string;
  status?: string;
  projectId?: string;
  volunteerId?: string;
  page?: number;
  limit?: number;
}

export interface HourFilters {
  search?: string;
  status?: string;
  projectId?: string;
  volunteerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ============================================================
// TYPES POUR LES REPONSES API
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

// ============================================================
// FONCTIONS UTILITAIRES (types)
// ============================================================

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    active: 'Actif',
    inactive: 'Inactif',
    suspended: 'Suspendu',
    completed: 'Terminé',
    cancelled: 'Annulé',
    approved: 'Approuvé',
    rejected: 'Rejeté'
  };
  return labels[status] || status;
};

export const getRankLabel = (rank: string): string => {
  const labels: Record<string, string> = {
    bronze: 'Bronze',
    silver: 'Argent',
    gold: 'Or',
    platinum: 'Platine'
  };
  return labels[rank] || rank;
};

export const getRankColor = (rank: string): string => {
  const colors: Record<string, string> = {
    bronze: 'bg-amber-100 text-amber-700',
    silver: 'bg-gray-100 text-gray-600',
    gold: 'bg-yellow-100 text-yellow-700',
    platinum: 'bg-gray-200 text-gray-800'
  };
  return colors[rank] || 'bg-gray-100 text-gray-600';
};

// ============================================================
// INTERFACES POUR LES SERVICES
// ============================================================

export interface VolunteerServiceInterface {
  getAll: (filters?: VolunteerFilters) => Promise<PaginatedResponse<Volunteer>>;
  getById: (id: string) => Promise<Volunteer | null>;
  create: (data: Partial<Volunteer>) => Promise<Volunteer>;
  update: (id: string, data: Partial<Volunteer>) => Promise<Volunteer>;
  delete: (id: string) => Promise<void>;
  getAssignments: (volunteerId: string) => Promise<VolunteerAssignment[]>;
  getHours: (volunteerId: string, filters?: HourFilters) => Promise<PaginatedResponse<VolunteerHour>>;
  getStats: (volunteerId: string) => Promise<VolunteerStats>;
  getCertificates: (volunteerId: string) => Promise<Certificate[]>;
  generateCertificate: (volunteerId: string, periodStart: string, periodEnd: string, signedBy: string) => Promise<Certificate>;
}

export interface AssignmentServiceInterface {
  getAll: (filters?: AssignmentFilters) => Promise<PaginatedResponse<VolunteerAssignment>>;
  getById: (id: string) => Promise<VolunteerAssignment | null>;
  create: (data: Partial<VolunteerAssignment>) => Promise<VolunteerAssignment>;
  update: (id: string, data: Partial<VolunteerAssignment>) => Promise<VolunteerAssignment>;
  delete: (id: string) => Promise<void>;
  complete: (id: string) => Promise<VolunteerAssignment>;
  getByVolunteer: (volunteerId: string) => Promise<VolunteerAssignment[]>;
  getByProject: (projectId: string) => Promise<VolunteerAssignment[]>;
}

export interface HourServiceInterface {
  getAll: (filters?: HourFilters) => Promise<PaginatedResponse<VolunteerHour>>;
  getById: (id: string) => Promise<VolunteerHour | null>;
  create: (data: Partial<VolunteerHour>) => Promise<VolunteerHour>;
  update: (id: string, data: Partial<VolunteerHour>) => Promise<VolunteerHour>;
  delete: (id: string) => Promise<void>;
  approve: (id: string, approvedBy: string, notes?: string) => Promise<VolunteerHour>;
  reject: (id: string, notes: string) => Promise<VolunteerHour>;
  getByVolunteer: (volunteerId: string) => Promise<VolunteerHour[]>;
  getByAssignment: (assignmentId: string) => Promise<VolunteerHour[]>;
  getStats: (volunteerId?: string, startDate?: string, endDate?: string) => Promise<{
    totalHours: number;
    totalVolunteers: number;
    averageHours: number;
    hoursByProject: Record<string, number>;
    hoursByMonth: Record<string, number>;
  }>;
}

// ============================================================
// CONSTANTES
// ============================================================

export const VOLUNTEER_STATUSES = [
  { value: 'pending', label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'active', label: 'Actif', color: 'bg-green-100 text-green-700' },
  { value: 'inactive', label: 'Inactif', color: 'bg-gray-100 text-gray-700' },
  { value: 'suspended', label: 'Suspendu', color: 'bg-red-100 text-red-700' }
] as const;

export const ASSIGNMENT_STATUSES = [
  { value: 'active', label: 'En cours', color: 'bg-green-100 text-green-700' },
  { value: 'completed', label: 'Terminée', color: 'bg-blue-100 text-blue-700' },
  { value: 'cancelled', label: 'Annulée', color: 'bg-red-100 text-red-700' }
] as const;

export const HOUR_STATUSES = [
  { value: 'pending', label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'approved', label: 'Approuvé', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Rejeté', color: 'bg-red-100 text-red-700' }
] as const;

export const VOLUNTEER_RANKS = [
  { value: 'bronze', label: 'Bronze', minHours: 0, color: 'bg-amber-100 text-amber-700' },
  { value: 'silver', label: 'Argent', minHours: 50, color: 'bg-gray-100 text-gray-600' },
  { value: 'gold', label: 'Or', minHours: 200, color: 'bg-yellow-100 text-yellow-700' },
  { value: 'platinum', label: 'Platine', minHours: 500, color: 'bg-gray-200 text-gray-800' }
] as const;

// ============================================================
// FONCTIONS UTILITAIRES POUR LES CALCULS
// ============================================================

export const calculateRank = (totalHours: number): 'bronze' | 'silver' | 'gold' | 'platinum' => {
  if (totalHours >= 500) return 'platinum';
  if (totalHours >= 200) return 'gold';
  if (totalHours >= 50) return 'silver';
  return 'bronze';
};

export const calculateNextRankHours = (totalHours: number): number => {
  if (totalHours < 50) return 50 - totalHours;
  if (totalHours < 200) return 200 - totalHours;
  if (totalHours < 500) return 500 - totalHours;
  return 0;
};

export const calculateRankColor = (rank: string): string => {
  const rankConfig = VOLUNTEER_RANKS.find(r => r.value === rank);
  return rankConfig?.color || 'bg-gray-100 text-gray-700';
};

export const getStatusConfig = (status: string) => {
  return VOLUNTEER_STATUSES.find(s => s.value === status) || VOLUNTEER_STATUSES[0];
};

export const getAssignmentStatusConfig = (status: string) => {
  return ASSIGNMENT_STATUSES.find(s => s.value === status) || ASSIGNMENT_STATUSES[0];
};

export const getHourStatusConfig = (status: string) => {
  return HOUR_STATUSES.find(s => s.value === status) || HOUR_STATUSES[0];
};