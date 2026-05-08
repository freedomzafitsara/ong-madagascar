'use client';

import { useState, useEffect } from 'react';
import { backgroundService, Background } from '@/services/backgroundService';

interface PageBackgroundProps {
  page: string;
  children: React.ReactNode;
  className?: string;
}

export default function PageBackground({ page, children, className = '' }: PageBackgroundProps) {
  const [background, setBackground] = useState<Background | null>(null);

  useEffect(() => {
    const fetchBackground = async () => {
      const data = await backgroundService.getByPage(page);
      setBackground(data);
    };
    fetchBackground();
  }, [page]);

  const imageUrl = background?.image_url;
  const overlayOpacity = background?.overlay_opacity || 0;
  const position = background?.position || 'center';
  const size = background?.size || 'cover';

  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Image de fond */}
      {imageUrl && (
        <>
          <div 
            className="fixed inset-0 z-0 bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundPosition: position,
              backgroundSize: size,
            }}
          />
          {/* Overlay sombre */}
          <div 
            className="fixed inset-0 z-0 bg-black"
            style={{ opacity: overlayOpacity / 100 }}
          />
        </>
      )}
      
      {/* Contenu */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}