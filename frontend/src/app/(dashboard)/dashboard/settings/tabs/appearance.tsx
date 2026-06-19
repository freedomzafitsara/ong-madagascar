// frontend/src/app/(dashboard)/dashboard/settings/tabs/appearance.tsx

'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Palette, Sun, Moon, Monitor, 
  CheckCircle, Save, Loader2,
  Type, Layout, Eye, EyeOff,
  Maximize, Minimize
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

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await updatePreferences({
        theme,
        font_size: fontSize,
        density,
        sidebar_collapsed: sidebarCollapsed,
        animations_enabled: animationsEnabled,
      });
      toast.success(getText('Toutes les preferences sauvegardees', 'Vita ny fitehirizana ny safidy rehetra'));
    } catch (error) {
      toast.error(getText('Erreur lors de la sauvegarde', 'Nisy hadisoana'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-800 animate-spin" />
      </div>
    );
  }

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
            className={`p-4 rounded-xl border transition text-center ${
              theme === 'light' 
                ? 'border-blue-800 bg-blue-50 shadow-sm' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
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
                ? 'border-blue-800 bg-blue-50 shadow-sm' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
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
                ? 'border-blue-800 bg-blue-50 shadow-sm' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <Monitor className={`w-8 h-8 mx-auto mb-2 ${theme === 'system' ? 'text-blue-800' : 'text-gray-400'}`} />
            <p className="text-sm font-medium">{getText('Systeme', 'Rafitra')}</p>
            {theme === 'system' && <CheckCircle className="w-4 h-4 text-blue-800 mx-auto mt-1" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
          {getText('Theme actif:', 'Loko mavitrika:')} 
          <span className="font-medium text-gray-600">
            {theme === 'light' && getText('Clair', 'Mazava')}
            {theme === 'dark' && getText('Sombre', 'Maizina')}
            {theme === 'system' && getText('Systeme', 'Rafitra')}
          </span>
        </p>
      </SettingCard>

      {/* TAILLE DE LA POLICE */}
      <SettingCard 
        title={getText('Taille de la police', 'Habeny ny soratra')}
        description={getText('Ajustez la taille du texte', 'Ampifanaraho ny habeny ny soratra')}
      >
        <div className="flex flex-wrap gap-3">
          {['small', 'medium', 'large'].map((size) => (
            <button
              key={size}
              onClick={() => setFontSize(size as 'small' | 'medium' | 'large')}
              className={`px-4 py-2.5 rounded-lg border transition ${
                fontSize === size 
                  ? 'border-blue-800 bg-blue-50 text-blue-800 shadow-sm' 
                  : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <span className={size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base'}>
                {size === 'small' && getText('Petit', 'Kely')}
                {size === 'medium' && getText('Moyen', 'Miary')}
                {size === 'large' && getText('Grand', 'Lehibe')}
              </span>
              {fontSize === size && <CheckCircle className="w-4 h-4 text-blue-800 ml-2 inline" />}
            </button>
          ))}
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className={`${fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'} text-gray-600 transition-all duration-300`}>
            {getText('Apercu du texte dans la taille selectionnee', 'Topi-mason\'ny soratra amin\'ny habeny voafidy')}
          </p>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {getText('Taille actuelle:', 'Habeny ankehitriny:')} 
          <span className="font-medium text-gray-600 ml-1">
            {fontSize === 'small' && getText('Petite (14px)', 'Kely (14px)')}
            {fontSize === 'medium' && getText('Moyenne (16px)', 'Miary (16px)')}
            {fontSize === 'large' && getText('Grande (18px)', 'Lehibe (18px)')}
          </span>
        </p>
      </SettingCard>

      {/* DENSITE */}
      <SettingCard 
        title={getText('Densite', 'Fahavitsiana')}
        description={getText('Ajustez l\'espacement des elements', 'Ampifanaraho ny elanelan\'ny zavatra')}
      >
        <div className="flex flex-wrap gap-3">
          {['compact', 'comfortable', 'spacious'].map((d) => (
            <button
              key={d}
              onClick={() => setDensity(d as 'compact' | 'comfortable' | 'spacious')}
              className={`px-4 py-2.5 rounded-lg border transition ${
                density === d 
                  ? 'border-blue-800 bg-blue-50 text-blue-800 shadow-sm' 
                  : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <div className="flex items-center gap-2">
                {d === 'compact' && <Minimize className="w-4 h-4" />}
                {d === 'comfortable' && <Layout className="w-4 h-4" />}
                {d === 'spacious' && <Maximize className="w-4 h-4" />}
                {d === 'compact' && getText('Compact', 'Kely')}
                {d === 'comfortable' && getText('Confortable', 'Mila')}
                {d === 'spacious' && getText('Espace', 'Malalaka')}
              </div>
              {density === d && <CheckCircle className="w-4 h-4 text-blue-800 ml-2 inline" />}
            </button>
          ))}
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
            description={getText('Reduire la barre laterale', 'Ahena ny sisiny')}
          />
        </div>
        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          {getText('Les preferences sont sauvegardees en base de donnees', 'Ny safidy dia tehirizina ao amin\'ny base de donnees')}
        </div>
      </SettingCard>

      {/* BOUTON SAUVEGARDER */}
      <button
        onClick={handleSaveAll}
        disabled={saving}
        className="w-full px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
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

      {/* RESUME */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          {getText('Resume des preferences', 'Famintinana ny safidy')}
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {getText('Theme:', 'Loko:')} 
            <span className="font-medium">
              {theme === 'light' && getText('Clair', 'Mazava')}
              {theme === 'dark' && getText('Sombre', 'Maizina')}
              {theme === 'system' && getText('Systeme', 'Rafitra')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {getText('Police:', 'Soratra:')} 
            <span className="font-medium">
              {fontSize === 'small' && getText('Petite', 'Kely')}
              {fontSize === 'medium' && getText('Moyenne', 'Miary')}
              {fontSize === 'large' && getText('Grande', 'Lehibe')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {getText('Densite:', 'Fahavitsiana:')} 
            <span className="font-medium">
              {density === 'compact' && getText('Compacte', 'Kely')}
              {density === 'comfortable' && getText('Confortable', 'Mila')}
              {density === 'spacious' && getText('Espace', 'Malalaka')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {getText('Animations:', 'Animations:')} 
            <span className="font-medium">
              {animationsEnabled ? getText('Activees', 'Mavitrika') : getText('Desactivees', 'Tsy miasa')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}