// frontend/src/app/(dashboard)/dashboard/settings/tabs/appearance.tsx

'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Palette, Sun, Moon, Monitor, 
  CheckCircle, Save, Loader2,
  Type, Layout, Grid, List, 
  Eye, EyeOff, Maximize, Minimize
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// COMPOSANTS
// ============================================================

function SettingCard({ 
  title, 
  description, 
  children 
}: { 
  title: string; 
  description?: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-gray-500 mb-4">{description}</p>
      )}
      {children}
    </div>
  );
}

function ToggleSwitch({ 
  enabled, 
  onChange, 
  label,
  description
}: { 
  enabled: boolean; 
  onChange: (enabled: boolean) => void; 
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className={`w-11 h-6 rounded-full transition-all ${
          enabled ? 'bg-blue-800' : 'bg-gray-300'
        } peer-focus:ring-2 peer-focus:ring-blue-800/50`}>
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export function AppearanceTab({ getText }: { getText: (fr: string, mg: string) => string }) {
  const [theme, setTheme] = useState('light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [density, setDensity] = useState('comfortable');
  const [animations, setAnimations] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      toast.success(getText('Preferences sauvegardees', 'Vita ny fitehirizana'));
      setSaving(false);
    }, 500);
  };

  const getFontSizeClass = (size: string) => {
    if (size === 'small') return 'text-sm';
    if (size === 'large') return 'text-lg';
    return 'text-base';
  };

  return (
    <div className="space-y-6">
      
      {/* Theme */}
      <SettingCard 
        title={getText('Theme', 'Loko')}
        description={getText('Choisissez votre theme prefere', 'Fidio ny lokonao')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border transition text-center ${
              theme === 'light' 
                ? 'border-blue-800 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <Sun className={`w-8 h-8 mx-auto mb-2 ${theme === 'light' ? 'text-blue-800' : 'text-gray-400'}`} />
            <p className="text-sm font-medium">{getText('Clair', 'Mazava')}</p>
            {theme === 'light' && <CheckCircle className="w-4 h-4 text-blue-800 mx-auto mt-1" />}
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border transition text-center ${
              theme === 'dark' 
                ? 'border-blue-800 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <Moon className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-blue-800' : 'text-gray-400'}`} />
            <p className="text-sm font-medium">{getText('Sombre', 'Maizina')}</p>
            {theme === 'dark' && <CheckCircle className="w-4 h-4 text-blue-800 mx-auto mt-1" />}
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-4 rounded-xl border transition text-center ${
              theme === 'system' 
                ? 'border-blue-800 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <Monitor className={`w-8 h-8 mx-auto mb-2 ${theme === 'system' ? 'text-blue-800' : 'text-gray-400'}`} />
            <p className="text-sm font-medium">{getText('Systeme', 'Rafitra')}</p>
            {theme === 'system' && <CheckCircle className="w-4 h-4 text-blue-800 mx-auto mt-1" />}
          </button>
        </div>
      </SettingCard>

      {/* Taille de la police */}
      <SettingCard 
        title={getText('Taille de la police', 'Habeny ny soratra')}
        description={getText('Ajustez la taille du texte', 'Ampifanaraho ny habeny ny soratra')}
      >
        <div className="flex flex-wrap gap-3">
          {['small', 'medium', 'large'].map((size) => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={`px-4 py-2.5 rounded-lg border transition ${
                fontSize === size 
                  ? 'border-blue-800 bg-blue-50 text-blue-800' 
                  : 'border-gray-300 text-gray-600 hover:border-blue-300'
              }`}
            >
              <span className={getFontSizeClass(size)}>
                {size === 'small' && getText('Petit', 'Kely')}
                {size === 'medium' && getText('Moyen', 'Miary')}
                {size === 'large' && getText('Grand', 'Lehibe')}
              </span>
              {fontSize === size && <CheckCircle className="w-4 h-4 text-blue-800 ml-2 inline" />}
            </button>
          ))}
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className={`${getFontSizeClass(fontSize)} text-gray-600`}>
            {getText('Apercu du texte dans la taille selectionnee', 'Topi-mason\'ny soratra amin\'ny habeny voafidy')}
          </p>
        </div>
      </SettingCard>

      {/* Densite */}
      <SettingCard 
        title={getText('Densite', 'Fahavitsiana')}
        description={getText('Ajustez l\'espacement des elements', 'Ampifanaraho ny elanelan\'ny zavatra')}
      >
        <div className="flex flex-wrap gap-3">
          {['compact', 'comfortable', 'spacious'].map((d) => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              className={`px-4 py-2.5 rounded-lg border transition ${
                density === d 
                  ? 'border-blue-800 bg-blue-50 text-blue-800' 
                  : 'border-gray-300 text-gray-600 hover:border-blue-300'
              }`}
            >
              {d === 'compact' && getText('Compact', 'Kely')}
              {d === 'comfortable' && getText('Confortable', 'Mila')}
              {d === 'spacious' && getText('Espace', 'Malalaka')}
              {density === d && <CheckCircle className="w-4 h-4 text-blue-800 ml-2 inline" />}
            </button>
          ))}
        </div>
      </SettingCard>

      {/* Preferences supplementaires */}
      <SettingCard title={getText('Preferences supplementaires', 'Safidy fanampiny')}>
        <div className="space-y-2">
          <ToggleSwitch
            enabled={animations}
            onChange={setAnimations}
            label={getText('Animations et transitions', 'Animations sy tetezamita')}
            description={getText('Activer les animations dans l\'interface', 'Ampiasao ny animations amin\'ny sehatra')}
          />
          <ToggleSwitch
            enabled={sidebarCollapsed}
            onChange={setSidebarCollapsed}
            label={getText('Barre laterale reduite', 'Ahena ny sisiny')}
            description={getText('Reduire la barre laterale', 'Ahena ny sisiny')}
          />
        </div>
      </SettingCard>

      {/* Bouton sauvegarder */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50 flex items-center gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {getText('Enregistrer les preferences', 'Tehirizo ny safidy')}
      </button>
    </div>
  );
}