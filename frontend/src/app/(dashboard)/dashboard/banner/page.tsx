// src/app/dashboard/banner/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, RefreshCw, CheckCircle, AlertCircle, Eye, X } from 'lucide-react';
import { Image as ImageIcon } from 'lucide-react';
import { saveBanner, getBanner, deleteBanner } from '@/services/imageDB';

export default function BannerPage() {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBanner();
  }, []);

  const loadBanner = async () => {
    setLoading(true);
    try {
      const banner = await getBanner();
      console.log('Bannière chargée:', banner);
      if (banner && banner.url) {
        setBannerUrl(banner.url);
      } else {
        setBannerUrl(null);
      }
    } catch (error) {
      console.error('Erreur chargement bannière:', error);
    } finally {
      setLoading(false);
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMessage('Veuillez sélectionner une image', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showMessage('L\'image ne doit pas dépasser 10 Mo', 'error');
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

    setUploading(true);
    try {
      // Compression de l'image
      const compressedFile = await compressImage(selectedFile, 1200, 0.7);
      
      // Sauvegarder la nouvelle bannière dans IndexedDB
      const url = await saveBanner(compressedFile, 'Bannière Y-Mad');
      console.log('Bannière sauvegardée, URL:', url);
      
      setBannerUrl(url);
      setPreviewUrl(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      showMessage('✅ Bannière mise à jour avec succès !', 'success');
      
      // Déclencher l'événement pour rafraîchir la page d'accueil
      window.dispatchEvent(new Event('banner-updated'));
      
    } catch (error) {
      console.error('Erreur upload:', error);
      showMessage('Erreur lors de l\'upload', 'error');
    } finally {
      setUploading(false);
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
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">🎨 Gestion de la bannière</h1>
        <p className="text-gray-500 mt-1">Personnalisez l'image de fond de la page d'accueil</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne de gauche - Aperçu actuel */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Bannière actuelle
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
              {bannerUrl ? (
                <img 
                  src={bannerUrl} 
                  alt="Bannière Y-Mad" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <p className="text-sm">Aucune bannière</p>
                  <p className="text-xs mt-1">Utilisez le formulaire ci-contre</p>
                </div>
              )}
            </div>
          </div>

          {bannerUrl && (
            <div className="mt-4 flex justify-between items-center">
              <a 
                href={bannerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline inline-flex items-center gap-1"
              >
                <Eye className="w-4 h-4" /> Voir l'image en grand
              </a>
              <button
                onClick={handleDelete}
                className="text-red-500 text-sm hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          )}
        </div>

        {/* Colonne de droite - Upload */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Télécharger une nouvelle bannière
          </h2>
          
          {/* Preview de la nouvelle image */}
          {previewUrl && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-blue-700 font-medium">🔄 Aperçu :</p>
                <button onClick={cancelPreview} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative w-full h-32 rounded-lg overflow-hidden bg-white">
                <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          
          <div className={`border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer ${
            previewUrl ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400'
          }`}>
            <input
              ref={fileInputRef}
              type="file"
              id="bannerUpload"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <label htmlFor="bannerUpload" className="cursor-pointer block">
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600 font-medium">Téléchargement en cours...</p>
                  <p className="text-sm text-gray-400">Compression de l'image...</p>
                </div>
              ) : (
                <div>
                  <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-gray-600 font-medium">Cliquez pour sélectionner une image</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Formats supportés : JPEG, PNG, WebP
                  </p>
                  <p className="text-xs text-gray-400">
                    Taille maximale : 10 Mo
                  </p>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      💡 <strong>Conseil :</strong> Utilisez une image de qualité<br />
                      Format recommandé : 1920 x 1080 pixels (paysage)
                    </p>
                  </div>
                </div>
              )}
            </label>
          </div>
          
          {previewUrl && !uploading && (
            <div className="mt-4">
              <button
                onClick={handleUpload}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Appliquer cette bannière
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Aperçu sur le site */}
      <div className="mt-6 bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-blue-600" />
          Aperçu sur le site
        </h2>
        
        <div className="relative h-40 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl overflow-hidden">
          {bannerUrl && (
            <img 
              src={bannerUrl} 
              alt="Aperçu bannière" 
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          )}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <h3 className="text-2xl font-bold text-white">Y-Mad Madagascar</h3>
            <p className="text-white/80 text-sm">Jeunesse Malgache en Action pour le Développement</p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 text-center">
            💡 La bannière apparaîtra en plein écran sur la page d'accueil
          </p>
        </div>
      </div>

      {/* Guide */}
      <div className="mt-6 bg-blue-50 rounded-xl p-5">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Conseils pour la bannière</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Format recommandé : 1920 x 1080 pixels (paysage)</li>
          <li>• Poids maximum : 10 Mo</li>
          <li>• Formats acceptés : JPG, PNG, WebP</li>
          <li>• Évitez les textes sur l'image pour une meilleure lisibilité</li>
          <li>• Thème : projets terrain, jeunesse malgache, développement</li>
        </ul>
      </div>
    </div>
  );
}