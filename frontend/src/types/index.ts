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
  beforeYmad?: string;
  afterYmad?: string;
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
  job_offer_id: string;
  jobOffer?: JobOffer;
  user_id?: string;
  user?: User;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  experience_years?: number;
  cover_letter?: string;
  photo_url?: string;
  cv_url: string;
  diploma_url?: string;
  attestation_url?: string;
  status: 'submitted' | 'reviewing' | 'shortlisted' | 'interview' | 'accepted' | 'rejected';
  notes?: string;
  reviewed_by?: string;
  reviewer?: User;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
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
  title_mg?: string;
  description: string;
  description_mg?: string;
  budget?: number;
  spent?: number;
  region?: string;
  location?: string;
  category?: string;
  progress: number;
  beneficiaries_count?: number;
  status: 'planning' | 'active' | 'completed' | 'suspended' | 'draft' | 'cancelled';
  start_date?: string;
  end_date?: string;
  image_url?: string;
  gallery_images?: string[];
  youth_impact: number;
  jobs_created: number;
  is_featured: boolean;
  manager_id?: string;
  manager?: User;
  created_at: string;
  updated_at: string;
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
  title_mg?: string;
  description: string;
  description_mg?: string;
  type: 'camp' | 'workshop' | 'hackathon' | 'conference' | 'formation';
  location?: string;
  region?: string;
  startDate: string;
  endDate?: string;
  maxCapacity?: number;
  currentRegistrations: number;
  isFree: boolean;
  price?: number;
  imageUrl?: string;
  image_url?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdBy?: string;
  created_by?: string;
  creator?: User;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  event?: Event;
  user_id?: string;
  user?: User;
  full_name: string;
  email: string;
  phone?: string;
  qr_code?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'waiting';
  payment_status: 'pending' | 'completed' | 'failed';
  checked_in: boolean;
  checked_in_at?: string;
  created_at: string;
}

// ========================================
// 7. TYPES DU BLOG
// ========================================

export interface BlogPost {
  id: string;
  title: string;
  title_mg?: string;
  slug: string;
  content: string;
  content_mg?: string;
  excerpt: string;
  excerpt_mg?: string;
  category: string;
  tags: string[];
  image_url?: string;
  views: number;
  status: 'draft' | 'published';
  author_id?: string;
  author?: User;
  beneficiary_id?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
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
  user_id: string;
  user?: User;
  member_number: string;
  membership_type: 'standard' | 'premium' | 'honorary' | 'student';
  status: 'pending' | 'active' | 'expired' | 'suspended';
  start_date: string;
  end_date: string;
  payment_method?: string;
  amount_paid?: number;
  card_url?: string;
  qr_code?: string;
  created_at: string;
  updated_at: string;
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
  user_id?: string;
  user?: User;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  skills: string[];
  availability_type: 'weekend' | 'weekday' | 'both';
  availability?: string;
  region?: string;
  status: 'pending' | 'active' | 'inactive';
  hours: number;
  certificate_url?: string;
  created_at: string;
  updated_at: string;
}

export interface VolunteerAssignment {
  id: string;
  volunteer_id: string;
  volunteer_name: string;
  project_id: string;
  project_name: string;
  role: string;
  tasks: string[];
  start_date: string;
  end_date: string | null;
  status: 'active' | 'completed' | 'cancelled';
  hours_logged?: number;
  created_at: string;
  updated_at: string;
}

export interface VolunteerHour {
  id: string;
  volunteer_id: string;
  volunteer_name?: string;
  assignment_id: string;
  assignment_name?: string;
  date: string;
  hours: number;
  description: string;
  project_id: string;
  project_name: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
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
  name_mg?: string;
  logo_url?: string;
  website?: string;
  description: string;
  description_mg?: string;
  type: 'entreprise' | 'ong' | 'ambassade' | 'institution';
  is_featured: boolean;
  contract_url?: string;
  contribution_amount?: number;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// 11. TYPES DES DONS
// ========================================

export interface Donation {
  id: string;
  user_id?: string;
  user?: User;
  donor_name: string;
  email: string;
  amount: number;
  project_id?: string;
  project?: Project;
  project_name?: string;
  event_id?: string;
  event?: Event;
  payment_method: 'mvola' | 'orange_money' | 'airtel' | 'bank' | 'cash' | 'paypal';
  transaction_id?: string;
  paypal_order_id?: string;
  paypal_payer_id?: string;
  receipt_number: string;
  message?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  confirmed_by?: string;
  confirmer?: User;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DonationStats {
  total: number;
  monthly: number;
  count: number;
  average: number;
  completed: number;
  pending: number;
  failed: number;
  totalAmount: number;
  monthlyAmount: number;
}

// ========================================
// 12. TYPES DU FOOTER
// ========================================

export interface FooterSection {
  id: string;
  title: string;
  title_mg?: string;
  order_num: number;
  is_active: boolean;
  links: FooterLink[];
  created_at: string;
  updated_at: string;
}

export interface FooterLink {
  id: string;
  title: string;
  title_mg?: string;
  url: string;
  icon?: string;
  order_num: number;
  is_active: boolean;
  section_id: string;
  created_at: string;
  updated_at: string;
}

export interface FooterContact {
  id: string;
  type: 'address' | 'phone' | 'email' | 'badge';
  value: string;
  value_mg?: string;
  icon?: string;
  order_num: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FooterLegalLink {
  id: string;
  title: string;
  title_mg?: string;
  url: string;
  order_num: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  hero?: string;
  sections?: any;
  stats?: any;
  cta?: any;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  is_published: boolean;
  custom_fields?: any;
  created_at: string;
  updated_at: string;
}

export interface PageBackground {
  id: string;
  page: string;
  image_url: string;
  mobile_url?: string;
  thumbnail_url?: string;
  alt_text?: string;
  is_active: boolean;
  overlay_opacity: number;
  position: string;
  size: string;
  created_at: string;
  updated_at: string;
}

export interface Background {
  id: string;
  page: string;
  image_url: string;
  mobile_url?: string;
  thumbnail_url?: string;
  alt_text?: string;
  is_active: boolean;
  overlay_opacity: number;
  position: string;
  size: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// 14. TYPES D'AUDIT
// ========================================

export interface AuditLog {
  id: string;
  user_id?: string;
  user?: User;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';
  entity: string;
  entity_id?: string;
  old_data?: any;
  new_data?: any;
  ip?: string;
  user_agent?: string;
  created_at: string;
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
  created_at: string;
  updated_at: string;
}

// ========================================
// 16. TYPES DES CERTIFICATS
// ========================================

export interface Certificate {
  id: string;
  volunteer_id: string;
  volunteer_name: string;
  volunteer_email?: string;
  total_hours: number;
  period_start: string;
  period_end: string;
  issued_at: string;
  certificate_number: string;
  signed_by: string;
  signature_url?: string;
  projects?: string[];
}

// ========================================
// 17. TYPES UTILITAIRES
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
// 18. TYPES DES CHARGEMENTS (UPLOAD)
// ========================================

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  secureUrl?: string;
  publicId?: string;
}

// ========================================
// 19. TYPES DES NEWSLETTER
// ========================================

export interface NewsletterSubscription {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface NewsletterSendResult {
  success: boolean;
  totalSent: number;
  failed: number;
  message: string;
}

// ========================================
// 20. TYPES DES RAPPORTS
// ========================================

export interface Report {
  id: string;
  title: string;
  type: 'activity' | 'financial' | 'impact' | 'project' | 'event';
  period_start?: string;
  period_end?: string;
  project_id?: string;
  file_url: string;
  generated_by?: string;
  generator?: User;
  is_public: boolean;
  created_at: string;
}

// ========================================
// 21. TYPES DES NOTIFICATIONS
// ========================================

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  link?: string;
  created_at: string;
}

// ========================================
// 22. TYPES PAGES (STATIQUES)
// ========================================

export interface Page {
  id: string;
  slug: string;
  title: string;
  title_mg?: string;
  content: string;
  content_mg?: string;
  meta_description?: string;
  meta_keywords?: string;
  status: 'draft' | 'published';
  author_id?: string;
  author?: User;
  created_at: string;
  updated_at: string;
}