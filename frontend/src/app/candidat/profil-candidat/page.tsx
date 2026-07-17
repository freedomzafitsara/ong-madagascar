// frontend/src/app/candidate/profil-candidat/page.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, Mail, Phone, Camera, Save, Loader2, 
  CheckCircle, Eye, EyeOff, Lock, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FormErrors {
  first_name?: string;
  last_name?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

const SECURITY_CONFIG = {
  minPasswordLength: 8,
  maxPhoneLength: 12,
};

const PHONE_REGEX = /^\d+$/;

export default function CandidateProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, updateProfile, changePassword, uploadAvatar } = useAuth();
  
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

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  const getText = (fr: string, mg: string): string => {
    const language = typeof window !== 'undefined' 
      ? localStorage.getItem('y-mad-language') || 'fr' 
      : 'fr';
    return language === 'fr' ? fr : mg;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
      });
      setPhoneValue(user.phone || '');
    }
  }, [user, isAuthenticated, router]);

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setAvatarLoading(true);
    setUploadProgress(0);

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
      await uploadAvatar(file);
      setUploadProgress(100);
      toast.success(getText(
        'Photo de profil mise à jour',
        'Vita soa aman-tsara ny fanovana sary'
      ));
      
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const rawValue = e.target.value;
    const numericOnly = rawValue.replace(/\D/g, '');
    const limitedValue = numericOnly.slice(0, SECURITY_CONFIG.maxPhoneLength);
    
    setPhoneValue(limitedValue);
    setFormData({ ...formData, phone: limitedValue });
    
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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Profile header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Banner with avatar */}
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
              
              {/* Upload avatar button */}
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
              
              {/* Upload progress bar */}
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
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="p-6">
          
          {/* Success message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-green-700">{successMessage}</span>
            </div>
          )}

          {/* Error message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{errors.general}</span>
            </div>
          )}

          {/* Account name modification */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              {getText('Modifier le nom du compte', 'Hanova ny anaran\'ny kaonty')}
            </h3>
            
            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-400">{getText('Prenom', 'Anarana')}</p>
                  <p className="font-medium text-gray-800">{user.first_name || getText('Non renseigne', 'Tsy voalaza')}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-400">{getText('Nom', 'Fanampiny')}</p>
                  <p className="font-medium text-gray-800">{user.last_name || getText('Non renseigne', 'Tsy voalaza')}</p>
                </div>
              </div>
            ) : (
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
                
                <div className="flex gap-3">
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
            )}

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition hover:bg-blue-50 rounded-lg"
              >
                <Save className="w-4 h-4" />
                {getText('Modifier le nom du compte', 'Hanova ny anaran\'ny kaonty')}
              </button>
            )}
          </div>

          {/* Password reset */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {getText('Réinitialiser le mot de passe', 'Averina ny tenimiafina')}
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
                {getText('Réinitialiser le mot de passe', 'Averina ny tenimiafina')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}