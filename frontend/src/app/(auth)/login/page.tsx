// frontend/src/app/(auth)/login/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { pageService, PageBackground } from '@/services/page.service';

// ============================================================
// PAGE DE CONNEXION - ADMIN Y-MaD
// ============================================================

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  // État du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // État du fond d'écran
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  const [mounted, setMounted] = useState(false);

  // ============================================================
  // FONCTION DE TRADUCTION
  // ============================================================

  const getText = (fr: string, mg: string) => {
    const language = localStorage.getItem('y-mad-language') || 'fr';
    return language === 'fr' ? fr : mg;
  };

  // ============================================================
  // CHARGEMENT DES DONNEES
  // ============================================================

  useEffect(() => {
    setMounted(true);
    loadPageBackground();

    // Récupérer l'email sauvegardé
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const loadPageBackground = async () => {
    try {
      const background = await pageService.getPageBackground('login');
      if (background && background.is_active && background.image_url) {
        setPageBackground(background);
      }
    } catch (error) {
      console.error('Erreur chargement du fond d\'ecran:', error);
    }
  };

  // ============================================================
  // SOUMISSION DU FORMULAIRE
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!email || !password) {
      setError(getText('Veuillez remplir tous les champs', 'Fenoy ny sehatra rehetra'));
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      const message = err.message || getText('Email ou mot de passe incorrect', 'Diso ny email na tenimiafina');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // GESTION DE LA MÉMORISATION
  // ============================================================

  const handleRememberMe = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
    if (e.target.checked) {
      localStorage.setItem('savedEmail', email);
    } else {
      localStorage.removeItem('savedEmail');
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
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              {getText('Connexion', 'Hiditra')}
            </h2>
            <p className="text-gray-500 mt-2">
              {getText('Connectez-vous a votre compte administrateur', 'Midira ao amin\'ny kaontinao administrateur')}
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
          FORMULAIRE DE CONNEXION
          ============================================================ */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('Adresse email', 'Adiresy email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                  placeholder="admin@ymad.mg"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('Mot de passe', 'Tenimiafina')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={handleRememberMe}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                />
                <span className="text-sm text-gray-600">
                  {getText('Se souvenir de moi', 'Tsarovy aho')}
                </span>
              </label>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                {getText('Mot de passe oublié', 'Hadino ny tenimiafina')}
              </Link>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {getText('Connexion en cours...', 'Miditra...')}
                </>
              ) : (
                getText('Se connecter', 'Hiditra')
              )}
            </button>
          </form>

          {/* ============================================================
          LIEN INSCRIPTION
          ============================================================ */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {getText('Pas encore de compte ?', 'Mbola tsy manana kaonty ?')}{' '}
              <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                {getText('S\'inscrire', 'Misoratra anarana')}
              </Link>
            </p>
          </div>
          
          {/* ============================================================
          MENTION
          ============================================================ */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              {getText('Acces reserve a l\'administration de Y-MaD', 'Fidirana ho an\'ny mpitantana Y-MaD ihany')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}