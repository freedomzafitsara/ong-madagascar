// src/app/dashboard/security/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';  // ← CORRIGÉ: contexts (avec s)
import { Shield, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Key, Fingerprint, LogOut } from 'lucide-react';

export default function SecurityPage() {
  const { user, logout } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showMessage('Veuillez remplir tous les champs', 'error');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('Les nouveaux mots de passe ne correspondent pas', 'error');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showMessage('Mot de passe modifié avec succès !', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showMessage('Erreur lors du changement de mot de passe', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAllDevices = () => {
    if (confirm('⚠️ Cette action vous déconnectera de tous vos appareils. Voulez-vous continuer ?')) {
      logout();
      showMessage('Déconnecté de tous les appareils', 'success');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }
  };

  const sessions = [
    { device: 'Chrome sur Windows', location: 'Antananarivo, Madagascar', lastActive: 'Maintenant', current: true },
    { device: 'Safari sur iPhone', location: 'Antananarivo, Madagascar', lastActive: 'Il y a 2 heures', current: false },
    { device: 'Firefox sur Mac', location: 'Paris, France', lastActive: 'Hier', current: false },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-ymad-blue-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-ymad-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ymad-gray-800">Sécurité du compte</h1>
            <p className="text-ymad-gray-500 mt-1">Gérez la sécurité de votre compte administrateur</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Changement de mot de passe */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-ymad-gray-100">
          <h2 className="text-lg font-semibold text-ymad-gray-800 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-ymad-blue-600" />
            Changer le mot de passe
          </h2>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ymad-gray-700 mb-1">Mot de passe actuel</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500 outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ymad-gray-400"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ymad-gray-700 mb-1">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500 outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ymad-gray-400"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-ymad-gray-400 mt-1">Minimum 6 caractères</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ymad-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500 outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ymad-gray-400"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-ymad-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-ymad-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </form>
        </div>

        {/* Authentification à deux facteurs */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-ymad-gray-100">
          <h2 className="text-lg font-semibold text-ymad-gray-800 mb-4 flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-ymad-blue-600" />
            Authentification à deux facteurs
          </h2>
          
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-ymad-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-ymad-gray-400" />
            </div>
            <p className="text-ymad-gray-600 mb-2">Protégez votre compte avec une double authentification</p>
            <p className="text-sm text-ymad-gray-400 mb-4">Recevez un code par email ou SMS à chaque connexion</p>
            <button className="px-6 py-2 border border-ymad-blue-600 text-ymad-blue-600 rounded-lg font-semibold hover:bg-ymad-blue-50 transition">
              Activer la 2FA
            </button>
          </div>
        </div>
      </div>

      {/* Sessions actives */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-ymad-gray-100">
        <h2 className="text-lg font-semibold text-ymad-gray-800 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-ymad-blue-600" />
          Sessions actives
        </h2>
        
        <div className="space-y-3">
          {sessions.map((session, idx) => (
            <div key={idx} className={`flex justify-between items-center p-3 rounded-lg ${session.current ? 'bg-ymad-blue-50 border border-ymad-blue-200' : 'bg-ymad-gray-50'}`}>
              <div>
                <p className="font-medium text-ymad-gray-800">{session.device}</p>
                <p className="text-sm text-ymad-gray-500">{session.location}</p>
                <p className="text-xs text-ymad-gray-400">Dernière activité : {session.lastActive}</p>
              </div>
              {session.current ? (
                <span className="text-xs bg-ymad-blue-600 text-white px-2 py-1 rounded-full">Appareil actuel</span>
              ) : (
                <button className="text-sm text-red-500 hover:text-red-600">Déconnecter</button>
              )}
            </div>
          ))}
        </div>
        
        <button onClick={handleLogoutAllDevices} className="mt-4 w-full text-red-500 text-sm hover:text-red-600 flex items-center justify-center gap-2 py-2 border-t pt-4">
          <LogOut className="w-4 h-4" />
          Déconnecter tous les appareils
        </button>
      </div>

      {/* Journal d'activité récent */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-ymad-gray-100">
        <h2 className="text-lg font-semibold text-ymad-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-ymad-blue-600" />
          Activité récente
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 border-b">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-ymad-gray-800">Connexion réussie</p>
              <p className="text-xs text-ymad-gray-500">IP: 192.168.1.1 • Antananarivo, Madagascar</p>
            </div>
            <span className="text-xs text-ymad-gray-400">Il y a 2 heures</span>
          </div>
          <div className="flex items-start gap-3 p-3 border-b">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Key className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-ymad-gray-800">Modification du profil</p>
              <p className="text-xs text-ymad-gray-500">Changement des informations personnelles</p>
            </div>
            <span className="text-xs text-ymad-gray-400">Hier</span>
          </div>
          <div className="flex items-start gap-3 p-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-ymad-gray-800">Nouvelle connexion détectée</p>
              <p className="text-xs text-ymad-gray-500">Nouvel appareil: Chrome sur Windows</p>
            </div>
            <span className="text-xs text-ymad-gray-400">Il y a 2 jours</span>
          </div>
        </div>
      </div>
    </div>
  );
}