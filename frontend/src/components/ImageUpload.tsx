'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Loader2, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  label?: string;
}

export default function ImageUpload({ onUploadComplete, currentImageUrl, label = 'Image de couverture' }: ImageUploadProps) {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    
    if (!token) {
      setError('Vous devez etre connecte');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Format non supporte (JPG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image trop grande (max 5 Mo)');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/upload/event`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        onUploadComplete(data.url);
        toast.success('Image uploadee avec succes');
      } else {
        throw new Error(data.message || 'Erreur upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de l upload');
      setPreviewUrl(currentImageUrl || null);
      toast.error('Erreur lors de l upload');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUploadComplete('');
    toast.success('Image supprimee');
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {previewUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
          <img src={previewUrl} alt="Apercu" className="w-full h-48 object-cover" />
          <div className="absolute bottom-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => window.open(previewUrl, '_blank')}
              className="p-2 bg-white/90 rounded-lg hover:bg-white transition shadow-md"
              title="Voir l image"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleRemove}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
              type="button"
              title="Supprimer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition bg-white">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 font-medium">Cliquez pour uploader une image</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP, GIF (max 5 Mo)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      )}
      
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin" />
          Upload en cours...
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}