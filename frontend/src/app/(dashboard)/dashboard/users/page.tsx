// frontend/src/app/(dashboard)/dashboard/users/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, Search, RefreshCw, Loader2, Eye, Edit,
  CheckCircle, AlertCircle, Calendar, User,
  Mail, Phone, Shield, Lock, Unlock, X,
  ChevronLeft, ChevronRight, Download,
  UserPlus, Trash2, Award, Clock, Ban
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// ============================================================
// INTERFACES
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

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  super_admin: number;
  admin: number;
  user: number;
  candidate: number;
  visitor: number;
}

// ============================================================
// CONSTANTES
// ============================================================

const ITEMS_PER_PAGE = 10;

const ROLE_LABELS: Record<string, { fr: string; mg: string; color: string; bg: string; icon: any }> = {
  super_admin: { 
    fr: 'Super Admin', 
    mg: 'Super Admin', 
    color: 'text-red-800', 
    bg: 'bg-red-100',
    icon: Award 
  },
  admin: { 
    fr: 'Admin', 
    mg: 'Admin', 
    color: 'text-blue-800', 
    bg: 'bg-blue-100',
    icon: Shield 
  },
  user: { 
    fr: 'Utilisateur', 
    mg: 'Mpampiasa', 
    color: 'text-gray-700', 
    bg: 'bg-gray-100',
    icon: User 
  },
  candidate: { 
    fr: 'Candidat', 
    mg: 'Mpangataka', 
    color: 'text-green-800', 
    bg: 'bg-green-100',
    icon: Users 
  },
  visitor: { 
    fr: 'Visiteur', 
    mg: 'Mpitsidika', 
    color: 'text-purple-800', 
    bg: 'bg-purple-100',
    icon: Eye 
  },
};

const ROLE_OPTIONS = [
  { value: 'super_admin', labelFr: 'Super Admin', labelMg: 'Super Admin' },
  { value: 'admin', labelFr: 'Admin', labelMg: 'Admin' },
  { value: 'user', labelFr: 'Utilisateur', labelMg: 'Mpampiasa' },
  { value: 'candidate', labelFr: 'Candidat', labelMg: 'Mpangataka' },
  { value: 'visitor', labelFr: 'Visiteur', labelMg: 'Mpitsidika' },
];

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

// ============================================================
// COMPOSANTS
// ============================================================

function StatCard({ label, value, icon: Icon, isBlue = false }: { 
  label: string; value: number; icon: any; isBlue?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 transition-all duration-200 hover:shadow-md ${isBlue ? 'bg-blue-800 text-white' : 'bg-white border border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-sm font-medium ${isBlue ? 'text-white/70' : 'text-gray-500'}`}>{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isBlue ? 'bg-white/20' : 'bg-gray-100'}`}>
          <Icon className={`w-4 h-4 ${isBlue ? 'text-white' : 'text-gray-600'}`} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${isBlue ? 'text-white' : 'text-gray-800'}`}>{value}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const config = ROLE_LABELS[role] || ROLE_LABELS.user;
  const IconComponent = config.icon || User;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
      <IconComponent className="w-3 h-3" />
      {config.fr}
    </span>
  );
}

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

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function UsersPage() {
  const { token, user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState<UserStats>({
    total: 0, active: 0, inactive: 0,
    super_admin: 0, admin: 0, user: 0, candidate: 0, visitor: 0
  });
  const [exporting, setExporting] = useState(false);
  const [updating, setUpdating] = useState(false);

  // ✅ Refs pour eviter les boucles
  const isMounted = useRef(true);
  const initialLoaded = useRef(false);
  const loadTimer = useRef<NodeJS.Timeout | null>(null);

  const isSuperAdmin = user?.role === 'super_admin';
  const hasAccess = user?.role === 'super_admin' || user?.role === 'admin';

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  // ============================================================
  // CHARGEMENT DES DONNEES - AVEC STABLE REFERENCES
  // ============================================================

  // ✅ loadUsers avec useCallback et dependances stables
  const loadUsers = useCallback(async () => {
    if (!token || !isMounted.current) return;
    
    setLoading(true);
    try {
      const params: any = { page: currentPage, limit: ITEMS_PER_PAGE };
      if (filterRole !== 'all') params.role = filterRole;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/auth/users', { params });
      
      if (response.data && isMounted.current) {
        setUsers(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.total || 0);
      }
    } catch (error: any) {
      console.error('Erreur chargement utilisateurs:', error);
      if (isMounted.current) {
        toast.error(getText('Erreur de chargement', 'Nisy hadisoana'));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [currentPage, filterRole, filterStatus, searchTerm, token, getText]);

  // ✅ loadStats avec useCallback
  const loadStats = useCallback(async () => {
    if (!token || !isMounted.current) return;
    
    try {
      const response = await api.get('/auth/users/stats');
      if (response.data && isMounted.current) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  }, [token]);

  // ✅ loadAllData avec useCallback
  const loadAllData = useCallback(async () => {
    if (!token || !isMounted.current) return;
    await Promise.all([loadUsers(), loadStats()]);
  }, [loadUsers, loadStats, token]);

  // ============================================================
  // HOOKS
  // ============================================================

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (loadTimer.current) {
        clearTimeout(loadTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!hasAccess) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, hasAccess, router]);

  // ✅ Chargement initial UNIQUE avec ref
  useEffect(() => {
    if (token && !initialLoaded.current && isMounted.current) {
      initialLoaded.current = true;
      // Petit delai pour eviter les conflits
      loadTimer.current = setTimeout(() => {
        loadAllData();
      }, 100);
    }
    return () => {
      if (loadTimer.current) {
        clearTimeout(loadTimer.current);
      }
    };
  }, [token, loadAllData]);

  // ✅ Rechargement avec debounce quand les filtres changent
  useEffect(() => {
    if (initialLoaded.current && token && isMounted.current) {
      // Annuler le timer precedent
      if (loadTimer.current) {
        clearTimeout(loadTimer.current);
      }
      // Nouveau timer avec debounce de 300ms
      loadTimer.current = setTimeout(() => {
        loadUsers();
      }, 300);
    }
    return () => {
      if (loadTimer.current) {
        clearTimeout(loadTimer.current);
      }
    };
  }, [currentPage, filterRole, filterStatus, searchTerm, loadUsers, token]);

  // ============================================================
  // ACTIONS
  // ============================================================

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (!isSuperAdmin) {
      toast.error(getText('Seul le Super Admin peut modifier les statuts', 'Super Admin ihany no afaka manova sata'));
      return;
    }

    setUpdating(true);
    try {
      await api.patch(`/auth/users/${userId}/toggle-status`, {});
      toast.success(getText('Statut mis a jour', 'Vita ny fanovana sata'));
      // Recharger apres un delai
      setTimeout(() => {
        loadUsers();
        loadStats();
      }, 300);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || getText('Erreur lors de la mise a jour', 'Nisy hadisoana'));
    } finally {
      setUpdating(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    if (!isSuperAdmin) {
      toast.error(getText('Seul le Super Admin peut modifier les roles', 'Super Admin ihany no afaka manova role'));
      return;
    }

    setUpdating(true);
    try {
      await api.patch(`/auth/users/${userId}/role`, { role: newRole });
      toast.success(getText('Role mis a jour', 'Vita ny fanovana role'));
      setTimeout(() => {
        loadUsers();
        loadStats();
      }, 300);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || getText('Erreur lors de la mise a jour', 'Nisy hadisoana'));
    } finally {
      setUpdating(false);
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!isSuperAdmin) {
      toast.error(getText('Seul le Super Admin peut supprimer des utilisateurs', 'Super Admin ihany no afaka mamafa mpampiasa'));
      return;
    }

    const confirmMsg = getText(
      `Supprimer l'utilisateur "${userName}" ? Cette action est irreversible.`,
      `Hofafana ny mpampiasa "${userName}" ? Tsy azo averina izany.`
    );
    if (!confirm(confirmMsg)) return;

    try {
      await api.delete(`/auth/users/${userId}`);
      toast.success(getText('Utilisateur supprime', 'Vita ny fanafoanana'));
      setTimeout(() => {
        loadUsers();
        loadStats();
      }, 300);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || getText('Erreur lors de la suppression', 'Nisy hadisoana'));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/auth/users/export', { 
        params: { role: filterRole !== 'all' ? filterRole : undefined },
        responseType: 'blob' 
      });
      
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(getText('Export reussi', 'Vita ny fanondrana'));
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error(getText('Erreur lors de l\'export', 'Nisy hadisoana tamin\'ny fanondrana'));
    } finally {
      setExporting(false);
    }
  };

  const handleRefresh = () => {
    // Annuler le timer en cours
    if (loadTimer.current) {
      clearTimeout(loadTimer.current);
    }
    loadUsers();
    loadStats();
    toast.success(getText('Donnees actualisees', 'Havaozina ny angona'));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterRole('all');
    setFilterStatus('all');
    setCurrentPage(1);
    toast.success(getText('Filtres effaces', 'Vonoina ny sivana'));
  };

  // ============================================================
  // RENDU
  // ============================================================

  if (!isAuthenticated || !hasAccess) {
    return null;
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-800 animate-spin" />
        <p className="text-gray-500">{getText('Chargement...', 'Fandefasana...')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center shadow-sm">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{getText('Gestion des utilisateurs', 'Fitantanana ny mpampiasa')}</h1>
            <p className="text-gray-500 text-sm">{getText('Gerez les comptes utilisateurs', 'Tantano ny kaontin\'ny mpampiasa')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport} 
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-gray-600" />}
            <span className="text-sm text-gray-600">{getText('Exporter CSV', 'Hanondrana CSV')}</span>
          </button>
          <button 
            onClick={handleRefresh} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">{getText('Actualiser', 'Havaozina')}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label={getText('Total', 'Rehetra')} 
          value={stats.total} 
          icon={Users} 
          isBlue={true}
        />
        <StatCard 
          label={getText('Actifs', 'Mavitrika')} 
          value={stats.active} 
          icon={CheckCircle}
        />
        <StatCard 
          label={getText('Inactifs', 'Tsy mavitrika')} 
          value={stats.inactive} 
          icon={Ban}
        />
        <StatCard 
          label={getText('Admins', 'Admin')} 
          value={stats.admin + stats.super_admin} 
          icon={Shield}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={getText('Rechercher par nom, email...', 'Karohy...')}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none text-sm"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none text-sm min-w-[150px]"
          >
            <option value="all">{getText('Tous les roles', 'Role rehetra')}</option>
            {ROLE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {language === 'fr' ? opt.labelFr : opt.labelMg}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none text-sm min-w-[140px]"
          >
            <option value="all">{getText('Tous les statuts', 'Sata rehetra')}</option>
            <option value="active">{getText('Actifs', 'Mavitrika')}</option>
            <option value="inactive">{getText('Inactifs', 'Tsy mavitrika')}</option>
          </select>
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            <X className="w-4 h-4" /> {getText('Effacer', 'Fafao')}
          </button>
        </div>
        
        {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-full text-xs">
                {searchTerm}
                <button onClick={() => setSearchTerm('')} className="hover:text-red-500">✕</button>
              </span>
            )}
            {filterRole !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-full text-xs">
                Role: {ROLE_OPTIONS.find(o => o.value === filterRole)?.labelFr}
                <button onClick={() => setFilterRole('all')} className="hover:text-red-500">✕</button>
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-full text-xs">
                {filterStatus === 'active' ? 'Actifs' : 'Inactifs'}
                <button onClick={() => setFilterStatus('all')} className="hover:text-red-500">✕</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Utilisateur', 'Mpampiasa')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Email', 'Email')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Role', 'Role')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Statut', 'Sata')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Derniere connexion', 'Farany nidirana')}
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Actions', 'Hetsika')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">{getText('Aucun utilisateur trouve', 'Tsy misy mpampiasa hita')}</p>
                      <p className="text-sm text-gray-400">{getText('Modifiez vos filtres', 'Hanova ny sivanao')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((userData) => {
                  const fullName = `${userData.first_name} ${userData.last_name}`.trim() || userData.email;
                  
                  return (
                    <tr key={userData.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-800" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{fullName}</p>
                            {userData.phone && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {userData.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-600">{userData.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <RoleBadge role={userData.role} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge isActive={userData.is_active} />
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(userData.last_login)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/dashboard/users/${userData.id}`}
                            className="p-2 text-gray-500 hover:text-blue-800 rounded-lg hover:bg-gray-100 transition"
                            title={getText('Voir le detail', 'Jereo ny antsipirihany')}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/dashboard/users/${userData.id}/edit`}
                            className="p-2 text-gray-500 hover:text-blue-800 rounded-lg hover:bg-gray-100 transition"
                            title={getText('Modifier', 'Hanova')}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          {isSuperAdmin && userData.role !== 'super_admin' && (
                            <>
                              <button
                                onClick={() => toggleUserStatus(userData.id, userData.is_active)}
                                className="p-2 text-gray-500 hover:text-blue-800 rounded-lg hover:bg-gray-100 transition"
                                title={userData.is_active ? getText('Desactiver', 'Ajanony') : getText('Activer', 'Ampiasao')}
                              >
                                {userData.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => deleteUser(userData.id, fullName)}
                                className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                                title={getText('Supprimer', 'Hamafa')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <div className="text-sm text-gray-500">
            {getText('Page', 'Pejy')} {currentPage} / {totalPages} ({totalItems} {getText('utilisateurs', 'mpampiasa')})
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = currentPage;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg transition ${currentPage === pageNum ? 'bg-blue-800 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-400">
        {getText(
          'Les utilisateurs sont geres via l\'API d\'authentification JWT',
          'Ny mpampiasa dia tantanina amin\'ny alalan\'ny API authentification JWT'
        )}
      </div>
    </div>
  );
}