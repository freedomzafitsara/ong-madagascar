// frontend/src/app/(dashboard)/dashboard/settings/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { 
  Settings, Shield, Palette, Bell, 
  Globe, Lock, Monitor, Moon, Sun, 
  CheckCircle, AlertCircle,
  Loader2, Save, X, Eye, EyeOff,
  Mail, Phone, MapPin, Building, Award,
  LogOut, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';

// ============================================================
// TYPES
// ============================================================

interface Preferences {
  language: string;
  timezone: string;
  theme: string;
  font_size: string;
  sidebar_collapsed: boolean;
  animations_enabled: boolean;
  density: string;
  email_notifications: boolean;
  push_notifications: boolean;
  job_alerts: boolean;
  project_updates: boolean;
  blog_updates: boolean;
  system_updates: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  avatar_url?: string;
  is_active?: boolean;
}

// ============================================================
// TABS CONFIGURATION - SANS L'ONGLET PROFILE
// ============================================================

const TABS = [
  { id: 'general', labelFr: 'General', labelMg: 'Ankapobeny', icon: Settings },
  { id: 'security', labelFr: 'Securite', labelMg: 'Fiarovana', icon: Shield },
  { id: 'appearance', labelFr: 'Apparence', labelMg: 'Endrika', icon: Palette },
  { id: 'notifications', labelFr: 'Notifications', labelMg: 'Fampandrenesana', icon: Bell },
];

// ============================================================
// COMPOSANTS REUTILISABLES
// ============================================================

function TabButton({ 
  tab, 
  isActive, 
  onClick 
}: { 
  tab: typeof TABS[0]; 
  isActive: boolean; 
  onClick: () => void;
}) {
  const { language } = useLanguage();
  const Icon = tab.icon;
  const label = language === 'fr' ? tab.labelFr : tab.labelMg;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full ${
        isActive 
          ? 'bg-blue-50 text-blue-800 border border-blue-200 shadow-sm' 
          : 'text-gray-600 hover:bg-gray-50 border border-transparent'
      }`}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-800' : 'text-gray-400'}`} />
      <span className="font-medium text-sm">{label}</span>
      {isActive && <CheckCircle className="w-4 h-4 text-blue-800 ml-auto" />}
    </button>
  );
}

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

function SettingRow({ 
  label, 
  value, 
  onChange, 
  type = 'text',
  placeholder,
  disabled = false,
  icon: Icon,
  helper,
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  icon?: any;
  helper?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon className="w-4 h-4 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition ${
            disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'
          }`}
        />
      </div>
      {helper && <p className="text-xs text-gray-400">{helper}</p>}
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
// ONGLET GENERAL
// ============================================================

function GeneralTab({ 
  user, 
  getText, 
  preferences, 
  setPreferences,
  onSave 
}: { 
  user: UserProfile | null; 
  getText: (fr: string, mg: string) => string;
  preferences: Preferences;
  setPreferences: (prefs: Preferences) => void;
  onSave: () => Promise<void>;
}) {
  const { language, setLanguage } = useLanguage();
  const [saving, setSaving] = useState(false);

  const handleLanguageChange = async (lang: 'fr' | 'mg') => {
    setPreferences({ ...preferences, language: lang });
    setLanguage(lang);
    try {
      await authApi.updateProfile({ preferred_language: lang });
      toast.success(getText('Langue mise a jour', 'Vita ny fanovana fiteny'));
    } catch (error) {
      console.error('Erreur sauvegarde langue:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <SettingCard 
        title={getText('Langue', 'Fiteny')}
        description={getText('Choisissez votre langue preferee', 'Fidio ny fiteny tianao')}
      >
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleLanguageChange('fr')}
            className={`px-4 py-2.5 rounded-lg border transition flex items-center gap-2 ${
              preferences.language === 'fr' 
                ? 'border-blue-800 bg-blue-50 text-blue-800' 
                : 'border-gray-300 text-gray-600 hover:border-blue-300'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium">{getText('Francais', 'Frantsay')}</span>
            {preferences.language === 'fr' && <CheckCircle className="w-4 h-4 text-blue-800" />}
          </button>
          <button
            onClick={() => handleLanguageChange('mg')}
            className={`px-4 py-2.5 rounded-lg border transition flex items-center gap-2 ${
              preferences.language === 'mg' 
                ? 'border-blue-800 bg-blue-50 text-blue-800' 
                : 'border-gray-300 text-gray-600 hover:border-blue-300'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium">{getText('Malagasy', 'Malagasy')}</span>
            {preferences.language === 'mg' && <CheckCircle className="w-4 h-4 text-blue-800" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {getText('La langue est appliquee a toute l\'interface', 'Ny fiteny dia mihatra amin\'ny sehatra rehetra')}
        </p>
      </SettingCard>

      <SettingCard 
        title={getText('Fuseau horaire', 'Faritry ny fotoana')}
        description={getText('Configurez votre fuseau horaire', 'Ampifanaraho ny faritry ny fotoana')}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={preferences.timezone}
            onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none bg-white"
          >
            <option value="Indian/Antananarivo">Indian/Antananarivo (UTC+3)</option>
            <option value="UTC">UTC</option>
            <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
            <option value="Europe/London">Europe/London (UTC+0)</option>
          </select>
        </div>
      </SettingCard>

      <SettingCard 
        title={getText('Association Y-MaD', 'Fikambanana Y-MaD')}
        description={getText('Informations officielles', 'Fampahalalana ofisialy')}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Building className="w-5 h-5 text-blue-800" />
            <div>
              <p className="text-xs text-gray-500">{getText('Nom', 'Anarana')}</p>
              <p className="font-medium text-gray-800">Y-MaD - Young for Madagascar Development</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <MapPin className="w-5 h-5 text-blue-800" />
            <div>
              <p className="text-xs text-gray-500">{getText('Adresse', 'Adiresy')}</p>
              <p className="font-medium text-gray-800">Carion, Antananarivo, Madagascar</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-blue-800" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium text-gray-800">ymad.mg@gmail.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-blue-800" />
            <div>
              <p className="text-xs text-gray-500">{getText('Telephone', 'Telefaonina')}</p>
              <p className="font-medium text-gray-800">+261 32 04 856 97</p>
            </div>
          </div>
        </div>
      </SettingCard>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50 flex items-center gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {getText('Enregistrer toutes les modifications', 'Tehirizo ny fanovana rehetra')}
      </button>
    </div>
  );
}

// ============================================================
// ONGLET SECURITE
// ============================================================

function SecurityTab({ 
  user, 
  getText, 
  setSuccess, 
  setError 
}: { 
  user: UserProfile | null; 
  getText: (fr: string, mg: string) => string;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
}) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(getText('Tous les champs sont requis', 'Ilaina ny sehatra rehetra'));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(getText('Les mots de passe ne correspondent pas', 'Tsy mitovy ny teny miafina'));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(getText('6 caracteres minimum', '6 soratra farafahakeliny'));
      return;
    }

    setSaving(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success(getText('Mot de passe modifie', 'Vita ny fanovana'));
      setSuccess(getText('Mot de passe modifie avec succes', 'Vita ny fanovana ny teny miafina'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || getText('Erreur', 'Nisy hadisoana');
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm(getText('Voulez-vous vous deconnecter ?', 'Tiavo mivoaka ve ianao ?'))) {
      localStorage.clear();
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/login');
    }
  };

  return (
    <div className="space-y-6">
      <SettingCard 
        title={getText('Changer le mot de passe', 'Hanova ny teny miafina')}
        description={getText('Choisissez un mot de passe fort', 'Mifidiana teny miafina matanjaka')}
      >
        <div className="space-y-4">
          <SettingRow
            label={getText('Mot de passe actuel', 'Teny miafina ankehitriny')}
            value={currentPassword}
            onChange={setCurrentPassword}
            type={showPassword ? 'text' : 'password'}
            placeholder={getText('Mot de passe actuel', 'Teny miafina ankehitriny')}
            icon={Lock}
          />
          <SettingRow
            label={getText('Nouveau mot de passe', 'Teny miafina vaovao')}
            value={newPassword}
            onChange={setNewPassword}
            type={showPassword ? 'text' : 'password'}
            placeholder={getText('Nouveau mot de passe', 'Teny miafina vaovao')}
            icon={Lock}
          />
          <SettingRow
            label={getText('Confirmer le mot de passe', 'Hamarino ny teny miafina')}
            value={confirmPassword}
            onChange={setConfirmPassword}
            type={showPassword ? 'text' : 'password'}
            placeholder={getText('Confirmer le mot de passe', 'Hamarino ny teny miafina')}
            icon={Lock}
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-800 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPassword ? getText('Cacher', 'Afeno') : getText('Afficher', 'Aseho')}
            </button>
          </div>
          <button
            onClick={handleChangePassword}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {getText('Changer le mot de passe', 'Hanova ny teny miafina')}
          </button>
        </div>
      </SettingCard>

      <SettingCard title={getText('Session', 'Fivoriana')}>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-800">{getText('Se deconnecter', 'Mivoaka')}</p>
            <p className="text-xs text-gray-500">{getText('Mettre fin a votre session', 'Hamarana ny fivorianao')}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {getText('Deconnexion', 'Mivoaha')}
          </button>
        </div>
      </SettingCard>
    </div>
  );
}

// ============================================================
// ONGLET APPARENCE - AVEC MODE CLAIR/SOMBRE
// ============================================================

function AppearanceTab({ 
  getText, 
  preferences, 
  setPreferences,
  onSave 
}: { 
  getText: (fr: string, mg: string) => string;
  preferences: Preferences;
  setPreferences: (prefs: Preferences) => void;
  onSave: () => Promise<void>;
}) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(preferences.theme as any || 'light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(preferences.sidebar_collapsed || false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(preferences.font_size as any || 'medium');
  const [saving, setSaving] = useState(false);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setPreferences({ ...preferences, theme: newTheme });
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      localStorage.removeItem('theme');
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    setPreferences({ ...preferences, font_size: size });
  };

  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    setPreferences({ ...preferences, sidebar_collapsed: collapsed });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      
      <SettingCard 
        title={getText('Theme', 'Loko')}
        description={getText('Choisissez votre theme', 'Fidio ny lokonao')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleThemeChange('light')}
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
            onClick={() => handleThemeChange('dark')}
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
            onClick={() => handleThemeChange('system')}
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
        <p className="text-xs text-gray-400 mt-3">
          {getText('Le theme est applique a toute l\'interface', 'Ny loko dia mihatra amin\'ny sehatra rehetra')}
        </p>
      </SettingCard>

      <SettingCard 
        title={getText('Taille de la police', 'Habeny ny soratra')}
        description={getText('Ajustez la taille du texte', 'Ampifanaraho ny habeny ny soratra')}
      >
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleFontSizeChange('small')}
            className={`px-4 py-2.5 rounded-lg border transition ${
              fontSize === 'small' 
                ? 'border-blue-800 bg-blue-50 text-blue-800' 
                : 'border-gray-300 text-gray-600 hover:border-blue-300'
            }`}
          >
            <span className="text-sm">{getText('Petit', 'Kely')}</span>
            {fontSize === 'small' && <CheckCircle className="w-4 h-4 text-blue-800 ml-2 inline" />}
          </button>
          <button
            onClick={() => handleFontSizeChange('medium')}
            className={`px-4 py-2.5 rounded-lg border transition ${
              fontSize === 'medium' 
                ? 'border-blue-800 bg-blue-50 text-blue-800' 
                : 'border-gray-300 text-gray-600 hover:border-blue-300'
            }`}
          >
            <span className="text-base">{getText('Moyen', 'Miary')}</span>
            {fontSize === 'medium' && <CheckCircle className="w-4 h-4 text-blue-800 ml-2 inline" />}
          </button>
          <button
            onClick={() => handleFontSizeChange('large')}
            className={`px-4 py-2.5 rounded-lg border transition ${
              fontSize === 'large' 
                ? 'border-blue-800 bg-blue-50 text-blue-800' 
                : 'border-gray-300 text-gray-600 hover:border-blue-300'
            }`}
          >
            <span className="text-lg">{getText('Grand', 'Lehibe')}</span>
            {fontSize === 'large' && <CheckCircle className="w-4 h-4 text-blue-800 ml-2 inline" />}
          </button>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className={`${fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'} text-gray-600`}>
            {getText('Apercu du texte', 'Topi-mason\'ny soratra')}
          </p>
        </div>
      </SettingCard>

      <SettingCard title={getText('Affichage', 'Fijerena')}>
        <ToggleSwitch
          enabled={sidebarCollapsed}
          onChange={handleSidebarCollapse}
          label={getText('Barre laterale reduite', 'Ahena ny sisiny')}
          description={getText('Reduire la barre laterale', 'Ahena ny sisiny')}
        />
      </SettingCard>

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

// ============================================================
// ONGLET NOTIFICATIONS
// ============================================================

function NotificationsTab({ 
  getText, 
  preferences, 
  setPreferences,
  onSave 
}: { 
  getText: (fr: string, mg: string) => string;
  preferences: Preferences;
  setPreferences: (prefs: Preferences) => void;
  onSave: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingCard 
        title={getText('Canaux de notification', 'Fomba fampandrenesana')}
        description={getText('Choisissez comment recevoir les notifications', 'Fidio ny fomba hahazoana fampandrenesana')}
      >
        <div className="space-y-3">
          <ToggleSwitch
            enabled={preferences.email_notifications}
            onChange={(val) => setPreferences({ ...preferences, email_notifications: val })}
            label={getText('Notifications par email', 'Fampandrenesana amin\'ny mail')}
            description={getText('Recevez dans votre boite email', 'Mahazoa amin\'ny mail')}
          />
          <ToggleSwitch
            enabled={preferences.push_notifications}
            onChange={(val) => setPreferences({ ...preferences, push_notifications: val })}
            label={getText('Notifications push', 'Fampandrenesana push')}
            description={getText('Recevez dans votre navigateur', 'Mahazoa amin\'ny navigateur')}
          />
        </div>
      </SettingCard>

      <SettingCard 
        title={getText('Types de notifications', 'Karazana fampandrenesana')}
        description={getText('Choisissez ce que vous voulez recevoir', 'Fidio izay tianao hahazoana')}
      >
        <div className="space-y-3">
          <ToggleSwitch
            enabled={preferences.job_alerts}
            onChange={(val) => setPreferences({ ...preferences, job_alerts: val })}
            label={getText('Nouvelles offres d\'emploi', 'Asa vaovao')}
          />
          <ToggleSwitch
            enabled={preferences.project_updates}
            onChange={(val) => setPreferences({ ...preferences, project_updates: val })}
            label={getText('Mise a jour des projets', 'Fanovana tetikasa')}
          />
          <ToggleSwitch
            enabled={preferences.blog_updates}
            onChange={(val) => setPreferences({ ...preferences, blog_updates: val })}
            label={getText('Nouveaux articles', 'Lahatsoratra vaovao')}
          />
          <ToggleSwitch
            enabled={preferences.system_updates}
            onChange={(val) => setPreferences({ ...preferences, system_updates: val })}
            label={getText('Mise a jour systeme', 'Fanovana rafitra')}
          />
        </div>
      </SettingCard>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50 flex items-center gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {getText('Enregistrer', 'Tehirizo')}
      </button>
    </div>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('general');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [preferences, setPreferences] = useState<Preferences>({
    language: 'fr',
    timezone: 'Indian/Antananarivo',
    theme: 'light',
    font_size: 'medium',
    sidebar_collapsed: false,
    animations_enabled: true,
    density: 'comfortable',
    email_notifications: true,
    push_notifications: true,
    job_alerts: true,
    project_updates: true,
    blog_updates: false,
    system_updates: true,
  });
  const [loading, setLoading] = useState(true);

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  // ============================================================
  // CHARGEMENT DES PREFERENCES
  // ============================================================

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await authApi.getPreferences();
        if (response) {
          setPreferences({
            ...preferences,
            ...response,
          });
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error('Erreur chargement preferences:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadPreferences();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ============================================================
  // SAUVEGARDE DES PREFERENCES
  // ============================================================

  const handleSavePreferences = async () => {
    try {
      await authApi.updatePreferences(preferences);
      toast.success(getText('Preferences sauvegardees', 'Vita ny fitehirizana'));
      setSuccessMessage(getText('Preferences sauvegardees avec succes', 'Vita ny fitehirizana ny safidy'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || getText('Erreur', 'Nisy hadisoana');
      toast.error(errorMsg);
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(''), 3000);
      throw error;
    }
  };

  // ============================================================
  // REDIRECTION SI NON AUTHENTIFIE
  // ============================================================

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-800 animate-spin" />
      </div>
    );
  }

  // ============================================================
  // RENDU PRINCIPAL
  // ============================================================

  return (
    <div className="max-w-6xl mx-auto pb-8">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center shadow-sm">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{getText('Parametres', 'Fandrindrana')}</h1>
          <p className="text-gray-500 text-sm">{getText('Configurez votre espace Y-MaD', 'Amboary ny toeranao Y-MaD')}</p>
        </div>
        {user?.role === 'super_admin' && (
          <span className="ml-4 px-3 py-1 bg-gradient-to-r from-blue-700 to-blue-800 text-white text-xs rounded-full shadow-sm">
            {getText('Super Admin', 'Super Admin')}
          </span>
        )}
      </div>

      {successMessage && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="ml-auto">
            <X className="w-4 h-4 text-blue-500 hover:text-blue-700" />
          </button>
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="ml-auto">
            <X className="w-4 h-4 text-red-500 hover:text-red-700" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="md:col-span-1 space-y-1">
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <Award className="w-5 h-5 text-blue-800" />
              <div>
                <p className="text-xs text-gray-500">{getText('Version', 'Dikan-teny')}</p>
                <p className="text-sm font-medium text-gray-800">Y-MaD v1.0.0</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          {activeTab === 'general' && (
            <GeneralTab 
              user={user as UserProfile} 
              getText={getText}
              preferences={preferences}
              setPreferences={setPreferences}
              onSave={handleSavePreferences}
            />
          )}
          {activeTab === 'security' && (
            <SecurityTab 
              user={user as UserProfile} 
              getText={getText}
              setSuccess={setSuccessMessage}
              setError={setErrorMessage}
            />
          )}
          {activeTab === 'appearance' && (
            <AppearanceTab 
              getText={getText}
              preferences={preferences}
              setPreferences={setPreferences}
              onSave={handleSavePreferences}
            />
          )}
          {activeTab === 'notifications' && (
            <NotificationsTab 
              getText={getText}
              preferences={preferences}
              setPreferences={setPreferences}
              onSave={handleSavePreferences}
            />
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-200 pt-6">
        <p>
          {getText(
            'Les parametres sont stockes dans PostgreSQL - Connexion JWT',
            'Ny fandrindrana dia voatahiry ao PostgreSQL - Fifandraisana JWT'
          )}
        </p>
      </div>
    </div>
  );
}