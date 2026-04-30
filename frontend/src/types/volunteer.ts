// src/types/volunteer.ts
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
  availability: {
    weekdays: boolean;
    weekends: boolean;
    evenings: boolean;
    fullTime: boolean;
    specificDays?: string[];
  };
  status: 'pending' | 'active' | 'inactive' | 'suspended';
  registeredAt: string;
  updatedAt: string;
}

export interface VolunteerAssignment {
  id: string;
  volunteerId: string;
  projectId: string;
  projectName: string;
  role: string;
  tasks: string[];
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface VolunteerHour {
  id: string;
  volunteerId: string;
  assignmentId: string;
  date: string;
  hours: number;
  description: string;
  projectId: string;
  projectName: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
}

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
}

export interface Certificate {
  id: string;
  volunteerId: string;
  volunteerName: string;
  totalHours: number;
  periodStart: string;
  periodEnd: string;
  issuedAt: string;
  certificateNumber: string;
  signedBy: string;
  signatureUrl?: string;
}