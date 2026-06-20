// frontend/src/app/(auth)/login/page.tsx

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, Lock, Eye, EyeOff, AlertCircle, 
  ArrowLeft, Loader2, Sparkles, Shield,
  CheckCircle, Clock, Key, UserCog,
  Fingerprint, Database, Server, LockKeyhole
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { pageService, PageBackground } from '@/services/page.service';

// ============================================================
// TYPES
// ============================================================

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
  userAgent?: string;
}

// ============================================================
// CONFIGURATION DE SÉCURITÉ
// ============================================================

const SECURITY_CONFIG = {
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  sessionDuration: 24 * 60 * 60 * 1000, // 24 heures
  minPasswordLength: 8,
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading: authLoading } = useAuth();
  
  // ============================================================
  // ÉTATS DU FORMULAIRE
  // ============================================================
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // ============================================================
  // ÉTATS DE SÉCURITÉ
  // ============================================================
  
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(SECURITY_CONFIG.maxAttempts);
  const [showSecurityBadge, setShowSecurityBadge] = useState<boolean>(false);
  
  // ============================================================
  // ÉTATS UI
  // ============================================================
  
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<'email' | 'password' | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const lockoutIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================
  // TRADUCTION
  // ============================================================

  const getText = useCallback((fr: string, mg: string): string => {
    const language = typeof window !== 'undefined' 
      ? localStorage.getItem('y-mad-language') || 'fr' 
      : 'fr';
    return language === 'fr' ? fr : mg;
  }, []);

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================

  useEffect((): (() => void) => {
    setMounted(true);
    loadPageBackground();
    
    // ✅ Appel correct de la fonction
    const cleanupLockout = checkLockoutStatus();
    loadSecurityConfig();
    
    // Vérifier si l'utilisateur vient de s'inscrire
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      setSuccessMessage(
        getText(
          'Inscription réussie ! Vous pouvez maintenant vous connecter.',
          'Fahombiazana ny fisoratana anarana ! Afaka miditra izao ianao.'
        )
      );
    }

    // Focus sur le champ email
    const focusTimeout = setTimeout((): void => {
      emailInputRef.current?.focus();
    }, 500);

    // Nettoyer les messages après 5 secondes
    const messageTimeout = setTimeout((): void => {
      setSuccessMessage('');
    }, 5000);

    // Afficher le badge de sécurité après 3 secondes
    const securityTimeout = setTimeout((): void => {
      setShowSecurityBadge(true);
    }, 3000);

    // ✅ Retourner une fonction de nettoyage
    return (): void => {
      clearTimeout(focusTimeout);
      clearTimeout(messageTimeout);
      clearTimeout(securityTimeout);
      if (cleanupLockout) {
        cleanupLockout();
      }
      if (lockoutIntervalRef.current) {
        clearInterval(lockoutIntervalRef.current);
        lockoutIntervalRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, getText]);

  const loadPageBackground = async (): Promise<void> => {
    try {
      const background = await pageService.getPageBackground('login');
      if (background?.is_active && background?.image_url) {
        setPageBackground(background);
      }
    } catch (error) {
      console.error('Erreur chargement du fond d\'écran:', error);
    }
  };

  const loadSecurityConfig = (): void => {
    const config = localStorage.getItem('securityConfig');
    if (config) {
      try {
        JSON.parse(config);
      } catch (error) {
        console.error('Erreur chargement config sécurité:', error);
      }
    }
  };

  // ✅ CORRIGÉ : Retourne une fonction de nettoyage ou undefined
  const checkLockoutStatus = (): (() => void) | undefined => {
    const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
    setLoginAttempts(attempts);

    const lastFailedAttempt = attempts
      .filter((a: LoginAttempt) => !a.success)
      .pop();

    if (lastFailedAttempt) {
      const timeSinceLastAttempt = Date.now() - lastFailedAttempt.timestamp;
      if (timeSinceLastAttempt < SECURITY_CONFIG.lockoutDuration) {
        setIsLocked(true);
        const remainingTime = Math.ceil(
          (SECURITY_CONFIG.lockoutDuration - timeSinceLastAttempt) / 60000
        );
        setLockoutTimer(remainingTime);
        
        // Nettoyer l'ancien intervalle
        if (lockoutIntervalRef.current) {
          clearInterval(lockoutIntervalRef.current);
          lockoutIntervalRef.current = null;
        }
        
        lockoutIntervalRef.current = setInterval(() => {
          setLockoutTimer(prev => {
            if (prev === null || prev <= 1) {
              if (lockoutIntervalRef.current) {
                clearInterval(lockoutIntervalRef.current);
                lockoutIntervalRef.current = null;
              }
              setIsLocked(false);
              setRemainingAttempts(SECURITY_CONFIG.maxAttempts);
              return null;
            }
            return prev - 1;
          });
        }, 60000);
        
        // ✅ Retourner une fonction de nettoyage
        return (): void => {
          if (lockoutIntervalRef.current) {
            clearInterval(lockoutIntervalRef.current);
            lockoutIntervalRef.current = null;
          }
        };
      }
    }

    const recentAttempts = attempts
      .filter((a: LoginAttempt) => 
        a.timestamp > Date.now() - SECURITY_CONFIG.lockoutDuration && !a.success
      ).length;
    setRemainingAttempts(SECURITY_CONFIG.maxAttempts - recentAttempts);
    
    return undefined;
  };

  // ============================================================
  // VALIDATION DU FORMULAIRE
  // ============================================================

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = getText('L\'email est requis', 'Ilaina ny email');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = getText('Format d\'email invalide', 'Endrika email tsy mety');
    }

    if (!password.trim()) {
      newErrors.password = getText('Le mot de passe est requis', 'Ilaina ny tenimiafina');
    } else if (password.length < SECURITY_CONFIG.minPasswordLength) {
      newErrors.password = getText(
        `Le mot de passe doit contenir au moins ${SECURITY_CONFIG.minPasswordLength} caractères`,
        `Ny tenimiafina dia tsy maintsy misy ${SECURITY_CONFIG.minPasswordLength} tarehintsoratra`
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, getText]);

  // ============================================================
  // GESTION DE LA MÉMORISATION
  // ============================================================

  const handleRememberMe = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setRememberMe(e.target.checked);
    if (e.target.checked) {
      localStorage.setItem('savedEmail', email);
    } else {
      localStorage.removeItem('savedEmail');
    }
  }, [email]);

  // ============================================================
  // SOUMISSION DU FORMULAIRE
  // ============================================================

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    setErrors({});
    setSuccessMessage('');

    if (isLocked) {
      setErrors({ 
        general: getText(
          `Compte temporairement verrouillé. Réessayez dans ${lockoutTimer} minutes.`,
          `Voavonjy vonjimaika ny kaonty. Andramo indray rehefa afaka ${lockoutTimer} minitra.`
        ) 
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      recordLoginAttempt(true);
      router.push('/dashboard');
      
    } catch (error: any) {
      recordLoginAttempt(false);
      
      const errorMessage = error.message || getText(
        'Email ou mot de passe incorrect',
        'Diso ny email na tenimiafina'
      );
      
      setErrors({ general: errorMessage });
      
      const recentAttempts = loginAttempts
        .filter(a => a.timestamp > Date.now() - SECURITY_CONFIG.lockoutDuration && !a.success)
        .length + 1;
      
      setRemainingAttempts(SECURITY_CONFIG.maxAttempts - recentAttempts);
      
      if (recentAttempts >= SECURITY_CONFIG.maxAttempts) {
        setIsLocked(true);
        setLockoutTimer(15);
        setErrors({ 
          general: getText(
            'Trop de tentatives échouées. Compte verrouillé pour 15 minutes.',
            'Be loatra ny andrana tsy nahomby. Voavonjy ny kaonty mandritra ny 15 minitra.'
          ) 
        });
        
        if (lockoutIntervalRef.current) {
          clearInterval(lockoutIntervalRef.current);
          lockoutIntervalRef.current = null;
        }
        
        lockoutIntervalRef.current = setInterval(() => {
          setLockoutTimer(prev => {
            if (prev === null || prev <= 1) {
              if (lockoutIntervalRef.current) {
                clearInterval(lockoutIntervalRef.current);
                lockoutIntervalRef.current = null;
              }
              setIsLocked(false);
              setRemainingAttempts(SECURITY_CONFIG.maxAttempts);
              return null;
            }
            return prev - 1;
          });
        }, 60000);
      }
      
      setPassword('');
      passwordInputRef.current?.focus();
      
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // ENREGISTREMENT DES TENTATIVES
  // ============================================================

  const recordLoginAttempt = (success: boolean): void => {
    const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
    const newAttempt: LoginAttempt = {
      email,
      timestamp: Date.now(),
      success,
      userAgent: navigator.userAgent,
    };
    
    const updatedAttempts = [newAttempt, ...attempts].slice(0, 50);
    localStorage.setItem('loginAttempts', JSON.stringify(updatedAttempts));
    setLoginAttempts(updatedAttempts);
  };

  // ============================================================
  // ANALYSE DE LA FORCE DU MOT DE PASSE
  // ============================================================

  const analyzePasswordStrength = useCallback((pwd: string): 'weak' | 'medium' | 'strong' => {
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
  }, []);

  // ============================================================
  // STYLES DU FOND D'ÉCRAN
  // ============================================================

  const heroBackgroundStyle = useMemo(() => {
    if (pageBackground?.image_url && pageBackground.is_active) {
      return {
        backgroundImage: `url(${pageBackground.image_url})`,
        backgroundPosition: pageBackground.position || 'center',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed' as const,
        backgroundRepeat: 'no-repeat' as const,
      };
    }
    return {};
  }, [pageBackground]);

  const overlayStyle = useMemo(() => {
    if (pageBackground?.image_url && pageBackground.is_active) {
      return {
        backgroundColor: `rgba(0, 0, 0, ${(pageBackground.overlay_opacity || 35) / 100})`,
      };
    }
    return {};
  }, [pageBackground]);

  // ============================================================
  // RENDU - CHARGEMENT
  // ============================================================

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <Shield className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-blue-200 text-sm animate-pulse">
            {getText('Chargement sécurisé...', 'Fandefasana azo antoka...')}
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDU - PAGE PRINCIPALE
  // ============================================================

  return (
    <div className="min-h-screen">
      
      {/* Fond d'écran */}
      <div className="fixed inset-0 z-0">
        {pageBackground?.image_url && pageBackground.is_active ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center bg-fixed bg-no-repeat transition-all duration-1000"
              style={heroBackgroundStyle}
            />
            <div 
              className="absolute inset-0 transition-all duration-1000"
              style={overlayStyle}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-900 to-gray-900" />
        )}
      </div>

      {/* Contenu */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          
          {/* Carte de connexion */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 transform transition-all duration-500 hover:scale-[1.01]">
            
            {/* En-tête */}
            <div className="mb-8">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-all duration-200 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">
                  {getText('Retour à l\'accueil', 'Hiverina any an-tokotany')}
                </span>
              </Link>
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full px-4 py-1.5 mb-4 border border-blue-100">
                <UserCog className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {getText('Accès Administrateur', 'Fidirana administrateur')}
                </span>
              </div>

              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl rotate-6 opacity-20" />
                <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <LockKeyhole className="w-10 h-10 text-white" />
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
                {getText('Espace Administration', 'Trano Fitantanana')}
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                {getText(
                  'Connectez-vous avec vos identifiants administrateur',
                  'Midira amin\'ny alalan\'ny kaontinao administrateur'
                )}
              </p>
            </div>

            {/* Messages */}
            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 animate-slideDown">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-emerald-700">{successMessage}</span>
              </div>
            )}

            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-700">{errors.general}</span>
              </div>
            )}

            {isLocked && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-amber-700">
                  {getText(
                    `Compte verrouillé pour ${lockoutTimer} minute${lockoutTimer !== 1 ? 's' : ''}`,
                    `Voavonjy ny kaonty mandritra ${lockoutTimer} minitra`
                  )}
                </span>
              </div>
            )}

            {!isLocked && remainingAttempts < SECURITY_CONFIG.maxAttempts && remainingAttempts > 0 && (
              <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700 text-center">
                  {getText(
                    `Il vous reste ${remainingAttempts} tentative${remainingAttempts > 1 ? 's' : ''}`,
                    `Mbola ${remainingAttempts} andrana${remainingAttempts > 1 ? ' sisa' : ''}`
                  )}
                </p>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {getText('Adresse email', 'Adiresy email')}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className={`relative transition-all duration-200 ${
                  isFocused === 'email' ? 'ring-2 ring-blue-500' : ''
                }`}>
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                    isFocused === 'email' ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <input
                    ref={emailInputRef}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsFocused('email')}
                    onBlur={() => setIsFocused(null)}
                    disabled={isLoading || isLocked}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none transition-all bg-white disabled:bg-gray-50 disabled:cursor-not-allowed ${
                      errors.email 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                    }`}
                    placeholder={getText('exemple@domaine.com', 'ohatra@domaine.com')}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Mot de passe */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    {getText('Mot de passe', 'Tenimiafina')}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    {showPassword ? getText('Masquer', 'Afena') : getText('Afficher', 'Aseho')}
                  </button>
                </div>
                <div className={`relative transition-all duration-200 ${
                  isFocused === 'password' ? 'ring-2 ring-blue-500' : ''
                }`}>
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                    isFocused === 'password' ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (e.target.value.length > 0) {
                        setPasswordStrength(analyzePasswordStrength(e.target.value));
                      } else {
                        setPasswordStrength(null);
                      }
                    }}
                    onFocus={() => setIsFocused('password')}
                    onBlur={() => setIsFocused(null)}
                    disabled={isLoading || isLocked}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg outline-none transition-all bg-white disabled:bg-gray-50 disabled:cursor-not-allowed ${
                      errors.password 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                    }`}
                    placeholder={getText('Entrez votre mot de passe', 'Ampidiro ny tenimiafinao')}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {passwordStrength && password.length > 0 && (
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
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={handleRememberMe}
                    disabled={isLoading || isLocked}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    {getText('Se souvenir de moi', 'Tsarovy aho')}
                  </span>
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium"
                >
                  {getText('Mot de passe oublié ?', 'Hadino ny tenimiafina ?')}
                </Link>
              </div>

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={isLoading || isLocked || authLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{getText('Connexion en cours...', 'Miditra...')}</span>
                  </>
                ) : isLocked ? (
                  <>
                    <Clock className="w-5 h-5" />
                    <span>{getText('Compte verrouillé', 'Voavonjy ny kaonty')}</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>{getText('Se connecter', 'Hiditra')}</span>
                  </>
                )}
              </button>

              {/* Indicateurs de sécurité */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {getText('SSL Sécurisé', 'SSL Azo antoka')}
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
                
                {showSecurityBadge && (
                  <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1 animate-fadeIn">
                    <CheckCircle className="w-3 h-3" />
                    <span>
                      {getText('Connexion sécurisée', 'Fidirana azo antoka')}
                    </span>
                  </div>
                )}
              </div>
            </form>

            {/* Liens supplémentaires */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                {getText('Pas encore de compte administrateur ?', 'Mbola tsy manana kaonty administrateur ?')}{' '}
                <Link 
                  href="/contact" 
                  className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
                >
                  {getText('Contacter le support', 'Mifandraisa amin\'ny fanampiana')}
                </Link>
              </p>
              <p className="text-center text-xs text-gray-400 mt-3">
                {getText(
                  'Accès réservé à l\'administration de Y-MaD Madagascar',
                  'Fidirana ho an\'ny mpitantana Y-MaD Madagascar ihany'
                )}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-white/60 flex items-center justify-center gap-2">
              <Server className="w-3 h-3" />
              <span>
                © {new Date().getFullYear()} Y-MaD Madagascar. {getText('Tous droits réservés.', 'Zo rehetra voatokana.')}
              </span>
              <span className="w-1 h-1 bg-white/30 rounded-full" />
              <span>v2.0.0</span>
            </p>
          </div>
        </div>
      </div>

      {/* Styles animés */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}