// src/components/ui/BackgroundUpload.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Trash2, Eye, CheckCircle, AlertCircle, X } from 'lucide-react';

interface BackgroundUploadProps {
  page: string;
  title: string;
  description?: string;
  onUpdate?: () => void;
}

export function BackgroundUpload({ page, title, description, onUpdate }: BackgroundUploadProps) {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBgImage();
  }, [page]);

  const loadBgImage = async () => {
    setLoading(true);
    try {
      // ✅ Correction : Utiliser l'API spécifique à la page
      const response = await fetch(`/api/admin/${page}-bg`);
      const data = await response.json();
      
      if (data.success && data.hasImage && data.url) {
        setBgImage(data.url);
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
    setTimeout(() => setMessage(null), 3000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMessage('Veuillez sélectionner une image', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage('L\'image ne doit pas dépasser 5 Mo', 'error');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showMessage('Sélectionnez d\'abord une image', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      // ✅ Correction : Utiliser l'API spécifique à la page
      const response = await fetch(`/api/admin/${page}-bg`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setBgImage(data.url);
        setPreviewUrl(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        showMessage(`✅ Fond d'écran "${title}" mis à jour avec succès !`, 'success');
        if (onUpdate) onUpdate();
      } else {
        showMessage(data.error || 'Erreur lors de l\'upload', 'error');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      showMessage('Erreur réseau', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`⚠️ Supprimer définitivement le fond d'écran "${title}" ?`)) return;
    
    try {
      // ✅ Correction : Utiliser l'API spécifique à la page
      const response = await fetch(`/api/admin/${page}-bg`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setBgImage(null);
        showMessage(`✅ Fond d'écran "${title}" supprimé avec succès`, 'success');
        if (onUpdate) onUpdate();
      } else {
        showMessage('Erreur lors de la suppression', 'error');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      showMessage('Erreur réseau', 'error');
    }
  };

  const cancelPreview = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getPageIcon = () => {
    switch (page) {
      case 'home': return '🏠';
      case 'projects': return '📁';
      case 'jobs': return '💼';
      case 'blog': return '📰';
      case 'contact': return '📧';
      default: return '🖼️';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <span className="text-xl">{getPageIcon()}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="flex-1">{message.text}</span>
          <button onClick={() => setMessage(null)} className="opacity-50 hover:opacity-100">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Aperçu actuel */}
      <div className="mb-4">
        <div className="relative h-32 rounded-lg overflow-hidden bg-gradient-to-r from-blue-800 to-blue-900">
          {bgImage && (
            <img 
              src={bgImage} 
              alt={`Fond ${title}`} 
              className="absolute inset-0 w-full h-full object-cover opacity-40" 
            />
          )}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center">
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs opacity-80">Aperçu du fond d'écran</p>
          </div>
        </div>
        {bgImage && (
          <div className="mt-2 flex justify-between items-center">
            <a 
              href={bgImage} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <Eye className="w-3 h-3" /> Voir l'image
            </a>
            <button 
              onClick={handleDelete} 
              className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Supprimer
            </button>
          </div>
        )}
      </div>

      {/* Preview nouvelle image */}
      {previewUrl && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-medium text-blue-700">🔄 Aperçu de la nouvelle image</p>
            <button onClick={cancelPreview} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <img src={previewUrl} alt="Aperçu" className="w-full h-24 object-cover rounded-lg" />
        </div>
      )}

      {/* Upload */}
      <div 
        className="border-2 border-dashed rounded-lg p-4 text-center bg-gray-50 hover:border-blue-400 transition cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          id={`upload-${page}`}
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-500">Upload en cours...</p>
          </div>
        ) : (
          <div>
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Cliquez pour changer le fond</p>
            <p className="text-xs text-gray-400">JPEG, PNG, WebP, GIF • Max 5 Mo</p>
          </div>
        )}
      </div>

      {previewUrl && !uploading && (
        <button
          onClick={handleUpload}
          className="mt-3 w-full bg-blue-600 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
        >
          Appliquer ce fond
        </button>
      )}
    </div>
  );
}