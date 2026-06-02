'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { 
  Briefcase, FileText, TrendingUp, ArrowRight, 
  Loader2, Award, Target, Sparkles, GraduationCap,
  AlertCircle, RefreshCw, PlusCircle, FilePlus,
  BarChart4, Layout, Image, Plus, FolderOpen, Users
} from 'lucide-react';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  totalBlogPosts: number;
  publishedBlogPosts: number;
  totalContacts: number;
  unreadContacts: number;
  lastUpdated?: string;
}

const translations = {
  fr: {
    dashboard: 'Tableau de bord',
    welcome: 'Bienvenue,',
    hereIsOverview: 'Voici un aperçu de votre activité.',
    lastUpdate: 'Dernière mise à jour',
    projects: 'Projets',
    active: 'actifs',
    jobOffers: 'Offres emploi',
    open: 'publiées',
    applications: 'Candidatures',
    pending: 'en attente',
    blog: 'Blog',
    published: 'publiés',
    contacts: 'Messages',
    unread: 'non lus',
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
    viewDetails: 'Voir les détails',
    seeImpact: 'Voir le détail',
    loading: 'Chargement...',
    error: 'Erreur lors du chargement',
    retry: 'Réessayer',
    admin: 'Admin',
    refresh: 'Actualiser',
  },
  mg: {
    dashboard: 'Takila fampisehoana',
    welcome: 'Tonga soa,',
    hereIsOverview: 'Ity ny famintinana ny asanao.',
    lastUpdate: 'Fanavaozana farany',
    projects: 'Tetikasa',
    active: 'mavitrika',
    jobOffers: 'Asa atolotra',
    open: 'navoaka',
    applications: 'Fangatahana',
    pending: 'miandry',
    blog: 'Bitsika',
    published: 'navoaka',
    contacts: 'Hafatra',
    unread: 'tsy novakiana',
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
    viewDetails: 'Jereo antsipirihany',
    seeImpact: 'Jereo ny antsipirihany',
    loading: 'Fandefasana...',
    error: 'Tsy nahomby ny fandefasana',
    retry: 'Andramo indray',
    admin: 'Mpandrindra',
    refresh: 'Havaozina',
  }
};

export default function DashboardHome() {
  const { user, token } = useAuth();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.fr;
  
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0, activeProjects: 0,
    totalJobs: 0, activeJobs: 0,
    totalApplications: 0, pendingApplications: 0,
    totalBlogPosts: 0, publishedBlogPosts: 0,
    totalContacts: 0, unreadContacts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

  const getAuthHeaders = useCallback(() => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }), [token]);

  const fetchWithTimeout = async (url: string, timeout = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { 
        headers: getAuthHeaders(),
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

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
      // Projets
      const projectsRes = await fetchWithTimeout(`${API_URL}/projects/stats`);
      const projectsData = projectsRes.ok ? await projectsRes.json() : {};
      
      // Offres d'emploi
      const jobsRes = await fetchWithTimeout(`${API_URL}/jobs/offers/stats`);
      const jobsData = jobsRes.ok ? await jobsRes.json() : {};
      
      // Blog
      const blogRes = await fetchWithTimeout(`${API_URL}/blog/stats`);
      const blogData = blogRes.ok ? await blogRes.json() : {};
      
      // Contacts
      const contactsRes = await fetchWithTimeout(`${API_URL}/contact`);
      const contactsData = contactsRes.ok ? await contactsRes.json() : {};

      setStats({
        totalProjects: projectsData.total || 0,
        activeProjects: projectsData.active || 0,
        totalJobs: jobsData.total || 0,
        activeJobs: jobsData.published || 0,
        totalApplications: jobsData.totalApplications || 0,
        pendingApplications: jobsData.pendingApplications || 0,
        totalBlogPosts: blogData.total || 0,
        publishedBlogPosts: blogData.published || 0,
        totalContacts: contactsData.total || 0,
        unreadContacts: contactsData.unread || 0,
        lastUpdated: new Date().toISOString()
      });

    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les statistiques.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_URL, token, getAuthHeaders]);

  useEffect(() => {
    if (token) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [token, fetchStats]);

  const handleRefresh = () => fetchStats(true);

  const mainStatCards = [
    { title: t.projects, value: stats.totalProjects, subValue: stats.activeProjects + ' ' + t.active, icon: FolderOpen, href: '/dashboard/projects', iconColor: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: t.jobOffers, value: stats.totalJobs, subValue: stats.activeJobs + ' ' + t.open, icon: Briefcase, href: '/dashboard/jobs', iconColor: 'text-blue-600', bgColor: 'bg-blue-100' },
  ];

  const secondaryStatCards = [
    { title: t.applications, value: stats.totalApplications, subValue: stats.pendingApplications + ' ' + t.pending, icon: FileText, href: '/dashboard/applications', iconColor: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: t.blog, value: stats.totalBlogPosts, subValue: stats.publishedBlogPosts + ' ' + t.published, icon: GraduationCap, href: '/dashboard/blog', iconColor: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: t.contacts, value: stats.totalContacts, subValue: stats.unreadContacts + ' ' + t.unread, icon: Users, href: '/dashboard/contacts', iconColor: 'text-blue-600', bgColor: 'bg-blue-100' },
  ];

  const quickActionsList = [
    { label: t.newProject, href: '/dashboard/projects/new', icon: PlusCircle, iconColor: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: t.newJob, href: '/dashboard/jobs/new', icon: Plus, iconColor: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: t.newArticle, href: '/dashboard/blog/new', icon: FilePlus, iconColor: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: t.generateReport, href: '/dashboard/reports', icon: BarChart4, iconColor: 'text-blue-600', bgColor: 'bg-blue-100' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-gray-500">{t.loading}</p>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-blue-600" />
        </div>
        <p className="text-gray-600 font-medium">{error}</p>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t.retry}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{t.dashboard}</h1>
            {user?.role === 'super_admin' && (
              <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-medium">
                {t.admin}
              </span>
            )}
          </div>
          <p className="text-gray-500">
            {t.welcome} <span className="font-semibold text-gray-700">{user?.first_name || 'Admin'} {user?.last_name || ''}</span> ! {t.hereIsOverview}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
          >
            <RefreshCw className={'w-4 h-4 text-blue-600 ' + (refreshing ? 'animate-spin' : '')} />
            <span className="text-xs text-blue-600 font-medium">{t.refresh}</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">
              {t.lastUpdate}: {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString('fr-FR') : '...'}
            </span>
          </div>
        </div>
      </div>

      {/* Cartes principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {mainStatCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              href={card.href}
              className="group bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{card.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{card.subValue}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow-md group-hover:bg-blue-600 transition-all duration-300">
                  <Icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-all duration-300" />
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                  {t.viewDetails} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Cartes secondaires */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {secondaryStatCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              href={card.href}
              className="group bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{card.subValue}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow-md group-hover:bg-blue-600 transition-all duration-300">
                  <Icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-all duration-300" />
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                  {t.viewDetails} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Section Impact et Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Impact */}
        <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-white text-lg">{t.yourImpact}</h3>
          </div>
          <p className="text-blue-100 text-sm mb-5 leading-relaxed">
            {t.impactDescription}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center bg-white/10 rounded-xl py-3 px-2">
              <p className="text-2xl font-bold text-white">{stats.activeProjects}</p>
              <p className="text-xs text-blue-200">{t.activeProjects}</p>
            </div>
            <div className="text-center bg-white/10 rounded-xl py-3 px-2">
              <p className="text-2xl font-bold text-white">{stats.activeJobs}</p>
              <p className="text-xs text-blue-200">{t.activeJobs}</p>
            </div>
          </div>
          <Link
            href="/dashboard/impact"
            className="inline-flex items-center gap-2 text-sm text-blue-100 hover:text-white transition-colors"
          >
            {t.seeImpact} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{t.quickActions}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActionsList.map((action, idx) => {
              const ActionIcon = action.icon;
              return (
                <Link
                  key={idx}
                  href={action.href}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <ActionIcon className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors font-medium">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gestion du site */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Layout className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{t.siteManagement}</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          {t.siteManagementDesc}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/pages"
            className="flex items-center justify-between px-5 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 group shadow-md"
          >
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-white" />
              <span className="font-medium">{t.managePages}</span>
            </div>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/dashboard/backgrounds"
            className="flex items-center justify-between px-5 py-3.5 border-2 border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{t.manageBackgrounds}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}