// frontend/src/app/(dashboard)/dashboard/jobs/new/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { jobService, ContractType } from '@/services/job.service';
import { uploadService } from '@/services/upload.service';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { 
  ArrowLeft, Save, Briefcase, MapPin, Building, Calendar, 
  FileText, X, Loader2, AlertCircle, CheckCircle,
  Upload, Eye, Trash2, Globe, Clock, Image as ImageIcon,
  Info, Check, AlertTriangle, Sparkles, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

// ============================================================
// TYPES
// ============================================================

interface UploadedFile {
  id: string;
  url: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  format: string;
  type: string;
  entityId: string | null;
  createdAt: string;
}

interface FormErrors {
  title_fr?: string;
  title_mg?: string;
  description_fr?: string;
  description_mg?: string;
  company?: string;
  location?: string;
  deadline?: string;
  contract_type?: string;
  image?: string;
}

// ============================================================
// CONSTANTES
// ============================================================

const CONTRACT_TYPES = [
  { value: ContractType.CDI, labelFr: 'CDI', labelMg: 'CDI' },
  { value: ContractType.CDD, labelFr: 'CDD', labelMg: 'CDD' },
  { value: ContractType.STAGE, labelFr: 'Stage', labelMg: 'Fiofanana' },
  { value: ContractType.FREELANCE, labelFr: 'Freelance', labelMg: 'Freelance' },
  { value: ContractType.ALTERNANCE, labelFr: 'Alternance', labelMg: 'Fifanakalozana' },
  { value: ContractType.TEMPORARY, labelFr: 'Temporaire', labelMg: 'Vonjimaika' },
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 Mo
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

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

// ============================================================
// COMPOSANT DE PRÉVISUALISATION
// ============================================================

function PreviewCard({ title, company, location, contract, deadline, imagePreview }: {
  title: string;
  company: string;
  location: string;
  contract: string;
  deadline: string;
  imagePreview: string | null;
}) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="w-4 h-4 text-blue-700" />
        <h4 className="text-sm font-medium text-gray-700">Aperçu de l'offre</h4>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {imagePreview && (
          <div className="relative h-32 w-full bg-gray-100">
            <Image src={imagePreview} alt="Aperçu" fill className="object-cover" />
          </div>
        )}
        <div className="p-4">
          <h5 className="font-semibold text-gray-800">{title || 'Titre de l\'offre'}</h5>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Building className="w-3 h-3" /> {company || 'Entreprise'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {location || 'Lieu'}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> {contract || 'Contrat'}
            </span>
            {deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {new Date(deadline).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function NewJobPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  
  // ============================================================
  // ÉTATS
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [validationErrors, setValidationErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    title_fr: '',
    title_mg: '',
    description_fr: '',
    description_mg: '',
    company: 'Y-MaD Madagascar',
    location: 'Antananarivo',
    contract_type: ContractType.CDI,
    deadline: getDateInDays(30),
    is_published: false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin';

  // ============================================================
  // TRADUCTIONS
  // ============================================================

  const labels = useMemo(() => ({
    fr: {
      title: 'Nouvelle offre d\'emploi',
      subtitle: 'Créez une nouvelle opportunité pour les candidats',
      company: 'Nom de l\'entreprise',
      location: 'Lieu',
      contract: 'Type de contrat',
      deadline: 'Date limite de candidature',
      descriptionFr: 'Description (français)',
      descriptionMg: 'Description (malagasy)',
      descriptionMin: 'Minimum 20 caractères.',
      status: 'Statut de publication',
      draft: 'Brouillon (non visible)',
      publish: 'Publier immédiatement',
      publishInfo: 'Les offres publiées sont visibles par les candidats.',
      cancel: 'Annuler',
      saveDraft: 'Sauvegarder le brouillon',
      publishOffer: 'Publier l\'offre',
      creating: 'Création...',
      imageUpload: 'Image de couverture',
      clickToUpload: 'Cliquez pour uploader',
      imageFormats: 'JPG, PNG, WEBP, GIF (max 5 Mo)',
      removeImage: 'Supprimer l\'image',
      preview: 'Aperçu',
      required: 'Champ requis',
      minChars: 'Minimum {count} caractères',
      companyPlaceholder: 'Ex: Y-MaD',
      locationPlaceholder: 'Ex: Antananarivo',
      titleFrPlaceholder: 'Ex: Coordinateur de projet',
      titleMgPlaceholder: 'Ex: Mpanandrindra tetikasa',
      descFrPlaceholder: 'Description détaillée du poste...',
      descMgPlaceholder: 'Famaritana amin\'ny malagasy...',
      previewOffer: 'Aperçu de l\'offre',
      showPreview: 'Voir l\'aperçu',
      hidePreview: 'Masquer l\'aperçu',
      requiredFields: 'Champs obligatoires',
      optional: 'Optionnel',
    },
    mg: {
      title: 'Toerana hiasana vaovao',
      subtitle: 'Mamorona fahafahana vaovao ho an\'ny mpangataka',
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
      creating: 'Famoronana...',
      imageUpload: 'Sary fonony',
      clickToUpload: 'Tsindrio raha handefa',
      imageFormats: 'JPG, PNG, WEBP, GIF (farany 5 Mo)',
      removeImage: 'Hamafa ny sary',
      preview: 'Fijerena',
      required: 'Ilaina',
      minChars: 'Litera {count} farafahakeliny',
      companyPlaceholder: 'Ohatra: Y-MaD',
      locationPlaceholder: 'Ohatra: Antananarivo',
      titleFrPlaceholder: 'Ohatra: Mpanandrindra tetikasa',
      titleMgPlaceholder: 'Ohatra: Mpanandrindra tetikasa',
      descFrPlaceholder: 'Famaritana amin\'ny fiantsoana...',
      descMgPlaceholder: 'Famaritana amin\'ny malagasy...',
      previewOffer: 'Fijerena ny asa',
      showPreview: 'Jereo ny fijerena',
      hidePreview: 'Afenina ny fijerena',
      requiredFields: 'Zavatra ilaina',
      optional: 'Tsy voatery',
    }
  }), []);

  const currentLabels = labels[language as keyof typeof labels] || labels.fr;

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.title_fr.trim()) {
      errors.title_fr = currentLabels.required;
    } else if (formData.title_fr.length < 3) {
      errors.title_fr = currentLabels.minChars.replace('{count}', '3');
    }
    
    if (!formData.description_fr.trim()) {
      errors.description_fr = currentLabels.required;
    } else if (formData.description_fr.length < 20) {
      errors.description_fr = currentLabels.minChars.replace('{count}', '20');
    }
    
    if (!formData.company.trim()) {
      errors.company = currentLabels.required;
    }
    
    if (formData.deadline && isDateExpired(formData.deadline)) {
      errors.deadline = t('common.future_date') || 'La date doit être dans le futur';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, currentLabels, t]);

  // ============================================================
  // GESTIONNAIRES
  // ============================================================

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (validationErrors[field as keyof FormErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [validationErrors]);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      toast.error(t('common.invalid_format') || 'Format non supporté');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(t('common.file_too_large') || 'Image trop grande (max 5 Mo)');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setIsDirty(true);
  }, [t]);

  const removeImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setUploadedFile(null);
    setIsDirty(true);
  }, []);

  const togglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, []);

  // ============================================================
  // SOUMISSION
  // ============================================================

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error(t('common.fix_errors') || 'Veuillez corriger les erreurs');
      const firstError = Object.keys(validationErrors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`) as HTMLElement;
        if (element) element.focus();
      }
      return;
    }
    
    setLoading(true);
    setUploadingImage(!!imageFile);
    
    try {
      let imageUrl = null;
      let imageId = null;
      
      if (imageFile) {
        try {
          const result = await uploadService.uploadImage(imageFile, 'job');
          imageUrl = result.url || uploadService.getImageUrl(result.id);
          imageId = result.id;
          
          const uploadedFileData: UploadedFile = {
            id: result.id,
            url: result.url || '',
            fileName: (result as any).fileName || '',
            originalName: (result as any).originalName || '',
            fileSize: (result as any).fileSize || 0,
            format: (result as any).format || '',
            type: (result as any).type || 'job',
            entityId: (result as any).entityId || null,
            createdAt: (result as any).createdAt || new Date().toISOString(),
          };
          setUploadedFile(uploadedFileData);
        } catch (uploadError: any) {
          console.error('Erreur upload:', uploadError);
          toast.error(uploadError.message || t('common.upload_error') || 'Erreur lors de l\'upload');
          setLoading(false);
          setUploadingImage(false);
          return;
        }
      }
      
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
      
      if (imageId && result.id) {
        await jobService.updateOffer(result.id, { 
          image_url: imageUrl || undefined,
          main_image_id: imageId,
        });
      }
      
      toast.success(result.is_published
        ? t('jobs.publish_success') || 'Offre publiée avec succès !'
        : t('jobs.draft_saved') || 'Brouillon sauvegardé avec succès !');
      
      router.push('/dashboard/jobs');
    } catch (err) {
      console.error('Erreur:', err);
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(errorObj.response?.data?.message || errorObj.message || t('common.error') || 'Erreur lors de la création');
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  }, [formData, imageFile, validateForm, validationErrors, router, t]);

  // ============================================================
  // RENDU CONDITIONNEL
  // ============================================================

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
          <h1 className="text-2xl font-bold text-gray-800">{t('common.access_denied') || 'Accès non autorisé'}</h1>
          <Link href="/dashboard/jobs" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline">
            {t('common.back') || 'Retour aux offres'}
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDU PRINCIPAL
  // ============================================================

  const contractLabel = CONTRACT_TYPES.find(c => c.value === formData.contract_type);
  const contractDisplay = contractLabel ? (language === 'fr' ? contractLabel.labelFr : contractLabel.labelMg) : '';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      
      {/* ============================================================
      EN-TÊTE
      ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/jobs" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-800 rounded-xl flex items-center justify-center shadow-sm">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{currentLabels.title}</h1>
                <p className="text-gray-500 text-sm">{currentLabels.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bouton Aperçu */}
        <button
          type="button"
          onClick={togglePreview}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? currentLabels.hidePreview : currentLabels.showPreview}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ============================================================
        FORMULAIRE - 2/3 DE LA LARGEUR
        ============================================================ */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 space-y-6">
              
              {/* ============================================================
              SECTION IMAGE
              ============================================================ */}
              <div className="border-b border-gray-200 pb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentLabels.imageUpload} <span className="text-xs text-gray-400 font-normal">({currentLabels.optional})</span>
                </label>
                
                {imagePreview ? (
                  <div className="relative">
                    <div className="relative w-full h-48 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                      <Image 
                        src={imagePreview} 
                        alt={currentLabels.preview} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        type="button"
                        onClick={removeImage}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
                        title={currentLabels.removeImage}
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
                          <p className="text-sm text-gray-500 text-center">{currentLabels.clickToUpload}</p>
                          <p className="text-xs text-gray-400 mt-1 text-center">
                            {currentLabels.imageFormats}
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

              {/* ============================================================
              TITRES BILINGUES
              ============================================================ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentLabels.titleFrPlaceholder} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title_fr"
                    value={formData.title_fr}
                    onChange={(e) => handleInputChange('title_fr', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-800 outline-none transition ${
                      validationErrors.title_fr ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-800'
                    }`}
                    placeholder={currentLabels.titleFrPlaceholder}
                  />
                  {validationErrors.title_fr && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {validationErrors.title_fr}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentLabels.titleMgPlaceholder}
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="title_mg"
                      value={formData.title_mg}
                      onChange={(e) => handleInputChange('title_mg', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none transition focus:border-blue-800"
                      placeholder={currentLabels.titleMgPlaceholder}
                    />
                  </div>
                </div>
              </div>

              {/* ============================================================
              ENTREPRISE ET LIEU
              ============================================================ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentLabels.company} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-800 outline-none transition ${
                        validationErrors.company ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-800'
                      }`}
                      placeholder={currentLabels.companyPlaceholder}
                    />
                  </div>
                  {validationErrors.company && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {validationErrors.company}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentLabels.location}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none transition focus:border-blue-800"
                      placeholder={currentLabels.locationPlaceholder}
                    />
                  </div>
                </div>
              </div>

              {/* ============================================================
              TYPE CONTRAT ET DATE
              ============================================================ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentLabels.contract}
                  </label>
                  <select
                    name="contract_type"
                    value={formData.contract_type}
                    onChange={(e) => handleInputChange('contract_type', e.target.value as ContractType)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none focus:border-blue-800 bg-white transition"
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
                    {currentLabels.deadline}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={(e) => handleInputChange('deadline', e.target.value)}
                      min={getDateInDays(1)}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-800 outline-none transition ${
                        validationErrors.deadline ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-800'
                      }`}
                    />
                  </div>
                  {validationErrors.deadline && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {validationErrors.deadline}
                    </p>
                  )}
                </div>
              </div>

              {/* ============================================================
              DESCRIPTION FR
              ============================================================ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {currentLabels.descriptionFr} <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={formData.description_fr}
                  onChange={(value) => handleInputChange('description_fr', value)}
                  placeholder={currentLabels.descFrPlaceholder}
                  language={language}
                  minHeight="300px"
                />
                {validationErrors.description_fr && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {validationErrors.description_fr}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {currentLabels.descriptionMin}
                </p>
              </div>

              {/* ============================================================
              DESCRIPTION MG
              ============================================================ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {currentLabels.descriptionMg}
                </label>
                <RichTextEditor
                  value={formData.description_mg}
                  onChange={(value) => handleInputChange('description_mg', value)}
                  placeholder={currentLabels.descMgPlaceholder}
                  language={language}
                  minHeight="200px"
                />
              </div>

              {/* ============================================================
              STATUT DE PUBLICATION
              ============================================================ */}
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {currentLabels.status}
                </label>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!formData.is_published}
                      onChange={() => handleInputChange('is_published', false)}
                      className="w-4 h-4 text-blue-800 focus:ring-blue-800"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      {currentLabels.draft}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.is_published}
                      onChange={() => handleInputChange('is_published', true)}
                      className="w-4 h-4 text-blue-800 focus:ring-blue-800"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-blue-700" />
                      {currentLabels.publish}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-3 flex items-start gap-1">
                  <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  {currentLabels.publishInfo}
                </p>
              </div>
            </div>

            {/* ============================================================
            BOUTONS D'ACTION
            ============================================================ */}
            <div className="flex flex-wrap justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
              <Link 
                href="/dashboard/jobs" 
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-medium"
              >
                <X className="w-4 h-4" />
                {currentLabels.cancel}
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {currentLabels.creating}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {formData.is_published ? currentLabels.publishOffer : currentLabels.saveDraft}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ============================================================
        PANEL DE PRÉVISUALISATION - 1/3 DE LA LARGEUR
        ============================================================ */}
        <div className="lg:col-span-1">
          {showPreview && (
            <div className="sticky top-6">
              <PreviewCard
                title={formData.title_fr}
                company={formData.company}
                location={formData.location}
                contract={contractDisplay}
                deadline={formData.deadline}
                imagePreview={imagePreview}
              />
              
              {/* Résumé des champs obligatoires */}
              <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-700" />
                  {currentLabels.requiredFields}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${formData.title_fr.trim() ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className={formData.title_fr.trim() ? 'text-gray-700' : 'text-gray-400'}>
                      {currentLabels.titleFrPlaceholder}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${formData.description_fr.trim() && formData.description_fr.length >= 20 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className={formData.description_fr.trim() && formData.description_fr.length >= 20 ? 'text-gray-700' : 'text-gray-400'}>
                      {currentLabels.descriptionFr} (20+ caractères)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${formData.company.trim() ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className={formData.company.trim() ? 'text-gray-700' : 'text-gray-400'}>
                      {currentLabels.company}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}