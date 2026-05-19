'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Eye, Trash2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

interface UploadImageProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  label?: string;
}

export function UploadImage({ onUploadComplete, currentImageUrl, label = "Image de couverture" }: UploadImageProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    // Aperçu local immédiat
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    // Validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Format non supporté (JPG, PNG, WEBP, GIF)');
      setPreviewUrl(currentImageUrl || null);
      setUploading(false);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image trop grande (max 5 Mo)');
      setPreviewUrl(currentImageUrl || null);
      setUploading(false);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/upload/single`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }

      const data = await response.json();
      const imageUrl = data.url || data.data?.url || data.fileUrl;
      
      setPreviewUrl(imageUrl);
      onUploadComplete(imageUrl);
      toast.success('Image uploadée avec succès');
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Erreur lors de l\'upload');
      setPreviewUrl(currentImageUrl || null);
      toast.error(error.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUploadComplete('');
    toast.success('Image supprimée');
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {previewUrl ? (
        <div className="relative">
          <div className="w-full h-48 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
            <img 
              src={previewUrl} 
              alt="Aperçu" 
              className="w-full h-full object-cover"
              onError={() => setPreviewUrl(null)}
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => window.open(previewUrl, '_blank')}
              className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition shadow-md"
              title="Voir l'image"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
              title="Supprimer l'image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-gray-100 transition group"
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
              <span className="text-sm text-gray-500">Upload en cours...</span>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition mb-2" />
              <p className="text-sm text-gray-500 font-medium">Cliquez pour uploader une image</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP, GIF (max 5 Mo)</p>
            </>
          )}
        </div>
      )}
      
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}