// frontend/src/components/dashboard/StatsCards.tsx

'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Briefcase, Users, FileText, Mail, FolderOpen, 
  Clock, CheckCircle, AlertCircle, Target, TrendingUp
} from 'lucide-react';

// ✅ CORRECTION: Ajouter totalContacts dans l'interface
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
    totalContacts: number;  // ✅ Ajouté
    totalUsers: number;
  };
  loading: boolean;
}

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
  }
};

export function StatsCards({ stats, loading }: StatsCardsProps) {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.fr;

  const cards = [
    {
      id: 'jobs',
      title: t.jobs,
      value: stats.publishedJobs,
      total: stats.totalJobs,
      icon: Briefcase,
      color: 'blue',
      suffix: `/${t.total} ${stats.totalJobs}`,
    },
    {
      id: 'applications',
      title: t.applications,
      value: stats.pendingApplications,
      total: stats.totalApplications,
      icon: FileText,
      color: 'purple',
      suffix: `/${t.total} ${stats.totalApplications}`,
    },
    {
      id: 'projects',
      title: t.projects,
      value: stats.activeProjects,
      total: stats.totalProjects,
      icon: FolderOpen,
      color: 'green',
      suffix: `/${t.total} ${stats.totalProjects}`,
    },
    {
      id: 'blog',
      title: t.blog,
      value: stats.publishedBlogPosts,
      total: stats.totalBlogPosts,
      icon: Target,
      color: 'orange',
      suffix: `/${t.total} ${stats.totalBlogPosts}`,
    },
    {
      id: 'contacts',
      title: t.contacts,
      value: stats.unreadContacts,
      total: stats.totalContacts,  // ✅ Utilise totalContacts
      icon: Mail,
      color: 'red',
      suffix: `/${t.total} ${stats.totalContacts}`,
    },
    {
      id: 'users',
      title: t.users,
      value: stats.totalUsers,
      total: stats.totalUsers,
      icon: Users,
      color: 'gray',
      suffix: `${t.total}`,
    },
  ];

  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-50 text-gray-600',
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div 
            key={card.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <p className="text-xs text-gray-400">{card.suffix}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[card.color as keyof typeof colors]}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}