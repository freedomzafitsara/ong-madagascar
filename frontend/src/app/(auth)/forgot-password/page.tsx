// frontend/src/app/(auth)/forgot-password/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { pageService, PageBackground } from '@/services/page.service';

// ============================================================
// PAGE MOT DE PASSE OUBLIE - Y-MaD
// ============================================================

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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
    setSuccess(false);

    // Validation email
    if (!email) {
      setError(getText('Veuillez entrer votre adresse email', 'Ampidiro ny adiresy email anao'));
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(getText('Veuillez entrer une adresse email valide', 'Ampidiro adiresy email marina'));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || getText('Une erreur est survenue', 'Nisy hadisoana nitranga'));
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || getText('Une erreur est survenue', 'Nisy hadisoana nitranga'));
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
  // RENDU - SUCCÈS
  // ============================================================

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {getText('Email envoye', 'Voaefa ny mailaka')}
          </h2>
          <p className="text-gray-600 mb-2">
            {getText('Un lien de reinitialisation a ete envoye a', 'Rohy famerenana dia nalefa tany amin\'ny')}{' '}
            <strong>{email}</strong>
          </p>
          <p className="text-gray-500 text-sm mb-6">
            {getText('Veuillez verifier vos emails, y compris dans les spams', 
                     'Jereo ny mailakao, ao anatin\'ny spam koa raha tsy hita')}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {getText('Retour a la connexion', 'Hiverina any amin\'ny fidirana')}
          </Link>
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
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{getText('Retour a la connexion', 'Hiverina any amin\'ny fidirana')}</span>
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
            <h2 className="text-2xl font-bold text-gray-800">
              {getText('Mot de passe oublie', 'Hadino ny tenimiafina')}
            </h2>
            <p className="text-gray-500 mt-2 text-sm max-w-sm mx-auto">
              {getText('Saisissez votre adresse email pour recevoir un lien de reinitialisation',
                       'Ampidiro ny adiresy email anao mba hahazoana rohy famerenana')}
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
          FORMULAIRE
          ============================================================ */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="votre@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {getText('Envoi en cours...', 'Fandefasana...')}
                </>
              ) : (
                getText('Envoyer le lien de reinitialisation', 'Alefaso ny rohy famerenana')
              )}
            </button>
          </form>

          {/* ============================================================
          LIEN INSCRIPTION
          ============================================================ */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {getText('Pas encore de compte ?', 'Mbola tsy manana kaonty ?')}{' '}
              <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                {getText('S\'inscrire', 'Misoratra anarana')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}