'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { pageService } from '@/services/pageService';
import { PageBackground } from '@/types';
import Link from 'next/link';
import { 
  ArrowLeft, Loader2, AlertCircle, CheckCircle, Palette, 
  Image as ImageIcon, X
} from 'lucide-react';

// Liste des pages disponibles
const pagesList = [
  { value: 'home', label: 'Accueil', label_mg: 'Fandraisana' },
  { value: 'about', label: 'A propos', label_mg: 'Momba anay' },
  { value: 'projects', label: 'Projets', label_mg: 'Tetikasa' },
  { value: 'events', label: 'Evenements', label_mg: 'Hetsika' },
  { value: 'jobs', label: 'Emploi', label_mg: 'Asa' },
  { value: 'blog', label: 'Blog', label_mg: 'Bitsika' },
  { value: 'contact', label: 'Contact', label_mg: 'Fifandraisana' },
  { value: 'join', label: 'Adhesion', label_mg: 'Fandraisana mpikambana' },
  { value: 'donate', label: 'Faire un don', label_mg: 'Manome fanomezana' },
  { value: 'login', label: 'Connexion', label_mg: 'Hiditra' },
  { value: 'register', label: 'Inscription', label_mg: 'Hisoratra anarana' },
  { value: 'dashboard', label: 'Tableau de bord', label_mg: 'Dashboard' },
  { value: 'profile', label: 'Profil', label_mg: 'Momba ahy' }
];

// Valeur par défaut pour un fond d'écran
const getDefaultBackground = (page: string): Partial<PageBackground> => ({
  page: page,
  image_url: '',
  is_active: false,
  overlay_opacity: 30,
  position: 'center',
  size: 'cover',
  alt_text: '',
  mobile_url: '',
  thumbnail_url: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

// ============================================================
// COMPOSANT D'UPLOAD D'IMAGE - VERSION CORRIGÉE POUR VOTRE BACKEND
// ============================================================

function ImageUploaderComponent({ 
  onUploadComplete, 
  currentImageUrl, 
  isUploading,
  onUploadStart,
  onUploadError
}: { 
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  isUploading: boolean;
  onUploadStart: () => void;
  onUploadError: (error: string) => void;
}) {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [localUploading, setLocalUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Réinitialiser les erreurs
    onUploadError('');

    // Vérifier le token
    if (!token) {
      onUploadError('Vous devez être connecté pour uploader une image');
      return;
    }

    // Vérifier le type de fichier
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      onUploadError('Veuillez sélectionner une image (JPG, PNG, WEBP)');
      return;
    }

    // Vérifier la taille (max 10 Mo selon votre backend)
    if (file.size > 10 * 1024 * 1024) {
      onUploadError('L\'image ne doit pas dépasser 10 Mo');
      return;
    }

    // Aperçu local
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    onUploadStart();
    setLocalUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
      
      // ✅ Utiliser le bon endpoint selon votre backend
      const response = await fetch(`${API_URL}/api/upload/single`, {
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
      // Votre backend retourne { success, url, filename, ... }
      const imageUrl = data.url;
      
      if (!imageUrl) {
        throw new Error('URL de l\'image non reçue');
      }
      
      console.log('Upload réussi:', imageUrl);
      onUploadComplete(imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setLocalUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUploadComplete('');
  };

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
          <img 
            src={previewUrl} 
            alt="Aperçu" 
            className="w-full h-40 object-cover"
            onError={() => setPreviewUrl(null)}
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-md"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition bg-white">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 font-medium">Cliquez pour uploader une image</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP (max 10 Mo)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
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
// COMPOSANT PRINCIPAL
// ============================================================

export default function BackgroundsManagementPage() {
  const { user, token, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [backgrounds, setBackgrounds] = useState<Record<string, PageBackground>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Vérification des droits d'accès
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Accès non autorisé</h1>
          <p className="text-gray-500 mt-2">Vous n'avez pas les droits pour accéder à cette page.</p>
          <Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  // Chargement de tous les fonds d'écran
  useEffect(() => {
    fetchAllBackgrounds();
  }, []);

  const fetchAllBackgrounds = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const loadedBackgrounds: Record<string, PageBackground> = {};
      
      for (const page of pagesList) {
        try {
          const bg = await pageService.getBackground(page.value);
          if (bg && bg.image_url) {
            loadedBackgrounds[page.value] = bg;
          } else {
            const defaultBg = getDefaultBackground(page.value) as PageBackground;
            loadedBackgrounds[page.value] = defaultBg;
          }
        } catch (error) {
          console.error(`Erreur chargement page ${page.value}:`, error);
          const defaultBg = getDefaultBackground(page.value) as PageBackground;
          loadedBackgrounds[page.value] = defaultBg;
        }
      }
      
      setBackgrounds(loadedBackgrounds);
    } catch (error) {
      console.error('Erreur de chargement:', error);
      setMessage({ type: 'error', text: 'Erreur de chargement des fonds d\'écran' });
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour d'un fond d'écran
  const updateBackground = async (page: string, data: Partial<PageBackground>) => {
    if (!token) {
      setMessage({ type: 'error', text: 'Vous devez être connecté pour effectuer cette action' });
      return;
    }

    setSaving(prev => ({ ...prev, [page]: true }));
    setMessage(null);

    try {
      const updated = await pageService.updateBackground(page, token, data);
      
      setBackgrounds(prev => ({
        ...prev,
        [page]: updated
      }));
      
      setMessage({ 
        type: 'success', 
        text: `Fond d'écran de la page ${page} mis à jour` 
      });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Erreur de mise à jour:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
    } finally {
      setSaving(prev => ({ ...prev, [page]: false }));
    }
  };

  // Gestion de l'upload d'image
  const handleImageUploadStart = (page: string) => {
    setUploading(prev => ({ ...prev, [page]: true }));
  };

  const handleImageUploadComplete = (page: string, url: string) => {
    setUploading(prev => ({ ...prev, [page]: false }));
    updateBackground(page, { image_url: url, is_active: true });
  };

  const handleImageUploadError = (page: string, error: string) => {
    setUploading(prev => ({ ...prev, [page]: false }));
    setMessage({ type: 'error', text: error });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const getPageLabel = (page: typeof pagesList[0]) => {
    return language === 'fr' ? page.label : page.label_mg;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              {language === 'fr' ? 'Gestion des fonds d\'écran' : 'Fitantanana ny sary ambadika'}
            </h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {language === 'fr' 
              ? 'Personnalisez l\'image de fond de chaque page du site'
              : 'Amboary ny sary ambadiky ny pejy tsirairay ao amin\'ny tranonkala'}
          </p>
        </div>
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <ArrowLeft className="w-4 h-4" /> 
          {language === 'fr' ? 'Retour' : 'Miverina'}
        </Link>
      </div>

      {/* Message de statut */}
      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Grille des pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pagesList.map((page) => {
          const bg = backgrounds[page.value];
          const pageLabel = getPageLabel(page);
          const isSaving = saving[page.value];
          const isUploading = uploading[page.value];

          if (!bg) return null;

          return (
            <div key={page.value} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* En-tête de la carte */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-800">{pageLabel}</h2>
                <p className="text-xs text-gray-500">Page: /{page.value}</p>
              </div>

              {/* Contenu de la carte */}
              <div className="p-4 space-y-4">
                
                {/* Zone d'upload d'image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'fr' ? 'Image de fond' : 'Sary ambadika'}
                  </label>
                  <ImageUploaderComponent
                    onUploadComplete={(url) => handleImageUploadComplete(page.value, url)}
                    currentImageUrl={bg?.image_url}
                    isUploading={isUploading}
                    onUploadStart={() => handleImageUploadStart(page.value)}
                    onUploadError={(error) => handleImageUploadError(page.value, error)}
                  />
                </div>

                {/* Aperçu du rendu */}
                {bg.image_url && (
                  <div className="bg-gray-100 rounded-lg p-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'fr' ? 'Aperçu du rendu' : 'Topi-maso'}
                    </label>
                    <div className="relative h-32 rounded-lg overflow-hidden">
                      <img 
                        src={bg.image_url} 
                        alt={pageLabel} 
                        className="w-full h-full object-cover"
                      />
                      <div 
                        className="absolute inset-0" 
                        style={{ backgroundColor: `rgba(0, 0, 0, ${(bg.overlay_opacity || 0) / 100})` }}
                      />
                    </div>
                  </div>
                )}

                {/* Réglages avancés */}
                {bg.image_url && (
                  <>
                    {/* Opacité */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">
                          {language === 'fr' ? 'Assombrissement du fond' : 'Fanamaizana ny sary ambadika'}
                        </label>
                        <span className="text-sm text-gray-500">{bg.overlay_opacity || 0}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={bg.overlay_opacity || 0}
                        onChange={(e) => updateBackground(page.value, { overlay_opacity: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        disabled={isSaving}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {language === 'fr' ? 'Assombrit l\'image pour meilleure lisibilité' : 'Manamaizina ny sary mba hamakiana tsara kokoa'}
                      </p>
                    </div>

                    {/* Position */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'fr' ? 'Position' : 'Toerana'}
                      </label>
                      <select
                        value={bg.position || 'center'}
                        onChange={(e) => updateBackground(page.value, { position: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={isSaving}
                      >
                        <option value="center">Centre</option>
                        <option value="top">Haut</option>
                        <option value="bottom">Bas</option>
                        <option value="left">Gauche</option>
                        <option value="right">Droite</option>
                      </select>
                    </div>

                    {/* Taille */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'fr' ? 'Taille' : 'Habe'}
                      </label>
                      <select
                        value={bg.size || 'cover'}
                        onChange={(e) => updateBackground(page.value, { size: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={isSaving}
                      >
                        <option value="cover">Couvrir</option>
                        <option value="contain">Contenir</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>

                    {/* Texte alternatif */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'fr' ? 'Texte alternatif (SEO)' : 'Soratra hafa (SEO)'}
                      </label>
                      <input
                        type="text"
                        value={bg.alt_text || ''}
                        onChange={(e) => updateBackground(page.value, { alt_text: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={language === 'fr' ? 'Description de l\'image pour les moteurs de recherche' : 'Famaritana ny sary ho an\'ny motera fikarohana'}
                        disabled={isSaving}
                      />
                    </div>

                    {/* Activation */}
                    <label className="flex items-center gap-2 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        checked={bg.is_active || false}
                        onChange={(e) => updateBackground(page.value, { is_active: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        disabled={isSaving}
                      />
                      <span className="text-sm text-gray-700">
                        {language === 'fr' 
                          ? 'Activer le fond d\'écran sur cette page' 
                          : 'Ampiasao ny sary ambadika amin\'ity pejy ity'}
                      </span>
                    </label>

                    {/* Indicateur de sauvegarde */}
                    {isSaving && (
                      <div className="flex items-center gap-2 text-sm text-blue-600 pt-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {language === 'fr' ? 'Enregistrement en cours...' : 'Fitehirizana...'}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}