// src/app/dashboard/jobs-bg/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Image as ImageIcon, CheckCircle, AlertCircle, Eye, RefreshCw, X, Briefcase } from 'lucide-react';

interface BgInfo {
  url: string;
  filename: string;
  sizeFormatted: string;
  hasImage: boolean;
}

export default function JobsBgPage() {
  const [bgImage, setBgImage] = useState<BgInfo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBgImage();
  }, []);

  const loadBgImage = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/jobs-bg');
      const data = await response.json();
      
      if (data.success && data.hasImage && data.url) {
        setBgImage({
          url: data.url,
          filename: data.filename,
          sizeFormatted: data.sizeFormatted || '',
          hasImage: true
        });
      } else {
        setBgImage(null);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleApplyBackground = async () => {
    if (!selectedFile) {
      showMessage('Sélectionnez d\'abord une image', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('/api/admin/jobs-bg', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        await loadBgImage();
        setPreviewUrl(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        showMessage('✅ Fond d\'écran appliqué avec succès !', 'success');
      } else {
        showMessage(data.error || 'Erreur lors de l\'application', 'error');
      }
    } catch (error) {
      showMessage('Erreur réseau', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('⚠️ Supprimer définitivement le fond d\'écran ?')) return;
    
    try {
      const response = await fetch('/api/admin/jobs-bg', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setBgImage(null);
        showMessage('Fond d\'écran supprimé avec succès', 'success');
      } else {
        showMessage('Erreur lors de la suppression', 'error');
      }
    } catch (error) {
      showMessage('Erreur réseau', 'error');
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
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Fond d'écran - Offres d'emploi</h1>
            <p className="text-gray-500 mt-1">Personnalisez l'image de fond de la page offres d'emploi</p>
          </div>
        </div>
      </div>

      {/* Message */}
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

      {/* Aperçu actuel */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Eye className="w-5 h-5" /> Fond actuel
          </h2>
          <button onClick={loadBgImage} className="text-gray-400 hover:text-gray-600 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-r from-blue-800 to-blue-900">
          {bgImage?.url ? (
            <img 
              src={bgImage.url} 
              alt="Fond offres" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/60">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                <p>Aucun fond personnalisé</p>
                <p className="text-sm mt-1">Uploader une image ci-dessous</p>
              </div>
            </div>
          )}
        </div>
        
        {bgImage && (
          <div className="mt-4 flex flex-wrap justify-between items-center gap-3">
            <div className="flex gap-2">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">{bgImage.filename}</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">{bgImage.sizeFormatted}</span>
            </div>
            <button onClick={handleDelete} className="text-red-500 text-sm hover:text-red-600 flex items-center gap-1">
              <Trash2 className="w-4 h-4" /> Supprimer
            </button>
          </div>
        )}
      </div>

      {/* Preview nouvelle image */}
      {previewUrl && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-2 border-blue-400">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">🔄 Aperçu</h2>
            <button onClick={cancelPreview} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative h-48 rounded-lg overflow-hidden bg-gray-100">
            <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleApplyBackground} disabled={uploading} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {uploading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Application...</> : <><CheckCircle className="w-5 h-5" /> Appliquer ce fond</>}
            </button>
            <button onClick={cancelPreview} className="flex-1 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50">Annuler</button>
          </div>
        </div>
      )}

      {/* Upload */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📤 Changer le fond d'écran</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:border-blue-400 transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileSelect} className="hidden" disabled={uploading} />
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">Cliquez pour sélectionner une image</p>
            <p className="text-xs text-gray-400 mt-2">JPEG, PNG, WebP • Max 10 Mo • 1920x1080 recommandé</p>
          </div>
        </div>
      </div>
    </div>
  );
}