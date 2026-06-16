// frontend/src/app/(auth)/register/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Lock, Phone, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle, MapPin, Sparkles, Loader2 } from 'lucide-react';
import { pageService, PageBackground } from '@/services/page.service';

// ============================================================
// PAGE D'INSCRIPTION - Y-MaD
// ============================================================

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  
  // État du formulaire
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // État du fond d'écran
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  const [mounted, setMounted] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

  // ============================================================
  // FONCTION DE TRADUCTION
  // ============================================================

  const getText = (fr: string, mg: string) => {
    const language = localStorage.getItem('y-mad-language') || 'fr';
    return language === 'fr' ? fr : mg;
  };

  // ============================================================
  // CHARGEMENT DU FOND D'ECRAN
  // ============================================================

  useEffect(() => {
    setMounted(true);
    loadPageBackground();
  }, []);

  const loadPageBackground = async () => {
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
  // VALIDATION DU FORMULAIRE
  // ============================================================

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = getText('Les mots de passe ne correspondent pas', 'Tsy mitovy ny tenimiafina');
    }

    if (formData.password.length < 6) {
      errors.password = getText('Le mot de passe doit contenir au moins 6 caracteres', '6 litera farafahakeliny ny tenimiafina');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = getText('Veuillez entrer une adresse email valide', 'Ampidiro adiresy email marina');
    }

    if (formData.first_name.length < 2) {
      errors.first_name = getText('Le prenom doit contenir au moins 2 caracteres', '2 litera farafahakeliny ny anarana');
    }

    if (formData.last_name.length < 2) {
      errors.last_name = getText('Le nom doit contenir au moins 2 caracteres', '2 litera farafahakeliny ny fanampiny');
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================================
  // SOUMISSION DU FORMULAIRE
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || null,
      };

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || getText("Erreur lors de l'inscription", 'Nisy hadisoana tamin\'ny fisoratana anarana'));
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (err: any) {
      const message = err.message || getText("Erreur lors de l'inscription", 'Nisy hadisoana tamin\'ny fisoratana anarana');
      
      if (message.includes('duplicate') || message.includes('already exists') || message.includes('déjà utilisé')) {
        setError(getText('Cet email est deja utilise. Veuillez vous connecter.', 'Efa misy ity email ity. Mandehana midira.'));
      } else if (message.includes('email')) {
        setError(getText('Adresse email invalide.', 'Tsy manan-kery ny adiresy email.'));
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // STYLES DU FOND D'ECRAN - PLEIN ECRAN
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{getText('Chargement...', 'Miandry...')}</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDU - SUCCES
  // ============================================================

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
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
      
      {/* ============================================================
      FOND D'ECRAN PLEIN ECRAN
      ============================================================ */}
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

      {/* ============================================================
      CONTENU CENTRE
      ============================================================ */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          
          {/* ============================================================
          LIEN RETOUR
          ============================================================ */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition">
              <ArrowLeft className="w-4 h-4" />
              <span>{getText('Retour a l\'accueil', 'Hiverina any an-tokotany')}</span>
            </Link>
          </div>

          {/* ============================================================
          EN-TETE
          ============================================================ */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Y-MaD Madagascar</span>
            </div>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              {getText('Inscription', 'Fisoratana anarana')}
            </h2>
            <p className="text-gray-500 mt-2">
              {getText('Creez votre compte Y-MaD', 'Mamorona kaonty Y-MaD')}
            </p>
          </div>

          {/* ============================================================
          MESSAGE D'ERREUR
          ============================================================ */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* ============================================================
          FORMULAIRE D'INSCRIPTION
          ============================================================ */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Prenom et Nom */}
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
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white ${
                    fieldErrors.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={getText('ex: Jean', 'ex: Jean')}
                />
                {fieldErrors.first_name && (
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
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white ${
                    fieldErrors.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={getText('ex: RAKOTO', 'ex: RAKOTO')}
                />
                {fieldErrors.last_name && (
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
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white ${
                    fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="exemple@domaine.com"
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('Telephone', 'Telefaonina')}
                <span className="text-gray-400 text-xs ml-1">({getText('optionnel', 'tsy voatery')})</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                  placeholder="032 12 345 67"
                />
              </div>
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
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white ${
                    fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
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
              {fieldErrors.password && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
              )}
              {!fieldErrors.password && (
                <p className="text-xs text-gray-500 mt-1">
                  {getText('Minimum 6 caracteres', '6 litera farafahakeliny')}
                </p>
              )}
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('Confirmer le mot de passe', 'Hamafiso ny tenimiafina')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white ${
                    fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Bouton d'inscription */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {getText('Inscription en cours...', 'Misoratra anarana...')}
                </>
              ) : (
                getText("S'inscrire", 'Misoratra anarana')
              )}
            </button>
          </form>

          {/* ============================================================
          LIEN CONNEXION
          ============================================================ */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {getText('Deja un compte ?', 'Efa manana kaonty ?')}{' '}
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                {getText('Se connecter', 'Hiditra')}
              </Link>
            </p>
          </div>
          
          {/* ============================================================
          MENTION
          ============================================================ */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              {getText('En vous inscrivant, vous acceptez nos conditions d\'utilisation', 'Amin\'ny fisoratana anarana, ianao dia manaiky ny fepetranay')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}