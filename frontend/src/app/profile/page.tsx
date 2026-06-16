// frontend/src/app/profile/page.tsx

'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Phone, Camera, Save, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, uploadAvatar } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleProfileUpdate = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setErrors({});

  try {
    //  Appeler updateProfile avec les données partielles
    await updateProfile({
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
    });
    toast.success('Profil mis à jour avec succès');
  } catch (error: any) {
    toast.error(error.message || 'Erreur de mise à jour');
  } finally {
    setLoading(false);
  }
};

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setErrors({});

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: 'Les mots de passe ne correspondent pas' });
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrors({ newPassword: 'Le mot de passe doit contenir au moins 6 caractères' });
      setPasswordLoading(false);
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Mot de passe modifié avec succès');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Erreur de changement de mot de passe');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format non supporté (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop grande (max 5 Mo)');
      return;
    }

    setAvatarLoading(true);
    try {
      await uploadAvatar(file);
      toast.success('Photo de profil mise à jour');
    } catch (error: any) {
      toast.error(error.message || 'Erreur d\'upload');
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Mon profil</h1>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* En-tête avec avatar */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/50">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarLoading}
                  className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md disabled:opacity-50"
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
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-blue-200 text-sm">{user?.email}</p>
                <p className="text-blue-300 text-sm mt-1">
                  Rôle: {user?.role === 'admin' ? 'Administrateur' : user?.role === 'candidate' ? 'Candidat' : 'Visiteur'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Formulaire profil */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations personnelles</h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Enregistrer les modifications
                </button>
              </form>
            </div>

            {/* Changement de mot de passe */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Changer le mot de passe</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.newPassword && (
                    <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
                >
                  {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
                  Changer le mot de passe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
