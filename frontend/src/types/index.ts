// frontend/src/types/index.ts

// ========================================
// TYPES D'UTILISATEUR
// ========================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'staff' | 'member' | 'volunteer' | 'partner' | 'visitor';
  region?: string;
  language?: 'fr' | 'mg';
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  region?: string;
}

// ========================================
// TYPES DE RÉPONSES API
// ========================================

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode?: number;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========================================
// TYPES DES OFFRES D'EMPLOI
// ========================================

export interface JobOffer {
  id: string;
  title: string;
  titleMg?: string;
  description: string;
  descriptionMg?: string;
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  location?: string;
  region?: string;
  jobType: 'cdi' | 'cdd' | 'stage' | 'freelance' | 'benevolat';
  sector?: string;
  salaryRange?: string;
  requirements?: string;
  requirementsMg?: string;
  benefits?: string;
  deadline?: string;
  status: 'draft' | 'published' | 'closed' | 'expired';
  applicationsCount: number;
  isFeatured: boolean;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobOfferId: string;
  jobOffer?: JobOffer;
  userId?: string;
  user?: User;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  experienceYears?: number;
  coverLetter?: string;
  photoUrl?: string;
  cvUrl: string;
  diplomaUrl?: string;
  attestationUrl?: string;
  status: 'submitted' | 'reviewing' | 'shortlisted' | 'interview' | 'accepted' | 'rejected';
  notes?: string;
  reviewedBy?: User;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// TYPES DES PROJETS
// ========================================

export interface Project {
  id: string;
  title: string;
  titleMg?: string;
  description: string;
  descriptionMg?: string;
  budget?: number;
  region?: string;
  location?: string;
  category?: string;
  progress: number;
  status: 'planning' | 'active' | 'completed' | 'suspended';
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  galleryImages?: string[];
  youthImpact: number;
  jobsCreated: number;
  isFeatured: boolean;
  manager?: User;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// TYPES DES ÉVÉNEMENTS
// ========================================

export interface Event {
  id: string;
  title: string;
  titleMg?: string;
  description: string;
  descriptionMg?: string;
  eventType: 'camp' | 'workshop' | 'hackathon' | 'conference' | 'formation';
  location?: string;
  region?: string;
  startDatetime: string;
  endDatetime?: string;
  maxCapacity?: number;
  currentRegistrations: number;
  isFree: boolean;
  priceMga?: number;
  imageUrl?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  event?: Event;
  userId?: string;
  user?: User;
  fullName: string;
  email: string;
  phone?: string;
  qrCode?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'waiting';
  paymentStatus: 'pending' | 'completed' | 'failed';
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
}

// ========================================
// TYPES DU BLOG
// ========================================

export interface BlogPost {
  id: string;
  title: string;
  titleMg?: string;
  slug: string;
  content: string;
  contentMg?: string;
  excerpt: string;
  excerptMg?: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  views: number;
  status: 'draft' | 'published';
  author?: User;
  beneficiaryId?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// TYPES DES MEMBRES
// ========================================

export interface Member {
  id: string;
  userId: string;
  user?: User;
  memberNumber: string;
  membershipType: 'standard' | 'premium' | 'honorary' | 'student';
  status: 'pending' | 'active' | 'expired' | 'suspended';
  startDate: string;
  endDate: string;
  paymentMethod?: string;
  paymentAmount?: number;
  cardUrl?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// TYPES DES BÉNÉVOLES
// ========================================

export interface Volunteer {
  id: string;
  userId?: string;
  user?: User;
  skills: string[];
  availability: 'weekday' | 'weekend' | 'flexible' | 'occasional';
  experience?: string;
  motivations?: string;
  status: 'pending' | 'active' | 'inactive';
  hoursWorked: number;
  certificateUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// TYPES DES PARTENAIRES
// ========================================

export interface Partner {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  description: string;
  descriptionMg?: string;
  partnerType: 'entreprise' | 'ong' | 'ambassade' | 'institution';
  isFeatured: boolean;
  contractUrl?: string;
  contributionAmount?: number;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// TYPES DES DONS
// ========================================

export interface Donation {
  id: string;
  userId?: string;
  user?: User;
  projectId?: string;
  project?: Project;
  eventId?: string;
  event?: Event;
  amount: number;
  currency: 'MGA' | 'EUR' | 'USD';
  paymentMethod: 'mvola' | 'orange_money' | 'airtel' | 'bank' | 'cash' | 'paypal';
  phoneNumber?: string;
  receiptNumber: string;
  isRecurring: boolean;
  recurringPeriod?: 'monthly' | 'yearly';
  status: 'pending' | 'completed' | 'failed';
  donorName?: string;
  donorEmail?: string;
  message?: string;
  createdAt: string;
}

// ========================================
// TYPES DU FOOTER
// ========================================

export interface FooterSection {
  id: string;
  title: string;
  titleMg?: string;
  order: number;
  isActive: boolean;
  links: FooterLink[];
}

export interface FooterLink {
  id: string;
  title: string;
  titleMg?: string;
  url: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

export interface FooterContact {
  id: string;
  type: 'address' | 'phone' | 'email' | 'badge';
  value: string;
  valueMg?: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

export interface FooterLegalLink {
  id: string;
  title: string;
  titleMg?: string;
  url: string;
  order: number;
  isActive: boolean;
}

export interface FooterData {
  sections: FooterSection[];
  contactInfo: FooterContact[];
  legalLinks: FooterLegalLink[];
  copyright: string;
}

// ========================================
// TYPES D'AUDIT
// ========================================

export interface AuditLog {
  id: string;
  userId?: string;
  user?: User;
  action: string;
  entityType: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ========================================
// TYPES UTILITAIRES
// ========================================

export interface Stats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBeneficiaries: number;
  totalVolunteers: number;
  totalDonations: number;
  totalDonationsAmount: number;
  totalJobsPublished: number;
  totalApplications: number;
  treesPlanted: number;
  regionsCovered: number;
  partnersCount: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface FilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  region?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}