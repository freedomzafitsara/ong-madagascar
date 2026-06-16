// frontend/src/app/(dashboard)/dashboard/jobs/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

// ============================================================
// COMPOSANTS
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

function StatCard({ label, value, icon: Icon, isBlue = false, onClick }: { 
  label: string; 
  value: number; 
  icon: any; 
  isBlue?: boolean; 
  onClick?: () => void;
}) {
  const bgClass = isBlue ? 'bg-blue-100' : 'bg-gray-100';
  const iconClass = isBlue ? 'text-blue-800' : 'text-gray-600';
  
  return (
    <div 
      onClick={onClick} 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
        </div>
        <div className={`w-10 h-10 ${bgClass} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconClass}`} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function JobsDashboardPage() {
  const { user, token } = useAuth();
  const { language } = useLanguage();
  
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', contractType: 'all', search: '' });
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
  
  const isMounted = useRef(true);
  const initialFetchDone = useRef(false);
  const fetchJobsRef = useRef<(() => void) | null>(null);
  const fetchStatsRef = useRef<(() => void) | null>(null);

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin';
  const isSuperAdmin = user?.role === 'super_admin';

  const getText = useCallback((fr: string, mg: string) => {
    return language === 'fr' ? fr : mg;
  }, [language]);

  const getStatusBadge = useCallback((status: string) => {
    const config: Record<string, { fr: string; mg: string; className: string }> = {
      published: { fr: 'Publiee', mg: 'Navoaka', className: 'bg-green-100 text-green-700 border-green-200' },
      draft: { fr: 'Brouillon', mg: 'Volavola', className: 'bg-gray-100 text-gray-500 border-gray-200' },
      closed: { fr: 'Fermee', mg: 'Nakatona', className: 'bg-red-100 text-red-700 border-red-200' },
      expired: { fr: 'Expiree', mg: 'Lany daty', className: 'bg-orange-100 text-orange-700 border-orange-200' },
      archived: { fr: 'Archivee', mg: 'Voatahiry', className: 'bg-purple-100 text-purple-700 border-purple-200' }
    };
    const badge = config[status];
    if (!badge) return <span className="px-2 py-1 text-xs rounded-full bg-gray-100">{status}</span>;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border ${badge.className}`}>
        {language === 'fr' ? badge.fr : badge.mg}
      </span>
    );
  }, [language]);

  const formatDate = useCallback((dateString?: string): string => {
    if (!dateString) return getText('Non definie', 'Tsy voafaritra');
    try {
      return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return getText('Date invalide', 'Daty tsy mety');
    }
  }, [language, getText]);

  // ============================================================
  // FETCH FUNCTIONS
  // ============================================================

  const fetchJobs = useCallback(async () => {
    if (!token || !isMounted.current) return;
    
    setLoading(true);
    try {
      const params: any = { page: currentPage, limit: ITEMS_PER_PAGE };
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
        toast.error(error.response?.data?.message || getText('Erreur de chargement', 'Nisy hadisoana'));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [currentPage, filters.search, filters.status, filters.contractType, token, getText]);

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
    if (!confirm(getText(`Supprimer l'offre "${title}" ?`, `Hofafana ny asa "${title}" ?`))) return;
    try {
      await jobService.deleteOffer(id);
      toast.success(getText('Offre supprimee', 'Vita ny fanafoanana'));
      fetchJobs();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || getText('Erreur', 'Nisy hadisoana'));
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const isPublished = currentStatus === 'published';
    const newStatus = isPublished ? 'closed' : 'published';
    const action = isPublished ? getText('fermer', 'hanakatona') : getText('publier', 'hamoaka');
    
    if (!confirm(getText(`${action.toUpperCase()} - Confirmer ?`, `${action.toUpperCase()} - Azonao antoka ?`))) return;
    
    try {
      await jobService.updateOfferStatus(id, newStatus as any);
      toast.success(isPublished ? getText('Offre fermee', 'Nakatona') : getText('Offre publiee', 'Navoaka'));
      fetchJobs();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || getText('Erreur', 'Nisy hadisoana'));
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
      toast.success(getText('Export reussi', 'Vita ny fanondrana'));
    } catch (error) {
      toast.error(getText('Erreur export', 'Nisy hadisoana'));
    } finally {
      setExporting(false);
    }
  };

  const handleRefresh = () => {
    fetchJobs();
    fetchStats();
  };

  // ============================================================
  // STATUS OPTIONS (avec des string literals au lieu de l'enum)
  // ============================================================

  const statusOptions = [
    { value: 'all', label: getText('Tous statuts', 'Sata rehetra') },
    { value: 'published', label: getText('Publiees', 'Navoaka') },
    { value: 'draft', label: getText('Brouillons', 'Volavola') },
    { value: 'closed', label: getText('Fermees', 'Nakatona') },
    { value: 'expired', label: getText('Expirees', 'Lany daty') },
    { value: 'archived', label: getText('Archivees', 'Voatahiry') },
  ];

  // ============================================================
  // RENDU
  // ============================================================

  if (loading && jobs.length === 0 && !initialFetchDone.current) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-800 animate-spin" />
        <p className="text-gray-500 font-medium">{getText('Chargement...', 'Mampiditra...')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center shadow-sm">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{getText('Offres d\'emploi', 'Asa')}</h1>
            <p className="text-gray-500 text-sm">{getText('Gestion des offres', 'Fitantanana ny asa')}</p>
          </div>
        </div>
        {hasEditRights && (
          <Link href="/dashboard/jobs/new" className="flex items-center gap-2 px-4 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition shadow-sm font-medium">
            <Plus className="w-4 h-4" />
            {getText('Nouvelle offre', 'Asa vaovao')}
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <StatCard label={getText('Total', 'Rehetra')} value={stats.total} icon={Briefcase} isBlue={true} />
        <StatCard label={getText('Publiees', 'Navoaka')} value={stats.published} icon={CheckCircle} isBlue={true} />
        <StatCard label={getText('Brouillons', 'Volavola')} value={stats.draft} icon={Clock} />
        <StatCard label={getText('Fermees', 'Nakatona')} value={stats.closed} icon={XCircle} />
        <StatCard label={getText('Expirees', 'Lany daty')} value={stats.expired} icon={AlertCircle} />
        <StatCard label={getText('Archivees', 'Voatahiry')} value={stats.archived} icon={ArchiveIcon} />
        <StatCard label={getText('Candidatures', 'Fangatahana')} value={stats.total_applications} icon={Users} isBlue={true} />
        <StatCard label={getText('En attente', 'Miandry')} value={stats.pending_applications} icon={Clock} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={getText('Rechercher...', 'Karohy...')} 
              value={filters.search}
              onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none" 
            />
          </div>
          <select 
            value={filters.status} 
            onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setCurrentPage(1); }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white min-w-[140px] focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button onClick={handleRefresh} className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
            <button onClick={handleExport} disabled={exporting} className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-gray-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Offre', 'Asa')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Entreprise', 'Orinasa')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Lieu', 'Toerana')}
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Candidatures', 'Fangatahana')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Statut', 'Sata')}
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Actions', 'Hetsika')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Briefcase className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500">{getText('Aucune offre trouvee', 'Tsy misy asa hita')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden relative flex items-center justify-center">
                          {job.image_url ? (
                            <Image src={job.image_url} alt={job.title_fr} fill className="object-cover" sizes="40px" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {language === 'fr' ? job.title_fr : (job.title_mg || job.title_fr)}
                          </p>
                          <p className="text-xs text-gray-400">{formatDate(job.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{job.company || 'Y-MaD'}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{job.location || 'Madagascar'}</td>
                    <td className="px-5 py-4 text-center">
                      <Link 
                        href={`/dashboard/jobs/${job.id}/applications`} 
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
                      >
                        <Users className="w-3.5 h-3.5" /> {job.applications_count || 0}
                      </Link>
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(job.status)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
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
                              title={job.status === 'published' ? getText('Fermer', 'Hakatona') : getText('Publier', 'Hamoa')}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <div className="text-sm text-gray-500">
            {getText('Page', 'Pejy')} {currentPage} / {totalPages} ({totalItems} {getText('offres', 'asa')})
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
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
    </div>
  );
}