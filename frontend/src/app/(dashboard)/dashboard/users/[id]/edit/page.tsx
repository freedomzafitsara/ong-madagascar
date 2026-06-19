// frontend/src/app/(dashboard)/dashboard/users/[id]/edit/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ArrowLeft, Save, Loader2, AlertCircle, 
  User, Mail, Phone, Shield, CheckCircle,
  X, Eye, EyeOff, Award, Users, Ban,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// ============================================================
// TYPES
// ============================================================

interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'user' | 'candidate' | 'visitor';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// CONSTANTES
// ============================================================

const ROLE_OPTIONS = [
  { value: 'super_admin', labelFr: 'Super Admin', labelMg: 'Super Admin', color: 'text-red-800', bg: 'bg-red-100' },
  { value: 'admin', labelFr: 'Admin', labelMg: 'Admin', color: 'text-blue-800', bg: 'bg-blue-100' },
  { value: 'user', labelFr: 'Utilisateur', labelMg: 'Mpampiasa', color: 'text-gray-700', bg: 'bg-gray-100' },
  { value: 'candidate', labelFr: 'Candidat', labelMg: 'Mpangataka', color: 'text-green-800', bg: 'bg-green-100' },
  { value: 'visitor', labelFr: 'Visiteur', labelMg: 'Mpitsidika', color: 'text-purple-800', bg: 'bg-purple-100' },
];

// ============================================================
// COMPOSANTS
// ============================================================

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
      isActive 
        ? 'bg-green-100 text-green-700 border border-green-200' 
        : 'bg-red-100 text-red-700 border border-red-200'
    }`}>
      {isActive ? (
        <CheckCircle className="w-3 h-3 text-green-600" />
      ) : (
        <Ban className="w-3 h-3 text-red-600" />
      )}
      {isActive ? 'Actif' : 'Inactif'}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const option = ROLE_OPTIONS.find(r => r.value === role);
  if (!option) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${option.bg} ${option.color}`}>
      <Shield className="w-3 h-3" />
      {option.labelFr}
    </span>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  
  const userId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    role: 'user' as string,
  });

  const isMounted = useRef(true);
  const initialLoaded = useRef(false);

  const isSuperAdmin = user?.role === 'super_admin';
  const hasAccess = user?.role === 'super_admin' || user?.role === 'admin';
  const canEdit = isSuperAdmin || (hasAccess && userData?.role !== 'super_admin');

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  // ============================================================
  // CHARGEMENT DE L'UTILISATEUR
  // ============================================================

  const loadUser = useCallback(async () => {
    if (!token || !isMounted.current || !userId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/auth/users/${userId}`);
      
      if (response.data && isMounted.current) {
        setUserData(response.data);
        setFormData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          phone: response.data.phone || '',
          role: response.data.role || 'user',
        });
        setError('');
      }
    } catch (error: any) {
      console.error('Erreur chargement utilisateur:', error);
      if (error.response?.status === 404) {
        setError(getText('Utilisateur non trouve', 'Tsy hita ny mpampiasa'));
      } else if (error.response?.status === 403) {
        setError(getText('Acces non autorise', 'Tsy manana alalana'));
      } else {
        setError(getText('Erreur de chargement', 'Nisy hadisoana'));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [userId, token, getText]);

  // ============================================================
  // HOOKS
  // ============================================================

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!hasAccess) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, hasAccess, router]);

  // Chargement initial UNIQUE
  useEffect(() => {
    if (token && userId && !initialLoaded.current && isMounted.current) {
      initialLoaded.current = true;
      loadUser();
    }
  }, [token, userId, loadUser]);

  // ============================================================
  // GESTION DU FORMULAIRE
  // ============================================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // ============================================================
  // SAUVEGARDE
  // ============================================================

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    
    if (!isSuperAdmin && userData.role === 'super_admin') {
      toast.error(getText('Vous ne pouvez pas modifier un Super Admin', 'Tsy afaka manova Super Admin ianao'));
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await api.put(`/auth/users/${userId}`, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || null,
      });
      
      setSuccess(getText('Utilisateur mis a jour avec succes', 'Vita ny fanovana ny mpampiasa'));
      toast.success(getText('Utilisateur mis a jour', 'Vita ny fanovana'));
      
      loadUser();
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      const errorMsg = error.response?.data?.message || getText('Erreur lors de la sauvegarde', 'Nisy hadisoana');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // CHANGEMENT DE ROLE (SUPER ADMIN UNIQUEMENT)
  // ============================================================

  const handleRoleChange = async (newRole: string) => {
    if (!userData || !isSuperAdmin) return;
    
    if (userData.role === 'super_admin' && newRole !== 'super_admin') {
      toast.error(getText('Impossible de changer le role du Super Admin', 'Tsy afaka manova ny role Super Admin'));
      return;
    }

    try {
      await api.patch(`/auth/users/${userId}/role`, { role: newRole });
      setUserData({ ...userData, role: newRole as any });
      setFormData(prev => ({ ...prev, role: newRole }));
      toast.success(getText('Role mis a jour', 'Vita ny fanovana role'));
      loadUser();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || getText('Erreur lors du changement de role', 'Nisy hadisoana'));
    }
  };

  // ============================================================
  // ACTIVATION/DESACTIVATION (SUPER ADMIN UNIQUEMENT)
  // ============================================================

  const handleToggleStatus = async () => {
    if (!userData || !isSuperAdmin) return;
    
    if (userData.role === 'super_admin') {
      toast.error(getText('Impossible de desactiver le Super Admin', 'Tsy afaka manova sata Super Admin'));
      return;
    }

    try {
      await api.patch(`/auth/users/${userId}/toggle-status`, {});
      toast.success(
        userData.is_active 
          ? getText('Utilisateur desactive', 'Voajanona ny mpampiasa')
          : getText('Utilisateur active', 'Navadika ho mavitrika ny mpampiasa')
      );
      loadUser();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || getText('Erreur lors du changement de statut', 'Nisy hadisoana'));
    }
  };

  // ============================================================
  // SUPPRESSION (SUPER ADMIN UNIQUEMENT)
  // ============================================================

  const handleDelete = async () => {
    if (!userData || !isSuperAdmin) return;
    
    if (userData.role === 'super_admin') {
      toast.error(getText('Impossible de supprimer le Super Admin', 'Tsy afaka mamafa Super Admin'));
      return;
    }

    const confirmMsg = getText(
      `Supprimer l'utilisateur "${userData.first_name} ${userData.last_name}" ? Cette action est irreversible.`,
      `Hofafana ny mpampiasa "${userData.first_name} ${userData.last_name}" ? Tsy azo averina izany.`
    );
    if (!confirm(confirmMsg)) return;

    try {
      await api.delete(`/auth/users/${userId}`);
      toast.success(getText('Utilisateur supprime', 'Voafafa ny mpampiasa'));
      router.push('/dashboard/users');
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || getText('Erreur lors de la suppression', 'Nisy hadisoana'));
    }
  };

  // ============================================================
  // RENDU
  // ============================================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-800 animate-spin" />
        <p className="text-gray-500">{getText('Chargement...', 'Fandefasana...')}</p>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{getText('Erreur', 'Hadisoana')}</h3>
        <p className="text-gray-500">{error}</p>
        <Link href="/dashboard/users" className="mt-4 inline-flex items-center gap-2 text-blue-800 hover:underline">
          <ArrowLeft className="w-4 h-4" /> {getText('Retour aux utilisateurs', 'Hiverina any amin\'ny mpampiasa')}
        </Link>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-16">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{getText('Utilisateur non trouve', 'Tsy hita ny mpampiasa')}</h3>
        <Link href="/dashboard/users" className="mt-4 inline-flex items-center gap-2 text-blue-800 hover:underline">
          <ArrowLeft className="w-4 h-4" /> {getText('Retour aux utilisateurs', 'Hiverina any amin\'ny mpampiasa')}
        </Link>
      </div>
    );
  }

  const fullName = `${userData.first_name} ${userData.last_name}`.trim() || userData.email;

  return (
    <div className="max-w-4xl mx-auto pb-8">
      
      {/* Navigation */}
      <div className="mb-6">
        <Link 
          href="/dashboard/users" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-800 mb-3 transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          {getText('Retour aux utilisateurs', 'Hiverina any amin\'ny mpampiasa')}
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center shadow-sm">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {getText('Modifier l\'utilisateur', 'Hanova ny mpampiasa')}
              </h1>
              <p className="text-gray-500 text-sm flex items-center gap-2">
                {fullName}
                <span className="text-gray-300">|</span>
                <RoleBadge role={userData.role} />
                <StatusBadge isActive={userData.is_active} />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <>
                <button
                  onClick={handleToggleStatus}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  {userData.is_active ? (
                    <span className="flex items-center gap-2 text-red-600">
                      <Ban className="w-4 h-4" /> {getText('Desactiver', 'Ajanony')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" /> {getText('Activer', 'Ampiasao')}
                    </span>
                  )}
                </button>
                {userData.role !== 'super_admin' && (
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> {getText('Supprimer', 'Hamafa')}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          
          {/* Informations personnelles */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-800" />
              {getText('Informations personnelles', 'Fampahalalana manokana')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getText('Prenom', 'Anarana')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition"
                  placeholder={getText('Prenom', 'Anarana')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getText('Nom', 'Fianakaviana')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition"
                  placeholder={getText('Nom', 'Fianakaviana')}
                />
              </div>
            </div>
          </div>

          {/* Email et Telephone */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={userData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {getText('L\'email ne peut pas etre modifie', 'Tsy azo ovana ny email')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getText('Telephone', 'Telefaonina')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition"
                    placeholder={getText('Numero de telephone', 'Laharana telefaonina')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Role - Uniquement visible par Super Admin */}
          {isSuperAdmin && (
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-800" />
                {getText('Role et permissions', 'Role sy alalana')}
              </h2>
              <div className="flex flex-wrap gap-3">
                {ROLE_OPTIONS.map(option => {
                  const isCurrent = userData.role === option.value;
                  const isDisabled = userData.role === 'super_admin' && option.value !== 'super_admin';
                  
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleRoleChange(option.value)}
                      disabled={isDisabled}
                      className={`px-4 py-2 rounded-lg border transition text-sm font-medium flex items-center gap-2
                        ${isCurrent 
                          ? 'border-blue-800 bg-blue-50 text-blue-800' 
                          : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                        }
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <Shield className="w-4 h-4" />
                      {language === 'fr' ? option.labelFr : option.labelMg}
                      {isCurrent && <CheckCircle className="w-4 h-4 text-blue-800" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {getText(
                  'Le role determine les permissions de l\'utilisateur dans le systeme',
                  'Ny role dia mamaritra ny alalan\'ny mpampiasa ao amin\'ny rafitra'
                )}
              </p>
            </div>
          )}

          {/* Informations complementaires */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-800" />
              {getText('Informations complementaires', 'Fampahalalana fanampiny')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">{getText('ID utilisateur', 'ID mpampiasa')}</p>
                <p className="font-mono text-xs text-gray-600 break-all">{userData.id}</p>
              </div>
              <div>
                <p className="text-gray-500">{getText('Date de creation', 'Daty namoronana')}</p>
                <p className="font-medium text-gray-800">
                  {new Date(userData.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-500">{getText('Derniere modification', 'Fanovana farany')}</p>
                <p className="font-medium text-gray-800">
                  {new Date(userData.updated_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              {userData.last_login && (
                <div>
                  <p className="text-gray-500">{getText('Derniere connexion', 'Farany nidirana')}</p>
                  <p className="font-medium text-gray-800">
                    {new Date(userData.last_login).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Link
              href="/dashboard/users"
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-medium"
            >
              <X className="w-4 h-4" /> {getText('Annuler', 'Aoka')}
            </Link>
            <button
              type="submit"
              disabled={saving || !canEdit}
              className="px-6 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm font-medium"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {getText('Enregistrement...', 'Fitehirizana...')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {getText('Enregistrer', 'Tehirizo')}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-400">
        {getText(
          'Les donnees sont stockees dans PostgreSQL via l\'API backend - Connexion securisee JWT',
          'Ny angona dia voatahiry ao PostgreSQL amin\'ny alalan\'ny API backend - Fifandraisana voaaro JWT'
        )}
      </div>
    </div>
  );
}