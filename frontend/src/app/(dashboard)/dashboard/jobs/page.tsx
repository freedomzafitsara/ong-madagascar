'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import { jobService, JobOffer, JobStatus, ContractType } from '@/services/job.service';
import { uploadService } from '@/services/upload.service';
import { 
  Briefcase, Search, Plus, Download, RefreshCw, Loader2,
  Eye, Edit, Trash2, MapPin, Calendar, Users,
  CheckCircle, XCircle, Clock, Star, Filter,
  ChevronLeft, ChevronRight, Building, Image as ImageIcon,
  TrendingUp, AlertCircle, FileText, ExternalLink, Cloud, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// CONSTANTES ET CONFIGURATION
// ============================================================

const ITEMS_PER_PAGE = 10;

const CONTRACT_LABELS: Record<ContractType, { fr: string; mg: string }> = {
  [ContractType.CDI]: { fr: 'CDI', mg: 'CDI' },
  [ContractType.CDD]: { fr: 'CDD', mg: 'CDD' },
  [ContractType.STAGE]: { fr: 'Stage', mg: 'Fiofanana' },
  [ContractType.FREELANCE]: { fr: 'Freelance', mg: 'Freelance' },
  [ContractType.ALTERNANCE]: { fr: 'Alternance', mg: 'Fiofanana mifandimby' },
  [ContractType.TEMPORARY]: { fr: 'Temporaire', mg: 'Vonjimaika' }
};

// ============================================================
// INTERFACES
// ============================================================

interface StatsData {
  total: number;
  published: number;
  draft: number;
  closed: number;
  expired: number;
  archived: number;
  totalApplications: number;
  pendingApplications: number;
}

interface FilterState {
  status: string;
  contractType: string;
  search: string;
}

// ============================================================
// COMPOSANT CARTE STATISTIQUE
// ============================================================

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  isBlue = false,
  trend,
  onClick
}: { 
  label: string; 
  value: number; 
  icon: any; 
  isBlue?: boolean;
  trend?: number;
  onClick?: () => void;
}) {
  const bgClass = isBlue ? 'bg-blue-100' : 'bg-gray-100';
  const iconClass = isBlue ? 'text-blue-600' : 'text-gray-600';
  const valueClass = isBlue ? 'text-blue-700' : 'text-gray-800';
  
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md group ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`text-2xl font-bold ${valueClass}`}>{value.toLocaleString()}</p>
          {trend !== undefined && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +{trend}%
            </p>
          )}
        </div>
        <div className={`w-10 h-10 ${bgClass} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-5 h-5 ${iconClass}`} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function JobsDashboardPage() {
  const { user, token } = useAuth();
  const { language } = useLanguage();
  
  // États
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    contractType: 'all',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    published: 0,
    draft: 0,
    closed: 0,
    expired: 0,
    archived: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const [exporting, setExporting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedJobForImage, setSelectedJobForImage] = useState<JobOffer | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Permissions
  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin';
  const isSuperAdmin = user?.role === 'super_admin';

  // ============================================================
  // FONCTIONS UTILITAIRES
  // ============================================================
  
  const t = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  const getContractLabel = (type?: ContractType): string => {
    if (!type) return '';
    return CONTRACT_LABELS[type]?.[language === 'fr' ? 'fr' : 'mg'] || type;
  };

  const getStatusBadge = (status: JobStatus) => {
    const config: Record<JobStatus, { fr: string; mg: string; className: string; icon: any }> = {
      [JobStatus.PUBLISHED]: { 
        fr: 'Publiée', mg: 'Navoaka', 
        className: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle
      },
      [JobStatus.DRAFT]: { 
        fr: 'Brouillon', mg: 'Volavola', 
        className: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: Clock
      },
      [JobStatus.CLOSED]: { 
        fr: 'Fermée', mg: 'Nakatona', 
        className: 'bg-red-50 text-red-700 border-red-200',
        icon: XCircle
      },
      [JobStatus.EXPIRED]: { 
        fr: 'Expirée', mg: 'Lany daty', 
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: Clock
      },
      [JobStatus.ARCHIVED]: { 
        fr: 'Archivée', mg: 'Voatahiry', 
        className: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: ArchiveIcon
      }
    };
    
    const badge = config[status];
    if (!badge) return <span className="px-2.5 py-1 text-xs rounded-full bg-gray-100">{status}</span>;
    
    const IconComponent = badge.icon;
    const label = language === 'fr' ? badge.fr : badge.mg;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border ${badge.className}`}>
        <IconComponent className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return t('Non définie', 'Tsy voafaritra');
    try {
      return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return t('Date invalide', 'Daty tsy mety');
    }
  };

  const isExpired = (deadline?: string): boolean => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================
  
  const fetchJobs = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };
      
      if (filters.search) params.search = filters.search;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.contractType !== 'all') params.contract_type = filters.contractType;
      
      const response = await jobService.getAllOffers(params);
      
      if (response && response.data) {
        setJobs(response.data);
        setTotalPages(response.totalPages);
        setTotalItems(response.total);
      }
    } catch (error: any) {
      console.error('Erreur chargement:', error);
      toast.error(error.response?.data?.message || t('Erreur de chargement', 'Nisy hadisoana'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, token, t]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await jobService.getJobStats();
      if (response) {
        setStats({
          total: response.total || 0,
          published: response.published || 0,
          draft: response.draft || 0,
          closed: response.closed || 0,
          expired: response.expired || 0,
          archived: response.archived || 0,
          totalApplications: response.total_applications || 0,
          pendingApplications: response.pending_applications || 0,
        });
      }
    } catch (error: any) {
      console.error('Erreur stats:', error);
    }
  }, [token]);

  // Initialisation
  useEffect(() => {
    if (token && !initialized) {
      setInitialized(true);
      fetchJobs();
      fetchStats();
    }
  }, [token, initialized, fetchJobs, fetchStats]);

  // Rechargement lors des changements
  useEffect(() => {
    if (initialized && token) {
      fetchJobs();
    }
  }, [currentPage, filters.status, filters.contractType, filters.search]);

  // ============================================================
  // ACTIONS CRUD
  // ============================================================

  const handleDelete = async (id: string, title: string) => {
    const confirmMessage = language === 'fr' 
      ? `Supprimer l'offre "${title}" ? Cette action est irréversible.`
      : `Hofafana ny asa "${title}" ? Tsy azo averina intsony ity hetsika ity.`;
    
    if (!confirm(confirmMessage)) return;
    
    try {
      await jobService.deleteOffer(id);
      toast.success(t('Offre supprimée avec succès', 'Vita ny fanafoanana ny asa'));
      fetchJobs();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Erreur lors de la suppression', 'Nisy hadisoana'));
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: JobStatus) => {
    let newStatus: JobStatus;
    let actionFr: string, actionMg: string;
    
    if (currentStatus === JobStatus.PUBLISHED) {
      newStatus = JobStatus.CLOSED;
      actionFr = 'fermer';
      actionMg = 'hanakatona';
    } else if (currentStatus === JobStatus.DRAFT) {
      newStatus = JobStatus.PUBLISHED;
      actionFr = 'publier';
      actionMg = 'hamoaka';
    } else {
      newStatus = JobStatus.PUBLISHED;
      actionFr = 'publier';
      actionMg = 'hamoaka';
    }
    
    const confirmMessage = language === 'fr'
      ? `${actionFr.toUpperCase()} - Êtes-vous sûr de vouloir ${actionFr} cette offre ?`
      : `${actionMg.toUpperCase()} - Azonao antoka ve fa te-${actionMg} ity asa ity?`;
    
    if (!confirm(confirmMessage)) return;
    
    try {
      await jobService.updateOfferStatus(id, newStatus);
      toast.success(
        currentStatus === JobStatus.PUBLISHED 
          ? t('Offre fermée', 'Nakatona ny asa')
          : t('Offre publiée', 'Navoaka ny asa')
      );
      fetchJobs();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('Erreur lors du changement de statut', 'Nisy hadisoana'));
    }
  };

  // Upload d'image vers Cloudinary
  const handleUploadImage = async (jobId: string, file: File) => {
    setUploadingImage(true);
    try {
      const imageUrl = await uploadService.uploadJobImage(jobId, file);
      await jobService.updateOffer(jobId, { image_url: imageUrl });
      toast.success(t('Image uploadée avec succès', 'Vita ny fampidirana sary'));
      fetchJobs();
      setShowUploadModal(false);
      setSelectedJobForImage(null);
    } catch (error: any) {
      console.error('Erreur upload:', error);
      toast.error(error.message || t('Erreur lors de l\'upload', 'Nisy hadisoana tamin\'ny fampidirana'));
    } finally {
      setUploadingImage(false);
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
      
      toast.success(t('Export réussi', 'Vita ny fanondrana'));
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error(t('Erreur lors de l\'export', 'Nisy hadisoana'));
    } finally {
      setExporting(false);
    }
  };

  const handleRefresh = () => {
    fetchJobs();
    fetchStats();
  };

  const handleResetFilters = () => {
    setFilters({ status: 'all', contractType: 'all', search: '' });
    setCurrentPage(1);
  };

  // ============================================================
  // OPTIONS DES FILTRES
  // ============================================================

  const statusOptions = [
    { value: 'all', label: t('Tous statuts', 'Sata rehetra'), color: 'gray' },
    { value: JobStatus.PUBLISHED, label: t('Publiées', 'Navoaka'), color: 'green' },
    { value: JobStatus.DRAFT, label: t('Brouillons', 'Volavola'), color: 'gray' },
    { value: JobStatus.CLOSED, label: t('Fermées', 'Nakatona'), color: 'red' },
    { value: JobStatus.EXPIRED, label: t('Expirées', 'Lany daty'), color: 'orange' },
    { value: JobStatus.ARCHIVED, label: t('Archivées', 'Voatahiry'), color: 'purple' },
  ];

  const contractTypeOptions = [
    { value: 'all', label: t('Tous types', 'Karazana rehetra') },
    { value: ContractType.CDI, label: 'CDI' },
    { value: ContractType.CDD, label: 'CDD' },
    { value: ContractType.STAGE, label: t('Stage', 'Fiofanana') },
    { value: ContractType.FREELANCE, label: 'Freelance' },
    { value: ContractType.ALTERNANCE, label: t('Alternance', 'Fiofanana mifandimby') },
    { value: ContractType.TEMPORARY, label: t('Temporaire', 'Vonjimaika') },
  ];

  // ============================================================
  // RENDU CONDITIONNEL
  // ============================================================

  if (loading && jobs.length === 0 && !initialized) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="text-gray-500 font-medium">{t('Chargement des offres...', 'Mampiditra ny asa...')}</p>
      </div>
    );
  }

  // ============================================================
  // RENDU PRINCIPAL
  // ============================================================

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{t('Offres d\'emploi', 'Asa')}</h1>
              <p className="text-gray-500 text-sm">
                {t('Gestion des offres et des candidatures', 'Fitantanana ny asa sy ny fangatahana')}
              </p>
            </div>
            {user?.role === 'super_admin' && (
              <span className="ml-2 px-2.5 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs rounded-full font-medium shadow-sm">
                Super Admin
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-3">
          {hasEditRights && (
            <Link 
              href="/dashboard/jobs/new" 
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium"
            >
              <Plus className="w-4 h-4" />
              {t('Nouvelle offre', 'Asa vaovao')}
            </Link>
          )}
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <StatCard label={t('Total offres', 'Asa rehetra')} value={stats.total} icon={Briefcase} isBlue={true} />
        <StatCard label={t('Publiées', 'Navoaka')} value={stats.published} icon={CheckCircle} isBlue={true} />
        <StatCard label={t('Brouillons', 'Volavola')} value={stats.draft} icon={Clock} isBlue={false} />
        <StatCard label={t('Fermées', 'Nakatona')} value={stats.closed} icon={XCircle} isBlue={false} />
        <StatCard label={t('Expirées', 'Lany daty')} value={stats.expired} icon={Clock} isBlue={false} />
        <StatCard label={t('Archivées', 'Voatahiry')} value={stats.archived} icon={ArchiveIcon} isBlue={false} />
        <StatCard label={t('Candidatures', 'Fangatahana')} value={stats.totalApplications} icon={Users} isBlue={true} />
        <StatCard label={t('En attente', 'Miandry')} value={stats.pendingApplications} icon={Clock} isBlue={false} />
      </div>

      {/* Barre de filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('Rechercher une offre (titre, entreprise)...', 'Karohy ny asa (lohateny, orinasa)...')}
              value={filters.search}
              onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          
          {/* Filtre statut */}
          <select
            value={filters.status}
            onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setCurrentPage(1); }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer min-w-[140px]"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          
          {/* Filtre type de contrat */}
          <select
            value={filters.contractType}
            onChange={(e) => { setFilters({ ...filters, contractType: e.target.value }); setCurrentPage(1); }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer min-w-[140px]"
          >
            {contractTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          
          {/* Boutons actions */}
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh}
              className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              title={t('Actualiser', 'Havaozina')}
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
            <button 
              onClick={handleExport} 
              disabled={exporting} 
              className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              title={t('Exporter en CSV', 'Avoaka amin\'ny CSV')}
            >
              {exporting ? <Loader2 className="w-4 h-4 text-gray-600 animate-spin" /> : <Download className="w-4 h-4 text-gray-600" />}
            </button>
            {(filters.search || filters.status !== 'all' || filters.contractType !== 'all') && (
              <button 
                onClick={handleResetFilters} 
                className="px-3 py-2.5 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {t('Réinitialiser', 'Averina')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tableau des offres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('Offre', 'Asa')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('Entreprise', 'Orinasa')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('Type', 'Karazana')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('Lieu', 'Toerana')}
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('Candidatures', 'Fangatahana')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('Date limite', 'Farany')}
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('Statut', 'Sata')}
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('Actions', 'Hetsika')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        {t('Aucune offre d\'emploi trouvée', 'Tsy misy asa hita')}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {t('Modifiez vos filtres ou créez une nouvelle offre', 'Hanova ny filtrao na mamorona asa vaovao')}
                      </p>
                      {hasEditRights && (
                        <Link href="/dashboard/jobs/new" className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1">
                          <Plus className="w-4 h-4" />
                          {t('Créer une offre', 'Mamorona asa vaovao')}
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {job.image_url ? (
                            <Image 
                              src={job.image_url} 
                              alt={job.title_fr} 
                              fill 
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          {hasEditRights && (
                            <button
                              onClick={() => {
                                setSelectedJobForImage(job);
                                setShowUploadModal(true);
                              }}
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <Upload className="w-4 h-4 text-white" />
                            </button>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 line-clamp-1">
                            {language === 'fr' ? job.title_fr : (job.title_mg || job.title_fr)}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {t('Créé le', 'Noforonina')} {formatDate(job.created_at)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Building className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="line-clamp-1">{job.company || 'Y-MaD'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                        {getContractLabel(job.contract_type as ContractType)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="line-clamp-1">{job.location || 'Madagascar'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Link 
                        href={`/dashboard/jobs/${job.id}/applications`}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                      >
                        <Users className="w-3.5 h-3.5" />
                        {job.applications_count}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className={isExpired(job.deadline) ? 'text-red-500 font-medium' : 'text-gray-600'}>
                          {formatDate(job.deadline)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {getStatusBadge(job.status)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link 
                          href={`/dashboard/jobs/${job.id}`} 
                          className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                          title={t('Voir les détails', 'Jereo antsipirihany')}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {hasEditRights && (
                          <>
                            <Link 
                              href={`/dashboard/jobs/${job.id}/edit`} 
                              className="p-2 text-gray-500 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition"
                              title={t('Modifier', 'Hanova')}
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleToggleStatus(job.id, job.status)}
                              className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                              title={job.status === JobStatus.PUBLISHED ? t('Fermer l\'offre', 'Hanakatona') : t('Publier l\'offre', 'Hamoaka')}
                            >
                              {job.status === JobStatus.PUBLISHED ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                          </>
                        )}
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDelete(job.id, language === 'fr' ? job.title_fr : (job.title_mg || job.title_fr))}
                            className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                            title={t('Supprimer', 'Mamoaka')}
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
      {totalPages > 1 && jobs.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
          <div className="text-sm text-gray-500 order-2 sm:order-1">
            {t('Page', 'Pejy')} <span className="font-semibold text-blue-600">{currentPage}</span> {t('sur', 'amin\'ny')} {totalPages}
            <span className="ml-2 text-gray-400">
              ({totalItems} {t('offres', 'asa')})
            </span>
          </div>
          <div className="flex gap-2 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('Précédent', 'Teo aloha')}
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              {t('Suivant', 'Manaraka')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal d'upload Cloudinary */}
      {showUploadModal && selectedJobForImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t('Upload image', 'Fampidirana sary')}</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedJobForImage(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t('Image pour', 'Sary ho an\'ny')} : <strong>{selectedJobForImage.title_fr}</strong>
            </p>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && selectedJobForImage) {
                  handleUploadImage(selectedJobForImage.id, file);
                }
              }}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
            />
            {uploadingImage && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('Upload en cours...', 'Fampidirana...')}</span>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              {t('Formats acceptés: JPG, PNG, WEBP. Max 5 Mo.', 'Endrika azo: JPG, PNG, WEBP. Max 5 Mo.')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPOSANT ICÔNE ARCHIVE
// ============================================================

function ArchiveIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  );
}