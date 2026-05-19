'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import { jobsApi } from '@/lib/api';
import { 
  Briefcase, Search, Plus, Download, RefreshCw, Loader2,
  Eye, Edit, Trash2, MapPin, Calendar, Users,
  CheckCircle, XCircle, Clock, Star,
  ChevronLeft, ChevronRight, Building, Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

// Interface compatible avec le backend
interface JobOffer {
  id: string;
  title: string;
  title_mg?: string;
  description: string;
  company_name: string;
  image_url?: string;
  location?: string;
  region?: string;
  job_type: string;
  salary_range?: string;
  sector?: string;
  deadline?: string;
  status: 'draft' | 'published' | 'closed' | 'expired';
  applications_count: number;
  is_featured: boolean;
  created_at: string;
}

interface StatsData {
  total: number;
  published: number;
  draft: number;
  closed: number;
  expired: number;
  featured: number;
  totalApplications: number;
  pendingApplications: number;
}

// Composant Carte de statistique - UNIQUEMENT BLEU ET GRIS
function StatCard({ label, value, icon: Icon, isBlue = false }: { label: string; value: number; icon: any; isBlue?: boolean }) {
  const bgClass = isBlue ? 'bg-blue-100' : 'bg-gray-100';
  const iconClass = isBlue ? 'text-blue-600' : 'text-gray-600';
  const valueClass = isBlue ? 'text-blue-700' : 'text-gray-800';
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`text-2xl font-bold ${valueClass}`}>{value.toLocaleString()}</p>
        </div>
        <div className={`w-10 h-10 ${bgClass} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconClass}`} />
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const { user, token, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    published: 0,
    draft: 0,
    closed: 0,
    expired: 0,
    featured: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const itemsPerPage = 10;

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff' || user?.role === 'partner';
  const isSuperAdmin = user?.role === 'super_admin';

  const fetchJobs = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await jobsApi.getAll(
        currentPage,
        itemsPerPage,
        filterStatus !== 'all' ? filterStatus : undefined,
        filterType !== 'all' ? filterType : undefined,
        searchTerm || undefined
      );
      
      if (response && response.success !== false) {
        setJobs(response.data || []);
        setTotalPages(response.totalPages || 1);
      } else {
        setJobs([]);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur de chargement');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, filterType, searchTerm, token]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await jobsApi.getStats();
      if (response) {
        setStats({
          total: response.total || 0,
          published: response.published || 0,
          draft: response.draft || 0,
          closed: response.closed || 0,
          expired: response.expired || 0,
          featured: response.featured || 0,
          totalApplications: response.totalApplications || 0,
          pendingApplications: response.pendingApplications || 0,
        });
      }
    } catch (error: any) {
      console.error('Erreur stats:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchJobs();
      fetchStats();
    }
  }, [token, currentPage, filterStatus, filterType, searchTerm, fetchJobs, fetchStats]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`⚠️ Supprimer l'offre "${title}" ? Cette action est irréversible.`)) return;
    
    try {
      await jobsApi.delete(id);
      toast.success('✅ Offre supprimée avec succès');
      fetchJobs();
      fetchStats();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'closed' : 'published';
    const action = currentStatus === 'published' ? 'fermée' : 'publiée';
    
    if (!confirm(`📢 ${action.toUpperCase()}\n\nÊtes-vous sûr de vouloir ${action} cette offre ?`)) return;
    
    try {
      await jobsApi.updateStatus(id, newStatus);
      toast.success(currentStatus === 'published' ? '🔒 Offre fermée' : '📢 Offre publiée');
      fetchJobs();
      fetchStats();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors du changement de statut');
    }
  };

  const getJobTypeLabel = (type: string) => {
    const types: Record<string, { fr: string; mg: string }> = {
      cdi: { fr: 'CDI', mg: 'CDI' },
      cdd: { fr: 'CDD', mg: 'CDD' },
      stage: { fr: 'Stage', mg: 'Fiofanana' },
      freelance: { fr: 'Freelance', mg: 'Freelance' },
      benevolat: { fr: 'Bénévolat', mg: 'Asa an-tsitrapo' },
    };
    return types[type]?.[language === 'fr' ? 'fr' : 'mg'] || type;
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-green-50 text-green-700 border border-green-200">
            <CheckCircle className="w-3 h-3" /> Publiée
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            <Clock className="w-3 h-3" /> Brouillon
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3" /> Fermée
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-orange-50 text-orange-700 border border-orange-200">
            <Clock className="w-3 h-3" /> Expirée
          </span>
        );
      default:
        return <span className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  const isExpired = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non définie';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const jobTypes = [
    { value: 'all', label: 'Tous les types' },
    { value: 'cdi', label: 'CDI' },
    { value: 'cdd', label: 'CDD' },
    { value: 'stage', label: 'Stage' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'benevolat', label: 'Bénévolat' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Tous statuts' },
    { value: 'published', label: 'Publiées' },
    { value: 'draft', label: 'Brouillons' },
    { value: 'closed', label: 'Fermées' },
    { value: 'expired', label: 'Expirées' },
  ];

  if (loading && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="text-gray-500 font-medium">Chargement des offres...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ==================== EN-TÊTE ==================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Offres d'emploi</h1>
              <p className="text-gray-500 text-sm mt-0.5">Gérez les offres d'emploi et les candidatures</p>
            </div>
            {user?.role === 'super_admin' && (
              <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">Super Admin</span>
            )}
          </div>
        </div>
        {hasEditRights && (
          <Link href="/dashboard/jobs/new" className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm font-medium">
            <Plus className="w-4 h-4" />
            Nouvelle offre
          </Link>
        )}
      </div>

      {/* ==================== STATISTIQUES ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <StatCard label="Total offres" value={stats.total} icon={Briefcase} isBlue={true} />
        <StatCard label="Publiées" value={stats.published} icon={CheckCircle} isBlue={true} />
        <StatCard label="Brouillons" value={stats.draft} icon={Clock} isBlue={false} />
        <StatCard label="Fermées" value={stats.closed} icon={XCircle} isBlue={false} />
        <StatCard label="Expirées" value={stats.expired} icon={Clock} isBlue={false} />
        <StatCard label="À la une" value={stats.featured} icon={Star} isBlue={true} />
        <StatCard label="Candidatures" value={stats.totalApplications} icon={Users} isBlue={true} />
        <StatCard label="En attente" value={stats.pendingApplications} icon={Clock} isBlue={false} />
      </div>

      {/* ==================== FILTRES ==================== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une offre..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            {jobTypes.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button onClick={fetchJobs} className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition" title="Actualiser">
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition" title="Exporter">
            <Download className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* ==================== TABLEAU DES OFFRES ==================== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Titre</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entreprise</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lieu</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidatures</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date limite</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Briefcase className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">Aucune offre d'emploi trouvée</p>
                      {hasEditRights && (
                        <Link href="/dashboard/jobs/new" className="mt-2 text-blue-600 hover:underline text-sm">
                          Créer une offre
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
                        {job.image_url ? (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            <img src={job.image_url} alt={job.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{job.title}</p>
                          {job.is_featured && (
                            <span className="inline-flex items-center gap-1 text-xs text-yellow-600 mt-0.5">
                              <Star className="w-3 h-3 fill-yellow-500" /> À la une
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Building className="w-3.5 h-3.5 text-gray-400" />
                        {job.company_name}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                        {getJobTypeLabel(job.job_type)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {job.location || job.region || 'Madagascar'}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Link 
                        href={`/dashboard/jobs/${job.id}/applications`}
                        className="inline-flex items-center justify-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <Users className="w-3.5 h-3.5" />
                        {job.applications_count}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className={isExpired(job.deadline) ? 'text-red-500' : 'text-gray-600'}>
                          {formatDate(job.deadline)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {getStatusBadge(job.status)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link href={`/dashboard/jobs/${job.id}`} className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg transition" title="Voir les détails">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {hasEditRights && (
                          <>
                            <Link href={`/dashboard/jobs/${job.id}/edit`} className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg transition" title="Modifier">
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleToggleStatus(job.id, job.status)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg transition"
                              title={job.status === 'published' ? 'Fermer l\'offre' : 'Publier l\'offre'}
                            >
                              {job.status === 'published' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                          </>
                        )}
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDelete(job.id, job.title)}
                            className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg transition"
                            title="Supprimer définitivement"
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

      {/* ==================== PAGINATION ==================== */}
      {totalPages > 1 && jobs.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Page <span className="font-semibold text-blue-600">{currentPage}</span> sur {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}