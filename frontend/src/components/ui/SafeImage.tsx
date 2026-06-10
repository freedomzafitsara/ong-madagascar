// frontend/src/components/ui/SafeImage.tsx

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  onError?: () => void;
}

export default function SafeImage({ 
  src, 
  alt, 
  fill = false,
  className = '',
  width,
  height,
  sizes,
  priority = false,
  onError
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isBlob, setIsBlob] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setImgSrc('/images/placeholder.jpg');
      setIsBlob(false);
      return;
    }

    // Verifier si c'est un blob URL
    const isBlobUrl = src.startsWith('blob:');
    setIsBlob(isBlobUrl);
    
    if (isBlobUrl) {
      // Pour les blobs, on garde l'URL telle quelle
      setImgSrc(src);
    } else {
      setImgSrc(src);
    }
  }, [src]);

  const handleError = () => {
    if (!error) {
      setError(true);
      setImgSrc('/images/placeholder.jpg');
      if (onError) onError();
    }
  };

  // Pour les blobs, ne pas utiliser le composant Image de Next.js
  if (isBlob) {
    if (fill) {
      return (
        <div className={`relative ${className}`}>
          <img 
            src={imgSrc} 
            alt={alt} 
            className="w-full h-full object-cover"
            onError={handleError}
          />
        </div>
      );
    }
    return (
      <img 
        src={imgSrc} 
        alt={alt} 
        className={className}
        style={{ width, height }}
        onError={handleError}
      />
    );
  }

  // Pour les URLs normales, utiliser Next.js Image
  if (fill) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={imgSrc}
          alt={alt}
          fill
          className="object-cover"
          onError={handleError}
          priority={priority}
          sizes={sizes || '100%'}
          unoptimized={imgSrc.includes('cloudinary') || imgSrc.includes('localhost')}
        />
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || 100}
      height={height || 100}
      className={className}
      onError={handleError}
      priority={priority}
      unoptimized={imgSrc.includes('cloudinary') || imgSrc.includes('localhost')}
    />
  );
}