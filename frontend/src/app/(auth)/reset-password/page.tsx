'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);
  const [checkingToken, setCheckingToken] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

  const getText = (fr: string, mg: string) => {
    const language = localStorage.getItem('y-mad-language') || 'fr';
    return language === 'fr' ? fr : mg;
  };

  useEffect(() => {
    if (!token) {
      setValidToken(false);
      setCheckingToken(false);
      setError(getText('Aucun token fourni', 'Tsy misy token omena'));
    } else {
      setValidToken(true);
      setCheckingToken(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError(getText('Les mots de passe ne correspondent pas', 'Tsy mitovy ny tenimiafina'));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(getText('Le mot de passe doit contenir au moins 6 caracteres', '6 litera farafahakeliny ny tenimiafina'));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || getText('Une erreur est survenue', 'Nisy hadisoana nitranga'));
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || getText('Une erreur est survenue', 'Nisy hadisoana nitranga'));
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{getText('Vérification du lien', 'Fanamarinana ny rohy')}</p>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {getText('Lien invalide', 'Rohy tsy manan-kery')}
          </h2>
          <p className="text-gray-600 mb-6">
            {getText('Ce lien de réinitialisation est invalide ou a expiré.', 
                     'Tsy manan-kery na lany daty ity rohy famerenana ity.')}
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {getText('Nouvelle demande', 'Fangatahana vaovao')}
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {getText('Mot de passe modifié', 'Nova ny tenimiafina')}
          </h2>
          <p className="text-gray-600 mb-4">
            {getText('Votre mot de passe a été réinitialisé avec succès.', 
                     'Voaova soa aman-tsara ny tenimiafinao.')}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            {getText('Redirection vers la page de connexion.', 'Ho entina any amin\'ny pejy fidirana ianao.')}
          </p>
          <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        
        {/* Lien retour */}
        <div className="mb-6">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {getText('Retour à la connexion', 'Hiverina any amin\'ny fidirana')}
          </Link>
        </div>

        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {getText('Nouveau mot de passe', 'Tenimiafina vaovao')}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {getText('Choisissez un nouveau mot de passe sécurisé',
                     'Misafidia tenimiafina vaovao azo antoka')}
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getText('Nouveau mot de passe', 'Tenimiafina vaovao')}
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
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getText('Minimum 6 caractères', '6 litera farafahakeliny')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getText('Confirmer le mot de passe', 'Hamafiso ny tenimiafina')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {getText('Réinitialisation en cours...', 'Famerenana...')}
              </>
            ) : (
              getText('Réinitialiser le mot de passe', 'Averina ny tenimiafina')
            )}
          </button>
        </form>

        {/* Lien connexion */}
        <div className="mt-6 text-center">
          <Link href="/login" className="text-blue-600 font-semibold hover:underline text-sm">
            {getText('Retour à la connexion', 'Hiverina any amin\'ny fidirana')}
          </Link>
        </div>
      </div>
    </div>
  );
}