// frontend/src/contexts/ThemeContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================

export interface ThemePreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'comfortable' | 'spacious';
  sidebarCollapsed: boolean;
  animationsEnabled: boolean;
}

export interface ThemeContextType extends ThemePreferences {
  loading: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setDensity: (density: 'compact' | 'comfortable' | 'spacious') => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  updatePreferences: (prefs: Partial<ThemePreferences>) => Promise<void>;
  refreshPreferences: () => Promise<void>;
}

// ============================================================
// CONTEXT
// ============================================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('light');
  const [fontSize, setFontSizeState] = useState<'small' | 'medium' | 'large'>('medium');
  const [density, setDensityState] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const [animationsEnabled, setAnimationsEnabledState] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // ============================================================
  // APPLICATION DU THEME - FONCTION CRITIQUE
  // ============================================================

  const applyTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    // Supprimer toutes les classes de theme
    root.classList.remove('light', 'dark');
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      localStorage.setItem('theme', 'dark');
      console.log('[Theme] Mode sombre active');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      localStorage.setItem('theme', 'light');
      console.log('[Theme] Mode clair active');
    } else {
      // System
      localStorage.removeItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
        console.log('[Theme] Mode systeme: sombre');
      } else {
        root.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
        console.log('[Theme] Mode systeme: clair');
      }
    }
    
    // Mettre a jour la meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const isDark = root.classList.contains('dark');
      metaThemeColor.setAttribute('content', isDark ? '#1a1a2e' : '#ffffff');
    }
  }, []);

  // ============================================================
  // CHARGEMENT DES PREFERENCES
  // ============================================================

  const loadPreferences = useCallback(async () => {
    try {
      console.log('[Theme] Chargement des preferences...');
      
      // Recuperer le theme depuis localStorage d'abord
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
      
      let themeValue: 'light' | 'dark' | 'system' = 'light';
      let fontSizeValue: 'small' | 'medium' | 'large' = 'medium';
      let densityValue: 'compact' | 'comfortable' | 'spacious' = 'comfortable';
      let sidebarCollapsedValue = false;
      let animationsEnabledValue = true;

      // Essayer de charger depuis l'API
      try {
        const response = await authApi.getPreferences();
        if (response) {
          themeValue = (response.theme as any) || savedTheme || 'light';
          fontSizeValue = (response.fontSize as any) || 'medium';
          densityValue = (response.density as any) || 'comfortable';
          sidebarCollapsedValue = response.sidebarCollapsed || false;
          animationsEnabledValue = response.animationsEnabled !== false;
        }
      } catch (apiError) {
        console.warn('[Theme] Erreur API, utilisation des valeurs localStorage:', apiError);
        if (savedTheme) {
          themeValue = savedTheme;
        }
      }

      // Appliquer le theme
      setThemeState(themeValue);
      setFontSizeState(fontSizeValue);
      setDensityState(densityValue);
      setSidebarCollapsedState(sidebarCollapsedValue);
      setAnimationsEnabledState(animationsEnabledValue);
      
      // Appliquer le theme au DOM
      applyTheme(themeValue);
      
      // Appliquer la taille de police
      document.documentElement.style.fontSize = 
        fontSizeValue === 'small' ? '14px' : 
        fontSizeValue === 'large' ? '18px' : 
        '16px';
      
      // Appliquer la densite
      const densityClass = {
        compact: 'density-compact',
        comfortable: 'density-comfortable',
        spacious: 'density-spacious'
      }[densityValue];
      document.documentElement.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
      document.documentElement.classList.add(densityClass);
      
      // Appliquer les animations
      if (!animationsEnabledValue) {
        document.documentElement.classList.add('animations-disabled');
      } else {
        document.documentElement.classList.remove('animations-disabled');
      }
      
      setIsInitialized(true);
      console.log('[Theme] Preferences chargees:', { theme: themeValue });
    } catch (error) {
      console.error('[Theme] Erreur chargement preferences:', error);
      applyTheme('light');
      setIsInitialized(true);
    } finally {
      setLoading(false);
    }
  }, [applyTheme]);

  // ============================================================
  // INITIALISATION
  // ============================================================

  useEffect(() => {
    loadPreferences();
    
    // Ecouter les changements de theme systeme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [loadPreferences, theme, applyTheme]);

  // ============================================================
  // SETTERS AVEC LOG
  // ============================================================

  const setTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    console.log('[Theme] setTheme appele avec:', newTheme);
    setThemeState(newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  const setFontSize = useCallback((size: 'small' | 'medium' | 'large') => {
    setFontSizeState(size);
    document.documentElement.style.fontSize = 
      size === 'small' ? '14px' : 
      size === 'large' ? '18px' : 
      '16px';
  }, []);

  const setDensity = useCallback((newDensity: 'compact' | 'comfortable' | 'spacious') => {
    setDensityState(newDensity);
    const densityClass = {
      compact: 'density-compact',
      comfortable: 'density-comfortable',
      spacious: 'density-spacious'
    }[newDensity];
    
    document.documentElement.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
    document.documentElement.classList.add(densityClass);
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    localStorage.setItem('sidebarCollapsed', String(collapsed));
  }, []);

  const setAnimationsEnabled = useCallback((enabled: boolean) => {
    setAnimationsEnabledState(enabled);
    document.documentElement.style.setProperty(
      '--animations-enabled', 
      enabled ? '1' : '0'
    );
    if (!enabled) {
      document.documentElement.classList.add('animations-disabled');
    } else {
      document.documentElement.classList.remove('animations-disabled');
    }
  }, []);

  // ============================================================
  // SAUVEGARDE DES PREFERENCES
  // ============================================================

  const updatePreferences = useCallback(async (prefs: Partial<ThemePreferences>) => {
    try {
      console.log('[Theme] Sauvegarde des preferences:', prefs);
      
      if (prefs.theme !== undefined) setTheme(prefs.theme);
      if (prefs.fontSize !== undefined) setFontSize(prefs.fontSize);
      if (prefs.density !== undefined) setDensity(prefs.density);
      if (prefs.sidebarCollapsed !== undefined) setSidebarCollapsed(prefs.sidebarCollapsed);
      if (prefs.animationsEnabled !== undefined) setAnimationsEnabled(prefs.animationsEnabled);
      
      const apiData: any = {};
      if (prefs.theme !== undefined) apiData.theme = prefs.theme;
      if (prefs.fontSize !== undefined) apiData.font_size = prefs.fontSize;
      if (prefs.density !== undefined) apiData.density = prefs.density;
      if (prefs.sidebarCollapsed !== undefined) apiData.sidebar_collapsed = prefs.sidebarCollapsed;
      if (prefs.animationsEnabled !== undefined) apiData.animations_enabled = prefs.animationsEnabled;
      
      await authApi.updatePreferences(apiData);
      
      toast.success('Preferences mises a jour');
      console.log('[Theme] Preferences sauvegardees avec succes');
    } catch (error) {
      console.error('[Theme] Erreur sauvegarde preferences:', error);
      toast.error('Erreur lors de la sauvegarde');
      throw error;
    }
  }, [setTheme, setFontSize, setDensity, setSidebarCollapsed, setAnimationsEnabled]);

  // ============================================================
  // RAFRAICHIR
  // ============================================================

  const refreshPreferences = useCallback(async () => {
    await loadPreferences();
  }, [loadPreferences]);

  // ============================================================
  // VALEUR DU CONTEXT
  // ============================================================

  const value: ThemeContextType = {
    theme,
    fontSize,
    density,
    sidebarCollapsed,
    animationsEnabled,
    loading,
    setTheme,
    setFontSize,
    setDensity,
    setSidebarCollapsed,
    setAnimationsEnabled,
    updatePreferences,
    refreshPreferences,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================
// HOOK PERSONNALISE
// ============================================================

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};