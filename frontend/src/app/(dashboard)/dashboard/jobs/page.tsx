// frontend/src/app/(dashboard)/dashboard/jobs/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import { jobService } from '@/services/job.service';
import type { JobOffer, JobStatus, ContractType, JobOfferStats } from '@/services/job.service';
import { 
  Briefcase, Search, Plus, Download, RefreshCw, Loader2,
  Eye, Edit, Trash2, MapPin, Calendar, Users,
  CheckCircle, XCircle, Clock,
  ChevronLeft, ChevronRight, Building, ImageIcon,
  AlertCircle, Filter, X, FileText, BarChart3,
  TrendingUp, TrendingDown, Award, Target, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// CONSTANTES
// ============================================================

const ITEMS_PER_PAGE = 10;

// ============================================================
// COMPOSANT STAT CARD AVANCÉ
// ============================================================

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  isBlue?: boolean;
  onClick?: () => void;
  subtitle?: string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
}

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  isBlue = false, 
  onClick, 
  subtitle,
  change,
  trend
}: StatCardProps) {
  const bgClass = isBlue ? 'bg-blue-50' : 'bg-gray-50';
  const iconClass = isBlue ? 'text-blue-700' : 'text-gray-600';
  const borderClass = isBlue ? 'border-blue-200 hover:border-blue-300' : 'border-gray-200 hover:border-gray-300';
  
  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-400';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  return (
    <div 
      onClick={onClick} 
      className={`bg-white rounded-xl shadow-sm border ${borderClass} p-4 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
            {change !== undefined && change !== 0 && (
              <span className={`text-xs font-medium flex items-center gap-0.5 ${getTrendColor()}`}>
                {getTrendIcon()}
                {change > 0 ? '+' : ''}{change}%
              </span>
            )}
          </div>
          {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 ${bgClass} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconClass}`} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT DE FILTRE
// ============================================================

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs rounded-full transition-all duration-200 font-medium ${
        active 
          ? 'bg-blue-800 text-white shadow-sm' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

// ============================================================
// COMPOSANT DE STATUT BADGE
// ============================================================

interface StatusBadgeProps {
  status: string;
  language: string;
}

function StatusBadge({ status, language }: StatusBadgeProps) {
  const config: Record<string, { fr: string; mg: string; className: string }> = {
    published: { 
      fr: 'Publiée', 
      mg: 'Navoaka', 
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200' 
    },
    draft: { 
      fr: 'Brouillon', 
      mg: 'Volavola', 
      className: 'bg-gray-50 text-gray-500 border-gray-200' 
    },
    closed: { 
      fr: 'Fermée', 
      mg: 'Nakatona', 
      className: 'bg-red-50 text-red-700 border-red-200' 
    },
    expired: { 
      fr: 'Expirée', 
      mg: 'Lany daty', 
      className: 'bg-orange-50 text-orange-700 border-orange-200' 
    },
    archived: { 
      fr: 'Archivée', 
      mg: 'Voatahiry', 
      className: 'bg-purple-50 text-purple-700 border-purple-200' 
    }
  };

  const badge = config[status];
  if (!badge) {
    return <span className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{status}</span>;
  }

  const label = language === 'fr' ? badge.fr : badge.mg;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border ${badge.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
      {label}
    </span>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function JobsDashboardPage() {
  const { user, token } = useAuth();
  const { language, t } = useLanguage();
  
  // ============================================================
  // ÉTATS
  // ============================================================
  
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    status: 'all', 
    contractType: 'all', 
    search: '' 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState<JobOfferStats>({
    total: 0,
    published: 0,
    draft: 0,
    closed: 0,
    expired: 0,
    archived: 0,
    total_applications: 0,
    pending_applications: 0,
  });
  const [exporting, setExporting] = useState(false);
  const [previousStats, setPreviousStats] = useState<JobOfferStats | null>(null);
  
  const isMounted = useRef(true);
  const initialFetchDone = useRef(false);
  const fetchJobsRef = useRef<(() => void) | null>(null);
  const fetchStatsRef = useRef<(() => void) | null>(null);

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin';
  const isSuperAdmin = user?.role === 'super_admin';

  // ============================================================
  // STATUTS ET TYPES DE CONTRAT
  // ============================================================

  const statusOptions = useMemo(() => [
    { value: 'all', label: t('common.all') || 'Tous statuts' },
    { value: 'published', label: t('jobs.published') || 'Publiées' },
    { value: 'draft', label: t('jobs.draft') || 'Brouillons' },
    { value: 'closed', label: t('jobs.closed') || 'Fermées' },
    { value: 'expired', label: t('jobs.expired') || 'Expirées' },
    { value: 'archived', label: t('jobs.archived') || 'Archivées' },
  ], [t]);

  const contractOptions = useMemo(() => [
    { value: 'all', label: t('common.all') || 'Tous types' },
    { value: 'cdi', label: t('jobs.cdi') || 'CDI' },
    { value: 'cdd', label: t('jobs.cdd') || 'CDD' },
    { value: 'stage', label: t('jobs.stage') || 'Stage' },
    { value: 'freelance', label: t('jobs.freelance') || 'Freelance' },
  ], [t]);

  // ============================================================
  // FONCTIONS UTILITAIRES
  // ============================================================

  const formatDate = useCallback((dateString?: string): string => {
    if (!dateString) return t('common.no_data') || 'Non définie';
    try {
      return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return t('common.error') || 'Date invalide';
    }
  }, [language, t]);

  const calculateChange = useCallback((current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }, []);

  const getTrend = useCallback((change: number): 'up' | 'down' | 'stable' => {
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'stable';
  }, []);

  // ============================================================
  // FETCH FUNCTIONS
  // ============================================================

  const fetchJobs = useCallback(async () => {
    if (!token || !isMounted.current) return;
    
    setLoading(true);
    try {
      const params: any = { 
        page: currentPage, 
        limit: ITEMS_PER_PAGE 
      };
      if (filters.search) params.search = filters.search;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.contractType !== 'all') params.contract_type = filters.contractType;
      
      const response = await jobService.getAllOffers(params);
      if (response && response.data && isMounted.current) {
        setJobs(response.data);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.total || 0);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      if (isMounted.current) {
        toast.error(error.response?.data?.message || t('common.error') || 'Erreur de chargement');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [currentPage, filters.search, filters.status, filters.contractType, token, t]);

  const fetchStats = useCallback(async () => {
    if (!token || !isMounted.current) return;
    try {
      const response = await jobService.getJobStats();
      if (response && isMounted.current) {
        // Sauvegarder les stats précédentes pour calculer les tendances
        setPreviousStats(prev => {
          if (!prev) {
            // Première charge, utiliser les données actuelles comme référence
            return {
              total: response.total || 0,
              published: response.published || 0,
              draft: response.draft || 0,
              closed: response.closed || 0,
              expired: response.expired || 0,
              archived: response.archived || 0,
              total_applications: response.total_applications || 0,
              pending_applications: response.pending_applications || 0,
            };
          }
          return prev;
        });

        setStats({
          total: response.total || 0,
          published: response.published || 0,
          draft: response.draft || 0,
          closed: response.closed || 0,
          expired: response.expired || 0,
          archived: response.archived || 0,
          total_applications: response.total_applications || 0,
          pending_applications: response.pending_applications || 0,
        });
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  }, [token]);

  // ============================================================
  // SIDE EFFECTS
  // ============================================================

  useEffect(() => {
    fetchJobsRef.current = fetchJobs;
    fetchStatsRef.current = fetchStats;
  }, [fetchJobs, fetchStats]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (token && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchStats();
      fetchJobs();
    }
  }, [token, fetchStats, fetchJobs]);

  useEffect(() => {
    if (initialFetchDone.current && token && fetchJobsRef.current) {
      fetchJobsRef.current();
    }
  }, [currentPage, filters.status, filters.contractType, filters.search, token]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(
      t('common.delete') === 'Supprimer' 
        ? `Supprimer l'offre "${title}" ?` 
        : `Hofafana ny asa "${title}" ?`
    )) return;
    
    try {
      await jobService.deleteOffer(id);
      toast.success(t('common.success') || 'Offre supprimée');
      fetchJobs();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('common.error') || 'Erreur');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const isPublished = currentStatus === 'published';
    const newStatus = isPublished ? 'closed' : 'published';
    const action = isPublished 
      ? (t('common.close') || 'fermer') 
      : (t('common.publish') || 'publier');
    
    if (!confirm(
      `${action.toUpperCase()} - ${t('common.confirm') || 'Confirmer ?'}`
    )) return;
    
    try {
      await jobService.updateOfferStatus(id, newStatus as any);
      toast.success(isPublished ? t('jobs.closed') || 'Offre fermée' : t('jobs.published') || 'Offre publiée');
      fetchJobs();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('common.error') || 'Erreur');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const csvData = await jobService.exportApplications();
      const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `offres_emploi_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(t('common.success') || 'Export réussi');
    } catch (error) {
      toast.error(t('common.error') || 'Erreur export');
    } finally {
      setExporting(false);
    }
  };

  const handleRefresh = () => {
    fetchJobs();
    fetchStats();
  };

  const clearFilters = () => {
    setFilters({ status: 'all', contractType: 'all', search: '' });
    setCurrentPage(1);
  };

  const hasActiveFilters = filters.status !== 'all' || filters.contractType !== 'all' || filters.search !== '';

  // ============================================================
  // STATS CARDS CONFIG AVEC TENDANCES
  // ============================================================

  const statCards = useMemo(() => {
    const getChange = (current: number, prevKey: keyof JobOfferStats) => {
      if (!previousStats) return 0;
      return calculateChange(current, previousStats[prevKey] as number);
    };

    return [
      { 
        label: t('stats.jobs') || 'Total offres', 
        value: stats.total, 
        icon: Briefcase, 
        isBlue: true,
        subtitle: t('common.total') || 'Total',
        change: getChange(stats.total, 'total'),
        trend: getTrend(getChange(stats.total, 'total'))
      },
      { 
        label: t('stats.published') || 'Publiées', 
        value: stats.published, 
        icon: CheckCircle, 
        isBlue: true,
        subtitle: t('common.active') || 'Actives',
        change: getChange(stats.published, 'published'),
        trend: getTrend(getChange(stats.published, 'published'))
      },
      { 
        label: t('stats.draft') || 'Brouillons', 
        value: stats.draft, 
        icon: Clock,
        subtitle: t('common.pending') || 'En attente',
        change: getChange(stats.draft, 'draft'),
        trend: getTrend(getChange(stats.draft, 'draft'))
      },
      { 
        label: t('stats.closed') || 'Fermées', 
        value: stats.closed, 
        icon: XCircle,
        subtitle: t('common.completed') || 'Terminées',
        change: getChange(stats.closed, 'closed'),
        trend: getTrend(getChange(stats.closed, 'closed'))
      },
      { 
        label: t('stats.expired') || 'Expirées', 
        value: stats.expired, 
        icon: AlertCircle,
        subtitle: t('common.expired') || 'Expirées',
        change: getChange(stats.expired, 'expired'),
        trend: getTrend(getChange(stats.expired, 'expired'))
      },
      { 
        label: t('stats.archived') || 'Archivées', 
        value: stats.archived, 
        icon: ArchiveIcon,
        subtitle: t('common.archived') || 'Archivées',
        change: getChange(stats.archived, 'archived'),
        trend: getTrend(getChange(stats.archived, 'archived'))
      },
      { 
        label: t('stats.applications') || 'Candidatures', 
        value: stats.total_applications, 
        icon: Users, 
        isBlue: true,
        subtitle: t('common.total') || 'Total',
        change: getChange(stats.total_applications, 'total_applications'),
        trend: getTrend(getChange(stats.total_applications, 'total_applications'))
      },
      { 
        label: t('stats.pending') || 'En attente', 
        value: stats.pending_applications, 
        icon: Clock,
        subtitle: t('common.pending') || 'À traiter',
        change: getChange(stats.pending_applications, 'pending_applications'),
        trend: getTrend(getChange(stats.pending_applications, 'pending_applications'))
      },
    ];
  }, [stats, previousStats, t, calculateChange, getTrend]);

  // ============================================================
  // RENDU - CHARGEMENT
  // ============================================================

  if (loading && jobs.length === 0 && !initialFetchDone.current) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-800 animate-spin" />
        <p className="text-gray-500 font-medium">{t('common.loading') || 'Chargement...'}</p>
      </div>
    );
  }

  // ============================================================
  // RENDU PRINCIPAL
  // ============================================================

  return (
    <div className="space-y-6 pb-8">
      
      {/* ============================================================
      EN-TÊTE
      ============================================================ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center shadow-sm">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t('dashboard.jobs') || 'Offres d\'emploi'}
            </h1>
            <p className="text-gray-500 text-sm">
              {t('dashboard.jobs_management') || 'Gestion des offres d\'emploi'}
            </p>
          </div>
        </div>
        {hasEditRights && (
          <Link 
            href="/dashboard/jobs/new" 
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition shadow-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            {t('dashboard.new_job') || 'Nouvelle offre'}
          </Link>
        )}
      </div>

      {/* ============================================================
      CARTES STATISTIQUES AVEC TENDANCES
      ============================================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      {/* ============================================================
      FILTRES ET RECHERCHE
      ============================================================ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('common.search') || 'Rechercher...'} 
              value={filters.search}
              onChange={(e) => { 
                setFilters({ ...filters, search: e.target.value }); 
                setCurrentPage(1); 
              }}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition" 
            />
          </div>
          
          {/* Filtres */}
          <div className="flex flex-wrap gap-2">
            <select 
              value={filters.status} 
              onChange={(e) => { 
                setFilters({ ...filters, status: e.target.value }); 
                setCurrentPage(1); 
              }}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white min-w-[140px] focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            
            <select 
              value={filters.contractType} 
              onChange={(e) => { 
                setFilters({ ...filters, contractType: e.target.value }); 
                setCurrentPage(1); 
              }}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white min-w-[140px] focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition"
            >
              {contractOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                {t('common.clear') || 'Effacer'}
              </button>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh} 
              className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              title={t('common.refresh') || 'Actualiser'}
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
            <button 
              onClick={handleExport} 
              disabled={exporting} 
              className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              title={t('common.export') || 'Exporter'}
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-gray-600" />}
            </button>
          </div>
        </div>
        
        {/* Filtres actifs (chips) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
            {filters.status !== 'all' && (
              <FilterChip 
                label={statusOptions.find(s => s.value === filters.status)?.label || filters.status}
                active={true}
                onClick={() => { setFilters({ ...filters, status: 'all' }); setCurrentPage(1); }}
              />
            )}
            {filters.contractType !== 'all' && (
              <FilterChip 
                label={contractOptions.find(c => c.value === filters.contractType)?.label || filters.contractType}
                active={true}
                onClick={() => { setFilters({ ...filters, contractType: 'all' }); setCurrentPage(1); }}
              />
            )}
            {filters.search && (
              <FilterChip 
                label={`"${filters.search}"`}
                active={true}
                onClick={() => { setFilters({ ...filters, search: '' }); setCurrentPage(1); }}
              />
            )}
          </div>
        )}
      </div>

      {/* ============================================================
      TABLEAU DES OFFRES
      ============================================================ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('common.job') || 'Offre'}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('common.company') || 'Entreprise'}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('common.location') || 'Lieu'}
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('common.applications') || 'Candidatures'}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('common.status') || 'Statut'}
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('common.actions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Briefcase className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">
                        {t('common.no_data') || 'Aucune offre trouvée'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {t('common.try_again') || 'Essayez de modifier vos filtres'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden relative flex items-center justify-center flex-shrink-0">
                          {job.image_url ? (
                            <Image src={job.image_url} alt={job.title_fr} fill className="object-cover" sizes="40px" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {language === 'fr' ? job.title_fr : (job.title_mg || job.title_fr)}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400">{formatDate(job.created_at)}</span>
                            {job.contract_type && (
                              <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                {t(`jobs.${job.contract_type}`) || job.contract_type}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{job.company || 'Y-MaD'}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{job.location || 'Madagascar'}</td>
                    <td className="px-5 py-4 text-center">
                      <Link 
                        href={`/dashboard/jobs/${job.id}/applications`} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition border border-gray-200"
                      >
                        <Users className="w-3.5 h-3.5" /> 
                        <span className="font-medium">{job.applications_count || 0}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={job.status} language={language} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-0.5">
                        <Link 
                          href={`/dashboard/jobs/${job.id}`} 
                          className="p-2 text-gray-500 hover:text-blue-800 rounded-lg hover:bg-gray-100 transition" 
                          title={t('common.view') || 'Voir'}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {hasEditRights && (
                          <>
                            <Link 
                              href={`/dashboard/jobs/${job.id}/edit`} 
                              className="p-2 text-gray-500 hover:text-blue-800 rounded-lg hover:bg-gray-100 transition" 
                              title={t('common.edit') || 'Modifier'}
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button 
                              onClick={() => handleToggleStatus(job.id, job.status)} 
                              className="p-2 text-gray-500 hover:text-blue-800 rounded-lg hover:bg-gray-100 transition" 
                              title={job.status === 'published' ? (t('common.close') || 'Fermer') : (t('common.publish') || 'Publier')}
                            >
                              {job.status === 'published' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                          </>
                        )}
                        {isSuperAdmin && (
                          <button 
                            onClick={() => handleDelete(job.id, job.title_fr)} 
                            className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100 transition" 
                            title={t('common.delete') || 'Supprimer'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================
      PAGINATION
      ============================================================ */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
          <div className="text-sm text-gray-500 order-2 sm:order-1">
            {t('common.page') || 'Page'} {currentPage} / {totalPages} 
            <span className="hidden sm:inline ml-2">
              ({totalItems} {t('common.jobs') || 'offres'})
            </span>
          </div>
          <div className="flex gap-2 order-1 sm:order-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                      currentPage === pageNum
                        ? 'bg-blue-800 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages} 
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
      SECTION DE SYNTHÈSE
      ============================================================ */}
      {jobs.length > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-xs text-gray-600">
                  {t('common.published') || 'Publiées'}: {stats.published}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-xs text-gray-600">
                  {t('common.draft') || 'Brouillons'}: {stats.draft}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-xs text-gray-600">
                  {t('common.closed') || 'Fermées'}: {stats.closed}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-xs text-gray-600">
                  {t('common.expired') || 'Expirées'}: {stats.expired}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-xs text-gray-600">
                  {t('common.archived') || 'Archivées'}: {stats.archived}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {t('common.total') || 'Total'}: {stats.total}
              </span>
              <span className="text-xs text-gray-300">|</span>
              <span className="text-xs text-gray-400">
                {t('common.applications') || 'Candidatures'}: {stats.total_applications}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ICÔNE ARCHIVE
// ============================================================

function ArchiveIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  );
}