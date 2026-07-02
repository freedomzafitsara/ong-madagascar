// frontend/src/app/(dashboard)/dashboard/settings/tabs/security.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Shield, Lock, Eye, EyeOff, 
  CheckCircle, Save, Loader2,
  LogOut, AlertCircle, Key
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';

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

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export function SecurityTab({ 
  user, 
  getText, 
  setSuccess, 
  setError 
}: { 
  user: any; 
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
        description={getText('Choisissez un mot de passe fort pour votre compte', 'Mifidiana teny miafina matanjaka ho an\'ny kaontinao')}
      >
        <div className="space-y-4">
          <SettingRow
            label={getText('Mot de passe actuel', 'Teny miafina ankehitriny')}
            value={currentPassword}
            onChange={setCurrentPassword}
            type={showPassword ? 'text' : 'password'}
            placeholder={getText('Entrez votre mot de passe actuel', 'Ampidiro ny teny miafinao ankehitriny')}
            icon={Lock}
            required
          />
          <SettingRow
            label={getText('Nouveau mot de passe', 'Teny miafina vaovao')}
            value={newPassword}
            onChange={setNewPassword}
            type={showPassword ? 'text' : 'password'}
            placeholder={getText('Entrez votre nouveau mot de passe', 'Ampidiro ny teny miafina vaovao')}
            icon={Key}
            required
          />
          <SettingRow
            label={getText('Confirmer le mot de passe', 'Hamarino ny teny miafina')}
            value={confirmPassword}
            onChange={setConfirmPassword}
            type={showPassword ? 'text' : 'password'}
            placeholder={getText('Confirmez votre nouveau mot de passe', 'Hamarino ny teny miafina vaovao')}
            icon={CheckCircle}
            required
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
            <span className="text-xs text-gray-400">
              {getText('Le mot de passe doit contenir au moins 6 caracteres', 'Ny teny miafina dia tsy maintsy misy 6 soratra farafahakeliny')}
            </span>
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
        
        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-700">
            {getText('Apres la deconnexion, vous devrez vous reconnecter avec vos identifiants', 'Rehefa mivoaka dia tsy maintsy hiditra indray miaraka amin\'ny fahalalanao')}
          </p>
        </div>
      </SettingCard>

      <SettingCard title={getText('Securite du compte', 'Fiarovana ny kaonty')}>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">{getText('Statut du compte', 'Sata ny kaonty')}</span>
            <span className="text-green-600 font-medium">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              {getText('Actif', 'Mavitrika')}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">{getText('Role', 'Sata')}</span>
            <span className="text-blue-600 font-medium">
              {user?.role === 'super_admin' ? 'Super Administrateur' :
               user?.role === 'admin' ? 'Administrateur' :
               getText('Utilisateur', 'Mpampiasa')}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">{getText('Email', 'Email')}</span>
            <span className="text-gray-800 font-medium">{user?.email}</span>
          </div>
        </div>
      </SettingCard>
    </div>
  );
}