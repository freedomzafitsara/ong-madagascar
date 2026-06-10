// frontend/src/app/(dashboard)/dashboard/jobs/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { jobService, JobOffer, ContractType, JobStatus } from '@/services/job.service';
import { 
  ArrowLeft, Briefcase, Building, MapPin, Calendar, 
  Users, FileText, Clock, CheckCircle, 
  XCircle, Eye, Edit, Trash2, Loader2, 
  AlertCircle, Mail, Phone, Globe, TrendingUp,
  Award, Target, Heart, Share2, Printer,
  Download, Copy, ExternalLink, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

// Composant InfoItem
function InfoItem({ icon: Icon, label, value, highlight = false }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl transition-all ${highlight ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${highlight ? 'bg-blue-100' : 'bg-gray-100'}`}>
        <Icon className={`w-4 h-4 ${highlight ? 'text-blue-600' : 'text-gray-600'}`} />
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className={`text-gray-800 font-medium ${highlight ? 'text-blue-700' : ''}`}>{value}</p>
      </div>
    </div>
  );
}

// Composant StatCard
function StatCard({ label, value, icon: Icon, color, onClick }: { label: string; value: number; icon: any; color: string; onClick?: () => void }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };
  
  return (
    <div 
      onClick={onClick}
      className={`rounded-xl border p-4 transition-all hover:shadow-md cursor-pointer ${colors[color as keyof typeof colors] || colors.gray}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs font-medium mt-0.5">{label}</p>
        </div>
        <div className="w-10 h-10 bg-white/50 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin';
  const isSuperAdmin = user?.role === 'super_admin';

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchJob();
  }, [params.id, isAuthenticated]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const response = await jobService.getOfferById(params.id as string);
      setJob(response);
      setError('');
    } catch (error: any) {
      console.error('Erreur:', error);
      setError(error.message || getText('Offre non trouvee', 'Tsy hita ny asa'));
      toast.error(error.message || getText('Erreur de chargement', 'Nisy hadisoana'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!job) return;
    const confirmMsg = getText(
      `Supprimer l'offre "${job.title_fr}" ? Cette action est irreversible.`,
      `Hofafana ny asa "${job.title_fr}" ? Tsy azo averina intsony.`
    );
    if (!confirm(confirmMsg)) return;
    
    try {
      await jobService.deleteOffer(job.id);
      toast.success(getText('Offre supprimee avec succes', 'Vita ny fanafoanana ny asa'));
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
        ? getText('Offre fermee avec succes', 'Nakatona soa aman-tsara ny asa')
        : getText('Offre publiee avec succes', 'Navoaka soa aman-tsara ny asa'));
      fetchJob();
    } catch (error: any) {
      toast.error(error.response?.data?.message || getText('Erreur lors du changement de statut', 'Nisy hadisoana tamin\'ny fanovana sata'));
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/jobs/${job?.id}`;
    navigator.clipboard.writeText(url);
    toast.success(getText('Lien copie dans le presse-papier', 'Voakaopy ny rohy'));
    setShowShareMenu(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const getContractLabel = (type?: ContractType): string => {
    const labels: Record<ContractType, string> = {
      [ContractType.CDI]: 'CDI',
      [ContractType.CDD]: 'CDD',
      [ContractType.STAGE]: getText('Stage', 'Fiofanana'),
      [ContractType.FREELANCE]: 'Freelance',
      [ContractType.ALTERNANCE]: getText('Alternance', 'Fiofanana mifandimby'),
      [ContractType.TEMPORARY]: getText('Temporaire', 'Vonjimaika')
    };
    return type ? labels[type] : '';
  };

  const getContractIcon = (type?: ContractType) => {
    switch (type) {
      case ContractType.CDI: return Award;
      case ContractType.CDD: return Calendar;
      case ContractType.STAGE: return Target;
      case ContractType.FREELANCE: return Briefcase;
      default: return Briefcase;
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    const config: Record<JobStatus, { fr: string; mg: string; className: string; icon: any }> = {
      [JobStatus.PUBLISHED]: { 
        fr: 'Publiee', mg: 'Navoaka', 
        className: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle
      },
      [JobStatus.DRAFT]: { 
        fr: 'Brouillon', mg: 'Volavola', 
        className: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: FileText
      },
      [JobStatus.CLOSED]: { 
        fr: 'Fermee', mg: 'Nakatona', 
        className: 'bg-red-50 text-red-700 border-red-200',
        icon: XCircle
      },
      [JobStatus.EXPIRED]: { 
        fr: 'Expiree', mg: 'Lany daty', 
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: Clock
      },
      [JobStatus.ARCHIVED]: { 
        fr: 'Archivee', mg: 'Voatahiry', 
        className: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: ArchiveIcon
      }
    };
    const badge = config[status];
    if (!badge) return <span className="px-2 py-1 text-xs rounded-full bg-gray-100">{status}</span>;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border ${badge.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {language === 'fr' ? badge.fr : badge.mg}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return getText('Non definie', 'Tsy voafaritra');
    try {
      return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return getText('Date invalide', 'Daty tsy mety');
    }
  };

  const getDaysRemaining = () => {
    if (!job?.deadline) return null;
    const today = new Date();
    const deadline = new Date(job.deadline);
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: getText('Expiree', 'Lany daty'), color: 'text-red-600', bg: 'bg-red-50' };
    if (diffDays === 0) return { text: getText('Dernier jour', 'Andro farany'), color: 'text-orange-600', bg: 'bg-orange-50' };
    if (diffDays <= 7) return { text: getText(`Plus que ${diffDays} jours`, `${diffDays} andro sisa`), color: 'text-orange-600', bg: 'bg-orange-50' };
    return { text: getText(`${diffDays} jours restants`, `${diffDays} andro sisa`), color: 'text-green-600', bg: 'bg-green-50' };
  };

  function ArchiveIcon(props: any) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="5" x="2" y="3" rx="1" />
        <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
        <path d="M10 12h4" />
      </svg>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="text-gray-500 font-medium">{getText('Chargement...', 'Mampiditra...')}</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{getText('Offre non trouvee', 'Tsy hita ny asa')}</h3>
        <p className="text-gray-500 mb-6">{error || getText('Offre inexistante', 'Tsy misy ity asa ity')}</p>
        <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <ArrowLeft className="w-4 h-4" /> {getText('Retour aux offres', 'Hiverina any amin\'ny asa')}
        </Link>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining();
  const ContractIcon = getContractIcon(job.contract_type);
  const isPublished = job.status === JobStatus.PUBLISHED && job.is_published;

  return (
    <div className="max-w-6xl mx-auto space-y-6 print:space-y-2 print:shadow-none">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">{getText('Retour aux offres', 'Hiverina any amin\'ny asa')}</span>
        </Link>
        
        {/* Actions rapides */}
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
            title={getText('Imprimer', 'Printy')}
          >
            <Printer className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
              title={getText('Partager', 'Zarao')}
            >
              <Share2 className="w-4 h-4" />
            </button>
            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={handleCopyLink}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" /> {getText('Copier le lien', 'Adikao ny rohy')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header - Carte principale */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print:border-none print:shadow-none">
        {/* Bandeau de statut */}
        <div className={`px-6 py-3 border-b flex items-center justify-between ${isPublished ? 'bg-green-50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            {isPublished ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">{getText('Offre active', 'Asa mavitrika')}</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">{getText('Offre inactive', 'Asa tsy mavitrika')}</span>
              </>
            )}
          </div>
          {daysRemaining && (
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${daysRemaining.bg} ${daysRemaining.color}`}>
              <Clock className="w-3 h-3" />
              {daysRemaining.text}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Image de couverture */}
            <div className="lg:w-1/3">
              <div className="relative w-full aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl overflow-hidden">
                {job.image_url && !imageError ? (
                  <img 
                    src={job.image_url} 
                    alt={job.title_fr} 
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Briefcase className="w-16 h-16 text-blue-300" />
                    <p className="text-sm text-blue-400 mt-2">{getText('Aucune image', 'Tsy misy sary')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Informations principales */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    {language === 'fr' ? job.title_fr : (job.title_mg || job.title_fr)}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <Building className="w-4 h-4" />
                      <span className="text-sm font-medium">{job.company || 'Y-Mad Madagascar'}</span>
                    </span>
                    {job.location && (
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{job.location}</span>
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
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    <ContractIcon className="w-3.5 h-3.5" />
                    {getContractLabel(job.contract_type)}
                  </span>
                )}
                {job.deadline && !isPublished && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {getText('Expiree', 'Lany daty')}
                  </span>
                )}
                {isSuperAdmin && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                    <Award className="w-3.5 h-3.5" />
                    Super Admin
                  </span>
                )}
              </div>

              {/* Resume rapide */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{job.applications_count}</p>
                  <p className="text-xs text-gray-500">{getText('Candidatures', 'Fangatahana')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{job.views_count || 0}</p>
                  <p className="text-xs text-gray-500">{getText('Vues', 'Fijerena')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{formatDate(job.created_at).split(' ')[0]}</p>
                  <p className="text-xs text-gray-500">{getText('Creee le', 'Noforonina')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{job.is_published ? getText('Oui', 'Eny') : getText('Non', 'Tsia')}</p>
                  <p className="text-xs text-gray-500">{getText('Publiee', 'Navoaka')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions - Barre d'outils */}
      {hasEditRights && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 print:hidden">
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href={`/dashboard/jobs/${job.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm"
            >
              <Edit className="w-4 h-4" /> {getText('Modifier', 'Hanova')}
            </Link>
            <Link
              href={`/dashboard/jobs/${job.id}/applications`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium text-sm"
            >
              <Users className="w-4 h-4" /> {getText('Candidatures', 'Fangatahana')}
              <span className="ml-1 px-1.5 py-0.5 bg-gray-200 rounded-full text-xs">{job.applications_count}</span>
            </Link>
            <button
              onClick={handleToggleStatus}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium text-sm"
            >
              {job.status === JobStatus.PUBLISHED ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              {job.status === JobStatus.PUBLISHED ? getText('Fermer', 'Hanakatona') : getText('Publier', 'Hamoaka')}
            </button>
            <Link
              href={`/jobs/${job.id}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium text-sm"
            >
              <ExternalLink className="w-4 h-4" /> {getText('Voir sur le site', 'Jereo amin\'ny tranokala')}
            </Link>
            {isSuperAdmin && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-medium text-sm"
              >
                <Trash2 className="w-4 h-4" /> {getText('Supprimer', 'Mamoaka')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label={getText('Total candidatures', 'Fitambarany fangatahana')} 
          value={job.applications_count} 
          icon={Users} 
          color="blue"
          onClick={() => router.push(`/dashboard/jobs/${job.id}/applications`)}
        />
        <StatCard 
          label={getText('En attente', 'Miandry')} 
          value={0} 
          icon={Clock} 
          color="orange"
        />
        <StatCard 
          label={getText('Acceptees', 'Ekena')} 
          value={0} 
          icon={CheckCircle} 
          color="green"
        />
        <StatCard 
          label={getText('Taux conversion', 'Tahan\'ny fiovana')} 
          value={0} 
          icon={TrendingUp} 
          color="purple"
        />
      </div>

      {/* Contenu principal - 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colonne de gauche - Description */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Description en francais */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {getText('Description du poste', 'Famaritana ny asa')}
                <span className="text-xs text-gray-400 font-normal ml-2">Francais</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
                {job.description_fr}
              </div>
            </div>
          </div>

          {/* Description en malagasy */}
          {job.description_mg && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  {getText('Description du poste', 'Famaritana ny asa')}
                  <span className="text-xs text-gray-400 font-normal ml-2">Malagasy</span>
                </h2>
              </div>
              <div className="p-6">
                <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {job.description_mg}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Colonne de droite - Informations */}
        <div className="space-y-6">
          
          {/* Carte Entreprise */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                {getText('Entreprise', 'Orinasa')}
              </h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-3">
                  <Building className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">{job.company || 'Y-Mad Madagascar'}</h3>
                <p className="text-sm text-gray-500 mt-1">{job.location || 'Antananarivo, Madagascar'}</p>
              </div>
            </div>
          </div>

          {/* Informations cles */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                {getText('Informations cles', 'Fampahalalana manan-danja')}
              </h2>
            </div>
            <div className="p-4 space-y-1">
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
                label={getText('Date de creation', 'Daty namoronana')} 
                value={formatDate(job.created_at)} 
              />
              <InfoItem 
                icon={Clock} 
                label={getText('Derniere modification', 'Fanovana farany')} 
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

          {/* Carte Candidatures */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-center text-white shadow-lg">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <p className="text-4xl font-bold">{job.applications_count}</p>
            <p className="text-blue-100 text-sm mt-1">{getText('candidature(s) recues', 'fangatahana voaray')}</p>
            <Link 
              href={`/dashboard/jobs/${job.id}/applications`} 
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition text-sm font-medium"
            >
              {getText('Gerer les candidatures', 'Fitandremana ny fangatahana')}
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>

      {/* Meta-informations */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 print:hidden">
        <div className="flex flex-wrap justify-between items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span>ID: {job.id}</span>
            <span>{getText('Cree le', 'Noforonina')}: {formatDate(job.created_at)}</span>
            <span>{getText('Modifie le', 'Nohavaozina')}: {formatDate(job.updated_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3" />
            <span>{job.views_count || 0} {getText('vues', 'fijerena')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}