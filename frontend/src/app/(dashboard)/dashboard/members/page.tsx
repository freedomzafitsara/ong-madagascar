'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, Search, Plus, Download, RefreshCw, Loader2,
  Eye, Mail, MapPin, CheckCircle, XCircle, Clock,
  ChevronLeft, ChevronRight, UserPlus, CreditCard
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
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4001/members', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
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
        ]);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Actif</span>;
    if (status === 'expired') return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 flex items-center gap-1"><XCircle className="w-3 h-3" />Expiré</span>;
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" />En attente</span>;
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      premium: 'bg-blue-100 text-blue-700',
      standard: 'bg-gray-100 text-gray-700',
      student: 'bg-gray-100 text-gray-700',
    };
    return <span className={`px-2 py-1 text-xs rounded-full ${types[type] || 'bg-gray-100 text-gray-700'}`}>{type}</span>;
  };

  const filteredMembers = members.filter(m => 
    `${m.user.firstName} ${m.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.member_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

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
            <span>Actualiser</span>
          </button>
          <Link href="/dashboard/members/new" className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <UserPlus className="w-4 h-4" />
            <span>Nouveau membre</span>
          </Link>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 text-gray-600" />
            <span>Exporter</span>
          </button>
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
              {paginatedMembers.map((member) => (
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
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
    </div>
  );
}