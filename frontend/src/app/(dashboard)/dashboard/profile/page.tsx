'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, Mail, Phone, MapPin, Calendar, Shield, Edit2, Save, X, 
  Camera, Loader2, CheckCircle, AlertCircle, Globe, 
  Briefcase, Heart, Award, Clock, LogOut, Lock, Key,
  Share2, Code, MessageCircle, Building, FileText, Users
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "Jean",
    lastName: user?.lastName || "Rakoto",
    email: user?.email || "jean@ong-madagascar.mg",
    phone: "034 00 000 00",
    region: "Analamanga",
    bio: "Engagé pour le développement de Madagascar depuis 5 ans.",
    position: "Coordinateur de projet",
    department: "Programmes",
    skills: "Gestion de projet, Communication, Leadership",
    socialLinkedin: "https://linkedin.com/in/jean-rakoto",
    socialTwitter: "https://twitter.com/jeanrakoto",
    socialGithub: "https://github.com/jeanrakoto"
  });

  // Charger la photo de profil depuis localStorage
  useEffect(() => {
    const savedImage = localStorage.getItem('user_profile_image');
    if (savedImage) {
      setProfileImage(savedImage);
    }
    
    const savedData = localStorage.getItem('user_profile_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Erreur chargement données:', e);
      }
    }
  }, []);

  // Upload de la photo
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Veuillez sélectionner une image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('L\'image ne doit pas dépasser 5 Mo');
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
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-secret-token-2024'
        },
        body: uploadFormData,
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('user_profile_image', data.url);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
        return data.url;
      } else {
        setUploadError(data.error || 'Erreur lors de l\'upload');
        return null;
      }
    } catch (error) {
      setUploadError('Erreur de connexion');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImageFile(null);
    localStorage.removeItem('user_profile_image');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (imageFile) {
      await uploadImage();
    }
    localStorage.setItem('user_profile_data', JSON.stringify(formData));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    const savedData = localStorage.getItem('user_profile_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (e) {
        console.error('Erreur:', e);
      }
    }
    const savedImage = localStorage.getItem('user_profile_image');
    if (savedImage) {
      setProfileImage(savedImage);
    }
    setImageFile(null);
    setUploadError(null);
  };

  const memberSince = "janvier 2024";
  const lastLogin = "Aujourd'hui à 14:30";

  const stats = [
    { label: 'Projets suivis', value: '12', icon: Briefcase, color: 'blue' },
    { label: 'Bénéficiaires', value: '245', icon: Heart, color: 'rose' },
    { label: 'Heures de bénévolat', value: '128', icon: Clock, color: 'green' },
    { label: 'Certifications', value: '3', icon: Award, color: 'purple' },
  ];

  const getRoleLabel = () => {
    const role = user?.role;
    if (role === 'admin') return 'Administrateur';
    if (role === 'staff') return 'Staff ONG';
    return 'Bénévole';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Mon profil</h1>
            <p className="text-gray-500 mt-1">Gérez vos informations personnelles</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                <Edit2 className="w-4 h-4" />
                Modifier le profil
              </button>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Messages */}
        {uploadSuccess && (
          <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Photo de profil mise à jour avec succès !
          </div>
        )}
        {uploadError && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {uploadError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ==================== COLONNE GAUCHE ==================== */}
          <div className="space-y-6">
            {/* Carte de profil */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative h-24 bg-gradient-to-r from-blue-600 to-blue-700">
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-white p-1 shadow-lg">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-12 h-12 text-blue-600" />
                        </div>
                      )}
                    </div>
                    
                    {isEditing && (
                      <>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        {profileImage && (
                          <button
                            onClick={removeImage}
                            className="absolute bottom-0 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="pt-16 pb-6 px-4 text-center">
                <h3 className="text-xl font-bold text-gray-800">
                  {formData.firstName} {formData.lastName}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{formData.position}</p>
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                  <Shield className="w-3 h-3" />
                  {getRoleLabel()}
                </div>
                
                {isUploading && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Upload en cours...
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-100 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Membre depuis {memberSince}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Dernière connexion: {lastLogin}</span>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Statistiques</h3>
              <div className="space-y-3">
                {stats.map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                        <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
                      </div>
                      <span className="text-sm text-gray-600">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ==================== COLONNE DROITE ==================== */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Informations personnelles
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-800">{formData.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-800">{formData.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-800">{formData.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-800">{formData.phone}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.region}
                          onChange={(e) => setFormData({...formData, region: e.target.value})}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-800">{formData.region}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-600">{formData.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Informations professionnelles */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Informations professionnelles
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData({...formData, position: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-800">{formData.position}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-800">{formData.department}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Compétences</label>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={formData.skills}
                      onChange={(e) => setFormData({...formData, skills: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Séparez vos compétences par des virgules"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.split(',').map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Réseaux sociaux
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.socialLinkedin}
                      onChange={(e) => setFormData({...formData, socialLinkedin: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://linkedin.com/in/..."
                    />
                  ) : (
                    formData.socialLinkedin && (
                      <a href={formData.socialLinkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        {formData.socialLinkedin}
                      </a>
                    )
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Twitter / X</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.socialTwitter}
                      onChange={(e) => setFormData({...formData, socialTwitter: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    formData.socialTwitter && (
                      <a href={formData.socialTwitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        {formData.socialTwitter}
                      </a>
                    )
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.socialGithub}
                      onChange={(e) => setFormData({...formData, socialGithub: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    formData.socialGithub && (
                      <a href={formData.socialGithub} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        {formData.socialGithub}
                      </a>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Sécurité */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  Sécurité
                </h2>
              </div>
              <div className="p-6">
                <button className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                  <Key className="w-4 h-4" />
                  Changer le mot de passe
                </button>
                <p className="text-xs text-gray-400 mt-3">
                  Dernier changement de mot de passe: Il y a 2 mois
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}