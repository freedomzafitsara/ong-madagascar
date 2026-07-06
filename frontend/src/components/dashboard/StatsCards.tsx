// frontend/src/components/dashboard/StatsCards.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { 
  Briefcase, FileText, FolderOpen, Mail, TrendingUp, Users, 
  CheckCircle, Clock, ArrowRight, Activity, Calendar, 
  UserPlus, MessageSquare, Zap, Target, BarChart 
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

// ============================================================
// TYPES
// ============================================================

interface StatsCardsProps {
  stats?: {
    totalJobs?: number;
    publishedJobs?: number;
    totalApplications?: number;
    pendingApplications?: number;
    totalProjects?: number;
    activeProjects?: number;
    totalBlogPosts?: number;
    publishedBlogPosts?: number;
    unreadContacts?: number;
    totalUsers?: number;
    newUsersThisMonth?: number;
    applicationsThisMonth?: number;
    jobsThisMonth?: number;
    completionRate?: number;
  };
  loading?: boolean;
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading = false }) => {
  // ============================================================
  // CONTEXTE DE LANGUE
  // ============================================================

  const { language } = useLanguage();

  // ============================================================
  // DONNÉES PAR DÉFAUT
  // ============================================================

  const defaultStats = {
    totalJobs: 0,
    publishedJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalBlogPosts: 0,
    publishedBlogPosts: 0,
    unreadContacts: 0,
    totalUsers: 0,
    newUsersThisMonth: 0,
    applicationsThisMonth: 0,
    jobsThisMonth: 0,
    completionRate: 0,
  };

  const data = { ...defaultStats, ...stats };

  // ============================================================
  // TRADUCTION UNIFIÉE
  // ============================================================

  const t = (fr: string, mg: string): string => {
    return language === 'fr' ? fr : mg;
  };

  // ============================================================
  // RENDU - CHARGEMENT
  // ============================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 w-12 bg-gray-200 rounded"></div>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // CARTES PRINCIPALES - 4 CARTES AVEC INDICATEURS
  // ============================================================

  const mainStats = [
    {
      label: t('Offres d\'emploi', 'Toerana asa'),
      value: data.totalJobs,
      subValue: `${data.publishedJobs} ${t('publiées', 'navoaka')}`,
      icon: Briefcase,
      href: '/dashboard/jobs',
      change: data.jobsThisMonth || 0,
      changeLabel: t('ce mois', 'ity volana ity'),
      total: data.totalJobs,
      progress: data.totalJobs > 0 ? Math.round((data.publishedJobs / data.totalJobs) * 100) : 0,
    },
    {
      label: t('Candidatures', 'Fangatahana'),
      value: data.totalApplications,
      subValue: `${data.pendingApplications} ${t('en attente', 'miandry')}`,
      icon: FileText,
      href: '/dashboard/applications',
      change: data.applicationsThisMonth || 0,
      changeLabel: t('ce mois', 'ity volana ity'),
      total: data.totalApplications,
      progress: data.totalApplications > 0 ? Math.round((data.pendingApplications / data.totalApplications) * 100) : 0,
    },
    {
      label: t('Projets', 'Tetikasa'),
      value: data.totalProjects,
      subValue: `${data.activeProjects} ${t('actifs', 'mavitrika')}`,
      icon: FolderOpen,
      href: '/dashboard/projects',
      change: data.completionRate || 0,
      changeLabel: t('taux de complétion', 'tahan\'ny fahavitana'),
      total: data.totalProjects,
      progress: data.totalProjects > 0 ? Math.round((data.activeProjects / data.totalProjects) * 100) : 0,
    },
    {
      label: t('Utilisateurs', 'Mpampiasa'),
      value: data.totalUsers || 0,
      subValue: `${data.newUsersThisMonth || 0} ${t('nouveaux', 'vaovao')}`,
      icon: Users,
      href: '/dashboard/users',
      change: data.newUsersThisMonth || 0,
      changeLabel: t('ce mois', 'ity volana ity'),
      total: data.totalUsers || 1,
      progress: data.totalUsers > 0 ? Math.round(((data.newUsersThisMonth || 0) / data.totalUsers) * 100) : 0,
    },
  ];

  // ============================================================
  // CARTES SECONDAIRES - STATISTIQUES RAPIDES
  // ============================================================

  const secondaryStats = [
    {
      label: t('Messages non lus', 'Hafatra tsy novakiana'),
      value: data.unreadContacts,
      icon: Mail,
      href: '/dashboard/contacts',
    },
    {
      label: t('Taux d\'activité', 'Tahan\'ny fahavitriana'),
      value: data.totalProjects > 0 ? Math.round((data.activeProjects / data.totalProjects) * 100) : 0,
      unit: '%',
      icon: Activity,
      href: '/dashboard/projects',
    },
    {
      label: t('Nouveaux utilisateurs', 'Mpampiasa vaovao'),
      value: data.newUsersThisMonth || 0,
      icon: UserPlus,
      href: '/dashboard/users',
    },
    {
      label: t('Offres ce mois', 'Asa ity volana ity'),
      value: data.jobsThisMonth || 0,
      icon: Calendar,
      href: '/dashboard/jobs',
    },
  ];

  // ============================================================
  // RENDU - CARTE PRINCIPALE AVEC PROGRESSION
  // ============================================================

  const renderMainCard = (stat: typeof mainStats[0], index: number) => {
    const Icon = stat.icon;

    return (
      <div
        key={index}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>{stat.subValue}</span>
              {stat.change > 0 && (
                <span className="flex items-center gap-0.5 text-green-600 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  +{stat.change}
                </span>
              )}
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">{stat.changeLabel}</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-blue-800 transition-colors duration-200 flex-shrink-0 ml-3">
            <Icon className="w-6 h-6 text-blue-800 group-hover:text-white transition-colors duration-200" />
          </div>
        </div>
        
        {/* Barre de progression */}
        <div className="mt-4">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div 
              className="h-1.5 rounded-full bg-blue-600 transition-all duration-1000"
              style={{ width: `${Math.min(stat.progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-400">
              {stat.progress}% {t('complété', 'vita')}
            </span>
            <span className="text-[10px] text-gray-400">
              {t('Total', 'Rehetra')}: {stat.total}
            </span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Link
            href={stat.href}
            className="text-xs text-blue-800 hover:text-blue-900 font-medium flex items-center gap-1 group/link"
          >
            {t('Voir détails', 'Jereo antsipirihany')}
            <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDU - CARTE SECONDAIRE AVEC ANIMATION
  // ============================================================

  const renderSecondaryCard = (stat: typeof secondaryStats[0], index: number) => {
    const Icon = stat.icon;

    return (
      <Link
        key={index}
        href={stat.href}
        className="bg-gray-50 rounded-xl border border-gray-200 p-4 hover:bg-gray-100 hover:border-blue-200 transition-all duration-200 group cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">{stat.label}</p>
            <p className="text-xl font-bold text-gray-800">
              {stat.value}{stat.unit || ''}
            </p>
          </div>
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 group-hover:border-blue-800 group-hover:bg-blue-50 transition-all duration-200">
            <Icon className="w-5 h-5 text-blue-800 group-hover:scale-110 transition-transform duration-200" />
          </div>
        </div>
      </Link>
    );
  };

  // ============================================================
  // RENDU - SYNTHÈSE COMPACTE
  // ============================================================

  const renderSummary = () => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-blue-50 rounded-xl border border-blue-100 p-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-800">{data.totalProjects}</p>
        <p className="text-[10px] text-gray-500 uppercase tracking-wide">
          {t('Projets totaux', 'Tetikasa rehetra')}
        </p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-600">{data.totalApplications}</p>
        <p className="text-[10px] text-gray-500 uppercase tracking-wide">
          {t('Candidatures', 'Fangatahana')}
        </p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-700">{data.totalUsers}</p>
        <p className="text-[10px] text-gray-500 uppercase tracking-wide">
          {t('Utilisateurs', 'Mpampiasa')}
        </p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-500">{data.totalJobs}</p>
        <p className="text-[10px] text-gray-500 uppercase tracking-wide">
          {t('Offres', 'Asa')}
        </p>
      </div>
    </div>
  );

  // ============================================================
  // RENDU PRINCIPAL
  // ============================================================

  return (
    <div className="space-y-6">
      
      {/* Ligne 1 : 4 cartes principales avec barres de progression */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => renderMainCard(stat, index))}
      </div>

      {/* Ligne 2 : 4 cartes secondaires */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {secondaryStats.map((stat, index) => renderSecondaryCard(stat, index))}
      </div>

      {/* Synthèse compacte */}
      {renderSummary()}
    </div>
  );
};

export default StatsCards;