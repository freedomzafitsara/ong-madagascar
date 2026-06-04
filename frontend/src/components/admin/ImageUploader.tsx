'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

// Types de pages supportées par le thème
type SupportedPage = 'home' | 'projects' | 'jobs' | 'blog' | 'contact' | 'login' | 'profile';

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
  currentImageUrl?: string | null;
  pageKey: SupportedPage;
  label?: string;
}

export default function ImageUploader({
  onUploadComplete,
  onUploadError,
  currentImageUrl,
  pageKey,
  label = 'Image de fond'
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(currentImageUrl || null);
  }, [currentImageUrl]);

  const getToken = (): string | null => {
    return localStorage.getItem('access_token') || localStorage.getItem('token');
  };

  const handleFileSelect = async (file: File): Promise<void> => {
    // Validation du type
    if (!file.type.startsWith('image/')) {
      const errMsg = 'Le fichier doit etre une image (JPG, PNG, WEBP)';
      setError(errMsg);
      onUploadError?.(errMsg);
      return;
    }

    // Validation de la taille (10 Mo max)
    if (file.size > 10 * 1024 * 1024) {
      const errMsg = 'L image ne doit pas depasser 10 Mo';
      setError(errMsg);
      onUploadError?.(errMsg);
      return;
    }

    const token = getToken();
    if (!token) {
      const errMsg = 'Non authentifie. Veuillez vous reconnecter.';
      setError(errMsg);
      onUploadError?.(errMsg);
      return;
    }

    // Créer un aperçu local
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setError(null);
    setSuccess(false);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'background');
    formData.append('entityId', pageKey);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
      
      // Étape 1: Upload de l'image
      const uploadResponse = await fetch(`${API_URL}/upload/single`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (uploadResponse.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        throw new Error('Session expiree. Reconnectez-vous.');
      }

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || 'Erreur lors de l upload');
      }

      const imageUrl = uploadData.url || uploadData.fileUrl || uploadData.secure_url;
      setPreviewUrl(imageUrl);
      
      // Étape 2: Sauvegarder le fond d'ecran dans la base de donnees
      const backgroundData = {
        page: pageKey,
        image_url: imageUrl,
        is_active: true,
        overlay_opacity: 35,
        position: 'center',
        size: 'cover'
      };

      const saveResponse = await fetch(`${API_URL}/pages/backgrounds/${pageKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(backgroundData)
      });

      if (!saveResponse.ok) {
        throw new Error('Erreur lors de la sauvegarde du fond d ecran');
      }

      setSuccess(true);
      onUploadComplete(imageUrl);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err: any) {
      const errMsg = err.message || 'Erreur lors de l upload';
      setError(errMsg);
      onUploadError?.(errMsg);
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localPreview);
    }
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      setError('Deposez une image valide');
    }
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
  };

  const handleRemove = (): void => {
    setPreviewUrl(null);
    setError(null);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl transition-all cursor-pointer
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-gray-100'}
          aspect-video flex items-center justify-center overflow-hidden
        `}
      >
        {previewUrl ? (
          <>
            <img 
              src={previewUrl} 
              alt="Apercu" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  fileInputRef.current?.click(); 
                }}
                className="p-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition"
                title="Changer l'image"
              >
                <Upload className="w-5 h-5 text-white" />
              </button>
              <button
                type="button"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleRemove(); 
                }}
                className="p-2 bg-red-500/80 backdrop-blur rounded-lg hover:bg-red-600 transition"
                title="Supprimer l'image"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center p-6">
            {uploading ? (
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-2" />
            ) : (
              <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            )}
            <p className="text-sm text-gray-500">
              {uploading ? 'Upload en cours...' : 'Cliquez ou deposez une image (1920x1080px)'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Formats acceptes: JPG, PNG, WEBP (max 10 Mo)
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && !uploading && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>Image uploadee et sauvegardee avec succes !</span>
        </div>
      )}
    </div>
  );
}