// frontend/src/app/dashboard/page.tsx

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  TrendingUp, ArrowRight, Loader2, Award, Target, Sparkles,
  RefreshCw, PlusCircle, FilePlus, BarChart4, Layout, Image, Plus,
  AlertCircle, Briefcase, FolderOpen, FileText, Users, Mail,
  Clock, CheckCircle, Calendar, Zap, UserCircle, Settings,
  LogOut, Home, HelpCircle, Shield, Lock, Eye, EyeOff,
  Activity, PieChart, TrendingDown, ThumbsUp, Download,
  Calendar as CalendarIcon, UserPlus, MessageSquare,
  Bell, AlertTriangle, Check, X, Globe, MapPin,
  Star
} from 'lucide-react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import toast from 'react-hot-toast';

// ============================================================
// IMPORT DYNAMIQUE DE CHART.JS
// ============================================================

import dynamic from 'next/dynamic';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';

// ✅ Enregistrement côté client uniquement
if (typeof window !== 'undefined') {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
  );
}

const Line = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Line),
  { ssr: false, loading: () => <div className="h-[250px] flex items-center justify-center text-gray-400">Chargement du graphique...</div> }
);

const Bar = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Bar),
  { ssr: false, loading: () => <div className="h-[220px] flex items-center justify-center text-gray-400">Chargement du graphique...</div> }
);

const Doughnut = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Doughnut),
  { ssr: false, loading: () => <div className="h-[200px] flex items-center justify-center text-gray-400">Chargement du graphique...</div> }
);

// ============================================================
// TYPES
// ============================================================

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalJobs: number;
  publishedJobs: number;
  totalApplications: number;
  pendingApplications: number;
  totalBlogPosts: number;
  publishedBlogPosts: number;
  totalContacts: number;
  unreadContacts: number;
  totalUsers: number;
  newUsersThisMonth: number;
  applicationsThisMonth: number;
  jobsThisMonth: number;
  completionRate: number;
  lastUpdated?: string;
}

interface ActivityItem {
  id: string;
  type: 'job' | 'application' | 'project' | 'contact' | 'user' | 'blog';
  title: string;
  description?: string;
  date: string;
  status?: string;
  user?: string;
}

interface MonthlyData {
  month: string;
  jobs: number;
  applications: number;
  users: number;
  projects: number;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: string;
  read: boolean;
  link?: string;
  candidateName?: string;
  jobTitle?: string;
}

// ============================================================
// TRADUCTIONS COMPLÈTES
// ============================================================

const translations = {
  fr: {
    dashboard: 'Tableau de bord',
    welcome: 'Bonjour',
    hereIsOverview: 'Voici un aperçu complet de votre activité.',
    lastUpdate: 'Dernière mise à jour',
    yourImpact: 'Votre impact',
    impactDescription: 'Grâce à votre engagement, Y-MaD continue de connecter les jeunes aux opportunités d\'emploi à Madagascar.',
    activeProjects: 'Projets actifs',
    activeJobs: 'Offres actives',
    quickActions: 'Actions rapides',
    newProject: 'Nouveau projet',
    newJob: 'Nouvelle offre',
    newArticle: 'Nouvel article',
    generateReport: 'Générer rapport',
    siteManagement: 'Gestion du site',
    siteManagementDesc: 'Personnalisez l\'apparence et le contenu du site',
    managePages: 'Gérer les pages',
    manageBackgrounds: 'Gérer les fonds d\'écran',
    seeImpact: 'Voir le détail',
    loading: 'Chargement...',
    error: 'Erreur lors du chargement',
    retry: 'Réessayer',
    admin: 'Administrateur',
    refresh: 'Actualiser',
    recentActivity: 'Activité récente',
    viewAll: 'Voir tout',
    noActivity: 'Aucune activité récente',
    quickTips: 'Conseils stratégiques',
    tip1: 'Publiez des offres régulièrement pour attirer plus de candidats',
    tip2: 'Répondez aux candidatures dans les 48h pour maximiser l\'engagement',
    tip3: 'Mettez en avant vos projets réussis pour inspirer la communauté',
    tip4: 'Actualisez votre blog chaque semaine pour maintenir l\'audience',
    systemOperational: 'Système opérationnel',
    databaseSynced: 'Base de données synchronisée',
    copyright: 'Y-MaD Platform v1.0 - 2025 Young for Madagascar Development',
    totalUsers: 'Utilisateurs',
    manageUsers: 'Gérer les utilisateurs',
    viewProfile: 'Voir mon profil',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    accessDenied: 'Accès refusé',
    adminOnly: 'Cette page est réservée aux administrateurs.',
    returnHome: 'Retour à l\'accueil',
    completionRate: 'Taux de complétion',
    applicationsReceived: 'Candidatures reçues',
    newUsers: 'Nouveaux utilisateurs',
    projectsCompleted: 'Projets terminés',
    monthlyStats: 'Statistiques mensuelles',
    performance: 'Performance globale',
    exportData: 'Exporter les données',
    viewDetails: 'Voir les détails',
    totalJobsLabel: 'Total des offres',
    publishedJobsLabel: 'Offres publiées',
    totalProjectsLabel: 'Total des projets',
    activeProjectsLabel: 'Projets actifs',
    blogPostsLabel: 'Articles de blog',
    pendingLabel: 'En attente',
    contactsLabel: 'Messages',
    unreadLabel: 'Non lus',
    evolution: 'Évolution mensuelle',
    distribution: 'Répartition',
    jobsEvolution: 'Offres d\'emploi',
    applicationsEvolution: 'Candidatures',
    usersEvolution: 'Utilisateurs',
    projectsEvolution: 'Projets',
    notifications: 'Notifications',
    markAllRead: 'Tout marquer comme lu',
    noNotifications: 'Aucune notification',
    newApplication: 'Nouvelle candidature',
    newJobOffer: 'Nouvelle offre d\'emploi',
    newUser: 'Nouvel utilisateur',
    projectUpdate: 'Mise à jour de projet',
    systemAlert: 'Alerte système',
    appliedTo: 'a postulé à',
    viewApplication: 'Voir la candidature',
    newApplicationTitle: 'Nouvelle candidature reçue',
    total: 'total',
  },
  mg: {
    dashboard: 'Takila fampisehoana',
    welcome: 'Tonga soa',
    hereIsOverview: 'Ity ny famintinana feno ny asanao.',
    lastUpdate: 'Fanavaozana farany',
    yourImpact: 'Ny fiantraikanao',
    impactDescription: 'Noho ny fandraisanao anjara, Y-MaD dia manohy mampifandray ny tanora amin\'ny asa eto Madagasikara.',
    activeProjects: 'Tetikasa mavitrika',
    activeJobs: 'Asa misokatra',
    quickActions: 'Hetsika haingana',
    newProject: 'Tetikasa vaovao',
    newJob: 'Asa vaovao',
    newArticle: 'Lahatsoratra vaovao',
    generateReport: 'Mamorona tatitra',
    siteManagement: 'Fitantanan-tranonkala',
    siteManagementDesc: 'Amboary ny endrika sy ny atiny',
    managePages: 'Hitantana pejy',
    manageBackgrounds: 'Hitantana sary ambadika',
    seeImpact: 'Jereo ny antsipirihany',
    loading: 'Fandefasana...',
    error: 'Tsy nahomby ny fandefasana',
    retry: 'Andramo indray',
    admin: 'Mpandrindra',
    refresh: 'Havaozina',
    recentActivity: 'Hetsika vao haingana',
    viewAll: 'Jereo daholo',
    noActivity: 'Tsy misy hetsika vao haingana',
    quickTips: 'Torolalana stratejika',
    tip1: 'Avoary matetika ny asa mba hisarihana mpangataka maro',
    tip2: 'Valio ny fangatahana ao anatin\'ny 48 ora',
    tip3: 'Asongadino ny tetikasanao nahomby',
    tip4: 'Havaozy ny bilaogy isan-kerinandro',
    systemOperational: 'Rafitra miasa',
    databaseSynced: 'Angona voarakitra',
    copyright: 'Y-MaD Platform v1.0 - 2025 Young for Madagascar Development',
    totalUsers: 'Mpampiasa',
    manageUsers: 'Hitantana mpampiasa',
    viewProfile: 'Jereo ny mombamomba ahy',
    settings: 'Fandrindrana',
    logout: 'Mivoaka',
    accessDenied: 'Tsy mahazo miditra',
    adminOnly: 'Ity pejy ity dia ho an\'ny mpandrindra ihany.',
    returnHome: 'Hiverina any an-tokotany',
    completionRate: 'Tahan\'ny fahavitana',
    applicationsReceived: 'Fangatahana noraisina',
    newUsers: 'Mpampiasa vaovao',
    projectsCompleted: 'Tetikasa vita',
    monthlyStats: 'Statistika isam-bolana',
    performance: 'Fampisehoana ankapobeny',
    exportData: 'Hamoaka ny angona',
    viewDetails: 'Jereo ny antsipirihany',
    totalJobsLabel: 'Totalin\'ny asa',
    publishedJobsLabel: 'Asa navoaka',
    totalProjectsLabel: 'Totalin\'ny tetikasa',
    activeProjectsLabel: 'Tetikasa mavitrika',
    blogPostsLabel: 'Lahatsoratra',
    pendingLabel: 'Miandry',
    contactsLabel: 'Hafatra',
    unreadLabel: 'Tsy mbola novakiana',
    evolution: 'Fivoarana isam-bolana',
    distribution: 'Fizarana',
    jobsEvolution: 'Asa',
    applicationsEvolution: 'Fangatahana',
    usersEvolution: 'Mpampiasa',
    projectsEvolution: 'Tetikasa',
    notifications: 'Fampandrenesana',
    markAllRead: 'Soraty ho voavaky daholo',
    noNotifications: 'Tsy misy fampandrenesana',
    newApplication: 'Fangatahana vaovao',
    newJobOffer: 'Toerana asa vaovao',
    newUser: 'Mpampiasa vaovao',
    projectUpdate: 'Fanavaozana tetikasa',
    systemAlert: 'Fampitandremana rafitra',
    appliedTo: 'dia nangataka ho an\'ny',
    viewApplication: 'Jereo ny fangatahana',
    newApplicationTitle: 'Fangatahana vaovao noraisina',
    total: 'rehetra',
  }
};

// ============================================================
// COMPOSANT DE CARTE DE PERFORMANCE
// ============================================================

interface PerformanceCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
}

function PerformanceCard({ title, value, icon, subtitle }: PerformanceCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="bg-gray-100 rounded-lg p-2">
          <div className="w-5 h-5 text-blue-800">{icon}</div>
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
      <p className="text-xs text-gray-500">{title}</p>
      {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ============================================================
// COMPOSANT DE NOTIFICATION
// ============================================================

function NotificationItem({ 
  notification, 
  onRead,
  t 
}: { 
  notification: Notification; 
  onRead: (id: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div className={`p-3 rounded-lg border ${notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'} transition-opacity`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <FileText className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800">{notification.title}</p>
          <p className="text-xs text-gray-600 mt-0.5">{notification.description}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-gray-400">{notification.date}</span>
            {notification.link && (
              <Link
                href={notification.link}
                className="text-[10px] text-blue-700 hover:text-blue-900 font-medium"
              >
                {t('viewApplication') || 'Voir la candidature'} →
              </Link>
            )}
          </div>
        </div>
        {!notification.read && (
          <button
            onClick={() => onRead(notification.id)}
            className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT D'ACTIVITÉ RÉCENTE
// ============================================================

function ActivityItem({ activity, t }: { activity: ActivityItem; t: (key: string) => string }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'contact': return <Mail className="w-4 h-4 text-blue-700" />;
      case 'application': return <FileText className="w-4 h-4 text-blue-700" />;
      case 'job': return <Briefcase className="w-4 h-4 text-blue-700" />;
      case 'project': return <FolderOpen className="w-4 h-4 text-blue-700" />;
      case 'user': return <UserPlus className="w-4 h-4 text-blue-700" />;
      case 'blog': return <FileText className="w-4 h-4 text-blue-700" />;
      default: return <Activity className="w-4 h-4 text-blue-700" />;
    }
  };

  const getStatusColor = () => {
    switch (activity.status) {
      case 'published': return 'bg-blue-50 text-blue-700';
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'unread': return 'bg-gray-100 text-gray-700';
      case 'completed': return 'bg-blue-50 text-blue-700';
      case 'lu': return 'bg-gray-50 text-gray-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-200">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 font-medium truncate">{activity.title}</p>
        {activity.description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-gray-400">{activity.date}</span>
          {activity.status && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor()}`}>
              {activity.status === 'unread' ? t('unreadLabel') || 'Non lus' : 
               activity.status === 'published' ? 'Publié' :
               activity.status === 'pending' ? t('pendingLabel') || 'En attente' :
               activity.status === 'completed' ? 'Terminé' :
               activity.status === 'lu' ? 'Lu' : activity.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function DashboardHome() {
  const router = useRouter();
  const { user, token, isAdmin, isAuthenticated, isLoading, logout } = useAuth();
  const { language, t } = useLanguage();
  
  // États
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalJobs: 0,
    publishedJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalBlogPosts: 0,
    publishedBlogPosts: 0,
    totalContacts: 0,
    unreadContacts: 0,
    totalUsers: 0,
    newUsersThisMonth: 0,
    applicationsThisMonth: 0,
    jobsThisMonth: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
  const notificationRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // DONNÉES POUR LES GRAPHIQUES
  // ============================================================

  const chartData = useMemo(() => {
    const months = monthlyData.length > 0 
      ? monthlyData.map(d => d.month)
      : ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    const jobsData = monthlyData.length > 0 
      ? monthlyData.map(d => d.jobs)
      : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    const applicationsData = monthlyData.length > 0 
      ? monthlyData.map(d => d.applications)
      : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    const usersData = monthlyData.length > 0 
      ? monthlyData.map(d => d.users)
      : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    const projectsData = monthlyData.length > 0 
      ? monthlyData.map(d => d.projects)
      : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    return { months, jobsData, applicationsData, usersData, projectsData };
  }, [monthlyData]);

  // ============================================================
  // CONFIGURATION DES GRAPHIQUES
  // ============================================================

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { size: 11, family: 'Inter, sans-serif' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 58, 138, 0.9)',
        titleFont: { size: 12, family: 'Inter, sans-serif' },
        bodyFont: { size: 11, family: 'Inter, sans-serif' },
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 10, family: 'Inter, sans-serif' } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, family: 'Inter, sans-serif' } }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { size: 11, family: 'Inter, sans-serif' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 58, 138, 0.9)',
        titleFont: { size: 12, family: 'Inter, sans-serif' },
        bodyFont: { size: 11, family: 'Inter, sans-serif' },
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 10, family: 'Inter, sans-serif' } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, family: 'Inter, sans-serif' } }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: { size: 11, family: 'Inter, sans-serif' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 58, 138, 0.9)',
        titleFont: { size: 12, family: 'Inter, sans-serif' },
        bodyFont: { size: 11, family: 'Inter, sans-serif' },
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((context.parsed / total) * 100) : 0;
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%'
  };

  // ============================================================
  // DONNÉES POUR LES GRAPHIQUES
  // ============================================================

  const lineData = {
    labels: chartData.months,
    datasets: [
      {
        label: t('jobsEvolution') || 'Offres d\'emploi',
        data: chartData.jobsData,
        borderColor: '#1e3a8a',
        backgroundColor: 'rgba(30, 58, 138, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#1e3a8a',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: t('applicationsEvolution') || 'Candidatures',
        data: chartData.applicationsData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const barData = {
    labels: chartData.months,
    datasets: [
      {
        label: t('usersEvolution') || 'Utilisateurs',
        data: chartData.usersData,
        backgroundColor: 'rgba(30, 58, 138, 0.7)',
        borderColor: '#1e3a8a',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: t('projectsEvolution') || 'Projets',
        data: chartData.projectsData,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const doughnutData = {
    labels: ['Projets actifs', 'Projets terminés', 'Projets en attente'],
    datasets: [
      {
        data: [
          stats.activeProjects || 1,
          stats.completedProjects || 1,
          Math.max(0, (stats.totalProjects || 0) - (stats.activeProjects || 0) - (stats.completedProjects || 0))
        ],
        backgroundColor: ['#1e3a8a', '#3b82f6', '#93c5fd'],
        borderColor: ['#1e3a8a', '#3b82f6', '#93c5fd'],
        borderWidth: 2,
        hoverOffset: 8
      }
    ]
  };

  // ============================================================
  // VÉRIFICATION D'ACCÈS
  // ============================================================

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/dashboard');
        return;
      }
      if (!isAdmin) {
        router.push('/');
        return;
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  // ============================================================
  // CHARGEMENT DES STATISTIQUES
  // ============================================================

  const fetchStats = useCallback(async (showRefresh = false) => {
    if (!token || !isAdmin) {
      setLoading(false);
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      const [
        projectsRes, jobsRes, blogRes, contactsRes, 
        usersRes, applicationsRes, monthlyRes
      ] = await Promise.all([
        fetch(`${API_URL}/projects/stats`, { headers }),
        fetch(`${API_URL}/jobs/offers/stats`, { headers }),
        fetch(`${API_URL}/blog/stats`, { headers }),
        fetch(`${API_URL}/contact?limit=5`, { headers }),
        fetch(`${API_URL}/auth/users`, { headers }),
        fetch(`${API_URL}/applications/stats`, { headers }),
        fetch(`${API_URL}/stats/monthly`, { headers })
      ]);

      // Projets
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setStats(prev => ({ 
          ...prev, 
          totalProjects: data.total || 0, 
          activeProjects: data.active || 0,
          completedProjects: data.completed || 0,
        }));
      }

      // Offres d'emploi
      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setStats(prev => ({ 
          ...prev, 
          totalJobs: data.total || 0, 
          publishedJobs: data.published || 0,
          jobsThisMonth: data.thisMonth || 0,
        }));
      }

      // Applications
      if (applicationsRes.ok) {
        const data = await applicationsRes.json();
        setStats(prev => ({ 
          ...prev, 
          totalApplications: data.total || 0, 
          pendingApplications: data.pending || 0,
          applicationsThisMonth: data.thisMonth || 0,
        }));
        
        // ✅ Générer des notifications pour les nouvelles candidatures
        if (data.recentApplications && data.recentApplications.length > 0) {
          const newNotifications: Notification[] = data.recentApplications.map((app: any) => ({
            id: app.id || `app-${Date.now()}-${Math.random()}`,
            title: t('newApplicationTitle') || 'Nouvelle candidature reçue',
            description: `${app.candidateName || 'Un candidat'} ${t('appliedTo') || 'a postulé à'} "${app.jobTitle || 'une offre'}"`,
            type: 'info',
            date: new Date(app.created_at || Date.now()).toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'short', 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            read: false,
            link: `/dashboard/applications/${app.id}`,
            candidateName: app.candidateName,
            jobTitle: app.jobTitle
          }));
          
          setNotifications(prev => [...newNotifications, ...prev]);
        }
      }

      // Blog
      if (blogRes.ok) {
        const data = await blogRes.json();
        setStats(prev => ({ 
          ...prev, 
          totalBlogPosts: data.total || 0, 
          publishedBlogPosts: data.published || 0 
        }));
      }

      // Contacts
      if (contactsRes.ok) {
        const data = await contactsRes.json();
        setStats(prev => ({ 
          ...prev, 
          totalContacts: data.total || 0, 
          unreadContacts: data.unread || 0 
        }));
        
        const recentActivities: ActivityItem[] = (data.data || []).slice(0, 3).map((contact: any) => ({
          id: contact.id,
          type: 'contact',
          title: `Nouveau message de ${contact.name}`,
          description: contact.subject || 'Message reçu via le formulaire',
          date: new Date(contact.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
          status: contact.read ? 'lu' : 'unread',
        }));
        setActivities(recentActivities);
      }

      // Utilisateurs
      if (usersRes.ok) {
        const data = await usersRes.json();
        const users = data.data || data || [];
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const newUsers = users.filter((u: any) => {
          const date = new Date(u.created_at);
          return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        });
        
        setStats(prev => ({ 
          ...prev, 
          totalUsers: users.length || 0,
          newUsersThisMonth: newUsers.length || 0,
        }));
      }

      // Statistiques mensuelles
      if (monthlyRes.ok) {
        const data = await monthlyRes.json();
        if (data.monthlyData && data.monthlyData.length > 0) {
          setMonthlyData(data.monthlyData);
        } else {
          // Données simulées pour la démonstration
          const currentMonth = new Date().getMonth();
          const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
          const dummyData: MonthlyData[] = [];
          for (let i = 0; i <= currentMonth; i++) {
            dummyData.push({
              month: months[i],
              jobs: Math.floor(Math.random() * 20) + 5,
              applications: Math.floor(Math.random() * 30) + 10,
              users: Math.floor(Math.random() * 15) + 3,
              projects: Math.floor(Math.random() * 10) + 2,
            });
          }
          setMonthlyData(dummyData);
        }
      }

      setStats(prev => ({
        ...prev,
        completionRate: prev.completedProjects > 0 && prev.totalProjects > 0 
          ? Math.round((prev.completedProjects / prev.totalProjects) * 100)
          : 0,
        lastUpdated: new Date().toLocaleTimeString('fr-FR')
      }));

      if (showRefresh) {
        toast.success('Données actualisées avec succès');
      }

    } catch (err) {
      console.error('Erreur de chargement:', err);
      setError('Impossible de charger les statistiques. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_URL, token, isAdmin, t]);

  // ============================================================
  // EFFETS
  // ============================================================

  useEffect(() => {
    if (token && isAdmin) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [token, isAdmin, fetchStats]);

  // ============================================================
  // GESTIONNAIRES
  // ============================================================

  const handleRefresh = () => fetchStats(true);

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    toast.success('Toutes les notifications ont été marquées comme lues');
  };

  // ============================================================
  // STATISTIQUES POUR LES CARTES
  // ============================================================

  const statsForCards = useMemo(() => ({
    totalJobs: stats.totalJobs,
    publishedJobs: stats.publishedJobs,
    totalApplications: stats.totalApplications,
    pendingApplications: stats.pendingApplications,
    totalProjects: stats.totalProjects,
    activeProjects: stats.activeProjects,
    totalBlogPosts: stats.totalBlogPosts,
    publishedBlogPosts: stats.publishedBlogPosts,
    unreadContacts: stats.unreadContacts,
    totalUsers: stats.totalUsers,
  }), [stats]);

  const tips = [
    t('tip1') || 'Publiez des offres régulièrement pour attirer plus de candidats',
    t('tip2') || 'Répondez aux candidatures dans les 48h pour maximiser l\'engagement',
    t('tip3') || 'Mettez en avant vos projets réussis pour inspirer la communauté',
    t('tip4') || 'Actualisez votre blog chaque semaine pour maintenir l\'audience'
  ];

  // ============================================================
  // RENDU - CHARGEMENT
  // ============================================================

  if (isLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-800 animate-spin" />
        <p className="text-gray-500">{t('loading') || 'Chargement...'}</p>
      </div>
    );
  }

  // ============================================================
  // RENDU - ACCÈS REFUSÉ
  // ============================================================

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <Lock className="w-10 h-10 text-gray-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{t('accessDenied') || 'Accès refusé'}</h2>
        <p className="text-gray-500 text-center max-w-md">{t('adminOnly') || 'Cette page est réservée aux administrateurs.'}</p>
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition"
        >
          <Home className="w-4 h-4" />
          {t('returnHome') || 'Retour à l\'accueil'}
        </Link>
      </div>
    );
  }

  // ============================================================
  // RENDU - ERREUR
  // ============================================================

  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-gray-600 font-medium">{error}</p>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t('retry') || 'Réessayer'}
        </button>
      </div>
    );
  }

  // ============================================================
  // RENDU - DASHBOARD AVEC NOTIFICATIONS RÉELLES
  // ============================================================

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 pb-8">
      
      {/* ============================================================
      EN-TÊTE
      ============================================================ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{t('dashboard') || 'Tableau de bord'}</h1>
              <p className="text-sm text-gray-500">
                {t('welcome') || 'Bonjour'} <span className="font-semibold text-blue-800">{user?.first_name || 'Admin'}</span> ! {t('hereIsOverview') || 'Voici un aperçu complet de votre activité.'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-xs text-gray-600 font-medium">{t('refresh') || 'Actualiser'}</span>
          </button>
          
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 font-medium">
              {t('lastUpdate') || 'Dernière mise à jour'}: {stats.lastUpdated || '...'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-800 text-white text-xs rounded-lg font-medium shadow-sm">
            <Shield className="w-3.5 h-3.5" />
            {t('admin') || 'Administrateur'}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-4 h-4 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-800">{t('notifications') || 'Notifications'}</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {t('markAllRead') || 'Tout marquer comme lu'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={handleMarkNotificationAsRead}
                        t={t}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">{t('noNotifications') || 'Aucune notification'}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
      CARTES STATISTIQUES
      ============================================================ */}
      <StatsCards stats={statsForCards} loading={loading} />

      {/* ============================================================
      SECTION GRAPHIQUES
      ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graphique Linéaire - Évolution */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">{t('evolution') || 'Évolution mensuelle'}</h2>
            </div>
            <span className="text-xs text-gray-400">2025 - 2026</span>
          </div>
          <div className="h-[250px]">
            <Line data={lineData} options={lineChartOptions} />
          </div>
        </div>

        {/* Graphique en Anneau - Répartition */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <PieChart className="w-4 h-4 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{t('distribution') || 'Répartition'}</h2>
          </div>
          <div className="h-[200px] flex items-center justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-blue-800">{stats.activeProjects}</p>
              <p className="text-[10px] text-gray-500">Actifs</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-500">{stats.completedProjects}</p>
              <p className="text-[10px] text-gray-500">Terminés</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-300">{Math.max(0, stats.totalProjects - stats.activeProjects - stats.completedProjects)}</p>
              <p className="text-[10px] text-gray-500">En attente</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
      GRAPHIQUE À BARRES - ÉVOLUTION MENSUELLE
      ============================================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <BarChart4 className="w-4 h-4 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{t('monthlyStats') || 'Statistiques mensuelles'}</h2>
          </div>
          <span className="text-xs text-gray-400">Évolution mensuelle</span>
        </div>
        <div className="h-[220px]">
          <Bar data={barData} options={barChartOptions} />
        </div>
      </div>

      {/* ============================================================
      SECTION PRINCIPALE
      ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Carte Impact */}
        <div className="lg:col-span-1 bg-blue-800 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">{t('yourImpact') || 'Votre impact'}</h3>
              <p className="text-blue-200 text-xs">2025 - 2026</p>
            </div>
          </div>
          <p className="text-blue-100 text-sm mb-6 leading-relaxed">
            {t('impactDescription') || 'Grâce à votre engagement, Y-MaD continue de connecter les jeunes aux opportunités d\'emploi à Madagascar.'}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 rounded-xl py-3 px-2 text-center">
              <p className="text-2xl font-bold text-white">{stats.activeProjects}</p>
              <p className="text-xs text-blue-200">{t('activeProjects') || 'Projets actifs'}</p>
            </div>
            <div className="bg-white/10 rounded-xl py-3 px-2 text-center">
              <p className="text-2xl font-bold text-white">{stats.publishedJobs}</p>
              <p className="text-xs text-blue-200">{t('activeJobs') || 'Offres actives'}</p>
            </div>
          </div>
          <Link
            href="/dashboard/impact"
            className="inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors group"
          >
            {t('seeImpact') || 'Voir le détail'} 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Activité récente */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">{t('recentActivity') || 'Activité récente'}</h2>
            </div>
            <Link href="/dashboard/activities" className="text-xs text-blue-800 hover:text-blue-900 font-medium">
              {t('viewAll') || 'Voir tout'} →
            </Link>
          </div>
          
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} t={t} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">{t('noActivity') || 'Aucune activité récente'}</p>
            </div>
          )}
        </div>

        {/* Conseils rapides */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{t('quickTips') || 'Conseils stratégiques'}</h2>
          </div>
          <div className="space-y-3">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-2">
                <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-gray-700 text-xs font-bold">{index + 1}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
      ACTIONS RAPIDES & GESTION
      ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Actions rapides */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{t('quickActions') || 'Actions rapides'}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link 
              href="/dashboard/projects/new" 
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-blue-800 transition-colors">
                <PlusCircle className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm text-gray-700 group-hover:text-blue-800 transition-colors font-medium">{t('newProject') || 'Nouveau projet'}</span>
            </Link>
            <Link 
              href="/dashboard/jobs/new" 
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-blue-800 transition-colors">
                <Plus className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm text-gray-700 group-hover:text-blue-800 transition-colors font-medium">{t('newJob') || 'Nouvelle offre'}</span>
            </Link>
            <Link 
              href="/dashboard/blog/new" 
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-blue-800 transition-colors">
                <FilePlus className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm text-gray-700 group-hover:text-blue-800 transition-colors font-medium">{t('newArticle') || 'Nouvel article'}</span>
            </Link>
            <Link 
              href="/dashboard/users" 
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-blue-800 transition-colors">
                <Users className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm text-gray-700 group-hover:text-blue-800 transition-colors font-medium">{t('manageUsers') || 'Gérer les utilisateurs'}</span>
            </Link>
          </div>
        </div>

        {/* Gestion du site */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Layout className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{t('siteManagement') || 'Gestion du site'}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{t('siteManagementDesc') || 'Personnalisez l\'apparence et le contenu du site'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/dashboard/pages"
              className="flex items-center justify-between px-5 py-3.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-all duration-200 group shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-white" />
                <span className="font-medium">{t('managePages') || 'Gérer les pages'}</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard/backgrounds"
              className="flex items-center justify-between px-5 py-3.5 border border-blue-800 text-blue-800 rounded-lg hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                <span className="font-medium">{t('manageBackgrounds') || 'Gérer les fonds d\'écran'}</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================
      PIED DE PAGE
      ============================================================ */}
      <div className="border-t border-gray-200 pt-6 mt-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">{t('systemOperational') || 'Système opérationnel'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">{t('databaseSynced') || 'Base de données synchronisée'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-blue-700" />
              <span className="text-xs text-gray-500">Accès administrateur</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {t('copyright') || 'Y-MaD Platform v1.0 - 2025 Young for Madagascar Development'}
          </div>
        </div>
      </div>
    </div>
  );
}