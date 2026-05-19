'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { jobsApi, uploadApi } from '@/lib/api';
import { 
  ArrowLeft, Save, Briefcase, MapPin, Building, Calendar, 
  DollarSign, FileText, X, Loader2, AlertCircle, CheckCircle,
  Upload, Eye, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const CONTRACT_TYPES = [
  { value: 'cdi', label: 'CDI' },
  { value: 'cdd', label: 'CDD' },
  { value: 'stage', label: 'Stage' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'benevolat', label: 'Bénévolat' },
];

const SECTORS = [
  'Agriculture', 'Éducation', 'Santé', 'Environnement', 
  'Technologie', 'Construction', 'Commerce', 'Administration',
  'Communication', 'Transport', 'Tourisme', 'Autre'
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
    
    // Preview local
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    // Validation
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
    <div className="border-b border-gray-200 pb-6">
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

export default function NewJobPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    title_mg: '',
    description: '',
    description_mg: '',
    company_name: '',
    location: '',
    region: 'Analamanga',
    job_type: 'cdi',
    sector: '',
    salary: '',
    requirements: '',
    requirements_mg: '',
    benefits: '',
    deadline: '',
    status: 'draft',
    is_featured: false,
  });

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff';

  if (!isAuthenticated || !hasEditRights) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Accès non autorisé</h1>
          <p className="text-gray-500 mt-2">Vous n'avez pas les droits pour créer une offre d'emploi.</p>
          <Link href="/dashboard/jobs" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline">
            Retour aux offres
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const jobData = {
        title: formData.title,
        title_mg: formData.title_mg || undefined,
        description: formData.description,
        description_mg: formData.description_mg || undefined,
        company_name: formData.company_name,
        image_url: imageUrl || undefined,
        location: formData.location || undefined,
        region: formData.region,
        job_type: formData.job_type,
        sector: formData.sector || undefined,
        salary: formData.salary || undefined,
        requirements: formData.requirements || undefined,
        requirements_mg: formData.requirements_mg || undefined,
        benefits: formData.benefits || undefined,
        deadline: formData.deadline || undefined,
        status: formData.status,
        is_featured: formData.is_featured,
      };

      await jobsApi.create(jobData);
      toast.success('Offre d\'emploi créée avec succès !');
      router.push('/dashboard/jobs');
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* En-tête */}
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
              <p className="text-gray-500 text-sm">Créez une nouvelle opportunité pour les candidats</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          
          {/* Upload Image */}
          <ImageUploadSection onImageUpload={setImageUrl} currentImageUrl={imageUrl} />

          {/* Titres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du poste (français) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Ex: Coordinateur de projet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre (malagasy)</label>
              <input
                type="text"
                value={formData.title_mg}
                onChange={(e) => setFormData({...formData, title_mg: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Ex: Mpanandrindra tetikasa"
              />
            </div>
          </div>

          {/* Entreprise */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'entreprise <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Ex: Y-Mad Madagascar"
              />
            </div>
          </div>

          {/* Lieu et Région */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Ex: Antananarivo"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({...formData, region: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="Analamanga">Analamanga</option>
                <option value="Vakinankaratra">Vakinankaratra</option>
                <option value="Haute Matsiatra">Haute Matsiatra</option>
                <option value="Atsimo Atsinanana">Atsimo Atsinanana</option>
                <option value="Ihorombe">Ihorombe</option>
                <option value="Boeny">Boeny</option>
                <option value="Sofia">Sofia</option>
                <option value="Diana">Diana</option>
                <option value="Menabe">Menabe</option>
              </select>
            </div>
          </div>

          {/* Type et Secteur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
              <select
                value={formData.job_type}
                onChange={(e) => setFormData({...formData, job_type: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {CONTRACT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
              <select
                value={formData.sector}
                onChange={(e) => setFormData({...formData, sector: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Sélectionner un secteur</option>
                {SECTORS.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Salaire et Date limite */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salaire (optionnel)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Ex: 800 000 - 1 200 000 Ar"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date limite</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (français) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
              placeholder="Description détaillée du poste..."
            />
          </div>

          {/* Description Malagasy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (malagasy)</label>
            <textarea
              rows={4}
              value={formData.description_mg}
              onChange={(e) => setFormData({...formData, description_mg: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
              placeholder="Famaritana amin'ny malagasy..."
            />
          </div>

          {/* Prérequis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prérequis (français)</label>
            <textarea
              rows={4}
              value={formData.requirements}
              onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
              placeholder="Liste des prérequis..."
            />
          </div>

          {/* Prérequis Malagasy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prérequis (malagasy)</label>
            <textarea
              rows={3}
              value={formData.requirements_mg}
              onChange={(e) => setFormData({...formData, requirements_mg: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
              placeholder="Fepetra ilaina amin'ny malagasy..."
            />
          </div>

          {/* Avantages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avantages (optionnel)</label>
            <textarea
              rows={3}
              value={formData.benefits}
              onChange={(e) => setFormData({...formData, benefits: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
              placeholder="Ex: Mutuelle, télétravail, formation continue..."
            />
          </div>

          {/* Statut et Mise en avant */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="draft">Brouillon (non visible)</option>
                <option value="published">Publié (visible par les candidats)</option>
              </select>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Mettre cette offre à la une</span>
              </label>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
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
                Création...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Publier l'offre
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}