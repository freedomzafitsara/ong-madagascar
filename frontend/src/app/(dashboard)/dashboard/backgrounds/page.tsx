'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { 
  ArrowLeft, Loader2, AlertCircle, CheckCircle, Palette, 
  Image as ImageIcon, X, Save, Eye, EyeOff, Upload, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================

interface BackgroundSettings {
  id?: string;
  page: string;
  image_url: string;
  mobile_url?: string;
  thumbnail_url?: string;
  is_active: boolean;
  overlay_opacity: number;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  size: 'cover' | 'contain' | 'auto';
  alt_text: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// LISTE DES PAGES
// ============================================================

const pagesList = [
  { value: 'home', label: 'Accueil', label_mg: 'Fandraisana' },
  { value: 'projects', label: 'Projets', label_mg: 'Tetikasa' },
  { value: 'events', label: 'Evenements', label_mg: 'Hetsika' },
  { value: 'emploi', label: 'Emploi', label_mg: 'Asa' },
  { value: 'blog', label: 'Blog', label_mg: 'Bitsika' },
  { value: 'contact', label: 'Contact', label_mg: 'Fifandraisana' },
  { value: 'join', label: 'Adhesion', label_mg: 'Fandraisana mpikambana' },
  { value: 'donate', label: 'Faire un don', label_mg: 'Manome fanomezana' },
  { value: 'login', label: 'Connexion', label_mg: 'Hiditra' },
  { value: 'register', label: 'Inscription', label_mg: 'Hisoratra anarana' },
  { value: 'dashboard', label: 'Tableau de bord', label_mg: 'Dashboard' },
  { value: 'profile', label: 'Profil', label_mg: 'Momba ahy' }
];

// ============================================================
// SERVICE API
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `Erreur ${response.status}` }));
    throw new Error(error.message || `Erreur HTTP ${response.status}`);
  }

  return response.json();
}

async function uploadImage(file: File): Promise<string> {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload/single`, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `Erreur ${response.status}` }));
    throw new Error(error.message || 'Erreur lors de l upload');
  }

  const data = await response.json();
  return data.url || data.fileUrl || data.file_url || data.data?.url;
}

async function getBackground(page: string): Promise<BackgroundSettings | null> {
  try {
    return await apiRequest(`/pages/backgrounds/${page}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

async function updateBackground(page: string, data: Partial<BackgroundSettings>): Promise<BackgroundSettings> {
  return await apiRequest(`/pages/backgrounds/${page}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

async function getAllBackgrounds(): Promise<BackgroundSettings[]> {
  try {
    const response = await apiRequest('/pages/backgrounds/all');
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Erreur chargement backgrounds:', error);
    return [];
  }
}

// ============================================================
// VALEUR PAR DEFAUT
// ============================================================

const getDefaultBackground = (page: string): BackgroundSettings => ({
  page: page,
  image_url: '',
  is_active: false,
  overlay_opacity: 30,
  position: 'center',
  size: 'cover',
  alt_text: ''
});

// ============================================================
// COMPOSANT D'UPLOAD D'IMAGE
// ============================================================

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  isUploading: boolean;
  onUploadStart: () => void;
  onUploadError: (error: string) => void;
}

function ImageUploaderComponent({ 
  onUploadComplete, 
  currentImageUrl, 
  isUploading,
  onUploadStart,
  onUploadError
}: ImageUploaderProps) {
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

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      onUploadError('Veuillez selectionner une image (JPG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onUploadError('L image ne doit pas depasser 10 Mo');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    onUploadStart();
    setLocalUploading(true);

    try {
      const imageUrl = await uploadImage(file);
      onUploadComplete(imageUrl);
      toast.success('Image uploadée avec succès');
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(error instanceof Error ? error.message : 'Erreur lors de l upload');
      setPreviewUrl(currentImageUrl || null);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l upload');
    } finally {
      setLocalUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
            alt="Apercu" 
            className="w-full h-40 object-cover"
            onError={() => setPreviewUrl(null)}
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-md"
            type="button"
            title="Supprimer l'image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition bg-white">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
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
        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin" />
          Upload en cours...
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPOSANT DE CARTE DE PAGE
// ============================================================

interface PageCardProps {
  page: typeof pagesList[0];
  background: BackgroundSettings | null;
  onUpdate: (data: Partial<BackgroundSettings>) => Promise<void>;
  isSaving: boolean;
  isUploading: boolean;
  onUploadStart: () => void;
  onUploadComplete: (url: string) => void;
  onUploadError: (error: string) => void;
  language: string;
  onRefresh: () => void;
}

function PageCard({ 
  page, 
  background, 
  onUpdate, 
  isSaving, 
  isUploading, 
  onUploadStart, 
  onUploadComplete, 
  onUploadError, 
  language,
  onRefresh
}: PageCardProps) {
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [localBackground, setLocalBackground] = useState<Partial<BackgroundSettings>>(background || {});
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const pageLabel = language === 'fr' ? page.label : page.label_mg;

  useEffect(() => {
    if (background) {
      setLocalBackground(background);
      setHasChanges(false);
    }
  }, [background]);

  const handleChange = (key: keyof BackgroundSettings, value: any) => {
    setLocalBackground(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaveSuccess(false);
    await onUpdate(localBackground);
    setHasChanges(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    onRefresh();
  };

  const handleImageUploadComplete = (url: string) => {
    setLocalBackground(prev => ({ ...prev, image_url: url, is_active: true }));
    setHasChanges(true);
    onUploadComplete(url);
  };

  if (!background) return null;

  const hasImage = localBackground.image_url && localBackground.image_url.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-gray-800">{pageLabel}</h2>
            <p className="text-xs text-gray-500 font-mono">/{page.value}</p>
          </div>
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Sauvegarde reussie
              </span>
            )}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              aria-label={showPreview ? "Masquer l apercu" : "Voir l apercu"}
              title={showPreview ? "Masquer l apercu" : "Voir l apercu"}
            >
              {showPreview ? (
                <EyeOff className="w-4 h-4 text-gray-500" />
              ) : (
                <Eye className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image de fond
          </label>
          <ImageUploaderComponent
            onUploadComplete={handleImageUploadComplete}
            currentImageUrl={localBackground.image_url}
            isUploading={isUploading}
            onUploadStart={onUploadStart}
            onUploadError={onUploadError}
          />
        </div>

        {/* Apercu du rendu */}
        {showPreview && hasImage && (
          <div className="bg-gray-100 rounded-lg p-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apercu du rendu sur la page
            </label>
            <div className="relative h-40 rounded-lg overflow-hidden border border-gray-300">
              <img 
                src={localBackground.image_url} 
                alt={pageLabel} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Erreur chargement image:', localBackground.image_url);
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ backgroundColor: `rgba(0, 0, 0, ${(localBackground.overlay_opacity || 0) / 100})` }}
              >
                <div className="bg-white/90 p-3 rounded-lg text-center">
                  <p className="text-sm font-medium text-gray-800">Apercu du contenu</p>
                  <p className="text-xs text-gray-500">Texte par dessus l image</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Position: {localBackground.position} | Taille: {localBackground.size} | Opacite: {localBackground.overlay_opacity}%
            </p>
          </div>
        )}

        {/* Options avancees - uniquement si image presente */}
        {hasImage && (
          <>
            <div className="border-t border-gray-100 my-2" />
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Assombrissement du fond
                </label>
                <span className="text-sm text-gray-500">{localBackground.overlay_opacity || 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={localBackground.overlay_opacity || 0}
                onChange={(e) => handleChange('overlay_opacity', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                disabled={isSaving}
              />
              <p className="text-xs text-gray-400 mt-1">
                Plus le pourcentage est eleve, plus l image est sombre pour mieux lire le texte
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position de l image
              </label>
              <select
                value={localBackground.position || 'center'}
                onChange={(e) => handleChange('position', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={isSaving}
              >
                <option value="center">Centre</option>
                <option value="top">Haut</option>
                <option value="bottom">Bas</option>
                <option value="left">Gauche</option>
                <option value="right">Droite</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taille de l image
              </label>
              <select
                value={localBackground.size || 'cover'}
                onChange={(e) => handleChange('size', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={isSaving}
              >
                <option value="cover">Couvrir toute la zone</option>
                <option value="contain">Contenir dans la zone</option>
                <option value="auto">Taille automatique</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texte alternatif (SEO)
              </label>
              <input
                type="text"
                value={localBackground.alt_text || ''}
                onChange={(e) => handleChange('alt_text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Description de l image pour les moteurs de recherche"
                disabled={isSaving}
              />
              <p className="text-xs text-gray-400 mt-1">
                Important pour le referencement et l accessibilite
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={localBackground.is_active || false}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                disabled={isSaving}
              />
              <span className="text-sm text-gray-700">
                Activer ce fond d ecran sur la page {pageLabel}
              </span>
            </label>

            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  hasChanges && !isSaving
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enregistrement en cours...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {!hasImage && (
          <div className="text-center py-4 text-gray-400 text-sm">
            Aucune image configuree pour cette page
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function BackgroundsManagementPage() {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [backgrounds, setBackgrounds] = useState<Record<string, BackgroundSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Acces non autorise</h1>
          <p className="text-gray-500 mt-2">Vous n'avez pas les droits pour acceder a cette page.</p>
          <Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  const fetchAllBackgrounds = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const allBackgrounds = await getAllBackgrounds();
      const backgroundsMap: Record<string, BackgroundSettings> = {};
      
      allBackgrounds.forEach(bg => {
        backgroundsMap[bg.page] = bg;
      });
      
      for (const page of pagesList) {
        if (!backgroundsMap[page.value]) {
          backgroundsMap[page.value] = getDefaultBackground(page.value);
        }
      }
      
      setBackgrounds(backgroundsMap);
    } catch (error) {
      console.error('Erreur de chargement:', error);
      setMessage({ type: 'error', text: 'Erreur de chargement des fonds d ecran' });
      
      const fallbackBackgrounds: Record<string, BackgroundSettings> = {};
      pagesList.forEach(page => {
        fallbackBackgrounds[page.value] = getDefaultBackground(page.value);
      });
      setBackgrounds(fallbackBackgrounds);
    } finally {
      setLoading(false);
    }
  }, [refreshKey]);

  useEffect(() => {
    fetchAllBackgrounds();
  }, [fetchAllBackgrounds]);

  const refreshData = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const updateBackgroundHandler = useCallback(async (page: string, data: Partial<BackgroundSettings>) => {
    setSaving(prev => ({ ...prev, [page]: true }));
    setMessage(null);

    try {
      const updated = await updateBackground(page, data);
      
      setBackgrounds(prev => ({
        ...prev,
        [page]: updated
      }));
      
      setMessage({ 
        type: 'success', 
        text: `Fond d ecran de la page ${page} mis a jour avec succes` 
      });
      
      setTimeout(() => setMessage(null), 3000);
      toast.success(`Fond d ecran de la page ${page} mis a jour`);
    } catch (error) {
      console.error('Erreur de mise a jour:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erreur lors de la mise a jour';
      setMessage({ type: 'error', text: errorMsg });
      toast.error(errorMsg);
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(prev => ({ ...prev, [page]: false }));
    }
  }, []);

  const handleImageUploadStart = useCallback((page: string) => {
    setUploading(prev => ({ ...prev, [page]: true }));
  }, []);

  const handleImageUploadComplete = useCallback((page: string, url: string) => {
    setUploading(prev => ({ ...prev, [page]: false }));
    updateBackgroundHandler(page, { image_url: url, is_active: true });
  }, [updateBackgroundHandler]);

  const handleImageUploadError = useCallback((page: string, error: string) => {
    setUploading(prev => ({ ...prev, [page]: false }));
    setMessage({ type: 'error', text: error });
    toast.error(error);
    setTimeout(() => setMessage(null), 3000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              {language === 'fr' ? 'Gestion des fonds d ecran' : 'Fitantanana ny sary ambadika'}
            </h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {language === 'fr' 
              ? 'Personnalisez l image de fond de chaque page du site'
              : 'Amboary ny sary ambadiky ny pejy tsirairay ao amin\'ny tranonkala'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700">Rafraichir</span>
          </button>
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" /> 
            <span className="text-gray-700">{language === 'fr' ? 'Retour' : 'Miverina'}</span>
          </Link>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' 
            ? <CheckCircle className="w-5 h-5 text-green-600" /> 
            : <AlertCircle className="w-5 h-5 text-red-600" />
          }
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pagesList.map((page) => {
          const bg = backgrounds[page.value];
          const isSaving = saving[page.value];
          const isUploading = uploading[page.value];

          return (
            <PageCard
              key={`${page.value}-${refreshKey}`}
              page={page}
              background={bg || null}
              onUpdate={(data) => updateBackgroundHandler(page.value, data)}
              isSaving={isSaving}
              isUploading={isUploading}
              onUploadStart={() => handleImageUploadStart(page.value)}
              onUploadComplete={(url) => handleImageUploadComplete(page.value, url)}
              onUploadError={(error) => handleImageUploadError(page.value, error)}
              language={language}
              onRefresh={refreshData}
            />
          );
        })}
      </div>
    </div>
  );
}