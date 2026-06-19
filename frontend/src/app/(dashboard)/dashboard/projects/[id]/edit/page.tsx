// frontend/src/app/(dashboard)/dashboard/projects/[id]/edit/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, Save, Loader2, AlertCircle, 
  FolderOpen, MapPin, Users, DollarSign, Calendar,
  Target, CheckCircle, Award, TrendingUp, X,
  Upload, Trash2, Image as ImageIcon, Eye, EyeOff,
  Code
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// Import dynamique de l'editeur Quill
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Configuration de l'editeur Quill
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
  id: string;
  title_fr: string;
  title_mg: string;
  description_fr: string;
  description_mg: string;
  location: string;
  region: string;
  status: 'active' | 'completed' | 'paused' | 'draft';
  budget: number;
  spent: number;
  beneficiaries_count: number;
  youth_impact: number;
  jobs_created: number;
  progress: number;
  start_date: string;
  end_date: string;
  is_featured: boolean;
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
  { value: 'active', labelFr: 'En cours', labelMg: 'Mandeha', bg: 'bg-blue-100', text: 'text-blue-800' },
  { value: 'completed', labelFr: 'Termine', labelMg: 'Vita', bg: 'bg-green-100', text: 'text-green-800' },
  { value: 'paused', labelFr: 'En pause', labelMg: 'Mijanona', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  { value: 'draft', labelFr: 'Brouillon', labelMg: 'Volavola', bg: 'bg-gray-100', text: 'text-gray-600' }
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
  entityId?: string;
  getText: (fr: string, mg: string) => string;
}

function ImageUploadComponent({ 
  onUploadComplete, 
  currentImageUrl, 
  isUploading,
  onUploadStart,
  onUploadError,
  entityId,
  getText
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
      onUploadError(getText('Vous devez etre connecte pour uploader une image', 'Mila miditra ianao vao afaka mampiditra sary'));
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      onUploadError(getText('Veuillez selectionner une image (JPG, PNG, WEBP, GIF)', 'Fidio sary (JPG, PNG, WEBP, GIF)'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onUploadError(getText('L\'image ne doit pas depasser 5 Mo', 'Tsy tokony hihoatra 5 Mo ny sary'));
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
      if (entityId) {
        formData.append('entityId', entityId);
      }

      const response = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
      const imageUrl = response.data.url || response.data.fileUrl || `${apiBaseUrl}/upload/file/${response.data.id}`;
      
      if (!imageUrl) {
        throw new Error('URL de l\'image non recue');
      }
      
      onUploadComplete(imageUrl);
      toast.success(getText('Image uploadee avec succes', 'Vita ny fampidirana sary'));
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = error instanceof Error ? error.message : getText('Erreur lors de l\'upload', 'Nisy hadisoana tamin\'ny fampidirana');
      onUploadError(errorMsg);
      setPreviewUrl(currentImageUrl || null);
      toast.error(errorMsg);
    } finally {
      setLocalUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUploadComplete('');
    toast.success(getText('Image supprimee', 'Vita ny fanafoanana ny sary'));
  };

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
          <img 
            src={previewUrl} 
            alt={getText('Apercu', 'Topi-maso')} 
            className="w-full h-48 object-cover"
            onError={() => setPreviewUrl(null)}
          />
          <div className="absolute bottom-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => window.open(previewUrl, '_blank')}
              className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition shadow-md"
              title={getText('Voir l\'image', 'Jereo ny sary')}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleRemove}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
              type="button"
              title={getText('Supprimer l\'image', 'Fafao ny sary')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition bg-white">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 font-medium">{getText('Cliquez pour uploader une image', 'Tsindrio mba hampiditra sary')}</p>
            <p className="text-xs text-gray-400 mt-1">{getText('JPG, PNG, WEBP, GIF (max 5 Mo)', 'JPG, PNG, WEBP, GIF (farany 5 Mo)')}</p>
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
          {getText('Upload en cours...', 'Fampidirana...')}
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showPreviewFr, setShowPreviewFr] = useState(false);
  const [showPreviewMg, setShowPreviewMg] = useState(false);
  
  // ✅ CORRECTION : Definir le type correctement
  const [formData, setFormData] = useState<ProjectFormData>({
    id: '',
    title_fr: '',
    title_mg: '',
    description_fr: '',
    description_mg: '',
    location: '',
    region: 'Analamanga',
    status: 'active',
    budget: 0,
    spent: 0,
    beneficiaries_count: 0,
    youth_impact: 0,
    jobs_created: 0,
    progress: 0,
    start_date: '',
    end_date: '',
    is_featured: false,
    image_url: '',
  });

  const isMounted = useRef(true);
  const initialFetchDone = useRef(false);

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin';

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (!hasEditRights) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">{getText('Acces non autorise', 'Tsy manana alalana')}</h1>
          <p className="text-gray-500 mt-2">{getText('Vous n\'avez pas les droits pour modifier ce projet.', 'Tsy manana alalana hanova ity tetikasa ity ianao.')}</p>
          <Link href="/dashboard/projects" className="mt-4 inline-flex items-center gap-2 text-blue-800 hover:underline">
            {getText('Retour aux projets', 'Hiverina any amin\'ny tetikasa')}
          </Link>
        </div>
      </div>
    );
  }

  const fetchProject = useCallback(async () => {
    if (!isMounted.current || !projectId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/projects/${projectId}`);
      
      if (response.data && isMounted.current) {
        const data = response.data;
        // ✅ CORRECTION : Mettre a jour toutes les proprietes
        setFormData({
          id: data.id || '',
          title_fr: data.title_fr || '',
          title_mg: data.title_mg || '',
          description_fr: data.description_fr || '',
          description_mg: data.description_mg || '',
          location: data.location || '',
          region: data.region || 'Analamanga',
          status: data.status || 'active',
          budget: data.budget || 0,
          spent: data.spent || 0,
          beneficiaries_count: data.beneficiaries_count || 0,
          youth_impact: data.youth_impact || 0,
          jobs_created: data.jobs_created || 0,
          progress: data.progress || 0,
          start_date: data.start_date ? data.start_date.split('T')[0] : '',
          end_date: data.end_date ? data.end_date.split('T')[0] : '',
          is_featured: data.is_featured || false,
          image_url: data.image_url || '',
        });
      }
    } catch (error: any) {
      console.error('Erreur chargement:', error);
      if (isMounted.current) {
        if (error.response?.status === 404) {
          setError(getText('Projet non trouve', 'Tsy hita ny tetikasa'));
          toast.error(getText('Projet non trouve', 'Tsy hita ny tetikasa'));
        } else {
          setError(getText('Erreur lors du chargement du projet', 'Nisy hadisoana tamin\'ny fampidirana ny tetikasa'));
          toast.error(getText('Erreur de chargement', 'Nisy hadisoana'));
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [projectId, getText]);

  // Chargement initial unique
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (projectId && !initialFetchDone.current && isMounted.current) {
      initialFetchDone.current = true;
      fetchProject();
    }
  }, [projectId, fetchProject]);

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
    setSaving(true);
    setError('');

    try {
      let calculatedProgress = formData.progress || 0;
      if (formData.budget && formData.budget > 0) {
        const spent = formData.spent || 0;
        calculatedProgress = Math.min(100, Math.max(0, Math.round((spent / formData.budget) * 100)));
      }

      const projectData = {
        title_fr: formData.title_fr?.trim(),
        title_mg: formData.title_mg?.trim() || '',
        description_fr: formData.description_fr || '',
        description_mg: formData.description_mg || '',
        location: formData.location?.trim() || '',
        region: formData.region,
        status: formData.status,
        budget: Number(formData.budget) || 0,
        spent: Number(formData.spent) || 0,
        beneficiaries_count: Number(formData.beneficiaries_count) || 0,
        youth_impact: Number(formData.youth_impact) || 0,
        jobs_created: Number(formData.jobs_created) || 0,
        progress: calculatedProgress,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_featured: Boolean(formData.is_featured),
        image_url: formData.image_url || '',
      };

      await api.patch(`/projects/${projectId}`, projectData);
      
      toast.success(getText('Projet modifie avec succes !', 'Vita ny fanovana ny tetikasa !'));
      router.push(`/dashboard/projects/${projectId}`);
    } catch (error: any) {
      console.error('Erreur:', error);
      const errorMessage = error.response?.data?.message || getText('Erreur lors de la mise a jour', 'Nisy hadisoana tamin\'ny fanovana');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // ✅ Fonction pour mettre a jour un champ specifique
  const updateField = <K extends keyof ProjectFormData>(
    field: K, 
    value: ProjectFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-800 animate-spin" />
        <p className="text-gray-500">{getText('Chargement du projet...', 'Fandefasana ny tetikasa...')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-8">
      <div className="mb-6">
        <Link 
          href={`/dashboard/projects/${projectId}`} 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-800 mb-3 transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          {getText('Retour au projet', 'Hiverina any amin\'ny tetikasa')}
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center shadow-sm">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{getText('Modifier le projet', 'Hanova ny tetikasa')}</h1>
              <p className="text-gray-500 text-sm">{getText('Mettez a jour les informations du projet', 'Havaozy ny mombamomba ny tetikasa')}</p>
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
        
        {/* Image Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-3.5 h-3.5 text-gray-600" />
            </div>
            {getText('Image du projet', 'Sarin\'ny tetikasa')}
          </h2>
          <ImageUploadComponent
            onUploadComplete={handleImageUploadComplete}
            currentImageUrl={formData.image_url}
            isUploading={isUploading}
            onUploadStart={handleImageUploadStart}
            onUploadError={handleImageUploadError}
            entityId={projectId}
            getText={getText}
          />
          <p className="text-xs text-gray-400 mt-2">
            {getText('Une image de qualite ameliore la visibilite de votre projet', 'Ny sary tsara dia manatsara ny fahitana ny tetikasanao')}
          </p>
        </div>

        {/* General Info */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-3.5 h-3.5 text-gray-600" />
            </div>
            {getText('Informations generales', 'Fampahalalana ankapobeny')}
          </h2>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('Titre (francais)', 'Lohateny (frantsay)')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title_fr}
                onChange={(e) => updateField('title_fr', e.target.value)}
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
                onChange={(e) => updateField('title_mg', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition"
                placeholder="Lohatenin'ny tetikasa"
              />
            </div>
          </div>
        </div>

        {/* Description FR */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                <Code className="w-3.5 h-3.5 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                {getText('Description (francais)', 'Famaritana (frantsay)')} <span className="text-red-500">*</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowPreviewFr(!showPreviewFr)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-800 transition"
            >
              {showPreviewFr ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPreviewFr ? getText('Modifier', 'Hanova') : getText('Apercu', 'Topi-maso')}
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
                onChange={(value) => updateField('description_fr', value || '')}
                modules={QUILL_MODULES}
                formats={QUILL_FORMATS}
                placeholder={getText('Description detaillee du projet...', 'Famaritana feno ny tetikasa...')}
                className="bg-white"
              />
            </div>
          )}
          
          <div className="mt-2 text-right">
            <span className="text-xs text-gray-400">
              {formData.description_fr?.length || 0} caracteres
            </span>
          </div>
        </div>

        {/* Description MG */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
                <Code className="w-3.5 h-3.5 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                {getText('Description (malagasy)', 'Famaritana (malagasy)')}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowPreviewMg(!showPreviewMg)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-800 transition"
            >
              {showPreviewMg ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPreviewMg ? getText('Modifier', 'Hanova') : getText('Apercu', 'Topi-maso')}
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
                onChange={(value) => updateField('description_mg', value || '')}
                modules={QUILL_MODULES}
                formats={QUILL_FORMATS}
                placeholder="Famaritana ny tetikasa..."
                className="bg-white"
              />
            </div>
          )}
          
          <div className="mt-2 text-right">
            <span className="text-xs text-gray-400">
              {formData.description_mg?.length || 0} caracteres
            </span>
          </div>
        </div>

        {/* Location */}
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
                {getText('Region', 'Faritra')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.region}
                onChange={(e) => updateField('region', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none bg-white"
              >
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{getText('Lieu precis', 'Toerana marina')}</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition"
                placeholder={getText('Commune, fokontany', 'Kaominina, fokontany')}
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-gray-600" />
            </div>
            {getText('Statut du projet', 'Satan\'ny tetikasa')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STATUS_OPTIONS.map(option => (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${
                  formData.status === option.value 
                    ? 'border-blue-800 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={formData.status === option.value}
                  onChange={(e) => updateField('status', e.target.value as any)}
                  className="w-4 h-4 text-blue-800 focus:ring-blue-800"
                />
                <div className={`flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-medium ${option.bg} ${option.text}`}>
                  {language === 'fr' ? option.labelFr : option.labelMg}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Impact */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
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
                  onChange={(e) => updateField('budget', parseInt(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{getText('Depenses (Ar)', 'Fandaniana (Ar)')}</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.spent}
                  onChange={(e) => updateField('spent', parseInt(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{getText('Beneficiaires', 'Mpandray anjara')}</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.beneficiaries_count}
                  onChange={(e) => updateField('beneficiaries_count', parseInt(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{getText('Jeunes impactes', 'Tanora voatahy')}</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.youth_impact}
                  onChange={(e) => updateField('youth_impact', parseInt(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                />
              </div>
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">{getText('Emplois crees', 'Asa noforonina')}</label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.jobs_created}
                  onChange={(e) => updateField('jobs_created', parseInt(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-gray-600" />
            </div>
            {getText('Progression', 'Fandrosoana')}
          </h2>
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{getText('Avancement', 'Fandrosoana')}</span>
              <span className="font-semibold text-blue-800">{formData.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => updateField('progress', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-800"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 text-gray-600" />
            </div>
            {getText('Periode', 'Fotoana')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{getText('Date de debut', 'Daty fanombohana')}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateField('start_date', e.target.value)}
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
                  onChange={(e) => updateField('end_date', e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Featured */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => updateField('is_featured', e.target.checked)}
              className="w-5 h-5 text-blue-800 rounded focus:ring-blue-800"
            />
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-700 group-hover:text-blue-800 transition">
                {getText('Mettre en avant ce projet (projet vedette)', 'Asongadino ity tetikasa ity (tetikasa voasongadina)')}
              </span>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="p-6 bg-white border-t border-gray-200 flex justify-end gap-3">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-medium"
          >
            <X className="w-4 h-4" /> {getText('Annuler', 'Aoka')}
          </Link>
          <button
            type="submit"
            disabled={saving || isUploading}
            className="px-6 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm font-medium"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {getText('Enregistrement...', 'Fitehirizana...')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {getText('Enregistrer', 'Tehirizo')}
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-xs text-gray-400">
        {getText(
          'Les donnees sont stockees dans PostgreSQL via l\'API backend - Connexion securisee JWT',
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
        .prose {
          max-width: none;
        }
        .prose h1, .prose h2, .prose h3, .prose h4 {
          font-weight: bold;
          margin: 0.5rem 0;
        }
        .prose p {
          margin: 0.5rem 0;
        }
        .prose ul, .prose ol {
          margin: 0.5rem 0 0.5rem 1.5rem;
        }
        .prose li {
          margin: 0.2rem 0;
        }
        .prose blockquote {
          border-left: 4px solid #1E3A8A;
          padding-left: 1rem;
          margin: 0.5rem 0;
          color: #4b5563;
        }
        .prose code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: monospace;
        }
        .prose a {
          color: #1E3A8A;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}