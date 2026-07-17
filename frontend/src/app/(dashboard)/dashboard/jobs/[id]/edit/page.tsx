// frontend/src/app/(dashboard)/dashboard/jobs/[id]/edit/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { jobService, JobOffer, ContractType, JobStatus } from '@/services/job.service';
import { uploadService, UploadedFile } from '@/services/upload.service';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, Save, Loader2, AlertCircle, CheckCircle,
  Building, MapPin, Briefcase, Calendar,
  FileText, Eye, XCircle, Clock, X,
  Upload, Trash2, Globe, Info,
  Zap, Award, Target, Users
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// CHARGEMENT DYNAMIQUE DE L'EDITEUR
// ============================================================

const RichTextEditor = dynamic(
  () => import('@/components/admin/RichTextEditor').then(mod => mod.RichTextEditor),
  { ssr: false, loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" /> }
);

// ============================================================
// TYPES
// ============================================================

type StatusColor = 'green' | 'red' | 'orange' | 'purple' | 'gray' | 'blue' | 'cyan' | 'emerald';

// ============================================================
// CONSTANTES
// ============================================================

const STATUS_COLORS: Record<StatusColor, string> = {
  green: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  gray: 'bg-gray-50 border-gray-200 text-gray-700',
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  cyan: 'bg-cyan-50 border-cyan-200 text-cyan-700',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
};

const CONTRACT_TYPES: { value: ContractType; label: string; color: StatusColor; icon: any }[] = [
  { value: ContractType.CDI, label: 'CDI', color: 'blue', icon: Award },
  { value: ContractType.CDD, label: 'CDD', color: 'cyan', icon: Calendar },
  { value: ContractType.STAGE, label: 'Stage', color: 'green', icon: Target },
  { value: ContractType.FREELANCE, label: 'Freelance', color: 'purple', icon: Briefcase },
  { value: ContractType.ALTERNANCE, label: 'Alternance', color: 'orange', icon: Zap },
  { value: ContractType.TEMPORARY, label: 'Temporaire', color: 'gray', icon: Clock },
];

const ArchiveIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="5" x="2" y="3" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </svg>
);

const STATUS_OPTIONS: { 
  value: JobStatus; 
  label: string; 
  labelMg: string; 
  color: StatusColor; 
  icon: any 
}[] = [
  { value: JobStatus.PUBLISHED, label: 'Publiée', labelMg: 'Navoaka', color: 'green', icon: CheckCircle },
  { value: JobStatus.DRAFT, label: 'Brouillon', labelMg: 'Volavola', color: 'gray', icon: FileText },
  { value: JobStatus.CLOSED, label: 'Fermée', labelMg: 'Nakatona', color: 'red', icon: XCircle },
  { value: JobStatus.EXPIRED, label: 'Expirée', labelMg: 'Lany daty', color: 'orange', icon: Clock },
  { value: JobStatus.ARCHIVED, label: 'Archivée', labelMg: 'Voatahiry', color: 'purple', icon: ArchiveIcon },
];

// ============================================================
// COMPOSANTS
// ============================================================

interface FormSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

function FormSection({ title, icon: Icon, children, className = '', description }: FormSectionProps) {
  return (
    <div className={`border-b border-gray-200 pb-6 mb-6 last:border-b-0 ${className}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-blue-700" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      </div>
      <div className="pl-0 md:pl-10">
        {children}
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: JobStatus;
  language: string;
}

function StatusBadge({ status, language }: StatusBadgeProps) {
  const option = STATUS_OPTIONS.find(opt => opt.value === status);
  if (!option) {
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100">{String(status)}</span>;
  }
  const Icon = option.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border ${STATUS_COLORS[option.color]}`}>
      <Icon className="w-3.5 h-3.5" />
      {language === 'fr' ? option.label : option.labelMg}
    </span>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
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
  // ÉTATS
  // ============================================================
  
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'general' | 'description' | 'publication'>('general');
  const [imageError, setImageError] = useState<boolean>(false);
  
  const hasFetched = useRef<boolean>(false);
  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin';
  const isSuperAdmin = user?.role === 'super_admin';
  const jobId = params.id as string;

  // ============================================================
  // FONCTIONS UTILITAIRES
  // ============================================================

  const getText = useCallback((fr: string, mg: string): string => {
    return language === 'fr' ? fr : mg;
  }, [language]);

  // ============================================================
  // CHARGEMENT DES DONNÉES - CORRIGÉ
  // ============================================================

  const fetchJob = useCallback(async (): Promise<void> => {
    if (!jobId) return;
    setLoading(true);
    setError('');
    try {
      const response: JobOffer = await jobService.getOfferById(jobId);
      
      if (response) {
        setJob(response);
        
        // ✅ Si image_url est présente, l'utiliser directement
        if (response.image_url) {
          setUploadedFile({
            id: 'temp',
            url: response.image_url,
            fileName: '',
            originalName: '',
            fileSize: 0,
            format: '',
            type: 'job',
            entityId: jobId,
            createdAt: new Date().toISOString(),
          });
        }
        
        // Charger l'image depuis le service d'upload si main_image_id existe
        if (response.main_image_id) {
          try {
            const files: UploadedFile[] = await uploadService.getFilesByEntity(jobId, 'job');
            const mainFile: UploadedFile | undefined = files.find((f: UploadedFile) => f.id === response.main_image_id);
            if (mainFile) {
              setUploadedFile(mainFile);
            }
          } catch (err) {
            console.error('Erreur chargement image:', err);
          }
        }
      }
    } catch (err) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMsg: string = errorObj.response?.data?.message || errorObj.message || getText('Offre non trouvee', 'Tsy hita ny asa');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [jobId, getText]);

  useEffect(() => {
    if (!isAuthenticated || !hasEditRights) {
      router.push('/dashboard/jobs');
      return;
    }
    if (!hasFetched.current && jobId) {
      hasFetched.current = true;
      fetchJob();
    }
  }, [isAuthenticated, hasEditRights, router, jobId, fetchJob]);

  // ============================================================
  // GESTIONNAIRES
  // ============================================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    if (!job) return;
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setJob({ ...job, [name]: checked });
    } else {
      setJob({ ...job, [name]: value });
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    if (!job) return;
    const value: JobStatus = e.target.value as JobStatus;
    setJob({ ...job, status: value });
  };

  const handleImageUpload = async (file: File): Promise<void> => {
    if (!job) return;
    setUploadingImage(true);
    try {
      const result: UploadedFile = await uploadService.uploadImage(file, 'job', job.id);
      setUploadedFile(result);
      const imageUrl: string = uploadService.getImageUrl(result.id);
      
      // ✅ Mettre à jour job.image_url localement
      setJob(prev => prev ? {
        ...prev,
        image_url: imageUrl,
        main_image_id: result.id
      } : prev);
      
      await jobService.updateOffer(job.id, { 
        image_url: imageUrl, 
        main_image_id: result.id 
      });
      toast.success(getText('Image uploadee avec succes', 'Nahomana ny fampidirana sary'));
    } catch (err) {
      const errorMessage: string = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      toast.error(errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async (): Promise<void> => {
    if (!uploadedFile || !job) return;
    try {
      await uploadService.deleteImage(uploadedFile.id);
      setUploadedFile(null);
      
      // ✅ Mettre à jour job.image_url localement
      setJob(prev => prev ? {
        ...prev,
        image_url: null,
        main_image_id: null
      } : prev);
      
      await jobService.updateOffer(job.id, { 
        image_url: null, 
        main_image_id: null 
      });
      toast.success(getText('Image supprimee', 'Voafafa ny sary'));
    } catch (err) {
      const errorMessage: string = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!job) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updateData: Partial<JobOffer> = {
        title_fr: job.title_fr,
        description_fr: job.description_fr,
        title_mg: job.title_mg || '',
        description_mg: job.description_mg || '',
        company: job.company || '',
        location: job.location || '',
        contract_type: job.contract_type || ContractType.CDI,
        deadline: job.deadline || undefined,
        is_published: job.is_published || false,
        status: job.status || JobStatus.DRAFT,
      };
      
      // ✅ Inclure les données de l'image
      if (job.image_url) {
        updateData.image_url = job.image_url;
      }
      if (job.main_image_id) {
        updateData.main_image_id = job.main_image_id;
      }

      await jobService.updateOffer(job.id, updateData);
      setSuccess(getText('Offre mise a jour avec succes !', 'Vita ny fanovana ny asa!'));
      toast.success(getText('Offre mise a jour', 'Vita ny fanovana'));
      setTimeout(() => router.push(`/dashboard/jobs/${job.id}`), 1500);
    } catch (err) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMsg: string = errorObj.response?.data?.message || errorObj.message || safeT('common.error', 'Erreur lors de la mise à jour');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // RENDU CONDITIONNEL
  // ============================================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-800 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="text-gray-500 font-medium">{getText('Chargement...', 'Mampiditra...')}</p>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{getText('Offre non trouvee', 'Tsy hita ny asa')}</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition shadow-sm">
          {getText('Retour aux offres', 'Hiverina any amin\'ny asa')}
        </Link>
      </div>
    );
  }

  if (!job) return null;

  // ✅ Utiliser job.image_url directement comme source principale
  const displayImageUrl: string | null = job.image_url || (uploadedFile ? uploadService.getImageUrl(uploadedFile.id) : null);

  // ============================================================
  // RENDU PRINCIPAL
  // ============================================================

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* EN-TÊTE */}
      <div>
        <Link href={`/dashboard/jobs/${jobId}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-800 transition mb-3">
          <ArrowLeft className="w-4 h-4" /> {getText('Retour au detail', 'Hiverina any amin\'ny antsipirihany')}
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center shadow-md">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {getText('Modifier l\'offre', 'Hanova ny asa')}
              </h1>
              <p className="text-gray-500 text-sm">
                {getText('Modifiez les informations de l\'offre d\'emploi', 'Hanova ny fampahalalana momba ny asa')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={job.status as JobStatus} language={language} />
            {isSuperAdmin && (
              <span className="px-2 py-1 bg-blue-800 text-white text-xs rounded-full shadow-sm flex items-center gap-1">
                <Award className="w-3 h-3" /> Super Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* ONGLETS */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-5 py-2.5 text-sm font-medium transition-all rounded-t-lg flex items-center gap-2 ${
            activeTab === 'general' 
              ? 'bg-white text-blue-800 border-b-2 border-blue-800' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          {getText('General', 'Ankapobeny')}
        </button>
        <button
          onClick={() => setActiveTab('description')}
          className={`px-5 py-2.5 text-sm font-medium transition-all rounded-t-lg flex items-center gap-2 ${
            activeTab === 'description' 
              ? 'bg-white text-blue-800 border-b-2 border-blue-800' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          {getText('Description', 'Famaritana')}
        </button>
        <button
          onClick={() => setActiveTab('publication')}
          className={`px-5 py-2.5 text-sm font-medium transition-all rounded-t-lg flex items-center gap-2 ${
            activeTab === 'publication' 
              ? 'bg-white text-blue-800 border-b-2 border-blue-800' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Globe className="w-4 h-4" />
          {getText('Publication', 'Famoahana')}
        </button>
      </div>

      {/* FORMULAIRE */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          
          {/* ✅ UPLOAD IMAGE - CORRIGÉ AVEC displayImageUrl */}
          <div className="border-b border-gray-200 pb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getText('Image de couverture', 'Sary fonony')}
              <span className="text-xs text-gray-400 ml-2">
                {getText('(Format recommande 1200x630px)', '(Endrika atolotra 1200x630px)')}
              </span>
            </label>
            
            {displayImageUrl ? (
              <div className="relative">
                <div className="relative w-full h-56 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                  <Image 
                    src={displayImageUrl} 
                    alt="Apercu" 
                    fill 
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.open(displayImageUrl || '', '_blank')}
                    className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition shadow-md"
                    title={getText('Voir', 'Hijery')}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
                    title={getText('Supprimer', 'Hamafa')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-56 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-gray-100 transition group">
                <div className="flex flex-col items-center justify-center p-4">
                  {uploadingImage ? (
                    <Loader2 className="w-12 h-12 text-blue-800 animate-spin mb-3" />
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 transition">
                        <Upload className="w-8 h-8 text-blue-700" />
                      </div>
                      <p className="text-base font-medium text-gray-600 text-center">
                        {getText('Glissez ou cliquez pour uploader', 'Tsindrio na alefaso ny sary')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 text-center">
                        {getText('JPG, PNG, WEBP, GIF (max 5 Mo)', 'JPG, PNG, WEBP, GIF (farany 5 Mo)')}
                      </p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" 
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  className="hidden" 
                  disabled={uploadingImage} 
                />
              </label>
            )}
          </div>
          
          {/* ONGLET GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <FormSection 
                title={getText('Informations generales', 'Fampahalalana ankapobeny')} 
                icon={FileText}
                description={getText('Titre du poste en francais et en malgache', 'Lohateny amin\'ny teny frantsay sy malagasy')}
              >
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {getText('Titre du poste (francais)', 'Lohateny (frantsay)')} 
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="title_fr"
                      required
                      value={job.title_fr || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition"
                      placeholder="Ex: Coordinateur de projet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {getText('Titre (malagasy)', 'Lohateny (malagasy)')}
                      <span className="text-xs text-gray-400 ml-2">{getText('(Optionnel)', '(Tsy voatery)')}</span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="title_mg"
                        value={job.title_mg || ''}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none transition focus:border-blue-800"
                        placeholder="Ex: Mpanandrindra tetikasa"
                      />
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection 
                title={getText('Informations entreprise', 'Fampahalalana orinasa')} 
                icon={Building}
                description={getText('Nom de l\'entreprise et lieu', 'Anaran\'ny orinasa sy toerana')}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {getText('Nom de l\'entreprise', 'Anaran\'ny orinasa')}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="company"
                        required
                        value={job.company || ''}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none transition focus:border-blue-800"
                        placeholder="Ex: Y-MaD Madagascar"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {getText('Lieu', 'Toerana')}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="location"
                        value={job.location || ''}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none transition focus:border-blue-800"
                        placeholder="Antananarivo"
                      />
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection 
                title={getText('Details du contrat', 'Antsipirihan\'ny fifanarahana')} 
                icon={Briefcase}
                description={getText('Type de contrat et date limite', 'Karazana fifanarahana sy daty farany')}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {getText('Type de contrat', 'Karazana fifanarahana')}
                    </label>
                    <select
                      name="contract_type"
                      value={job.contract_type || ContractType.CDI}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none focus:border-blue-800 bg-white"
                    >
                      {CONTRACT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {getText('Date limite de candidature', 'Daty farany hamalian\'ny asa')}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        name="deadline"
                        value={job.deadline ? job.deadline.split('T')[0] : ''}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none transition focus:border-blue-800"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {getText('Laissez vide si pas de date limite', 'Avela banga raha tsy misy daty farany')}
                    </p>
                  </div>
                </div>
              </FormSection>
            </div>
          )}

          {/* ONGLET DESCRIPTION */}
          {activeTab === 'description' && (
            <div className="space-y-6">
              <FormSection 
                title={getText('Description du poste (francais)', 'Famaritana ny asa (frantsay)')} 
                icon={FileText}
                description={getText('Utilisez les outils de mise en forme', 'Ampiasao ny fitaovana fanoratana')}
              >
                <div>
                  <RichTextEditor
                    value={job.description_fr}
                    onChange={(value) => {
                      if (job) setJob({ ...job, description_fr: value });
                    }}
                    placeholder={getText('Description detaillee du poste...', 'Famaritana feno momba ny asa...')}
                    language={language}
                    minHeight="400px"
                  />
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getText('Minimum 20 caracteres. Utilisez les outils de formatage (gras, italique, listes, etc.)', 'Litera 20 farafahakeliny. Ampiasao ny fitaovana fanoratana (maitso, lisitra, sns)')}
                  </p>
                </div>
              </FormSection>

              <FormSection 
                title={getText('Description du poste (malagasy)', 'Famaritana ny asa (malagasy)')} 
                icon={Globe}
                description={getText('Version en malgache (optionnelle)', 'Dikan-teny amin\'ny malagasy (tsy voatery)')}
              >
                <div>
                  <RichTextEditor
                    value={job.description_mg || ''}
                    onChange={(value) => {
                      if (job) setJob({ ...job, description_mg: value });
                    }}
                    placeholder="Famaritana amin'ny teny malagasy..."
                    language={language}
                    minHeight="300px"
                  />
                </div>
              </FormSection>
            </div>
          )}

          {/* ONGLET PUBLICATION */}
          {activeTab === 'publication' && (
            <div className="space-y-6">
              <FormSection 
                title={getText('Statut de publication', 'Satan\'ny famoahana')} 
                icon={Globe}
                description={getText('Gerez la visibilite de l\'offre', 'Amboary ny fahitan\'ny asa')}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getText('Statut actuel', 'Sata ankehitriny')}
                    </label>
                    <select
                      value={job.status || JobStatus.DRAFT}
                      onChange={handleStatusChange}
                      className="w-full md:w-64 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none focus:border-blue-800 bg-white"
                    >
                      {STATUS_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {language === 'fr' ? option.label : option.labelMg}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-2 flex items-start gap-1">
                      <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      {getText(
                        'Les offres publiees sont visibles par les candidats sur le site public',
                        'Ny asa navoaka dia hitan\'ny mpangataka eo amin\'ny tranokala'
                      )}
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_published"
                        checked={job.is_published || false}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-800 rounded border-gray-300 focus:ring-blue-800"
                      />
                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        {getText('Rendre visible sur le site public', 'Ataovy hita eo amin\'ny tranokala')}
                      </span>
                    </label>
                  </div>
                </div>
              </FormSection>

              <FormSection 
                title={getText('Apercu de l\'offre', 'Topi-mason\'ny asa')} 
                icon={Eye}
                description={getText('Visualisation de l\'offre modifiee', 'Fijerena ny asa novaina')}
              >
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    {displayImageUrl && !imageError ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                        <Image src={displayImageUrl} alt={job.title_fr} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{job.title_fr}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Building className="w-3 h-3" /> {job.company || 'Y-MaD'}
                        </span>
                        {job.location && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {job.location}
                          </span>
                        )}
                        {job.contract_type && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {CONTRACT_TYPES.find(c => c.value === job.contract_type)?.label || job.contract_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {job.description_fr?.substring(0, 150) || 'Aucune description...'}
                      {job.description_fr && job.description_fr.length > 150 ? '...' : ''}
                    </p>
                  </div>
                </div>
              </FormSection>
            </div>
          )}
        </div>

        {/* BOUTONS D'ACTION */}
        <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <Link
            href={`/dashboard/jobs/${jobId}`}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-medium"
          >
            <X className="w-4 h-4" /> {getText('Annuler', 'Aoka')}
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm font-medium"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {getText('Enregistrement...', 'Fanovana...')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {getText('Enregistrer les modifications', 'Tehirizo ny fanovana')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}