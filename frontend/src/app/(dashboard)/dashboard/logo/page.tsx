// src/app/dashboard/logo/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, RefreshCw, CheckCircle, AlertCircle, Image as ImageIcon, Eye } from 'lucide-react';
import { saveLogo, getLogo, deleteLogo } from '@/services/imageDB';

export default function LogoPage() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadLogo();
  }, []);

  const loadLogo = async () => {
    setLoading(true);
    try {
      const logo = await getLogo();
      console.log('Logo chargé:', logo);
      if (logo && logo.url) {
        setLogoUrl(logo.url);
      }
    } catch (error) {
      console.error('Erreur chargement logo:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const compressImage = (file: File, maxWidth: number = 300): Promise<File> => {
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
              const compressedFile = new File([blob], file.name, { type: 'image/png' });
              resolve(compressedFile);
            } else {
              reject(new Error('Erreur de compression'));
            }
          }, 'image/png', 0.9);
        };
        img.onerror = () => reject(new Error('Erreur de chargement'));
      };
      reader.onerror = () => reject(new Error('Erreur de lecture'));
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMessage('Veuillez sélectionner une image', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showMessage('L\'image ne doit pas dépasser 2 Mo', 'error');
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
      const compressedFile = await compressImage(selectedFile, 300);
      
      // Supprimer l'ancien logo s'il existe
      if (logoUrl) {
        await deleteLogo();
      }
      
      // Sauvegarder le nouveau logo
      const url = await saveLogo(compressedFile, 'Logo Y-Mad');
      console.log('Logo sauvegardé, URL:', url);
      
      setLogoUrl(url);
      setPreviewUrl(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      showMessage('✅ Logo mis à jour avec succès !', 'success');
      
      // Déclencher l'événement pour rafraîchir le header
      window.dispatchEvent(new Event('logo-updated'));
      
    } catch (error) {
      console.error('Erreur upload:', error);
      showMessage('Erreur lors de l\'upload', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('⚠️ Supprimer définitivement le logo ? Cette action est irréversible.')) return;
    
    try {
      await deleteLogo();
      setLogoUrl(null);
      setPreviewUrl(null);
      setSelectedFile(null);
      showMessage('Logo supprimé avec succès', 'success');
      window.dispatchEvent(new Event('logo-updated'));
    } catch (error) {
      showMessage('Erreur lors de la suppression', 'error');
    }
  };

  const cancelPreview = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-ymad-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ymad-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ymad-gray-800">🖼️ Gestion du logo</h1>
        <p className="text-ymad-gray-500 mt-1">Personnalisez le logo affiché dans l'en-tête du site</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="flex-1">{message.text}</span>
          <button onClick={() => setMessage(null)} className="opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne de gauche - Aperçu actuel */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-ymad-gray-100">
          <h2 className="text-lg font-semibold text-ymad-gray-800 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-ymad-blue-600" />
            Logo actuel
          </h2>
          
          <div className="bg-ymad-gray-50 rounded-lg p-8 border-2 border-dashed border-ymad-gray-200 flex items-center justify-center min-h-[200px]">
            {logoUrl ? (
              <div className="relative group">
                <img 
                  src={logoUrl} 
                  alt="Logo Y-Mad" 
                  className="max-h-32 w-auto object-contain"
                />
                <button
                  onClick={handleDelete}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 bg-ymad-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ImageIcon className="w-10 h-10 text-ymad-gray-400" />
                </div>
                <p className="text-ymad-gray-400 text-sm">Aucun logo personnalisé</p>
                <p className="text-xs text-ymad-gray-400 mt-1">Le logo par défaut sera affiché</p>
              </div>
            )}
          </div>

          {logoUrl && (
            <div className="mt-4 text-center">
              <a 
                href={logoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-ymad-blue-600 text-sm hover:underline inline-flex items-center gap-1"
              >
                <Eye className="w-4 h-4" /> Voir l'image en grand
              </a>
            </div>
          )}
        </div>

        {/* Colonne de droite - Upload */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-ymad-gray-100">
          <h2 className="text-lg font-semibold text-ymad-gray-800 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-ymad-blue-600" />
            Télécharger un nouveau logo
          </h2>
          
          {/* Preview de la nouvelle image */}
          {previewUrl && (
            <div className="mb-4 p-3 bg-ymad-blue-50 rounded-lg">
              <p className="text-sm text-ymad-blue-700 mb-2">🔄 Aperçu du nouveau logo :</p>
              <div className="flex items-center justify-center p-4 bg-white rounded-lg">
                <img src={previewUrl} alt="Aperçu" className="max-h-24 w-auto object-contain" />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={cancelPreview}
                  className="text-sm text-ymad-gray-500 hover:text-ymad-gray-700"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
          
          <div className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
            previewUrl ? 'border-ymad-blue-400 bg-ymad-blue-50' : 'border-ymad-gray-300 bg-ymad-gray-50 hover:border-ymad-blue-400'
          }`}>
            <input
              ref={fileInputRef}
              type="file"
              id="logoUpload"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <label htmlFor="logoUpload" className="cursor-pointer block">
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-ymad-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-ymad-gray-600 font-medium">Téléchargement en cours...</p>
                  <p className="text-sm text-ymad-gray-400">Compression de l'image...</p>
                </div>
              ) : (
                <div>
                  <div className="w-20 h-20 bg-ymad-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-ymad-blue-600" />
                  </div>
                  <p className="text-ymad-gray-600 font-medium">Cliquez pour sélectionner un logo</p>
                  <p className="text-xs text-ymad-gray-400 mt-2">
                    Formats supportés : JPEG, PNG, WebP, SVG
                  </p>
                  <p className="text-xs text-ymad-gray-400">
                    Taille maximale : 2 Mo
                  </p>
                  <div className="mt-4 p-3 bg-ymad-blue-50 rounded-lg">
                    <p className="text-xs text-ymad-blue-700">
                      💡 <strong>Conseil :</strong> Utilisez un logo en PNG avec fond transparent<br />
                      Format recommandé : carré (ex: 200x200 pixels)
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
                className="w-full bg-ymad-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-ymad-blue-700 transition flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Appliquer ce logo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Aperçu sur le site */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-ymad-gray-100">
        <h2 className="text-lg font-semibold text-ymad-gray-800 mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-ymad-blue-600" />
          Aperçu sur le site
        </h2>
        
        <div className="bg-gradient-to-r from-ymad-gray-800 to-ymad-gray-900 rounded-xl p-4">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo Y-Mad" 
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            ) : (
              <div className="w-10 h-10 bg-ymad-blue-600 rounded-lg flex items-center justify-center">
            </div>
            )}
            <div>
              <span className="text-white font-bold text-lg">Y-Mad Madagascar</span>
              <p className="text-xs text-ymad-gray-400">Jeunesse en Action</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-ymad-gray-50 rounded-lg">
          <p className="text-xs text-ymad-gray-500 text-center">
            Le logo apparaîtra dans l'en-tête du site sur toutes les pages
          </p>
        </div>
      </div>

      {/* Guide */}
      <div className="mt-6 bg-ymad-blue-50 rounded-xl p-5">
        <h3 className="font-semibold text-ymad-blue-800 mb-2">💡 Conseils pour le logo</h3>
        <ul className="text-sm text-ymad-gray-600 space-y-1">
          <li>• Format recommandé : carré (200x200 pixels ou plus)</li>
          <li>• Poids maximum : 2 Mo</li>
          <li>• Formats acceptés : PNG, JPG, WebP, SVG</li>
          <li>• Fond transparent recommandé pour un meilleur rendu</li>
          <li>• Le logo sera automatiquement compressé et optimisé</li>
        </ul>
      </div>
    </div>
  );
}