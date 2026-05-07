// src/services/volunteerService.ts
import api from './api';
import { Volunteer, VolunteerAssignment, VolunteerHour, VolunteerStats, Certificate } from '@/types/volunteer';

const STORAGE_KEYS = {
  VOLUNTEERS: 'ymad_volunteers',
  ASSIGNMENTS: 'ymad_assignments',
  HOURS: 'ymad_hours',
  CERTIFICATES: 'ymad_certificates'
};

export const volunteerService = {
  // ========================================
  // BÉNÉVOLES
  // ========================================
  
  async getAll(): Promise<Volunteer[]> {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.VOLUNTEERS);
    return stored ? JSON.parse(stored) : [];
  },
  
  async getById(id: string): Promise<Volunteer | null> {
    const volunteers = await this.getAll();
    return volunteers.find(v => v.id === id) || null;
  },
  
  async create(data: Omit<Volunteer, 'id' | 'registeredAt' | 'updatedAt'>): Promise<Volunteer> {
    const volunteers = await this.getAll();
    const newVolunteer: Volunteer = {
      ...data,
      id: Date.now().toString(),
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    volunteers.push(newVolunteer);
    localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(volunteers));
    return newVolunteer;
  },
  
  async update(id: string, data: Partial<Volunteer>): Promise<Volunteer | null> {
    const volunteers = await this.getAll();
    const index = volunteers.findIndex(v => v.id === id);
    if (index === -1) return null;
    volunteers[index] = { ...volunteers[index], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(volunteers));
    return volunteers[index];
  },
  
  async delete(id: string): Promise<boolean> {
    const volunteers = await this.getAll();
    const filtered = volunteers.filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(filtered));
    return true;
  },
  
  // ========================================
  // AFFECTATIONS
  // ========================================
  
  async getAssignments(volunteerId?: string): Promise<VolunteerAssignment[]> {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    const assignments: VolunteerAssignment[] = stored ? JSON.parse(stored) : [];
    if (volunteerId) {
      return assignments.filter(a => a.volunteerId === volunteerId);
    }
    return assignments;
  },
  
  async createAssignment(data: Omit<VolunteerAssignment, 'id' | 'createdAt'>): Promise<VolunteerAssignment> {
    const assignments = await this.getAssignments();
    const newAssignment: VolunteerAssignment = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    assignments.push(newAssignment);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    return newAssignment;
  },
  
  async updateAssignment(id: string, data: Partial<VolunteerAssignment>): Promise<VolunteerAssignment | null> {
    const assignments = await this.getAssignments();
    const index = assignments.findIndex(a => a.id === id);
    if (index === -1) return null;
    assignments[index] = { ...assignments[index], ...data };
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    return assignments[index];
  },
  
  // ========================================
  // HEURES
  // ========================================
  
  async getHours(volunteerId?: string, assignmentId?: string): Promise<VolunteerHour[]> {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.HOURS);
    let hours: VolunteerHour[] = stored ? JSON.parse(stored) : [];
    if (volunteerId) {
      hours = hours.filter(h => h.volunteerId === volunteerId);
    }
    if (assignmentId) {
      hours = hours.filter(h => h.assignmentId === assignmentId);
    }
    return hours.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  
  async addHours(data: Omit<VolunteerHour, 'id' | 'createdAt'>): Promise<VolunteerHour> {
    const hours = await this.getHours();
    const newHour: VolunteerHour = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    hours.push(newHour);
    localStorage.setItem(STORAGE_KEYS.HOURS, JSON.stringify(hours));
    return newHour;
  },
  
  async updateHours(id: string, data: Partial<VolunteerHour>): Promise<VolunteerHour | null> {
    const hours = await this.getHours();
    const index = hours.findIndex(h => h.id === id);
    if (index === -1) return null;
    hours[index] = { ...hours[index], ...data };
    localStorage.setItem(STORAGE_KEYS.HOURS, JSON.stringify(hours));
    return hours[index];
  },
  
  async approveHours(id: string, approvedBy: string): Promise<VolunteerHour | null> {
    return this.updateHours(id, {
      status: 'approved',
      approvedBy,
      approvedAt: new Date().toISOString()
    });
  },
  
  async rejectHours(id: string, notes: string): Promise<VolunteerHour | null> {
    return this.updateHours(id, { status: 'rejected', notes });
  },
  
  // ========================================
  // STATISTIQUES
  // ========================================
  
  async getStats(volunteerId: string): Promise<VolunteerStats> {
    const hours = await this.getHours(volunteerId);
    const assignments = await this.getAssignments(volunteerId);
    const approvedHours = hours.filter(h => h.status === 'approved');
    const totalHours = approvedHours.reduce((sum, h) => sum + h.hours, 0);
    
    // Heures du mois
    const now = new Date();
    const monthlyHours = approvedHours.filter(h => {
      const hDate = new Date(h.date);
      return hDate.getMonth() === now.getMonth() && hDate.getFullYear() === now.getFullYear();
    }).reduce((sum, h) => sum + h.hours, 0);
    
    // Heures de la semaine
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    const weeklyHours = approvedHours.filter(h => new Date(h.date) >= weekAgo).reduce((sum, h) => sum + h.hours, 0);
    
    // Heures par projet
    const hoursByProject: Record<string, number> = {};
    approvedHours.forEach(h => {
      hoursByProject[h.projectName] = (hoursByProject[h.projectName] || 0) + h.hours;
    });
    
    // Heures par mois
    const hoursByMonth: Record<string, number> = {};
    approvedHours.forEach(h => {
      const month = new Date(h.date).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
      hoursByMonth[month] = (hoursByMonth[month] || 0) + h.hours;
    });
    
    // Déterminer le rang
    let rank: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';
    let nextRankHours = 50;
    if (totalHours >= 500) { rank = 'platinum'; nextRankHours = 0; }
    else if (totalHours >= 200) { rank = 'gold'; nextRankHours = 500 - totalHours; }
    else if (totalHours >= 50) { rank = 'silver'; nextRankHours = 200 - totalHours; }
    else { rank = 'bronze'; nextRankHours = 50 - totalHours; }
    
    return {
      totalHours,
      monthlyHours,
      weeklyHours,
      assignmentsCount: assignments.length,
      activeAssignments: assignments.filter(a => a.status === 'active').length,
      completedAssignments: assignments.filter(a => a.status === 'completed').length,
      hoursByProject,
      hoursByMonth,
      rank,
      nextRankHours: Math.max(0, nextRankHours)
    };
  },
  
  // ========================================
  // ATTESTATIONS
  // ========================================
  
  async getCertificates(volunteerId?: string): Promise<Certificate[]> {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    let certificates: Certificate[] = stored ? JSON.parse(stored) : [];
    if (volunteerId) {
      certificates = certificates.filter(c => c.volunteerId === volunteerId);
    }
    return certificates.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  },
  
  async generateCertificate(volunteerId: string, periodStart: string, periodEnd: string, signedBy: string): Promise<Certificate> {
    const volunteer = await this.getById(volunteerId);
    if (!volunteer) throw new Error('Bénévole non trouvé');
    
    const hours = await this.getHours(volunteerId);
    const approvedHours = hours.filter(h => h.status === 'approved');
    const totalHours = approvedHours.reduce((sum, h) => sum + h.hours, 0);
    
    const certificates = await this.getCertificates();
    const newCertificate: Certificate = {
      id: Date.now().toString(),
      volunteerId,
      volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
      totalHours,
      periodStart,
      periodEnd,
      issuedAt: new Date().toISOString(),
      certificateNumber: `VOL-${new Date().getFullYear()}-${String(certificates.length + 1).padStart(4, '0')}`,
      signedBy
    };
    certificates.push(newCertificate);
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certificates));
    return newCertificate;
  }
};

export default volunteerService;