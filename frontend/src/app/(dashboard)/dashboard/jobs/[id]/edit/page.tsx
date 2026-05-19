'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { jobsApi, uploadApi } from '@/lib/api';
import { 
  ArrowLeft, Save, Loader2, AlertCircle, CheckCircle,
  Building, MapPin, Briefcase, DollarSign, Calendar,
  FileText, Users, Eye, XCircle, Clock, Star, X,
  Upload, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

// Types compatibles avec le backend
interface JobOffer {
  id: string;
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  company_name: string;
  image_url?: string;
  location?: string;
  region?: string;
  job_type: string;
  salary_range?: string;
  sector?: string;
  requirements?: string;
  requirements_mg?: string;
  benefits?: string;
  deadline?: string;
  status: 'draft' | 'published' | 'closed' | 'expired';
  applications_count: number;
  is_featured: boolean;
  created_at: string;
}

// Types de contrat
const CONTRACT_TYPES = [
  { value: 'cdi', label: 'CDI' },
  { value: 'cdd', label: 'CDD' },
  { value: 'stage', label: 'Stage' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'benevolat', label: 'Bénévolat' },
];

// Statuts
const STATUS_OPTIONS = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'published', label: 'Publié' },
  { value: 'closed', label: 'Fermé' },
  { value: 'expired', label: 'Expiré' },
];

// Composant d'upload d'image intégré
function ImageUploadSection({ onImageUpload, currentImageUrl }: { onImageUpload: (url: string) => void; currentImageUrl: string }) {
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
      setError('Format non supporté (JPG, PNG, WEBP, GIF)');
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
      const url = await uploadApi.uploadImage(file);
      setPreviewUrl(url);
      onImageUpload(url);
      toast.success('Image uploadée avec succès');
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
    toast.success('Image supprimée');
  };

  return (
    <div className="border-b border-gray-200 pb-6 mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Image de couverture
      </label>
      
      {previewUrl ? (
        <div className="relative">
          <div className="w-full h-48 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
            <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
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
          <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" onChange={handleFileSelect} className="hidden" disabled={uploading} />
        </label>
      )}
      
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff' || user?.role === 'partner';
  const isSuperAdmin = user?.role === 'super_admin';

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
      const response = await jobsApi.getOne(params.id as string);
      setJob(response);
      setImageUrl(response.image_url || '');
      setError('');
    } catch (error: any) {
      console.error('Erreur:', error);
      setError(error.message || 'Offre non trouvée');
      toast.error(error.message || 'Erreur de chargement');
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
        title: job.title,
        title_mg: job.title_mg,
        description: job.description,
        description_mg: job.description_mg,
        company_name: job.company_name,
        image_url: imageUrl || undefined,
        location: job.location,
        region: job.region,
        job_type: job.job_type,
        sector: job.sector,
        salary_range: job.salary_range,
        requirements: job.requirements,
        requirements_mg: job.requirements_mg,
        benefits: job.benefits,
        deadline: job.deadline,
        status: job.status,
        is_featured: job.is_featured,
      };

      await jobsApi.update(job.id, updateData);
      
      setSuccess('Offre mise à jour avec succès !');
      toast.success('Offre mise à jour avec succès !');
      setTimeout(() => {
        router.push(`/dashboard/jobs/${job.id}`);
      }, 1500);
    } catch (error: any) {
      console.error('Erreur:', error);
      setError(error.message || 'Erreur lors de la mise à jour');
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" /> Publiée
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
            <Clock className="w-3 h-3" /> Brouillon
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" /> Fermée
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
            <Clock className="w-3 h-3" /> Expirée
          </span>
        );
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{status}</span>;
    }
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

  if (error && !job) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Offre non trouvée</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
          Retour aux offres
        </Link>
      </div>
    );
  }

  if (!job) return null;

  const getText = (frText: string, mgText: string) => {
    return language === 'fr' ? frText : mgText;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div>
        <Link href={`/dashboard/jobs/${params.id}`} className="inline-flex items-center text-gray-500 hover:text-blue-600 transition mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Modifier l'offre</h1>
                <p className="text-gray-500 text-sm">Modifiez les informations de l'offre d'emploi</p>
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
              <FileText className="w-5 h-5 text-blue-600" /> Informations générales
            </h2>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre du poste (français) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={job.title || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Ex: Coordinateur de projet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre (malagasy)</label>
                <input
                  type="text"
                  name="title_mg"
                  value={job.title_mg || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Ex: Mpanandrindra tetikasa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (français) <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows={5}
                  required
                  value={job.description || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
                  placeholder="Description détaillée du poste..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (malagasy)</label>
                <textarea
                  name="description_mg"
                  rows={4}
                  value={job.description_mg || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
                  placeholder="Famaritana ny asa amin'ny malagasy..."
                />
              </div>
            </div>
          </div>

          {/* Section Entreprise */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" /> Entreprise
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'entreprise <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company_name"
                  required
                  value={job.company_name || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Ex: Y-Mad Madagascar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
                <input
                  type="text"
                  name="sector"
                  value={job.sector || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Ex: Technologie, Agriculture"
                />
              </div>
            </div>
          </div>

          {/* Section Contrat */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" /> Contrat
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
                <select
                  name="job_type"
                  value={job.job_type || 'cdi'}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  {CONTRACT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salaire</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="salary_range"
                    value={job.salary_range || ''}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Ex: 800 000 - 1 200 000 Ar"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section Prérequis */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> Prérequis
            </h2>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prérequis (français)</label>
                <textarea
                  name="requirements"
                  rows={4}
                  value={job.requirements || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
                  placeholder="Liste des prérequis..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prérequis (malagasy)</label>
                <textarea
                  name="requirements_mg"
                  rows={3}
                  value={job.requirements_mg || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
                  placeholder="Fepetra ilaina amin'ny malagasy..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avantages</label>
                <textarea
                  name="benefits"
                  rows={2}
                  value={job.benefits || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
                  placeholder="Ex: Mutuelle, télétravail, formation continue..."
                />
              </div>
            </div>
          </div>

          {/* Section Dates et Statut */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" /> Dates et Statut
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date limite de candidature</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  name="status"
                  value={job.status || 'draft'}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section Mise en avant */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                checked={job.is_featured || false}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                Mettre en avant (offre vedette)
              </span>
            </label>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <Link
            href={`/dashboard/jobs/${params.id}`}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-medium"
          >
            <X className="w-4 h-4" /> Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm font-medium"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}