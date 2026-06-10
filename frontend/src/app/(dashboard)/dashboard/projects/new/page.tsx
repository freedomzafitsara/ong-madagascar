// frontend/src/app/(dashboard)/dashboard/projects/new/page.tsx

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, Save, X, FolderOpen, MapPin, Users, 
  DollarSign, Calendar, AlertCircle, Loader2, 
  CheckCircle, Target, Heart, Award, Upload, Image as ImageIcon,
  Trash2, Eye, EyeOff, Code
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// Import dynamique de l'éditeur Quill
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Configuration de l'éditeur Quill
const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean']
  ],
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'list', 'bullet', 'check',
  'indent', 'align', 'blockquote', 'code-block',
  'link', 'image'
];

// ============================================================
// TYPES
// ============================================================

interface ProjectFormData {
  title_fr: string;
  title_mg: string;
  description_fr: string;
  description_mg: string;
  location: string;
  region: string;
  budget: number;
  spent: number;
  beneficiaries_count: number;
  youth_impact: number;
  jobs_created: number;
  start_date: string;
  end_date: string;
  is_featured: boolean;
  status: 'active' | 'completed' | 'paused' | 'draft';
  image_url: string;
}

// ============================================================
// CONSTANTES
// ============================================================

const REGIONS = [
  'Analamanga', 'Diana', 'Sava', 'Itasy', 'Vakinankaratra',
  'Bongolava', 'Sofia', 'Boeny', 'Betsiboka', 'Melaky',
  'Alaotra-Mangoro', 'Atsinanana', 'Analanjirofo', 'Amoron\'i Mania',
  'Haute Matsiatra', 'Vatovavy-Fitovinany', 'Ihorombe', 'Atsimo-Atsinanana',
  'Menabe', 'Atsimo-Andrefana', 'Androy', 'Anosy'
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'En cours', bg: 'bg-blue-100', text: 'text-blue-800' },
  { value: 'completed', label: 'Terminé', bg: 'bg-gray-100', text: 'text-gray-600' },
  { value: 'paused', label: 'En pause', bg: 'bg-gray-100', text: 'text-gray-600' },
  { value: 'draft', label: 'Brouillon', bg: 'bg-gray-100', text: 'text-gray-500' }
];

// ============================================================
// COMPOSANT D'UPLOAD D'IMAGE
// ============================================================

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  isUploading: boolean;
  onUploadStart: () => void;
  onUploadError: (error: string) => void;
}

function ImageUploadComponent({ 
  onUploadComplete, 
  currentImageUrl, 
  isUploading,
  onUploadStart,
  onUploadError
}: ImageUploadProps) {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [localUploading, setLocalUploading] = useState(false);

  useEffect(() => {
    setPreviewUrl(currentImageUrl || null);
  }, [currentImageUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onUploadError('');

    if (!token) {
      onUploadError('Vous devez être connecté pour uploader une image');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      onUploadError('Veuillez sélectionner une image (JPG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onUploadError('L\'image ne doit pas dépasser 5 Mo');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    onUploadStart();
    setLocalUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', 'project');

      const response = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const imageUrl = response.data.url || `/api/upload/image/${response.data.id}`;
      
      if (!imageUrl) {
        throw new Error('URL de l\'image non reçue');
      }
      
      onUploadComplete(imageUrl);
      toast.success('Image uploadée avec succès');
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
      setPreviewUrl(currentImageUrl || null);
      toast.error('Erreur lors de l\'upload de l\'image');
    } finally {
      setLocalUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUploadComplete('');
    toast.success('Image supprimée');
  };

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
          <img 
            src={previewUrl} 
            alt="Aperçu" 
            className="w-full h-48 object-cover"
            onError={() => setPreviewUrl(null)}
          />
          <div className="absolute bottom-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => window.open(previewUrl, '_blank')}
              className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition shadow-md"
              title="Voir l'image"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleRemove}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
              type="button"
              title="Supprimer l'image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition bg-white">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 font-medium">Cliquez pour uploader une image</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP, GIF (max 5 Mo)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
            disabled={localUploading || isUploading}
          />
        </label>
      )}
      {(localUploading || isUploading) && (
        <div className="flex items-center gap-2 text-sm text-blue-800 bg-blue-50 p-3 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin" />
          Upload en cours...
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function NewProjectPage() {
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreviewFr, setShowPreviewFr] = useState(false);
  const [showPreviewMg, setShowPreviewMg] = useState(false);

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin';

  if (!hasEditRights) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">{getText('Accès non autorisé', 'Tsy manana alalana')}</h1>
          <p className="text-gray-500 mt-2">{getText('Vous n\'avez pas les droits pour ajouter un projet.', 'Tsy manana alalana hanampy tetikasa ianao.')}</p>
          <Link href="/dashboard/projects" className="mt-4 inline-flex items-center gap-2 text-blue-800 hover:underline">
            {getText('Retour à la liste', 'Hiverina any amin\'ny lisitra')}
          </Link>
        </div>
      </div>
    );
  }

  const today = new Date();
  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  const [formData, setFormData] = useState<ProjectFormData>({
    title_fr: '',
    title_mg: '',
    description_fr: '',
    description_mg: '',
    location: '',
    region: 'Analamanga',
    budget: 0,
    spent: 0,
    beneficiaries_count: 0,
    youth_impact: 0,
    jobs_created: 0,
    start_date: today.toISOString().split('T')[0],
    end_date: oneYearLater.toISOString().split('T')[0],
    is_featured: false,
    status: 'active',
    image_url: '',
  });

  const validateForm = (): boolean => {
    if (!formData.title_fr.trim()) {
      setError(getText('Le titre du projet est requis', 'Ilaina ny lohatenin\'ny tetikasa'));
      return false;
    }
    if (!formData.description_fr.trim()) {
      setError(getText('La description du projet est requise', 'Ilaina ny famaritana ny tetikasa'));
      return false;
    }
    if (!formData.region) {
      setError(getText('La région est requise', 'Ilaina ny faritra'));
      return false;
    }
    if (formData.budget < 0) {
      setError(getText('Le budget ne peut pas être négatif', 'Tsy azo atao ny tetibola ratsy'));
      return false;
    }
    if (formData.spent < 0) {
      setError(getText('Les dépenses ne peuvent pas être négatives', 'Tsy azo atao ny fandaniana ratsy'));
      return false;
    }
    if (formData.spent > formData.budget && formData.budget > 0) {
      setError(getText('Les dépenses ne peuvent pas dépasser le budget', 'Ny fandaniana dia tsy mihoatra ny tetibola'));
      return false;
    }
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      setError(getText('La date de début doit être antérieure à la date de fin', 'Ny daty fanombohana dia tsy maintsy alohan\'ny daty famaranana'));
      return false;
    }
    return true;
  };

  const handleImageUploadStart = () => {
    setIsUploading(true);
  };

  const handleImageUploadComplete = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
    setIsUploading(false);
  };

  const handleImageUploadError = (errorMsg: string) => {
    setError(errorMsg);
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      // Calcul du progress limité entre 0 et 100
      let calculatedProgress = 0;
      if (formData.budget > 0) {
        calculatedProgress = Math.round((formData.spent / formData.budget) * 100);
        // Limiter entre 0 et 100
        calculatedProgress = Math.min(100, Math.max(0, calculatedProgress));
      }

      const projectData = {
        title_fr: formData.title_fr.trim(),
        title_mg: formData.title_mg.trim(),
        description_fr: formData.description_fr,
        description_mg: formData.description_mg,
        location: formData.location.trim(),
        region: formData.region,
        budget: Number(formData.budget) || 0,
        spent: Number(formData.spent) || 0,
        beneficiaries_count: Number(formData.beneficiaries_count) || 0,
        youth_impact: Number(formData.youth_impact) || 0,
        jobs_created: Number(formData.jobs_created) || 0,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_featured: formData.is_featured,
        status: formData.status,
        image_url: formData.image_url || '',
        progress: calculatedProgress,
      };

      const response = await api.post('/projects', projectData);

      if (response.data) {
        setSuccess(true);
        toast.success(getText('Projet créé avec succès !', 'Vita ny famoronana tetikasa !'));
        setTimeout(() => {
          router.push('/dashboard/projects');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Erreur:', err);
      const errorMessage = err.response?.data?.message || getText('Erreur de connexion au serveur', 'Nisy hadisoana tamin\'ny fifandraisana');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{getText('Projet créé avec succès !', 'Vita ny famoronana tetikasa !')}</h2>
          <p className="text-gray-600 mb-6">
            {getText('Le projet a été enregistré.', 'Voaorina ny tetikasa.')}
          </p>
          {formData.image_url && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img src={formData.image_url} alt={formData.title_fr} className="max-h-48 mx-auto object-cover rounded-lg" />
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard/projects" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
              {getText('Voir la liste', 'Jereo ny lisitra')}
            </Link>
            <Link href="/dashboard/projects/new" className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition">
              {getText('Ajouter un autre projet', 'Hanampy tetikasa hafa')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/dashboard/projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-800 mb-2 transition group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            {getText('Retour à la liste', 'Hiverina any amin\'ny lisitra')}
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center shadow-sm">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{getText('Ajouter un projet', 'Hanampy tetikasa')}</h1>
              <p className="text-gray-500 text-sm">{getText('Créez un nouveau projet pour l\'association', 'Mamorona tetikasa vaovao ho an\'ny fikambanana')}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{getText('Erreur', 'Hadisoana')}</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Section Image */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-3.5 h-3.5 text-gray-600" />
            </div>
            {getText('Image de couverture', 'Sary fonony')}
          </h2>
          <ImageUploadComponent
            onUploadComplete={handleImageUploadComplete}
            currentImageUrl={formData.image_url}
            isUploading={isUploading}
            onUploadStart={handleImageUploadStart}
            onUploadError={handleImageUploadError}
          />
          <p className="text-xs text-gray-400 mt-2">
            {getText('Une image de qualité améliore la visibilité de votre projet', 'Ny sary tsara dia manatsara ny fahitana ny tetikasanao')}
          </p>
        </div>

        {/* Section Informations générales */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-3.5 h-3.5 text-gray-600" />
            </div>
            {getText('Informations générales', 'Fampahalalana ankapobeny')}
          </h2>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('Titre (français)', 'Lohateny (frantsay)')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title_fr}
                onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition"
                placeholder={getText('Titre du projet', 'Lohatenin\'ny tetikasa')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('Titre (malagasy)', 'Lohateny (malagasy)')}
              </label>
              <input
                type="text"
                value={formData.title_mg}
                onChange={(e) => setFormData({ ...formData, title_mg: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition"
                placeholder="Lohatenin'ny tetikasa"
              />
            </div>
          </div>
        </div>

        {/* Section Description française */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                <Code className="w-3.5 h-3.5 text-gray-600" />
              </div>
              {getText('Description (français)', 'Famaritana (frantsay)')} <span className="text-red-500">*</span>
            </h2>
            <button
              type="button"
              onClick={() => setShowPreviewFr(!showPreviewFr)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-800 transition"
            >
              {showPreviewFr ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPreviewFr ? getText('Modifier', 'Hanova') : getText('Aperçu', 'Topi-maso')}
            </button>
          </div>
          
          {showPreviewFr ? (
            <div className="min-h-[250px] p-4 bg-gray-50 rounded-lg border border-gray-200 prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: formData.description_fr || '<em>Aucune description</em>' }} />
            </div>
          ) : (
            <div className="quill-editor">
              <ReactQuill
                theme="snow"
                value={formData.description_fr}
                onChange={(value) => setFormData({ ...formData, description_fr: value })}
                modules={QUILL_MODULES}
                formats={QUILL_FORMATS}
                placeholder={getText('Description détaillée du projet...', 'Famaritana feno ny tetikasa...')}
                className="bg-white"
              />
            </div>
          )}
          
          <div className="mt-2 text-right">
            <span className="text-xs text-gray-400">
              {formData.description_fr?.length || 0} caractères
            </span>
          </div>
        </div>

        {/* Section Description malagasy */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
                <Code className="w-3.5 h-3.5 text-gray-600" />
              </div>
              {getText('Description (malagasy)', 'Famaritana (malagasy)')}
            </h2>
            <button
              type="button"
              onClick={() => setShowPreviewMg(!showPreviewMg)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-800 transition"
            >
              {showPreviewMg ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPreviewMg ? getText('Modifier', 'Hanova') : getText('Aperçu', 'Topi-maso')}
            </button>
          </div>
          
          {showPreviewMg ? (
            <div className="min-h-[250px] p-4 bg-white rounded-lg border border-gray-200 prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: formData.description_mg || '<em>Tsy misy famaritana</em>' }} />
            </div>
          ) : (
            <div className="quill-editor">
              <ReactQuill
                theme="snow"
                value={formData.description_mg}
                onChange={(value) => setFormData({ ...formData, description_mg: value })}
                modules={QUILL_MODULES}
                formats={QUILL_FORMATS}
                placeholder="Famaritana ny tetikasa..."
                className="bg-white"
              />
            </div>
          )}
          
          <div className="mt-2 text-right">
            <span className="text-xs text-gray-400">
              {formData.description_mg?.length || 0} caractères
            </span>
          </div>
        </div>

        {/* Section Localisation */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-gray-600" />
            </div>
            {getText('Localisation', 'Toerana')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('Région', 'Faritra')} <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none bg-white"
              >
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{getText('Lieu précis', 'Toerana marina')}</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition"
                placeholder={getText('Commune, fokontany', 'Kaominina, fokontany')}
              />
            </div>
          </div>
        </div>

        {/* Section Impact */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-gray-600" />
            </div>
            {getText('Impact du projet', 'Fiantraikan\'ny tetikasa')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{getText('Budget (Ar)', 'Tetibola (Ar)')}</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{getText('Dépenses (Ar)', 'Fandaniana (Ar)')}</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.spent}
                  onChange={(e) => setFormData({ ...formData, spent: parseInt(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{getText('Bénéficiaires', 'Mpandray anjara')}</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.beneficiaries_count}
                  onChange={(e) => setFormData({ ...formData, beneficiaries_count: parseInt(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{getText('Jeunes impactés', 'Tanora voatahy')}</label>
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.youth_impact}
                  onChange={(e) => setFormData({ ...formData, youth_impact: parseInt(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                />
              </div>
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">{getText('Emplois créés', 'Asa noforonina')}</label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.jobs_created}
                  onChange={(e) => setFormData({ ...formData, jobs_created: parseInt(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Dates */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 text-gray-600" />
            </div>
            {getText('Période', 'Fotoana')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{getText('Date de début', 'Daty fanombohana')}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{getText('Date de fin', 'Daty famaranana')}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Statut et Options */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-gray-600" />
            </div>
            {getText('Statut et options', 'Sata sy safidy')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{getText('Statut', 'Sata')}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none bg-white"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-5 h-5 text-blue-800 rounded focus:ring-blue-800"
                />
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-700 group-hover:text-blue-800 transition">
                    {getText('Mettre en avant (projet vedette)', 'Asongadino (tetikasa voasongadina)')}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="p-6 bg-white border-t border-gray-200 flex justify-end gap-3">
          <Link
            href="/dashboard/projects"
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-medium"
          >
            <X className="w-4 h-4" /> {getText('Annuler', 'Aoka')}
          </Link>
          <button
            type="submit"
            disabled={loading || isUploading}
            className="px-6 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {getText('Création en cours...', 'Famoronana...')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {getText('Créer le projet', 'Hamorona tetikasa')}
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-xs text-gray-400">
        {getText(
          'Les données sont stockées dans PostgreSQL via l\'API backend - Connexion sécurisée JWT',
          'Ny angona dia voatahiry ao PostgreSQL amin\'ny alalan\'ny API backend - Fifandraisana voaaro JWT'
        )}
      </div>

      <style jsx global>{`
        .quill-editor .ql-container {
          min-height: 250px;
          font-size: 14px;
        }
        .quill-editor .ql-editor {
          min-height: 250px;
        }
        .quill-editor .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          border-color: #e5e7eb;
          background-color: #f9fafb;
        }
        .quill-editor .ql-container {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          border-color: #e5e7eb;
        }
        .quill-editor .ql-editor p {
          margin-bottom: 0.5rem;
        }
        .prose {
          max-width: none;
        }
        .prose h1 { font-size: 1.5rem; font-weight: bold; margin: 1rem 0 0.5rem; }
        .prose h2 { font-size: 1.3rem; font-weight: bold; margin: 0.8rem 0 0.4rem; }
        .prose h3 { font-size: 1.1rem; font-weight: bold; margin: 0.6rem 0 0.3rem; }
        .prose ul, .prose ol { margin: 0.5rem 0 0.5rem 1.5rem; }
        .prose li { margin: 0.2rem 0; }
        .prose strong { font-weight: bold; }
        .prose em { font-style: italic; }
      `}</style>
    </div>
  );
}

// Composant TrendingUp manquant
function TrendingUp(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}