// src/components/ui/ImageUpload.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (file: File) => Promise<string>;
  onRemove?: (imageId: string) => Promise<void>;
  existingImages?: string[];
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  onRemove,
  existingImages = [],
  multiple = false,
  maxFiles = 5,
  accept = 'image/jpeg,image/png,image/webp',
  label = 'Télécharger une image'
}) => {
  const [images, setImages] = useState<string[]>(existingImages);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!multiple && images.length + files.length > maxFiles) {
      alert(`Vous ne pouvez télécharger que ${maxFiles} image(s)`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          alert(`Le fichier ${file.name} n'est pas une image`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          alert(`L'image ${file.name} dépasse 5MB`);
          continue;
        }

        const imageUrl = await onUpload(file);
        setImages(prev => [...prev, imageUrl]);
        setUploadProgress(((i + 1) / files.length) * 100);
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors du téléchargement');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = async (index: number) => {
    const imageToRemove = images[index];
    if (onRemove) {
      await onRemove(imageToRemove);
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-marine-400 transition cursor-pointer bg-gray-50"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="space-y-3">
            <Loader2 className="w-10 h-10 mx-auto text-marine-600 animate-spin" />
            <p className="text-sm text-gray-600">Téléchargement en cours...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-marine-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">{label}</p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPEG, WebP jusqu'à 5MB
              {multiple && ` (max ${maxFiles} images)`}
            </p>
          </>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img}
                alt={`Image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <button
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
