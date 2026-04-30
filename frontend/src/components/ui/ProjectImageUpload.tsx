'use client'

"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface ProjectImageUploadProps {
  onImageUpload: (file: File, preview: string) => void;
  onImageRemove?: () => void;
  currentImage?: string | null;
  maxSize?: number;
  label?: string;
}

export function ProjectImageUpload({
  onImageUpload,
  onImageRemove,
  currentImage,
  maxSize = 5,
  label = 'Image de couverture'
}: ProjectImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        toast.error(`Fichier trop volumineux. Maximum ${maxSize} MB.`);
      } else if (error.code === 'file-invalid-type') {
        toast.error('Format non supporté. Utilisez JPG, PNG ou WEBP.');
      }
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Fichier trop volumineux. Maximum ${maxSize} MB.`);
      return;
    }

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result as string;
      setPreview(previewUrl);
      onImageUpload(file, previewUrl);
      setIsUploading(false);
      toast.success('Image chargée avec succès');
    };
    reader.readAsDataURL(file);
  }, [maxSize, onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/jpg': []
    },
    maxSize: maxSize * 1024 * 1024,
    multiple: false
  });

  const handleRemove = () => {
    setPreview(null);
    if (onImageRemove) {
      onImageRemove();
    }
    toast.success('Image supprimée');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl transition-all cursor-pointer
          ${isDragActive ? 'border-gold-500 bg-gold-50' : 'border-gray-300 hover:border-gold-400'}
          ${preview ? 'p-0' : 'p-6'}
          aspect-video
        `}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="relative w-full h-full group">
            <img
              src={preview}
              alt="Aperçu du projet"
              className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/jpeg,image/png,image/webp';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) onDrop([file], []);
                  };
                  input.click();
                }}
                className="px-4 py-2 bg-white text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-100"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              {isDragActive ? 'Déposez votre image ici' : 'Cliquez ou glissez une image'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, WEBP jusqu'à {maxSize} MB
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Format 16:9 recommandé pour une meilleure visibilité
            </p>
          </div>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}

