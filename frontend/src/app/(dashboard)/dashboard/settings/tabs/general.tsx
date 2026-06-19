// frontend/src/app/(dashboard)/dashboard/settings/tabs/general.tsx

'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Globe, Building, MapPin, Mail, Phone, 
  CheckCircle, Save, Loader2, Clock,
  Users, Award, Calendar
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
  helper
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  icon?: any;
  helper?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
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

export function GeneralTab({ user, getText }: { user: any; getText: (fr: string, mg: string) => string }) {
  const { language, setLanguage } = useLanguage();
  const [timezone, setTimezone] = useState('Indian/Antananarivo');
  const [saving, setSaving] = useState(false);
  
  // ✅ CORRIGE : Type securise pour la langue (seulement 'fr' ou 'mg')
  const [selectedLang, setSelectedLang] = useState<'fr' | 'mg'>(language || 'fr');

  // ✅ CORRIGE : Type securise pour la langue (seulement 'fr' ou 'mg')
  const handleLanguageChange = async (lang: 'fr' | 'mg') => {
    setSelectedLang(lang);
    setLanguage(lang);
    
    try {
      await api.put('/auth/profile', { language: lang });
      toast.success(getText('Langue mise a jour', 'Vita ny fanovana fiteny'));
    } catch (error) {
      console.error('Erreur sauvegarde langue:', error);
    }
  };

  const handleSaveTimezone = () => {
    setSaving(true);
    setTimeout(() => {
      toast.success(getText('Fuseau horaire mis a jour', 'Vita ny fanovana faritry ny fotoana'));
      setSaving(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      
      {/* Langue */}
      <SettingCard 
        title={getText('Langue', 'Fiteny')}
        description={getText('Choisissez votre langue preferee pour l\'interface', 'Fidio ny fiteny tianao ho an\'ny sehatra')}
      >
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleLanguageChange('fr')}
            className={`px-4 py-2.5 rounded-lg border transition flex items-center gap-2 ${
              selectedLang === 'fr' 
                ? 'border-blue-800 bg-blue-50 text-blue-800' 
                : 'border-gray-300 text-gray-600 hover:border-blue-300'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium">{getText('Francais', 'Frantsay')}</span>
            {selectedLang === 'fr' && <CheckCircle className="w-4 h-4 text-blue-800" />}
          </button>
          <button
            onClick={() => handleLanguageChange('mg')}
            className={`px-4 py-2.5 rounded-lg border transition flex items-center gap-2 ${
              selectedLang === 'mg' 
                ? 'border-blue-800 bg-blue-50 text-blue-800' 
                : 'border-gray-300 text-gray-600 hover:border-blue-300'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium">{getText('Malagasy', 'Malagasy')}</span>
            {selectedLang === 'mg' && <CheckCircle className="w-4 h-4 text-blue-800" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {getText('La langue sera appliquee a toute l\'interface', 'Ny fiteny dia hahatonga amin\'ny sehatra rehetra')}
        </p>
      </SettingCard>

      {/* Fuseau horaire */}
      <SettingCard 
        title={getText('Fuseau horaire', 'Faritry ny fotoana')}
        description={getText('Configurez votre fuseau horaire pour les dates et heures', 'Ampifanaraho ny faritry ny fotoana ho an\'ny daty sy ora')}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none bg-white"
          >
            <option value="Indian/Antananarivo">Indian/Antananarivo (UTC+3)</option>
            <option value="UTC">UTC</option>
            <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
            <option value="Europe/London">Europe/London (UTC+0)</option>
            <option value="America/New_York">America/New_York (UTC-4)</option>
          </select>
          <button
            onClick={handleSaveTimezone}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {getText('Enregistrer', 'Tehirizo')}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {getText('Le fuseau horaire actuel est', 'Ny faritry ny fotoana ankehitriny dia')}: <span className="font-medium text-gray-600">Indian/Antananarivo (UTC+3)</span>
        </p>
      </SettingCard>

      {/* Informations de l'association */}
      <SettingCard 
        title={getText('Association Y-MaD', 'Fikambanana Y-MaD')}
        description={getText('Informations officielles de l\'association', 'Fampahalalana ofisialy momba ny fikambanana')}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building className="w-5 h-5 text-blue-800" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{getText('Nom', 'Anarana')}</p>
              <p className="font-medium text-gray-800">Y-MaD - Young for Madagascar Development</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-blue-800" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{getText('Adresse', 'Adiresy')}</p>
              <p className="font-medium text-gray-800">Carion, Antananarivo, Madagascar</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-800" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <a href="mailto:ymad.mg@gmail.com" className="font-medium text-blue-800 hover:underline">
                ymad.mg@gmail.com
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-blue-800" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{getText('Telephone', 'Telefaonina')}</p>
              <a href="tel:+261320485697" className="font-medium text-gray-800 hover:underline">
                +261 32 04 856 97
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-blue-800" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{getText('Fondateur', 'Mpanorina')}</p>
              <p className="font-medium text-gray-800">{getText('Pere Pedro Opeka', 'Rainy Pedro Opeka')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-blue-800" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{getText('Date de creation', 'Daty namoronana')}</p>
              <p className="font-medium text-gray-800">1989</p>
            </div>
          </div>
        </div>
      </SettingCard>

      {/* Version */}
      <SettingCard title={getText('Version', 'Dikan-teny')}>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-800">Y-MaD Platform</p>
            <p className="text-xs text-gray-500">v1.0.0 - {getText('Version stable', 'Dikan-teny milamina')}</p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            {getText('A jour', 'Vaovao')}
          </span>
        </div>
      </SettingCard>
    </div>
  );
}