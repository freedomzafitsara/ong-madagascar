'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { jobsApi } from '@/lib/api';
import { 
  ArrowLeft, Briefcase, Building, MapPin, Calendar, 
  DollarSign, Users, FileText, Clock, CheckCircle, 
  XCircle, Star, Eye, Edit, Trash2, Loader2, 
  AlertCircle, Mail, Phone, Globe, Award, Heart,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

interface JobOffer {
  id: string;
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  company_name: string;
  image_url?: string;
  company_website?: string;
  location?: string;
  region?: string;
  job_type: string;
  sector?: string;
  salary?: string;
  requirements?: string;
  requirements_mg?: string;
  benefits?: string;
  deadline?: string;
  status: 'draft' | 'published' | 'closed' | 'expired';
  applications_count: number;
  is_featured: boolean;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
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

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff' || user?.role === 'partner';
  const isSuperAdmin = user?.role === 'super_admin';

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
      const response = await jobsApi.getOne(params.id as string);
      setJob(response);
      setError('');
    } catch (error: any) {
      console.error('Erreur:', error);
      setError(error.message || 'Offre non trouvée');
      toast.error(error.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Supprimer definitivement l'offre "${job?.title}" ? Cette action est irreversible.`)) return;
    
    try {
      await jobsApi.delete(job!.id);
      toast.success('Offre supprimee avec succes');
      router.push('/dashboard/jobs');
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const handleToggleStatus = async () => {
    if (!job) return;
    const newStatus = job.status === 'published' ? 'closed' : 'published';
    const action = job.status === 'published' ? 'fermer' : 'publier';
    
    if (!confirm(`Etes-vous sur de vouloir ${action} cette offre ?`)) return;
    
    try {
      await jobsApi.updateStatus(job.id, newStatus);
      toast.success(job.status === 'published' ? 'Offre fermee' : 'Offre publiee');
      fetchJob();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors du changement de statut');
    }
  };

  const getJobTypeLabel = (type: string) => {
    const types: Record<string, { fr: string; mg: string }> = {
      cdi: { fr: 'CDI - Contrat à durée indéterminée', mg: 'CDI' },
      cdd: { fr: 'CDD - Contrat à durée déterminée', mg: 'CDD' },
      stage: { fr: 'Stage professionnel', mg: 'Fiofanana' },
      freelance: { fr: 'Freelance / Indépendant', mg: 'Freelance' },
      benevolat: { fr: 'Bénévolat', mg: 'Asa an-tsitrapo' },
    };
    return types[type]?.[language === 'fr' ? 'fr' : 'mg'] || type;
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full bg-green-50 text-green-700 border border-green-200">
            <CheckCircle className="w-4 h-4" /> 
            <span className="font-medium">Publiee</span>
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            <Clock className="w-4 h-4" /> 
            <span className="font-medium">Brouillon</span>
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-4 h-4" /> 
            <span className="font-medium">Fermee</span>
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full bg-orange-50 text-orange-700 border border-orange-200">
            <Clock className="w-4 h-4" /> 
            <span className="font-medium">Expiree</span>
          </span>
        );
      default:
        return <span className="px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-600 border border-gray-200">{status}</span>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non definie';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const getDaysRemaining = () => {
    if (!job?.deadline) return null;
    const today = new Date();
    const deadline = new Date(job.deadline);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Expiree', color: 'text-red-600' };
    if (diffDays === 0) return { text: 'Dernier jour', color: 'text-orange-600' };
    if (diffDays <= 7) return { text: `Plus que ${diffDays} jours`, color: 'text-orange-600' };
    return { text: `${diffDays} jours restants`, color: 'text-green-600' };
  };

  const getText = (frText: string, mgText: string) => {
    return language === 'fr' ? frText : mgText;
  };

  const isOfferExpired = () => {
    if (!job?.deadline) return false;
    return new Date(job.deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="text-gray-500 font-medium">Chargement de l'offre...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Offre non trouvee</h3>
        <p className="text-gray-500 mb-6">{error || 'L offre d emploi que vous recherchez n existe pas ou a ete supprimee.'}</p>
        <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
          <ArrowLeft className="w-4 h-4" /> Retour aux offres
        </Link>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining();
  const expired = isOfferExpired();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ==================== EN-TETE ==================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <Link href="/dashboard/jobs" className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 transition text-sm mb-3">
              <ArrowLeft className="w-4 h-4" /> Retour aux offres
            </Link>
            <div className="flex items-center gap-4">
              {/* Image uploadée depuis la page d'ajout */}
              {job.image_url && !imageError ? (
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200">
                  <img 
                    src={job.image_url} 
                    alt={job.company_name} 
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Building className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">{job.title}</h1>
                <p className="text-blue-600 font-medium mt-1">{job.company_name}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {getStatusBadge(job.status)}
            {job.is_featured && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
                <Star className="w-4 h-4 fill-yellow-500" /> A la une
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ==================== ACTIONS ==================== */}
      {hasEditRights && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            <Link
              href={`/dashboard/jobs/${job.id}/edit`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm font-medium"
            >
              <Edit className="w-4 h-4" /> Modifier l'offre
            </Link>
            <Link
              href={`/dashboard/jobs/${job.id}/applications`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
            >
              <Users className="w-4 h-4" /> Candidatures ({job.applications_count})
            </Link>
            <button
              onClick={handleToggleStatus}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
            >
              {job.status === 'published' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              {job.status === 'published' ? 'Fermer l offre' : 'Publier l offre'}
            </button>
            {isSuperAdmin && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-medium"
              >
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
            )}
          </div>
        </div>
      )}

      {/* ==================== CONTENU PRINCIPAL ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLONNE GAUCHE - DESCRIPTION */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Carte de progression */}
          <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-blue-600 font-medium">Statut actuel</p>
                <p className="text-2xl font-bold text-gray-800">{job.applications_count} candidature(s)</p>
              </div>
              {daysRemaining && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Date limite</p>
                  <p className={`text-lg font-semibold ${daysRemaining.color}`}>
                    {formatDate(job.deadline)}
                  </p>
                  <p className="text-xs text-gray-400">{daysRemaining.text}</p>
                </div>
              )}
            </div>
            {job.status === 'published' && !expired && (
              <div className="mt-4 pt-4 border-t border-blue-100">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Cette offre est active et visible par les candidats</span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Description du poste
              </h2>
            </div>
            <div className="p-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                  {getText(job.description, job.description_mg || job.description)}
                </p>
              </div>
            </div>
          </div>

          {/* Prérequis */}
          {(job.requirements || job.requirements_mg) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Prerequis
                </h2>
              </div>
              <div className="p-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                    {getText(job.requirements || '', job.requirements_mg || '')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Avantages */}
          {job.benefits && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-blue-600" />
                  Avantages
                </h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">{job.benefits}</p>
              </div>
            </div>
          )}
        </div>

        {/* COLONNE DROITE - INFORMATIONS */}
        <div className="space-y-6">
          
          {/* Carte Entreprise */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Entreprise
              </h2>
            </div>
            <div className="p-6">
              <div className="text-center mb-4">
                {job.image_url && !imageError ? (
                  <img src={job.image_url} alt={job.company_name} className="h-16 mx-auto object-contain" />
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Building className="w-8 h-8 text-blue-600" />
                  </div>
                )}
              </div>
              <h3 className="text-center font-bold text-gray-800 text-lg">{job.company_name}</h3>
              {job.company_website && (
                <a 
                  href={job.company_website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-blue-600 hover:underline text-sm mt-2"
                >
                  <Globe className="w-4 h-4" /> Site web
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Informations clés */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Informations cles
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <InfoItem icon={Briefcase} label="Type de contrat" value={getJobTypeLabel(job.job_type)} />
              {job.salary && <InfoItem icon={DollarSign} label="Salaire" value={`${job.salary} Ar`} />}
              {job.sector && <InfoItem icon={Star} label="Secteur" value={job.sector} />}
              <InfoItem icon={MapPin} label="Localisation" value={job.location || job.region || 'Madagascar'} />
              <InfoItem icon={Calendar} label="Date de creation" value={formatDate(job.created_at)} />
            </div>
          </div>

          {/* Contact */}
          {(job.contact_email || job.contact_phone) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Contact
                </h2>
              </div>
              <div className="p-6 space-y-3">
                {job.contact_email && (
                  <a href={`mailto:${job.contact_email}`} className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition">
                    <Mail className="w-5 h-5" />
                    <span className="text-sm">{job.contact_email}</span>
                  </a>
                )}
                {job.contact_phone && (
                  <a href={`tel:${job.contact_phone}`} className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition">
                    <Phone className="w-5 h-5" />
                    <span className="text-sm">{job.contact_phone}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Statistiques candidatures */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-center text-white shadow-lg">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <p className="text-4xl font-bold">{job.applications_count}</p>
            <p className="text-blue-100 text-sm mt-1">candidature(s) recue(s)</p>
            <Link
              href={`/dashboard/jobs/${job.id}/applications`}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition text-sm font-medium"
            >
              Consulter les candidatures
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant réutilisable pour les informations clés
function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-gray-800 font-medium">{value}</p>
      </div>
    </div>
  );
}