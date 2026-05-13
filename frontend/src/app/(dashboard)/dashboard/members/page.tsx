'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, Search, Plus, Download, RefreshCw, Loader2,
  Eye, Mail, MapPin, CheckCircle, XCircle, Clock,
  ChevronLeft, ChevronRight, UserPlus, CreditCard, AlertCircle,
  Phone, Calendar, FileText, Filter
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface MemberUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  region: string;
}

interface Member {
  id: string;
  memberNumber?: string;
  member_number?: string;
  membershipType?: string;
  membership_type?: string;
  status: string;
  amountPaid?: number;
  amount_paid?: number;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  user: MemberUser;
  createdAt?: string;
  updatedAt?: string;
}

interface MemberStats {
  total: number;
  active: number;
  expired: number;
  pending: number;
  totalRevenue: number;
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function MembersPage() {
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  
  const itemsPerPage = 10;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

  // ============================================================
  // VÉRIFICATION DES DROITS D'ACCÈS
  // ============================================================

  const isAuthorized = isAuthenticated && (
    user?.role === 'super_admin' || 
    user?.role === 'admin' || 
    user?.role === 'staff'
  );

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Accès non autorisé</h1>
          <p className="text-gray-500 mb-6">
            Vous n'avez pas les droits nécessaires pour accéder à cette page.
          </p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // FONCTIONS DE SÉCURITÉ POUR LES VALEURS OPTIONNELLES
  // ============================================================

  const getStringValue = (value: string | undefined | null, defaultValue: string = ''): string => {
    return value || defaultValue;
  };

  const getNumberValue = (value: number | undefined | null, defaultValue: number = 0): number => {
    return value ?? defaultValue;
  };

  const getMemberNumber = (member: Member): string => {
    return member.memberNumber || member.member_number || '';
  };

  const getMembershipType = (member: Member): string => {
    return member.membershipType || member.membership_type || 'standard';
  };

  const getStartDate = (member: Member): string => {
    return member.startDate || member.start_date || '';
  };

  const getEndDate = (member: Member): string => {
    return member.endDate || member.end_date || '';
  };

  const getAmountPaid = (member: Member): number => {
    return member.amountPaid || member.amount_paid || 0;
  };

  const getFullName = (member: Member): string => {
    const firstName = getStringValue(member.user?.firstName);
    const lastName = getStringValue(member.user?.lastName);
    if (!firstName && !lastName) return 'Nom non renseigné';
    return `${firstName} ${lastName}`.trim();
  };

  const getUserEmail = (member: Member): string => {
    return getStringValue(member.user?.email, 'Non renseigné');
  };

  const getUserPhone = (member: Member): string => {
    return getStringValue(member.user?.phone, 'Non renseigné');
  };

  const getUserRegion = (member: Member): string => {
    return getStringValue(member.user?.region, 'Non renseignée');
  };

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/members`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const membersList = Array.isArray(data) ? data : (data.data || []);
        setMembers(membersList);
      } else if (response.status === 401) {
        router.push('/login');
      } else {
        setError('Impossible de charger la liste des membres');
        setMembers([]);
      }
    } catch (err) {
      console.error('Erreur chargement membres:', err);
      setError('Erreur de connexion au serveur');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [token, API_URL, router]);

  useEffect(() => {
    if (token) {
      fetchMembers();
    }
  }, [token, fetchMembers]);

  // ============================================================
  // FONCTIONS D'AFFICHAGE
  // ============================================================

  const getStatusBadge = (status: string) => {
    const safeStatus = getStringValue(status, '').toLowerCase();
    
    switch(safeStatus) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            Actif
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Expiré
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
            {safeStatus || 'Inconnu'}
          </span>
        );
    }
  };

  const getTypeBadge = (type: string) => {
    const safeType = getStringValue(type, 'standard').toLowerCase();
    
    switch(safeType) {
      case 'premium':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Premium</span>;
      case 'standard':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Standard</span>;
      case 'student':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Étudiant</span>;
      case 'honorary':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">Honoraire</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{safeType}</span>;
    }
  };

  const formatDate = (dateString: string | undefined | null): string => {
    const safeDate = getStringValue(dateString);
    if (!safeDate) return 'Non définie';
    try {
      return new Date(safeDate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return safeDate;
    }
  };

  const formatCurrency = (amount: number): string => {
    const safeAmount = getNumberValue(amount);
    if (safeAmount === 0) return '0 Ar';
    return new Intl.NumberFormat('fr-FR').format(safeAmount) + ' Ar';
  };

  // ============================================================
  // FILTRES ET PAGINATION
  // ============================================================

  const filteredMembers = members.filter(member => {
    if (!member || !member.user) return false;
    
    const fullName = getFullName(member).toLowerCase();
    const memberNumber = getMemberNumber(member).toLowerCase();
    const email = getUserEmail(member).toLowerCase();
    const search = getStringValue(searchTerm).toLowerCase();
    
    const matchesSearch = search === '' || 
      fullName.includes(search) || 
      memberNumber.includes(search) || 
      email.includes(search);
    
    const memberStatus = getStringValue(member.status, '').toLowerCase();
    const matchesStatus = filterStatus === 'all' || memberStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const stats: MemberStats = {
    total: members.length,
    active: members.filter(m => getStringValue(m.status, '').toLowerCase() === 'active').length,
    expired: members.filter(m => getStringValue(m.status, '').toLowerCase() === 'expired').length,
    pending: members.filter(m => getStringValue(m.status, '').toLowerCase() === 'pending').length,
    totalRevenue: members
      .filter(m => getStringValue(m.status, '').toLowerCase() === 'active')
      .reduce((sum, m) => sum + getAmountPaid(m), 0)
  };

  // ============================================================
  // EXPORT CSV
  // ============================================================

  const exportToCSV = async () => {
    setExporting(true);
    try {
      const headers = ['N° Membre', 'Nom complet', 'Email', 'Téléphone', 'Type', 'Statut', 'Montant', 'Date début', 'Date fin', 'Région'];
      const rows = members.map(member => [
        getMemberNumber(member),
        getFullName(member),
        getUserEmail(member),
        getUserPhone(member),
        getMembershipType(member),
        getStringValue(member.status, ''),
        getAmountPaid(member).toString(),
        formatDate(getStartDate(member)),
        formatDate(getEndDate(member)),
        getUserRegion(member)
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', `membres_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur export:', err);
      setError('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  // ============================================================
  // RENDU
  // ============================================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-500">Chargement des membres...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ==================== EN-TÊTE ==================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Membres</h1>
          </div>
          <p className="text-gray-500 text-sm">Gérez les adhésions et cartes membres</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchMembers} 
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <Link 
            href="/dashboard/members/new" 
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <UserPlus className="w-4 h-4" />
            Nouveau membre
          </Link>
          <button 
            onClick={exportToCSV}
            disabled={exporting || members.length === 0}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Export...' : 'Exporter'}
          </button>
        </div>
      </div>

      {/* ==================== MESSAGE D'ERREUR ==================== */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* ==================== STATISTIQUES ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total membres</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Actifs</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Expirés</p>
          <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">En attente</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Revenus annuels</p>
          <p className="text-lg font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</p>
        </div>
      </div>

      {/* ==================== FILTRES ==================== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou numéro de membre..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={filterStatus} 
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="expired">Expirés</option>
              <option value="pending">En attente</option>
            </select>
          </div>
        </div>
      </div>

      {/* ==================== TABLEAU DES MEMBRES ==================== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° membre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Région</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>Aucun membre trouvé</p>
                    <p className="text-sm text-gray-400 mt-1">Modifiez vos critères de recherche</p>
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-blue-600 font-medium">
                        {getMemberNumber(member) || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{getFullName(member)}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {getUserEmail(member)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {getUserPhone(member)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getTypeBadge(getMembershipType(member))}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {getUserRegion(member)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      {formatCurrency(getAmountPaid(member))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(member.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(getEndDate(member))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link 
                        href={`/dashboard/members/${member.id}`}
                        className="inline-flex items-center justify-center p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== PAGINATION ==================== */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {filteredMembers.length > 0 ? (
              <>{(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredMembers.length)} sur {filteredMembers.length} membres</>
            ) : (
              '0 membre'
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div className="flex items-center px-3 py-1 text-sm text-gray-600">
              Page {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}