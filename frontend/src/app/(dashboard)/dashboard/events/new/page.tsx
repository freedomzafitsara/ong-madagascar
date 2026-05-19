'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { eventsApi } from '@/lib/api';
import { 
  ArrowLeft, Save, Calendar, MapPin, Users, DollarSign, 
  Clock, Loader2, CheckCircle, AlertCircle, X, 
  Upload, Image as ImageIcon, Trash2, Eye, Building2
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

const EVENT_TYPES = [
  { value: 'camp', label: 'Camp' },
  { value: 'workshop', label: 'Atelier' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'conference', label: 'Conférence' },
  { value: 'formation', label: 'Formation' }
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
    onUploadStart();
    setLocalUploading(true);

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    if (!token) {
      onUploadError('Vous devez être connecté');
      setLocalUploading(false);
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      onUploadError('Format non supporté (JPG, PNG, WEBP, GIF)');
      setPreviewUrl(currentImageUrl || null);
      setLocalUploading(false);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onUploadError('Image trop grande (max 10 Mo)');
      setPreviewUrl(currentImageUrl || null);
      setLocalUploading(false);
      return;
    }

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
        const error = await response.json();
        throw new Error(error.message || 'Erreur upload');
      }

      const data = await response.json();
      const imageUrl = data.url || data.data?.url || data.fileUrl;
      
      onUploadComplete(imageUrl);
      toast.success('Image uploadée avec succès');
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(error instanceof Error ? error.message : 'Erreur upload');
      setPreviewUrl(currentImageUrl || null);
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
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP, GIF (max 10 Mo)</p>
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

export default function NewEventPage() {
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff';

  if (!isAuthenticated) {
    return null;
  }

  if (!hasEditRights) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Accès non autorisé</h1>
          <p className="text-gray-500 mt-2">Vous n'avez pas les droits pour créer un événement.</p>
          <Link href="/dashboard/events" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline">
            Retour aux événements
          </Link>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    title: '',
    title_mg: '',
    description: '',
    description_mg: '',
    type: 'workshop',
    location: '',
    region: '',
    startDate: '',
    endDate: '',
    maxCapacity: '',
    isFree: true,
    price: '',
    status: 'draft'
  });

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Le titre est requis');
      return false;
    }
    if (!formData.description.trim()) {
      setError('La description est requise');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Le lieu est requis');
      return false;
    }
    if (!formData.startDate) {
      setError('La date et heure de début sont requises');
      return false;
    }
    
    const startDateObj = new Date(formData.startDate);
    if (isNaN(startDateObj.getTime())) {
      setError('La date de début est invalide');
      return false;
    }
    
    if (formData.endDate) {
      const endDateObj = new Date(formData.endDate);
      if (isNaN(endDateObj.getTime())) {
        setError('La date de fin est invalide');
        return false;
      }
      if (endDateObj < startDateObj) {
        setError('La date de fin doit être postérieure à la date de début');
        return false;
      }
    }
    return true;
  };

  const handleImageUploadStart = () => {
    setIsUploading(true);
  };

  const handleImageUploadComplete = (url: string) => {
    setImageUrl(url);
    setIsUploading(false);
  };

  const handleImageUploadError = (errorMsg: string) => {
    setError(errorMsg);
    setIsUploading(false);
    setTimeout(() => setError(''), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      const startDateObj = new Date(formData.startDate);
      
      const eventData = {
        title: formData.title.trim(),
        title_mg: formData.title_mg.trim() || undefined,
        description: formData.description.trim(),
        description_mg: formData.description_mg.trim() || undefined,
        type: formData.type,
        location: formData.location.trim(),
        region: formData.region.trim() || undefined,
        startDate: startDateObj,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        maxCapacity: formData.maxCapacity && formData.maxCapacity !== '' 
          ? parseInt(formData.maxCapacity) 
          : undefined,
        isFree: formData.isFree,
        price: !formData.isFree && formData.price && formData.price !== ''
          ? parseInt(formData.price)
          : 0,
        status: formData.status,
        imageUrl: imageUrl || undefined
      };

      console.log('📤 Données envoyées:', eventData);

      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success('Événement créé avec succès !');
        setTimeout(() => {
          router.push('/dashboard/events');
        }, 2000);
      } else {
        console.error('❌ Erreur backend:', data);
        const errorMsg = data.message || data.error || 'Erreur lors de la création';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error('❌ Erreur réseau:', err);
      const errorMsg = err.message || 'Erreur de connexion au serveur';
      setError(errorMsg);
      toast.error(errorMsg);
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Événement créé avec succès !</h2>
          <p className="text-gray-600 mb-6">
            L'événement "{formData.title}" a été enregistré.
          </p>
          {imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img src={imageUrl} alt={formData.title} className="max-h-48 mx-auto object-cover rounded-lg" />
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard/events" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
              Voir la liste
            </Link>
            <Link href="/dashboard/events/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Créer un autre
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* EN-TÊTE */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/events" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Nouvel événement</h1>
              <p className="text-gray-500 text-sm mt-0.5">Créez un camp, atelier, hackathon ou formation</p>
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGES D'ERREUR */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* FORMULAIRE */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          
          {/* SECTION UPLOAD IMAGE */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              </div>
              Image de couverture
            </h2>
            <ImageUploadComponent
              onUploadComplete={handleImageUploadComplete}
              currentImageUrl={imageUrl}
              isUploading={isUploading}
              onUploadStart={handleImageUploadStart}
              onUploadError={handleImageUploadError}
            />
            <p className="text-xs text-gray-400 mt-2">
              Une image de qualité améliore la visibilité de votre événement
            </p>
          </div>

          {/* TITRES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Titre (français) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Titre en français"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre (malagasy)</label>
              <input
                type="text"
                value={formData.title_mg}
                onChange={(e) => setFormData({...formData, title_mg: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Lohateny amin'ny malagasy"
              />
            </div>
          </div>

          {/* TYPE ET STATUT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type d'événement</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
              >
                {EVENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié directement</option>
              </select>
            </div>
          </div>

          {/* DATE ET LIEU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date et heure <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Lieu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Ex: Antananarivo, Mahamasina"
                />
              </div>
            </div>
          </div>

          {/* RÉGION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Région</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({...formData, region: e.target.value})}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Ex: Analamanga, Vakinankaratra"
              />
            </div>
          </div>

          {/* DATE DE FIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de fin (optionnelle)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* CAPACITÉ ET PRIX */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Capacité maximale</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({...formData, maxCapacity: e.target.value})}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="0 = illimité"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Événement gratuit ?</label>
              <select
                value={formData.isFree ? 'true' : 'false'}
                onChange={(e) => setFormData({...formData, isFree: e.target.value === 'true'})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
              >
                <option value="true">Oui, gratuit</option>
                <option value="false">Non, payant</option>
              </select>
            </div>
          </div>

          {/* PRIX */}
          {!formData.isFree && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prix (Ariary)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Prix en Ariary"
                />
              </div>
            </div>
          )}

          {/* DESCRIPTIONS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description (français) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
              placeholder="Description détaillée de l'événement..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (malagasy)</label>
            <textarea
              rows={5}
              value={formData.description_mg}
              onChange={(e) => setFormData({...formData, description_mg: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
              placeholder="Famaritana amin'ny malagasy..."
            />
          </div>
        </div>

        {/* BOUTONS D'ACTION */}
        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200">
          <Link
            href="/dashboard/events"
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-medium"
          >
            <X className="w-4 h-4" /> Annuler
          </Link>
          <button
            type="submit"
            disabled={loading || isUploading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Créer l'événement
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-5 text-center text-xs text-gray-400">
        Les données sont stockées dans PostgreSQL via l'API NestJS - Connexion sécurisée JWT
      </div>
    </div>
  );
}