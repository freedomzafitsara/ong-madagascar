'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, Save, Calendar, MapPin, Users, DollarSign, 
  Clock, Trash2, Loader2, CheckCircle, AlertCircle,
  X, Phone, Mail, Building2, Tag, Upload, Image as ImageIcon, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

const EVENT_TYPES = [
  { value: 'camp', label: 'Camp' },
  { value: 'workshop', label: 'Atelier' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'conference', label: 'Conference' },
  { value: 'formation', label: 'Formation' }
];

const YMAD_INFO = {
  address: 'Carion, Antananarivo, Madagascar',
  phone: '+261 32 04 856 97',
  email: 'ymad.mg@gmail.com'
};

// ============================================================
// SECTION 1 : COMPOSANT D UPLOAD D IMAGE
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
      onUploadError('Vous devez etre connecte pour uploader une image');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      onUploadError('Veuillez selectionner une image (JPG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onUploadError('L image ne doit pas depasser 5 Mo');
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
        throw new Error('URL de l image non recue');
      }
      
      onUploadComplete(imageUrl);
      toast.success('Image uploadee avec succes');
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(error instanceof Error ? error.message : 'Erreur lors de l upload');
      setPreviewUrl(currentImageUrl || null);
      toast.error('Erreur lors de l upload de l image');
    } finally {
      setLocalUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUploadComplete('');
    toast.success('Image supprimee');
  };

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
          <img 
            src={previewUrl} 
            alt="Apercu" 
            className="w-full h-48 object-cover"
            onError={() => setPreviewUrl(null)}
          />
          <div className="absolute bottom-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => window.open(previewUrl, '_blank')}
              className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition shadow-md"
              title="Voir l image"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleRemove}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
              type="button"
              title="Supprimer l image"
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
// SECTION 2 : COMPOSANT PRINCIPAL
// ============================================================

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const { token, user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    title_mg: '',
    description: '',
    description_mg: '',
    start_datetime: '',
    end_datetime: '',
    location: '',
    address: '',
    max_capacity: '',
    is_free: true,
    price_mga: '',
    event_type: 'workshop',
    status: 'draft',
    organizer_name: 'Y-Mad',
    organizer_email: YMAD_INFO.email,
    organizer_phone: YMAD_INFO.phone
  });

  // ============================================================
  // SECTION 3 : VERIFICATION DES DROITS
  // ============================================================

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff';

  // ============================================================
  // SECTION 4 : CHARGEMENT DE L EVENEMENT
  // ============================================================

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/events/${eventId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          setFormData({
            title: data.title || '',
            title_mg: data.title_mg || '',
            description: data.description || '',
            description_mg: data.description_mg || '',
            start_datetime: data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : '',
            end_datetime: data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : '',
            location: data.location || '',
            address: data.address || '',
            max_capacity: data.maxCapacity?.toString() || '',
            is_free: data.isFree !== undefined ? data.isFree : true,
            price_mga: data.price?.toString() || '',
            event_type: data.type || 'workshop',
            status: data.status || 'draft',
            organizer_name: data.organizer_name || 'Y-Mad',
            organizer_email: data.organizer_email || YMAD_INFO.email,
            organizer_phone: data.organizer_phone || YMAD_INFO.phone
          });
          setImageUrl(data.imageUrl || data.image_url || '');
        } else if (response.status === 404) {
          setError('Evenement non trouve');
        } else {
          setError('Erreur lors du chargement');
        }
      } catch {
        setError('Erreur de connexion au serveur');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // ============================================================
  // SECTION 5 : GESTIONNAIRES D UPLOAD
  // ============================================================

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
  };

  // ============================================================
  // SECTION 6 : SOUMISSION DU FORMULAIRE
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasEditRights) {
      setError('Vous n avez pas les droits pour modifier cet evenement');
      return;
    }
    
    setSaving(true);
    setError(null);

    try {
      const eventData = {
        title: formData.title.trim(),
        title_mg: formData.title_mg.trim() || undefined,
        description: formData.description.trim(),
        description_mg: formData.description_mg.trim() || undefined,
        type: formData.event_type,
        location: formData.location.trim(),
        region: formData.address.trim() || undefined,
        startDate: new Date(formData.start_datetime),
        endDate: formData.end_datetime ? new Date(formData.end_datetime) : undefined,
        maxCapacity: parseInt(formData.max_capacity) || 0,
        isFree: formData.is_free,
        price: formData.is_free ? 0 : (parseInt(formData.price_mga) || 0),
        status: formData.status,
        imageUrl: imageUrl || undefined
      };

      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        setSuccess(true);
        toast.success('Evenement modifie avec succes');
        setTimeout(() => {
          router.push('/dashboard/events');
        }, 1500);
      } else {
        const result = await response.json();
        const errorMsg = result.message || result.error || 'Erreur lors de la modification';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch {
      setError('Erreur de connexion au serveur');
      toast.error('Erreur de connexion au serveur');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // SECTION 7 : SUPPRESSION DE L EVENEMENT
  // ============================================================

  const handleDelete = async () => {
    if (!confirm('Etes-vous sur de vouloir supprimer cet evenement ? Cette action est irreversible.')) return;
    
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success('Evenement supprime avec succes');
        router.push('/dashboard/events');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur de connexion');
    }
  };

  // ============================================================
  // SECTION 8 : ECRAN DE CHARGEMENT
  // ============================================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-center">Chargement de l evenement...</p>
      </div>
    );
  }

  // ============================================================
  // SECTION 9 : ERREUR
  // ============================================================

  if (error && !formData.title) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">{error}</p>
          <Link href="/dashboard/events" className="mt-4 inline-block text-blue-600 hover:underline">
            Retour aux evenements
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // SECTION 10 : RENDU PRINCIPAL
  // ============================================================

  return (
    <div className="max-w-3xl mx-auto">
      
      {/* SOUS-SECTION 10.1 : EN-TETE */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/events" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Modifier l evenement</h1>
            </div>
            <p className="text-gray-500 text-sm mt-1">Modifiez les informations de l evenement</p>
          </div>
        </div>
        {hasEditRights && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        )}
      </div>

      {/* SOUS-SECTION 10.2 : MESSAGES DE SUCCES ET ERREUR */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Evenement modifie avec succes ! Redirection...
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* SOUS-SECTION 10.3 : FORMULAIRE */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-5">
          
          {/* Image de couverture */}
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
              Une image de qualite ameliore la visibilite de votre evenement
            </p>
          </div>

          {/* Titres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre (francais)
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Titre en francais"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre (malagasy)</label>
              <input
                type="text"
                value={formData.title_mg}
                onChange={(e) => setFormData({...formData, title_mg: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Lohateny amin'ny malagasy"
              />
            </div>
          </div>

          {/* Type et statut */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d evenement</label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({...formData, event_type: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {EVENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publie</option>
              </select>
            </div>
          </div>

          {/* Date et lieu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date et heure
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="datetime-local"
                  required
                  value={formData.start_datetime}
                  onChange={(e) => setFormData({...formData, start_datetime: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Antananarivo"
                />
              </div>
            </div>
          </div>

          {/* Adresse complete */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complete</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Adresse complete"
              />
            </div>
          </div>

          {/* Capacite et prix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacite maximale</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({...formData, max_capacity: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0 = illimite"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Evenement gratuit ?</label>
              <select
                value={formData.is_free ? 'true' : 'false'}
                onChange={(e) => setFormData({...formData, is_free: e.target.value === 'true'})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="true">Oui, gratuit</option>
                <option value="false">Non, payant</option>
              </select>
            </div>
          </div>

          {/* Prix */}
          {!formData.is_free && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (Ariary)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.price_mga}
                  onChange={(e) => setFormData({...formData, price_mga: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Prix en Ariary"
                />
              </div>
            </div>
          )}

          {/* Descriptions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (francais)
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Description detaillee de l evenement..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (malagasy)</label>
            <textarea
              rows={4}
              value={formData.description_mg}
              onChange={(e) => setFormData({...formData, description_mg: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Famaritana amin'ny malagasy..."
            />
          </div>

          {/* Organisateur */}
          <div className="border-t border-gray-200 pt-4 mt-2">
            <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              Informations de l organisateur
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.organizer_name}
                  onChange={(e) => setFormData({...formData, organizer_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.organizer_email}
                    onChange={(e) => setFormData({...formData, organizer_email: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telephone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.organizer_phone}
                    onChange={(e) => setFormData({...formData, organizer_phone: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SOUS-SECTION 10.4 : BOUTONS D ACTION */}
        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200">
          <Link
            href="/dashboard/events"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Annuler
          </Link>
          <button
            type="submit"
            disabled={saving || isUploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>

      {/* SOUS-SECTION 10.5 : INFORMATIONS TECHNIQUES */}
      <div className="mt-4 text-center text-xs text-gray-400">
        Les donnees sont stockees dans PostgreSQL via l API backend - Connexion securisee JWT
      </div>
    </div>
  );
}