// frontend/src/app/(dashboard)/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { 
  Users, FolderOpen, Calendar, Briefcase, FileText, Heart, 
  Gift, TrendingUp, ArrowRight, Settings, Globe, CheckCircle,
  Loader2, Award, Target, HandHeart, Sparkles, GraduationCap
} from 'lucide-react';

interface DashboardStats {
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

// ==================== TRADUCTIONS ====================
const translations = {
  fr: {
    // En-tête
    dashboard: 'Tableau de bord',
    welcome: 'Bienvenue,',
    hereIsOverview: 'Voici un aperçu de votre activité.',
    lastUpdate: 'Dernière mise à jour aujourd\'hui',
    
    // Cartes principales
    members: 'Membres',
    active: 'actifs',
    projects: 'Projets',
    events: 'Événements',
    upcoming: 'à venir',
    jobOffers: 'Offres emploi',
    open: 'ouvertes',
    
    // Cartes secondaires
    applications: 'Candidatures',
    pending: 'en attente',
    donations: 'Dons (mois)',
    volunteers: 'Bénévoles',
    beneficiaries: 'Bénéficiaires',
    impactRate: 'Taux impact',
    
    // Section Impact
    yourImpact: 'Votre impact',
    impactDescription: 'Grâce à votre engagement, Y-Mad continue de transformer des vies à Madagascar.',
    peopleImpacted: 'Personnes impactées',
    activeProjects: 'Projets actifs',
    regionsCovered: 'Régions couvertes',
    
    // Actions rapides
    quickActions: 'Actions rapides',
    newMember: 'Nouveau membre',
    newProject: 'Nouveau projet',
    newEvent: 'Nouvel événement',
    newJob: 'Nouvelle offre',
    newArticle: 'Nouvel article',
    generateReport: 'Générer rapport',
    newBeneficiary: 'Nouveau bénéficiaire',
    
    // Gestion du site
    siteManagement: 'Gestion du site',
    siteManagementDesc: 'Personnalisez l\'apparence et le contenu du site',
    managePages: 'Gérer les pages',
    manageBackgrounds: 'Gérer les fonds d\'écran',
    
    // Actions
    viewDetails: 'Voir les détails',
    seeImpact: 'Voir le détail de l\'impact',
    loading: 'Chargement de votre tableau de bord...',
    
    // Badges
    admin: 'Admin',
  },
  mg: {
    // En-tête
    dashboard: 'Takila fampisehoana',
    welcome: 'Tonga soa,',
    hereIsOverview: 'Ity ny famintinana ny asanao.',
    lastUpdate: 'Fanavaozana farany androany',
    
    // Cartes principales
    members: 'Mpikambana',
    active: 'mavitrika',
    projects: 'Tetikasa',
    events: 'Hetsika',
    upcoming: 'ho avy',
    jobOffers: 'Asa atolotra',
    open: 'misokatra',
    
    // Cartes secondaires
    applications: 'Fangatahana',
    pending: 'miandry',
    donations: 'Fanomezana (volana)',
    volunteers: 'Mpanao an-tsitrapo',
    beneficiaries: 'Tompondaka',
    impactRate: 'Tahan\'ny fiantraikany',
    
    // Section Impact
    yourImpact: 'Ny fiantraikanao',
    impactDescription: 'Noho ny fandraisanao anjara, Y-Mad dia manohy manova ny fiainan\'ny olona eto Madagasikara.',
    peopleImpacted: 'Olona voatafika',
    activeProjects: 'Tetikasa mavitrika',
    regionsCovered: 'Faritra voarakotra',
    
    // Actions rapides
    quickActions: 'Hetsika haingana',
    newMember: 'Mpikambana vaovao',
    newProject: 'Tetikasa vaovao',
    newEvent: 'Hetsika vaovao',
    newJob: 'Asa vaovao',
    newArticle: 'Lahatsoratra vaovao',
    generateReport: 'Mamorona tatitra',
    newBeneficiary: 'Tompondaka vaovao',
    
    // Gestion du site
    siteManagement: 'Fitantanan-tranonkala',
    siteManagementDesc: 'Amboary ny endrika sy ny atiny',
    managePages: 'Hitantana pejy',
    manageBackgrounds: 'Hitantana sary ambadika',
    
    // Actions
    viewDetails: 'Jereo antsipirihany',
    seeImpact: 'Jereo ny antsipirihan\'ny fiantraikany',
    loading: 'Fandefasana ny takilanao...',
    
    // Badges
    admin: 'Mpandrindra',
  }
};

export default function DashboardHome() {
  const { user, token } = useAuth();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.fr;
  
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0, activeMembers: 0,
    totalProjects: 0, activeProjects: 0,
    totalEvents: 0, upcomingEvents: 0,
    totalJobs: 0, activeJobs: 0,
    totalApplications: 0, pendingApplications: 0,
    totalDonations: 0, monthlyDonations: 0,
    totalVolunteers: 0, activeVolunteers: 0,
    totalBeneficiaries: 0, impactRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
      
      // Appels parallèles pour toutes les stats
      const [membersRes, projectsRes, eventsRes, jobsRes, donationsRes, volunteersRes, beneficiariesRes] = await Promise.allSettled([
        fetch(`${API_URL}/members/stats/all`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/projects/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/events`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/jobs/offers/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/donations/stats/all`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/volunteers/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/beneficiaries/stats/impact`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      // Membres
      if (membersRes.status === 'fulfilled' && membersRes.value.ok) {
        const data = await membersRes.value.json();
        setStats(prev => ({ ...prev, 
          totalMembers: data.total || 0, 
          activeMembers: data.active || 0 
        }));
      }

      // Projets
      if (projectsRes.status === 'fulfilled' && projectsRes.value.ok) {
        const data = await projectsRes.value.json();
        setStats(prev => ({ ...prev, 
          totalProjects: data.total || 0,
          activeProjects: data.active || 0
        }));
      }

      // Événements
      if (eventsRes.status === 'fulfilled' && eventsRes.value.ok) {
        const data = await eventsRes.value.json();
        const upcoming = data.filter((e: any) => e.status === 'published' && new Date(e.start_datetime) > new Date()).length;
        setStats(prev => ({ ...prev, 
          totalEvents: data.length || 0,
          upcomingEvents: upcoming
        }));
      }

      // Offres emploi
      if (jobsRes.status === 'fulfilled' && jobsRes.value.ok) {
        const data = await jobsRes.value.json();
        setStats(prev => ({ ...prev, 
          totalJobs: data.total || 0,
          activeJobs: data.active || 0,
          totalApplications: data.applications || 0,
          pendingApplications: data.pending || 0
        }));
      }

      // Dons
      if (donationsRes.status === 'fulfilled' && donationsRes.value.ok) {
        const data = await donationsRes.value.json();
        setStats(prev => ({ ...prev, 
          monthlyDonations: data.monthly || 0
        }));
      }

      // Bénévoles
      if (volunteersRes.status === 'fulfilled' && volunteersRes.value.ok) {
        const data = await volunteersRes.value.json();
        setStats(prev => ({ ...prev, 
          totalVolunteers: data.total || 0,
          activeVolunteers: data.active || 0
        }));
      }

      // Bénéficiaires
      if (beneficiariesRes.status === 'fulfilled' && beneficiariesRes.value.ok) {
        const data = await beneficiariesRes.value.json();
        setStats(prev => ({ ...prev, 
          totalBeneficiaries: data.total || 0,
          impactRate: data.impactRate || 0
        }));
      }

    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalImpacted = stats.totalMembers + stats.totalVolunteers + stats.totalBeneficiaries;
  const totalDonationsMillions = (stats.monthlyDonations / 1000000).toFixed(1);
  const donationsFormatted = new Intl.NumberFormat('fr-MG').format(stats.monthlyDonations);

  // Cartes principales
  const mainStatCards = [
    { title: t.members, value: stats.totalMembers, subValue: `${stats.activeMembers} ${t.active}`, icon: Users, href: '/dashboard/members' },
    { title: t.projects, value: stats.totalProjects, subValue: `${stats.activeProjects} ${t.active}`, icon: FolderOpen, href: '/dashboard/projects' },
    { title: t.events, value: stats.totalEvents, subValue: `${stats.upcomingEvents} ${t.upcoming}`, icon: Calendar, href: '/dashboard/events' },
    { title: t.jobOffers, value: stats.totalJobs, subValue: `${stats.activeJobs} ${t.open}`, icon: Briefcase, href: '/dashboard/jobs' },
  ];

  const secondaryStatCards = [
    { title: t.applications, value: stats.totalApplications, subValue: `${stats.pendingApplications} ${t.pending}`, icon: FileText, href: '/dashboard/jobs/applications' },
    { title: t.donations, value: `${donationsFormatted} Ar`, subValue: 'Ariary', icon: Gift, href: '/dashboard/donations' },
    { title: t.volunteers, value: stats.totalVolunteers, subValue: `${stats.activeVolunteers} ${t.active}`, icon: Heart, href: '/dashboard/volunteers' },
    { title: t.beneficiaries, value: stats.totalBeneficiaries, subValue: `${t.impactRate}: ${stats.impactRate}%`, icon: GraduationCap, href: '/dashboard/beneficiaries' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-gray-500">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ==================== EN-TÊTE ==================== */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{t.dashboard}</h1>
          </div>
          <p className="text-gray-500">
            {t.welcome} <span className="font-semibold text-gray-700">{user?.firstName || 'Super'} {user?.lastName || t.admin}</span> ! {t.hereIsOverview}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-xs text-blue-700 font-medium">{t.lastUpdate}</span>
        </div>
      </div>

      {/* ==================== CARTES PRINCIPALES (4) ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {mainStatCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              href={card.href}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{card.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{card.subValue}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
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

      {/* ==================== CARTES SECONDAIRES (4) ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {secondaryStatCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              href={card.href}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{card.subValue}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
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

      {/* ==================== SECTION IMPACT ET ACTIONS ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section Impact */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-white">{t.yourImpact}</h3>
          </div>
          <p className="text-blue-100 text-sm mb-5">
            {t.impactDescription}
          </p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{totalImpacted}</p>
              <p className="text-xs text-blue-200">{t.peopleImpacted}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.activeProjects}</p>
              <p className="text-xs text-blue-200">{t.activeProjects}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.impactRate || 0}%</p>
              <p className="text-xs text-blue-200">{t.impactRate}</p>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{t.quickActions}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction href="/dashboard/members/new" label={t.newMember} />
            <QuickAction href="/dashboard/projects/new" label={t.newProject} />
            <QuickAction href="/dashboard/events/new" label={t.newEvent} />
            <QuickAction href="/dashboard/jobs/offers/new" label={t.newJob} />
            <QuickAction href="/dashboard/beneficiaries/new" label={t.newBeneficiary} />
            <QuickAction href="/dashboard/blog/new" label={t.newArticle} />
            <QuickAction href="/dashboard/reports" label={t.generateReport} />
          </div>
        </div>
      </div>

      {/* ==================== GESTION DU SITE ==================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Globe className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{t.siteManagement}</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          {t.siteManagementDesc}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/pages"
            className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 group"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="font-medium">{t.managePages}</span>
            </div>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/dashboard/backgrounds"
            className="flex items-center justify-between px-4 py-3 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="font-medium">{t.manageBackgrounds}</span>
            </div>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Composant Action rapide
function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
    >
      <div className="w-2 h-2 bg-blue-600 rounded-full group-hover:scale-110 transition-transform"></div>
      <span className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors">{label}</span>
    </Link>
  );
}