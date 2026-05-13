// frontend/src/types/index.ts

// ========================================
// 1. TYPES D'UTILISATEUR
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
  avatar_url?: string;
  photo?: string;
  bio?: string;
  position?: string;
  department?: string;
  skills?: string;
  socialLinkedin?: string;
  socialTwitter?: string;
  socialGithub?: string;
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
// 2. TYPES DE RÉPONSES API
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
// 3. TYPES DES BÉNÉFICIAIRES
// ========================================

export interface Beneficiary {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  email?: string;
  phone?: string;
  region?: string;
  commune?: string;
  fokontany?: string;
  educationLevel?: 'primaire' | 'ceg' | 'lycee' | 'universite' | 'aucun';
  employmentStatus?: 'chomeur' | 'etudiant' | 'employe' | 'entrepreneur';
  beforeYmAd?: string;
  afterYmAd?: string;
  userId?: string;
  user?: User;
  projects?: Project[];
  createdAt: string;
}

export interface BeneficiaryImpactStats {
  total: number;
  withBeforeAfter: number;
  improved: number;
  impactRate: number;
}

// ========================================
// 4. TYPES DES OFFRES D'EMPLOI
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

export interface JobStats {
  total: number;
  active: number;
  applications: number;
  pending: number;
  accepted: number;
  rejected: number;
}

// ========================================
// 5. TYPES DES PROJETS
// ========================================

export interface Project {
  id: string;
  title: string;
  titleMg?: string;
  description: string;
  descriptionMg?: string;
  budget?: number;
  spent?: number;
  region?: string;
  location?: string;
  category?: string;
  progress: number;
  beneficiariesCount?: number;
  status: 'planning' | 'active' | 'completed' | 'suspended' | 'draft' | 'cancelled';
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  galleryImages?: string[];
  youthImpact: number;
  jobsCreated: number;
  isFeatured: boolean;
  managerId?: string;
  manager?: User;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  budgetTotal: number;
  budgetSpent: number;
}

// ========================================
// 6. TYPES DES ÉVÉNEMENTS
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
// 7. TYPES DU BLOG
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
  authorId?: string;
  author?: User;
  beneficiaryId?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogStats {
  total: number;
  published: number;
  draft: number;
  totalViews: number;
}

// ========================================
// 8. TYPES DES MEMBRES
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

export interface MemberStats {
  total: number;
  active: number;
  expired: number;
  pending: number;
}

// ========================================
// 9. TYPES DES BÉNÉVOLES
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

export interface VolunteerStats {
  total: number;
  active: number;
  pending: number;
  totalHours: number;
}

// ========================================
// 10. TYPES DES PARTENAIRES
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
// 11. TYPES DES DONS
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

export interface DonationStats {
  total: number;
  monthly: number;
  count: number;
  average: number;
}

// ========================================
// 12. TYPES DU FOOTER
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
// 13. TYPES DES PAGES (CONTENU DYNAMIQUE) - CORRIGÉ
// ========================================

export interface PageContent {
  id: string;
  page: string;
  content: string;
  contentMg?: string;
  updatedAt: string;
}

// Version CORRIGÉE de PageBackground (compatible avec votre code)
export interface PageBackground {
  id: string;
  page: string;
  image_url: string;           // Note: snake_case pour correspondre à l'API
  mobile_url?: string;         // Optionnel
  thumbnail_url?: string;      // Optionnel
  alt_text?: string;           // Optionnel
  is_active: boolean;
  overlay_opacity: number;
  position: string;
  size: string;
  created_at: string;          // snake_case
  updated_at: string;          // snake_case
}

// Alias pour compatibilité avec les deux conventions (camelCase et snake_case)
export type PageBackgroundCompat = PageBackground & {
  imageUrl?: string;
  isActive?: boolean;
  overlayOpacity?: number;
  updatedAt?: string;
  createdAt?: string;
};

// ========================================
// 14. TYPES D'AUDIT
// ========================================

export interface AuditLog {
  id: string;
  userId?: string;
  user?: User;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';
  entityType: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ========================================
// 15. TYPES DES CONTACTS
// ========================================

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// ========================================
// 16. TYPES UTILITAIRES
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

export interface DashboardStats {
  totalUsers: number;
  totalMembers: number;
  activeMembers: number;
  totalProjects: number;
  activeProjects: number;
  totalEvents: number;
  upcomingEvents: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  totalDonations: number;
  monthlyDonations: number;
  totalVolunteers: number;
  activeVolunteers: number;
  totalBeneficiaries: number;
  impactRate: number;
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

// ========================================
// 17. TYPES DES CHARGEMENTS (UPLOAD)
// ========================================

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

// ========================================
// 18. TYPES DES NEWSLETTER
// ========================================

export interface NewsletterSubscription {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface NewsletterSendResult {
  success: boolean;
  totalSent: number;
  failed: number;
  message: string;
}

// ========================================
// 19. TYPES DES RAPPORTS
// ========================================

export interface Report {
  id: string;
  title: string;
  type: 'activity' | 'financial' | 'impact' | 'project' | 'event';
  periodStart?: string;
  periodEnd?: string;
  projectId?: string;
  fileUrl: string;
  generatedBy?: User;
  isPublic: boolean;
  createdAt: string;
}