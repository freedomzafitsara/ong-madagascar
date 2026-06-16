// frontend/src/app/(dashboard)/dashboard/jobs/[id]/applications/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/api';
import { 
  ArrowLeft, Users, Search, Download, RefreshCw, Loader2,
  Eye, Mail, Phone, MapPin, Calendar, Clock,
  CheckCircle, XCircle, AlertCircle, FileText, User,
  ChevronLeft, ChevronRight, Briefcase, Award,
  Star, X, Send, FileCheck, GraduationCap, ExternalLink,
  Filter, Trash2, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================

type ApplicationStatus = 'submitted' | 'reviewing' | 'shortlisted' | 'accepted' | 'rejected';

interface JobOffer {
  id: string;
  title_fr: string;
  title_mg?: string;
  company?: string;
  location?: string;
  contract_type: string;
}

interface JobApplication {
  id: string;
  job_offer_id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  experience_years?: number;
  current_position?: string;
  current_company?: string;
  cover_letter?: string;
  cover_letter_url?: string;
  photo_url?: string;
  cv_url?: string;
  diploma_url?: string;
  attestation_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  status: ApplicationStatus;
  notes?: string;
  created_at: string;
}

// ============================================================
// CONSTANTES
// ============================================================

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS: { value: ApplicationStatus; label: string; color: string; bg: string; icon: any }[] = [
  { value: 'submitted', label: 'Soumise', color: 'text-gray-700', bg: 'bg-gray-100', icon: Clock },
  { value: 'reviewing', label: 'En revision', color: 'text-blue-800', bg: 'bg-blue-100', icon: Eye },
  { value: 'shortlisted', label: 'Preselectionnee', color: 'text-purple-800', bg: 'bg-purple-100', icon: Star },
  { value: 'accepted', label: 'Acceptee', color: 'text-green-800', bg: 'bg-green-100', icon: CheckCircle },
  { value: 'rejected', label: 'Refusee', color: 'text-red-800', bg: 'bg-red-100', icon: XCircle },
];

// ============================================================
// COMPOSANTS
// ============================================================

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-600',
  };
  return (
    <div className={`rounded-xl p-4 text-center ${colors[color] || colors.gray}`}>
      <Icon className="w-5 h-5 mx-auto mb-2 opacity-70" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const option = STATUS_OPTIONS.find(opt => opt.value === status);
  const Icon = option?.icon || Clock;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${option?.bg} ${option?.color}`}>
      <Icon className="w-3 h-3" /> {option?.label}
    </span>
  );
}

function InfoDetail({ label, value, icon: Icon }: { label: string; value?: string; icon: any }) {
  if (!value) return null;
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-800 font-medium break-all">{value}</span>
      </div>
    </div>
  );
}

function DocumentLink({ url, label, icon: Icon }: { url?: string; label: string; icon: any }) {
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition group text-sm">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
    </a>
  );
}

function BuildingIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function ApplicationDetailModal({ 
  application, 
  onClose, 
  onUpdateStatus,
  formatDate,
  getText
}: { 
  application: JobApplication; 
  onClose: () => void; 
  onUpdateStatus: (id: string, status: ApplicationStatus) => Promise<void>;
  formatDate: (date: string) => string;
  getText: (fr: string, mg: string) => string;
}) {
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [updating, setUpdating] = useState(false);
  const [showFullLetter, setShowFullLetter] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    await onUpdateStatus(application.id, newStatus as ApplicationStatus);
    setStatus(newStatus as ApplicationStatus);
    setUpdating(false);
  };

  const hasCoverLetter = application.cover_letter || application.cover_letter_url;
  const coverLetterText = application.cover_letter || '';
  const isLongText = coverLetterText.length > 400;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        
        <div className="sticky top-0 bg-white px-6 py-5 border-b flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{getText('Detail de la candidature', 'Antsipirihan\'ny fangatahana')}</h2>
              <p className="text-sm text-gray-500">{application.full_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">{getText('Statut', 'Sata')} :</span>
                <StatusBadge status={status} />
              </div>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none bg-white text-sm"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoDetail label={getText('Nom complet', 'Anarana feno')} value={application.full_name} icon={User} />
            <InfoDetail label="Email" value={application.email} icon={Mail} />
            <InfoDetail label={getText('Telephone', 'Telefaonina')} value={application.phone} icon={Phone} />
            <InfoDetail label={getText('Adresse', 'Adiresy')} value={application.address} icon={MapPin} />
            <InfoDetail label={getText('Experience', 'Traikefa')} value={application.experience_years ? `${application.experience_years} ans` : undefined} icon={Briefcase} />
            <InfoDetail label={getText('Date de candidature', 'Daty nangatahana')} value={formatDate(application.created_at)} icon={Calendar} />
          </div>

          {(application.current_position || application.current_company) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoDetail label={getText('Poste actuel', 'Toerana misy')} value={application.current_position} icon={Briefcase} />
              <InfoDetail label={getText('Entreprise actuelle', 'Orinasa misy')} value={application.current_company} icon={BuildingIcon} />
            </div>
          )}

          {(application.linkedin_url || application.portfolio_url) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{getText('Liens professionnels', 'Rohy momba ny asa')}</h3>
              <div className="flex flex-wrap gap-3">
                {application.linkedin_url && (
                  <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-800 text-sm hover:underline flex items-center gap-1">
                    LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {application.portfolio_url && (
                  <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-800 text-sm hover:underline flex items-center gap-1">
                    Portfolio <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {hasCoverLetter && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-800" />
                {getText('Lettre de motivation', 'Taratra fanolorana')}
              </h3>
              {application.cover_letter_url ? (
                <DocumentLink url={application.cover_letter_url} label={getText('Telecharger la lettre', 'Alefaso ny taratasy')} icon={FileText} />
              ) : application.cover_letter && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className={`text-sm text-gray-600 whitespace-pre-wrap leading-relaxed ${!showFullLetter && isLongText ? 'max-h-32 overflow-hidden relative' : ''}`}>
                    {application.cover_letter}
                  </div>
                  {isLongText && (
                    <button onClick={() => setShowFullLetter(!showFullLetter)} className="mt-2 text-blue-800 text-sm hover:underline">
                      {showFullLetter ? getText('Voir moins', 'Ahena') : getText('Voir plus', 'Ampliory')}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">{getText('Documents joints', 'Rakitra nampidirina')}</h3>
            <div className="flex flex-wrap gap-3">
              <DocumentLink url={application.cv_url} label="CV" icon={FileText} />
              <DocumentLink url={application.diploma_url} label={getText('Diplome', 'Diploma')} icon={GraduationCap} />
              <DocumentLink url={application.attestation_url} label={getText('Attestation', 'Fanamarinana')} icon={FileCheck} />
            </div>
            {!application.cv_url && !application.diploma_url && !application.attestation_url && (
              <p className="text-sm text-gray-400 italic">{getText('Aucun document joint', 'Tsy misy rakitra nampidirina')}</p>
            )}
          </div>

          {application.photo_url && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{getText('Photo', 'Sary')}</h3>
              <img src={application.photo_url} alt={application.full_name} className="w-20 h-20 rounded-full object-cover border border-gray-200" />
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
            {getText('Fermer', 'Hidy')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function ApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  
  const jobId = params?.id as string;
  
  const [job, setJob] = useState<JobOffer | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const isMounted = useRef(true);
  const initialFetchDone = useRef(false);

  const hasAccess = user?.role === 'super_admin' || user?.role === 'admin';

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !hasAccess) {
      router.push('/dashboard/jobs');
    }
  }, [isAuthenticated, hasAccess, router]);

  const fetchJob = useCallback(async () => {
    if (!token || !isMounted.current || !jobId) return;
    try {
      const response = await api.get(`/jobs/offers/${jobId}`);
      if (response.data && isMounted.current) {
        setJob(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement offre:', error);
    }
  }, [jobId, token]);

  const fetchApplications = useCallback(async () => {
    if (!token || !isMounted.current || !jobId) return;
    setLoading(true);
    try {
      const paramsQuery: any = { page: currentPage, limit: ITEMS_PER_PAGE };
      if (filterStatus !== 'all') paramsQuery.status = filterStatus;
      if (searchTerm) paramsQuery.search = searchTerm;

      const response = await api.get(`/jobs/offers/${jobId}/applications`, { params: paramsQuery });
      
      if (response.data && isMounted.current) {
        setApplications(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.total || 0);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      if (isMounted.current) {
        toast.error(error.response?.data?.message || getText('Erreur de chargement des candidatures', 'Nisy hadisoana tamin\'ny fampidirana fangatahana'));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [jobId, token, currentPage, filterStatus, searchTerm, getText]);

  //  filteredApplications est défini ici
  const filteredApplications = applications.filter((app: JobApplication) => {
    const matchSearch = app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        app.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  useEffect(() => {
    if (token && !initialFetchDone.current && jobId) {
      initialFetchDone.current = true;
      fetchJob();
      fetchApplications();
    }
  }, [token, fetchJob, fetchApplications, jobId]);

  useEffect(() => {
    if (initialFetchDone.current && token && jobId) {
      fetchApplications();
    }
  }, [currentPage, filterStatus, searchTerm, fetchApplications, token, jobId]);

  const updateStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/jobs/applications/${applicationId}/status`, { status: newStatus });
      toast.success(getText('Statut mis a jour', 'Vita ny fanovana sata'));
      fetchApplications();
      if (selectedApp && selectedApp.id === applicationId) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || getText('Erreur lors de la mise a jour', 'Nisy hadisoana tamin\'ny fanovana'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleExport = async () => {
    if (!jobId) return;
    setExporting(true);
    try {
      const response = await api.get(`/jobs/applications/export?jobId=${jobId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `candidatures_${job?.title_fr || 'offre'}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(getText('Export reussi', 'Vita ny fanondrana'));
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error(getText('Erreur lors de l\'export', 'Nisy hadisoana tamin\'ny fanondrana'));
    } finally {
      setExporting(false);
    }
  };

  const handleRefresh = () => {
    fetchApplications();
    fetchJob();
    toast.success(getText('Donnees actualisees', 'Havaozina ny angona'));
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return date;
    }
  };

  const stats = {
    total: applications.length,
    submitted: applications.filter((a: JobApplication) => a.status === 'submitted').length,
    reviewing: applications.filter((a: JobApplication) => a.status === 'reviewing').length,
    shortlisted: applications.filter((a: JobApplication) => a.status === 'shortlisted').length,
    accepted: applications.filter((a: JobApplication) => a.status === 'accepted').length,
    rejected: applications.filter((a: JobApplication) => a.status === 'rejected').length,
  };

  if (loading && applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-800 animate-spin" />
        <p className="text-gray-500">{getText('Chargement des candidatures...', 'Fandefasana ny fangatahana...')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      
      {/* Header */}
      <div>
        <Link href="/dashboard/jobs" className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-800 mb-3 transition group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          {getText('Retour aux offres', 'Hiverina any amin\'ny asa')}
        </Link>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center shadow-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{getText('Candidatures', 'Fangatahana')}</h1>
              <p className="text-gray-500 text-sm">
                {job ? `${language === 'fr' ? job.title_fr : (job.title_mg || job.title_fr)} - ${job.company || 'Y-MaD'}` : getText('Chargement...', 'Fandefasana...')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleRefresh} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <RefreshCw className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">{getText('Actualiser', 'Havaozina')}</span>
            </button>
            <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-gray-600" />}
              <span className="text-sm text-gray-600">{getText('Exporter CSV', 'Hanondrana CSV')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label={getText('Total', 'Rehetra')} value={stats.total} icon={Users} color="blue" />
        <StatCard label={getText('Soumises', 'Nalefa')} value={stats.submitted} icon={Clock} color="gray" />
        <StatCard label={getText('En revision', 'Dinihina')} value={stats.reviewing} icon={Eye} color="blue" />
        <StatCard label={getText('Preselection', 'Voafidy')} value={stats.shortlisted} icon={Star} color="purple" />
        <StatCard label={getText('Acceptees', 'Ekena')} value={stats.accepted} icon={CheckCircle} color="green" />
        <StatCard label={getText('Refusees', 'Nolavina')} value={stats.rejected} icon={XCircle} color="red" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={getText('Rechercher par nom ou email...', 'Karohy amin\'ny anarana na email...')}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none text-sm min-w-[150px]"
          >
            <option value="all">{getText('Tous statuts', 'Sata rehetra')}</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {(searchTerm || filterStatus !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setFilterStatus('all'); setCurrentPage(1); }}
              className="flex items-center gap-2 px-3 py-2.5 text-gray-500 hover:text-gray-700 text-sm"
            >
              <X className="w-4 h-4" /> {getText('Effacer', 'Fafao')}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Candidat', 'Mpangataka')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Contact', 'Fifandraisana')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Date', 'Daty')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Statut', 'Sata')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('CV', 'CV')}
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Actions', 'Hetsika')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">{getText('Aucune candidature', 'Tsy misy fangatahana')}</p>
                      <p className="text-sm text-gray-400">{getText('Aucun candidat n\'a postule pour cette offre', 'Tsy misy mpangataka ho an\'ity asa ity')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app: JobApplication) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {app.photo_url ? (
                          <img src={app.photo_url} alt={app.full_name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{app.full_name}</p>
                          <p className="text-xs text-gray-500">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-600 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {app.email}
                      </p>
                      {app.phone && (
                        <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {app.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{formatDate(app.created_at).split(',')[0]}</td>
                    <td className="px-5 py-4">
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                        disabled={updatingStatus}
                        className="text-xs border rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none cursor-pointer bg-white"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className={opt.color}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      {app.cv_url ? (
                        <a href={app.cv_url} target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline text-sm flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> CV
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button 
                        onClick={() => { setSelectedApp(app); setShowDetailModal(true); }} 
                        className="p-2 text-gray-500 hover:text-blue-800 rounded-lg hover:bg-gray-100 transition"
                        title={getText('Voir le detail', 'Jereo ny antsipirihany')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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
            {getText('Page', 'Pejy')} {currentPage} / {totalPages} ({totalItems} {getText('candidatures', 'fangatahana')})
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = currentPage;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg transition ${currentPage === pageNum ? 'bg-blue-800 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Détail */}
      {showDetailModal && selectedApp && (
        <ApplicationDetailModal
          application={selectedApp}
          onClose={() => setShowDetailModal(false)}
          onUpdateStatus={updateStatus}
          formatDate={formatDate}
          getText={getText}
        />
      )}
    </div>
  );
}