// frontend/src/app/(dashboard)/dashboard/jobs/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { jobService } from '@/services/job.service';
import type { JobOffer, JobOfferStats } from '@/services/job.service';
import { 
  Briefcase, Search, Plus, Download, RefreshCw, Loader2,
  Eye, Edit, Trash2, MapPin, Calendar, Users,
  CheckCircle, XCircle, Clock,
  ChevronLeft, ChevronRight, Building, ImageIcon,
  AlertCircle, X, FileText, TrendingUp, TrendingDown, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// CONSTANTES
// ============================================================

const ITEMS_PER_PAGE = 10;

// ============================================================
// FONCTION DE CONSTRUCTION D'URL D'IMAGE
// ============================================================

const buildImageUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4001';
  if (url.startsWith('/uploads')) {
    return `${baseUrl}${url}`;
  }
  if (url.startsWith('/api/uploads')) {
    return `${baseUrl}${url}`;
  }
  if (url.startsWith('/api/upload')) {
    return `${baseUrl}${url}`;
  }
  return `${baseUrl}/${url}`;
};

// ============================================================
// COMPOSANT STAT CARD
// ============================================================

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  isBlue?: boolean;
  subtitle?: string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
}

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  isBlue = false, 
  subtitle,
  change,
  trend
}: StatCardProps) {
  const bgClass = isBlue ? 'bg-blue-50' : 'bg-gray-50';
  const iconClass = isBlue ? 'text-blue-700' : 'text-gray-600';
  const borderClass = isBlue ? 'border-blue-200' : 'border-gray-200';
  
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
    <div className={`bg-white rounded-xl border ${borderClass} p-4 transition-all hover:shadow-md`}>
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
        <div className={`w-10 h-10 ${bgClass} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconClass}`} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT FILTRE
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
      className={`px-3 py-1.5 text-xs rounded-full transition ${
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
// COMPOSANT STATUS BADGE
// ============================================================

interface StatusBadgeProps {
  status: string;
  language: string;
}

function StatusBadge({ status, language }: StatusBadgeProps) {
  const config: Record<string, { fr: string; mg: string; className: string }> = {
    published: { 
      fr: 'Publiee', 
      mg: 'Navoaka', 
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200' 
    },
    draft: { 
      fr: 'Brouillon', 
      mg: 'Volavola', 
      className: 'bg-gray-50 text-gray-500 border-gray-200' 
    },
    closed: { 
      fr: 'Fermee', 
      mg: 'Nakatona', 
      className: 'bg-red-50 text-red-700 border-red-200' 
    },
    expired: { 
      fr: 'Expiree', 
      mg: 'Lany daty', 
      className: 'bg-orange-50 text-orange-700 border-orange-200' 
    },
    archived: { 
      fr: 'Archivee', 
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
// ICONE ARCHIVE
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

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function JobsDashboardPage() {
  const { user, token } = useAuth();
  const { language, t } = useLanguage();
  
  // Fonction sécurisée pour les traductions
  const safeT = useCallback((key: string, fallback: string): string => {
    try {
      const result = t(key);
      if (result === key) {
        return fallback;
      }
      return result;
    } catch {
      return fallback;
    }
  }, [t]);
  
  // ============================================================
  // ETATS
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
  const [error, setError] = useState<string | null>(null);
  
  const isMounted = useRef(true);
  const initialFetchDone = useRef(false);

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin';
  const isSuperAdmin = user?.role === 'super_admin';

  // ============================================================
  // OPTIONS DE FILTRES
  // ============================================================

  const statusOptions = useMemo(() => [
    { value: 'all', label: 'Tous statuts' },
    { value: 'published', label: 'Publiees' },
    { value: 'draft', label: 'Brouillons' },
    { value: 'closed', label: 'Fermees' },
    { value: 'expired', label: 'Expirees' },
    { value: 'archived', label: 'Archivees' },
  ], []);

  const contractOptions = useMemo(() => [
    { value: 'all', label: 'Tous types' },
    { value: 'CDI', label: 'CDI' },
    { value: 'CDD', label: 'CDD' },
    { value: 'STAGE', label: 'Stage' },
    { value: 'FREELANCE', label: 'Freelance' },
    { value: 'ALTERNANCE', label: 'Alternance' },
    { value: 'TEMPORARY', label: 'Temporaire' },
  ], []);

  // ============================================================
  // FONCTIONS UTILITAIRES
  // ============================================================

  const getText = useCallback((fr: string, mg: string) => {
    return language === 'fr' ? fr : mg;
  }, [language]);

  const formatDate = useCallback((dateString?: string): string => {
    if (!dateString) return 'Non definie';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  }, []);

  // ============================================================
  // ✅ FETCH FUNCTIONS - CORRIGÉES AVEC GESTION D'ERREUR 404
  // ============================================================

  const fetchJobs = useCallback(async () => {
    if (!token || !isMounted.current) return;
    
    setLoading(true);
    setError(null);
    try {
      const params: any = { 
        page: currentPage, 
        limit: ITEMS_PER_PAGE 
      };
      if (filters.search) params.search = filters.search;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.contractType !== 'all') params.contract_type = filters.contractType;
      
      const response = await jobService.getAllOffers(params);
      
      if (response && isMounted.current) {
        const enrichedJobs: JobOffer[] = (response.data || []).map((job: JobOffer) => ({
          ...job,
          image_url: buildImageUrl(job.image_url) || undefined,
        }));
        
        setJobs(enrichedJobs);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.total || 0);
      } else {
        setJobs([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error: any) {
      console.error('Erreur chargement:', error);
      if (isMounted.current) {
        // ✅ Ne pas afficher de toast pour les erreurs 404
        if (error.response?.status !== 404) {
          const errorMsg = safeT('common.error', 'Erreur de chargement');
          toast.error(error.response?.data?.message || errorMsg);
        }
        setJobs([]);
        setTotalPages(1);
        setTotalItems(0);
        setError('Impossible de charger les offres');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [currentPage, filters.search, filters.status, filters.contractType, token, safeT]);

  // ============================================================
  // ✅ FETCH STATS - CORRIGÉ AVEC FALLBACK SILENCIEUX
  // ============================================================

  const fetchStats = useCallback(async () => {
    if (!token || !isMounted.current) return;
    try {
      const response = await jobService.getJobStats();
      if (response && isMounted.current) {
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
      // ✅ Erreur silencieuse pour les stats - ne pas afficher de toast
      console.warn('Erreur stats (ignored):', error);
      // Garder les valeurs par défaut
    }
  }, [token]);

  // ============================================================
  // SIDE EFFECTS
  // ============================================================

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
    if (initialFetchDone.current && token) {
      fetchJobs();
    }
  }, [currentPage, filters.status, filters.contractType, filters.search, token, fetchJobs]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer l'offre "${title}" ?`)) return;
    
    try {
      await jobService.deleteOffer(id);
      toast.success('Offre supprimee');
      fetchJobs();
      fetchStats();
    } catch (error: any) {
      const errorMsg = safeT('common.error', 'Erreur');
      toast.error(error.response?.data?.message || errorMsg);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const isPublished = currentStatus === 'published';
    const newStatus = isPublished ? 'closed' : 'published';
    
    if (!confirm(`${isPublished ? 'Fermer' : 'Publier'} cette offre ?`)) return;
    
    try {
      await jobService.updateOfferStatus(id, newStatus as any);
      toast.success(isPublished ? 'Offre fermee' : 'Offre publiee');
      fetchJobs();
      fetchStats();
    } catch (error: any) {
      const errorMsg = safeT('common.error', 'Erreur');
      toast.error(error.response?.data?.message || errorMsg);
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
      toast.success('Export reussi');
    } catch (error) {
      const errorMsg = safeT('common.error', 'Erreur export');
      toast.error(errorMsg);
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
  // STATS CARDS
  // ============================================================

  const statCards = useMemo(() => [
    { label: 'Total offres', value: stats.total, icon: Briefcase, isBlue: true },
    { label: 'Publiees', value: stats.published, icon: CheckCircle, isBlue: true },
    { label: 'Brouillons', value: stats.draft, icon: Clock },
    { label: 'Fermees', value: stats.closed, icon: XCircle },
    { label: 'Expirees', value: stats.expired, icon: AlertCircle },
    { label: 'Archivees', value: stats.archived, icon: ArchiveIcon },
    { label: 'Candidatures', value: stats.total_applications, icon: Users, isBlue: true },
    { label: 'En attente', value: stats.pending_applications, icon: Clock },
  ], [stats]);

  // ============================================================
  // RENDU - CHARGEMENT
  // ============================================================

  if (loading && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-800 animate-spin" />
        <p className="text-gray-500 font-medium">{getText('Chargement...', 'Miandry...')}</p>
      </div>
    );
  }

  // ============================================================
  // RENDU PRINCIPAL
  // ============================================================

  return (
    <div className="space-y-6 pb-8">
      
      {/* EN-TETE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center shadow-sm">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{getText('Offres d\'emploi', 'Toerana asa')}</h1>
            <p className="text-gray-500 text-sm">{getText('Gestion des offres d\'emploi', 'Fitantanana ny toerana asa')}</p>
          </div>
        </div>
        {hasEditRights && (
          <Link 
            href="/dashboard/jobs/new" 
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition shadow-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            {getText('Nouvelle offre', 'Asa vaovao')}
          </Link>
        )}
      </div>

      {/* STATISTIQUES */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      {/* FILTRES */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={getText('Rechercher...', 'Karohy...')}
              value={filters.search}
              onChange={(e) => { 
                setFilters({ ...filters, search: e.target.value }); 
                setCurrentPage(1); 
              }}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition" 
            />
          </div>
          
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
                {getText('Effacer', 'Fafao')}
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh} 
              className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              title={getText('Actualiser', 'Havaozina')}
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
            <button 
              onClick={handleExport} 
              disabled={exporting} 
              className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              title={getText('Exporter', 'Hanondrana')}
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-gray-600" />}
            </button>
          </div>
        </div>
        
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

      {/* TABLEAU */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[30%]">{getText('Offre', 'Asa')}</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">{getText('Entreprise', 'Orinasa')}</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">{getText('Lieu', 'Toerana')}</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-[10%]">{getText('Candidatures', 'Fangatahana')}</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">{getText('Statut', 'Sata')}</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">{getText('Actions', 'Hetsika')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Briefcase className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">{getText('Aucune offre trouvee', 'Tsy misy asa hita')}</p>
                      <p className="text-sm text-gray-400">{getText('Essayez de modifier vos filtres', 'Andramo ovaina ny filtrao')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative flex items-center justify-center flex-shrink-0 border border-gray-200">
                          {job.image_url ? (
                            <img 
                              src={job.image_url} 
                              alt={job.title_fr} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 truncate">
                            {language === 'fr' ? job.title_fr : (job.title_mg || job.title_fr)}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs text-gray-400">{formatDate(job.created_at)}</span>
                            {job.contract_type && (
                              <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                                {job.contract_type}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-gray-700">{job.company || 'Y-MaD'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-500">{job.location || 'Madagascar'}</span>
                    </td>
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
                          title={getText('Voir', 'Jereo')}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {hasEditRights && (
                          <>
                            <Link 
                              href={`/dashboard/jobs/${job.id}/edit`} 
                              className="p-2 text-gray-500 hover:text-blue-800 rounded-lg hover:bg-gray-100 transition" 
                              title={getText('Modifier', 'Hanova')}
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button 
                              onClick={() => handleToggleStatus(job.id, job.status)} 
                              className="p-2 text-gray-500 hover:text-blue-800 rounded-lg hover:bg-gray-100 transition" 
                              title={job.status === 'published' ? getText('Fermer', 'Hanakatona') : getText('Publier', 'Hamoaka')}
                            >
                              {job.status === 'published' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                          </>
                        )}
                        {isSuperAdmin && (
                          <button 
                            onClick={() => handleDelete(job.id, job.title_fr)} 
                            className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100 transition" 
                            title={getText('Supprimer', 'Hamafa')}
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

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
          <div className="text-sm text-gray-500 order-2 sm:order-1">
            {getText('Page', 'Pejy')} {currentPage} / {totalPages} 
            <span className="hidden sm:inline ml-2">
              ({totalItems} {getText('offres', 'asa')})
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

      {/* SYNTHESE */}
      {jobs.length > 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-xs text-gray-600">{getText('Publiees', 'Navoaka')}: {stats.published}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-xs text-gray-600">{getText('Brouillons', 'Volavola')}: {stats.draft}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-xs text-gray-600">{getText('Fermees', 'Nakatona')}: {stats.closed}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-xs text-gray-600">{getText('Expirees', 'Lany daty')}: {stats.expired}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-xs text-gray-600">{getText('Archivees', 'Voatahiry')}: {stats.archived}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{getText('Total', 'Rehetra')}: {stats.total}</span>
              <span className="text-xs text-gray-300">|</span>
              <span className="text-xs text-gray-400">{getText('Candidatures', 'Fangatahana')}: {stats.total_applications}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}