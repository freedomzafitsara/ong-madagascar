'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, Search, Shield, UserCog, User, CheckCircle, 
  XCircle, Loader2, RefreshCw, Eye, Edit, Trash2,
  ChevronLeft, ChevronRight, Mail, Phone, MapPin,
  Heart, Handshake  // ✅ Ajout des icônes manquantes
} from 'lucide-react';
import Link from 'next/link';

interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  region: string;
  phone: string;
  lastLogin: string;
  createdAt: string;
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4001/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        // Données de démonstration - 7 rôles
        setUsers([
          { id: '1', email: 'admin@ymad.mg', firstName: 'Super', lastName: 'Admin', role: 'super_admin', isActive: true, region: 'Analamanga', phone: '0321234567', lastLogin: '2025-05-07T10:00:00Z', createdAt: '2025-01-01' },
          { id: '2', email: 'admin@y-mad.mg', firstName: 'Admin', lastName: 'User', role: 'admin', isActive: true, region: 'Analamanga', phone: '0321234568', lastLogin: '2025-05-06T15:30:00Z', createdAt: '2025-01-15' },
          { id: '3', email: 'staff@ymad.mg', firstName: 'Staff', lastName: 'User', role: 'staff', isActive: true, region: 'Diana', phone: '0321234569', lastLogin: '2025-05-05T09:00:00Z', createdAt: '2025-02-01' },
          { id: '4', email: 'member@ymad.mg', firstName: 'Jean', lastName: 'RAKOTO', role: 'member', isActive: true, region: 'Vakinankaratra', phone: '0331234567', lastLogin: '2025-05-04T14:00:00Z', createdAt: '2025-02-15' },
          { id: '5', email: 'volunteer@ymad.mg', firstName: 'Marie', lastName: 'RANDRIAN', role: 'volunteer', isActive: true, region: 'Haute Matsiatra', phone: '0341234567', lastLogin: '2025-05-03T11:00:00Z', createdAt: '2025-03-01' },
          { id: '6', email: 'partner@ymad.mg', firstName: 'Entreprise', lastName: 'XYZ', role: 'partner', isActive: true, region: 'Analamanga', phone: '0321234570', lastLogin: '2025-05-02T10:00:00Z', createdAt: '2025-03-15' },
          { id: '7', email: 'visitor@ymad.mg', firstName: 'Visitor', lastName: 'Test', role: 'visitor', isActive: true, region: 'Atsimo-Andrefana', phone: '0321234571', lastLogin: '2025-05-01T09:00:00Z', createdAt: '2025-04-01' },
        ]);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (id: string, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:4001/auth/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      fetchUsers();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
      super_admin: { icon: <Shield className="w-3 h-3" />, label: 'Super Admin', className: 'bg-blue-100 text-blue-700' },
      admin: { icon: <UserCog className="w-3 h-3" />, label: 'Admin', className: 'bg-gray-100 text-gray-700' },
      staff: { icon: <UserCog className="w-3 h-3" />, label: 'Staff', className: 'bg-gray-100 text-gray-700' },
      member: { icon: <User className="w-3 h-3" />, label: 'Membre', className: 'bg-gray-100 text-gray-700' },
      volunteer: { icon: <Heart className="w-3 h-3" />, label: 'Bénévole', className: 'bg-gray-100 text-gray-700' },
      partner: { icon: <Handshake className="w-3 h-3" />, label: 'Partenaire', className: 'bg-gray-100 text-gray-700' },
      visitor: { icon: <Eye className="w-3 h-3" />, label: 'Visiteur', className: 'bg-gray-100 text-gray-700' },
    };
    const config = roles[role] || roles.visitor;
    return <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${config.className}`}>{config.icon}{config.label}</span>;
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des utilisateurs</h1>
          <p className="text-gray-500 text-sm">Gérez les comptes et permissions (7 rôles disponibles)</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Tous les rôles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="member">Membre</option>
            <option value="volunteer">Bénévole</option>
            <option value="partner">Partenaire</option>
            <option value="visitor">Visiteur</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Région</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{user.firstName} {user.lastName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <select 
                      value={user.role} 
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                      disabled={user.role === 'super_admin' && currentUser?.role !== 'super_admin'}
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                      <option value="member">Membre</option>
                      <option value="volunteer">Bénévole</option>
                      <option value="partner">Partenaire</option>
                      <option value="visitor">Visiteur</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{user.region || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${user.isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1 text-gray-500 hover:text-blue-600">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}