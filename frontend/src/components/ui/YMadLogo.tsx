// src/components/ui/YMadLogo.tsx
'use client';

import Link from 'next/link';
import { Heart, Leaf, Users, Globe } from 'lucide-react';

interface YMadLogoProps {
  variant?: 'full' | 'icon' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTagline?: boolean;
}

const sizes = {
  sm: { icon: 24, text: 'text-xl', tagline: 'text-xs' },
  md: { icon: 32, text: 'text-2xl', tagline: 'text-sm' },
  lg: { icon: 40, text: 'text-3xl', tagline: 'text-base' },
};

export function YMadLogo({ variant = 'full', size = 'md', className = '', showTagline = true }: YMadLogoProps) {
  const sizeConfig = sizes[size];
  
  if (variant === 'icon') {
    return (
      <Link href="/" className={`flex items-center justify-center ${className}`}>
        <div className="relative">
          {/* Cercle de fond */}
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" fill="white" />
          </div>
          {/* Petite feuille en overlay */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md">
            <Leaf className="w-3 h-3 text-white" />
          </div>
        </div>
      </Link>
    );
  }
  
  if (variant === 'horizontal') {
    return (
      <Link href="/" className={`flex items-center gap-3 ${className}`}>
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
        </div>
        <div>
          <span className={`font-bold text-gray-800 ${sizeConfig.text}`}>
            Y-Mad <span className="text-yellow-500">Madagascar</span>
          </span>
          {showTagline && (
            <p className={`text-gray-500 ${sizeConfig.tagline}`}>Jeunesse en Action</p>
          )}
        </div>
      </Link>
    );
  }
  
  // Version full (par défaut)
  return (
    <Link href="/" className={`block ${className}`}>
      <div className="flex flex-col items-center">
        {/* Logo icône principal */}
        <div className="relative mb-2">
          {/* Anneau extérieur */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg">
            {/* Cœur au centre */}
            <Heart className="w-8 h-8 text-white" fill="white" />
          </div>
          {/* Éléments décoratifs autour */}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
            <Leaf className="w-3 h-3 text-white" />
          </div>
          <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
            <Users className="w-3 h-3 text-white" />
          </div>
        </div>
        
        {/* Texte */}
        <div className="text-center">
          <span className="text-2xl font-bold text-gray-800">
            Y-Mad <span className="text-yellow-500">Madagascar</span>
          </span>
          {showTagline && (
            <p className="text-xs text-gray-500 mt-0.5 tracking-wide">
              Jeunesse Malgache en Action
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// Version alternative avec silhouette de Madagascar
export function YMadLogoMap({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeMap = { sm: 40, md: 56, lg: 72 };
  const iconSize = sizeMap[size];
  
  return (
    <Link href="/" className={`block ${className}`}>
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: iconSize, height: iconSize }}>
          {/* Carte de Madagascar stylisée */}
          <svg viewBox="0 0 100 120" className="w-full h-full">
            {/* Forme stylisée de Madagascar */}
            <path
              d="M50 5 L65 15 L75 30 L80 50 L78 70 L70 85 L60 95 L50 100 L40 95 L30 85 L22 70 L20 50 L25 30 L35 15 Z"
              fill="url(#madagascarGradient)"
              stroke="#EAB308"
              strokeWidth="2"
            />
            {/* Cœur au centre */}
            <foreignObject x="35" y="35" width="30" height="30">
              <div className="w-full h-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-yellow-500" fill="#EAB308" />
              </div>
            </foreignObject>
            <defs>
              <linearGradient id="madagascarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#0D2B4E' }} />
                <stop offset="100%" style={{ stopColor: '#1A3A5C' }} />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="text-center mt-2">
          <span className="font-bold text-gray-800">Y-Mad</span>
          <span className="text-yellow-500 font-bold"> Madagascar</span>
        </div>
      </div>
    </Link>
  );
}