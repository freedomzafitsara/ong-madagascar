'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Phone, Edit2, Save, X, Camera, Loader2, CheckCircle, AlertCircle, LogOut, Lock, Key } from 'lucide-react';
import Link from 'next/link';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bio: string;
}

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
  });

  const [originalData, setOriginalData] = useState<ProfileFormData>(formData);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

  const getText = (fr: string, mg: string) => {
    const language = localStorage.getItem('y-mad-language') || 'fr';
    return language === 'fr' ? fr : mg;
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
        });
        setOriginalData(formData);
        
        if (data.avatar_url) {
          setProfileImage(data.avatar_url);
          setOriginalImage(data.avatar_url);
        }
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError(getText('Veuillez sélectionner une image', 'Fidio sary'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(getText('Image trop volumineuse (max 5 Mo)', 'Midadasika loatra ny sary (5 Mo max)'));
      return;
    }

    setUploadError(null);
    setImageFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setIsUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', imageFile);
    uploadFormData.append('type', 'profile');

    try {
      const response = await fetch(`${API_URL}/upload/profile`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadFormData,
      });

      const data = await response.json();
      if (response.ok) {
        return data.url;
      } else {
        setUploadError(data.message || getText('Erreur upload', 'Hadisoana'));
        return null;
      }
    } catch (error) {
      setUploadError(getText('Erreur de connexion', 'Tsy nahomby ny fifandraisana'));
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setUploadError(null);
    
    try {
      let newImageUrl = profileImage;
      
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          newImageUrl = uploadedUrl;
        }
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          bio: formData.bio,
          avatar_url: newImageUrl
        }),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setOriginalData(formData);
        setOriginalImage(profileImage);
        setIsEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const data = await response.json();
        setUploadError(data.message || getText('Erreur sauvegarde', 'Hadisoana'));
      }
    } catch (error) {
      setUploadError(getText('Erreur de connexion', 'Tsy nahomby ny fifandraisana'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(originalData);
    setProfileImage(originalImage);
    setImageFile(null);
    setUploadError(null);
  };

  const getRoleLabel = () => {
    const role = user?.role;
    if (role === 'super_admin') return getText('Super Administrateur', 'Super Admin');
    if (role === 'admin') return getText('Administrateur', 'Admin');
    return getText('Utilisateur', 'Mpampiasa');
  };

  const getRoleColor = () => {
    const role = user?.role;
    if (role === 'super_admin') return 'bg-purple-100 text-purple-700';
    if (role === 'admin') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{getText('Mon profil', 'Ny momba ahy')}</h1>
              <p className="text-gray-500 text-sm mt-1">{getText('Gérez vos informations personnelles', 'Ampio ny momba anao')}</p>
            </div>
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    {getText('Annuler', 'Avela')}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? getText('Sauvegarde...', 'Tehirizina...') : getText('Sauvegarder', 'Tehirizina')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  <Edit2 className="w-4 h-4" />
                  {getText('Modifier', 'Ovaina')}
                </button>
              )}
              <button
                onClick={() => logout()}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
                {getText('Déconnexion', 'Fivoahana')}
              </button>
            </div>
          </div>
        </div>

        {/* Messages de notification */}
        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {getText('Profil mis à jour avec succès !', 'Voaova soa aman-tsara ny momba anao !')}
          </div>
        )}
        {uploadError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {uploadError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Colonne gauche - Avatar et rôle */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mx-auto overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-blue-600" />
                  )}
                </div>
                
                {isEditing && (
                  <div className="absolute bottom-0 right-0 flex gap-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
                      title={getText('Changer la photo', 'Hanova ny sary')}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    {profileImage && (
                      <button
                        onClick={removeImage}
                        className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition"
                        title={getText('Supprimer', 'Fafana')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mt-4">
                {formData.first_name} {formData.last_name}
              </h3>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mt-2 ${getRoleColor()}`}>
                {getRoleLabel()}
              </div>
              
              {isUploading && (
                <p className="text-sm text-blue-600 mt-2 flex items-center justify-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {getText('Téléchargement...', 'Fandefasana...')}
                </p>
              )}
            </div>
            
            <div className="border-t border-gray-100 p-4 space-y-2 bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="w-4 h-4" />
                <span>{formData.email}</span>
              </div>
              {formData.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="w-4 h-4" />
                  <span>{formData.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite - Formulaires */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* Informations personnelles */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  {getText('Informations personnelles', 'Fampahalalana manokana')}
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {getText('Prénom', 'Anarana')}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-800">{formData.first_name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {getText('Nom', 'Fanampiny')}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-800">{formData.last_name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('Téléphone', 'Telefaonina')}
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="032 00 000 00"
                    />
                  ) : (
                    <p className="text-gray-800">{formData.phone || getText('Non renseigné', 'Tsy voafeno')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('Biographie', 'Biografia')}
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder={getText('Parlez-nous de vous...', 'Lazao ny momba anao...')}
                    />
                  ) : (
                    <p className="text-gray-600">{formData.bio || getText('Aucune biographie', 'Tsy misy biografia')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sécurité */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  {getText('Sécurité', 'Fiarovana')}
                </h2>
              </div>
              <div className="p-5">
                <Link 
                  href="/forgot-password"
                  className="inline-flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  <Key className="w-4 h-4" />
                  {getText('Changer le mot de passe', 'Hanova ny tenimiafina')}
                </Link>
                <p className="text-xs text-gray-400 mt-3">
                  {getText('Pour des raisons de sécurité, changez votre mot de passe régulièrement.', 
                           'Mba hiarovana ny kaontinao, dia ovay matetika ny tenimiafinao.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}