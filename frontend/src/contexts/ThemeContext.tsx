// frontend/src/contexts/ThemeContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authApi } from '@/lib/api';
import { useAuth } from './AuthContext';
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
  isInitialized: boolean;
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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('light');
  const [fontSize, setFontSizeState] = useState<'small' | 'medium' | 'large'>('medium');
  const [density, setDensityState] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const [animationsEnabled, setAnimationsEnabledState] = useState(true);

  // ============================================================
  // APPLICATION DU THEME
  // ============================================================

  const applyTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    root.classList.remove('light', 'dark');
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      localStorage.setItem('theme', 'dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      localStorage.setItem('theme', 'light');
    } else {
      localStorage.removeItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    }
    
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const isDark = root.classList.contains('dark');
      metaThemeColor.setAttribute('content', isDark ? '#1a1a2e' : '#ffffff');
    }
  }, []);

  // ============================================================
  // CHARGEMENT DES PRÉFÉRENCES
  // ============================================================

  const loadPreferences = useCallback(async (forceRefresh: boolean = false) => {
    try {
      console.log('[Theme] Chargement des préférences...');
      
      // ✅ Récupérer les valeurs locales
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
      const savedSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      
      let themeValue: 'light' | 'dark' | 'system' = savedTheme || 'light';
      let fontSizeValue: 'small' | 'medium' | 'large' = 'medium';
      let densityValue: 'compact' | 'comfortable' | 'spacious' = 'comfortable';
      let sidebarCollapsedValue = savedSidebarCollapsed;
      let animationsEnabledValue = true;

      // ✅ Si l'utilisateur est authentifié, charger depuis l'API
      if (isAuthenticated && !forceRefresh) {
        try {
          console.log('[Theme] Chargement des préférences depuis l\'API...');
          const response = await authApi.getPreferences();
          
          if (response) {
            themeValue = (response.theme as any) || savedTheme || 'light';
            fontSizeValue = (response.fontSize as any) || 'medium';
            densityValue = (response.density as any) || 'comfortable';
            sidebarCollapsedValue = response.sidebarCollapsed ?? savedSidebarCollapsed;
            animationsEnabledValue = response.animationsEnabled !== false;
            
            console.log('[Theme] Préférences chargées depuis l\'API');
          }
        } catch (apiError: any) {
          // ✅ Ignorer les erreurs 401 (non authentifié)
          if (apiError.response?.status === 401) {
            console.log('[Theme] Utilisateur non authentifié, utilisation des valeurs locales');
          } else {
            console.warn('[Theme] Erreur API:', apiError.message);
          }
        }
      } else {
        console.log('[Theme] Utilisation des valeurs locales');
      }

      // ✅ Mettre à jour l'état
      setThemeState(themeValue);
      setFontSizeState(fontSizeValue);
      setDensityState(densityValue);
      setSidebarCollapsedState(sidebarCollapsedValue);
      setAnimationsEnabledState(animationsEnabledValue);
      
      // ✅ Appliquer le thème
      applyTheme(themeValue);
      
      // ✅ Appliquer la taille de police
      document.documentElement.style.fontSize = 
        fontSizeValue === 'small' ? '14px' : 
        fontSizeValue === 'large' ? '18px' : 
        '16px';
      
      // ✅ Appliquer la densité
      const densityClass = {
        compact: 'density-compact',
        comfortable: 'density-comfortable',
        spacious: 'density-spacious'
      }[densityValue];
      document.documentElement.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
      document.documentElement.classList.add(densityClass);
      
      // ✅ Appliquer les animations
      if (!animationsEnabledValue) {
        document.documentElement.classList.add('animations-disabled');
      } else {
        document.documentElement.classList.remove('animations-disabled');
      }
      
      setIsInitialized(true);
      console.log('[Theme] Préférences chargées:', { theme: themeValue });
    } catch (error) {
      console.error('[Theme] Erreur chargement préférences:', error);
      applyTheme('light');
      setIsInitialized(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, applyTheme]);

  // ============================================================
  // INITIALISATION - Attendre que AuthContext soit prêt
  // ============================================================

  useEffect(() => {
    // ✅ Attendre que AuthContext ait fini de charger
    if (authLoading) {
      console.log('[Theme] Attente de l\'authentification...');
      return;
    }

    console.log('[Theme] Authentification terminée, chargement des préférences...');
    loadPreferences();
    
    // ✅ Écouter les changements de thème système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [authLoading, loadPreferences, theme, applyTheme]);

  // ============================================================
  // SETTERS
  // ============================================================

  const setTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    console.log('[Theme] setTheme appelé avec:', newTheme);
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
  // SAUVEGARDE DES PRÉFÉRENCES
  // ============================================================

  const updatePreferences = useCallback(async (prefs: Partial<ThemePreferences>) => {
    try {
      console.log('[Theme] Sauvegarde des préférences:', prefs);
      
      // ✅ Mettre à jour localement
      if (prefs.theme !== undefined) setTheme(prefs.theme);
      if (prefs.fontSize !== undefined) setFontSize(prefs.fontSize);
      if (prefs.density !== undefined) setDensity(prefs.density);
      if (prefs.sidebarCollapsed !== undefined) setSidebarCollapsed(prefs.sidebarCollapsed);
      if (prefs.animationsEnabled !== undefined) setAnimationsEnabled(prefs.animationsEnabled);
      
      // ✅ Sauvegarder dans le localStorage
      if (prefs.sidebarCollapsed !== undefined) {
        localStorage.setItem('sidebarCollapsed', String(prefs.sidebarCollapsed));
      }
      
      // ✅ Sauvegarder dans l'API si authentifié
      if (isAuthenticated) {
        const apiData: any = {};
        if (prefs.theme !== undefined) apiData.theme = prefs.theme;
        if (prefs.fontSize !== undefined) apiData.font_size = prefs.fontSize;
        if (prefs.density !== undefined) apiData.density = prefs.density;
        if (prefs.sidebarCollapsed !== undefined) apiData.sidebar_collapsed = prefs.sidebarCollapsed;
        if (prefs.animationsEnabled !== undefined) apiData.animations_enabled = prefs.animationsEnabled;
        
        await authApi.updatePreferences(apiData);
        console.log('[Theme] Préférences sauvegardées avec succès');
      } else {
        console.log('[Theme] Non authentifié, sauvegarde locale uniquement');
      }
      
      toast.success('Préférences mises à jour');
    } catch (error) {
      console.error('[Theme] Erreur sauvegarde préférences:', error);
      toast.error('Erreur lors de la sauvegarde');
      throw error;
    }
  }, [isAuthenticated, setTheme, setFontSize, setDensity, setSidebarCollapsed, setAnimationsEnabled]);

  // ============================================================
  // RAFRAÎCHIR
  // ============================================================

  const refreshPreferences = useCallback(async () => {
    await loadPreferences(true);
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
    isInitialized,
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
// HOOK PERSONNALISÉ
// ============================================================

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};