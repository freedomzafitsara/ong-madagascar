// frontend/src/components/dashboard/StatsCards.tsx

'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Briefcase, Users, FileText, Mail, FolderOpen, 
  Clock, CheckCircle, AlertCircle, Target, TrendingUp,
  Eye, EyeOff, Calendar, UserPlus, MessageSquare,
  BarChart, PieChart, Activity, Zap
} from 'lucide-react';
import Link from 'next/link';

// ============================================================
// INTERFACES
// ============================================================

interface StatsCardsProps {
  stats: {
    totalJobs: number;
    publishedJobs: number;
    totalApplications: number;
    pendingApplications: number;
    totalProjects: number;
    activeProjects: number;
    totalBlogPosts: number;
    publishedBlogPosts: number;
    unreadContacts: number;
    totalContacts: number;
    totalUsers: number;
    newUsersThisMonth?: number;
    applicationsThisMonth?: number;
    jobsThisMonth?: number;
    completionRate?: number;
  };
  loading: boolean;
}

// ============================================================
// TRADUCTIONS
// ============================================================

const translations = {
  fr: {
    jobs: 'Offres',
    published: 'Publiées',
    applications: 'Candidatures',
    pending: 'En attente',
    projects: 'Projets',
    active: 'Actifs',
    blog: 'Articles',
    contacts: 'Messages',
    unread: 'Non lus',
    users: 'Utilisateurs',
    total: 'Total',
    newUsers: 'Nouveaux',
    thisMonth: 'ce mois',
    applicationsReceived: 'Reçues',
    completionRate: 'Taux de complétion',
    jobsPublished: 'Publiées',
    viewDetails: 'Voir les détails',
    evolution: 'Évolution',
    monthlyStats: 'Statistiques mensuelles',
  },
  mg: {
    jobs: 'Asa',
    published: 'Navoaka',
    applications: 'Fangatahana',
    pending: 'Miandry',
    projects: 'Tetikasa',
    active: 'Mavitrika',
    blog: 'Lahatsoratra',
    contacts: 'Hafatra',
    unread: 'Tsy novakiana',
    users: 'Mpampiasa',
    total: 'Rehetra',
    newUsers: 'Vaovao',
    thisMonth: 'ity volana ity',
    applicationsReceived: 'Noraisina',
    completionRate: 'Tahan\'ny fahavitana',
    jobsPublished: 'Navoaka',
    viewDetails: 'Jereo ny antsipirihany',
    evolution: 'Fivoarana',
    monthlyStats: 'Statistika isam-bolana',
  }
};

// ============================================================
// COMPOSANT DE CARTE STATISTIQUE AVANCÉE
// ============================================================

interface StatCardProps {
  id: string;
  title: string;
  value: number;
  total?: number;
  icon: React.ElementType;
  color: string;
  suffix?: string;
  href?: string;
  change?: number;
  subtitle?: string;
  onClick?: () => void;
}

function StatCard({ 
  id, 
  title, 
  value, 
  total, 
  icon: Icon, 
  color, 
  suffix, 
  href,
  change,
  subtitle,
  onClick 
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      iconBg: 'bg-blue-100',
      border: 'border-blue-200',
      hover: 'hover:border-blue-300'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      iconBg: 'bg-purple-100',
      border: 'border-purple-200',
      hover: 'hover:border-purple-300'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      iconBg: 'bg-green-100',
      border: 'border-green-200',
      hover: 'hover:border-green-300'
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      iconBg: 'bg-orange-100',
      border: 'border-orange-200',
      hover: 'hover:border-orange-300'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      iconBg: 'bg-red-100',
      border: 'border-red-200',
      hover: 'hover:border-red-300'
    },
    gray: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      iconBg: 'bg-gray-100',
      border: 'border-gray-200',
      hover: 'hover:border-gray-300'
    },
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      iconBg: 'bg-teal-100',
      border: 'border-teal-200',
      hover: 'hover:border-teal-300'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      iconBg: 'bg-indigo-100',
      border: 'border-indigo-200',
      hover: 'hover:border-indigo-300'
    }
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;
  const CardWrapper = href ? Link : 'div';

  return (
    <CardWrapper
      href={href || '#'}
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-sm border ${colors.border} p-4 
        hover:shadow-md transition-all duration-200 group
        ${href ? 'cursor-pointer' : ''}
        ${colors.hover}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {value}
            {change !== undefined && (
              <span className={`text-xs font-medium ml-2 ${
                isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-400'
              }`}>
                {isPositive ? '↑' : isNegative ? '↓' : '→'}
                {change !== 0 ? `${Math.abs(change)}%` : '0%'}
              </span>
            )}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
          {suffix && (
            <p className="text-xs text-gray-400 mt-0.5">{suffix}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.iconBg} group-hover:scale-110 transition-transform flex-shrink-0 ml-2`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
      </div>
      
      {/* Indicateur de progression */}
      {total !== undefined && total > 0 && (
        <div className="mt-3">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${colors.bg} transition-all duration-500`}
              style={{ width: `${Math.min((value / total) * 100, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            {Math.round((value / total) * 100)}% du total
          </p>
        </div>
      )}
    </CardWrapper>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export function StatsCards({ stats, loading }: StatsCardsProps) {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.fr;

  // ============================================================
  // CARTES PRINCIPALES - 6 CARTES AVEC INDICATEURS
  // ============================================================

  const mainCards: StatCardProps[] = [
    {
      id: 'jobs',
      title: t.jobs,
      value: stats.publishedJobs,
      total: stats.totalJobs,
      icon: Briefcase,
      color: 'blue',
      suffix: `${t.total} ${stats.totalJobs}`,
      href: '/dashboard/jobs',
      change: stats.jobsThisMonth ? Math.round((stats.jobsThisMonth / Math.max(stats.totalJobs, 1)) * 100) : 0,
      subtitle: `${stats.jobsThisMonth || 0} ${t.thisMonth}`,
    },
    {
      id: 'applications',
      title: t.applications,
      value: stats.pendingApplications,
      total: stats.totalApplications,
      icon: FileText,
      color: 'purple',
      suffix: `${t.total} ${stats.totalApplications}`,
      href: '/dashboard/applications',
      change: stats.applicationsThisMonth ? Math.round((stats.applicationsThisMonth / Math.max(stats.totalApplications, 1)) * 100) : 0,
      subtitle: `${stats.applicationsThisMonth || 0} ${t.thisMonth}`,
    },
    {
      id: 'projects',
      title: t.projects,
      value: stats.activeProjects,
      total: stats.totalProjects,
      icon: FolderOpen,
      color: 'green',
      suffix: `${t.total} ${stats.totalProjects}`,
      href: '/dashboard/projects',
      change: stats.completionRate || 0,
      subtitle: `${stats.completionRate || 0}% ${t.completionRate}`,
    },
    {
      id: 'blog',
      title: t.blog,
      value: stats.publishedBlogPosts,
      total: stats.totalBlogPosts,
      icon: Target,
      color: 'orange',
      suffix: `${t.total} ${stats.totalBlogPosts}`,
      href: '/dashboard/blog',
    },
    {
      id: 'contacts',
      title: t.contacts,
      value: stats.unreadContacts,
      total: stats.totalContacts,
      icon: Mail,
      color: 'red',
      suffix: `${t.total} ${stats.totalContacts}`,
      href: '/dashboard/contacts',
    },
    {
      id: 'users',
      title: t.users,
      value: stats.totalUsers,
      total: stats.totalUsers,
      icon: Users,
      color: 'gray',
      suffix: `${stats.newUsersThisMonth || 0} ${t.newUsers}`,
      href: '/dashboard/users',
      change: stats.newUsersThisMonth ? Math.round((stats.newUsersThisMonth / Math.max(stats.totalUsers, 1)) * 100) : 0,
      subtitle: `${stats.newUsersThisMonth || 0} ${t.thisMonth}`,
    },
  ];

  // ============================================================
  // CARTES SECONDAIRES - STATISTIQUES RAPIDES
  // ============================================================

  const secondaryCards = [
    {
      id: 'completion',
      title: t.completionRate,
      value: `${stats.completionRate || 0}%`,
      icon: Activity,
      color: 'teal',
      subtitle: `${stats.activeProjects} ${t.active} / ${stats.totalProjects} ${t.total}`,
    },
    {
      id: 'new-users',
      title: t.newUsers,
      value: stats.newUsersThisMonth || 0,
      icon: UserPlus,
      color: 'indigo',
      subtitle: t.thisMonth,
    },
    {
      id: 'applications-received',
      title: t.applicationsReceived,
      value: stats.applicationsThisMonth || 0,
      icon: TrendingUp,
      color: 'purple',
      subtitle: t.thisMonth,
    },
    {
      id: 'jobs-published',
      title: t.jobsPublished,
      value: stats.jobsThisMonth || 0,
      icon: Calendar,
      color: 'blue',
      subtitle: t.thisMonth,
    },
  ];

  // ============================================================
  // RENDU - CHARGEMENT
  // ============================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-7 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3 mt-2"></div>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="mt-3">
                <div className="w-full h-1.5 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDU PRINCIPAL
  // ============================================================

  return (
    <div className="space-y-6">
      
      {/* Ligne 1 : 6 cartes principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {mainCards.map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </div>

      {/* Ligne 2 : 4 cartes secondaires */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {secondaryCards.map((card) => (
          <div 
            key={card.id}
            className="bg-gray-50 rounded-xl border border-gray-200 p-4 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{card.title}</p>
                <p className="text-xl font-bold text-gray-800">{card.value}</p>
                <p className="text-[10px] text-gray-400">{card.subtitle}</p>
              </div>
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                <card.icon className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StatsCards;