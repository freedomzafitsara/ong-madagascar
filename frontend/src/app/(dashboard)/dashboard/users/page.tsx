'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, Search, Shield, UserCog, User, CheckCircle, 
  XCircle, Loader2, RefreshCw, Eye, Edit, Trash2,
  ChevronLeft, ChevronRight, Mail, Phone, MapPin,
  Heart, Handshake, Crown, Star
} from 'lucide-react';

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
  const { user: currentUser, hasRole, token } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const itemsPerPage = 10;

  // Vérifier que l'utilisateur est super_admin
  if (!hasRole('super_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Accès non autorisé</h1>
          <p className="text-gray-500 mt-2">Vous n'avez pas les droits pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4001/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (id: string, newRole: string) => {
    if (!confirm(`Changer le rôle de cet utilisateur ?`)) return;
    
    try {
      const response = await fetch(`http://localhost:4001/auth/users/${id}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Rôle mis à jour avec succès' });
        fetchUsers();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Erreur' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur réseau' });
    }
  };

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:4001/auth/users/${id}/toggle-status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: `Utilisateur ${currentStatus ? 'désactivé' : 'activé'} avec succès` });
        fetchUsers();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur réseau' });
    }
  };

  const deleteUser = async (id: string, userName: string) => {
    if (!confirm(`Supprimer définitivement ${userName} ? Cette action est irréversible.`)) return;
    
    try {
      const response = await fetch(`http://localhost:4001/auth/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: `${userName} a été supprimé` });
        fetchUsers();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur réseau' });
    }
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'super_admin': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'staff': return <UserCog className="w-4 h-4 text-green-600" />;
      case 'member': return <User className="w-4 h-4 text-cyan-600" />;
      case 'volunteer': return <Heart className="w-4 h-4 text-red-500" />;
      case 'partner': return <Handshake className="w-4 h-4 text-purple-600" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      staff: 'Staff',
      member: 'Membre',
      volunteer: 'Bénévole',
      partner: 'Partenaire',
      visitor: 'Visiteur',
    };
    return labels[role] || role;
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const stats = {
    total: users.length,
    super_admin: users.filter(u => u.role === 'super_admin').length,
    admin: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => u.role === 'staff').length,
    member: users.filter(u => u.role === 'member').length,
    volunteer: users.filter(u => u.role === 'volunteer').length,
    partner: users.filter(u => u.role === 'partner').length,
    visitor: users.filter(u => u.role === 'visitor').length,
    active: users.filter(u => u.isActive).length,
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
      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* En-tête */}
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

      {/* Statistiques des rôles */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard label="Total" value={stats.total} color="gray" />
        <StatCard label="Super Admin" value={stats.super_admin} color="yellow" />
        <StatCard label="Admin" value={stats.admin} color="blue" />
        <StatCard label="Staff" value={stats.staff} color="green" />
        <StatCard label="Membres" value={stats.member} color="cyan" />
        <StatCard label="Bénévoles" value={stats.volunteer} color="red" />
        <StatCard label="Partenaires" value={stats.partner} color="purple" />
        <StatCard label="Actifs" value={stats.active} color="green" />
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

      {/* Tableau des utilisateurs */}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernière connexion</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {getRoleIcon(user.role)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-400">{user.phone || 'Pas de téléphone'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <select 
                      value={user.role} 
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
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
                    <button
                      onClick={() => toggleUserStatus(user.id, user.isActive)}
                      className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                      className="p-1 text-gray-500 hover:text-red-600 transition"
                      disabled={user.role === 'super_admin'}
                    >
                      <Trash2 className="w-4 h-4" />
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

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    cyan: 'bg-cyan-100 text-cyan-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 text-center">
      <p className={`text-xl font-bold ${colors[color]}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}