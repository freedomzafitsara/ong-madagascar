// frontend/src/hooks/useLocalStorage.ts

'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personnalisé pour gérer le localStorage de manière réactive
 * 
 * @param key - Clé de stockage dans localStorage
 * @param initialValue - Valeur initiale (si aucune valeur n'est stockée)
 * @returns [storedValue, setValue, removeValue] - La valeur stockée, la fonction pour la mettre à jour, et la fonction pour la supprimer
 * 
 * @example
 * ```tsx
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 * 
 * // Mettre à jour la valeur
 * setTheme('dark');
 * 
 * // Supprimer la valeur
 * removeTheme();
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // État pour stocker la valeur
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item) as T;
      }
      return initialValue;
    } catch (error) {
      console.error(`Erreur lecture localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Fonction pour mettre à jour la valeur
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Erreur écriture localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Fonction pour supprimer la valeur
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Erreur suppression localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Synchroniser entre onglets
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue) as T;
          setStoredValue(newValue);
        } catch {
          setStoredValue(initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Version simplifiée pour stocker un objet dans localStorage
 */
export function useLocalStorageObject<T extends Record<string, unknown>>(
  key: string,
  initialValue: T
): [T, (updates: Partial<T>) => void, () => void] {
  const [storedValue, setStoredValue] = useLocalStorage<T>(key, initialValue);

  const updateValue = useCallback(
    (updates: Partial<T>) => {
      setStoredValue((prev) => ({ ...prev, ...updates }));
    },
    [setStoredValue]
  );

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
  }, [setStoredValue, initialValue]);

  return [storedValue, updateValue, removeValue];
}

export default useLocalStorage;