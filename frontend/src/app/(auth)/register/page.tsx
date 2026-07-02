// frontend/src/app/(auth)/register/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, Mail, Lock, Phone, Eye, EyeOff, AlertCircle, 
  ArrowLeft, CheckCircle, Loader2, Shield, 
  Fingerprint, Database, Server, Key, 
  UserPlus
} from 'lucide-react';
import { pageService, PageBackground } from '@/services/page.service';

// ============================================================
// TYPES
// ============================================================

interface FormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  general?: string;
}

// ============================================================
// CONFIGURATION DE SECURITE
// ============================================================

const SECURITY_CONFIG = {
  minPasswordLength: 8,
  maxPasswordLength: 50,
  minNameLength: 2,
  maxNameLength: 50,
  maxPhoneLength: 15,
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  
  // ============================================================
  // ETATS DU FORMULAIRE - CHAMPS VIDES PAR DEFAUT
  // ============================================================
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  
  // ============================================================
  // ETATS UI
  // ============================================================
  
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // ============================================================
  // REFERENCE
  // ============================================================
  
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

  // ============================================================
  // TRADUCTION BILINGUE
  // ============================================================

  const getText = (fr: string, mg: string): string => {
    const language = typeof window !== 'undefined' 
      ? localStorage.getItem('y-mad-language') || 'fr' 
      : 'fr';
    return language === 'fr' ? fr : mg;
  };

  // ============================================================
  // CHARGEMENT DU FOND D'ECRAN
  // ============================================================

  useEffect(() => {
    setMounted(true);
    loadPageBackground();
  }, []);

  const loadPageBackground = async (): Promise<void> => {
    try {
      const background = await pageService.getPageBackground('register');
      if (background && background.is_active && background.image_url) {
        setPageBackground(background);
      }
    } catch (error) {
      console.error('Erreur chargement du fond d\'ecran:', error);
    }
  };

  // ============================================================
  // GESTION DU TELEPHONE - UNIQUEMENT DES CHIFFRES
  // ============================================================

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    //  Supprimer tous les caracteres non numeriques
    const rawValue = e.target.value;
    const numericOnly = rawValue.replace(/\D/g, '');
    
    //  Limiter la longueur
    const limitedValue = numericOnly.slice(0, SECURITY_CONFIG.maxPhoneLength);
    
    //  Formater automatiquement avec des espaces
    let formattedValue = limitedValue;
    if (limitedValue.length > 4) {
      formattedValue = limitedValue.slice(0, 3) + ' ' + limitedValue.slice(3);
    }
    if (limitedValue.length > 6) {
      formattedValue = limitedValue.slice(0, 3) + ' ' + limitedValue.slice(3, 5) + ' ' + limitedValue.slice(5);
    }
    if (limitedValue.length > 8) {
      formattedValue = limitedValue.slice(0, 3) + ' ' + limitedValue.slice(3, 5) + ' ' + limitedValue.slice(5, 8) + ' ' + limitedValue.slice(8);
    }
    if (limitedValue.length > 10) {
      formattedValue = limitedValue.slice(0, 3) + ' ' + limitedValue.slice(3, 5) + ' ' + limitedValue.slice(5, 8) + ' ' + limitedValue.slice(8, 11) + ' ' + limitedValue.slice(11);
    }
    
    setFormData({ ...formData, phone: formattedValue });
    
    //  Validation du telephone
    if (limitedValue.length > 0 && limitedValue.length < 9) {
      setFieldErrors(prev => ({ 
        ...prev, 
        phone: getText(
          'Le telephone doit contenir 10 a 12 chiffres',
          'Ny telefaonina dia tsy maintsy misy 10 hatramin\'ny 12 isa'
        )
      }));
    } else if (limitedValue.length >= 9 && limitedValue.length <= 12) {
      setFieldErrors(prev => ({ ...prev, phone: undefined }));
    } else if (limitedValue.length > 12) {
      setFieldErrors(prev => ({ 
        ...prev, 
        phone: getText(
          'Le telephone ne doit pas depasser 12 chiffres',
          'Ny telefaonina dia tsy mihoatra ny 12 isa'
        )
      }));
    }
  };

  // ============================================================
  // VALIDATION DU FORMULAIRE
  // ============================================================

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Validation prenom
    if (!formData.first_name.trim()) {
      errors.first_name = getText('Le prenom est requis', 'Ilaina ny anarana');
    } else if (formData.first_name.length < SECURITY_CONFIG.minNameLength) {
      errors.first_name = getText(
        `Le prenom doit contenir au moins ${SECURITY_CONFIG.minNameLength} caracteres`,
        `${SECURITY_CONFIG.minNameLength} litera farafahakeliny ny anarana`
      );
    } else if (formData.first_name.length > SECURITY_CONFIG.maxNameLength) {
      errors.first_name = getText(
        `Le prenom ne doit pas depasser ${SECURITY_CONFIG.maxNameLength} caracteres`,
        `Tsy mihoatra ${SECURITY_CONFIG.maxNameLength} litera ny anarana`
      );
    }

    // Validation nom
    if (!formData.last_name.trim()) {
      errors.last_name = getText('Le nom est requis', 'Ilaina ny fanampiny');
    } else if (formData.last_name.length < SECURITY_CONFIG.minNameLength) {
      errors.last_name = getText(
        `Le nom doit contenir au moins ${SECURITY_CONFIG.minNameLength} caracteres`,
        `${SECURITY_CONFIG.minNameLength} litera farafahakeliny ny fanampiny`
      );
    } else if (formData.last_name.length > SECURITY_CONFIG.maxNameLength) {
      errors.last_name = getText(
        `Le nom ne doit pas depasser ${SECURITY_CONFIG.maxNameLength} caracteres`,
        `Tsy mihoatra ${SECURITY_CONFIG.maxNameLength} litera ny fanampiny`
      );
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = getText('L\'email est requis', 'Ilaina ny email');
    } else if (!emailRegex.test(formData.email)) {
      errors.email = getText('Format d\'email invalide', 'Endrika email tsy mety');
    }

    // Validation mot de passe
    if (!formData.password) {
      errors.password = getText('Le mot de passe est requis', 'Ilaina ny tenimiafina');
    } else if (formData.password.length < SECURITY_CONFIG.minPasswordLength) {
      errors.password = getText(
        `Le mot de passe doit contenir au moins ${SECURITY_CONFIG.minPasswordLength} caracteres`,
        `${SECURITY_CONFIG.minPasswordLength} litera farafahakeliny ny tenimiafina`
      );
    } else if (formData.password.length > SECURITY_CONFIG.maxPasswordLength) {
      errors.password = getText(
        `Le mot de passe ne doit pas depasser ${SECURITY_CONFIG.maxPasswordLength} caracteres`,
        `Tsy mihoatra ${SECURITY_CONFIG.maxPasswordLength} litera ny tenimiafina`
      );
    }

    // Validation confirmation mot de passe
    if (!formData.confirmPassword) {
      errors.confirmPassword = getText('Veuillez confirmer le mot de passe', 'Hamafiso ny tenimiafina');
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = getText('Les mots de passe ne correspondent pas', 'Tsy mitovy ny tenimiafina');
    }

    // Validation telephone - UNIQUEMENT DES CHIFFRES
    const cleanPhone = formData.phone.replace(/\s/g, '');
    if (formData.phone && cleanPhone.length > 0) {
      if (cleanPhone.length < 9) {
        errors.phone = getText(
          'Le telephone doit contenir 9 a 12 chiffres',
          'Ny telefaonina dia tsy maintsy misy 9 hatramin\'ny 12 isa'
        );
      } else if (cleanPhone.length > 12) {
        errors.phone = getText(
          'Le telephone ne doit pas depasser 12 chiffres',
          'Ny telefaonina dia tsy mihoatra ny 12 isa'
        );
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================================
  // ANALYSE DE LA FORCE DU MOT DE PASSE
  // ============================================================

  const analyzePasswordStrength = (pwd: string): 'weak' | 'medium' | 'strong' => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) score++;
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  };

  // ============================================================
  // SOUMISSION DU FORMULAIRE
  // ============================================================

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const cleanPhone = formData.phone ? formData.phone.replace(/\s/g, '') : null;
      
      const registerData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: cleanPhone,
      };

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || getText(
          "Erreur lors de l'inscription",
          'Nisy hadisoana tamin\'ny fisoratana anarana'
        ));
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 2500);
      
    } catch (err: any) {
      const message = err.message || getText(
        "Erreur lors de l'inscription",
        'Nisy hadisoana tamin\'ny fisoratana anarana'
      );
      
      if (message.toLowerCase().includes('duplicate') || 
          message.toLowerCase().includes('already exists') || 
          message.toLowerCase().includes('deja utilise') ||
          message.toLowerCase().includes('exists')) {
        setError(getText(
          'Cet email est deja utilise. Veuillez vous connecter.',
          'Efa misy ity email ity. Mandehana midira.'
        ));
      } else if (message.toLowerCase().includes('email')) {
        setError(getText(
          'Adresse email invalide.',
          'Tsy manan-kery ny adiresy email.'
        ));
      } else if (message.toLowerCase().includes('password')) {
        setError(getText(
          'Le mot de passe doit respecter les criteres de securite.',
          'Ny tenimiafina dia tsy maintsy manaraka ny fepetra fiarovana.'
        ));
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // STYLES DU FOND D'ECRAN
  // ============================================================

  const heroBackgroundStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundImage: `url(${pageBackground.image_url})`,
    backgroundPosition: pageBackground.position || 'center',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
  } : {};

  const overlayStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundColor: `rgba(0, 0, 0, ${(pageBackground.overlay_opacity || 35) / 100})`,
  } : {};

  // ============================================================
  // RENDU - CHARGEMENT
  // ============================================================

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <Shield className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-blue-200 text-sm animate-pulse">
            {getText('Chargement securise...', 'Fandefasana azo antoka...')}
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDU - SUCCES
  // ============================================================

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900 py-12 px-4">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {getText('Inscription reussie', 'Vita ny fisoratana anarana')}
          </h2>
          <p className="text-gray-600 mb-2">
            {getText('Votre compte a ete cree avec succes.', 'Voaforona soa aman-tsara ny kaontinao.')}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            {getText('Vous allez etre redirige vers la page de connexion.', 'Ho entina any amin\'ny pejy fidirana ianao.')}
          </p>
          <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDU - PAGE PRINCIPALE
  // ============================================================

  return (
    <div className="min-h-screen">
      
      {/* Fond d'ecran */}
      <div className="fixed inset-0 z-0">
        {pageBackground?.image_url && pageBackground.is_active ? (
          <>
            <div className="absolute inset-0 bg-cover bg-center bg-fixed bg-no-repeat" style={heroBackgroundStyle} />
            <div className="absolute inset-0" style={overlayStyle} />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-900 to-gray-900" />
        )}
      </div>

      {/* Contenu */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          
          {/* Lien retour */}
          <div className="mb-6">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{getText('Retour a l\'accueil', 'Hiverina any an-tokotany')}</span>
            </Link>
          </div>

          {/* En-tete */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full px-4 py-1.5 mb-4 border border-blue-100">
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {getText('Young for Madagascar Development', 'Tanora miasa ho any fivoarana')}
              </span>
            </div>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
              {getText('Creer un compte', 'Hamorona kaonty')}
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              {getText(
                'Inscrivez-vous pour postuler aux offres d\'emploi',
                'Misoratra anarana hanangana asa'
              )}
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Prenom et Nom - CHAMPS VIDES PAR DEFAUT */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getText('Prenom', 'Anarana')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  onBlur={() => setTouched({ ...touched, first_name: true })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white ${
                    fieldErrors.first_name && touched.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={getText('Votre prenom', 'Ny anaranao')}
                  autoComplete="given-name"
                />
                {fieldErrors.first_name && touched.first_name && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.first_name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getText('Nom', 'Fanampiny')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  onBlur={() => setTouched({ ...touched, last_name: true })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white ${
                    fieldErrors.last_name && touched.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={getText('Votre nom', 'Ny fanampinao')}
                  autoComplete="family-name"
                />
                {fieldErrors.last_name && touched.last_name && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.last_name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white ${
                    fieldErrors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={getText('exemple@domaine.com', 'ohatra@domaine.com')}
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && touched.email && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Telephone - UNIQUEMENT DES CHIFFRES */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('Telephone', 'Telefaonina')}
                <span className="text-gray-400 text-xs ml-1">({getText('optionnel', 'tsy voatery')})</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={phoneInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  onBlur={() => setTouched({ ...touched, phone: true })}
                  onKeyDown={(e) => {
                    //  Bloquer les lettres et caracteres speciaux
                    if (!/^[0-9\b\s]$/.test(e.key) && 
                        e.key !== 'Backspace' && 
                        e.key !== 'Delete' && 
                        e.key !== 'Tab' && 
                        e.key !== 'ArrowLeft' && 
                        e.key !== 'ArrowRight' && 
                        e.key !== 'ArrowUp' && 
                        e.key !== 'ArrowDown' && 
                        e.key !== 'Home' && 
                        e.key !== 'End') {
                      e.preventDefault();
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white ${
                    fieldErrors.phone && touched.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={getText('032 12 345 67', '032 12 345 67')}
                  autoComplete="tel"
                />
              </div>
              {fieldErrors.phone && touched.phone && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {getText(
                  'Uniquement des chiffres. Exemple: 032 12 345 67',
                  'Isa ihany. Ohatra: 032 12 345 67'
                )}
              </p>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('Mot de passe', 'Tenimiafina')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (e.target.value.length > 0) {
                      setPasswordStrength(analyzePasswordStrength(e.target.value));
                    } else {
                      setPasswordStrength(null);
                    }
                  }}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white ${
                    fieldErrors.password && touched.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={getText('Entrez votre mot de passe', 'Ampidiro ny tenimiafinao')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Indicateur de force du mot de passe */}
              {passwordStrength && formData.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-gray-200 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength === 'weak' ? 'w-1/3 bg-red-500' :
                          passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' :
                          'w-full bg-green-500'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength === 'weak' ? 'text-red-500' :
                      passwordStrength === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {getText(
                        passwordStrength === 'weak' ? 'Faible' :
                        passwordStrength === 'medium' ? 'Moyen' : 'Fort',
                        passwordStrength === 'weak' ? 'Malemy' :
                        passwordStrength === 'medium' ? 'Antonony' : 'Mahery'
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {getText(
                      'Minimum 8 caracteres avec majuscule, minuscule, chiffre et caractere special',
                      '8 tarehintsoratra farafahakeliny misy lehibe, kely, isa ary marika manokana'
                    )}
                  </p>
                </div>
              )}
              
              {fieldErrors.password && touched.password && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('Confirmer le mot de passe', 'Hamafiso ny tenimiafina')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white ${
                    fieldErrors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={getText('Confirmez votre mot de passe', 'Hamafiso ny tenimiafinao')}
                  autoComplete="new-password"
                />
              </div>
              {fieldErrors.confirmPassword && touched.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Bouton d'inscription */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {getText('Inscription en cours...', 'Misoratra anarana...')}
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  {getText("S'inscrire", 'Misoratra anarana')}
                </>
              )}
            </button>

            {/* Indicateurs de securite */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {getText('SSL Securise', 'SSL Azo antoka')}
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="flex items-center gap-1">
                  <Fingerprint className="w-3 h-3" />
                  {getText('AES-256', 'AES-256')}
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  {getText('2FA', '2FA')}
                </span>
              </div>
            </div>
          </form>

          {/* Liens supplementaires */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              {getText('Deja un compte ?', 'Efa manana kaonty ?')}{' '}
              <Link 
                href="/login" 
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors inline-flex items-center gap-1"
              >
                {getText('Se connecter', 'Hiditra')}
              </Link>
            </p>
            <p className="text-center text-xs text-gray-400 mt-3">
              {getText(
                'En vous inscrivant, vous acceptez nos conditions d\'utilisation',
                'Amin\'ny fisoratana anarana, ianao dia manaiky ny fepetranay'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Styles animes */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}