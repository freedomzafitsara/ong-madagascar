// frontend/src/app/(candidate)/profil-candidat/page.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { uploadService } from '@/services/upload.service';
import { 
  User, Mail, Phone, Camera, Save, Loader2, 
  CheckCircle, Eye, EyeOff, Lock, Shield, 
  Calendar, Briefcase, Award, Users, Clock,
  Edit2, BookOpen, Heart, FileText, Upload, X,
  AlertCircle  // ✅ AJOUT DE AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================

interface FormErrors {
  first_name?: string;
  last_name?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

// ============================================================
// CONFIGURATION
// ============================================================

const SECURITY_CONFIG = {
  minPasswordLength: 8,
  maxNameLength: 50,
  maxPhoneLength: 12,
};

// ✅ Validation téléphone UNIQUEMENT NUMERIQUE
const PHONE_REGEX = /^\d+$/;

// ============================================================
// PROFIL CANDIDAT
// ============================================================

export default function CandidateProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, updateProfile, changePassword, uploadAvatar } = useAuth();
  
  // ============================================================
  // ETATS
  // ============================================================
  
  const [loading, setLoading] = useState<boolean>(false);
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  const [avatarLoading, setAvatarLoading] = useState<boolean>(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [phoneValue, setPhoneValue] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================
  // DONNEES DU FORMULAIRE
  // ============================================================
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    region: '',
    bio: '',
    position: '',
    department: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  // ============================================================
  // TRADUCTION
  // ============================================================

  const getText = (fr: string, mg: string): string => {
    const language = typeof window !== 'undefined' 
      ? localStorage.getItem('y-mad-language') || 'fr' 
      : 'fr';
    return language === 'fr' ? fr : mg;
  };

  // ============================================================
  // INITIALISATION
  // ============================================================

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role === 'admin' || user?.role === 'super_admin') {
      router.push('/dashboard');
      return;
    }

    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        region: 'Analamanga',
        bio: '',
        position: '',
        department: '',
      });
      setPhoneValue(user.phone || '');
    }
  }, [user, isAuthenticated, router]);

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = getText('Le prenom est requis', 'Ilaina ny anarana');
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = getText(
        'Le prenom doit contenir au moins 2 caracteres',
        '2 litera farafahakeliny ny anarana'
      );
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = getText('Le nom est requis', 'Ilaina ny fanampiny');
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = getText(
        'Le nom doit contenir au moins 2 caracteres',
        '2 litera farafahakeliny ny fanampiny'
      );
    }

    // ✅ Validation telephone UNIQUEMENT NUMERIQUE
    if (formData.phone && !PHONE_REGEX.test(formData.phone)) {
      newErrors.phone = getText(
        'Le telephone doit contenir uniquement des chiffres',
        'Ny telefaonina dia tsy maintsy isa ihany'
      );
    } else if (formData.phone && formData.phone.length < 9) {
      newErrors.phone = getText(
        'Le telephone doit contenir au moins 9 chiffres',
        'Ny telefaonina dia tsy maintsy misy 9 isa farafahakeliny'
      );
    } else if (formData.phone && formData.phone.length > 12) {
      newErrors.phone = getText(
        'Le telephone ne doit pas depasser 12 chiffres',
        'Ny telefaonina dia tsy mihoatra ny 12 isa'
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = getText(
        'Le mot de passe actuel est requis',
        'Ilaina ny tenimiafina amin\'izao'
      );
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = getText(
        'Le nouveau mot de passe est requis',
        'Ilaina ny tenimiafina vaovao'
      );
    } else if (passwordData.newPassword.length < SECURITY_CONFIG.minPasswordLength) {
      newErrors.newPassword = getText(
        `Le mot de passe doit contenir au moins ${SECURITY_CONFIG.minPasswordLength} caracteres`,
        `${SECURITY_CONFIG.minPasswordLength} litera farafahakeliny ny tenimiafina`
      );
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = getText(
        'Veuillez confirmer le mot de passe',
        'Hamafiso ny tenimiafina'
      );
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = getText(
        'Les mots de passe ne correspondent pas',
        'Tsy mitovy ny tenimiafina'
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // GESTION DU PROFIL
  // ============================================================

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error(getText(
        'Veuillez corriger les erreurs',
        'Ahitsio ny hadisoana'
      ));
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    try {
      await updateProfile({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone ? formData.phone : '',
      });
      
      setSuccessMessage(getText(
        'Profil mis à jour avec succes',
        'Vita soa aman-tsara ny fanovana'
      ));
      toast.success(getText(
        'Profil mis à jour avec succes',
        'Vita soa aman-tsara ny fanovana'
      ));
      setIsEditing(false);
      
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      toast.error(error.message || getText(
        'Erreur lors de la mise à jour',
        'Nisy olana tamin\'ny fanovana'
      ));
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // GESTION DU MOT DE PASSE
  // ============================================================

  const handlePasswordChange = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      toast.error(getText(
        'Veuillez corriger les erreurs',
        'Ahitsio ny hadisoana'
      ));
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      toast.success(getText(
        'Mot de passe modifié avec succes',
        'Vita soa aman-tsara ny fanovana tenimiafina'
      ));
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.message || getText(
        'Erreur lors du changement de mot de passe',
        'Nisy olana tamin\'ny fanovana tenimiafina'
      ));
    } finally {
      setPasswordLoading(false);
    }
  };

  // ============================================================
  // GESTION DE L'AVATAR - AVEC UPLOAD SERVICE
  // ============================================================

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error(getText(
        'Format non supporte. Utilisez JPG, PNG ou WEBP',
        'Tsy ekena. Mampiasa JPG, PNG na WEBP'
      ));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(getText(
        'Image trop grande. Maximum 5 Mo',
        'Lehibe loatra ny sary. Farany 5 Mo'
      ));
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload avec progression
    setAvatarLoading(true);
    setUploadProgress(0);

    // Simuler la progression
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // ✅ Utiliser uploadAvatar du contexte qui appelle le service
      await uploadAvatar(file);
      
      setUploadProgress(100);
      toast.success(getText(
        'Photo de profil mise à jour',
        'Vita soa aman-tsara ny fanovana sary'
      ));
      
      // ✅ Recharger le user pour avoir l'avatar à jour
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      toast.error(error.message || getText(
        'Erreur lors de l\'upload',
        'Nisy olana tamin\'ny fampidirana'
      ));
      setAvatarPreview(null);
    } finally {
      clearInterval(interval);
      setAvatarLoading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ============================================================
  // GESTION DU TELEPHONE - UNIQUEMENT DES CHIFFRES
  // ============================================================

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const rawValue = e.target.value;
    
    // ✅ Supprimer tous les caracteres non numeriques
    const numericOnly = rawValue.replace(/\D/g, '');
    
    // ✅ Limiter la longueur
    const limitedValue = numericOnly.slice(0, SECURITY_CONFIG.maxPhoneLength);
    
    setPhoneValue(limitedValue);
    setFormData({ ...formData, phone: limitedValue });
    
    // ✅ Validation en temps reel
    if (limitedValue && limitedValue.length > 0 && limitedValue.length < 9) {
      setErrors(prev => ({ 
        ...prev, 
        phone: getText(
          'Le telephone doit contenir 9 a 12 chiffres',
          'Ny telefaonina dia tsy maintsy misy 9 hatramin\'ny 12 isa'
        )
      }));
    } else if (limitedValue && limitedValue.length > 12) {
      setErrors(prev => ({ 
        ...prev, 
        phone: getText(
          'Le telephone ne doit pas depasser 12 chiffres',
          'Ny telefaonina dia tsy mihoatra ny 12 isa'
        )
      }));
    } else {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  // ============================================================
  // FORMATAGE DE LA DATE
  // ============================================================

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  // ============================================================
  // STATISTIQUES CANDIDAT
  // ============================================================

  const stats = [
    { label: getText('Projets suivis', 'Tetikasa arahina'), value: '8', icon: BookOpen },
    { label: getText('Beneficiaires', 'Tompondaka'), value: '156', icon: Users },
    { label: getText('Heures de benefolat', 'Ora fanaovana asa soa'), value: '42', icon: Clock },
    { label: getText('Certifications', 'Fanamarinana'), value: '2', icon: Award },
  ];

  // ============================================================
  // RENDU
  // ============================================================

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* En-tête du profil */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Bannière avec avatar */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/50">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={user.first_name} className="w-full h-full object-cover" />
                ) : user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.first_name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              
              {/* Bouton upload avatar */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 shadow-lg"
                title={getText('Changer la photo', 'Hanova ny sary')}
              >
                {avatarLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              
              {/* Barre de progression upload */}
              {avatarLoading && (
                <div className="absolute -bottom-2 left-0 right-0">
                  <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-400 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-white">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-blue-200 text-sm flex items-center gap-1">
                <Mail className="w-3 h-3" /> {user.email}
              </p>
              {user.phone && (
                <p className="text-blue-300 text-sm flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {user.phone}
                </p>
              )}
              <p className="text-blue-300 text-sm flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {getText('Candidat', 'Mpangataka')}
              </p>
            </div>
          </div>
        </div>

        {/* Infos de base */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>
                  {getText('Membre depuis', 'Nisoratra tamin\'ny')} {formatDate(user.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>
                  {getText('Dernière connexion', 'Niditra farany')}: {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition hover:bg-blue-50 rounded-lg"
            >
              <Edit2 className="w-4 h-4" />
              {isEditing ? getText('Annuler', 'Aoka') : getText('Modifier le profil', 'Hanova ny momba ahy')}
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-4">
            {getText('Statistiques', 'Statistika')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-4 text-center hover:shadow-md transition">
                  <div className="flex items-center justify-center mb-2">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-6">
          
          {/* Message de succès */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-green-700">{successMessage}</span>
            </div>
          )}

          {/* Messages d'erreur */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{errors.general}</span>
            </div>
          )}

          {/* Formulaire d'édition */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('Prenom', 'Anarana')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                      errors.first_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.first_name && (
                    <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('Nom', 'Fanampiny')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                      errors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.last_name && (
                    <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getText('Telephone', 'Telefaonina')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={phoneValue}
                    onChange={handlePhoneChange}
                    onKeyDown={(e) => {
                      // ✅ Bloquer les lettres et caracteres speciaux
                      if (!/^[0-9]$/.test(e.key) && 
                          e.key !== 'Backspace' && 
                          e.key !== 'Delete' && 
                          e.key !== 'Tab' && 
                          e.key !== 'ArrowLeft' && 
                          e.key !== 'ArrowRight' && 
                          e.key !== 'Home' && 
                          e.key !== 'End') {
                        e.preventDefault();
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={getText('0321234567', '0321234567')}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {getText(
                    'Uniquement des chiffres. 9 a 12 chiffres',
                    'Isa ihany. 9 hatramin\'ny 12 isa'
                  )}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getText('Region', 'Faritra')}
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder={getText('Antananarivo', 'Antananarivo')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getText('Biographie', 'Tantara momba anao')}
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                  placeholder={getText('Parlez-nous un peu de vous...', 'Lazao kely momba anao...')}
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 shadow-md hover:shadow-lg"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {getText('Enregistrer', 'Tehirizo')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  {getText('Annuler', 'Aoka')}
                </button>
              </div>
            </form>
          ) : (
            // Affichage des informations
            <div className="space-y-6">
              
              {/* Informations personnelles */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4">
                  {getText('Informations personnelles', 'Fampahalalana manokana')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                    <p className="text-xs text-gray-400">{getText('Prenom', 'Anarana')}</p>
                    <p className="font-medium text-gray-800">{user.first_name || getText('Non renseigne', 'Tsy voalaza')}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                    <p className="text-xs text-gray-400">{getText('Nom', 'Fanampiny')}</p>
                    <p className="font-medium text-gray-800">{user.last_name || getText('Non renseigne', 'Tsy voalaza')}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                    <p className="text-xs text-gray-400">{getText('Adresse email', 'Adiresy email')}</p>
                    <p className="font-medium text-gray-800">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">{getText("L'adresse email ne peut pas etre modifiee", "Tsy azo ovaina ny adiresy email")}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                    <p className="text-xs text-gray-400">{getText('Telephone', 'Telefaonina')}</p>
                    <p className="font-medium text-gray-800">{user.phone || getText('Non renseigne', 'Tsy voalaza')}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                    <p className="text-xs text-gray-400">{getText('Region', 'Faritra')}</p>
                    <p className="font-medium text-gray-800">{formData.region}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                    <p className="text-xs text-gray-400">{getText('Biographie', 'Tantara momba anao')}</p>
                    <p className="font-medium text-gray-800">{formData.bio || getText('Aucune biographie renseignee', 'Tsy misy tantara voalaza')}</p>
                  </div>
                </div>
              </div>

              {/* Informations professionnelles */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4">
                  {getText('Informations professionnelles', 'Fampahalalana momba ny asa')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                    <p className="text-xs text-gray-400">{getText('Poste / Fonction', 'Toerana / Asa')}</p>
                    <p className="font-medium text-gray-800">{formData.position || getText('Non renseigne', 'Tsy voalaza')}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                    <p className="text-xs text-gray-400">{getText('Departement', 'Departemanta')}</p>
                    <p className="font-medium text-gray-800">{formData.department || getText('Non renseigne', 'Tsy voalaza')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Changement de mot de passe - Toujours visible */}
          <div className="border-t border-gray-200 mt-6 pt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">
              {getText('Changer le mot de passe', 'Hanova ny tenimiafina')}
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getText('Mot de passe actuel', 'Tenimiafina amin\'izao')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getText('Nouveau mot de passe', 'Tenimiafina vaovao')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10 ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {getText(
                    `Minimum ${SECURITY_CONFIG.minPasswordLength} caracteres`,
                    `${SECURITY_CONFIG.minPasswordLength} litera farafahakeliny`
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getText('Confirmer', 'Hamafiso')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={passwordLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {getText('Changer le mot de passe', 'Hanova ny tenimiafina')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}