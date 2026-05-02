// src/app/dashboard/media/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Trash2, 
  Eye, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Image as ImageIcon,
  Camera,
  Info,
  ArrowRight,
  X
} from 'lucide-react';
import { getBanner, saveBanner, deleteBanner } from '@/services/imageDB';

export default function MediaPage() {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger la bannière au chargement
  useEffect(() => {
    loadBanner();
    
    // Écouter les mises à jour
    const handleUpdate = () => loadBanner();
    window.addEventListener('banner-updated', handleUpdate);
    return () => window.removeEventListener('banner-updated', handleUpdate);
  }, []);

  // Nettoyer preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const loadBanner = async () => {
    setIsLoading(true);
    try {
      const banner = await getBanner();
      if (banner && banner.url) {
        setBannerUrl(banner.url);
      }
    } catch (error) {
      console.error('Erreur chargement bannière:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.7): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
              resolve(compressedFile);
            } else {
              reject(new Error('Erreur de compression'));
            }
          }, 'image/jpeg', quality);
        };
        img.onerror = () => reject(new Error('Erreur de chargement image'));
      };
      reader.onerror = () => reject(new Error('Erreur de lecture fichier'));
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifications
    if (!file.type.startsWith('image/')) {
      showMessage('Veuillez sélectionner une image', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage('L\'image ne doit pas dépasser 5 Mo', 'error');
      return;
    }

    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showMessage('Sélectionnez d\'abord une image', 'error');
      return;
    }

    setIsUploading(true);

    try {
      // Compression de l'image
      const compressedFile = await compressImage(selectedFile, 1200, 0.7);
      
      // Supprimer l'ancienne bannière
      if (bannerUrl) {
        await deleteBanner();
      }
      
      // Sauvegarder la nouvelle bannière
      const url = await saveBanner(compressedFile, 'Bannière Y-Mad');
      
      setBannerUrl(url);
      setPreviewUrl(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      showMessage('✅ Bannière mise à jour avec succès !', 'success');
      
      // Déclencher l'événement
      window.dispatchEvent(new Event('banner-updated'));
      
    } catch (error) {
      console.error('Erreur upload:', error);
      showMessage('Erreur lors de l\'upload', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('⚠️ Supprimer définitivement la bannière ? Cette action est irréversible.')) return;

    try {
      await deleteBanner();
      setBannerUrl(null);
      setPreviewUrl(null);
      setSelectedFile(null);
      showMessage('Bannière supprimée avec succès', 'success');
      window.dispatchEvent(new Event('banner-updated'));
    } catch (error) {
      showMessage('Erreur lors de la suppression', 'error');
    }
  };

  const cancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-ymad-blue-100 rounded-xl flex items-center justify-center">
            <Camera className="w-5 h-5 text-ymad-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ymad-gray-800">Gestion des médias</h1>
            <p className="text-ymad-gray-500 mt-1">Gérez la bannière d'accueil du site Y-Mad</p>
          </div>
        </div>
      </div>

      {/* Message de notification */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="flex-1">{message.text}</span>
          <button onClick={() => setMessage(null)} className="opacity-50 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* État de chargement */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-ymad-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-ymad-gray-500">Chargement...</span>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Aperçu de la bannière actuelle */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-ymad-gray-100">
            <h2 className="text-lg font-semibold text-ymad-gray-800 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-ymad-blue-600" />
              Bannière actuelle
            </h2>
            <div className="relative w-full h-56 bg-ymad-gray-100 rounded-lg overflow-hidden border border-ymad-gray-200">
              {bannerUrl ? (
                <img 
                  src={bannerUrl} 
                  alt="Bannière Y-Mad" 
                  className="w-full h-full object-cover"
                  onError={() => setBannerUrl(null)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-ymad-gray-400">
                  <ImageIcon className="w-16 h-16 mb-3 opacity-50" />
                  <p className="font-medium">Aucune bannière configurée</p>
                  <p className="text-sm mt-1">Utilisez le formulaire ci-dessous pour en ajouter une</p>
                </div>
              )}
            </div>
            {bannerUrl && (
              <div className="flex justify-between items-center mt-4">
                <a 
                  href={bannerUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-ymad-blue-600 text-sm hover:underline inline-flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" /> Voir l'image en grand
                </a>
                <button 
                  onClick={handleDelete} 
                  className="text-red-500 text-sm hover:text-red-600 inline-flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              </div>
            )}
          </div>

          {/* Zone d'upload */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-ymad-gray-100">
            <h2 className="text-lg font-semibold text-ymad-gray-800 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-ymad-blue-600" />
              Changer la bannière
            </h2>
            
            {/* Preview avant upload */}
            {previewUrl && (
              <div className="mb-4 p-4 bg-ymad-blue-50 rounded-lg border border-ymad-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-ymad-blue-700 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Aperçu de la nouvelle image
                  </p>
                  <button onClick={cancelPreview} className="text-ymad-gray-400 hover:text-ymad-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative w-full h-40 rounded-lg overflow-hidden bg-white">
                  <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            
            <div className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
              previewUrl ? 'border-ymad-blue-400 bg-ymad-blue-50' : 'border-ymad-gray-300 bg-ymad-gray-50 hover:border-ymad-blue-400'
            }`}>
              <input
                ref={fileInputRef}
                type="file"
                id="bannerInput"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              <label htmlFor="bannerInput" className="cursor-pointer block">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-ymad-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-ymad-gray-700 font-medium">Téléchargement en cours...</p>
                    <p className="text-sm text-ymad-gray-500">Compression et optimisation de l'image</p>
                  </div>
                ) : (
                  <div>
                    <div className="w-20 h-20 bg-ymad-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-ymad-blue-600" />
                    </div>
                    <p className="text-ymad-gray-700 font-medium">Cliquez pour sélectionner une image</p>
                    <p className="text-sm text-ymad-gray-500 mt-1">
                      JPEG, PNG, WebP • Max 5 Mo
                    </p>
                    <p className="text-xs text-ymad-gray-400 mt-2">
                      Format paysage recommandé : 1920 x 1080 pixels
                    </p>
                  </div>
                )}
              </label>
            </div>
            
            {previewUrl && !isUploading && (
              <div className="mt-4">
                <button
                  onClick={handleUpload}
                  className="w-full bg-ymad-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-ymad-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Appliquer cette bannière
                </button>
              </div>
            )}
          </div>

          {/* Aperçu sur le site */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-ymad-gray-100">
            <h2 className="text-lg font-semibold text-ymad-gray-800 mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-ymad-blue-600" />
              Aperçu sur le site
            </h2>
            <div className="relative h-40 bg-gradient-to-r from-ymad-gray-800 to-ymad-gray-900 rounded-xl overflow-hidden">
              {(bannerUrl || previewUrl) && (
                <img 
                  src={previewUrl || bannerUrl || ''} 
                  alt="Aperçu bannière" 
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
              )}
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
                <h3 className="text-white font-bold text-xl">Y-Mad Madagascar</h3>
                <p className="text-ymad-blue-200 text-sm">Jeunesse Malgache en Action pour le Développement</p>
              </div>
            </div>
            <p className="text-xs text-ymad-gray-400 mt-3 text-center flex items-center justify-center gap-1">
              <Info className="w-3 h-3" /> L'aperçu montre comment la bannière s'affichera sur la page d'accueil
            </p>
          </div>

          {/* Guide */}
          <div className="bg-ymad-blue-50 rounded-xl p-5 border border-ymad-blue-100">
            <h3 className="font-semibold text-ymad-blue-800 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Conseils pour la bannière
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-ymad-blue-600">📐</span>
                  <span><strong className="text-ymad-gray-700">Format recommandé :</strong> 1920 x 1080 pixels (paysage)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ymad-blue-600">⚖️</span>
                  <span><strong className="text-ymad-gray-700">Poids maximum :</strong> 5 Mo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ymad-blue-600">🖼️</span>
                  <span><strong className="text-ymad-gray-700">Formats acceptés :</strong> JPG, PNG, WebP</span>
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-ymad-blue-600">🎯</span>
                  <span><strong className="text-ymad-gray-700">Thème :</strong> Actions terrain, jeunesse malgache</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ymad-blue-600">🎨</span>
                  <span><strong className="text-ymad-gray-700">Qualité :</strong> Image haute résolution sans texte</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ymad-blue-600">💡</span>
                  <span><strong className="text-ymad-gray-700">Astuce :</strong> Évitez les textes sur l'image</span>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}