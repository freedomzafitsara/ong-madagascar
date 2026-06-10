// frontend/src/components/admin/DatabaseImageUpload.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { uploadService, DatabaseImage, EntityType } from '@/services/upload.service';
import { Loader2, Upload, Eye, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface DatabaseImageUploadProps {
  onImageUpload: (image: DatabaseImage | null) => void;
  onImageRemove?: (imageId: string) => void;
  currentImageId?: string;
  entityType: EntityType;
  entityId?: string;
  isMain?: boolean;
  language?: string;
  label?: string;
}

export default function DatabaseImageUpload({
  onImageUpload,
  onImageRemove,
  currentImageId,
  entityType,
  entityId,
  isMain = false,
  language = 'fr',
  label = 'Image'
}: DatabaseImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState<DatabaseImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMounted = useRef(true);

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (currentImageId && !image) {
      loadImage(currentImageId);
    } else if (entityId && isMain && !currentImageId) {
      loadMainImage();
    }
  }, [currentImageId, entityId, isMain]);

  const loadImage = async (id: string) => {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const images = await uploadService.getImages(entityType, entityId);
      if (isMounted.current) {
        const foundImage = images.find(img => img.id === id);
        if (foundImage) {
          setImage(foundImage);
        }
      }
    } catch (err) {
      console.error('Erreur chargement image:', err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const loadMainImage = async () => {
    if (!entityId || !isMounted.current) return;
    setLoading(true);
    try {
      const mainImage = await uploadService.getMainImage(entityType, entityId);
      if (isMounted.current && mainImage) {
        setImage(mainImage);
        onImageUpload(mainImage);
      }
    } catch (err) {
      console.error('Erreur chargement image principale:', err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    try {
      const result = await uploadService.uploadImage(file, entityType, entityId, isMain);
      if (isMounted.current) {
        setImage(result);
        onImageUpload(result);
        toast.success(getText('Image uploadee avec succes', 'Nahomana ny fampidirana sary'));
      }
    } catch (err) {
      if (isMounted.current) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      if (isMounted.current) {
        setUploading(false);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!image) return;
    
    try {
      await uploadService.deleteImage(image.id);
      if (isMounted.current) {
        setImage(null);
        if (onImageRemove) {
          onImageRemove(image.id);
        }
        onImageUpload(null);
        toast.success(getText('Image supprimee', 'Voafafa ny sary'));
      }
    } catch (err) {
      if (isMounted.current) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  const handleSetMain = async () => {
    if (!image || !entityId) return;
    
    try {
      await uploadService.setMainImage(image.id, entityType, entityId);
      if (isMounted.current) {
        toast.success(getText('Image principale mise a jour', 'Sary lehibe nohavaozina'));
        // Recharger l'image principale
        await loadMainImage();
      }
    } catch (err) {
      if (isMounted.current) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur';
        toast.error(errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <div className="border rounded-xl p-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="text-sm text-gray-500 mt-2">{getText('Chargement...', 'Mampiditra...')}</p>
      </div>
    );
  }

  const imageUrl = image ? uploadService.getImageUrl(image.id) : null;

  return (
    <div className="border-b border-gray-200 pb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {isMain && <span className="ml-2 text-xs text-blue-600">({getText('Principale', 'Lehibe')})</span>}
      </label>
      
      {imageUrl ? (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
            <img 
              src={imageUrl} 
              alt={image?.fileName || 'Image'} 
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Erreur chargement image:', imageUrl);
                e.currentTarget.src = '/images/placeholder.jpg';
              }}
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => window.open(imageUrl, '_blank')}
              className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition shadow-md"
              title={getText('Voir', 'Hijery')}
            >
              <Eye className="w-4 h-4" />
            </button>
            {!isMain && entityId && (
              <button
                type="button"
                onClick={handleSetMain}
                className="p-2 bg-yellow-500/80 text-white rounded-lg hover:bg-yellow-600 transition shadow-md"
                title={getText('Definir comme principale', 'Ataovy sary lehibe')}
              >
                <Star className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
              title={getText('Supprimer', 'Hamafa')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-gray-100 transition group">
          <div className="flex flex-col items-center justify-center p-4">
            {uploading ? (
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-2" />
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition mb-2" />
                <p className="text-sm text-gray-500 text-center">{getText('Cliquez pour uploader', 'Tsindrio raha handefa')}</p>
                <p className="text-xs text-gray-400 mt-1 text-center">
                  {getText('JPG, PNG, WEBP, GIF (max 5 Mo)', 'JPG, PNG, WEBP, GIF (farany 5 Mo)')}
                </p>
              </>
            )}
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" 
            onChange={handleFileSelect} 
            className="hidden" 
            disabled={uploading} 
          />
        </label>
      )}
      
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}