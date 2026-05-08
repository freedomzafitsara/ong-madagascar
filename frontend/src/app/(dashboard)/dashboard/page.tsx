'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { backgroundService, Background } from '@/services/backgroundService';
import { 
  Users, Briefcase, Calendar, Gift, FileText, Heart, 
  TrendingUp, ArrowRight, Loader2, Eye, CheckCircle, 
  UserPlus, FolderOpen, PlusCircle, BarChart3, Image as ImageIcon
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
  const [background, setBackground] = useState<Background | null>(null);
  const [showBackgroundSettings, setShowBackgroundSettings] = useState(false);
  const [bgImageUrl, setBgImageUrl] = useState('');
  const [bgOpacity, setBgOpacity] = useState(0);
  const [updatingBg, setUpdatingBg] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchBackground();
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

  const fetchBackground = async () => {
    try {
      const bg = await backgroundService.getByPage('dashboard');
      if (bg && bg.image_url) {
        setBackground(bg);
        setBgImageUrl(bg.image_url);
        setBgOpacity(bg.overlay_opacity || 0);
      }
    } catch (error) {
      console.error('Erreur chargement background:', error);
    }
  };

  const handleUpdateBackground = async () => {
    if (!bgImageUrl) return;
    setUpdatingBg(true);
    try {
      const token = localStorage.getItem('token');
      const bgData = {
        page: 'dashboard',
        image_url: bgImageUrl,
        overlay_opacity: bgOpacity,
        is_active: true,
        position: 'center',
        size: 'cover',
      };
      
      if (background) {
        await backgroundService.update(token!, background.id, bgData);
      } else {
        await backgroundService.create(token!, bgData);
      }
      await fetchBackground();
      setShowBackgroundSettings(false);
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      alert('Erreur lors de la mise à jour du fond d\'écran');
    } finally {
      setUpdatingBg(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

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

  // Style de fond d'écran
  const backgroundStyle = background?.image_url ? {
    backgroundImage: `url(${background.image_url})`,
    backgroundPosition: background.position || 'center',
    backgroundSize: background.size || 'cover',
    position: 'relative' as const,
  } : {};

  const overlayStyle = background?.image_url ? {
    position: 'absolute' as const,
    inset: 0,
    backgroundColor: `rgba(0, 0, 0, ${(background.overlay_opacity || 0) / 100})`,
    pointerEvents: 'none' as const,
  } : {};

  return (
    <div className="relative min-h-screen">
      {/* Fond d'écran */}
      {background?.image_url && (
        <>
          <div className="fixed inset-0 z-0" style={backgroundStyle} />
          <div style={overlayStyle} />
        </>
      )}

      {/* Contenu */}
      <div className="relative z-10 space-y-6">
        {/* En-tête de bienvenue avec bouton fond d'écran */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold">{t('dashboard.welcome')}, {user?.firstName || 'Admin'} !</h1>
              <p className="text-blue-100 text-sm mt-1">{t('dashboard.title')}</p>
            </div>
            <button
              onClick={() => setShowBackgroundSettings(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition text-sm"
              title="Personnaliser le fond d'écran"
            >
              <ImageIcon className="w-4 h-4" />
              {language === 'fr' ? 'Fond d\'écran' : 'Sary ambadika'}
            </button>
          </div>
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

      {/* Modal de configuration du fond d'écran */}
      {showBackgroundSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {language === 'fr' ? 'Personnaliser le fond d\'écran' : 'Ahitsy ny sary ambadika'}
              </h2>
              <button onClick={() => setShowBackgroundSettings(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Aperçu */}
              {bgImageUrl && (
                <div className="relative h-32 rounded-lg overflow-hidden bg-gray-100">
                  <img src={bgImageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black" style={{ opacity: bgOpacity / 100 }} />
                </div>
              )}

              {/* URL de l'image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'fr' ? 'URL de l\'image' : 'URL ny sary'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={bgImageUrl}
                    onChange={(e) => setBgImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://..."
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'fr' ? 'Entrez l\'URL d\'une image (recommandé: 1920x1080px)' : 'Ampidiro ny URL ny sary'}
                </p>
              </div>

              {/* Opacité de l'overlay */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'fr' ? 'Opacité du masque (%)' : 'Opacity (%)'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={bgOpacity}
                    onChange={(e) => setBgOpacity(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-12 text-center text-sm text-gray-600">{bgOpacity}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'fr' ? 'Assombrit l\'image pour mieux lire le texte' : 'Manamaizina ny sary mba hamakiana tsara ny soratra'}
                </p>
              </div>

              {/* Exemples d'images */}
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {language === 'fr' ? 'Images suggérées :' : 'Sary atolotra :'}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setBgImageUrl('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&h=1080&fit=crop')}
                    className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Nature
                  </button>
                  <button
                    onClick={() => setBgImageUrl('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1080&fit=crop')}
                    className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Équipe
                  </button>
                  <button
                    onClick={() => setBgImageUrl('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop')}
                    className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Bureau
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowBackgroundSettings(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                {language === 'fr' ? 'Annuler' : 'Avela'}
              </button>
              <button
                onClick={handleUpdateBackground}
                disabled={updatingBg || !bgImageUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {updatingBg ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {language === 'fr' ? 'Appliquer' : 'Ampiasao'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPOSANT CARTE STATISTIQUE
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

// Composant XCircle
function XCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}