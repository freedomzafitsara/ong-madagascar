// frontend/src/app/(dashboard)/dashboard/projects/new/page.tsx
// CORRECTION - FORMAT DES DATES ISO 8601

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, Save, X, FolderOpen, MapPin, Users, 
  DollarSign, Calendar, AlertCircle, Loader2, 
  CheckCircle, Target, Heart, Award, Upload, Image as ImageIcon,
  Trash2, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================

interface ProjectFormData {
  title: string;
  title_mg: string;
  description: string;
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

const REGIONS = [
  'Analamanga', 'Diana', 'Sava', 'Itasy', 'Vakinankaratra',
  'Bongolava', 'Sofia', 'Boeny', 'Betsiboka', 'Melaky',
  'Alaotra-Mangoro', 'Atsinanana', 'Analanjirofo', 'Amoron\'i Mania',
  'Haute Matsiatra', 'Vatovavy-Fitovinany', 'Ihorombe', 'Atsimo-Atsinanana',
  'Menabe', 'Atsimo-Andrefana', 'Androy', 'Anosy'
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

      const response = await fetch(`${API_URL}/upload/single`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.url || data.fileUrl || data.file_url || data.data?.url;
      
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
        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff';

  if (!hasEditRights) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Accès non autorisé</h1>
          <p className="text-gray-500 mt-2">Vous n'avez pas les droits pour ajouter un projet.</p>
          <Link href="/dashboard/projects" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  // Date actuelle au format ISO 8601 (YYYY-MM-DD)
  const today = new Date();
  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    title_mg: '',
    description: '',
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
    if (!formData.title.trim()) {
      setError('Le titre du projet est requis');
      return false;
    }
    if (!formData.description.trim()) {
      setError('La description du projet est requise');
      return false;
    }
    if (!formData.region) {
      setError('La région est requise');
      return false;
    }
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      setError('La date de début doit être antérieure à la date de fin');
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

  const handleImageUploadError = (error: string) => {
    setError(error);
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      // CORRECTION: Les dates sont déjà au format ISO 8601 (YYYY-MM-DD)
      // Le backend attend ce format valide
      const projectData = {
        title: formData.title.trim(),
        title_mg: formData.title_mg.trim(),
        description: formData.description.trim(),
        description_mg: formData.description_mg.trim(),
        location: formData.location.trim(),
        region: formData.region,
        budget: formData.budget || 0,
        spent: formData.spent || 0,
        beneficiaries_count: formData.beneficiaries_count || 0,
        youth_impact: formData.youth_impact || 0,
        jobs_created: formData.jobs_created || 0,
        start_date: formData.start_date,  // Format: YYYY-MM-DD
        end_date: formData.end_date,      // Format: YYYY-MM-DD
        is_featured: formData.is_featured,
        status: formData.status,
        image_url: formData.image_url,
        progress: formData.budget > 0 ? Math.round((formData.spent / formData.budget) * 100) : 0,
      };

      console.log('Donnees envoyees au backend:', projectData);
      console.log('Date debut:', projectData.start_date, 'Type:', typeof projectData.start_date);
      console.log('Date fin:', projectData.end_date, 'Type:', typeof projectData.end_date);

      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();
      console.log('Reponse du backend:', result);

      if (response.ok) {
        setSuccess(true);
        toast.success('Projet créé avec succès !');
        setTimeout(() => {
          router.push('/dashboard/projects');
        }, 2000);
      } else {
        const errorMessage = result.message || result.error || JSON.stringify(result);
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Erreur backend:', result);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion au serveur');
      toast.error('Erreur de connexion au serveur');
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Projet créé avec succès !</h2>
          <p className="text-gray-600 mb-6">
            Le projet "{formData.title}" a été enregistré.
          </p>
          {formData.image_url && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img src={formData.image_url} alt={formData.title} className="max-h-48 mx-auto object-cover rounded-lg" />
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard/projects" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
              Voir la liste
            </Link>
            <Link href="/dashboard/projects/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Ajouter un autre projet
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/dashboard/projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-2 transition">
            <ArrowLeft className="w-4 h-4" /> Retour à la liste
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Ajouter un projet</h1>
          <p className="text-gray-500 text-sm">Créez un nouveau projet pour l'association</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        
        {/* Section Image de couverture */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            </div>
            Image de couverture
          </h2>
          <ImageUploadComponent
            onUploadComplete={handleImageUploadComplete}
            currentImageUrl={formData.image_url}
            isUploading={isUploading}
            onUploadStart={handleImageUploadStart}
            onUploadError={handleImageUploadError}
          />
          <p className="text-xs text-gray-400 mt-2">
            Une image de qualité améliore la visibilité de votre projet
          </p>
        </div>

        {/* Section Informations générales */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
            </div>
            Informations générales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre (français) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Titre du projet"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre (malagasy)</label>
              <input
                type="text"
                value={formData.title_mg}
                onChange={(e) => setFormData({ ...formData, title_mg: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Lohatenin'ny tetikasa"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (français) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Description détaillée du projet"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (malagasy)</label>
              <textarea
                rows={4}
                value={formData.description_mg}
                onChange={(e) => setFormData({ ...formData, description_mg: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Famaritana ny tetikasa"
              />
            </div>
          </div>
        </div>

        {/* Section Localisation */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
            </div>
            Localisation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Région <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu précis</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Commune, fokontany"
              />
            </div>
          </div>
        </div>

        {/* Section Impact */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-blue-600" />
            </div>
            Impact du projet
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (Ar)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dépenses (Ar)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.spent}
                  onChange={(e) => setFormData({ ...formData, spent: parseInt(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bénéficiaires</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.beneficiaries_count}
                  onChange={(e) => setFormData({ ...formData, beneficiaries_count: parseInt(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jeunes impactés</label>
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.youth_impact}
                  onChange={(e) => setFormData({ ...formData, youth_impact: parseInt(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Emplois créés</label>
              <input
                type="number"
                min="0"
                value={formData.jobs_created}
                onChange={(e) => setFormData({ ...formData, jobs_created: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Section Dates */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
            </div>
            Période du projet
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Format: JJ/MM/AAAA</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Format: JJ/MM/AAAA</p>
            </div>
          </div>
        </div>

        {/* Section Options */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 flex items-center gap-1">
                <Award className="w-4 h-4 text-yellow-500" /> Mettre en avant (projet vedette)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.status === 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'draft' })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Publier immédiatement</span>
            </label>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <Link
            href="/dashboard/projects"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Annuler
          </Link>
          <button
            type="submit"
            disabled={loading || isUploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Créer le projet
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 text-center text-xs text-gray-400">
        Les données sont stockées dans PostgreSQL via l'API backend - Connexion sécurisée JWT
      </div>
    </div>
  );
}