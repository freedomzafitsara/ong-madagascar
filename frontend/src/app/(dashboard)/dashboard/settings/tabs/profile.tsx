// frontend/src/app/(dashboard)/dashboard/settings/tabs/profile.tsx

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, Mail, Phone, Save, Loader2, 
  CheckCircle, AlertCircle, Camera, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

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

export function ProfileTab({ user, getText, setSuccess, setError }: { 
  user: any; 
  getText: (fr: string, mg: string) => string;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
}) {
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error(getText('Le nom et le prenom sont requis', 'Ilaina ny anarana sy ny fianakaviana'));
      return;
    }

    setSaving(true);
    try {
      await api.put('/auth/profile', { 
        first_name: firstName, 
        last_name: lastName, 
        phone: phone || null 
      });
      toast.success(getText('Profil mis a jour', 'Vita ny fanovana'));
      setSuccess(getText('Profil mis a jour avec succes', 'Vita ny fanovana ny momba'));
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || getText('Erreur', 'Nisy hadisoana');
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error(getText('Format d\'image non supporte', 'Tsy tohana ny format sary'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(getText('Image trop grande (max 5 Mo)', 'Lehibe loatra ny sary (farany 5 Mo)'));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.avatar_url) {
        setAvatarPreview(response.data.avatar_url);
        toast.success(getText('Avatar mis a jour', 'Vita ny fanovana sary'));
      }
    } catch (error) {
      console.error('Erreur upload avatar:', error);
      toast.error(getText('Erreur lors de l\'upload', 'Nisy hadisoana tamin\'ny fampidirana'));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Photo de profil */}
      <SettingCard 
        title={getText('Photo de profil', 'Sarin\'ny momba')}
        description={getText('Telechargez une photo pour votre profil', 'Ampidiro sary ho an\'ny momba anao')}
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden border-4 border-gray-200 flex items-center justify-center">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  onError={() => setAvatarPreview(null)}
                />
              ) : (
                <User className="w-12 h-12 text-blue-400" />
              )}
            </div>
            <label 
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 p-1.5 bg-blue-800 text-white rounded-full cursor-pointer hover:bg-blue-900 transition shadow-md"
            >
              <Camera className="w-4 h-4" />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm text-gray-600">
              {getText('JPG, PNG, WEBP, GIF', 'JPG, PNG, WEBP, GIF')}
            </p>
            <p className="text-xs text-gray-400">
              {getText('Taille maximale: 5 Mo', 'Habeny farany: 5 Mo')}
            </p>
          </div>
        </div>
      </SettingCard>

      {/* Informations personnelles */}
      <SettingCard 
        title={getText('Informations personnelles', 'Fampahalalana manokana')}
        description={getText('Mettez a jour vos informations', 'Havaozy ny momba anao')}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingRow
              label={getText('Prenom', 'Anarana')}
              value={firstName}
              onChange={setFirstName}
              placeholder={getText('Votre prenom', 'Ny anaranao')}
              icon={User}
              required
            />
            <SettingRow
              label={getText('Nom', 'Fianakaviana')}
              value={lastName}
              onChange={setLastName}
              placeholder={getText('Votre nom', 'Ny fianakavianao')}
              icon={User}
              required
            />
          </div>
          <SettingRow
            label={getText('Email', 'Email')}
            value={user?.email || ''}
            onChange={() => {}}
            placeholder="email@domaine.com"
            icon={Mail}
            disabled
            helper={getText("L'email ne peut pas etre modifie", 'Tsy azo ovana ny email')}
          />
          <SettingRow
            label={getText('Telephone', 'Telefaonina')}
            value={phone}
            onChange={setPhone}
            placeholder="+261 XX XXX XX"
            icon={Phone}
            helper={getText('Format: +261 32 XX XXX XX', 'Endrika: +261 32 XX XXX XX')}
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {getText('Enregistrer', 'Tehirizo')}
          </button>
        </div>
      </SettingCard>

      {/* Role actuel */}
      <SettingCard title={getText('Role actuel', 'Sata ankehitriny')}>
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <div className={`w-3 h-3 rounded-full ${
            user?.role === 'super_admin' ? 'bg-red-500' :
            user?.role === 'admin' ? 'bg-blue-500' :
            user?.role === 'candidate' ? 'bg-green-500' :
            'bg-gray-400'
          }`} />
          <div>
            <p className="text-sm font-medium text-gray-800">
              {user?.role === 'super_admin' ? getText('Super Administrateur', 'Super Admin') :
               user?.role === 'admin' ? getText('Administrateur', 'Admin') :
               user?.role === 'candidate' ? getText('Candidat', 'Mpangataka') :
               getText('Utilisateur', 'Mpampiasa')}
            </p>
            <p className="text-xs text-gray-500">
              {user?.role === 'super_admin' ? getText('Acces total au systeme', 'Fidirana feno amin\'ny rafitra') :
               user?.role === 'admin' ? getText('Gestion du contenu et des utilisateurs', 'Fitantanana ny votoaty sy ny mpampiasa') :
               user?.role === 'candidate' ? getText('Postuler aux offres d\'emploi', 'Mangataka asa') :
               getText('Acces limit au systeme', 'Fidirana voafetra amin\'ny rafitra')}
            </p>
          </div>
        </div>
      </SettingCard>
    </div>
  );
}