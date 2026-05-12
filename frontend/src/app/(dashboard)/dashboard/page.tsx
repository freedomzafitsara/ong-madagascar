// frontend/src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  Users, FolderOpen, Calendar, Briefcase, FileText, Heart, 
  Gift, TrendingUp, ArrowRight, Settings, Globe, CheckCircle,
  Loader2, Award, Target, HandHeart, Sparkles
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

export default function DashboardHome() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 156, activeMembers: 142,
    totalProjects: 12, activeProjects: 8,
    totalEvents: 15, upcomingEvents: 5,
    totalJobs: 8, activeJobs: 6,
    totalApplications: 45, pendingApplications: 12,
    totalDonations: 12500000, monthlyDonations: 3250000,
    totalVolunteers: 32, activeVolunteers: 28,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
      const response = await fetch(`${API_URL}/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Nombre total de personnes impactées
  const totalImpacted = stats.totalMembers + stats.totalVolunteers;
  const totalDonationsMillions = (stats.monthlyDonations / 1000000).toFixed(1);

  // Cartes principales
  const mainStatCards = [
    { title: 'Membres', value: stats.totalMembers, subValue: `${stats.activeMembers} actifs`, icon: Users, href: '/dashboard/members', color: 'blue' },
    { title: 'Projets', value: stats.totalProjects, subValue: `${stats.activeProjects} actifs`, icon: FolderOpen, href: '/dashboard/projects', color: 'blue' },
    { title: 'Événements', value: stats.totalEvents, subValue: `${stats.upcomingEvents} à venir`, icon: Calendar, href: '/dashboard/events', color: 'blue' },
    { title: 'Offres emploi', value: stats.totalJobs, subValue: `${stats.activeJobs} ouvertes`, icon: Briefcase, href: '/dashboard/jobs', color: 'blue' },
  ];

  const secondaryStatCards = [
    { title: 'Candidatures', value: stats.totalApplications, subValue: `${stats.pendingApplications} en attente`, icon: FileText, href: '/dashboard/applications', color: 'blue' },
    { title: 'Dons (mois)', value: `${totalDonationsMillions}M`, subValue: 'Ariary', icon: Gift, href: '/dashboard/donations', color: 'blue' },
    { title: 'Bénévoles', value: stats.totalVolunteers, subValue: `${stats.activeVolunteers} actifs`, icon: Heart, href: '/dashboard/volunteers', color: 'blue' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
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
            <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
          </div>
          <p className="text-gray-500">
            Bienvenue, <span className="font-semibold text-gray-700">{user?.firstName || 'Super'} {user?.lastName || 'Admin'}</span> ! Voici un aperçu de votre activité.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-xs text-blue-700 font-medium">Dernière mise à jour aujourd'hui</span>
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
                  Voir les détails <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ==================== CARTES SECONDAIRES (3) + STATS RAPIDES ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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
                  <p className="text-3xl font-bold text-gray-800 mt-1">{card.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{card.subValue}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                  Voir les détails <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
            <h3 className="font-semibold text-white">Votre impact</h3>
          </div>
          <p className="text-blue-100 text-sm mb-5">
            Grâce à votre engagement, Y-Mad continue de transformer des vies à Madagascar.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{totalImpacted}</p>
              <p className="text-xs text-blue-200">Personnes impactées</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.activeProjects}</p>
              <p className="text-xs text-blue-200">Projets actifs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">22</p>
              <p className="text-xs text-blue-200">Régions couvertes</p>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Actions rapides</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction href="/dashboard/members/new" label="Nouveau membre" />
            <QuickAction href="/dashboard/projects/new" label="Nouveau projet" />
            <QuickAction href="/dashboard/events/new" label="Nouvel événement" />
            <QuickAction href="/dashboard/jobs/new" label="Nouvelle offre" />
            <QuickAction href="/dashboard/blog/new" label="Nouvel article" />
            <QuickAction href="/dashboard/reports" label="Générer rapport" />
          </div>
        </div>
      </div>

      {/* ==================== GESTION DU SITE ==================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Globe className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Gestion du site</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Personnalisez l'apparence et le contenu du site
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/pages"
            className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 group"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="font-medium">Gérer les pages</span>
            </div>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/dashboard/backgrounds"
            className="flex items-center justify-between px-4 py-3 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="font-medium">Gérer les fonds d'écran</span>
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