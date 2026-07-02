// frontend/src/app/(dashboard)/dashboard/settings/tabs/appearance.tsx

'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Sun, Moon, Monitor, 
  CheckCircle, Save, Loader2,
  Layout, Maximize, Minimize,
  Type, Eye
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
        <p className="text-sm font-medium text-gray-700">{label}</p>
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
  const { 
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
    updatePreferences
  } = useTheme();

  const [saving, setSaving] = useState(false);

  // ============================================================
  // SAUVEGARDE - CORRIGE AVEC LES BONS NOMS
  // ============================================================

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // ✅ Utiliser les noms camelCase pour le frontend
      await updatePreferences({
        theme,
        fontSize,
        density,
        sidebarCollapsed,
        animationsEnabled,
      });
      toast.success(getText('Toutes les preferences sauvegardees', 'Vita ny fitehirizana ny safidy rehetra'));
    } catch (error) {
      toast.error(getText('Erreur lors de la sauvegarde', 'Nisy hadisoana'));
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // RENDU
  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-800 animate-spin" />
      </div>
    );
  }

  const getFontSizeClass = (size: string) => {
    if (size === 'small') return 'text-sm';
    if (size === 'large') return 'text-lg';
    return 'text-base';
  };

  const getFontSizeLabel = (size: string) => {
    if (size === 'small') return getText('Petite (14px)', 'Kely (14px)');
    if (size === 'large') return getText('Grande (18px)', 'Lehibe (18px)');
    return getText('Moyenne (16px)', 'Miary (16px)');
  };

  return (
    <div className="space-y-6">
      
      {/* THEME */}
      <SettingCard 
        title={getText('Theme', 'Loko')}
        description={getText('Choisissez votre theme prefere', 'Fidio ny lokonao')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
              theme === 'light' 
                ? 'border-blue-800 bg-blue-50 shadow-md scale-[1.02]' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 hover:scale-[1.01]'
            }`}
          >
            <Sun className={`w-10 h-10 mx-auto mb-2 ${theme === 'light' ? 'text-blue-800' : 'text-gray-400'}`} />
            <p className="text-sm font-medium text-gray-800">{getText('Clair', 'Mazava')}</p>
            {theme === 'light' && (
              <div className="mt-2 flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4 text-blue-800" />
                <span className="text-xs text-blue-800 font-medium">{getText('Actif', 'Mavitrika')}</span>
              </div>
            )}
          </button>
          
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
              theme === 'dark' 
                ? 'border-blue-800 bg-blue-50 shadow-md scale-[1.02]' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 hover:scale-[1.01]'
            }`}
          >
            <Moon className={`w-10 h-10 mx-auto mb-2 ${theme === 'dark' ? 'text-blue-800' : 'text-gray-400'}`} />
            <p className="text-sm font-medium text-gray-800">{getText('Sombre', 'Maizina')}</p>
            {theme === 'dark' && (
              <div className="mt-2 flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4 text-blue-800" />
                <span className="text-xs text-blue-800 font-medium">{getText('Actif', 'Mavitrika')}</span>
              </div>
            )}
          </button>
          
          <button
            onClick={() => setTheme('system')}
            className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
              theme === 'system' 
                ? 'border-blue-800 bg-blue-50 shadow-md scale-[1.02]' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 hover:scale-[1.01]'
            }`}
          >
            <Monitor className={`w-10 h-10 mx-auto mb-2 ${theme === 'system' ? 'text-blue-800' : 'text-gray-400'}`} />
            <p className="text-sm font-medium text-gray-800">{getText('Systeme', 'Rafitra')}</p>
            {theme === 'system' && (
              <div className="mt-2 flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4 text-blue-800" />
                <span className="text-xs text-blue-800 font-medium">{getText('Actif', 'Mavitrika')}</span>
              </div>
            )}
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            {getText('Theme actuellement applique:', 'Loko ampiasaina ankehitriny:')} 
            <span className="font-semibold text-blue-800">
              {theme === 'light' && getText('Clair', 'Mazava')}
              {theme === 'dark' && getText('Sombre', 'Maizina')}
              {theme === 'system' && getText('Systeme', 'Rafitra')}
            </span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {getText('Le theme est applique a toute l\'interface', 'Ny loko dia mihatra amin\'ny sehatra rehetra')}
          </p>
        </div>
      </SettingCard>

      {/* TAILLE DE LA POLICE */}
      <SettingCard 
        title={getText('Taille de la police', 'Habeny ny soratra')}
        description={getText('Ajustez la taille du texte pour une meilleure lisibilite', 'Ampifanaraho ny habeny ny soratra mba ho mora vakina')}
      >
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFontSize('small')}
            className={`px-4 py-2.5 rounded-lg border-2 transition-all duration-300 ${
              fontSize === 'small' 
                ? 'border-blue-800 bg-blue-50 text-blue-800 shadow-sm' 
                : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <span className="text-sm">
              {getText('Petit', 'Kely')}
            </span>
            {fontSize === 'small' && <CheckCircle className="w-4 h-4 text-blue-800 ml-2 inline" />}
          </button>
          
          <button
            onClick={() => setFontSize('medium')}
            className={`px-4 py-2.5 rounded-lg border-2 transition-all duration-300 ${
              fontSize === 'medium' 
                ? 'border-blue-800 bg-blue-50 text-blue-800 shadow-sm' 
                : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <span className="text-base">
              {getText('Moyen', 'Miary')}
            </span>
            {fontSize === 'medium' && <CheckCircle className="w-4 h-4 text-blue-800 ml-2 inline" />}
          </button>
          
          <button
            onClick={() => setFontSize('large')}
            className={`px-4 py-2.5 rounded-lg border-2 transition-all duration-300 ${
              fontSize === 'large' 
                ? 'border-blue-800 bg-blue-50 text-blue-800 shadow-sm' 
                : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <span className="text-lg">
              {getText('Grand', 'Lehibe')}
            </span>
            {fontSize === 'large' && <CheckCircle className="w-4 h-4 text-blue-800 ml-2 inline" />}
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
          <p className={`${getFontSizeClass(fontSize)} text-gray-700 transition-all duration-300`}>
            {getText('Apercu du texte dans la taille selectionnee', 'Topi-mason\'ny soratra amin\'ny habeny voafidy')}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {getText('Taille actuelle:', 'Habeny ankehitriny:')} 
            <span className="font-medium text-gray-600 ml-1">
              {getFontSizeLabel(fontSize)}
            </span>
          </p>
        </div>
      </SettingCard>

      {/* DENSITE */}
      <SettingCard 
        title={getText('Densite', 'Fahavitsiana')}
        description={getText('Ajustez l\'espacement des elements de l\'interface', 'Ampifanaraho ny elanelan\'ny zavatra amin\'ny sehatra')}
      >
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setDensity('compact')}
            className={`px-4 py-2.5 rounded-lg border-2 transition-all duration-300 flex items-center gap-2 ${
              density === 'compact' 
                ? 'border-blue-800 bg-blue-50 text-blue-800 shadow-sm' 
                : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <Minimize className="w-4 h-4" />
            <span>{getText('Compact', 'Kely')}</span>
            {density === 'compact' && <CheckCircle className="w-4 h-4 text-blue-800 ml-1" />}
          </button>
          
          <button
            onClick={() => setDensity('comfortable')}
            className={`px-4 py-2.5 rounded-lg border-2 transition-all duration-300 flex items-center gap-2 ${
              density === 'comfortable' 
                ? 'border-blue-800 bg-blue-50 text-blue-800 shadow-sm' 
                : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>{getText('Confortable', 'Mila')}</span>
            {density === 'comfortable' && <CheckCircle className="w-4 h-4 text-blue-800 ml-1" />}
          </button>
          
          <button
            onClick={() => setDensity('spacious')}
            className={`px-4 py-2.5 rounded-lg border-2 transition-all duration-300 flex items-center gap-2 ${
              density === 'spacious' 
                ? 'border-blue-800 bg-blue-50 text-blue-800 shadow-sm' 
                : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <Maximize className="w-4 h-4" />
            <span>{getText('Espace', 'Malalaka')}</span>
            {density === 'spacious' && <CheckCircle className="w-4 h-4 text-blue-800 ml-1" />}
          </button>
        </div>
        
        <p className="text-xs text-gray-400 mt-2">
          {getText('Densite actuelle:', 'Fahavitsiana ankehitriny:')} 
          <span className="font-medium text-gray-600 ml-1">
            {density === 'compact' && getText('Compacte', 'Kely')}
            {density === 'comfortable' && getText('Confortable', 'Mila')}
            {density === 'spacious' && getText('Espace', 'Malalaka')}
          </span>
        </p>
      </SettingCard>

      {/* PREFERENCES SUPPLEMENTAIRES */}
      <SettingCard title={getText('Preferences supplementaires', 'Safidy fanampiny')}>
        <div className="space-y-3">
          <ToggleSwitch
            enabled={animationsEnabled}
            onChange={setAnimationsEnabled}
            label={getText('Animations et transitions', 'Animations sy tetezamita')}
            description={getText('Activer les animations dans l\'interface', 'Ampiasao ny animations amin\'ny sehatra')}
          />
          <ToggleSwitch
            enabled={sidebarCollapsed}
            onChange={setSidebarCollapsed}
            label={getText('Barre laterale reduite', 'Ahena ny sisiny')}
            description={getText('Reduire la barre laterale par defaut', 'Ahena ny sisiny amin\'ny fomba voafaritra')}
          />
        </div>
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200 text-xs text-green-700 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          {getText('Les preferences sont sauvegardees en base de donnees PostgreSQL', 'Ny safidy dia tehirizina ao amin\'ny base de donnees PostgreSQL')}
        </div>
      </SettingCard>

      {/* BOUTON SAUVEGARDER */}
      <button
        onClick={handleSaveAll}
        disabled={saving}
        className="w-full px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {getText('Sauvegarde...', 'Fitehirizana...')}
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            {getText('Enregistrer toutes les preferences', 'Tehirizo ny safidy rehetra')}
          </>
        )}
      </button>

      {/* RESUME DES PREFERENCES */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Type className="w-4 h-4 text-blue-600" />
          {getText('Resume des preferences', 'Famintinana ny safidy')}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {getText('Theme:', 'Loko:')} 
            <span className="font-medium text-gray-800">
              {theme === 'light' && getText('Clair', 'Mazava')}
              {theme === 'dark' && getText('Sombre', 'Maizina')}
              {theme === 'system' && getText('Systeme', 'Rafitra')}
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {getText('Police:', 'Soratra:')} 
            <span className="font-medium text-gray-800">
              {fontSize === 'small' && getText('Petite', 'Kely')}
              {fontSize === 'medium' && getText('Moyenne', 'Miary')}
              {fontSize === 'large' && getText('Grande', 'Lehibe')}
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {getText('Densite:', 'Fahavitsiana:')} 
            <span className="font-medium text-gray-800">
              {density === 'compact' && getText('Compacte', 'Kely')}
              {density === 'comfortable' && getText('Confortable', 'Mila')}
              {density === 'spacious' && getText('Espace', 'Malalaka')}
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {getText('Animations:', 'Animations:')} 
            <span className="font-medium text-gray-800">
              {animationsEnabled ? getText('Activees', 'Mavitrika') : getText('Desactivees', 'Tsy miasa')}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          {getText('Derniere mise a jour: automatique', 'Fanovana farany: automatique')}
        </p>
      </div>
    </div>
  );
}