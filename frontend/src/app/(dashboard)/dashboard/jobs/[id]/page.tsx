// frontend/src/app/(dashboard)/dashboard/jobs/[id]/page.tsx

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { jobService, JobOffer, ContractType, JobStatus, JobApplication } from '@/services/job.service';
import { 
  ArrowLeft, Briefcase, Building, MapPin, Calendar, 
  Users, FileText, Clock, CheckCircle, 
  XCircle, Eye, Edit, Trash2, Loader2, 
  AlertCircle, Mail, Phone, Globe, TrendingUp,
  Award, Target, Heart, Share2, Printer,
  Download, Copy, ExternalLink, Zap,
  UserCheck, UserX, Clock as ClockIcon,
  BarChart3, PieChart, Activity, Sparkles,
  ChevronRight, MessageSquare, Star, TrendingDown
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// COMPOSANTS AMÉLIORÉS
// ============================================================

interface InfoItemProps {
  icon: any;
  label: string;
  value: string;
  highlight?: boolean;
}

function InfoItem({ icon: Icon, label, value, highlight = false }: InfoItemProps) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${
      highlight ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50/80'
    }`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
        highlight ? 'bg-red-100' : 'bg-gray-100/80'
      }`}>
        <Icon className={`w-4 h-4 ${highlight ? 'text-red-600' : 'text-gray-600'}`} />
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{label}</p>
        <p className={`text-gray-800 font-semibold ${highlight ? 'text-red-600' : ''}`}>{value}</p>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: any;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray' | 'emerald' | 'indigo';
  onClick?: () => void;
  subtitle?: string;
  trend?: number;
}

function StatCard({ label, value, icon: Icon, color, onClick, subtitle, trend }: StatCardProps) {
  const colors: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-100' },
    green: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', iconBg: 'bg-orange-100' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', iconBg: 'bg-red-100' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', iconBg: 'bg-purple-100' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', iconBg: 'bg-gray-100' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', iconBg: 'bg-indigo-100' },
  };
  
  const style = colors[color] || colors.gray;
  
  return (
    <div 
      onClick={onClick}
      className={`rounded-2xl border ${style.border} ${style.bg} p-4 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl md:text-3xl font-bold text-gray-800">{value}</p>
          <p className="text-xs font-medium text-gray-600 mt-0.5">{label}</p>
          {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${style.text}`} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {trend > 0 ? (
            <TrendingUp className="w-3 h-3 text-emerald-500" />
          ) : trend < 0 ? (
            <TrendingDown className="w-3 h-3 text-red-500" />
          ) : null}
          {trend !== 0 && (
            <span className={`text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

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
// HOOK PERSONNALISE
// ============================================================

const useJobDetails = (jobId: string) => {
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    interview: 0,
    accepted: 0,
    rejected: 0,
  });

  const fetchJob = useCallback(async () => {
    setLoading(true);
    try {
      const jobData = await jobService.getOfferById(jobId);
      setJob(jobData);
      setError('');
    } catch (error: any) {
      console.error('Erreur:', error);
      setError(error.message || 'Offre non trouvée');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await jobService.getApplicationsForJob(jobId);
      if (response && response.data) {
        setApplications(response.data);
        const stats = {
          total: response.data.length,
          pending: response.data.filter(a => a.status === 'pending').length,
          reviewing: response.data.filter(a => a.status === 'reviewing').length,
          interview: response.data.filter(a => a.status === 'interview').length,
          accepted: response.data.filter(a => a.status === 'accepted').length,
          rejected: response.data.filter(a => a.status === 'rejected').length,
        };
        setApplicationStats(stats);
      }
    } catch (error) {
      console.error('Erreur chargement candidatures:', error);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      fetchJob();
      fetchApplications();
    }
  }, [jobId, fetchJob, fetchApplications]);

  return { job, loading, error, applications, applicationStats, fetchJob, fetchApplications };
};

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const jobId = params?.id as string;

  const { job, loading, error, applications, applicationStats, fetchJob } = useJobDetails(jobId);
  
  const [imageError, setImageError] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showAllApplications, setShowAllApplications] = useState(false);

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin';
  const isSuperAdmin = user?.role === 'super_admin';

  // ============================================================
  // FONCTIONS UTILITAIRES
  // ============================================================

  const getText = useCallback((fr: string, mg: string) => {
    return language === 'fr' ? fr : mg;
  }, [language]);

  const getContractLabel = useCallback((type?: ContractType): string => {
    const labels: Record<ContractType, string> = {
      [ContractType.CDI]: 'CDI',
      [ContractType.CDD]: 'CDD',
      [ContractType.STAGE]: getText('Stage', 'Fiofanana'),
      [ContractType.FREELANCE]: 'Freelance',
      [ContractType.ALTERNANCE]: getText('Alternance', 'Fiofanana mifandimby'),
      [ContractType.TEMPORARY]: getText('Temporaire', 'Vonjimaika')
    };
    return type ? labels[type] : '';
  }, [getText]);

  const getContractIcon = useCallback((type?: ContractType) => {
    switch (type) {
      case ContractType.CDI: return Award;
      case ContractType.CDD: return Calendar;
      case ContractType.STAGE: return Target;
      case ContractType.FREELANCE: return Briefcase;
      default: return Briefcase;
    }
  }, []);

  const getStatusBadge = useCallback((status: JobStatus) => {
    const config: Record<JobStatus, { fr: string; mg: string; className: string; icon: any }> = {
      [JobStatus.PUBLISHED]: { 
        fr: 'Publiée', mg: 'Navoaka', 
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: CheckCircle
      },
      [JobStatus.DRAFT]: { 
        fr: 'Brouillon', mg: 'Volavola', 
        className: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: FileText
      },
      [JobStatus.CLOSED]: { 
        fr: 'Fermée', mg: 'Nakatona', 
        className: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle
      },
      [JobStatus.EXPIRED]: { 
        fr: 'Expirée', mg: 'Lany daty', 
        className: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: Clock
      },
      [JobStatus.ARCHIVED]: { 
        fr: 'Archivée', mg: 'Voatahiry', 
        className: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: ArchiveIcon
      }
    };
    const badge = config[status];
    if (!badge) return <span className="px-2 py-1 text-xs rounded-full bg-gray-100">{status}</span>;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border ${badge.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {language === 'fr' ? badge.fr : badge.mg}
      </span>
    );
  }, [language]);

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return getText('Non définie', 'Tsy voafaritra');
    try {
      return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return getText('Date invalide', 'Daty tsy mety');
    }
  }, [language, getText]);

  const getDaysRemaining = useCallback(() => {
    if (!job?.deadline) return null;
    const today = new Date();
    const deadline = new Date(job.deadline);
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: getText('Expirée', 'Lany daty'), color: 'text-red-600', bg: 'bg-red-100' };
    if (diffDays === 0) return { text: getText('Dernier jour', 'Andro farany'), color: 'text-orange-600', bg: 'bg-orange-100' };
    if (diffDays <= 7) return { text: getText(`Plus que ${diffDays} jours`, `${diffDays} andro sisa`), color: 'text-orange-600', bg: 'bg-orange-100' };
    return { text: getText(`${diffDays} jours restants`, `${diffDays} andro sisa`), color: 'text-emerald-600', bg: 'bg-emerald-100' };
  }, [job, getText]);

  const getApplicationStatusBadge = useCallback((status: string) => {
    const config: Record<string, { fr: string; mg: string; className: string }> = {
      pending: { fr: 'En attente', mg: 'Miandry', className: 'bg-orange-100 text-orange-700' },
      reviewing: { fr: 'En révision', mg: 'Azo dinihina', className: 'bg-blue-100 text-blue-700' },
      interview: { fr: 'Entretien', mg: 'Dinidinika', className: 'bg-purple-100 text-purple-700' },
      accepted: { fr: 'Acceptée', mg: 'Ekena', className: 'bg-emerald-100 text-emerald-700' },
      rejected: { fr: 'Refusée', mg: 'Lavina', className: 'bg-red-100 text-red-700' },
    };
    const badge = config[status];
    if (!badge) return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100">{status}</span>;
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${badge.className}`}>
        {language === 'fr' ? badge.fr : badge.mg}
      </span>
    );
  }, [language]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleDelete = async () => {
    if (!job) return;
    const confirmMsg = getText(
      `Supprimer l'offre "${job.title_fr}" ? Cette action est irréversible.`,
      `Hofafana ny asa "${job.title_fr}" ? Tsy azo averina intsony.`
    );
    if (!confirm(confirmMsg)) return;
    
    try {
      await jobService.deleteOffer(job.id);
      toast.success(getText('Offre supprimée avec succès', 'Vita ny fanafoanana ny asa'));
      router.push('/dashboard/jobs');
    } catch (error: any) {
      toast.error(error.response?.data?.message || getText('Erreur lors de la suppression', 'Nisy hadisoana tamin\'ny fanafoanana'));
    }
  };

  const handleToggleStatus = async () => {
    if (!job) return;
    const newStatus = job.status === JobStatus.PUBLISHED ? JobStatus.CLOSED : JobStatus.PUBLISHED;
    const action = job.status === JobStatus.PUBLISHED ? getText('fermer', 'hanakatona') : getText('publier', 'hamoaka');
    
    if (!confirm(getText(`Confirmer la ${action} de cette offre ?`, `Hamarino ny ${action} ity asa ity ?`))) return;
    
    try {
      await jobService.updateOfferStatus(job.id, newStatus);
      toast.success(job.status === JobStatus.PUBLISHED 
        ? getText('Offre fermée avec succès', 'Nakatona soa aman-tsara ny asa')
        : getText('Offre publiée avec succès', 'Navoaka soa aman-tsara ny asa'));
      fetchJob();
    } catch (error: any) {
      toast.error(error.response?.data?.message || getText('Erreur lors du changement de statut', 'Nisy hadisoana tamin\'ny fanovana sata'));
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/jobs/${job?.id}`;
    navigator.clipboard.writeText(url);
    toast.success(getText('Lien copié dans le presse-papier', 'Voakaopy ny rohy'));
    setShowShareMenu(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // ============================================================
  // RENDU CONDITIONNEL
  // ============================================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">{getText('Chargement...', 'Mampiditra...')}</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{getText('Offre non trouvée', 'Tsy hita ny asa')}</h3>
        <p className="text-gray-500 mb-6">{error || getText('Offre inexistante', 'Tsy misy ity asa ity')}</p>
        <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
          <ArrowLeft className="w-4 h-4" /> {getText('Retour aux offres', 'Hiverina any amin\'ny asa')}
        </Link>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining();
  const ContractIcon = getContractIcon(job.contract_type);
  const isPublished = job.status === JobStatus.PUBLISHED && job.is_published;
  const title = language === 'fr' ? job.title_fr : (job.title_mg || job.title_fr);

  // Statistiques des candidatures avec tendances
  const applicationStatsList = [
    { label: getText('Total', 'Rehetra'), value: applicationStats.total, color: 'blue' as const, icon: Users, trend: 12 },
    { label: getText('En attente', 'Miandry'), value: applicationStats.pending, color: 'orange' as const, icon: ClockIcon, trend: -5 },
    { label: getText('En révision', 'Azo dinihina'), value: applicationStats.reviewing, color: 'purple' as const, icon: Eye, trend: 8 },
    { label: getText('Entretien', 'Dinidinika'), value: applicationStats.interview, color: 'indigo' as const, icon: UserCheck, trend: 3 },
    { label: getText('Acceptées', 'Ekena'), value: applicationStats.accepted, color: 'emerald' as const, icon: CheckCircle, trend: 15 },
    { label: getText('Refusées', 'Lavina'), value: applicationStats.rejected, color: 'red' as const, icon: UserX, trend: -2 },
  ];

  // ============================================================
  // RENDU PRINCIPAL
  // ============================================================

  return (
    <div className="max-w-7xl mx-auto space-y-6 print:space-y-2 print:shadow-none px-4 sm:px-0">
      
      {/* ============================================================
      NAVIGATION
      ============================================================ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <Link 
          href="/dashboard/jobs" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-all duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">{getText('Retour aux offres', 'Hiverina any amin\'ny asa')}</span>
        </Link>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-xl hover:bg-gray-100/80 transition-all duration-200 border border-gray-200 hover:border-blue-200"
            title={getText('Imprimer', 'Printy')}
          >
            <Printer className="w-4 h-4" />
            <span className="sm:hidden">{getText('Imprimer', 'Printy')}</span>
          </button>
          
          <div className="relative flex-1 sm:flex-none">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-xl hover:bg-gray-100/80 transition-all duration-200 border border-gray-200 hover:border-blue-200"
              title={getText('Partager', 'Zarao')}
            >
              <Share2 className="w-4 h-4" />
              <span className="sm:hidden">{getText('Partager', 'Zarao')}</span>
            </button>
            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-in slide-in-from-top-2 duration-200">
                <button
                  onClick={handleCopyLink}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-400" /> {getText('Copier le lien', 'Adikao ny rohy')}
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <Printer className="w-4 h-4 text-gray-400" /> {getText('Imprimer', 'Printy')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
      EN-TÊTE - CARTE PRINCIPALE
      ============================================================ */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100/80 overflow-hidden print:border-none print:shadow-none hover:shadow-xl transition-shadow duration-300">
        
        {/* Bandeau de statut */}
        <div className={`px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-2 ${
          isPublished ? 'bg-gradient-to-r from-emerald-50 to-green-50' : 'bg-gray-50'
        }`}>
          <div className="flex items-center gap-2">
            {isPublished ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-semibold text-emerald-700">{getText('Offre active', 'Asa mavitrika')}</span>
                <span className="hidden sm:inline text-xs text-emerald-600/70">• {getText('Visible sur le site', 'Hita amin\'ny tranokala')}</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <span className="text-sm font-semibold text-gray-600">{getText('Offre inactive', 'Asa tsy mavitrika')}</span>
                <span className="hidden sm:inline text-xs text-gray-500/70">• {getText('Non visible', 'Tsy hita')}</span>
              </>
            )}
          </div>
          {daysRemaining && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${daysRemaining.bg} ${daysRemaining.color}`}>
              <Clock className="w-3 h-3" />
              {daysRemaining.text}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Image de couverture */}
            <div className="lg:w-1/3 xl:w-1/4">
              <div className="relative w-full aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl overflow-hidden shadow-inner">
                {job.image_url && !imageError ? (
                  <img 
                    src={job.image_url} 
                    alt={title} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-white/60 rounded-full flex items-center justify-center">
                      <Briefcase className="w-10 h-10 text-blue-400" />
                    </div>
                    <p className="text-sm text-blue-500/70 mt-3 font-medium">{getText('Aucune image', 'Tsy misy sary')}</p>
                  </div>
                )}
                {isPublished && (
                  <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                    {getText('Active', 'Mavitrika')}
                  </div>
                )}
              </div>
            </div>

            {/* Informations principales */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight mb-2">{title}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-gray-600 bg-gray-100/80 px-3 py-1 rounded-full text-sm">
                      <Building className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-medium">{job.company || 'Y-MaD Madagascar'}</span>
                    </span>
                    {job.location && (
                      <span className="inline-flex items-center gap-1.5 text-gray-500 bg-gray-100/80 px-3 py-1 rounded-full text-sm">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{job.location}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getStatusBadge(job.status)}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {job.contract_type && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-medium border border-blue-100">
                    <ContractIcon className="w-3.5 h-3.5" />
                    {getContractLabel(job.contract_type)}
                  </span>
                )}
                {job.deadline && !isPublished && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-xl text-xs font-medium border border-orange-100">
                    <Clock className="w-3.5 h-3.5" />
                    {getText('Expirée', 'Lany daty')}
                  </span>
                )}
                {isSuperAdmin && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl text-xs font-medium border border-purple-100">
                    <Sparkles className="w-3.5 h-3.5" />
                    Super Admin
                  </span>
                )}
                {job.views_count && job.views_count > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-medium border border-gray-200">
                    <Eye className="w-3.5 h-3.5" />
                    {job.views_count} {getText('vues', 'fijerena')}
                  </span>
                )}
              </div>

              {/* Résumé rapide */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                <div className="text-center bg-gray-50/80 rounded-xl p-3 hover:bg-gray-100/80 transition-colors">
                  <p className="text-2xl font-bold text-gray-800">{job.applications_count || 0}</p>
                  <p className="text-xs text-gray-500">{getText('Candidatures', 'Fangatahana')}</p>
                </div>
                <div className="text-center bg-gray-50/80 rounded-xl p-3 hover:bg-gray-100/80 transition-colors">
                  <p className="text-2xl font-bold text-gray-800">{job.views_count || 0}</p>
                  <p className="text-xs text-gray-500">{getText('Vues', 'Fijerena')}</p>
                </div>
                <div className="text-center bg-gray-50/80 rounded-xl p-3 hover:bg-gray-100/80 transition-colors">
                  <p className="text-2xl font-bold text-gray-800">{formatDate(job.created_at).split(' ')[0]}</p>
                  <p className="text-xs text-gray-500">{getText('Créée le', 'Noforonina')}</p>
                </div>
                <div className="text-center bg-gray-50/80 rounded-xl p-3 hover:bg-gray-100/80 transition-colors">
                  <p className="text-2xl font-bold text-gray-800">{job.is_published ? '✓' : '✗'}</p>
                  <p className="text-xs text-gray-500">{getText('Publiée', 'Navoaka')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
      BARRE D'OUTILS - ACTIONS
      ============================================================ */}
      {hasEditRights && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100/80 p-3 print:hidden overflow-x-auto">
          <div className="flex flex-wrap gap-2 justify-center min-w-max">
            <Link
              href={`/dashboard/jobs/${job.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium text-sm shadow-md shadow-blue-600/20 hover:shadow-lg hover:-translate-y-0.5"
            >
              <Edit className="w-4 h-4" /> {getText('Modifier', 'Hanova')}
            </Link>
            <Link
              href={`/dashboard/jobs/${job.id}/applications`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium text-sm hover:-translate-y-0.5"
            >
              <Users className="w-4 h-4" /> {getText('Candidatures', 'Fangatahana')}
              <span className="ml-1 px-2 py-0.5 bg-gray-200 rounded-full text-xs font-bold">{job.applications_count || 0}</span>
            </Link>
            <button
              onClick={handleToggleStatus}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium text-sm hover:-translate-y-0.5"
            >
              {job.status === JobStatus.PUBLISHED ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              {job.status === JobStatus.PUBLISHED ? getText('Fermer', 'Hanakatona') : getText('Publier', 'Hamoaka')}
            </button>
            <Link
              href={`/jobs/${job.id}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium text-sm hover:-translate-y-0.5"
            >
              <ExternalLink className="w-4 h-4" /> {getText('Voir sur le site', 'Jereo amin\'ny tranokala')}
            </Link>
            {isSuperAdmin && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200 font-medium text-sm hover:-translate-y-0.5"
              >
                <Trash2 className="w-4 h-4" /> {getText('Supprimer', 'Mamoaka')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
      STATISTIQUES DES CANDIDATURES
      ============================================================ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {applicationStatsList.map((stat, index) => (
          <StatCard
            key={index}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
            onClick={() => router.push(`/dashboard/jobs/${job.id}/applications?status=${stat.label.toLowerCase()}`)}
          />
        ))}
      </div>

      {/* ============================================================
      CONTENU PRINCIPAL - 2 COLONNES
      ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colonne de gauche - Description */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Description en français */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100/80 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="border-b border-gray-100 px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-50/50 to-white">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {getText('Description du poste', 'Famaritana ny asa')}
                <span className="text-xs text-gray-400 font-normal ml-2 bg-gray-100 px-2 py-0.5 rounded-full">FR</span>
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div 
                className="prose prose-sm max-w-none text-gray-600 leading-relaxed prose-headings:text-gray-800 prose-strong:text-gray-800 prose-a:text-blue-600"
                dangerouslySetInnerHTML={{ __html: job.description_fr }}
              />
            </div>
          </div>

          {/* Description en malagasy */}
          {job.description_mg && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100/80 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="border-b border-gray-100 px-4 sm:px-6 py-4 bg-gradient-to-r from-green-50/50 to-white">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  {getText('Description du poste', 'Famaritana ny asa')}
                  <span className="text-xs text-gray-400 font-normal ml-2 bg-gray-100 px-2 py-0.5 rounded-full">MG</span>
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <div 
                  className="prose prose-sm max-w-none text-gray-600 leading-relaxed prose-headings:text-gray-800 prose-strong:text-gray-800"
                  dangerouslySetInnerHTML={{ __html: job.description_mg }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Colonne de droite - Informations */}
        <div className="space-y-6">
          
          {/* Carte Entreprise */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100/80 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="border-b border-gray-100 px-4 sm:px-6 py-4 bg-gradient-to-r from-indigo-50/50 to-white">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600" />
                {getText('Entreprise', 'Orinasa')}
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
                  <Building className="w-10 h-10 text-indigo-700" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">{job.company || 'Y-MaD Madagascar'}</h3>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {job.location || 'Antananarivo, Madagascar'}
                </p>
              </div>
            </div>
          </div>

          {/* Informations clés */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100/80 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="border-b border-gray-100 px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-50/50 to-white">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                {getText('Informations clés', 'Fampahalalana manan-danja')}
              </h2>
            </div>
            <div className="p-3 sm:p-4 space-y-1">
              <InfoItem 
                icon={Briefcase} 
                label={getText('Type de contrat', 'Karazana fifanarahana')} 
                value={getContractLabel(job.contract_type)} 
              />
              <InfoItem 
                icon={MapPin} 
                label={getText('Lieu', 'Toerana')} 
                value={job.location || getText('Madagascar', 'Madagasikara')} 
              />
              <InfoItem 
                icon={Calendar} 
                label={getText('Date de création', 'Daty namoronana')} 
                value={formatDate(job.created_at)} 
              />
              <InfoItem 
                icon={Clock} 
                label={getText('Dernière modification', 'Fanovana farany')} 
                value={formatDate(job.updated_at)} 
              />
              {job.deadline && (
                <InfoItem 
                  icon={Calendar} 
                  label={getText('Date limite', 'Daty farany')} 
                  value={formatDate(job.deadline)}
                  highlight={new Date(job.deadline) < new Date()}
                />
              )}
            </div>
          </div>

          {/* Carte Candidatures - Appel à l'action */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 rounded-2xl p-6 text-center text-white shadow-xl shadow-blue-600/20 hover:shadow-2xl hover:shadow-blue-600/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Users className="w-8 h-8" />
              </div>
              <p className="text-4xl font-bold">{job.applications_count || 0}</p>
              <p className="text-blue-200 text-sm mt-1 font-medium">{getText('candidature(s) reçues', 'fangatahana voaray')}</p>
              <Link 
                href={`/dashboard/jobs/${job.id}/applications`} 
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-200 text-sm font-medium hover:scale-105"
              >
                {getText('Gérer les candidatures', 'Fitandremana ny fangatahana')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
      MÉTA-INFORMATIONS
      ============================================================ */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100/80 p-4 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-gray-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-mono bg-gray-50 px-2 py-1 rounded-md">ID: {job.id.substring(0, 8)}...</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {getText('Créée le', 'Noforonina')}: {formatDate(job.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {getText('Modifiée le', 'Nohavaozina')}: {formatDate(job.updated_at)}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
            <Eye className="w-3 h-3" />
            <span>{job.views_count || 0} {getText('vues', 'fijerena')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}