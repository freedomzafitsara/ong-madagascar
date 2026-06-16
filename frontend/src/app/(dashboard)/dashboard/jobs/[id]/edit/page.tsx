// frontend/src/app/(dashboard)/dashboard/jobs/[id]/edit/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { jobService, JobOffer, ContractType, JobStatus } from '@/services/job.service';
import { uploadService, UploadedFile } from '@/services/upload.service';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, Save, Loader2, AlertCircle, CheckCircle,
  Building, MapPin, Briefcase, Calendar,
  FileText, Eye, XCircle, Clock, X,
  Upload, Trash2, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

// Chargement dynamique de l'editeur
const RichTextEditor = dynamic(
  () => import('@/components/admin/RichTextEditor').then(mod => mod.RichTextEditor),
  { ssr: false, loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" /> }
);

type StatusColor = 'green' | 'red' | 'orange' | 'purple' | 'gray' | 'blue';

const STATUS_COLORS: Record<StatusColor, string> = {
  green: 'bg-green-50 border-green-200 text-green-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  gray: 'bg-gray-50 border-gray-200 text-gray-700',
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
};

const CONTRACT_TYPES: { value: ContractType; label: string; color: StatusColor }[] = [
  { value: ContractType.CDI, label: 'CDI', color: 'blue' },
  { value: ContractType.CDD, label: 'CDD', color: 'cyan' as StatusColor },
  { value: ContractType.STAGE, label: 'Stage', color: 'green' },
  { value: ContractType.FREELANCE, label: 'Freelance', color: 'purple' },
  { value: ContractType.ALTERNANCE, label: 'Alternance', color: 'orange' },
  { value: ContractType.TEMPORARY, label: 'Temporaire', color: 'gray' },
];

const STATUS_OPTIONS = [
  { value: JobStatus.PUBLISHED, label: 'Publie', labelMg: 'Navoaka', color: 'green' as StatusColor, icon: CheckCircle },
  { value: JobStatus.DRAFT, label: 'Brouillon', labelMg: 'Volavola', color: 'gray' as StatusColor, icon: FileText },
  { value: JobStatus.CLOSED, label: 'Ferme', labelMg: 'Nakatona', color: 'red' as StatusColor, icon: XCircle },
  { value: JobStatus.EXPIRED, label: 'Expire', labelMg: 'Lany daty', color: 'orange' as StatusColor, icon: Clock },
  { value: JobStatus.ARCHIVED, label: 'Archive', labelMg: 'Voatahiry', color: 'purple' as StatusColor, icon: ArchiveIcon },
];

function ArchiveIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  );
}

function FormSection({ title, icon: Icon, children, className = '' }: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <div className={`border-b border-gray-200 pb-6 mb-6 last:border-b-0 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        {title}
      </h2>
      <div className="pl-0 md:pl-10">
        {children}
      </div>
    </div>
  );
}

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'description' | 'publication'>('general');
  
  const hasFetched = useRef(false);
  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin';
  const isSuperAdmin = user?.role === 'super_admin';
  const jobId = params.id as string;

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  const fetchJob = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const response = await jobService.getOfferById(jobId);
      setJob(response);
      
      // Récupérer l'image si elle existe
      if (response.main_image_id) {
        try {
          const files = await uploadService.getFiles('job', jobId);
          const mainFile = files.find((f: UploadedFile) => f.id === response.main_image_id);
          if (mainFile) setUploadedFile(mainFile);
        } catch (err) {
          console.error('Erreur chargement image:', err);
        }
      }
      setError('');
    } catch (err) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMsg = errorObj.response?.data?.message || errorObj.message || getText('Offre non trouvee', 'Tsy hita ny asa');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!job) return;
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setJob({ ...job, [name]: checked });
    } else {
      setJob({ ...job, [name]: value });
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!job) return;
    setUploadingImage(true);
    try {
      const result = await uploadService.uploadImage(file, 'job');
      setUploadedFile(result);
      const imageUrl = uploadService.getImageUrl(result.id);
      await jobService.updateOffer(job.id, { 
        image_url: imageUrl, 
        main_image_id: result.id 
      });
      toast.success(getText('Image uploadee avec succes', 'Nahomana ny fampidirana sary'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      toast.error(errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!uploadedFile || !job) return;
    try {
      await uploadService.deleteFile(uploadedFile.id);
      setUploadedFile(null);
      await jobService.updateOffer(job.id, { 
        image_url: undefined, 
        main_image_id: undefined 
      });
      toast.success(getText('Image supprimee', 'Voafafa ny sary'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updateData: Partial<JobOffer> = {
        title_fr: job.title_fr,
        description_fr: job.description_fr,
      };
      if (job.title_mg) updateData.title_mg = job.title_mg;
      if (job.description_mg) updateData.description_mg = job.description_mg;
      if (job.company) updateData.company = job.company;
      if (job.location) updateData.location = job.location;
      if (job.contract_type) updateData.contract_type = job.contract_type;
      if (job.deadline) updateData.deadline = job.deadline;
      if (uploadedFile) {
        updateData.image_url = uploadService.getImageUrl(uploadedFile.id);
        updateData.main_image_id = uploadedFile.id;
      }
      updateData.is_published = job.is_published;

      await jobService.updateOffer(job.id, updateData);
      setSuccess(getText('Offre mise a jour avec succes !', 'Vita ny fanovana ny asa!'));
      toast.success(getText('Offre mise a jour', 'Vita ny fanovana'));
      setTimeout(() => router.push(`/dashboard/jobs/${job.id}`), 1500);
    } catch (err) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMsg = errorObj.response?.data?.message || errorObj.message || getText('Erreur lors de la mise a jour', 'Nisy hadisoana');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    const config: Record<JobStatus, { fr: string; mg: string; className: string; icon: React.ElementType }> = {
      [JobStatus.PUBLISHED]: { fr: 'Publiee', mg: 'Navoaka', className: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      [JobStatus.DRAFT]: { fr: 'Brouillon', mg: 'Volavola', className: 'bg-gray-100 text-gray-600 border-gray-200', icon: FileText },
      [JobStatus.CLOSED]: { fr: 'Fermee', mg: 'Nakatona', className: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
      [JobStatus.EXPIRED]: { fr: 'Expiree', mg: 'Lany daty', className: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock },
      [JobStatus.ARCHIVED]: { fr: 'Archivee', mg: 'Voatahiry', className: 'bg-purple-100 text-purple-700 border-purple-200', icon: ArchiveIcon }
    };
    const badge = config[status];
    if (!badge) return <span className="px-2 py-1 text-xs rounded-full bg-gray-100">{status}</span>;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border ${badge.className}`}>
        <Icon className="w-3 h-3" />
        {language === 'fr' ? badge.fr : badge.mg}
      </span>
    );
  };

  const imageUrl = uploadedFile ? uploadService.getImageUrl(uploadedFile.id) : null;

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

  if (error && !job) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{getText('Offre non trouvee', 'Tsy hita ny asa')}</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
          {getText('Retour aux offres', 'Hiverina any amin\'ny asa')}
        </Link>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* En-tete */}
      <div>
        <Link href={`/dashboard/jobs/${jobId}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition mb-3">
          <ArrowLeft className="w-4 h-4" /> {getText('Retour au detail', 'Hiverina any amin\'ny antsipirihany')}
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
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
            {getStatusBadge(job.status)}
            {isSuperAdmin && (
              <span className="px-2 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs rounded-full shadow-sm">
                Super Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-5 py-2.5 text-sm font-medium transition-all rounded-t-lg flex items-center gap-2 ${
            activeTab === 'general' 
              ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
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
              ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
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
              ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Globe className="w-4 h-4" />
          {getText('Publication', 'Famoahana')}
        </button>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          
          {/* Upload Image */}
          <div className="border-b border-gray-200 pb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getText('Image de couverture', 'Sary fonony')}
              <span className="text-xs text-gray-400 ml-2">
                {getText('(Format recommande 1200x630px)', '(Endrika atolotra 1200x630px)')}
              </span>
            </label>
            
            {imageUrl ? (
              <div className="relative">
                <div className="relative w-full h-56 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt="Apercu" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Erreur chargement image:', imageUrl);
                      e.currentTarget.src = '/images/placeholder-job.jpg';
                    }}
                  />
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.open(imageUrl, '_blank')}
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
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-3" />
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 transition">
                        <Upload className="w-8 h-8 text-blue-500" />
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
          
          {/* Onglet General */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <FormSection title={getText('Informations generales', 'Fampahalalana ankapobeny')} icon={FileText}>
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Ex: Mpanandrindra tetikasa"
                      />
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection title={getText('Informations entreprise', 'Fampahalalana orinasa')} icon={Building}>
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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Ex: Y-Mad Madagascar"
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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Antananarivo"
                      />
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection title={getText('Details du contrat', 'Antsipirihan\'ny fifanarahana')} icon={Briefcase}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {getText('Type de contrat', 'Karazana fifanarahana')}
                    </label>
                    <select
                      name="contract_type"
                      value={job.contract_type || ContractType.CDI}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
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

          {/* Onglet Description */}
          {activeTab === 'description' && (
            <div className="space-y-6">
              <FormSection title={getText('Description du poste (francais)', 'Famaritana ny asa (frantsay)')} icon={FileText}>
                <div>
                  <p className="text-sm text-gray-500 mb-3">
                    {getText('Utilisez les outils de mise en forme pour enrichir votre description', 'Ampiasao ny fitaovana fanoratana mba hanatsarana ny famaritanao')}
                  </p>
                  <RichTextEditor
                    value={job.description_fr}
                    onChange={(value) => {
                      if (job) setJob({ ...job, description_fr: value });
                    }}
                    placeholder={getText('Description detaillee du poste...', 'Famaritana feno momba ny asa...')}
                    language={language}
                    minHeight="400px"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    {getText('Minimum 20 caracteres. Utilisez les outils de formatage (gras, italique, listes, etc.)', 'Litera 20 farafahakeliny. Ampiasao ny fitaovana fanoratana (maitso, lisitra, sns)')}
                  </p>
                </div>
              </FormSection>

              <FormSection title={getText('Description du poste (malagasy)', 'Famaritana ny asa (malagasy)')} icon={Globe}>
                <div>
                  <p className="text-sm text-gray-500 mb-3">
                    {getText('Version en malgache (optionnelle mais recommandee)', 'Dikan-teny amin\'ny malagasy (tsy voatery fa asaina)')}
                  </p>
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

          {/* Onglet Publication */}
          {activeTab === 'publication' && (
            <div className="space-y-6">
              <FormSection title={getText('Statut de publication', 'Satan\'ny famoahana')} icon={Globe}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getText('Statut actuel', 'Sata ankehitriny')}
                    </label>
                    <select
                      name="status"
                      value={job.status || JobStatus.DRAFT}
                      onChange={handleChange}
                      className="w-full md:w-64 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      {STATUS_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {language === 'fr' ? option.label : option.labelMg}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-2">
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
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {getText('Rendre visible sur le site public', 'Ataovy hita eo amin\'ny tranokala')}
                      </span>
                    </label>
                  </div>
                </div>
              </FormSection>

              <FormSection title={getText('Apercu de l\'offre', 'Topi-mason\'ny asa')} icon={Eye}>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    {imageUrl ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={imageUrl} alt={job.title_fr} className="w-full h-full object-cover" />
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
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {job.contract_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {job.description_fr.substring(0, 150)}...
                    </p>
                  </div>
                </div>
              </FormSection>
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="sticky bottom-0 flex justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <Link
            href={`/dashboard/jobs/${jobId}`}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-medium"
          >
            <X className="w-4 h-4" /> {getText('Annuler', 'Aoka')}
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm font-medium"
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