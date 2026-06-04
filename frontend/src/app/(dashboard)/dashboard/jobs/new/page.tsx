'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { jobService, ContractType } from '@/services/job.service';
import { uploadService } from '@/services/upload.service';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { 
  ArrowLeft, Save, Briefcase, MapPin, Building, Calendar, 
  FileText, X, Loader2, AlertCircle, CheckCircle,
  Upload, Eye, Trash2, Globe, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: ContractType.CDI, label: 'CDI' },
  { value: ContractType.CDD, label: 'CDD' },
  { value: ContractType.STAGE, label: 'Stage' },
  { value: ContractType.FREELANCE, label: 'Freelance' },
  { value: ContractType.ALTERNANCE, label: 'Alternance' },
  { value: ContractType.TEMPORARY, label: 'Temporaire' },
];

// ============================================================
// FONCTIONS UTILITAIRES POUR LES DATES
// ============================================================

const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDateInDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMaxDate = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const getDaysRemaining = (dateString: string): number => {
  if (!dateString) return 0;
  const today = new Date();
  const deadline = new Date(dateString);
  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const isDateExpired = (dateString: string): boolean => {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
};

const isDateNear = (dateString: string): boolean => {
  if (!dateString) return false;
  const daysRemaining = getDaysRemaining(dateString);
  return daysRemaining > 0 && daysRemaining <= 7;
};

// ============================================================
// COMPOSANT D'UPLOAD D'IMAGE
// ============================================================

function ImageUploadSection({ 
  onImageUpload, 
  currentImageUrl 
}: { 
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
    <div className="border-b border-gray-200 pb-6">
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
// COMPOSANT DATE PICKER SIMPLIFIÉ (SANS MENU DÉROULANT)
// ============================================================

function DatePickerField({ 
  value, 
  onChange, 
  error,
  label
}: { 
  value: string; 
  onChange: (value: string) => void; 
  error?: string;
  label: string;
}) {
  const getStatusIcon = () => {
    if (!value) return null;
    if (isDateExpired(value)) {
      return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
    }
    if (isDateNear(value)) {
      return <Clock className="w-3.5 h-3.5 text-orange-500" />;
    }
    return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
  };

  const getStatusText = () => {
    if (!value) return null;
    if (isDateExpired(value)) {
      return <span className="text-red-500">Date depassee</span>;
    }
    if (isDateNear(value)) {
      const days = getDaysRemaining(value);
      return <span className="text-orange-500">Plus que {days} jour(s)</span>;
    }
    const days = getDaysRemaining(value);
    return <span className="text-green-500">{days} jours restants</span>;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={getTodayDate()}
          max={getMaxDate()}
          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      </div>
      
      {/* Suggestions rapides sous le champ (sans menu déroulant) */}
      <div className="flex flex-wrap gap-2 mt-2">
        <button
          type="button"
          onClick={() => onChange(getDateInDays(7))}
          className="text-xs px-2 py-1 bg-gray-100 rounded-full hover:bg-blue-100 hover:text-blue-600 transition"
        >
          +7 jours
        </button>
        <button
          type="button"
          onClick={() => onChange(getDateInDays(14))}
          className="text-xs px-2 py-1 bg-gray-100 rounded-full hover:bg-blue-100 hover:text-blue-600 transition"
        >
          +14 jours
        </button>
        <button
          type="button"
          onClick={() => onChange(getDateInDays(30))}
          className="text-xs px-2 py-1 bg-gray-100 rounded-full hover:bg-blue-100 hover:text-blue-600 transition"
        >
          +1 mois
        </button>
        <button
          type="button"
          onClick={() => onChange(getDateInDays(60))}
          className="text-xs px-2 py-1 bg-gray-100 rounded-full hover:bg-blue-100 hover:text-blue-600 transition"
        >
          +2 mois
        </button>
        <button
          type="button"
          onClick={() => onChange(getDateInDays(90))}
          className="text-xs px-2 py-1 bg-gray-100 rounded-full hover:bg-blue-100 hover:text-blue-600 transition"
        >
          +3 mois
        </button>
      </div>
      
      {/* Statut de la date */}
      {value && (
        <div className="mt-2 text-xs flex items-center gap-1.5">
          {getStatusIcon()}
          {getStatusText()}
          <span className="text-gray-400 ml-1">
            ({formatDateDisplay(value)})
          </span>
        </div>
      )}
      
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function NewJobPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    title_fr: '',
    title_mg: '',
    description_fr: '',
    description_mg: '',
    company: '',
    location: '',
    contract_type: ContractType.CDI,
    deadline: '',
    is_published: false,
  });

  const t = (fr: string, mg: string) => language === 'fr' ? fr : mg;
  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin';

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title_fr.trim()) {
      errors.title_fr = 'Le titre francais est requis';
    } else if (formData.title_fr.length < 3) {
      errors.title_fr = 'Le titre doit contenir au moins 3 caracteres';
    }
    
    if (!formData.description_fr.trim()) {
      errors.description_fr = 'La description francaise est requise';
    } else if (formData.description_fr.length < 20) {
      errors.description_fr = 'La description doit contenir au moins 20 caracteres';
    }
    
    if (!formData.company.trim()) {
      errors.company = 'Le nom de l\'entreprise est requis';
    }
    
    if (formData.deadline && isDateExpired(formData.deadline)) {
      errors.deadline = 'La date limite doit etre dans le futur';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  if (!isAuthenticated || !hasEditRights) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Acces non autorise</h1>
          <p className="text-gray-500 mt-2">Vous n'avez pas les droits pour creer une offre d'emploi.</p>
          <Link href="/dashboard/jobs" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline">
            Retour aux offres
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    
    setLoading(true);
    
    try {
      const jobData = {
        title_fr: formData.title_fr.trim(),
        title_mg: formData.title_mg?.trim() || undefined,
        description_fr: formData.description_fr.trim(),
        description_mg: formData.description_mg?.trim() || undefined,
        company: formData.company.trim(),
        location: formData.location?.trim() || undefined,
        contract_type: formData.contract_type,
        deadline: formData.deadline || undefined,
        is_published: formData.is_published,
        image_url: imageUrl || undefined,
      };

      await jobService.createOffer(jobData);
      toast.success('Offre d\'emploi creee avec succes !');
      router.push('/dashboard/jobs');
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la creation');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({...formData, [field]: value});
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/jobs" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Nouvelle offre d'emploi</h1>
              <p className="text-gray-500 text-sm">Creez une nouvelle opportunite pour les candidats</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          
          <ImageUploadSection onImageUpload={setImageUrl} currentImageUrl={imageUrl} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du poste (francais) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title_fr}
                onChange={(e) => handleInputChange('title_fr', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  validationErrors.title_fr ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Coordinateur de projet"
              />
              {validationErrors.title_fr && <p className="text-xs text-red-500 mt-1">{validationErrors.title_fr}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre (malagasy)</label>
              <input
                type="text"
                value={formData.title_mg}
                onChange={(e) => handleInputChange('title_mg', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Ex: Mpanandrindra tetikasa"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'entreprise <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  validationErrors.company ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Y-Mad Madagascar"
              />
            </div>
            {validationErrors.company && <p className="text-xs text-red-500 mt-1">{validationErrors.company}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Ex: Antananarivo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
              <select
                value={formData.contract_type}
                onChange={(e) => handleInputChange('contract_type', e.target.value as ContractType)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {CONTRACT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <DatePickerField
              value={formData.deadline}
              onChange={(value) => handleInputChange('deadline', value)}
              error={validationErrors.deadline}
              label="Date limite de candidature"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (francais) <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={formData.description_fr}
              onChange={(value) => handleInputChange('description_fr', value)}
              placeholder="Description detaillee du poste..."
              language={language}
              minHeight="300px"
            />
            {validationErrors.description_fr && <p className="text-xs text-red-500 mt-1">{validationErrors.description_fr}</p>}
            <p className="text-xs text-gray-400 mt-2">
              Minimum 20 caracteres. Utilisez les outils de mise en forme (gras, italique, listes, couleurs...)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (malagasy)</label>
            <RichTextEditor
              value={formData.description_mg}
              onChange={(value) => handleInputChange('description_mg', value)}
              placeholder="Famaritana amin'ny malagasy..."
              language={language}
              minHeight="200px"
            />
          </div>

          <div className="pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut de publication</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!formData.is_published}
                  onChange={() => handleInputChange('is_published', false)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Brouillon (non visible)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.is_published}
                  onChange={() => handleInputChange('is_published', true)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Publier directement
                </span>
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Les offres publiees sont visibles par les candidats sur le site public.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <Link
            href="/dashboard/jobs"
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-medium"
          >
            <X className="w-4 h-4" /> Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creation...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {formData.is_published ? 'Publier l\'offre' : 'Sauvegarder le brouillon'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}