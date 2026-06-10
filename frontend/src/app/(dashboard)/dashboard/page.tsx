'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { 
  TrendingUp, ArrowRight, Loader2, Award, Target, Sparkles,
  RefreshCw, PlusCircle, FilePlus, BarChart4, Layout, Image, Plus,
  AlertCircle, Briefcase, FolderOpen, FileText, Users, Mail,
  Clock, CheckCircle, Calendar, Zap
} from 'lucide-react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalJobs: number;
  publishedJobs: number;
  totalApplications: number;
  pendingApplications: number;
  totalBlogPosts: number;
  publishedBlogPosts: number;
  totalContacts: number;
  unreadContacts: number;
  lastUpdated?: string;
}

interface ActivityItem {
  id: string;
  type: 'job' | 'application' | 'project' | 'contact';
  title: string;
  date: string;
  status?: string;
}

const translations = {
  fr: {
    dashboard: 'Tableau de bord',
    welcome: 'Bienvenue,',
    hereIsOverview: 'Voici un aperçu de votre activité.',
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
    admin: 'Admin',
    refresh: 'Actualiser',
    recentActivity: 'Activité récente',
    viewAll: 'Voir tout',
    noActivity: 'Aucune activité récente',
    quickTips: 'Conseils rapides',
    tip1: 'Publiez des offres régulièrement pour attirer plus de candidats',
    tip2: 'Répondez aux candidatures dans les 48h',
    tip3: 'Mettez en avant vos projets réussis',
    tip4: 'Actualisez votre blog chaque semaine',
    systemOperational: 'Système opérationnel',
    databaseSynced: 'Base de données synchronisée',
    copyright: 'Y-MaD Platform v1.0 - 2025 Young for Madagascar Development',
  },
  mg: {
    dashboard: 'Takila fampisehoana',
    welcome: 'Tonga soa,',
    hereIsOverview: 'Ity ny famintinana ny asanao.',
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
    quickTips: 'Torolalana haingana',
    tip1: 'Avoary matetika ny asa mba hisarihana mpangataka maro',
    tip2: 'Valio ny fangatahana ao anatin\'ny 48 ora',
    tip3: 'Asongadino ny tetikasanao nahomby',
    tip4: 'Havaozy ny bilaogy isan-kerinandro',
    systemOperational: 'Rafitra miasa',
    databaseSynced: 'Angona voarakitra',
    copyright: 'Y-MaD Platform v1.0 - 2025 Young for Madagascar Development',
  }
};

export default function DashboardHome() {
  const { user, token } = useAuth();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.fr;
  
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalJobs: 0,
    publishedJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalBlogPosts: 0,
    publishedBlogPosts: 0,
    totalContacts: 0,
    unreadContacts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

  const fetchStats = useCallback(async (showRefresh = false) => {
    if (!token) {
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
      
      const [projectsRes, jobsRes, blogRes, contactsRes] = await Promise.all([
        fetch(`${API_URL}/projects/stats`, { headers }),
        fetch(`${API_URL}/jobs/offers/stats`, { headers }),
        fetch(`${API_URL}/blog/stats`, { headers }),
        fetch(`${API_URL}/contact?limit=5`, { headers })
      ]);

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setStats(prev => ({ ...prev, totalProjects: projectsData.total || 0, activeProjects: projectsData.active || 0 }));
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setStats(prev => ({ 
          ...prev, 
          totalJobs: jobsData.total || 0, 
          publishedJobs: jobsData.published || 0,
          totalApplications: jobsData.totalApplications || 0,
          pendingApplications: jobsData.pendingApplications || 0
        }));
      }

      if (blogRes.ok) {
        const blogData = await blogRes.json();
        setStats(prev => ({ ...prev, totalBlogPosts: blogData.total || 0, publishedBlogPosts: blogData.published || 0 }));
      }

      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        setStats(prev => ({ ...prev, totalContacts: contactsData.total || 0, unreadContacts: contactsData.unread || 0 }));
        
        const recentActivities: ActivityItem[] = (contactsData.data || []).slice(0, 3).map((contact: any) => ({
          id: contact.id,
          type: 'contact',
          title: `Nouveau message de ${contact.name}`,
          date: new Date(contact.created_at).toLocaleDateString('fr-FR'),
        }));
        setActivities(recentActivities);
      }

      setStats(prev => ({ ...prev, lastUpdated: new Date().toLocaleTimeString('fr-FR') }));

      if (showRefresh) {
        toast.success('Données actualisées');
      }

    } catch (err) {
      console.error('Error:', err);
      setError('Impossible de charger les statistiques.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    if (token) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [token, fetchStats]);

  const handleRefresh = () => fetchStats(true);

  const statsForCards = {
    totalJobs: stats.totalJobs,
    publishedJobs: stats.publishedJobs,
    totalApplications: stats.totalApplications,
    pendingApplications: stats.pendingApplications,
    totalProjects: stats.totalProjects,
    activeProjects: stats.activeProjects,
    totalBlogPosts: stats.totalBlogPosts,
    publishedBlogPosts: stats.publishedBlogPosts,
    unreadContacts: stats.unreadContacts,
  };

  const tips = [t.tip1, t.tip2, t.tip3, t.tip4];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-800 animate-spin" />
        <p className="text-gray-500">{t.loading}</p>
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
          {t.retry}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{t.dashboard}</h1>
              <p className="text-sm text-gray-500">
                {t.welcome} <span className="font-semibold text-blue-800">{user?.first_name || 'Admin'}</span> ! {t.hereIsOverview}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-xs text-gray-600 font-medium">{t.refresh}</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 font-medium">
              {t.lastUpdate}: {stats.lastUpdated || '...'}
            </span>
          </div>
          {user?.role === 'super_admin' && (
            <span className="px-3 py-1.5 bg-blue-800 text-white text-xs rounded-lg font-medium shadow-sm">
              {t.admin}
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={statsForCards} loading={loading} />

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Impact Card - Blue Y-MaD */}
        <div className="lg:col-span-1 bg-blue-800 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">{t.yourImpact}</h3>
              <p className="text-blue-200 text-xs">2024 - 2025</p>
            </div>
          </div>
          <p className="text-blue-100 text-sm mb-6 leading-relaxed">
            {t.impactDescription}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 rounded-xl py-3 px-2 text-center">
              <p className="text-2xl font-bold text-white">{stats.activeProjects}</p>
              <p className="text-xs text-blue-200">{t.activeProjects}</p>
            </div>
            <div className="bg-white/10 rounded-xl py-3 px-2 text-center">
              <p className="text-2xl font-bold text-white">{stats.publishedJobs}</p>
              <p className="text-xs text-blue-200">{t.activeJobs}</p>
            </div>
          </div>
          <Link
            href="/dashboard/impact"
            className="inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors group"
          >
            {t.seeImpact} 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">{t.recentActivity}</h2>
            </div>
            <Link href="/dashboard/activities" className="text-xs text-blue-800 hover:text-blue-900 font-medium">
              {t.viewAll} →
            </Link>
          </div>
          
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    {activity.type === 'contact' && <Mail className="w-4 h-4 text-gray-600" />}
                    {activity.type === 'application' && <FileText className="w-4 h-4 text-gray-600" />}
                    {activity.type === 'job' && <Briefcase className="w-4 h-4 text-gray-600" />}
                    {activity.type === 'project' && <FolderOpen className="w-4 h-4 text-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">{t.noActivity}</p>
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{t.quickTips}</h2>
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

      {/* Quick Actions & Site Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{t.quickActions}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link 
              href="/dashboard/projects/new" 
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-blue-800 transition-colors">
                <PlusCircle className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm text-gray-700 group-hover:text-blue-800 transition-colors font-medium">{t.newProject}</span>
            </Link>
            <Link 
              href="/dashboard/jobs/new" 
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-blue-800 transition-colors">
                <Plus className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm text-gray-700 group-hover:text-blue-800 transition-colors font-medium">{t.newJob}</span>
            </Link>
            <Link 
              href="/dashboard/blog/new" 
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-blue-800 transition-colors">
                <FilePlus className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm text-gray-700 group-hover:text-blue-800 transition-colors font-medium">{t.newArticle}</span>
            </Link>
            <Link 
              href="/dashboard/reports" 
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-blue-800 transition-colors">
                <BarChart4 className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm text-gray-700 group-hover:text-blue-800 transition-colors font-medium">{t.generateReport}</span>
            </Link>
          </div>
        </div>

        {/* Site Management */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Layout className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{t.siteManagement}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{t.siteManagementDesc}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/dashboard/pages"
              className="flex items-center justify-between px-5 py-3.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-all duration-200 group shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-white" />
                <span className="font-medium">{t.managePages}</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard/backgrounds"
              className="flex items-center justify-between px-5 py-3.5 border border-blue-800 text-blue-800 rounded-lg hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                <span className="font-medium">{t.manageBackgrounds}</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="border-t border-gray-200 pt-6 mt-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-800 rounded-full"></div>
              <span className="text-xs text-gray-500">{t.systemOperational}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">{t.databaseSynced}</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {t.copyright}
          </div>
        </div>
      </div>
    </div>
  );
}