'use client'

"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSmartBack } from '@/hooks/useSmartBack';
import { useState, useEffect } from 'react';

interface BackButtonProps {
  label?: string;
  className?: string;
  fallbackUrl?: string;
  showConfirm?: boolean;
  confirmMessage?: string;
  variant?: 'default' | 'minimal' | 'icon-only' | 'glass' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  autoLabel?: boolean;
  withArrow?: boolean;
  iconPosition?: 'left' | 'right';
}

export function BackButton({ 
  label, 
  className = "",
  fallbackUrl,
  showConfirm = false,
  confirmMessage = "Quitter cette page ?",
  variant = "glass",
  size = "md",
  autoLabel = true,
  withArrow = true,
  iconPosition = "left"
}: BackButtonProps) {
  const { goBack, canGoBack, shouldShowBackButton, backLabel, logicalBackPath } = useSmartBack();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Ne pas afficher le bouton sur certaines pages
  if (!shouldShowBackButton) {
    return null;
  }

  const finalLabel = label || (autoLabel ? backLabel : 'Retour');
  const finalFallback = fallbackUrl || logicalBackPath;

  const handleClick = () => {
    if (showConfirm) {
      if (confirm(confirmMessage)) {
        goBack(finalFallback);
      }
    } else {
      goBack(finalFallback);
    }
  };

  // Tailles
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5'
  };

  // Variantes de style professionnelles
  const variantClasses = {
    // Variante par défaut - élégante
    default: 'bg-white/10 backdrop-blur-sm border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 hover:border-gold-500 hover:text-gold-300 shadow-sm',
    
    // Variante minimaliste
    minimal: 'bg-transparent border border-gray-300/50 text-gray-500 hover:bg-gray-100/50 hover:border-gray-400',
    
    // Variante icon-only (cercle)
    'icon-only': 'w-10 h-10 p-0 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 rounded-full',
    
    // Variante glass - effet verre moderne
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/40 shadow-lg rounded-xl',
    
    // Variante outline - contour doré
    outline: 'bg-transparent border-2 border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-marine-900 rounded-full font-medium'
  };

  // Animation des icônes
  const arrowAnimation = {
    initial: { x: 0 },
    hover: { x: iconPosition === 'left' ? -4 : 4 },
    tap: { x: iconPosition === 'left' ? -2 : 2 }
  };

  const icon = withArrow ? (
    <motion.svg 
      className="w-4 h-4"
      variants={arrowAnimation}
      initial="initial"
      animate={isHovered ? "hover" : "initial"}
      whileTap="tap"
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </motion.svg>
  ) : null;

  // Variante icon-only
  if (variant === 'icon-only') {
    return (
      <motion.button
        whileHover={{ scale: 1.05, x: -2 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleClick}
        className={`
          transition-all duration-300 group
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        title={finalLabel}
      >
        <svg 
          className={`w-5 h-5 transition-transform duration-300 ${isHovered ? '-translate-x-0.5' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ x: -3 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center rounded-lg font-medium
        transition-all duration-300 group
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isPressed ? 'scale-95' : ''}
        ${className}
      `}
    >
      {iconPosition === 'left' && icon}
      <motion.span
        animate={{ opacity: isHovered ? 1 : 0.9 }}
        className="transition-all duration-300"
      >
        {finalLabel}
      </motion.span>
      {iconPosition === 'right' && icon}
      
      {/* Indicateur de navigation */}
      {!canGoBack && finalFallback !== '/' && (
        <span className="text-xs opacity-60 ml-1.5 hidden sm:inline">
          (accueil)
        </span>
      )}
    </motion.button>
  );
}

// Bouton de retour flottant (FAB)
export function FloatingBackButton({ fallbackUrl, className = "" }: { fallbackUrl?: string; className?: string }) {
  const { goBack, shouldShowBackButton, logicalBackPath } = useSmartBack();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!shouldShowBackButton || !isVisible) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: -20 }}
      whileHover={{ scale: 1.1, x: -5 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => goBack(fallbackUrl || logicalBackPath)}
      className={`fixed bottom-8 left-8 z-50 w-12 h-12 bg-gradient-to-r from-marine-800 to-marine-900 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group ${className}`}
      title="Retour"
    >
      <svg 
        className={`w-5 h-5 transition-all duration-300 ${isHovered ? '-translate-x-1' : ''}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      
      {/* Badge de notification */}
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold-500 rounded-full animate-pulse"></span>
    </motion.button>
  );
}

// Barre de navigation avec retour intégré
export function NavigationBar({ 
  title, 
  showBack = true, 
  backUrl, 
  rightContent,
  className = "",
  variant = "glass"
}: { 
  title?: string; 
  showBack?: boolean; 
  backUrl?: string;
  rightContent?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'minimal';
}) {
  const { shouldShowBackButton } = useSmartBack();

  const variantClasses = {
    default: 'bg-gradient-to-r from-marine-900 to-marine-800 text-white',
    glass: 'bg-white/10 backdrop-blur-md border-b border-white/20 text-white',
    minimal: 'bg-transparent text-gray-800 border-b border-gray-100'
  };

  if (!showBack || !shouldShowBackButton) {
    return (
      <div className={`${variantClasses[variant]} ${className}`}>
        <div className="container mx-auto px-6 py-4">
          {title && <h1 className="text-xl font-bold text-center">{title}</h1>}
          {rightContent && <div className="absolute right-6 top-4">{rightContent}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <BackButton 
            variant={variant === 'glass' ? 'glass' : 'minimal'}
            className={variant === 'glass' ? '!bg-transparent !border-white/30 !text-white' : ''}
            fallbackUrl={backUrl}
          />
          {title && (
            <h1 className="text-xl font-bold text-center flex-1">{title}</h1>
          )}
          <div className="w-20 flex justify-end">
            {rightContent}
          </div>
        </div>
      </div>
    </div>
  );
}

