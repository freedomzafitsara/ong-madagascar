// src/services/volunteerService.ts
import api from './api';
import { 
  Volunteer, 
  VolunteerAssignment, 
  VolunteerHour, 
  VolunteerStats, 
  Certificate,
  VolunteerFilters,
  AssignmentFilters,
  HourFilters,
  PaginatedResponse
} from '@/types/volunteer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

const STORAGE_KEYS = {
  VOLUNTEERS: 'ymad_volunteers_demo',
  ASSIGNMENTS: 'ymad_assignments_demo',
  HOURS: 'ymad_hours_demo',
  CERTIFICATES: 'ymad_certificates_demo'
};

// ============================================================
// FONCTIONS UTILITAIRES POUR LA DÉMO
// ============================================================

const isBrowser = (): boolean => typeof window !== 'undefined';

const getDemoVolunteers = (): Volunteer[] => {
  if (!isBrowser()) return [];
  const stored = localStorage.getItem(STORAGE_KEYS.VOLUNTEERS);
  if (stored) return JSON.parse(stored);
  
  const demoVolunteers: Volunteer[] = [
    {
      id: '1',
      firstName: 'Paul',
      lastName: 'Rasoa',
      email: 'paul@example.com',
      phone: '034 00 000 01',
      skills: ['Informatique', 'Communication'],
      interests: ['Technologie', 'Éducation'],
      availability: { weekdays: true, weekends: true, evenings: false, fullTime: false },
      status: 'active',
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      region: 'Analamanga'
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Rajaona',
      email: 'sarah@example.com',
      phone: '034 00 000 02',
      skills: ['Médical', 'Formation'],
      interests: ['Santé', 'Social'],
      availability: { weekdays: true, weekends: false, evenings: true, fullTime: false },
      status: 'active',
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      region: 'Analamanga'
    }
  ];
  localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(demoVolunteers));
  return demoVolunteers;
};

const getDemoAssignments = (): VolunteerAssignment[] => {
  if (!isBrowser()) return [];
  const stored = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
  if (stored) return JSON.parse(stored);
  
  const demoAssignments: VolunteerAssignment[] = [
    {
      id: '1',
      volunteerId: '1',
      volunteerName: 'Paul Rasoa',
      projectId: '1',
      projectName: 'Éducation pour tous',
      role: 'Coordinateur terrain',
      tasks: ['Organisation des sessions', 'Suivi des bénéficiaires'],
      startDate: '2025-01-15',
      endDate: '2025-06-15',
      status: 'active',
      hoursLogged: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(demoAssignments));
  return demoAssignments;
};

// ============================================================
// SERVICE DES BÉNÉVOLES
// ============================================================

export const volunteerService = {
  // ========================================
  // BÉNÉVOLES
  // ========================================
  
  async getAll(filters?: VolunteerFilters): Promise<PaginatedResponse<Volunteer>> {
    try {
      // Tentative d'appel API réel
      const token = localStorage.getItem('token');
      if (token) {
        const queryParams = new URLSearchParams();
        if (filters?.page) queryParams.append('page', filters.page.toString());
        if (filters?.limit) queryParams.append('limit', filters.limit.toString());
        if (filters?.search) queryParams.append('search', filters.search);
        if (filters?.region) queryParams.append('region', filters.region);
        if (filters?.status) queryParams.append('status', filters.status);
        
        const response = await fetch(`${API_URL}/volunteers?${queryParams.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          return await response.json();
        }
      }
      
      // Fallback en mode démo
      let volunteers = getDemoVolunteers();
      
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        volunteers = volunteers.filter(v => 
          `${v.firstName} ${v.lastName}`.toLowerCase().includes(searchLower) ||
          v.email.toLowerCase().includes(searchLower)
        );
      }
      if (filters?.region) {
        volunteers = volunteers.filter(v => v.region === filters.region);
      }
      if (filters?.status) {
        volunteers = volunteers.filter(v => v.status === filters.status);
      }
      
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const start = (page - 1) * limit;
      const paginatedData = volunteers.slice(start, start + limit);
      
      return {
        data: paginatedData,
        total: volunteers.length,
        page,
        limit,
        totalPages: Math.ceil(volunteers.length / limit)
      };
    } catch (error) {
      console.error('Erreur chargement bénévoles:', error);
      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
  },
  
  async getById(id: string): Promise<Volunteer | null> {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${API_URL}/volunteers/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          return await response.json();
        }
      }
      
      const volunteers = getDemoVolunteers();
      return volunteers.find(v => v.id === id) || null;
    } catch (error) {
      console.error('Erreur chargement bénévole:', error);
      return null;
    }
  },
  
  async create(data: Partial<Volunteer>): Promise<Volunteer> {
    const token = localStorage.getItem('token');
    if (token) {
      const response = await fetch(`${API_URL}/volunteers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        return await response.json();
      }
    }
    
    // Fallback démo
    const volunteers = getDemoVolunteers();
    const newVolunteer: Volunteer = {
      id: Date.now().toString(),
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      skills: data.skills || [],
      interests: data.interests || [],
      availability: data.availability || { weekdays: false, weekends: false, evenings: false, fullTime: false },
      status: data.status || 'pending',
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      region: data.region
    };
    volunteers.push(newVolunteer);
    localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(volunteers));
    return newVolunteer;
  },
  
  async update(id: string, data: Partial<Volunteer>): Promise<Volunteer | null> {
    const token = localStorage.getItem('token');
    if (token) {
      const response = await fetch(`${API_URL}/volunteers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        return await response.json();
      }
    }
    
    const volunteers = getDemoVolunteers();
    const index = volunteers.findIndex(v => v.id === id);
    if (index === -1) return null;
    volunteers[index] = { ...volunteers[index], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(volunteers));
    return volunteers[index];
  },
  
  async delete(id: string): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (token) {
      const response = await fetch(`${API_URL}/volunteers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        return true;
      }
    }
    
    const volunteers = getDemoVolunteers();
    const filtered = volunteers.filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(filtered));
    return true;
  },
  
  // ========================================
  // AFFECTATIONS (MISSIONS)
  // ========================================
  
  async getAssignments(volunteerId?: string, filters?: AssignmentFilters): Promise<VolunteerAssignment[]> {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        let url = `${API_URL}/volunteer-assignments`;
        const params = new URLSearchParams();
        if (volunteerId) params.append('volunteerId', volunteerId);
        if (filters?.status) params.append('status', filters.status);
        if (params.toString()) url += `?${params.toString()}`;
        
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          return data.data || [];
        }
      }
      
      let assignments = getDemoAssignments();
      if (volunteerId) {
        assignments = assignments.filter(a => a.volunteerId === volunteerId);
      }
      if (filters?.status && filters.status !== 'all') {
        assignments = assignments.filter(a => a.status === filters.status);
      }
      return assignments;
    } catch (error) {
      console.error('Erreur chargement missions:', error);
      return [];
    }
  },
  
  async createAssignment(data: Partial<VolunteerAssignment>): Promise<VolunteerAssignment> {
    const assignments = getDemoAssignments();
    const newAssignment: VolunteerAssignment = {
      id: Date.now().toString(),
      volunteerId: data.volunteerId || '',
      volunteerName: data.volunteerName || '',
      projectId: data.projectId || '',
      projectName: data.projectName || '',
      role: data.role || '',
      tasks: data.tasks || [],
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || null,
      status: data.status || 'active',
      hoursLogged: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    assignments.push(newAssignment);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    return newAssignment;
  },
  
  async updateAssignment(id: string, data: Partial<VolunteerAssignment>): Promise<VolunteerAssignment | null> {
    const assignments = getDemoAssignments();
    const index = assignments.findIndex(a => a.id === id);
    if (index === -1) return null;
    assignments[index] = { ...assignments[index], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    return assignments[index];
  },
  
  async deleteAssignment(id: string): Promise<boolean> {
    const assignments = getDemoAssignments();
    const filtered = assignments.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(filtered));
    return true;
  },
  
  async completeAssignment(id: string): Promise<VolunteerAssignment | null> {
    return this.updateAssignment(id, {
      status: 'completed',
      endDate: new Date().toISOString().split('T')[0]
    });
  },
  
  // ========================================
  // HEURES DE BÉNÉVOLAT
  // ========================================
  
  async getHours(volunteerId?: string, assignmentId?: string, filters?: HourFilters): Promise<VolunteerHour[]> {
    if (!isBrowser()) return [];
    const stored = localStorage.getItem(STORAGE_KEYS.HOURS);
    let hours: VolunteerHour[] = stored ? JSON.parse(stored) : [];
    
    if (volunteerId) {
      hours = hours.filter(h => h.volunteerId === volunteerId);
    }
    if (assignmentId) {
      hours = hours.filter(h => h.assignmentId === assignmentId);
    }
    if (filters?.status && filters.status !== 'all') {
      hours = hours.filter(h => h.status === filters.status);
    }
    
    return hours.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  
  async addHours(data: Partial<VolunteerHour>): Promise<VolunteerHour> {
    const hours = await this.getHours();
    const newHour: VolunteerHour = {
      id: Date.now().toString(),
      volunteerId: data.volunteerId || '',
      assignmentId: data.assignmentId || '',
      date: data.date || new Date().toISOString().split('T')[0],
      hours: data.hours || 0,
      description: data.description || '',
      projectId: data.projectId || '',
      projectName: data.projectName || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    hours.push(newHour);
    localStorage.setItem(STORAGE_KEYS.HOURS, JSON.stringify(hours));
    return newHour;
  },
  
  async updateHours(id: string, data: Partial<VolunteerHour>): Promise<VolunteerHour | null> {
    const hours = await this.getHours();
    const index = hours.findIndex(h => h.id === id);
    if (index === -1) return null;
    hours[index] = { ...hours[index], ...data, updatedAt: new Date().toISOString() };
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
  
  async deleteHours(id: string): Promise<boolean> {
    const hours = await this.getHours();
    const filtered = hours.filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.HOURS, JSON.stringify(filtered));
    return true;
  },
  
  // ========================================
  // STATISTIQUES
  // ========================================
  
  async getStats(volunteerId: string): Promise<VolunteerStats> {
    const hours = await this.getHours(volunteerId);
    const assignments = await this.getAssignments(volunteerId);
    const approvedHours = hours.filter(h => h.status === 'approved');
    const totalHours = approvedHours.reduce((sum, h) => sum + h.hours, 0);
    
    const now = new Date();
    const monthlyHours = approvedHours.filter(h => {
      const hDate = new Date(h.date);
      return hDate.getMonth() === now.getMonth() && hDate.getFullYear() === now.getFullYear();
    }).reduce((sum, h) => sum + h.hours, 0);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyHours = approvedHours.filter(h => new Date(h.date) >= weekAgo).reduce((sum, h) => sum + h.hours, 0);
    
    const hoursByProject: Record<string, number> = {};
    approvedHours.forEach(h => {
      hoursByProject[h.projectName] = (hoursByProject[h.projectName] || 0) + h.hours;
    });
    
    const hoursByMonth: Record<string, number> = {};
    approvedHours.forEach(h => {
      const month = new Date(h.date).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
      hoursByMonth[month] = (hoursByMonth[month] || 0) + h.hours;
    });
    
    let rank: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';
    let nextRankHours = 50;
    if (totalHours >= 500) { rank = 'platinum'; nextRankHours = 0; }
    else if (totalHours >= 200) { rank = 'gold'; nextRankHours = 500 - totalHours; }
    else if (totalHours >= 50) { rank = 'silver'; nextRankHours = 200 - totalHours; }
    else { rank = 'bronze'; nextRankHours = 50 - totalHours; }
    
    const rankColor = rank === 'platinum' ? 'bg-gray-200 text-gray-800' :
                      rank === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                      rank === 'silver' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700';
    
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
      nextRankHours: Math.max(0, nextRankHours),
      rankColor
    };
  },
  
  // ========================================
  // ATTESTATIONS
  // ========================================
  
  async getCertificates(volunteerId?: string): Promise<Certificate[]> {
    if (!isBrowser()) return [];
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
      volunteerEmail: volunteer.email,
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
  },
  
  async deleteCertificate(id: string): Promise<boolean> {
    const certificates = await this.getCertificates();
    const filtered = certificates.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(filtered));
    return true;
  }
};

export default volunteerService;