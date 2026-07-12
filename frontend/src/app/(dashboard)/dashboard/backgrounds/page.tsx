// frontend/src/app/dashboard/backgrounds/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { pagesApi } from '@/lib/api';
import { uploadService } from '@/services/upload.service';
import {
  Image as ImageIcon,
  Upload,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  Save,
  X,
  PenSquare,
  Globe,
  Layers,
  Shield,
  Lock,
  PlusCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================

interface PageBackground {
  id: string;
  page_key: string;
  image_url: string;
  is_active: boolean;
  overlay_opacity: number;
  position: string;
  size: string;
  blur: number;
  brightness: number;
  alt_fr: string | null;
  alt_mg: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

interface PageBackgroundUpdate {
  image_url?: string;
  is_active?: boolean;
  overlay_opacity?: number;
  position?: string;
  size?: string;
  blur?: number;
  brightness?: number;
  alt_fr?: string;
  alt_mg?: string;
}

// ============================================================
// CONSTANTES
// ============================================================

const PAGE_KEYS = [
  { key: 'home', labelFr: 'Accueil', labelMg: 'Fandraisana' },
  { key: 'projects', labelFr: 'Projets', labelMg: 'Tetikasa' },
  { key: 'jobs', labelFr: 'Emploi', labelMg: 'Asa' },
  { key: 'blog', labelFr: 'Blog', labelMg: 'Blaogy' },
  { key: 'contact', labelFr: 'Contact', labelMg: 'Fifandraisana' },
  { key: 'login', labelFr: 'Connexion', labelMg: 'Hiditra' },
  { key: 'all', labelFr: 'Toutes les pages', labelMg: 'Pejy rehetra' },
  { key: 'register', labelFr: 'Inscription', labelMg: 'Fisoratana' },
];

const POSITION_OPTIONS = [
  { value: 'center', labelFr: 'Centre', labelMg: 'Afovoany' },
  { value: 'top', labelFr: 'Haut', labelMg: 'Ambony' },
  { value: 'bottom', labelFr: 'Bas', labelMg: 'Ambany' },
  { value: 'left', labelFr: 'Gauche', labelMg: 'Havana' },
  { value: 'right', labelFr: 'Droite', labelMg: 'Havanana' },
  { value: 'top-left', labelFr: 'Haut gauche', labelMg: 'Ambony havana' },
  { value: 'top-right', labelFr: 'Haut droite', labelMg: 'Ambony havanana' },
  { value: 'bottom-left', labelFr: 'Bas gauche', labelMg: 'Ambany havana' },
  { value: 'bottom-right', labelFr: 'Bas droite', labelMg: 'Ambany havanana' },
];

const SIZE_OPTIONS = [
  { value: 'cover', labelFr: 'Couverture', labelMg: 'Fonona' },
  { value: 'contain', labelFr: 'Contenir', labelMg: 'Tazona' },
  { value: 'fill', labelFr: 'Remplir', labelMg: 'Feno' },
  { value: 'none', labelFr: 'Aucun', labelMg: 'Tsy misy' },
  { value: 'scale-down', labelFr: 'Reduire', labelMg: 'Ahena' },
];

// ============================================================
// FONCTIONS UTILITAIRES - CORRIGEES
// ============================================================

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value === 'true' || value === '1' || value === 'yes' || value === 'on';
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  return false;
};

/**
 * ✅ Construit l'URL complète d'une image - CORRIGE
 * Retourne une chaîne non-null
 */
const buildImageUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4001';
  if (url.startsWith('/uploads')) {
    return `${baseUrl}${url}`;
  }
  if (url.startsWith('/api/uploads')) {
    return `${baseUrl}${url}`;
  }
  if (url.startsWith('/api/upload')) {
    return `${baseUrl}${url}`;
  }
  return `${baseUrl}/${url}`;
};

// ============================================================
// COMPOSANTS
// ============================================================

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isActive
          ? 'bg-green-100 text-green-700 border border-green-200'
          : 'bg-gray-100 text-gray-500 border border-gray-200'
      }`}
    >
      {isActive ? (
        <CheckCircle className="w-3 h-3 text-green-600" />
      ) : (
        <XCircle className="w-3 h-3 text-gray-400" />
      )}
      {isActive ? 'Actif' : 'Inactif'}
    </span>
  );
}

/**
 * ✅ ImagePreview corrigé - Gère les valeurs null
 */
function ImagePreview({ url, alt }: { url: string; alt: string }) {
  const [hasError, setHasError] = useState(false);
  
  // ✅ buildImageUrl retourne toujours une string (jamais null)
  const fullUrl = buildImageUrl(url);

  if (hasError || !fullUrl) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <ImageIcon className="w-8 h-8 text-gray-400" />
        <span className="absolute text-xs text-gray-400 bottom-2">
          {alt || 'Aucune image'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={fullUrl}
      alt={alt || 'Fond d\'ecran'}
      className="w-full h-full object-cover"
      onError={() => setHasError(true)}
      onLoad={() => console.log(`✅ Image chargée: ${fullUrl}`)}
    />
  );
}

function AccessDenied({ message }: { message: string }) {
  const { language } = useLanguage();
  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          {getText('Acces non autorise', 'Tsy manana alalana')}
        </h1>
        <p className="text-gray-500 mt-2">{message}</p>
      </div>
    </div>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function BackgroundsPage() {
  const { user, token, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();
  
  const [backgrounds, setBackgrounds] = useState<PageBackground[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentPageKey = useRef<string>('');

  const getText = useCallback((fr: string, mg: string) => {
    return language === 'fr' ? fr : mg;
  }, [language]);

  const getPageLabel = useCallback((key: string) => {
    const page = PAGE_KEYS.find(p => p.key === key);
    if (page) {
      return getText(page.labelFr, page.labelMg);
    }
    return key;
  }, [language, getText]);

  const getPositionLabel = useCallback((value: string) => {
    const pos = POSITION_OPTIONS.find(p => p.value === value);
    return pos ? getText(pos.labelFr, pos.labelMg) : value;
  }, [language, getText]);

  const getSizeLabel = useCallback((value: string) => {
    const size = SIZE_OPTIONS.find(p => p.value === value);
    return size ? getText(size.labelFr, size.labelMg) : value;
  }, [language, getText]);

  // ============================================================
  // CHARGEMENT DES DONNEES - CORRIGE
  // ============================================================

  const fetchBackgrounds = useCallback(async () => {
    if (!token || !isAuthenticated || !isAdmin) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await pagesApi.getAllBackgrounds();
      
      let backgroundsData: PageBackground[] = [];
      
      if (Array.isArray(response)) {
        backgroundsData = response;
      } else if (response && typeof response === 'object') {
        if ('data' in response && Array.isArray((response as any).data)) {
          backgroundsData = (response as any).data;
        } else if ('items' in response && Array.isArray((response as any).items)) {
          backgroundsData = (response as any).items;
        } else if ('id' in response) {
          backgroundsData = [response as PageBackground];
        }
      }
      
      // ✅ S'assurer que les URLs sont complètes et valides
      backgroundsData = backgroundsData.map(bg => ({
        ...bg,
        is_active: toBoolean(bg.is_active),
        overlay_opacity: typeof bg.overlay_opacity === 'number' ? bg.overlay_opacity : 35,
        size: bg.size || 'cover',
        blur: bg.blur || 0,
        brightness: bg.brightness || 100,
        alt_fr: bg.alt_fr || null,
        alt_mg: bg.alt_mg || null,
        image_url: buildImageUrl(bg.image_url), // ✅ buildImageUrl retourne string
      }));
      
      setBackgrounds(backgroundsData);
      
      if (backgroundsData.length === 0) {
        setError('Aucun fond d\'ecran trouve dans la base de donnees');
      }
      
    } catch (err) {
      console.error('Erreur chargement:', err);
      setError('Erreur de chargement des donnees');
      setBackgrounds([]);
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated, isAdmin]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchBackgrounds();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, fetchBackgrounds]);

  // ============================================================
  // INITIALISATION
  // ============================================================

  const initializePages = async () => {
    if (!token || !isAuthenticated || !isAdmin) {
      toast.error(getText('Vous devez etre connecte', 'Mila miditra ianao'));
      return;
    }

    setInitializing(true);
    try {
      const result = await pagesApi.initializePages();
      
      if (result.success) {
        toast.success(result.message || getText('Pages initialisees avec succes', 'Nahomana ny fanombohana pejy'));
      } else {
        toast.error(result.message || getText('Erreur lors de l\'initialisation', 'Nisy hadisoana tamin\'ny fanombohana'));
      }
      
      await fetchBackgrounds();
      
    } catch (err: any) {
      console.error('Erreur initialisation:', err);
      toast.error(err.response?.data?.message || getText('Erreur lors de l\'initialisation', 'Nisy hadisoana tamin\'ny fanombohana'));
    } finally {
      setInitializing(false);
    }
  };

  // ============================================================
  // UPLOAD
  // ============================================================

  const handleFileSelect = (pageKey: string) => {
    currentPageKey.current = pageKey;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const pageKey = currentPageKey.current;
    if (!pageKey) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error(getText('Format non supporte', 'Tsy tohana ny format'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(getText('Image trop grande (max 5 Mo)', 'Lehibe loatra ny sary (farany 5 Mo)'));
      return;
    }

    setUploading(pageKey);
    try {
      const result = await uploadService.uploadImage(file, 'background');
      // ✅ buildImageUrl retourne string
      const imageUrl = buildImageUrl(result.url || result.id);
      
      await pagesApi.updateBackgroundImage(pageKey, imageUrl);
      
      toast.success(getText('Image uploadee avec succes', 'Nahomana ny fampidirana sary'));
      await fetchBackgrounds();
    } catch (err) {
      console.error('Erreur upload:', err);
      toast.error(getText('Erreur lors de l\'upload', 'Nisy hadisoana tamin\'ny fampidirana'));
    } finally {
      setUploading(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ============================================================
  // ACTIONS
  // ============================================================

  const toggleActive = async (pageKey: string) => {
    try {
      await pagesApi.toggleBackground(pageKey);
      toast.success(getText('Statut mis a jour', 'Vita ny fanovana sata'));
      await fetchBackgrounds();
    } catch (err) {
      console.error('Erreur:', err);
      toast.error(getText('Erreur lors de la mise a jour', 'Nisy hadisoana'));
    }
  };

  const updateBackground = async (id: string, data: PageBackgroundUpdate) => {
    setSaving(true);
    try {
      await pagesApi.updateBackground(id, data);
      toast.success(getText('Fond d\'ecran mis a jour', 'Vita ny fanovana'));
      await fetchBackgrounds();
      setEditingId(null);
    } catch (err) {
      console.error('Erreur mise a jour:', err);
      toast.error(getText('Erreur lors de la mise a jour', 'Nisy hadisoana'));
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // RENDU
  // ============================================================

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-800 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AccessDenied 
        message={getText(
          'Veuillez vous connecter pour acceder a cette page',
          'Mila miditra ianao vao mahazo miditra amin\'ity pejy ity'
        )}
      />
    );
  }

  if (!isAdmin) {
    return (
      <AccessDenied 
        message={getText(
          'Cette page est reservee aux administrateurs',
          'Ity pejy ity dia ho an\'ny mpitantana ihany'
        )}
      />
    );
  }

  return (
    <div className="space-y-6 pb-8">
      
      {/* En-tete */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center shadow-sm">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {getText('Fonds d\'ecran des pages', 'Sary fonon\'ny pejy')}
            </h1>
            <p className="text-gray-500 text-sm">
              {getText('Personnalisez les images de fond pour chaque page du site', 'Amboary ny sary fonony ho an\'ny pejy tsirairay')}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">
                {getText('Acces administrateur', 'Fidirana mpitantana')}
              </span>
            </div>
            {backgrounds.length > 0 && (
              <div className="text-xs text-gray-400 mt-1">
                {backgrounds.length} {getText('fonds d\'ecran charges', 'sary fonony voaray')}
              </div>
            )}
            {error && (
              <div className="text-xs text-red-500 mt-1">{error}</div>
            )}
          </div>
        </div>
        <button
          onClick={fetchBackgrounds}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm">{getText('Actualiser', 'Havaozina')}</span>
        </button>
      </div>

      {/* Input cache */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Grille */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {backgrounds.length > 0 ? (
          backgrounds.map((bg) => {
            const pageLabel = getPageLabel(bg.page_key);
            const isKnownPage = PAGE_KEYS.some(p => p.key === bg.page_key);
            
            return (
              <div
                key={bg.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  {uploading === bg.page_key ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <Loader2 className="w-10 h-10 text-blue-800 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <ImagePreview
                        url={bg.image_url}
                        alt={`Fond d'ecran ${pageLabel}`}
                      />
                      {!bg.is_active && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-sm font-medium px-3 py-1 bg-red-500 rounded-full">
                            {getText('Desactive', 'Tsy miasa')}
                          </span>
                        </div>
                      )}
                      {bg.is_active && (
                        <div className="absolute top-3 left-3">
                          <StatusBadge isActive={bg.is_active} />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Informations */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">
                      {pageLabel}
                      {!isKnownPage && (
                        <span className="ml-2 text-xs text-gray-400 font-normal">
                          ({bg.page_key})
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {bg.overlay_opacity}% opacite
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{getPositionLabel(bg.position)}</span>
                    <span className="text-gray-300">|</span>
                    <span>{getSizeLabel(bg.size)}</span>
                    {bg.blur > 0 && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span>Flou: {bg.blur}px</span>
                      </>
                    )}
                  </div>

                  {/* Boutons */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleFileSelect(bg.page_key)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition text-sm font-medium"
                    >
                      <Upload className="w-4 h-4" />
                      {getText('Uploader', 'Alefaso')}
                    </button>

                    <button
                      onClick={() => toggleActive(bg.page_key)}
                      className={`p-2 rounded-lg transition ${
                        bg.is_active
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      title={bg.is_active ? getText('Desactiver', 'Ajanony') : getText('Activer', 'Ampiasao')}
                    >
                      {bg.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => setEditingId(editingId === bg.id ? null : bg.id)}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                      title={getText('Modifier', 'Hanova')}
                    >
                      <PenSquare className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Formulaire d'edition */}
                  {editingId === bg.id && (
                    <EditForm
                      background={bg}
                      onSave={updateBackground}
                      onCancel={() => setEditingId(null)}
                      saving={saving}
                      getText={getText}
                    />
                  )}
                </div>
              </div>
            );
          })
        ) : (
          /* Etat vide */
          <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-10 h-10 text-blue-800" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">
              {getText('Aucun fond d\'ecran configure', 'Tsy misy sary fonony napetraka')}
            </h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              {error || getText(
                'Aucun fond d\'ecran n\'a ete configure pour les pages.',
                'Mbola tsy misy sary fonony ho an\'ny pejy.'
              )}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={initializePages}
                disabled={initializing}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50 text-sm font-medium"
              >
                {initializing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {getText('Initialisation...', 'Fanombohana...')}
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5" />
                    {getText('Initialiser les pages', 'Atombohy ny pejy')}
                  </>
                )}
              </button>
              <button
                onClick={fetchBackgrounds}
                className="inline-flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                {getText('Recharger', 'Avereno')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques */}
      {backgrounds.length > 0 && (
        <div className="text-sm text-gray-500 text-center border-t border-gray-100 pt-4">
          {getText('Total:', 'Rehetra:')} {backgrounds.length} {getText('fonds d\'ecran', 'sary fonony')}
          {' - '}
          {backgrounds.filter(b => b.is_active).length} {getText('actifs', 'miasa')}
          {' - '}
          {backgrounds.filter(b => !b.is_active).length} {getText('inactifs', 'tsy miasa')}
        </div>
      )}
    </div>
  );
}

// ============================================================
// FORMULAIRE D'EDITION
// ============================================================

function EditForm({
  background,
  onSave,
  onCancel,
  saving,
  getText
}: {
  background: PageBackground;
  onSave: (id: string, data: PageBackgroundUpdate) => void;
  onCancel: () => void;
  saving: boolean;
  getText: (fr: string, mg: string) => string;
}) {
  const [opacity, setOpacity] = useState(background.overlay_opacity);
  const [position, setPosition] = useState(background.position);
  const [size, setSize] = useState(background.size);
  const [blur, setBlur] = useState(background.blur);
  const [brightness, setBrightness] = useState(background.brightness);
  const [altFr, setAltFr] = useState(background.alt_fr || '');
  const [altMg, setAltMg] = useState(background.alt_mg || '');

  const handleSave = () => {
    onSave(background.id, {
      overlay_opacity: opacity,
      position: position,
      size: size,
      blur: blur,
      brightness: brightness,
      alt_fr: altFr || undefined,
      alt_mg: altMg || undefined,
    });
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
      
      {/* Opacite */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {getText('Opacite du voile', 'Opacity')}
          <span className="ml-2 text-gray-400">{opacity}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={opacity}
          onChange={(e) => setOpacity(parseInt(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-800"
        />
      </div>

      {/* Position */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {getText('Position', 'Toerana')}
        </label>
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none bg-white"
        >
          {POSITION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {getText(opt.labelFr, opt.labelMg)}
            </option>
          ))}
        </select>
      </div>

      {/* Taille */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {getText('Taille', 'Habeny')}
        </label>
        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none bg-white"
        >
          {SIZE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {getText(opt.labelFr, opt.labelMg)}
            </option>
          ))}
        </select>
      </div>

      {/* Flou */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {getText('Flou', 'Manjavozavo')}
          <span className="ml-2 text-gray-400">{blur}px</span>
        </label>
        <input
          type="range"
          min="0"
          max="20"
          value={blur}
          onChange={(e) => setBlur(parseInt(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-800"
        />
      </div>

      {/* Luminosite */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {getText('Luminosite', 'Hazavana')}
          <span className="ml-2 text-gray-400">{brightness}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="200"
          value={brightness}
          onChange={(e) => setBrightness(parseInt(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-800"
        />
      </div>

      {/* Alt FR */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {getText('Texte alternatif (FR)', 'Sary fanoloana (FR)')}
        </label>
        <input
          type="text"
          value={altFr}
          onChange={(e) => setAltFr(e.target.value)}
          placeholder={getText('Description de l\'image', 'Famaritana ny sary')}
          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none"
        />
      </div>

      {/* Alt MG */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {getText('Texte alternatif (MG)', 'Sary fanoloana (MG)')}
        </label>
        <input
          type="text"
          value={altMg}
          onChange={(e) => setAltMg(e.target.value)}
          placeholder={getText('Famaritana ny sary', 'Description de l\'image')}
          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none"
        />
      </div>

      {/* Boutons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50 text-sm font-medium"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {getText('Enregistrer', 'Tehirizo')}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}