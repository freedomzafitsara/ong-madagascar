'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { jobService, JobOffer, ContractType, JobStatus } from '@/services/job.service';
import { uploadService } from '@/services/upload.service';
import { 
  ArrowLeft, Save, Loader2, AlertCircle, CheckCircle,
  Building, MapPin, Briefcase, Calendar,
  FileText, Users, Eye, XCircle, Clock, Star, X,
  Upload, Trash2, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// CONFIGURATION
// ============================================================

const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: ContractType.CDI, label: 'CDI' },
  { value: ContractType.CDD, label: 'CDD' },
  { value: ContractType.STAGE, label: 'Stage' },
  { value: ContractType.FREELANCE, label: 'Freelance' },
  { value: ContractType.ALTERNANCE, label: 'Alternance' },
  { value: ContractType.TEMPORARY, label: 'Temporaire' },
];

const STATUS_OPTIONS = [
  { value: JobStatus.DRAFT, label: 'Brouillon' },
  { value: JobStatus.PUBLISHED, label: 'Publié' },
  { value: JobStatus.CLOSED, label: 'Fermé' },
  { value: JobStatus.EXPIRED, label: 'Expiré' },
  { value: JobStatus.ARCHIVED, label: 'Archivé' },
];

// ============================================================
// COMPOSANT D'UPLOAD D'IMAGE
// ============================================================

function ImageUploadSection({ onImageUpload, currentImageUrl }: { 
  onImageUpload: (url: string) => void; 
  currentImageUrl: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);
    
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Format non supporte (JPG, PNG, WEBP, GIF)');
      setPreviewUrl(currentImageUrl);
      setUploading(false);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image trop grande (max 5 Mo)');
      setPreviewUrl(currentImageUrl);
      setUploading(false);
      return;
    }

    try {
      const url = await uploadService.uploadImage(file);
      setPreviewUrl(url);
      onImageUpload(url);
      toast.success('Image uploadee avec succes');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload');
      setPreviewUrl(currentImageUrl);
      toast.error(err.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onImageUpload('');
    toast.success('Image supprimee');
  };

  return (
    <div className="border-b border-gray-200 pb-6 mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Image de couverture
      </label>
      
      {previewUrl ? (
        <div className="relative">
          <div className="w-full h-48 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden relative">
            <Image src={previewUrl} alt="Apercu" fill className="object-cover" />
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => window.open(previewUrl, '_blank')}
              className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition shadow-md"
              title="Voir l'image"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
              title="Supprimer l'image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-gray-100 transition group">
          <div className="flex flex-col items-center justify-center">
            {uploading ? (
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-2" />
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition mb-2" />
                <p className="text-sm text-gray-500">Cliquez pour uploader une image</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP, GIF (max 5 Mo)</p>
              </>
            )}
          </div>
          <input 
            type="file" 
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" 
            onChange={handleFileSelect} 
            className="hidden" 
            disabled={uploading} 
          />
        </label>
      )}
      
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin';
  const isSuperAdmin = user?.role === 'super_admin';

  const t = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  useEffect(() => {
    if (!isAuthenticated || !hasEditRights) {
      router.push('/dashboard/jobs');
      return;
    }
    fetchJob();
  }, [params.id, isAuthenticated]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const response = await jobService.getOfferById(params.id as string);
      setJob(response);
      setImageUrl(response.image_url || '');
      setError('');
    } catch (error: any) {
      console.error('Erreur:', error);
      setError(error.message || t('Offre non trouvée', 'Tsy hita ny asa'));
      toast.error(error.message || t('Erreur de chargement', 'Nisy hadisoana'));
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        title_fr: job.title_fr,
        title_mg: job.title_mg,
        description_fr: job.description_fr,
        description_mg: job.description_mg,
        company: job.company,
        location: job.location,
        contract_type: job.contract_type,
        deadline: job.deadline,
        is_published: job.is_published,
        image_url: imageUrl || undefined,
      };

      await jobService.updateOffer(job.id, updateData);
      
      setSuccess(t('Offre mise à jour avec succès !', 'Vita ny fanovana ny asa!'));
      toast.success(t('Offre mise à jour', 'Vita ny fanovana'));
      setTimeout(() => {
        router.push(`/dashboard/jobs/${job.id}`);
      }, 1500);
    } catch (error: any) {
      console.error('Erreur:', error);
      setError(error.response?.data?.message || t('Erreur lors de la mise à jour', 'Nisy hadisoana tamin\'ny fanovana'));
      toast.error(error.response?.data?.message || t('Erreur', 'Nisy hadisoana'));
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    const config: Record<JobStatus, { fr: string; mg: string; className: string }> = {
      [JobStatus.PUBLISHED]: { fr: 'Publiée', mg: 'Navoaka', className: 'bg-green-100 text-green-700' },
      [JobStatus.DRAFT]: { fr: 'Brouillon', mg: 'Volavola', className: 'bg-gray-100 text-gray-600' },
      [JobStatus.CLOSED]: { fr: 'Fermée', mg: 'Nakatona', className: 'bg-red-100 text-red-700' },
      [JobStatus.EXPIRED]: { fr: 'Expirée', mg: 'Lany daty', className: 'bg-orange-100 text-orange-700' },
      [JobStatus.ARCHIVED]: { fr: 'Archivée', mg: 'Voatahiry', className: 'bg-purple-100 text-purple-700' }
    };
    const badge = config[status];
    if (!badge) return <span className="px-2 py-1 text-xs rounded-full bg-gray-100">{status}</span>;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${badge.className}`}>
        {language === 'fr' ? badge.fr : badge.mg}
      </span>
    );
  };

  const getContractLabel = (type?: ContractType): string => {
    const labels: Record<ContractType, string> = {
      [ContractType.CDI]: 'CDI',
      [ContractType.CDD]: 'CDD',
      [ContractType.STAGE]: t('Stage', 'Fiofanana'),
      [ContractType.FREELANCE]: 'Freelance',
      [ContractType.ALTERNANCE]: t('Alternance', 'Fiofanana mifandimby'),
      [ContractType.TEMPORARY]: t('Temporaire', 'Vonjimaika')
    };
    return type ? labels[type] : '';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="text-gray-500 font-medium">{t('Chargement...', 'Mampiditra...')}</p>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('Offre non trouvée', 'Tsy hita ny asa')}</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
          {t('Retour aux offres', 'Hiverina any amin\'ny asa')}
        </Link>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div>
        <Link href={`/dashboard/jobs/${params.id}`} className="inline-flex items-center text-gray-500 hover:text-blue-600 transition mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> {t('Retour', 'Hiverina')}
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{t('Modifier l\'offre', 'Hanova ny asa')}</h1>
                <p className="text-gray-500 text-sm">{t('Modifiez les informations de l\'offre', 'Hanova ny fampahalalana momba ny asa')}</p>
              </div>
              {isSuperAdmin && (
                <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">Super Admin</span>
              )}
            </div>
          </div>
          <div>{getStatusBadge(job.status)}</div>
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

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          
          {/* Upload Image */}
          <ImageUploadSection onImageUpload={setImageUrl} currentImageUrl={imageUrl} />
          
          {/* Section Informations générales */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> {t('Informations générales', 'Fampahalalana ankapobeny')}
            </h2>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Titre du poste (français)', 'Lohateny (frantsay)')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title_fr"
                  required
                  value={job.title_fr || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Ex: Coordinateur de projet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Titre (malagasy)', 'Lohateny (malagasy)')}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Description (français)', 'Famaritana (frantsay)')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description_fr"
                  rows={5}
                  required
                  value={job.description_fr || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
                  placeholder="Description detaillee du poste..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Description (malagasy)', 'Famaritana (malagasy)')}
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    name="description_mg"
                    rows={4}
                    value={job.description_mg || ''}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
                    placeholder="Famaritana amin'ny malagasy..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section Entreprise */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" /> {t('Entreprise', 'Orinasa')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Nom de l\'entreprise', 'Anaran\'ny orinasa')} <span className="text-red-500">*</span>
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
                  {t('Lieu', 'Toerana')}
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
          </div>

          {/* Section Contrat */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" /> {t('Contrat', 'Fifanarahana')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Type de contrat', 'Karazana fifanarahana')}
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
                  {t('Date limite', 'Farany')}
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
              </div>
            </div>
          </div>

          {/* Section Statut */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" /> {t('Statut', 'Sata')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Statut de publication', 'Satan\'ny famoahana')}
                </label>
                <select
                  name="status"
                  value={job.status || JobStatus.DRAFT}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center pt-6">
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
                    {t('Publier directement', 'Avoaka avy hatrany')}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <Link
            href={`/dashboard/jobs/${params.id}`}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-medium"
          >
            <X className="w-4 h-4" /> {t('Annuler', 'Aoka')}
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm font-medium"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('Enregistrement...', 'Fanovana...')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t('Enregistrer', 'Tehirizo')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}