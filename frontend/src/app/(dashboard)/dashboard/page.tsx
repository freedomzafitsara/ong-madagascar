// frontend/src/app/dashboard/page.tsx

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  TrendingUp, ArrowRight, Loader2, Award, Target,
  RefreshCw, PlusCircle, FilePlus, Layout, Image, Plus,
  AlertCircle, Briefcase, FolderOpen, FileText, Users, Mail,
  Clock, CheckCircle, Zap, UserCircle,
  Shield, Lock, Home, Activity, PieChart,
  Bell, AlertTriangle, Check, BellRing,
  UserPlus, MessageSquare
} from 'lucide-react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import toast from 'react-hot-toast';

// ============================================================
// IMPORT DES COMPOSANTS CHART.JS
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
  { ssr: false, loading: () => <div className="h-[200px] flex items-center justify-center text-gray-400">Chargement...</div> }
);

const Bar = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Bar),
  { ssr: false, loading: () => <div className="h-[200px] flex items-center justify-center text-gray-400">Chargement...</div> }
);

const Doughnut = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Doughnut),
  { ssr: false, loading: () => <div className="h-[180px] flex items-center justify-center text-gray-400">Chargement...</div> }
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
  type: string;
  title: string;
  description?: string;
  date: string;
  status?: string;
  link?: string;
}

interface MonthlyData {
  month: string;
  value: number;
  label: string;
}

// ============================================================
// TRADUCTIONS
// ============================================================

const translations = {
  fr: {
    dashboard: 'Tableau de bord',
    welcome: 'Bonjour',
    hereIsOverview: 'Voici un résumé de votre activité.',
    lastUpdate: 'Dernière mise à jour',
    yourImpact: 'Votre impact',
    impactDescription: 'Y-MaD connecte les jeunes aux opportunités d\'emploi à Madagascar.',
    activeProjects: 'Projets actifs',
    activeJobs: 'Offres actives',
    quickActions: 'Actions rapides',
    newProject: 'Nouveau projet',
    newJob: 'Nouvelle offre',
    newArticle: 'Nouvel article',
    siteManagement: 'Gestion du site',
    managePages: 'Gérer les pages',
    manageBackgrounds: 'Gérer les fonds',
    seeImpact: 'Voir le détail',
    loading: 'Chargement...',
    error: 'Erreur de chargement',
    retry: 'Réessayer',
    admin: 'Admin',
    refresh: 'Actualiser',
    recentActivity: 'Activité récente',
    viewAll: 'Voir tout',
    noActivity: 'Aucune activité',
    quickTips: 'Conseils',
    tip1: 'Publiez des offres régulièrement',
    tip2: 'Répondez aux candidatures rapidement',
    tip3: 'Mettez en avant vos projets',
    tip4: 'Actualisez votre blog',
    systemOperational: 'Système opérationnel',
    databaseSynced: 'Base synchronisée',
    copyright: 'Y-MaD Platform v1.0 - 2025',
    totalUsers: 'Utilisateurs',
    manageUsers: 'Gérer les utilisateurs',
    accessDenied: 'Accès refusé',
    adminOnly: 'Page réservée aux administrateurs.',
    returnHome: 'Retour à l\'accueil',
    completionRate: 'Taux complétion',
    applicationsReceived: 'Candidatures',
    newUsers: 'Nouveaux utilisateurs',
    projectsCompleted: 'Projets terminés',
    monthlyStats: 'Évolution mensuelle',
    jobsEvolution: 'Offres d\'emploi',
    applicationsEvolution: 'Candidatures',
    usersEvolution: 'Utilisateurs',
    projectsEvolution: 'Projets',
    notifications: 'Notifications',
    markAllRead: 'Tout marquer lu',
    noNotifications: 'Aucune notification',
    newApplication: 'Nouvelle candidature',
    newContact: 'Nouveau message',
    appliedTo: 'a postulé à',
    viewApplication: 'Voir la candidature',
    viewMessage: 'Voir le message',
    unreadNotifications: 'non lues',
    total: 'total',
    evolution: 'Évolution',
    distribution: 'Répartition des projets',
    totalJobsLabel: 'Offres',
    publishedJobsLabel: 'Offres publiées',
    totalProjectsLabel: 'Projets',
    activeProjectsLabel: 'Projets actifs',
    blogPostsLabel: 'Articles',
    pendingLabel: 'En attente',
    contactsLabel: 'Messages',
    unreadLabel: 'Non lus',
    totalOffers: 'Total des offres',
    totalCandidates: 'Total des candidats',
    activeUsers: 'Utilisateurs actifs',
  },
  mg: {
    dashboard: 'Fampisehoana',
    welcome: 'Tonga soa',
    hereIsOverview: 'Ity ny famintinana ny asanao.',
    lastUpdate: 'Fanavaozana farany',
    yourImpact: 'Ny fiantraikanao',
    impactDescription: 'Y-MaD mampifandray ny tanora amin\'ny asa eto Madagasikara.',
    activeProjects: 'Tetikasa mavitrika',
    activeJobs: 'Asa misokatra',
    quickActions: 'Hetsika haingana',
    newProject: 'Tetikasa vaovao',
    newJob: 'Asa vaovao',
    newArticle: 'Lahatsoratra vaovao',
    siteManagement: 'Fitantanan-tranonkala',
    managePages: 'Hitantana pejy',
    manageBackgrounds: 'Hitantana sary',
    seeImpact: 'Jereo antsipirihany',
    loading: 'Fandefasana...',
    error: 'Tsy nahomby',
    retry: 'Andramo indray',
    admin: 'Mpandrindra',
    refresh: 'Havaozina',
    recentActivity: 'Hetsika vao',
    viewAll: 'Jereo daholo',
    noActivity: 'Tsy misy hetsika',
    quickTips: 'Torolalana',
    tip1: 'Avoary matetika ny asa',
    tip2: 'Valio ny fangatahana haingana',
    tip3: 'Asongadino ny tetikasa',
    tip4: 'Havaozy ny bilaogy',
    systemOperational: 'Rafitra miasa',
    databaseSynced: 'Angona voarakitra',
    copyright: 'Y-MaD Platform v1.0 - 2025',
    totalUsers: 'Mpampiasa',
    manageUsers: 'Hitantana mpampiasa',
    accessDenied: 'Tsy mahazo miditra',
    adminOnly: 'Ho an\'ny mpandrindra ihany.',
    returnHome: 'Hiverina any an-tokotany',
    completionRate: 'Tahan\'ny fahavitana',
    applicationsReceived: 'Fangatahana',
    newUsers: 'Mpampiasa vaovao',
    projectsCompleted: 'Tetikasa vita',
    monthlyStats: 'Fivoarana isam-bolana',
    jobsEvolution: 'Asa',
    applicationsEvolution: 'Fangatahana',
    usersEvolution: 'Mpampiasa',
    projectsEvolution: 'Tetikasa',
    notifications: 'Fampandrenesana',
    markAllRead: 'Soraty ho voavaky',
    noNotifications: 'Tsy misy',
    newApplication: 'Fangatahana vaovao',
    newContact: 'Hafatra vaovao',
    appliedTo: 'dia nangataka ho an\'ny',
    viewApplication: 'Jereo ny fangatahana',
    viewMessage: 'Jereo ny hafatra',
    unreadNotifications: 'tsy mbola novakiana',
    total: 'rehetra',
    evolution: 'Fivoarana',
    distribution: 'Fizarana tetikasa',
    totalJobsLabel: 'Asa',
    publishedJobsLabel: 'Asa navoaka',
    totalProjectsLabel: 'Tetikasa',
    activeProjectsLabel: 'Tetikasa mavitrika',
    blogPostsLabel: 'Lahatsoratra',
    pendingLabel: 'Miandry',
    contactsLabel: 'Hafatra',
    unreadLabel: 'Tsy mbola novakiana',
    totalOffers: 'Totalin\'ny asa',
    totalCandidates: 'Totalin\'ny mpangataka',
    activeUsers: 'Mpampiasa mavitrika',
  }
};

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
  const bgClass = notification.read 
    ? 'bg-gray-50 border-gray-200' 
    : 'bg-red-50 border-red-300';

  return (
    <div className={`p-3 rounded-lg border transition-all duration-200 ${bgClass} relative`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 font-medium">{notification.title}</p>
          <p className="text-xs text-gray-600 mt-0.5">{notification.description}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-gray-400">{notification.date}</span>
            {notification.link && (
              <Link
                href={notification.link}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => !notification.read && onRead(notification.id)}
              >
                {notification.link.includes('/contacts/') ? (t('viewMessage') || 'Voir') : (t('viewApplication') || 'Voir')} →
              </Link>
            )}
          </div>
        </div>
        {!notification.read && (
          <button
            onClick={() => onRead(notification.id)}
            className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-2 py-1 rounded-full"
          >
            <Check className="w-3 h-3" />
          </button>
        )}
      </div>
      {!notification.read && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm"></div>
      )}
    </div>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function DashboardHome() {
  const router = useRouter();
  const { user, token, isAdmin, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  
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

  const t = useCallback((key: string): string => {
    const lang = language === 'fr' ? translations.fr : translations.mg;
    return lang[key as keyof typeof lang] || key;
  }, [language]);

  // ============================================================
  // DONNEES SIMPLIFIEES POUR LES GRAPHIQUES
  // ============================================================

  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  
  // Données pour l'évolution des offres (simplifiées)
  const jobsEvolutionData = useMemo(() => {
    if (monthlyData.length > 0) {
      return monthlyData.map(d => d.jobs || 0);
    }
    return [4, 7, 5, 9, 12, 8, 15, 11, 18, 14, 20, 25];
  }, [monthlyData]);

  // Données pour l'évolution des candidatures (simplifiées)
  const applicationsEvolutionData = useMemo(() => {
    if (monthlyData.length > 0) {
      return monthlyData.map(d => d.applications || 0);
    }
    return [2, 5, 8, 6, 14, 10, 20, 15, 25, 18, 30, 35];
  }, [monthlyData]);

  // ============================================================
  // CONFIGURATION DES GRAPHIQUES - ULTRA SIMPLE
  // ============================================================

  // Graphique d'évolution - 1 seule ligne claire
  const evolutionChartData = {
    labels: months,
    datasets: [
      {
        label: t('jobsEvolution') || 'Offres d\'emploi',
        data: jobsEvolutionData,
        borderColor: '#1e3a8a',
        backgroundColor: 'rgba(30, 58, 138, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#1e3a8a',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3
      }
    ]
  };

  // Graphique de comparaison - 2 barres simples
  const comparisonChartData = {
    labels: months,
    datasets: [
      {
        label: t('applicationsEvolution') || 'Candidatures',
        data: applicationsEvolutionData,
        backgroundColor: 'rgba(30, 58, 138, 0.8)',
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  };

  // Graphique de répartition - 3 parts simples
  const distributionData = {
    labels: ['Actifs', 'Terminés', 'En attente'],
    datasets: [
      {
        data: [
          stats.activeProjects || 1,
          stats.completedProjects || 1,
          Math.max(0, (stats.totalProjects || 0) - (stats.activeProjects || 0) - (stats.completedProjects || 0))
        ],
        backgroundColor: ['#1e3a8a', '#3b82f6', '#93c5fd'],
        borderWidth: 0,
        hoverOffset: 8
      }
    ]
  };

  // ============================================================
  // OPTIONS DES GRAPHIQUES - ULTRA SIMPLES ET CLAIRS
  // ============================================================

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: { size: 12, weight: 'bold' as const, family: 'Inter, sans-serif' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 58, 138, 0.95)',
        titleFont: { size: 13, weight: 'bold' as const },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'rectRounded',
          padding: 15,
          font: { size: 12, weight: 'bold' as const, family: 'Inter, sans-serif' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 58, 138, 0.95)',
        titleFont: { size: 13, weight: 'bold' as const },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } }
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
          font: { size: 12, weight: '500' as const, family: 'Inter, sans-serif' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 58, 138, 0.95)',
        titleFont: { size: 13, weight: 'bold' as const },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        padding: 12
      }
    },
    cutout: '60%'
  };

  // ============================================================
  // VERIFICATION D'ACCES
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
  // CHARGEMENT DES DONNEES BACKEND
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
        projectsRes, jobsRes, contactsRes, 
        usersRes, applicationsRes
      ] = await Promise.all([
        fetch(`${API_URL}/projects/stats`, { headers }),
        fetch(`${API_URL}/jobs/offers/stats`, { headers }),
        fetch(`${API_URL}/contact?limit=5`, { headers }),
        fetch(`${API_URL}/auth/users?page=1&limit=100`, { headers }),
        fetch(`${API_URL}/applications/stats`, { headers })
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

      // Candidatures
      if (applicationsRes.ok) {
        const data = await applicationsRes.json();
        setStats(prev => ({ 
          ...prev, 
          totalApplications: data.total || 0, 
          pendingApplications: data.pending || 0,
          applicationsThisMonth: data.thisMonth || 0,
        }));

        const recentApps = data.recentApplications || [];
        if (recentApps.length > 0) {
          const appNotifications: Notification[] = recentApps.slice(0, 3).map((app: any) => ({
            id: app.id || `app-${Date.now()}`,
            title: t('newApplication') || 'Nouvelle candidature',
            description: `${app.candidateName || 'Candidat'} ${t('appliedTo') || 'a postulé'}`,
            type: 'info',
            date: new Date(app.created_at || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
            read: false,
            link: `/dashboard/applications/${app.id}`,
          }));
          
          setNotifications(prev => {
            const existingIds = new Set(prev.map(n => n.id));
            const filtered = appNotifications.filter(n => !existingIds.has(n.id));
            return [...filtered, ...prev];
          });
        }
      }

      // Contacts
      if (contactsRes.ok) {
        const data = await contactsRes.json();
        const contacts = data.data || data || [];
        const unread = contacts.filter((c: any) => !c.read).length;
        
        setStats(prev => ({ 
          ...prev, 
          totalContacts: contacts.length || 0, 
          unreadContacts: unread || 0 
        }));
      }

      // Utilisateurs
      if (usersRes.ok) {
        const data = await usersRes.json();
        const users = data.data || data || [];
        setStats(prev => ({ 
          ...prev, 
          totalUsers: users.length || 0,
        }));
      }

      setStats(prev => ({
        ...prev,
        completionRate: prev.completedProjects > 0 && prev.totalProjects > 0 
          ? Math.round((prev.completedProjects / prev.totalProjects) * 100)
          : 0,
        lastUpdated: new Date().toLocaleTimeString('fr-FR')
      }));

      if (showRefresh) {
        toast.success('Données actualisées');
      }

    } catch (err) {
      console.error('Erreur de chargement:', err);
      setError('Impossible de charger les données');
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
    toast.success('Toutes les notifications lues');
  };

  // ============================================================
  // STATISTIQUES POUR LES CARTES
  // ============================================================

  const statsForCards = useMemo(() => ({
    totalJobs: stats.totalJobs || 0,
    publishedJobs: stats.publishedJobs || 0,
    totalApplications: stats.totalApplications || 0,
    pendingApplications: stats.pendingApplications || 0,
    totalProjects: stats.totalProjects || 0,
    activeProjects: stats.activeProjects || 0,
    totalBlogPosts: stats.totalBlogPosts || 0,
    publishedBlogPosts: stats.publishedBlogPosts || 0,
    unreadContacts: stats.unreadContacts || 0,
    totalUsers: stats.totalUsers || 0,
  }), [stats]);

  // ============================================================
  // RENDU
  // ============================================================

  if (isLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-800 animate-spin" />
        <p className="text-gray-500">{t('loading') || 'Chargement...'}</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <Lock className="w-10 h-10 text-gray-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{t('accessDenied') || 'Accès refusé'}</h2>
        <p className="text-gray-500 text-center max-w-md">{t('adminOnly') || 'Page réservée aux administrateurs.'}</p>
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 pb-8">
      
      {/* ============================================================
      EN-TETE
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
                {t('welcome') || 'Bonjour'} <span className="font-semibold text-blue-800">{user?.first_name || 'Admin'}</span> ! {t('hereIsOverview') || 'Voici un résumé de votre activité.'}
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
            {t('admin') || 'Admin'}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-4 h-4 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-sm border-2 border-white">
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
                        {t('markAllRead') || 'Tout marquer lu'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 10).map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={handleMarkNotificationAsRead}
                        t={t}
                      />
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">{t('noNotifications') || 'Aucune notification'}</p>
                    </div>
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
      GRAPHIQUES SIMPLES ET CLAIRS
      ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Graphique 1: Évolution des offres - Ligne simple */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-800">
                {t('jobsEvolution') || 'Évolution des offres d\'emploi'}
              </h2>
            </div>
            <span className="text-xs text-gray-400">2025</span>
          </div>
          <div className="h-[220px]">
            <Line data={evolutionChartData} options={lineChartOptions} />
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-2">
             {t('jobsEvolution') || 'Offres d\'emploi'} publiées par mois
          </p>
        </div>

        {/* Graphique 2: Candidatures reçues - Barres simples */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-800">
                {t('applicationsEvolution') || 'Candidatures reçues'}
              </h2>
            </div>
            <span className="text-xs text-gray-400">2025</span>
          </div>
          <div className="h-[220px]">
            <Bar data={comparisonChartData} options={barChartOptions} />
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-2">
             {t('applicationsEvolution') || 'Candidatures'} reçues par mois
          </p>
        </div>
      </div>

      {/* ============================================================
      GRAPHIQUE 3: Répartition des projets - Anneau simple
      ============================================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <PieChart className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-800">
              {t('distribution') || 'Répartition des projets'}
            </h2>
          </div>
          <span className="text-xs text-gray-400">Total: {stats.totalProjects}</span>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="w-[200px] h-[200px]">
            <Doughnut data={distributionData} options={doughnutOptions} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-800 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">{stats.activeProjects}</p>
                <p className="text-xs text-gray-500">Projets actifs</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">{stats.completedProjects}</p>
                <p className="text-xs text-gray-500">Projets terminés</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-300 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {Math.max(0, stats.totalProjects - stats.activeProjects - stats.completedProjects)}
                </p>
                <p className="text-xs text-gray-500">Projets en attente</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
      SECTION IMPACT ET ACTIVITE
      ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Impact */}
        <div className="bg-blue-800 rounded-xl p-6 text-white shadow-md">
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
            {t('impactDescription') || 'Y-MaD connecte les jeunes aux opportunités d\'emploi à Madagascar.'}
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
        </div>

        {/* Activité récente */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-gray-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-800">{t('recentActivity') || 'Activité récente'}</h2>
            </div>
            <Link href="/dashboard/activities" className="text-xs text-blue-800 hover:text-blue-900 font-medium">
              {t('viewAll') || 'Voir tout'} →
            </Link>
          </div>
          
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-200">
                    {activity.type === 'contact' ? <Mail className="w-4 h-4 text-blue-700" /> : 
                     activity.type === 'application' ? <FileText className="w-4 h-4 text-blue-700" /> :
                     activity.type === 'job' ? <Briefcase className="w-4 h-4 text-blue-700" /> :
                     activity.type === 'project' ? <FolderOpen className="w-4 h-4 text-blue-700" /> :
                     <UserPlus className="w-4 h-4 text-blue-700" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate">{activity.title}</p>
                    {activity.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">{t('noActivity') || 'Aucune activité'}</p>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
      ACTIONS RAPIDES
      ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-gray-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-800">{t('quickActions') || 'Actions rapides'}</h2>
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

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Layout className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">{t('siteManagement') || 'Gestion du site'}</h2>
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
                <span className="font-medium">{t('manageBackgrounds') || 'Gérer les fonds'}</span>
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
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">{t('systemOperational') || 'Système opérationnel'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">{t('databaseSynced') || 'Base synchronisée'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-blue-700" />
              <span className="text-xs text-gray-500">Accès admin</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {t('copyright') || 'Y-MaD Platform v1.0 - 2025'}
          </div>
        </div>
      </div>
    </div>
  );
}