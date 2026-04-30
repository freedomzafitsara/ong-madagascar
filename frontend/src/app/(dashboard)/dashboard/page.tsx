'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, Users, FileText, Eye, TrendingUp, Calendar, 
  CheckCircle, Clock, AlertCircle, ArrowRight, Heart,
  Building, Mail, Phone, MapPin, DollarSign, Shield,
  FolderOpen, LayoutDashboard, Home, Plus,
  Activity, BarChart3, Target, Award, Globe,
  Zap, Sparkles, UserCheck, FileCheck, AlertTriangle,
  Settings, Bell, HelpCircle, LogOut, RefreshCw,
  Menu, X, ChevronLeft, ChevronRight, Smartphone, Tablet,
  Download, TrendingDown, PieChart, Filter, Search,
  Star, UsersRound, BookOpen, Gift, HandHeart, Leaf
} from 'lucide-react';

// ========================================
// DÉFINITION DES TYPES
// ========================================
interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  status: string;
  createdAt: string;
  deadline: string;
  views: number;
  applications: number;
}

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  status: string;
  jobTitle: string;
  appliedAt: string;
  experience?: string;
  education?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  createdAt?: string;
}

interface Project {
  id: string;
  title: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  beneficiaries: number;
  region: string;
  createdAt: string;
}

interface BlogPost {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  viewsCount: number;
  likes: number;
  category: string;
}

interface Volunteer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  skills: string;
  status: string;
  hoursVolunteered: number;
  registeredAt: string;
}

interface Donation {
  id: string;
  amount: number;
  donorName: string;
  donorEmail?: string;
  status: string;
  createdAt: string;
  method: string;
  projectId: string | null;
}

interface Beneficiary {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  region: string;
  beforeIncome: number;
  afterIncome: number;
  employmentStatus: string;
  projectId: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  registrations: number;
  maxCapacity: number;
  status: string;
}

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBlogPosts: number;
  publishedPosts: number;
  totalVolunteers: number;
  activeVolunteers: number;
  totalDonations: number;
  monthlyDonations: number;
  donationGrowth: number;
  totalBeneficiaries: number;
  employmentRate: number;
  averageIncomeIncrease: number;
  recentApplications: Application[];
  recentJobs: Job[];
  recentBlogPosts: BlogPost[];
  recentDonations: Donation[];
  upcomingEvents: Event[];
  topProjects: Project[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

interface ActivityLog {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  details: string;
}

// ========================================
// DONNÉES PAR DÉFAUT
// ========================================
const defaultJobs: Job[] = [
  { id: '1', title: 'Coordinateur de projet', department: 'Programmes', location: 'Antananarivo', status: 'open', createdAt: new Date().toISOString(), deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), views: 245, applications: 12 },
  { id: '2', title: 'Chargé de communication', department: 'Communication', location: 'Antananarivo', status: 'open', createdAt: new Date().toISOString(), deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), views: 189, applications: 8 },
  { id: '3', title: 'Développeur Web', department: 'IT', location: 'Remote', status: 'open', createdAt: new Date().toISOString(), deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), views: 567, applications: 23 },
];

const defaultApplications: Application[] = [
  { id: '1', fullName: 'Jean Rakoto', email: 'jean@email.com', phone: '0341234567', status: 'pending', jobTitle: 'Coordinateur de projet', appliedAt: new Date().toISOString(), experience: '3 ans', education: 'Master' },
  { id: '2', fullName: 'Marie Randria', email: 'marie@email.com', phone: '0341234568', status: 'reviewing', jobTitle: 'Chargé de communication', appliedAt: new Date().toISOString(), experience: '2 ans', education: 'Licence' },
  { id: '3', fullName: 'Tovo Andria', email: 'tovo@email.com', phone: '0341234569', status: 'accepted', jobTitle: 'Développeur Web', appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), experience: '5 ans', education: 'Master' },
];

const defaultProjects: Project[] = [
  { id: '1', title: 'Éducation pour tous', status: 'active', progress: 75, budget: 50000000, spent: 37500000, beneficiaries: 1250, region: 'Analamanga', createdAt: new Date().toISOString() },
  { id: '2', title: 'Reforestation Madagascar', status: 'active', progress: 45, budget: 30000000, spent: 13500000, beneficiaries: 500, region: 'Atsimo-Andrefana', createdAt: new Date().toISOString() },
  { id: '3', title: 'Santé Mère-Enfant', status: 'completed', progress: 100, budget: 25000000, spent: 25000000, beneficiaries: 3000, region: 'Vakinankaratra', createdAt: new Date().toISOString() },
  { id: '4', title: 'Formation Professionnelle', status: 'active', progress: 60, budget: 40000000, spent: 24000000, beneficiaries: 800, region: 'Haute Matsiatra', createdAt: new Date().toISOString() },
];

const defaultBlogPosts: BlogPost[] = [
  { id: '1', title: 'Lancement du projet éducatif', status: 'published', createdAt: new Date().toISOString(), viewsCount: 245, likes: 34, category: 'actualite' },
  { id: '2', title: '1000 arbres plantés', status: 'published', createdAt: new Date().toISOString(), viewsCount: 189, likes: 56, category: 'environnement' },
  { id: '3', title: 'Campagne de collecte', status: 'published', createdAt: new Date().toISOString(), viewsCount: 312, likes: 78, category: 'don' },
];

const defaultVolunteers: Volunteer[] = [
  { id: '1', fullName: 'Paul Rasoa', email: 'paul@email.com', phone: '0341234570', skills: 'Communication', status: 'active', hoursVolunteered: 45, registeredAt: new Date().toISOString() },
  { id: '2', fullName: 'Sarah Andria', email: 'sarah@email.com', phone: '0341234571', skills: 'Informatique', status: 'active', hoursVolunteered: 32, registeredAt: new Date().toISOString() },
];

const defaultBeneficiaries: Beneficiary[] = [
  { id: '1', firstName: 'Rivo', lastName: 'Andria', age: 22, region: 'Analamanga', beforeIncome: 150000, afterIncome: 350000, employmentStatus: 'employed', projectId: '1' },
  { id: '2', firstName: 'Lanto', lastName: 'Rakoto', age: 25, region: 'Atsimo-Andrefana', beforeIncome: 100000, afterIncome: 250000, employmentStatus: 'employed', projectId: '2' },
];

const defaultDonations: Donation[] = [
  { id: '1', amount: 25000, donorName: 'Donateur 1', donorEmail: 'don1@email.com', status: 'completed', createdAt: new Date().toISOString(), method: 'mvola', projectId: '1' },
  { id: '2', amount: 50000, donorName: 'Donateur 2', donorEmail: 'don2@email.com', status: 'completed', createdAt: new Date().toISOString(), method: 'orange_money', projectId: '2' },
  { id: '3', amount: 100000, donorName: 'Donateur 4', donorEmail: 'don4@email.com', status: 'completed', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), method: 'bank', projectId: '1' },
];

const defaultEvents: Event[] = [
  { id: '1', title: 'Camp de leadership', date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), location: 'Antananarivo', registrations: 45, maxCapacity: 100, status: 'upcoming' },
  { id: '2', title: 'Hackathon Y-Mad', date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), location: 'Mahajanga', registrations: 28, maxCapacity: 50, status: 'upcoming' },
];

// URL de l'API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

// Fonction d'initialisation
const initializeData = (): void => {
  if (!localStorage.getItem('ymad_jobs')) localStorage.setItem('ymad_jobs', JSON.stringify(defaultJobs));
  if (!localStorage.getItem('ymad_applications')) localStorage.setItem('ymad_applications', JSON.stringify(defaultApplications));
  if (!localStorage.getItem('ymad_projects')) localStorage.setItem('ymad_projects', JSON.stringify(defaultProjects));
  if (!localStorage.getItem('ymad_blog_posts')) localStorage.setItem('ymad_blog_posts', JSON.stringify(defaultBlogPosts));
  if (!localStorage.getItem('ymad_volunteers')) localStorage.setItem('ymad_volunteers', JSON.stringify(defaultVolunteers));
  if (!localStorage.getItem('ymad_donations')) localStorage.setItem('ymad_donations', JSON.stringify(defaultDonations));
  if (!localStorage.getItem('ymad_beneficiaries')) localStorage.setItem('ymad_beneficiaries', JSON.stringify(defaultBeneficiaries));
  if (!localStorage.getItem('ymad_events')) localStorage.setItem('ymad_events', JSON.stringify(defaultEvents));
  if (!localStorage.getItem('ymad_notifications')) localStorage.setItem('ymad_notifications', JSON.stringify([]));
};

export default function AdminDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Administrateur');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('admin');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [useApi, setUseApi] = useState<boolean>(true);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBlogPosts: 0,
    publishedPosts: 0,
    totalVolunteers: 0,
    activeVolunteers: 0,
    totalDonations: 0,
    monthlyDonations: 0,
    donationGrowth: 0,
    totalBeneficiaries: 0,
    employmentRate: 0,
    averageIncomeIncrease: 0,
    recentApplications: [],
    recentJobs: [],
    recentBlogPosts: [],
    recentDonations: [],
    upcomingEvents: [],
    topProjects: []
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);

  // Détecter la taille de l'écran
  useEffect(() => {
    const checkMobile = (): void => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    // Récupérer les infos utilisateur
    const email = localStorage.getItem('admin_email') || localStorage.getItem('userEmail');
    const name = localStorage.getItem('admin_name') || localStorage.getItem('userName');
    const role = localStorage.getItem('admin_role') || 'admin';
    
    if (email) setUserEmail(email);
    if (name) setUserName(name);
    if (role) setUserRole(role);
    
    initializeData();
    loadDashboardData();
    loadNotifications();
    loadRecentActivity();
    
    const interval = setInterval(() => {
      loadDashboardData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [router]);

  // ========================================
  // CHARGEMENT DES DONNÉES - VERSION CORRIGÉE
  // ========================================
  
  const loadDashboardData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      let jobs: Job[] = [];
      let applications: Application[] = [];
      let projects: Project[] = [];
      let blogPosts: BlogPost[] = [];
      let volunteers: Volunteer[] = [];
      let donations: Donation[] = [];
      let beneficiaries: Beneficiary[] = [];
      let events: Event[] = [];
      
      let apiSuccess = false;
      
      // Tentative de chargement depuis l'API (optionnel)
      if (useApi) {
        try {
          // Récupérer depuis localStorage pour l'instant (API à connecter plus tard)
          jobs = JSON.parse(localStorage.getItem('ymad_jobs') || '[]');
          applications = JSON.parse(localStorage.getItem('ymad_applications') || '[]');
          projects = JSON.parse(localStorage.getItem('ymad_projects') || '[]');
          blogPosts = JSON.parse(localStorage.getItem('ymad_blog_posts') || '[]');
          volunteers = JSON.parse(localStorage.getItem('ymad_volunteers') || '[]');
          donations = JSON.parse(localStorage.getItem('ymad_donations') || '[]');
          beneficiaries = JSON.parse(localStorage.getItem('ymad_beneficiaries') || '[]');
          events = JSON.parse(localStorage.getItem('ymad_events') || '[]');
          apiSuccess = true;
        } catch (apiError) {
          console.log('Erreur chargement données');
          apiSuccess = false;
        }
      }
      
      // Fallback sur localStorage si API indisponible
      if (!apiSuccess) {
        jobs = JSON.parse(localStorage.getItem('ymad_jobs') || '[]');
        applications = JSON.parse(localStorage.getItem('ymad_applications') || '[]');
        projects = JSON.parse(localStorage.getItem('ymad_projects') || '[]');
        blogPosts = JSON.parse(localStorage.getItem('ymad_blog_posts') || '[]');
        volunteers = JSON.parse(localStorage.getItem('ymad_volunteers') || '[]');
        donations = JSON.parse(localStorage.getItem('ymad_donations') || '[]');
        beneficiaries = JSON.parse(localStorage.getItem('ymad_beneficiaries') || '[]');
        events = JSON.parse(localStorage.getItem('ymad_events') || '[]');
        setUseApi(false);
      }

      const activeJobs: Job[] = jobs.filter((job: Job) => job.status === 'open' || job.status === 'published');
      const pendingApps: Application[] = applications.filter((app: Application) => app.status === 'pending' || app.status === 'submitted');
      const acceptedApps: Application[] = applications.filter((app: Application) => app.status === 'accepted');
      const rejectedApps: Application[] = applications.filter((app: Application) => app.status === 'rejected');
      const activeProjects: Project[] = projects.filter((project: Project) => project.status === 'active');
      const completedProjects: Project[] = projects.filter((project: Project) => project.status === 'completed');
      const publishedPosts: BlogPost[] = blogPosts.filter((post: BlogPost) => post.status === 'published');
      const activeVolunteers: Volunteer[] = volunteers.filter((volunteer: Volunteer) => volunteer.status === 'active');
      
      const totalDonations: number = donations.reduce((sum: number, donation: Donation) => sum + (donation.amount || 0), 0);
      
      // Calcul des dons du mois
      const now: Date = new Date();
      const monthlyDonations: number = donations
        .filter((donation: Donation) => {
          const donationDate: Date = new Date(donation.createdAt);
          return donationDate.getMonth() === now.getMonth() && donationDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum: number, donation: Donation) => sum + (donation.amount || 0), 0);
      
      // Calcul de la croissance des dons
      const lastMonthDonations: number = donations
        .filter((donation: Donation) => {
          const donationDate: Date = new Date(donation.createdAt);
          const lastMonth: Date = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return donationDate.getMonth() === lastMonth.getMonth() && donationDate.getFullYear() === lastMonth.getFullYear();
        })
        .reduce((sum: number, donation: Donation) => sum + (donation.amount || 0), 0);
      
      const donationGrowth: number = lastMonthDonations > 0 
        ? ((monthlyDonations - lastMonthDonations) / lastMonthDonations) * 100 
        : monthlyDonations > 0 ? 100 : 0;
      
      // Calcul du taux d'emploi des bénéficiaires
      const employedBeneficiaries: number = beneficiaries.filter((beneficiary: Beneficiary) => 
        beneficiary.employmentStatus === 'employed' || beneficiary.employmentStatus === 'self_employed'
      ).length;
      const employmentRate: number = beneficiaries.length > 0 ? (employedBeneficiaries / beneficiaries.length) * 100 : 0;
      
      // Calcul de l'augmentation moyenne des revenus
      const incomeIncreases: number[] = beneficiaries
        .filter((beneficiary: Beneficiary) => beneficiary.afterIncome && beneficiary.beforeIncome)
        .map((beneficiary: Beneficiary) => beneficiary.afterIncome - beneficiary.beforeIncome);
      const averageIncomeIncrease: number = incomeIncreases.length > 0 
        ? incomeIncreases.reduce((a: number, b: number) => a + b, 0) / incomeIncreases.length 
        : 0;
      
      const recentApps: Application[] = [...applications]
        .sort((a: Application, b: Application) => {
          const dateA: number = new Date(a.appliedAt || a.createdAt || '').getTime();
          const dateB: number = new Date(b.appliedAt || b.createdAt || '').getTime();
          return dateB - dateA;
        })
        .slice(0, 5);
      
      const recentJobsList: Job[] = [...jobs]
        .sort((a: Job, b: Job) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      const recentPosts: BlogPost[] = [...blogPosts]
        .sort((a: BlogPost, b: BlogPost) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      const recentDonationsList: Donation[] = [...donations]
        .sort((a: Donation, b: Donation) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      const upcomingEvents: Event[] = events
        .filter((event: Event) => new Date(event.date) > new Date())
        .sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
      
      const topProjects: Project[] = [...projects]
        .sort((a: Project, b: Project) => (b.beneficiaries || 0) - (a.beneficiaries || 0))
        .slice(0, 3);
      
      setStats({
        totalJobs: jobs.length,
        activeJobs: activeJobs.length,
        totalApplications: applications.length,
        pendingApplications: pendingApps.length,
        acceptedApplications: acceptedApps.length,
        rejectedApplications: rejectedApps.length,
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        totalBlogPosts: blogPosts.length,
        publishedPosts: publishedPosts.length,
        totalVolunteers: volunteers.length,
        activeVolunteers: activeVolunteers.length,
        totalDonations,
        monthlyDonations,
        donationGrowth,
        totalBeneficiaries: beneficiaries.length,
        employmentRate,
        averageIncomeIncrease,
        recentApplications: recentApps,
        recentJobs: recentJobsList,
        recentBlogPosts: recentPosts,
        recentDonations: recentDonationsList,
        upcomingEvents,
        topProjects
      });
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [useApi]);

  const loadNotifications = (): void => {
    const notifs: Notification[] = JSON.parse(localStorage.getItem('ymad_notifications') || '[]');
    setNotifications(notifs);
  };

  const loadRecentActivity = (): void => {
    const activities: ActivityLog[] = [
      { id: '1', action: 'Nouvelle offre publiée', user: userName, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), details: 'Coordinateur de projet' },
      { id: '2', action: 'Candidature reçue', user: 'Système', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), details: 'Jean Rakoto' },
      { id: '3', action: 'Don reçu', user: 'Système', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), details: '50 000 Ar' },
    ];
    setRecentActivity(activities);
  };

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadDashboardData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleLogout = (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_name');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    router.push('/login');
  };

  const handleExportData = (format: 'csv' | 'pdf' | 'excel'): void => {
    const exportData = {
      stats,
      jobs: JSON.parse(localStorage.getItem('ymad_jobs') || '[]'),
      applications: JSON.parse(localStorage.getItem('ymad_applications') || '[]'),
      projects: JSON.parse(localStorage.getItem('ymad_projects') || '[]'),
      donations: JSON.parse(localStorage.getItem('ymad_donations') || '[]'),
      beneficiaries: JSON.parse(localStorage.getItem('ymad_beneficiaries') || '[]'),
      exportedAt: new Date().toISOString()
    };
    
    const dataStr: string = JSON.stringify(exportData, null, 2);
    const blob: Blob = new Blob([dataStr], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url: string = URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = `ymad_export_${new Date().toISOString()}.${format === 'excel' ? 'xlsx' : format}`;
    a.click();
    URL.revokeObjectURL(url);
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: 'Export terminé',
      message: `Export ${format.toUpperCase()} des données effectué avec succès`,
      type: 'success',
      read: false,
      createdAt: new Date()
    };
    const currentNotifs: Notification[] = JSON.parse(localStorage.getItem('ymad_notifications') || '[]');
    localStorage.setItem('ymad_notifications', JSON.stringify([newNotification, ...currentNotifs]));
  };

  const markAllNotificationsAsRead = (): void => {
    const updated: Notification[] = notifications.map((n: Notification) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('ymad_notifications', JSON.stringify(updated));
  };

  const getStatusBadge = (status: string): React.ReactElement => {
    const statusMap: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
      'pending': { icon: <Clock className="w-3 h-3" />, label: 'En attente', className: 'bg-yellow-100 text-yellow-700' },
      'submitted': { icon: <Clock className="w-3 h-3" />, label: 'Soumise', className: 'bg-yellow-100 text-yellow-700' },
      'reviewing': { icon: <Eye className="w-3 h-3" />, label: 'En révision', className: 'bg-blue-100 text-blue-700' },
      'accepted': { icon: <CheckCircle className="w-3 h-3" />, label: 'Acceptée', className: 'bg-green-100 text-green-700' },
      'rejected': { icon: <AlertCircle className="w-3 h-3" />, label: 'Refusée', className: 'bg-red-100 text-red-700' },
    };
    const s = statusMap[status] || { icon: null, label: status, className: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${s.className}`}>
        {s.icon} {s.label}
      </span>
    );
  };

  const getProjectProgressColor = (progress: number): string => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' Ar';
  };

  const formatCompactNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  const unreadCount: number = notifications.filter((n: Notification) => !n.read).length;

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Tableau de bord</h1>
            <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              {userRole === 'admin' ? 'Super Admin' : userRole === 'staff' ? 'Staff' : 'Admin'}
            </div>
            {!useApi && (
              <div className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                Mode hors ligne
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Bienvenue, <span className="font-semibold text-blue-700">{userName}</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
          </p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Barre de recherche */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Période */}
          <select
            value={selectedPeriod}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          
          {/* Bouton export */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exporter</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-10">
                <button onClick={() => handleExportData('csv')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">CSV</button>
                <button onClick={() => handleExportData('pdf')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">PDF</button>
                <button onClick={() => handleExportData('excel')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Excel</button>
              </div>
            )}
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-10 max-h-96 overflow-y-auto">
                <div className="p-3 border-b flex justify-between items-center">
                  <h3 className="font-semibold">Notifications</h3>
                  <button onClick={markAllNotificationsAsRead} className="text-xs text-blue-600">Tout marquer lu</button>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">Aucune notification</div>
                ) : (
                  notifications.map((notif: Notification) => (
                    <div key={notif.id} className={`p-3 border-b hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`}>
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-gray-500">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <RefreshCw className={`w-5 h-5 text-gray-700 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link href="/dashboard/jobs" className="bg-white rounded-xl shadow-sm p-3 sm:p-5 hover:shadow-md transition border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Offres</p>
              <p className="text-xl font-bold text-gray-800">{stats.totalJobs}</p>
              <p className="text-xs text-green-600 mt-1">{stats.activeJobs} actives</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Link>
        
        <Link href="/dashboard/applications" className="bg-white rounded-xl shadow-sm p-3 sm:p-5 hover:shadow-md transition border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Candidatures</p>
              <p className="text-xl font-bold text-gray-800">{stats.totalApplications}</p>
              <p className="text-xs text-yellow-600 mt-1">{stats.pendingApplications} attente</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Link>
        
        <Link href="/dashboard/projects" className="bg-white rounded-xl shadow-sm p-3 sm:p-5 hover:shadow-md transition border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Projets</p>
              <p className="text-xl font-bold text-gray-800">{stats.totalProjects}</p>
              <p className="text-xs text-green-600 mt-1">{stats.activeProjects} actifs</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Dons (mois)</p>
              <p className="text-sm font-bold text-blue-600">{formatCompactNumber(stats.monthlyDonations)} Ar</p>
              <div className={`flex items-center gap-1 text-xs mt-1 ${stats.donationGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.donationGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(stats.donationGrowth).toFixed(1)}%
              </div>
            </div>
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Projets */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Top Projets par impact
        </h2>
        <div className="space-y-3">
          {stats.topProjects.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Aucun projet</p>
          ) : (
            stats.topProjects.map((project: Project, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{project.title}</p>
                    <p className="text-xs text-gray-500">{project.beneficiaries || 0} bénéficiaires</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">{formatCurrency(project.spent || 0)}</p>
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
                    <div className={`h-full rounded-full ${getProjectProgressColor(project.progress || 0)}`} style={{ width: `${project.progress || 0}%` }} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Actions rapides
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Link href="/dashboard/jobs/new" className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition group">
            <Plus className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Nouvelle offre</span>
          </Link>
          <Link href="/dashboard/events/new" className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition group">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Nouvel événement</span>
          </Link>
          <Link href="/dashboard/blog/new" className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition group">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Nouvel article</span>
          </Link>
          <Link href="/dashboard/beneficiaries/new" className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition group">
            <UsersRound className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Nouveau bénéficiaire</span>
          </Link>
          <Link href="/dashboard/projects/new" className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition group">
            <FolderOpen className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Nouveau projet</span>
          </Link>
          <Link href="/dashboard/reports" className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition group">
            <Download className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Générer rapport</span>
          </Link>
          <Link href="/dashboard/backgrounds" className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition group">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Fonds d'écran</span>
          </Link>
          <Link href="/dashboard/audit" className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition group">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Journal audit</span>
          </Link>
        </div>
      </div>

      {/* Bouton déconnexion flottant */}
      <button
        onClick={handleLogout}
        className="lg:hidden fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition z-10"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
}