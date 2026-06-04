'use client';

import React from 'react';
import { Briefcase, FileText, FolderOpen, Mail, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';

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
  };
  loading?: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading = false }) => {
  const getText = (fr: string, mg: string) => {
    const language = localStorage.getItem('y-mad-language') || 'fr';
    return language === 'fr' ? fr : mg;
  };

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
  };

  const data = { ...defaultStats, ...stats };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const mainStats = [
    {
      label: getText('Offres d\'emploi', 'Toerana asa'),
      value: data.totalJobs,
      subValue: `${data.publishedJobs} ${getText('publiées', 'navoaka')}`,
      icon: Briefcase,
      color: 'blue',
      href: '/dashboard/jobs'
    },
    {
      label: getText('Candidatures', 'Fangatahana'),
      value: data.totalApplications,
      subValue: `${data.pendingApplications} ${getText('en attente', 'miandry')}`,
      icon: FileText,
      color: 'green',
      href: '/dashboard/applications'
    },
    {
      label: getText('Projets', 'Tetikasa'),
      value: data.totalProjects,
      subValue: `${data.activeProjects} ${getText('actifs', 'mavitrika')}`,
      icon: FolderOpen,
      color: 'purple',
      href: '/dashboard/projects'
    },
    {
      label: getText('Messages', 'Hafatra'),
      value: data.totalBlogPosts + data.unreadContacts,
      subValue: `${data.unreadContacts} ${getText('non lus', 'tsy novakiana')}`,
      icon: Mail,
      color: 'orange',
      href: '/dashboard/contacts'
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; iconBg: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
      green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-100' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {mainStats.map((stat, index) => {
        const Icon = stat.icon;
        const colors = getColorClasses(stat.color);
        
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold ${colors.text}`}>{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.subValue}</p>
              </div>
              <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${colors.text}`} />
              </div>
            </div>
            
            {/* Lien rapide */}
            <div className="mt-4 pt-3 border-t border-gray-50">
              <a
                href={stat.href}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                {getText('Voir détails', 'Jereo antsipirihany')} →
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;