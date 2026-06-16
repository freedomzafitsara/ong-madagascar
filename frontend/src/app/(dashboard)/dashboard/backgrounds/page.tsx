// frontend/src/app/(dashboard)/dashboard/backgrounds/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { pagesApi } from '@/lib/api';
import { uploadService, UploadedFile } from '@/services/upload.service';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Save,
  X,
  PenSquare,
  Globe,
  Move,
  Search
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
  alt_fr?: string;
  alt_mg?: string;
  created_at: string;
  updated_at: string;
}

interface PageBackgroundUpdate {
  image_url?: string;
  is_active?: boolean;
  overlay_opacity?: number;
  position?: string;
  alt_fr?: string;
  alt_mg?: string;
}

// ============================================================
// CONSTANTES
// ============================================================

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

const PAGE_KEYS = [
  { key: 'home', labelFr: 'Accueil', labelMg: 'Fandraisana' },
  { key: 'projects', labelFr: 'Projets', labelMg: 'Tetikasa' },
  { key: 'jobs', labelFr: 'Emploi', labelMg: 'Asa' },
  { key: 'blog', labelFr: 'Blog', labelMg: 'Blaogy' },
  { key: 'contact', labelFr: 'Contact', labelMg: 'Fifandraisana' },
  { key: 'login', labelFr: 'Connexion', labelMg: 'Hiditra' },
];

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

function ImagePreview({ url, alt, onError }: { url: string; alt: string; onError?: () => void }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !url) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <ImageIcon className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => {
        setHasError(true);
        if (onError) onError();
      }}
    />
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function BackgroundsPage() {
  const { user, token, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  
  const [backgrounds, setBackgrounds] = useState<PageBackground[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentPageKey = useRef<string>('');

  const hasAccess = user?.role === 'super_admin' || user?.role === 'admin';

  const getText = useCallback((fr: string, mg: string) => {
    return language === 'fr' ? fr : mg;
  }, [language]);

  const getPageLabel = useCallback((key: string) => {
    const page = PAGE_KEYS.find(p => p.key === key);
    return page ? getText(page.labelFr, page.labelMg) : key;
  }, [language, getText]);

  const getPositionLabel = useCallback((value: string) => {
    const pos = POSITION_OPTIONS.find(p => p.value === value);
    return pos ? getText(pos.labelFr, pos.labelMg) : value;
  }, [language, getText]);

  // ============================================================
  // CHARGEMENT DES DONNEES
  // ============================================================

  const fetchBackgrounds = useCallback(async () => {
    if (!token || !isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await pagesApi.getAllBackgrounds();
      setBackgrounds(response || []);
    } catch (error) {
      console.error('Erreur chargement fonds d\'ecran:', error);
      toast.error(getText('Erreur de chargement', 'Nisy hadisoana tamin\'ny fampidirana'));
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated, getText]);

  useEffect(() => {
    if (isAuthenticated && hasAccess) {
      fetchBackgrounds();
    }
  }, [isAuthenticated, hasAccess, fetchBackgrounds]);

  // ============================================================
  // GESTION DES FICHIERS
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
      toast.error(getText('Format non supporte (JPG, PNG, WEBP, GIF)', 'Tsy tohana ny format (JPG, PNG, WEBP, GIF)'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(getText('Image trop grande (max 5 Mo)', 'Lehibe loatra ny sary (farany 5 Mo)'));
      return;
    }

    setUploading(pageKey);
    try {
      const result = await uploadService.uploadImage(file, 'background');
      const imageUrl = result.url || uploadService.getImageUrl(result.id);
      
      await pagesApi.updateBackgroundImage(pageKey, imageUrl);
      
      toast.success(getText('Image uploadee avec succes', 'Nahomana ny fampidirana sary'));
      await fetchBackgrounds();
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error(getText('Erreur lors de l\'upload', 'Nisy hadisoana tamin\'ny fampidirana'));
    } finally {
      setUploading(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ============================================================
  // ACTIONS SUR LES FONDS D'ECRAN
  // ============================================================

  // ✅ CORRECTION: Utiliser page_key pour le toggle
  const toggleActive = async (pageKey: string, currentStatus: boolean) => {
    try {
      await pagesApi.toggleBackground(pageKey);
      toast.success(getText('Statut mis a jour', 'Vita ny fanovana sata'));
      await fetchBackgrounds();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(getText('Erreur lors de la mise a jour', 'Nisy hadisoana'));
    }
  };

  const deleteBackground = async (id: string, pageKey: string) => {
    if (!confirm(getText(`Supprimer le fond d'ecran de la page "${getPageLabel(pageKey)}" ?`, `Hofafana ny sary fonony ho an'ny pejy "${getPageLabel(pageKey)}" ?`))) {
      return;
    }

    try {
      await pagesApi.deleteBackground(id);
      toast.success(getText('Fond d\'ecran supprime', 'Vita ny fanafoanana'));
      await fetchBackgrounds();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(getText('Erreur lors de la suppression', 'Nisy hadisoana'));
    }
  };

  const updateBackground = async (id: string, data: PageBackgroundUpdate) => {
    setSaving(true);
    try {
      await pagesApi.updateBackground(id, data);
      toast.success(getText('Fond d\'ecran mis a jour', 'Vita ny fanovana'));
      await fetchBackgrounds();
      setEditingId(null);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(getText('Erreur lors de la mise a jour', 'Nisy hadisoana'));
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // RENDU
  // ============================================================

  if (!isAuthenticated || !hasAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">
            {getText('Acces non autorise', 'Tsy manana alalana')}
          </h1>
          <p className="text-gray-500 mt-2">
            {getText('Vous devez etre administrateur pour acceder a cette page', 'Mila manana alalana admin ianao')}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-800 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center shadow-sm">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {getText('Fonds d\'ecran des pages', 'Sary fonon\'ny pejy')}
            </h1>
            <p className="text-gray-500 text-sm">
              {getText('Personnalisez les images de fond pour chaque page du site', 'Amboary ny sary fonony ho an\'ny pejy tsirairay')}
            </p>
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

      {/* Input file cache */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Grille des fonds d'ecran */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {backgrounds.map((bg) => (
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
                    alt={`Fond d'ecran ${getPageLabel(bg.page_key)}`}
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

            {/* Contenu */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                  {getPageLabel(bg.page_key)}
                </h3>
                <span className="text-xs text-gray-400">
                  {bg.overlay_opacity}% {getText('opacite', 'opacity')}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Globe className="w-3.5 h-3.5" />
                <span>{getPositionLabel(bg.position)}</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleFileSelect(bg.page_key)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition text-sm font-medium"
                >
                  <Upload className="w-4 h-4" />
                  {getText('Uploader', 'Alefaso')}
                </button>

                {/* ✅ CORRECTION: Utiliser page_key pour le toggle */}
                <button
                  onClick={() => toggleActive(bg.page_key, bg.is_active)}
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

                <button
                  onClick={() => deleteBackground(bg.id, bg.page_key)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  title={getText('Supprimer', 'Hamafa')}
                >
                  <Trash2 className="w-4 h-4" />
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
        ))}
      </div>

      {/* Aucun fond d'ecran */}
      {backgrounds.length === 0 && !loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">
            {getText('Aucun fond d\'ecran', 'Tsy misy sary fonony')}
          </h3>
          <p className="text-gray-500 mt-2">
            {getText('Aucun fond d\'ecran n\'a ete configure pour les pages.', 'Mbola tsy misy sary fonony ho an\'ny pejy.')}
          </p>
          <button
            onClick={() => {
              pagesApi.initializePages().then(() => {
                toast.success(getText('Pages initialisees', 'Vita ny fanombohana'));
                fetchBackgrounds();
              }).catch(() => {
                toast.error(getText('Erreur', 'Nisy hadisoana'));
              });
            }}
            className="mt-4 px-6 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition"
          >
            {getText('Initialiser les pages', 'Atombohy ny pejy')}
          </button>
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
  const [opacity, setOpacity] = useState(background.overlay_opacity || 40);
  const [position, setPosition] = useState(background.position || 'center');
  const [altFr, setAltFr] = useState(background.alt_fr || '');
  const [altMg, setAltMg] = useState(background.alt_mg || '');

  const handleSave = () => {
    onSave(background.id, {
      overlay_opacity: opacity,
      position: position,
      alt_fr: altFr || undefined,
      alt_mg: altMg || undefined,
    });
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
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