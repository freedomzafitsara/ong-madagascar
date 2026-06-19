// frontend/src/contexts/ThemeContext.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

type Theme = 'light' | 'dark' | 'system';
type FontSize = 'small' | 'medium' | 'large';
type Density = 'compact' | 'comfortable' | 'spacious';

interface Preferences {
  theme: Theme;
  font_size: FontSize;
  sidebar_collapsed: boolean;
  animations_enabled: boolean;
  density: Density;
  preferred_language: string;
  timezone: string;
  email_notifications: boolean;
  push_notifications: boolean;
  job_alerts: boolean;
  project_updates: boolean;
  blog_updates: boolean;
  system_updates: boolean;
}

interface ThemeContextType {
  theme: Theme;
  fontSize: FontSize;
  density: Density;
  sidebarCollapsed: boolean;
  animationsEnabled: boolean;
  preferences: Preferences | null;
  loading: boolean;
  setTheme: (theme: Theme) => Promise<void>;
  setFontSize: (size: FontSize) => Promise<void>;
  setDensity: (density: Density) => Promise<void>;
  setSidebarCollapsed: (collapsed: boolean) => Promise<void>;
  setAnimationsEnabled: (enabled: boolean) => Promise<void>;
  updatePreferences: (prefs: Partial<Preferences>) => Promise<void>;
  loadPreferences: () => Promise<void>;
  applyTheme: (theme: Theme) => void;
  applyFontSize: (size: FontSize) => void;
  applyDensity: (density: Density) => void;
  applyAnimations: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultPreferences: Preferences = {
  theme: 'light',
  font_size: 'medium',
  sidebar_collapsed: false,
  animations_enabled: true,
  density: 'comfortable',
  preferred_language: 'fr',
  timezone: 'Indian/Antananarivo',
  email_notifications: true,
  push_notifications: true,
  job_alerts: true,
  project_updates: true,
  blog_updates: false,
  system_updates: true,
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [density, setDensityState] = useState<Density>('comfortable');
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const [animationsEnabled, setAnimationsEnabledState] = useState(true);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token') || localStorage.getItem('token');
    }
    return null;
  };

  // ============================================================
  // APPLICATION DES PREFERENCES
  // ============================================================

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    }
    localStorage.setItem('theme', newTheme);
  };

  const applyFontSize = (size: FontSize) => {
    const root = document.documentElement;
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    root.style.fontSize = sizes[size];
    localStorage.setItem('fontSize', size);
  };

  const applyDensity = (newDensity: Density) => {
    const root = document.documentElement;
    const spacings = {
      compact: '0.75rem',
      comfortable: '1rem',
      spacious: '1.25rem'
    };
    root.style.setProperty('--spacing-unit', spacings[newDensity]);
    localStorage.setItem('density', newDensity);
  };

  const applyAnimations = (enabled: boolean) => {
    const root = document.documentElement;
    if (enabled) {
      root.style.setProperty('--transition-duration', '0.3s');
      root.classList.remove('reduce-motion');
    } else {
      root.style.setProperty('--transition-duration', '0s');
      root.classList.add('reduce-motion');
    }
    localStorage.setItem('animations', String(enabled));
  };

  const applySidebar = (collapsed: boolean) => {
    localStorage.setItem('sidebarCollapsed', String(collapsed));
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { collapsed } }));
  };

  // ============================================================
  // CHARGEMENT DES PREFERENCES
  // ============================================================

  const loadPreferences = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/preferences');
      const data = response.data;

      if (data) {
        // Fusionner avec les defaults pour garantir toutes les proprietes
        const mergedPreferences: Preferences = {
          ...defaultPreferences,
          ...data,
        };
        
        setPreferences(mergedPreferences);
        setThemeState(mergedPreferences.theme);
        setFontSizeState(mergedPreferences.font_size);
        setDensityState(mergedPreferences.density);
        setSidebarCollapsedState(mergedPreferences.sidebar_collapsed);
        setAnimationsEnabledState(mergedPreferences.animations_enabled);

        applyTheme(mergedPreferences.theme);
        applyFontSize(mergedPreferences.font_size);
        applyDensity(mergedPreferences.density);
        applyAnimations(mergedPreferences.animations_enabled);
        applySidebar(mergedPreferences.sidebar_collapsed);
      }
    } catch (error) {
      console.error('Erreur chargement preferences:', error);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const savedFontSize = localStorage.getItem('fontSize') as FontSize | null;
    const savedDensity = localStorage.getItem('density') as Density | null;
    const savedSidebar = localStorage.getItem('sidebarCollapsed') === 'true';
    const savedAnimations = localStorage.getItem('animations') !== 'false';

    if (savedTheme) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    }
    if (savedFontSize) {
      setFontSizeState(savedFontSize);
      applyFontSize(savedFontSize);
    }
    if (savedDensity) {
      setDensityState(savedDensity);
      applyDensity(savedDensity);
    }
    setSidebarCollapsedState(savedSidebar);
    applySidebar(savedSidebar);
    setAnimationsEnabledState(savedAnimations);
    applyAnimations(savedAnimations);
  };

  // ============================================================
  // MISE A JOUR DES PREFERENCES
  // ============================================================

  // ✅ CORRIGE : Type securise pour les preferences partielles
  const updatePreferences = async (prefs: Partial<Preferences>) => {
    const token = getToken();
    
    // Appliquer les changements en local d'abord
    if (prefs.theme !== undefined) {
      setThemeState(prefs.theme);
      applyTheme(prefs.theme);
    }
    if (prefs.font_size !== undefined) {
      setFontSizeState(prefs.font_size);
      applyFontSize(prefs.font_size);
    }
    if (prefs.density !== undefined) {
      setDensityState(prefs.density);
      applyDensity(prefs.density);
    }
    if (prefs.sidebar_collapsed !== undefined) {
      setSidebarCollapsedState(prefs.sidebar_collapsed);
      applySidebar(prefs.sidebar_collapsed);
    }
    if (prefs.animations_enabled !== undefined) {
      setAnimationsEnabledState(prefs.animations_enabled);
      applyAnimations(prefs.animations_enabled);
    }

    // Mettre a jour le state preferences
    setPreferences(prev => {
      if (!prev) return null;
      return {
        ...prev,
        ...prefs,
      };
    });

    if (!token) {
      return;
    }

    try {
      await api.put('/auth/preferences', prefs);
    } catch (error) {
      console.error('Erreur mise a jour preferences:', error);
    }
  };

  // ============================================================
  // SETTERS
  // ============================================================

  const setTheme = async (newTheme: Theme) => {
    await updatePreferences({ theme: newTheme });
  };

  const setFontSize = async (size: FontSize) => {
    await updatePreferences({ font_size: size });
  };

  const setDensity = async (newDensity: Density) => {
    await updatePreferences({ density: newDensity });
  };

  const setSidebarCollapsed = async (collapsed: boolean) => {
    await updatePreferences({ sidebar_collapsed: collapsed });
  };

  const setAnimationsEnabled = async (enabled: boolean) => {
    await updatePreferences({ animations_enabled: enabled });
  };

  // ============================================================
  // INITIALISATION
  // ============================================================

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    loadPreferences();

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        fontSize,
        density,
        sidebarCollapsed,
        animationsEnabled,
        preferences,
        loading,
        setTheme,
        setFontSize,
        setDensity,
        setSidebarCollapsed,
        setAnimationsEnabled,
        updatePreferences,
        loadPreferences,
        applyTheme,
        applyFontSize,
        applyDensity,
        applyAnimations,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}