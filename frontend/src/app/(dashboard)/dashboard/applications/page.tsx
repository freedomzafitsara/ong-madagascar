// frontend/src/app/(dashboard)/dashboard/applications/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/api';
import { 
  Eye, Search, X, XCircle, CheckCircle, AlertCircle, FileText, 
  User, Mail, Phone, MapPin, Calendar, Download, 
  ChevronLeft, ChevronRight, Briefcase, 
  Loader2, RefreshCw, Star, Clock, Trash2,
  ExternalLink, Building, Users, FileCheck, GraduationCap,
  ChevronDown, ChevronUp, FolderOpen, Link as LinkIcon,
  EyeOff, ThumbsUp, ThumbsDown, Send
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================

type ApplicationStatus = 'submitted' | 'reviewing' | 'shortlisted' | 'accepted' | 'rejected';

interface Application {
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
  jobOffer?: {
    id: string;
    title_fr: string;
    title_mg?: string;
    company?: string;
    location?: string;
  };
}

// ============================================================
// CONFIGURATION
// ============================================================

const statusOptions: { value: ApplicationStatus; label: string; color: string; bg: string; icon: any }[] = [
  { value: 'submitted', label: 'Soumise', color: 'text-gray-700', bg: 'bg-gray-100', icon: Clock },
  { value: 'reviewing', label: 'En révision', color: 'text-blue-800', bg: 'bg-blue-100', icon: Eye },
  { value: 'shortlisted', label: 'Préselectionnée', color: 'text-purple-800', bg: 'bg-purple-100', icon: Star },
  { value: 'accepted', label: 'Acceptée', color: 'text-green-800', bg: 'bg-green-100', icon: CheckCircle },
  { value: 'rejected', label: 'Refusée', color: 'text-red-800', bg: 'bg-red-100', icon: XCircle },
];

const itemsPerPage = 10;

// ============================================================
// COMPOSANTS
// ============================================================

function StatCard({ label, value, icon: Icon, isBlue = false }: { 
  label: string; value: number; icon: any; isBlue?: boolean
}) {
  return (
    <div className={`rounded-xl p-4 transition-all duration-200 hover:shadow-md ${isBlue ? 'bg-blue-800 text-white' : 'bg-white border border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${isBlue ? 'text-white/70' : 'text-gray-400'}`} />
      </div>
      <p className={`text-2xl font-bold ${isBlue ? 'text-white' : 'text-gray-800'}`}>{value}</p>
      <p className={`text-xs font-medium mt-1 ${isBlue ? 'text-white/60' : 'text-gray-500'}`}>{label}</p>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon, href }: { label: string; value?: string; icon: any; href?: string }) {
  if (!value) return null;
  
  const content = (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-800 font-medium truncate">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }
  return content;
}

function DocumentBadge({ url, label, icon: Icon }: { url?: string; label: string; icon: any }) {
  if (!url) return null;
  
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all group border border-gray-100"
    >
      <Icon className="w-4 h-4 text-blue-800" />
      <span className="text-sm text-gray-700">{label}</span>
      <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-800 transition" />
    </a>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const option = statusOptions.find(opt => opt.value === status);
  const IconComponent = option?.icon || Clock;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${option?.bg} ${option?.color}`}>
      <IconComponent className="w-3 h-3" />
      {option?.label || status}
    </span>
  );
}

// ============================================================
// MODAL DE DÉTAIL
// ============================================================

function ApplicationDetailModal({ 
  application, 
  onClose, 
  onUpdateStatus, 
  onDelete,
  formatDate,
  getText
}: { 
  application: Application; 
  onClose: () => void; 
  onUpdateStatus: (id: string, status: ApplicationStatus) => Promise<void>;
  onDelete: (id: string, name: string) => Promise<void>;
  formatDate: (date: string) => string;
  getText: (fr: string, mg: string) => string;
}) {
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [updating, setUpdating] = useState(false);
  const [showFullLetter, setShowFullLetter] = useState(false);
  const [notes, setNotes] = useState(application.notes || '');
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    await onUpdateStatus(application.id, newStatus as ApplicationStatus);
    setStatus(newStatus as ApplicationStatus);
    setUpdating(false);
  };

  const handleDelete = async () => {
    if (confirm(getText('Confirmer la suppression de cette candidature ?', 'Konfirmasio ny famafana ity fangatahana ity ?'))) {
      await onDelete(application.id, application.full_name);
      onClose();
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error(getText('Veuillez saisir votre réponse', 'Ampidiro ny valinteninao'));
      return;
    }
    toast.success(getText('Réponse envoyée avec succès', 'Vita ny fandefasana valiny'));
    setShowReply(false);
    setReplyText('');
    await onUpdateStatus(application.id, 'accepted' as ApplicationStatus);
  };

  const hasCoverLetter = application.cover_letter || application.cover_letter_url;
  const coverLetterText = application.cover_letter || '';
  const isLongText = coverLetterText.length > 400;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        
        <div className="sticky top-0 bg-white px-6 py-5 border-b flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{getText('Détail de la candidature', 'Antsipirihan\'ny fangatahana')}</h2>
              <p className="text-sm text-gray-500">
                {application.jobOffer?.title_fr} • {application.jobOffer?.company || 'Y-MaD'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition">
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">{getText('Statut actuel', 'Sata amin\'izao')} :</span>
                <StatusBadge status={status} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleStatusChange('accepted')}
                  disabled={updating || status === 'accepted'}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50"
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> {getText('Accepter', 'Ekeo')}
                </button>
                <button
                  onClick={() => handleStatusChange('rejected')}
                  disabled={updating || status === 'rejected'}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50"
                >
                  <ThumbsDown className="w-3.5 h-3.5" /> {getText('Refuser', 'Lavina')}
                </button>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updating}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none bg-white text-sm"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {updating && <Loader2 className="w-4 h-4 animate-spin text-blue-800" />}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {application.photo_url && (
              <div className="flex-shrink-0">
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-200 shadow-md">
                  <img 
                    src={application.photo_url} 
                    alt={application.full_name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                    }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow label={getText('Nom complet', 'Anarana feno')} value={application.full_name} icon={User} />
              <InfoRow label="Email" value={application.email} icon={Mail} />
              <InfoRow label={getText('Téléphone', 'Telefaonina')} value={application.phone} icon={Phone} />
              <InfoRow label={getText('Adresse', 'Adiresy')} value={application.address} icon={MapPin} />
              <InfoRow label={getText('Expérience', 'Traikefa')} value={application.experience_years ? `${application.experience_years} ans` : undefined} icon={Briefcase} />
              <InfoRow label={getText('Date de candidature', 'Daty nangatahana')} value={formatDate(application.created_at)} icon={Calendar} />
            </div>
          </div>

          {(application.current_position || application.current_company) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-800" />
                {getText('Situation professionnelle', 'Toeram-piasana')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow label={getText('Poste actuel', 'Toerana misy')} value={application.current_position} icon={Briefcase} />
                <InfoRow label={getText('Entreprise actuelle', 'Orinasa misy')} value={application.current_company} icon={Building} />
              </div>
            </div>
          )}

          {(application.linkedin_url || application.portfolio_url) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-blue-800" />
                {getText('Liens professionnels', 'Rohy momba ny asa')}
              </h3>
              <div className="flex flex-wrap gap-3">
                {application.linkedin_url && (
                  <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-800 hover:underline">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    LinkedIn
                  </a>
                )}
                {application.portfolio_url && (
                  <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-800 hover:underline">
                    <LinkIcon className="w-4 h-4" />
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          )}

          {hasCoverLetter && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-800" />
                {getText('Lettre de motivation', 'Taratra fanolorana')}
              </h3>
              {application.cover_letter_url ? (
                <DocumentBadge url={application.cover_letter_url} label={getText('Télécharger la lettre', 'Alefaso ny taratasy')} icon={FileText} />
              ) : application.cover_letter && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className={`text-sm text-gray-600 whitespace-pre-wrap leading-relaxed ${!showFullLetter && isLongText ? 'max-h-32 overflow-hidden relative' : ''}`}>
                    {application.cover_letter}
                  </div>
                  {isLongText && (
                    <button 
                      onClick={() => setShowFullLetter(!showFullLetter)} 
                      className="mt-3 text-blue-800 text-sm hover:underline flex items-center gap-1"
                    >
                      {showFullLetter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {showFullLetter ? getText('Voir moins', 'Ahena') : getText('Voir plus', 'Ampliory')}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {(application.cv_url || application.diploma_url || application.attestation_url) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-blue-800" />
                {getText('Documents joints', 'Rakitra nampidirina')}
              </h3>
              <div className="flex flex-wrap gap-3">
                <DocumentBadge url={application.cv_url} label="CV" icon={FileText} />
                <DocumentBadge url={application.diploma_url} label={getText('Diplôme', 'Diploma')} icon={GraduationCap} />
                <DocumentBadge url={application.attestation_url} label={getText('Attestation', 'Fanamarinana')} icon={FileCheck} />
              </div>
            </div>
          )}

          {!showReply ? (
            <button
              onClick={() => setShowReply(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition"
            >
              <Send className="w-4 h-4" />
              {getText('Envoyer une réponse', 'Alefaso valiny')}
            </button>
          ) : (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-800" />
                {getText('Réponse au candidat', 'Valiny ho an\'ny mpangataka')}
              </h3>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none resize-none text-sm"
                placeholder={getText('Saisissez votre réponse ici...', 'Ampidiro ny valinteninao eto...')}
              />
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleSendReply}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition"
                >
                  <Send className="w-4 h-4" />
                  {getText('Envoyer', 'Alefaso')}
                </button>
                <button
                  onClick={() => setShowReply(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {getText('Annuler', 'Aoka')}
                </button>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-800" />
              {getText('Notes internes', 'Fanamarihana')}
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={async () => {
                if (notes !== application.notes) {
                  await api.patch(`/jobs/applications/${application.id}`, { notes });
                  toast.success(getText('Notes sauvegardées', 'Vita ny fitehirizana'));
                }
              }}
              placeholder={getText('Ajouter des notes internes sur ce candidat...', 'Ampidiro ny fanamarihana...')}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none resize-none text-sm"
              rows={3}
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
            {getText('Fermer', 'Hidy')}
          </button>
          <Link
            href={`/dashboard/jobs/${application.job_offer_id}`}
            className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition text-sm font-medium"
          >
            {getText('Voir l\'offre associée', 'Jereo ny asa mifandraika')}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function CandidaturesPage() {
  const { token, user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<{ id: string; title_fr: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJob, setFilterJob] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const isMounted = useRef(true);
  const initialFetchDone = useRef(false);

  const hasAccess = user?.role === 'super_admin' || user?.role === 'admin';

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch {
      return date;
    }
  };

  const formatDateTime = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return date;
    }
  };

  const fetchJobs = useCallback(async () => {
    if (!token || !isMounted.current) return;
    try {
      const response = await api.get('/jobs/offers', { params: { limit: 100 } });
      if (response.data?.data) {
        setJobs(response.data.data.map((j: any) => ({ id: j.id, title_fr: j.title_fr })));
      }
    } catch (error) {
      console.error('Erreur chargement offres:', error);
    }
  }, [token]);

  const fetchApplications = useCallback(async () => {
    if (!token || !isMounted.current) return;
    setLoading(true);
    try {
      const params: any = { page: currentPage, limit: itemsPerPage };
      if (filterStatus !== 'all') params.status = filterStatus;
      
      const response = await api.get('/jobs/applications', { params });
      
      if (response.data?.data) {
        const apps = response.data.data;
        const appsWithJob = apps.map((app: Application) => ({
          ...app,
          jobOffer: jobs.find(j => j.id === app.job_offer_id)
        }));
        setApplications(appsWithJob);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(getText('Erreur de chargement des candidatures', 'Nisy hadisoana tamin\'ny fampidirana'));
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, filterStatus, jobs, getText]);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!hasAccess) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, hasAccess, router]);

  useEffect(() => {
    if (token && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchJobs();
    }
  }, [token, fetchJobs]);

  useEffect(() => {
    if (initialFetchDone.current && token) {
      fetchApplications();
    }
  }, [currentPage, filterStatus, fetchApplications, token]);

  const updateStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/jobs/applications/${applicationId}/status`, { status: newStatus });
      toast.success(getText('Statut mis à jour', 'Vita ny fanovana sata'));
      fetchApplications();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(getText('Erreur lors de la mise à jour', 'Nisy hadisoana tamin\'ny fanovana'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const deleteApplication = async (applicationId: string, name: string) => {
    try {
      await api.delete(`/jobs/applications/${applicationId}`);
      toast.success(getText(`Candidature de ${name} supprimée`, `Voafafa ny fangatahan'i ${name}`));
      fetchApplications();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(getText('Erreur lors de la suppression', 'Nisy hadisoana tamin\'ny fanafoanana'));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/jobs/applications/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `candidatures_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(getText('Export réussi', 'Vita ny fanondrana'));
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(getText('Erreur lors de l\'export', 'Nisy hadisoana tamin\'ny fanondrana'));
    } finally {
      setExporting(false);
    }
  };

  const handleRefresh = () => {
    fetchJobs();
    fetchApplications();
    toast.success(getText('Données actualisées', 'Havaozina ny angona'));
  };

  const handleQuickAccept = async (id: string) => {
    await updateStatus(id, 'accepted');
  };

  const handleQuickReject = async (id: string) => {
    if (confirm(getText('Confirmer le refus de cette candidature ?', 'Konfirmasio ny fandavana ity fangatahana ity ?'))) {
      await updateStatus(id, 'rejected');
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchSearch = app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchJob = filterJob === '' || app.job_offer_id === filterJob;
    return matchSearch && matchJob;
  });

  const paginatedApps = filteredApplications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  const stats = {
    total: applications.length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  if (!isAuthenticated || !hasAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{getText('Accès non autorisé', 'Tsy manana alalana')}</h1>
          <p className="text-gray-500 mt-2">{getText('Vous n\'avez pas les droits pour accéder à cette page', 'Tsy manana alalana hiditra ity pejy ity ianao')}</p>
          <Link href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition">
            {getText('Retour au tableau de bord', 'Hiverina any amin\'ny fandraisana')}
          </Link>
        </div>
      </div>
    );
  }

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
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center shadow-md">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{getText('Gestion des candidatures', 'Fitantanana ny fangatahana')}</h1>
            <p className="text-gray-500 text-sm">{getText('Consultez, gérez et suivez toutes les candidatures reçues', 'Jereo, tantano ary araho ny fangatahana rehetra')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-gray-600" />}
            <span className="text-sm text-gray-600">{getText('Exporter CSV', 'Hanondrana CSV')}</span>
          </button>
          <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <RefreshCw className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">{getText('Actualiser', 'Havaozina')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label={getText('Total candidatures', 'Fangatahana rehetra')} value={stats.total} icon={Users} isBlue={true} />
        <StatCard label={getText('Soumises', 'Nalefa')} value={stats.submitted} icon={Clock} />
        <StatCard label={getText('En révision', 'Dinihina')} value={stats.reviewing} icon={Eye} />
        <StatCard label={getText('Préselection', 'Voafidy')} value={stats.shortlisted} icon={Star} />
        <StatCard label={getText('Acceptées', 'Ekena')} value={stats.accepted} icon={CheckCircle} />
        <StatCard label={getText('Refusées', 'Nolavina')} value={stats.rejected} icon={XCircle} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={getText('Rechercher par nom, email...', 'Karohy amin\'ny anarana, email...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none text-sm"
            />
          </div>
          <select value={filterJob} onChange={(e) => setFilterJob(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none text-sm min-w-[180px]">
            <option value="">{getText('Toutes les offres', 'Asa rehetra')}</option>
            {jobs.map(job => <option key={job.id} value={job.id}>{job.title_fr}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none text-sm min-w-[150px]">
            <option value="all">{getText('Tous les statuts', 'Sata rehetra')}</option>
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          {(searchTerm || filterJob !== '' || filterStatus !== 'all') && (
            <button onClick={() => { setSearchTerm(''); setFilterJob(''); setFilterStatus('all'); }} className="px-3 py-2.5 text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1">
              <X className="w-4 h-4" /> {getText('Effacer', 'Fafao')}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{getText('Candidat', 'Mpangataka')}</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{getText('Poste', 'Asa')}</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{getText('Contact', 'Fifandraisana')}</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{getText('Documents', 'Rakitra')}</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{getText('Date', 'Daty')}</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{getText('Statut', 'Sata')}</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{getText('Actions', 'Hetsika')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <EyeOff className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">{getText('Aucune candidature trouvée', 'Tsy misy fangatahana hita')}</p>
                      <p className="text-sm text-gray-400">{getText('Modifiez vos filtres pour voir plus de résultats', 'Hanova ny filtrao mba hahita valiny bebe kokoa')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedApps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {app.photo_url ? (
                          <img src={app.photo_url} alt={app.full_name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
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
                      <p className="font-medium text-gray-800">{app.jobOffer?.title_fr || '-'}</p>
                      <p className="text-xs text-gray-500">{app.jobOffer?.company || 'Y-MaD'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-600">{app.phone || '-'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {app.cv_url && <FileText className="w-4 h-4 text-green-600" />}
                        {(app.cover_letter || app.cover_letter_url) && <Mail className="w-4 h-4 text-blue-600" />}
                        {!app.cv_url && !app.cover_letter && <span className="text-xs text-gray-400">-</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{formatDate(app.created_at)}</td>
                    <td className="px-5 py-4"><StatusBadge status={app.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setSelectedApp(app); setShowDetailModal(true); }} className="p-2 text-gray-500 hover:text-blue-800 rounded-lg hover:bg-gray-100 transition">
                          <Eye className="w-4 h-4" />
                        </button>
                        {app.status !== 'accepted' && (
                          <button onClick={() => handleQuickAccept(app.id)} className="p-2 text-gray-500 hover:text-green-600 rounded-lg hover:bg-green-50 transition">
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                        )}
                        {app.status !== 'rejected' && (
                          <button onClick={() => handleQuickReject(app.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition">
                            <ThumbsDown className="w-4 h-4" />
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

      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <div className="text-sm text-gray-500">
            {getText('Page', 'Pejy')} {currentPage} / {totalPages} • {filteredApplications.length} {getText('candidature(s)', 'fangatahana')}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = currentPage;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;
              return (
                <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`px-3 py-2 rounded-lg transition ${currentPage === pageNum ? 'bg-blue-800 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>
                  {pageNum}
                </button>
              );
            })}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {showDetailModal && selectedApp && (
        <ApplicationDetailModal
          application={selectedApp}
          onClose={() => setShowDetailModal(false)}
          onUpdateStatus={updateStatus}
          onDelete={deleteApplication}
          formatDate={formatDateTime}
          getText={getText}
        />
      )}
    </div>
  );
}