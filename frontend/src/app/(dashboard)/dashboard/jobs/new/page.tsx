// frontend/src/app/(dashboard)/dashboard/jobs/new/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { jobService, ContractType } from '@/services/job.service';
import { uploadService, DatabaseImage } from '@/services/upload.service';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { 
  ArrowLeft, Save, Briefcase, MapPin, Building, Calendar, 
  FileText, X, Loader2, AlertCircle, CheckCircle,
  Upload, Eye, Trash2, Globe, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const CONTRACT_TYPES = [
  { value: ContractType.CDI, labelFr: 'CDI', labelMg: 'CDI' },
  { value: ContractType.CDD, labelFr: 'CDD', labelMg: 'CDD' },
  { value: ContractType.STAGE, labelFr: 'Stage', labelMg: 'Fiofanana' },
  { value: ContractType.FREELANCE, labelFr: 'Freelance', labelMg: 'Freelance' },
  { value: ContractType.ALTERNANCE, labelFr: 'Alternance', labelMg: 'Fifanakalozana' },
  { value: ContractType.TEMPORARY, labelFr: 'Temporaire', labelMg: 'Vonjimaika' },
];

// Fonctions dates
const getDateInDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const isDateExpired = (dateString: string): boolean => {
  if (!dateString) return false;
  const today = new Date();
  const deadline = new Date(dateString);
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  return deadline < today;
};

// Composant principal
export default function NewJobPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<DatabaseImage | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    title_fr: '',
    title_mg: '',
    description_fr: '',
    description_mg: '',
    company: 'Y-Mad Madagascar',
    location: 'Antananarivo',
    contract_type: ContractType.CDI,
    deadline: getDateInDays(30),
    is_published: false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin';

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title_fr.trim()) {
      errors.title_fr = getText('Le titre francais est requis', 'Ilaina ny lohateny frantsay');
    } else if (formData.title_fr.length < 3) {
      errors.title_fr = getText('Le titre doit contenir au moins 3 caracteres', 'Ny lohateny dia tsy maintsy misy litera 3');
    }
    
    if (!formData.description_fr.trim()) {
      errors.description_fr = getText('La description francaise est requise', 'Ilaina ny famaritana frantsay');
    } else if (formData.description_fr.length < 20) {
      errors.description_fr = getText('La description doit contenir au moins 20 caracteres', 'Ny famaritana dia tsy maintsy misy litera 20');
    }
    
    if (!formData.company.trim()) {
      errors.company = getText('Le nom de l\'entreprise est requis', 'Ilaina ny anaran\'ny orinasa');
    }
    
    if (formData.deadline && isDateExpired(formData.deadline)) {
      errors.deadline = getText('La date limite doit etre dans le futur', 'Ny daty farany dia tsy maintsy ho avy');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, getText]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error(getText('Format non supporte', 'Tsy tohana ny format'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(getText('Image trop grande (max 5 Mo)', 'Lehibe loatra ny sary'));
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadedImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error(getText('Veuillez corriger les erreurs', 'Azafady, ahitsio ny hadisoana'));
      return;
    }
    
    setLoading(true);
    setUploadingImage(!!imageFile);
    
    try {
      // 1. Upload de l'image si presente
      let imageUrl = null;
      let imageId = null;
      
      if (imageFile) {
        const image = await uploadService.uploadImage(imageFile, 'job', undefined, true);
        imageUrl = image.url;
        imageId = image.id;
        setUploadedImage(image);
      }
      
      // 2. Creation de l'offre
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

      const result = await jobService.createOffer(jobData);
      
      // 3. Si l'offre a ete creee avec une image, mettre a jour la reference
      if (imageId && result.id) {
        await jobService.updateOffer(result.id, { image_url: imageUrl || undefined });
      }
      
      toast.success(result.is_published
        ? getText('Offre d\'emploi publiee avec succes !', 'Nahomana ny famoahana toerana hiasana !')
        : getText('Brouillon sauvegarde avec succes !', 'Nahomana ny fitehirizana vonjimaika !'));
      
      router.push('/dashboard/jobs');
    } catch (err) {
      console.error('Erreur:', err);
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(errorObj.response?.data?.message || errorObj.message || getText('Erreur lors de la creation', 'Nisy hadisoana'));
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({...prev, [field]: value}));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !hasEditRights) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">{getText('Acces non autorise', 'Tsy manana alalana')}</h1>
          <Link href="/dashboard/jobs" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline">
            {getText('Retour aux offres', 'Hiverina any amin\'ny toerana')}
          </Link>
        </div>
      </div>
    );
  }

  const labels = {
    fr: {
      title: 'Nouvelle offre d\'emploi',
      subtitle: 'Creez une nouvelle opportunite pour les candidats',
      company: 'Nom de l\'entreprise',
      location: 'Lieu',
      contract: 'Type de contrat',
      deadline: 'Date limite de candidature',
      descriptionFr: 'Description (francais)',
      descriptionMg: 'Description (malagasy)',
      descriptionMin: 'Minimum 20 caracteres.',
      status: 'Statut de publication',
      draft: 'Brouillon (non visible)',
      publish: 'Publier immediatement',
      publishInfo: 'Les offres publiees sont visibles par les candidats.',
      cancel: 'Annuler',
      saveDraft: 'Sauvegarder le brouillon',
      publishOffer: 'Publier l\'offre',
      creating: 'Creation...'
    },
    mg: {
      title: 'Toerana hiasana vaovao',
      subtitle: 'Mamorona fahafahana vaovao',
      company: 'Anaran\'ny orinasa',
      location: 'Toerana',
      contract: 'Karazan\'asa',
      deadline: 'Daty farany',
      descriptionFr: 'Famaritana (frantsay)',
      descriptionMg: 'Famaritana (malagasy)',
      descriptionMin: 'Litera 20 farafahakeliny.',
      status: 'Sata famoahana',
      draft: 'Volavola (tsy hita)',
      publish: 'Ampivoahy avy hatrany',
      publishInfo: 'Ho hitan\'ny mpangataka ny toerana navoaka.',
      cancel: 'Aoka',
      saveDraft: 'Tehirizo volavola',
      publishOffer: 'Ampivoahy ny toerana',
      creating: 'Famoronana...'
    }
  };
  const t = labels[language === 'mg' ? 'mg' : 'fr'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/jobs" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
              <p className="text-gray-500 text-sm">{t.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          
          {/* Upload Image Section */}
          <div className="border-b border-gray-200 pb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getText('Image de couverture', 'Sary fonony')}
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <div className="relative w-full h-48 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                  <img src={imagePreview} alt="Apercu" className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-2 right-2">
                  <button
                    type="button"
                    onClick={removeImage}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
                    title={getText('Supprimer', 'Hamafa')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-gray-100 transition group">
                <div className="flex flex-col items-center justify-center p-4">
                  {uploadingImage ? (
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-2" />
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition mb-2" />
                      <p className="text-sm text-gray-500 text-center">{getText('Cliquez pour uploader', 'Tsindrio raha handefa')}</p>
                      <p className="text-xs text-gray-400 mt-1 text-center">
                        {getText('JPG, PNG, WEBP, GIF (max 5 Mo)', 'JPG, PNG, WEBP, GIF (farany 5 Mo)')}
                      </p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" 
                  onChange={handleImageSelect}
                  className="hidden" 
                  disabled={uploadingImage} 
                />
              </label>
            )}
          </div>

          {/* Titres bilingues */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('Titre du poste (francais)', 'Lohateny (frantsay)')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('Titre (malagasy)', 'Lohateny (malagasy)')}
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.title_mg}
                  onChange={(e) => handleInputChange('title_mg', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Ex: Mpanandrindra tetikasa"
                />
              </div>
            </div>
          </div>

          {/* Entreprise */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.company} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
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

          {/* Lieu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.location}
            </label>
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

          {/* Type contrat + Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.contract}
              </label>
              <select
                value={formData.contract_type}
                onChange={(e) => handleInputChange('contract_type', e.target.value as ContractType)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {CONTRACT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {language === 'fr' ? type.labelFr : type.labelMg}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.deadline}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  min={getDateInDays(1)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              {validationErrors.deadline && <p className="text-xs text-red-500 mt-1">{validationErrors.deadline}</p>}
            </div>
          </div>

          {/* Description FR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.descriptionFr} <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={formData.description_fr}
              onChange={(value) => handleInputChange('description_fr', value)}
              placeholder="Description detaillee du poste..."
              language={language}
              minHeight="300px"
            />
            {validationErrors.description_fr && <p className="text-xs text-red-500 mt-1">{validationErrors.description_fr}</p>}
            <p className="text-xs text-gray-400 mt-2">{t.descriptionMin}</p>
          </div>

          {/* Description MG */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.descriptionMg}
            </label>
            <RichTextEditor
              value={formData.description_mg}
              onChange={(value) => handleInputChange('description_mg', value)}
              placeholder="Famaritana amin'ny malagasy..."
              language={language}
              minHeight="200px"
            />
          </div>

          {/* Publication */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t.status}
            </label>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!formData.is_published}
                  onChange={() => handleInputChange('is_published', false)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {t.draft}
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
                  <Globe className="w-3.5 h-3.5 text-green-600" /> {t.publish}
                </span>
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-3">{t.publishInfo}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <Link href="/dashboard/jobs" className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-medium">
            <X className="w-4 h-4" /> {t.cancel}
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.creating}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {formData.is_published ? t.publishOffer : t.saveDraft}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}