'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, Search, Plus, Download, RefreshCw, Loader2,
  Eye, Mail, MapPin, CheckCircle, XCircle, Clock,
  ChevronLeft, ChevronRight, UserPlus, CreditCard, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface Member {
  id: string;
  member_number: string;
  membership_type: string;
  status: string;
  amount_paid: number;
  start_date: string;
  end_date: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    region: string;
  };
}

export default function MembersPage() {
  const { hasRole, token } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Vérification des droits
  if (!hasRole('super_admin') && !hasRole('admin') && !hasRole('staff')) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Accès non autorisé</h1>
          <p className="text-gray-500 mt-2">Vous n'avez pas les droits pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4001/members', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        // ✅ S'assurer que data est un tableau
        setMembers(Array.isArray(data) ? data : []);
      } else {
        // Données de démonstration
        setMembers([
          {
            id: '1',
            member_number: 'YM-2025-0001',
            membership_type: 'premium',
            status: 'active',
            amount_paid: 50000,
            start_date: '2025-01-01',
            end_date: '2025-12-31',
            user: { firstName: 'Jean', lastName: 'RAKOTO', email: 'jean@rakoto.mg', phone: '0321234567', region: 'Analamanga' }
          },
          {
            id: '2',
            member_number: 'YM-2025-0002',
            membership_type: 'standard',
            status: 'active',
            amount_paid: 25000,
            start_date: '2025-02-15',
            end_date: '2025-12-31',
            user: { firstName: 'Marie', lastName: 'RANDRIAN', email: 'marie@randrian.mg', phone: '0331234567', region: 'Diana' }
          },
          {
            id: '3',
            member_number: 'YM-2025-0003',
            membership_type: 'premium',
            status: 'expired',
            amount_paid: 50000,
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            user: { firstName: 'Toky', lastName: 'ANDRIAMANGA', email: 'toky@andria.mg', phone: '0341234567', region: 'Vakinankaratra' }
          },
          {
            id: '4',
            member_number: 'YM-2025-0004',
            membership_type: 'student',
            status: 'active',
            amount_paid: 15000,
            start_date: '2025-03-01',
            end_date: '2025-12-31',
            user: { firstName: 'Lanto', lastName: 'RABE', email: 'lanto@rabe.mg', phone: '0381234567', region: 'Haute Matsiatra' }
          },
          {
            id: '5',
            member_number: 'YM-2025-0005',
            membership_type: 'standard',
            status: 'pending',
            amount_paid: 25000,
            start_date: '2025-05-01',
            end_date: '2025-12-31',
            user: { firstName: 'Hery', lastName: 'RAZAFY', email: 'hery@razafy.mg', phone: '0321234568', region: 'Atsimo-Andrefana' }
          },
        ]);
      }
    } catch (error) {
      console.error('Erreur chargement membres:', error);
      setError('Impossible de charger la liste des membres');
      // Données de secours
      setMembers([
        {
          id: '1',
          member_number: 'YM-2025-0001',
          membership_type: 'premium',
          status: 'active',
          amount_paid: 50000,
          start_date: '2025-01-01',
          end_date: '2025-12-31',
          user: { firstName: 'Jean', lastName: 'RAKOTO', email: 'jean@rakoto.mg', phone: '0321234567', region: 'Analamanga' }
        },
        {
          id: '2',
          member_number: 'YM-2025-0002',
          membership_type: 'standard',
          status: 'active',
          amount_paid: 25000,
          start_date: '2025-02-15',
          end_date: '2025-12-31',
          user: { firstName: 'Marie', lastName: 'RANDRIAN', email: 'marie@randrian.mg', phone: '0331234567', region: 'Diana' }
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Actif</span>;
      case 'expired':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 flex items-center gap-1"><XCircle className="w-3 h-3" />Expiré</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1"><Clock className="w-3 h-3" />En attente</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'premium':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Premium</span>;
      case 'standard':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Standard</span>;
      case 'student':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Étudiant</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{type}</span>;
    }
  };

  // ✅ Vérification que members est un tableau avant filter
  const filteredMembers = Array.isArray(members) ? members.filter(m => {
    if (!m || !m.user) return false;
    const fullName = `${m.user.firstName || ''} ${m.user.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                          (m.member_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (m.user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) : [];

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const stats = {
    total: members.length,
    active: members.filter(m => m?.status === 'active').length,
    expired: members.filter(m => m?.status === 'expired').length,
    pending: members.filter(m => m?.status === 'pending').length,
    totalRevenue: members.filter(m => m?.status === 'active').reduce((sum, m) => sum + (m?.amount_paid || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Membres</h1>
          <p className="text-gray-500 text-sm">Gérez les adhésions et cartes membres</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchMembers} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 text-gray-600" />
            Actualiser
          </button>
          <Link href="/dashboard/members/new" className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <UserPlus className="w-4 h-4" />
            Nouveau membre
          </Link>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 text-gray-600" />
            Exporter
          </button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total membres</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Actifs</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Expirés</p>
          <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Revenus</p>
          <p className="text-lg font-bold text-blue-600">{stats.totalRevenue.toLocaleString()} Ar</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou numéro de membre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="expired">Expirés</option>
            <option value="pending">En attente</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° membre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Membre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Région</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Aucun membre trouvé
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm text-blue-600">{member.member_number}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{member.user.firstName} {member.user.lastName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{member.user.email}</td>
                    <td className="px-4 py-3">{getTypeBadge(member.membership_type)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{member.user.region}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{member.amount_paid.toLocaleString()} Ar</td>
                    <td className="px-4 py-3">{getStatusBadge(member.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(member.end_date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">
                      <button className="p-1 text-gray-500 hover:text-blue-600">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredMembers.length)} sur {filteredMembers.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}