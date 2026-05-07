// src/app/(dashboard)/dashboard/backgrounds/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Upload, X, CheckCircle, AlertCircle, Loader2,
  Image, Trash2, Eye, RefreshCw, Home, Briefcase,
  FileText, Calendar, Mail, Heart, Layers
} from 'lucide-react';

interface Background {
  id: string;
  page: string;
  pageKey: string;
  title: string;
  imageUrl: string;
  filename?: string;
  updatedAt: string;
  updatedBy: string;
}

const pageConfigs = [
  { key: 'home', title: 'Page Accueil', icon: <Home className="w-5 h-5" />, description: 'Fond d\'écran pour la page d\'accueil' },
  { key: 'projects', title: 'Page Projets', icon: <Briefcase className="w-5 h-5" />, description: 'Fond d\'écran pour la page "Nos projets"' },
  { key: 'jobs', title: 'Page Offres d\'emploi', icon: <FileText className="w-5 h-5" />, description: 'Fond d\'écran pour la page "Offres d\'emploi"' },
  { key: 'blog', title: 'Page Actualités', icon: <FileText className="w-5 h-5" />, description: 'Fond d\'écran pour la page "Blog / Actualités"' },
  { key: 'events', title: 'Page Événements', icon: <Calendar className="w-5 h-5" />, description: 'Fond d\'écran pour la page "Événements"' },
  { key: 'contact', title: 'Page Contact', icon: <Mail className="w-5 h-5" />, description: 'Fond d\'écran pour la page "Contact"' },
  { key: 'donate', title: 'Page Don', icon: <Heart className="w-5 h-5" />, description: 'Fond d\'écran pour la page "Faire un don"' },
];

const STORAGE_KEY = 'ymad_page_backgrounds';

// Images par défaut (placeholders)
const defaultImages: Record<string, string> = {
  home: '/images/hero-bg.jpg',
  projects: '/images/projects-bg.jpg',
  jobs: '/images/jobs-bg.jpg',
  blog: '/images/blog-bg.jpg',
  events: '/images/events-bg.jpg',
  contact: '/images/contact-bg.jpg',
  donate: '/images/donate-bg.jpg',
};

export default function BackgroundsPage() {
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    loadBackgrounds();
  }, []);

  const loadBackgrounds = () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setBackgrounds(parsed);
      } else {
        const defaultBg: Background[] = pageConfigs.map(config => ({
          id: `${config.key}_default`,
          page: config.title,
          pageKey: config.key,
          title: `Fond ${config.title}`,
          imageUrl: defaultImages[config.key],
          updatedAt: new Date().toISOString(),
          updatedBy: 'system'
        }));
        setBackgrounds(defaultBg);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBg));
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      showMessage('Erreur lors du chargement des fonds', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const getBackgroundForPage = (pageKey: string): Background | undefined => {
    return backgrounds.find(b => b.pageKey === pageKey);
  };

  const handleUpload = async (pageConfig: typeof pageConfigs[0], file: File) => {
    if (!file.type.startsWith('image/')) {
      showMessage('Veuillez sélectionner une image', 'error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showMessage('L\'image ne doit pas dépasser 5 Mo', 'error');
      return;
    }

    setUploading(pageConfig.key);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pageKey', pageConfig.key);

      const response = await fetch('/api/upload/background', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur upload');
      }

      const oldBackground = getBackgroundForPage(pageConfig.key);
      if (oldBackground?.filename) {
        await fetch(`/api/upload/background/delete?filename=${oldBackground.filename}`, {
          method: 'DELETE',
        });
      }

      const newBackground: Background = {
        id: `${pageConfig.key}_${Date.now()}`,
        page: pageConfig.title,
        pageKey: pageConfig.key,
        title: `Fond ${pageConfig.title}`,
        imageUrl: result.imageUrl,
        filename: result.filename,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      };
      
      const filtered = backgrounds.filter(b => b.pageKey !== pageConfig.key);
      const updated = [...filtered, newBackground];
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setBackgrounds(updated);
      showMessage(`Fond d'écran pour "${pageConfig.title}" mis à jour avec succès`, 'success');
    } catch (error) {
      console.error('Erreur upload:', error);
      showMessage('Erreur lors de l\'upload', 'error');
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (pageKey: string) => {
    if (confirm('Réinitialiser ce fond d\'écran ?')) {
      const background = getBackgroundForPage(pageKey);
      
      if (background?.filename) {
        try {
          await fetch(`/api/upload/background/delete?filename=${background.filename}`, {
            method: 'DELETE',
          });
        } catch (error) {
          console.error('Erreur suppression fichier:', error);
        }
      }
      
      const defaultBg: Background = {
        id: `${pageKey}_default_${Date.now()}`,
        page: pageConfigs.find(c => c.key === pageKey)?.title || '',
        pageKey: pageKey,
        title: `Fond ${pageKey}`,
        imageUrl: defaultImages[pageKey],
        updatedAt: new Date().toISOString(),
        updatedBy: 'system'
      };
      
      const filtered = backgrounds.filter(b => b.pageKey !== pageKey);
      const updated = [...filtered, defaultBg];
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setBackgrounds(updated);
      showMessage('Fond d\'écran réinitialisé', 'success');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Layers className="w-7 h-7 text-blue-600" />
            Fonds d'écran
          </h1>
          <p className="text-gray-500 mt-1">Personnalisez l'image de fond de chaque page du site public</p>
        </div>
        <button onClick={loadBackgrounds} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pageConfigs.map((pageConfig) => {
          const background = getBackgroundForPage(pageConfig.key);
          const isUploading = uploading === pageConfig.key;
          const imageUrl = background?.imageUrl || defaultImages[pageConfig.key];
          
          return (
            <div key={pageConfig.key} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    {pageConfig.icon}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800">{pageConfig.title}</h2>
                    <p className="text-xs text-gray-500">{pageConfig.description}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(pageConfig.key)} className="p-1 text-red-500 hover:bg-red-50 rounded transition" title="Réinitialiser">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="relative h-48 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={`Fond ${pageConfig.title}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Image+non+trouvée';
                    }}
                  />
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setPreviewImage(imageUrl)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                    <Eye className="w-4 h-4" />
                    Aperçu
                  </button>
                  <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition cursor-pointer bg-blue-600 text-white hover:bg-blue-700`}>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(pageConfig, file);
                        e.target.value = '';
                      }}
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Upload...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Changer
                      </>
                    )}
                  </label>
                </div>
                
                {background && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Mis à jour le {new Date(background.updatedAt).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl w-full bg-white rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-[60vh] w-full bg-gray-900">
              <img src={previewImage} alt="Aperçu fond d'écran" className="w-full h-full object-contain" />
            </div>
            <div className="p-4 border-t flex justify-end">
              <button onClick={() => setPreviewImage(null)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}