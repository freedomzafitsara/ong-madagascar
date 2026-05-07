'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { 
  Users, Briefcase, Calendar, Gift, FileText, Heart, 
  TrendingUp, ArrowRight, Loader2, Eye, CheckCircle, 
  UserPlus, FolderOpen, PlusCircle, BarChart3
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
}

// Couleurs pour les cartes - typage correct
type ColorType = 'blue' | 'green' | 'purple' | 'orange' | 'yellow' | 'pink' | 'red';

const colorClasses: Record<ColorType, string> = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  pink: 'bg-pink-100 text-pink-600',
  red: 'bg-red-100 text-red-600',
};

export default function DashboardHome() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalDonations: 0,
    monthlyDonations: 0,
    totalVolunteers: 0,
    activeVolunteers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4001/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setStats({
          totalMembers: 245,
          activeMembers: 189,
          totalProjects: 12,
          activeProjects: 8,
          totalEvents: 15,
          upcomingEvents: 5,
          totalJobs: 23,
          activeJobs: 12,
          totalApplications: 87,
          pendingApplications: 34,
          totalDonations: 12500000,
          monthlyDonations: 3250000,
          totalVolunteers: 45,
          activeVolunteers: 32,
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Définition des cartes avec typage correct
  const statCards: Array<{
    title: string;
    value: number | string;
    subValue: string;
    icon: React.FC<{ className?: string }>;
    href: string;
    color: ColorType;
  }> = [
    { 
      title: t('nav.members'), 
      value: stats.totalMembers, 
      subValue: `${stats.activeMembers} ${t('membership.status_active')}`,
      icon: Users, 
      href: '/dashboard/members',
      color: 'blue'
    },
    { 
      title: t('projects.title'), 
      value: stats.totalProjects, 
      subValue: `${stats.activeProjects} ${language === 'fr' ? 'actifs' : 'mavitrika'}`,
      icon: FolderOpen, 
      href: '/dashboard/projects',
      color: 'green'
    },
    { 
      title: t('events.title'), 
      value: stats.totalEvents, 
      subValue: `${stats.upcomingEvents} ${language === 'fr' ? 'à venir' : 'ho avy'}`,
      icon: Calendar, 
      href: '/dashboard/events',
      color: 'purple'
    },
    { 
      title: t('jobs.title'), 
      value: stats.totalJobs, 
      subValue: `${stats.activeJobs} ${language === 'fr' ? 'ouvertes' : 'misokatra'}`,
      icon: Briefcase, 
      href: '/dashboard/jobs',
      color: 'orange'
    },
    { 
      title: t('jobs.applications'), 
      value: stats.totalApplications, 
      subValue: `${stats.pendingApplications} ${language === 'fr' ? 'en attente' : 'miandry'}`,
      icon: FileText, 
      href: '/dashboard/applications',
      color: 'yellow'
    },
    { 
      title: t('nav.donate'), 
      value: `${(stats.monthlyDonations / 1000000).toFixed(1)}M`, 
      subValue: language === 'fr' ? 'Ariary ce mois' : 'Ariary io volana io',
      icon: Gift, 
      href: '/dashboard/donations',
      color: 'pink'
    },
    { 
      title: t('volunteers.title'), 
      value: stats.totalVolunteers, 
      subValue: `${stats.activeVolunteers} ${language === 'fr' ? 'actifs' : 'mavitrika'}`,
      icon: Heart, 
      href: '/dashboard/volunteers',
      color: 'red'
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-xl font-bold">{t('dashboard.welcome')}, {user?.firstName || 'Admin'} !</h1>
        <p className="text-blue-100 text-sm mt-1">{t('dashboard.title')}</p>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <StatCard 
            key={index}
            title={card.title}
            value={card.value}
            subValue={card.subValue}
            icon={card.icon}
            href={card.href}
            color={card.color}
          />
        ))}
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-blue-600" />
          {language === 'fr' ? 'Actions rapides' : 'Hetsika haingana'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction href="/dashboard/members/new" icon={UserPlus} label={language === 'fr' ? 'Nouveau membre' : 'Mpikambana vaovao'} />
          <QuickAction href="/dashboard/projects/new" icon={FolderOpen} label={language === 'fr' ? 'Nouveau projet' : 'Tetikasa vaovao'} />
          <QuickAction href="/dashboard/events/new" icon={Calendar} label={language === 'fr' ? 'Nouvel événement' : 'Hetsika vaovao'} />
          <QuickAction href="/dashboard/jobs/new" icon={Briefcase} label={language === 'fr' ? 'Nouvelle offre' : 'Asa vaovao'} />
          <QuickAction href="/dashboard/blog/new" icon={FileText} label={language === 'fr' ? 'Nouvel article' : 'Lahatsoratra vaovao'} />
          <QuickAction href="/dashboard/reports" icon={BarChart3} label={language === 'fr' ? 'Générer rapport' : 'Mamorona tatitra'} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPOSANT CARTE STATISTIQUE - AVEC TYPAGE CORRECT
// ============================================

interface StatCardProps {
  title: string;
  value: number | string;
  subValue: string;
  icon: React.FC<{ className?: string }>;
  href: string;
  color: ColorType;
}

function StatCard({ title, value, subValue, icon: Icon, href, color }: StatCardProps) {
  return (
    <Link href={href} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subValue}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Link>
  );
}

// ============================================
// COMPOSANT ACTION RAPIDE
// ============================================

interface QuickActionProps {
  href: string;
  icon: React.FC<{ className?: string }>;
  label: string;
}

function QuickAction({ href, icon: Icon, label }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition group"
    >
      <Icon className="w-4 h-4 text-blue-600" />
      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{label}</span>
    </Link>
  );
}