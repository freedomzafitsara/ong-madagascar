// src/components/ui/PageBackground.tsx
'use client';

import { useState, useEffect } from 'react';

interface PageBackgroundProps {
  pageKey: string;
  children: React.ReactNode;
  className?: string;
}

export default function PageBackground({ pageKey, children, className = '' }: PageBackgroundProps) {
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBackground = () => {
      try {
        const stored = localStorage.getItem('ymad_page_backgrounds');
        if (stored) {
          const backgrounds = JSON.parse(stored);
          const background = backgrounds.find((b: any) => b.pageKey === pageKey);
          if (background && background.imageUrl) {
            setBackgroundUrl(background.imageUrl);
          }
        }
      } catch (error) {
        console.error('Erreur chargement fond:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBackground();
  }, [pageKey]);

  if (loading) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      className={`relative ${className}`}
      style={{
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay pour la lisibilité du texte */}
      {backgroundUrl && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}