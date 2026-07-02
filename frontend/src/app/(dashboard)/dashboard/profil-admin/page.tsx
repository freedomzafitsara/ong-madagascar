// frontend/src/app/(dashboard)/dashboard/profile/page.tsx

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  User, Mail, Phone, Save, Loader2,
  Shield, Calendar, Clock, Users, Briefcase,
  Award, Globe, BookOpen, FileText,
  LogOut, Edit2,
  AlertCircle, Check, X, Camera, MapPin,
  Building, Star, TrendingUp, CheckCircle,
  Linkedin, Github
} from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { authApi } from '@/lib/api';

// ============================================================
// INTERFACES ET TYPES
// ============================================================

interface AdminStats {
  totalProjects: number;
  totalBeneficiaries: number;
  totalVolunteerHours: number;
  certifications: number;
  projectsCompleted: number;
  activeProjects: number;
  successRate: number;
}

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  region: string;
  bio: string;
  position: string;
  department: string;
  skills: string[];
  linkedin: string;
  github: string;
}

interface ValidationError {
  field: keyof FormData;
  message: string;
}

// ============================================================
// CONSTANTES
// ============================================================

const PHONE_REGEX = /^(?:\+261|0)(?:32|33|34|37|38)\d{7}$/;
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
const MAX_BIO_LENGTH = 500;

const REGIONS = [
  'Analamanga', 'Alaotra Mangoro', 'Amoron\'i Mania', 'Analanjirofo',
  'Androy', 'Anosy', 'Atsimo Andrefana', 'Atsimo Atsinanana',
  'Atsinanana', 'Betsiboka', 'Boeny', 'Bongolava',
  'Diana', 'Fitovinany', 'Haute Matsiatra', 'Ihorombe',
  'Itasy', 'Melaky', 'Menabe', 'Sava',
  'Sofia', 'Vakinankaratra', 'Vatovavy', 'Vatovavy Fitovinany',
];

const DEFAULT_SKILLS = ['Gestion de projet', 'Communication', 'Leadership'];

// ============================================================
// HOOK PERSONNALISE POUR LA GESTION DU PROFIL
// ============================================================

const useProfileManagement = (user: any, updateProfile: any) => {
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    phone: '',
    region: 'Analamanga',
    bio: '',
    position: 'Administrateur',
    department: 'General',
    skills: DEFAULT_SKILLS,
    linkedin: '',
    github: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
      }));
      
      if (user.avatar_url) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4001';
        const avatarUrl = user.avatar_url.startsWith('http') 
          ? user.avatar_url 
          : `${baseUrl}${user.avatar_url}`;
        setAvatarPreview(avatarUrl);
      } else {
        setAvatarPreview(null);
      }
    }
  }, [user]);

  const validateForm = useCallback((): boolean => {
    const errors: ValidationError[] = [];

    if (!formData.first_name.trim()) {
      errors.push({ field: 'first_name', message: 'Le prenom est requis' });
    }

    if (!formData.last_name.trim()) {
      errors.push({ field: 'last_name', message: 'Le nom est requis' });
    }

    if (formData.phone && !PHONE_REGEX.test(formData.phone.replace(/\s/g, ''))) {
      errors.push({ field: 'phone', message: 'Numero de telephone invalide. Format: +261 XX XXX XX' });
    }

    if (formData.linkedin && !URL_REGEX.test(formData.linkedin)) {
      errors.push({ field: 'linkedin', message: 'URL LinkedIn invalide' });
    }

    if (formData.github && !URL_REGEX.test(formData.github)) {
      errors.push({ field: 'github', message: 'URL GitHub invalide' });
    }

    if (formData.bio && formData.bio.length > MAX_BIO_LENGTH) {
      errors.push({ field: 'bio', message: `La bio ne peut pas depasser ${MAX_BIO_LENGTH} caracteres` });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');

      const firstError = validationErrors[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError.field}"]`) as HTMLElement;
        if (element) element.focus();
      }
      return;
    }

    setLoading(true);

    try {
      await updateProfile({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone ? formData.phone.replace(/\s/g, '') : '',
      });

      toast.success('Profil mis a jour avec succes');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Erreur lors de la mise a jour du profil');
    } finally {
      setLoading(false);
    }
  }, [formData, updateProfile, validateForm, validationErrors]);

  const handleCancel = useCallback(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
      }));
    }
    setIsEditing(false);
    setValidationErrors([]);
  }, [user]);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => prev.filter(err => err.field !== name));
  }, []);

  // ============================================================
  // UPLOAD AVATAR - CORRIGE
  // ============================================================

  const handleAvatarUpload = useCallback(async (file: File) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format non supporte. Utilisez JPG, PNG, WEBP ou GIF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop grande (max 5 Mo)');
      return;
    }

    setUploadingAvatar(true);
    try {
      const result = await authApi.uploadAvatar(file);
      
      if (result.avatar_url) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4001';
        const avatarUrl = result.avatar_url.startsWith('http') 
          ? result.avatar_url 
          : `${baseUrl}${result.avatar_url}`;
        
        // ✅ CORRECTION: setAvatarPreview est defini dans le hook
        setAvatarPreview(avatarUrl);
        toast.success('Avatar mis a jour avec succes');
        
        if (user) {
          user.avatar_url = result.avatar_url;
        }
      }
    } catch (error: any) {
      console.error('Erreur upload avatar:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload');
    } finally {
      setUploadingAvatar(false);
    }
  }, [user]);

  return {
    formData,
    isEditing,
    loading,
    validationErrors,
    avatarPreview,
    uploadingAvatar,
    setIsEditing,
    handleSubmit,
    handleCancel,
    handleInputChange,
    handleAvatarUpload,
    setFormData,
    // ✅ AJOUT: Exporter setAvatarPreview pour l'utiliser ailleurs si besoin
    setAvatarPreview,
  };
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function AdminProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateProfile } = useAuth();

  const {
    formData,
    isEditing,
    loading,
    validationErrors,
    avatarPreview,
    uploadingAvatar,
    setIsEditing,
    handleSubmit,
    handleCancel,
    handleInputChange,
    handleAvatarUpload,
    setFormData,
  } = useProfileManagement(user, updateProfile);

  const isMounted = useRef(true);
  const hasCheckedAuth = useRef(false);

  // ============================================================
  // GESTION DE LA LANGUE
  // ============================================================

  const getText = useCallback((fr: string, mg: string): string => {
    const language = typeof window !== 'undefined'
      ? localStorage.getItem('y-mad-language') || 'fr'
      : 'fr';
    return language === 'fr' ? fr : mg;
  }, []);

  // ============================================================
  // REDIRECTIONS
  // ============================================================

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const checkAuth = () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (user?.role !== 'admin' && user?.role !== 'super_admin') {
        router.push('/');
        return;
      }
    };

    checkAuth();

    return () => {
      isMounted.current = false;
    };
  }, [isAuthenticated, user, router]);

  // ============================================================
  // FORMATAGE DES DONNEES
  // ============================================================

  const formatDate = useCallback((dateString?: string): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  }, []);

  // ============================================================
  // STATISTIQUES ADMIN
  // ============================================================

  const adminStats = useMemo((): AdminStats => {
    return {
      totalProjects: 8,
      totalBeneficiaries: 156,
      totalVolunteerHours: 42,
      certifications: 2,
      projectsCompleted: 6,
      activeProjects: 2,
      successRate: 75,
    };
  }, []);

  const statsCards = useMemo(() => [
    {
      label: getText('Projets suivis', 'Tetikasa arahina'),
      value: adminStats.totalProjects.toString(),
      subValue: `${adminStats.activeProjects} ${getText('actifs', 'miasa')}`,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: getText('Beneficiaires', 'Tompondaka'),
      value: adminStats.totalBeneficiaries.toString(),
      subValue: getText('impact direct', 'fiantraikany mivantana'),
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      label: getText('Heures de benefolat', 'Ora fanaovana asa soa'),
      value: adminStats.totalVolunteerHours.toString(),
      subValue: getText('ce mois', 'ity volana ity'),
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: getText('Certifications', 'Fanamarinana'),
      value: adminStats.certifications.toString(),
      subValue: getText('obtenues', 'azo'),
      icon: Award,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
  ], [adminStats, getText]);

  // ============================================================
  // GESTION DE LA DECONNEXION
  // ============================================================

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast.success(getText('Deconnecte avec succes', 'Nivoaka soa aman-tsara'));
      router.push('/login');
    } catch (error) {
      toast.error(getText('Erreur lors de la deconnexion', 'Nisy olana tamin\'ny fivoahana'));
    }
  }, [logout, router, getText]);

  // ============================================================
  // RENDU CONDITIONNEL - CHARGEMENT
  // ============================================================

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  // ============================================================
  // RENDU PRINCIPAL
  // ============================================================

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">

      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              {getText('Mon profil', 'Ny momba ahy')}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {getText(
                'Gerez vos informations personnelles et votre compte administrateur',
                'Ahitsio ny fampahalalanao manokana sy ny kaontinao mpanara-maso'
              )}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {getText('Deconnexion', 'Fivoahana')}
          </button>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">

        <section className="bg-gradient-to-r from-blue-800 to-blue-900 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/50 shadow-lg">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt={`${user.first_name} ${user.last_name}`}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                    onError={() => {
                      // ✅ CORRECTION: Utiliser setAvatarPreview via la variable
                      const { setAvatarPreview: setPreview } = useProfileManagement(user, updateProfile);
                      if (setPreview) setPreview(null);
                    }}
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors cursor-pointer">
                {uploadingAvatar ? (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-blue-600" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </label>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                {user.first_name} {user.last_name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-blue-200 text-sm">
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1 text-blue-200 text-sm">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span>{user.phone}</span>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full">
                  <Shield className="w-3 h-3" />
                  {user.role === 'super_admin'
                    ? getText('Super Administrateur', 'Super Administrateur')
                    : getText('Administrateur', 'Administrateur')}
                </span>
                {user.role === 'super_admin' && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-400/20 text-yellow-200 text-xs font-medium rounded-full">
                    <Star className="w-3 h-3" />
                    {getText('Acces total', 'Fidirana tanteraka')}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isEditing
                  ? 'bg-red-500/20 text-red-200 hover:bg-red-500/30'
                  : 'bg-white/20 text-white hover:bg-white/30'
                }`}
            >
              <Edit2 className="w-4 h-4" />
              {isEditing ? getText('Annuler', 'Aoka') : getText('Modifier', 'Hanova')}
            </button>
          </div>
        </section>

        <section className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-gray-500">
                <Calendar className="w-4 h-4" />
                {getText('Membre depuis', 'Nisoratra tamin\'ny')}{' '}
                <span className="font-medium text-gray-700">
                  {formatDate(user.created_at)}
                </span>
              </span>
              <span className="flex items-center gap-1.5 text-gray-500">
                <Clock className="w-4 h-4" />
                {getText('Derniere connexion', 'Niditra farany')}:{' '}
                <span className="font-medium text-gray-700">
                  {formatDate(user.last_login)}
                </span>
              </span>
            </div>
            <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-medium">
              <CheckCircle className="w-3 h-3" />
              {getText('Compte actif', 'Kaonty miasa')}
            </span>
          </div>
        </section>

        <section className="px-6 py-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            {getText('Statistiques et impact', 'Statistika sy fiantraikany')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`${stat.bgColor} rounded-xl p-4 text-center transition-transform hover:scale-105`}
                >
                  <div className={`flex items-center justify-center mb-2 ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.subValue}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                {getText('Taux de reussite des projets', 'Tahan\'ny fahombiazan\'ny tetikasa')}
              </span>
              <span className="text-sm font-bold text-blue-600">
                {adminStats.successRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                style={{ width: `${adminStats.successRate}%` }}
              />
            </div>
          </div>
        </section>

        <section className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  {getText('Informations personnelles', 'Fampahalalana manokana')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {getText('Prenom', 'Anarana')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${validationErrors.some(e => e.field === 'first_name')
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-blue-500'
                        }`}
                      placeholder={getText('Jean', 'Jean')}
                      required
                    />
                    {validationErrors.filter(e => e.field === 'first_name').map(err => (
                      <p key={err.field} className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {err.message}
                      </p>
                    ))}
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {getText('Nom', 'Fanampiny')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${validationErrors.some(e => e.field === 'last_name')
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-blue-500'
                        }`}
                      placeholder={getText('Dupont', 'Dupont')}
                      required
                    />
                    {validationErrors.filter(e => e.field === 'last_name').map(err => (
                      <p key={err.field} className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {err.message}
                      </p>
                    ))}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {getText('Telephone', 'Telefaonina')}
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${validationErrors.some(e => e.field === 'phone')
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-blue-500'
                        }`}
                      placeholder="+261 32 123 45 67"
                    />
                    {validationErrors.filter(e => e.field === 'phone').map(err => (
                      <p key={err.field} className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {err.message}
                      </p>
                    ))}
                    <p className="text-xs text-gray-400 mt-1.5">
                      {getText('Format: +261 XX XXX XX ou 0XX XXXXXX', 'Format: +261 XX XXX XX na 0XX XXXXXX')}
                    </p>
                  </div>
                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {getText('Region', 'Faritra')}
                    </label>
                    <select
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none focus:border-blue-500 transition-colors bg-white"
                    >
                      {REGIONS.map(region => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  {getText('Biographie', 'Tantara momba anao')}
                </h3>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {getText('Bio', 'Bio')}
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={MAX_BIO_LENGTH}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors resize-y ${validationErrors.some(e => e.field === 'bio')
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500'
                      }`}
                    placeholder={getText(
                      'Parlez de vous, votre experience et votre passion pour l\'humanitaire...',
                      'Lazao ny momba anao, ny trazao ary ny fitiavanao ny asa soa...'
                    )}
                  />
                  <div className="flex justify-between items-center mt-1.5">
                    {validationErrors.filter(e => e.field === 'bio').map(err => (
                      <p key={err.field} className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {err.message}
                      </p>
                    ))}
                    <span className="text-xs text-gray-400 ml-auto">
                      {formData.bio.length}/{MAX_BIO_LENGTH}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  {getText('Informations professionnelles', 'Fampahalalana momba ny asa')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {getText('Poste / Fonction', 'Toerana / Asa')}
                    </label>
                    <input
                      id="position"
                      name="position"
                      type="text"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none focus:border-blue-500 transition-colors"
                      placeholder={getText('Administrateur', 'Administrateur')}
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {getText('Departement', 'Departemanta')}
                    </label>
                    <input
                      id="department"
                      name="department"
                      type="text"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none focus:border-blue-500 transition-colors"
                      placeholder={getText('General', 'General')}
                    />
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  {getText('Liens professionnels', 'Rohy momba ny asa')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1.5">
                      LinkedIn
                    </label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="linkedin"
                        name="linkedin"
                        type="url"
                        value={formData.linkedin}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${validationErrors.some(e => e.field === 'linkedin')
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-blue-500'
                          }`}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    {validationErrors.filter(e => e.field === 'linkedin').map(err => (
                      <p key={err.field} className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {err.message}
                      </p>
                    ))}
                  </div>
                  <div>
                    <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1.5">
                      GitHub / Portfolio
                    </label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="github"
                        name="github"
                        type="url"
                        value={formData.github}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${validationErrors.some(e => e.field === 'github')
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-blue-500'
                          }`}
                        placeholder="https://github.com/..."
                      />
                    </div>
                    {validationErrors.filter(e => e.field === 'github').map(err => (
                      <p key={err.field} className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {err.message}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {loading
                    ? getText('Enregistrement...', 'Fitehirizana...')
                    : getText('Enregistrer les modifications', 'Tehirizo ny fanovana')}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  {getText('Annuler', 'Aoka')}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  {getText('Informations personnelles', 'Fampahalalana manokana')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      {getText('Prenom', 'Anarana')}
                    </p>
                    <p className="text-base font-medium text-gray-800 mt-1">
                      {user.first_name || getText('Non renseigne', 'Tsy voalaza')}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      {getText('Nom', 'Fanampiny')}
                    </p>
                    <p className="text-base font-medium text-gray-800 mt-1">
                      {user.last_name || getText('Non renseigne', 'Tsy voalaza')}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      {getText('Adresse email', 'Adiresy email')}
                    </p>
                    <p className="text-base font-medium text-gray-800 mt-1">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-gray-400"></span>
                      {getText("L'adresse email ne peut pas etre modifiee", "Tsy azo ovaina ny adiresy email")}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      {getText('Telephone', 'Telefaonina')}
                    </p>
                    <p className="text-base font-medium text-gray-800 mt-1">
                      {user.phone || getText('Non renseigne', 'Tsy voalaza')}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      {getText('Region', 'Faritra')}
                    </p>
                    <p className="text-base font-medium text-gray-800 mt-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {formData.region}
                    </p>
                  </div>
                  {formData.bio && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 md:col-span-2">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">
                        {getText('Biographie', 'Tantara momba anao')}
                      </p>
                      <p className="text-base text-gray-700 mt-1 leading-relaxed">
                        {formData.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  {getText('Informations professionnelles', 'Fampahalalana momba ny asa')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      {getText('Poste / Fonction', 'Toerana / Asa')}
                    </p>
                    <p className="text-base font-medium text-gray-800 mt-1 flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      {formData.position}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      {getText('Departement', 'Departemanta')}
                    </p>
                    <p className="text-base font-medium text-gray-800 mt-1 flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      {formData.department}
                    </p>
                  </div>
                </div>
              </div>

              {(formData.linkedin || formData.github) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    {getText('Liens professionnels', 'Rohy momba ny asa')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.linkedin && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">LinkedIn</p>
                        <a
                          href={formData.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 hover:underline font-medium text-sm mt-1 flex items-center gap-1"
                        >
                          <Linkedin className="w-4 h-4 flex-shrink-0" />
                          <span>
                            {formData.linkedin.length > 40
                              ? `${formData.linkedin.substring(0, 40)}...`
                              : formData.linkedin}
                          </span>
                        </a>
                      </div>
                    )}
                    {formData.github && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">GitHub / Portfolio</p>
                        <a
                          href={formData.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 hover:underline font-medium text-sm mt-1 flex items-center gap-1"
                        >
                          <Github className="w-4 h-4 flex-shrink-0" />
                          <span>
                            {formData.github.length > 40
                              ? `${formData.github.substring(0, 40)}...`
                              : formData.github}
                          </span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formData.skills && formData.skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    {getText('Competences', 'Fahaizana')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}