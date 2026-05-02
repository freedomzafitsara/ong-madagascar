'use client'

"use client";

import { useState, useEffect } from 'react';
import { userService } from '@/services/adminService';
import { User } from '@/types';
import { ImageUpload } from '@/components/ui/ImageUpload';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface UsersManagementProps {
  isAdmin: boolean;
}

export function UsersManagement({ isAdmin }: UsersManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      try {
        await userService.delete(id);
        toast.success('Utilisateur supprimé avec succès');
        fetchUsers();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await userService.toggleStatus(id, !currentStatus);
      toast.success(`Utilisateur ${!currentStatus ? 'activé' : 'désactivé'} avec succès`);
      fetchUsers();
    } catch (error) {
      toast.error('Erreur lors du changement de statut');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-700',
      manager: 'bg-orange-100 text-orange-700',
      staff: 'bg-blue-100 text-blue-700',
      viewer: 'bg-gray-100 text-gray-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrateur',
      manager: 'Responsable',
      staff: 'Personnel',
      viewer: 'Observateur',
    };
    return labels[role] || role;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-marine-900">Gestion des utilisateurs</h2>
          <p className="text-sm text-gray-500 mt-1">Gérez les comptes, les rôles et les photos de profil</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingUser(null);
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-gold-500 to-gold-600 text-marine-900 px-4 py-2 rounded-lg hover:shadow-lg transition flex items-center gap-2"
          >
            <span>+</span> Nouvel utilisateur
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
        >
          <option value="all">Tous les rôles</option>
          <option value="admin">Administrateurs</option>
          <option value="manager">Responsables</option>
          <option value="staff">Personnel</option>
          <option value="viewer">Observateurs</option>
        </select>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{users.length}</p>
          <p className="text-xs text-blue-600">Total</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-700">{users.filter(u => u.role === 'admin').length}</p>
          <p className="text-xs text-red-600">Administrateurs</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{users.filter(u => u.isActive).length}</p>
          <p className="text-xs text-green-600">Actifs</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-700">{users.filter(u => u.avatar).length}</p>
          <p className="text-xs text-orange-600">Photos de profil</p>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Utilisateur</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Rôle</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Statut</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Créé le</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <AnimatePresence>
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-marine-500 to-marine-600 flex items-center justify-center text-white font-semibold overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{user.firstName[0]}{user.lastName[0]}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.firstName} {user.lastName}</p>
                        {user.phone && <p className="text-xs text-gray-500">{user.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowModal(true);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-800 transition"
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                            className={`p-1 transition ${user.isActive ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                            title={user.isActive ? 'Désactiver' : 'Activer'}
                          >
                            {user.isActive ? '🔒' : '🔓'}
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1 text-red-600 hover:text-red-800 transition"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun utilisateur trouvé
          </div>
        )}
      </div>

      {/* Modal CRUD avec upload d'image */}
      {showModal && (
        <UserModal
          user={editingUser}
          isAdmin={isAdmin}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}

// Modal de création/modification avec upload d'image
function UserModal({ user, isAdmin, onClose, onSuccess }: { user: User | null; isAdmin: boolean; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'staff',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);

  const handleImageUpload = (file: File, preview: string) => {
    setAvatarPreview(preview);
    // Simuler l'enregistrement de l'image (à connecter avec l'API)
    setFormData({ ...formData, avatar: preview });
  };

  const handleImageRemove = () => {
    setAvatarPreview(null);
    setFormData({ ...formData, avatar: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (user) {
        await userService.update(user.id, formData);
        toast.success('Utilisateur modifié avec succès');
      } else {
        if (!formData.password) {
          toast.error('Mot de passe requis');
          setIsSubmitting(false);
          return;
        }
        await userService.create(formData as any);
        toast.success('Utilisateur créé avec succès');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-marine-900">
            {user ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo de profil */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-marine-500 to-marine-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{formData.firstName[0] || '?'}{formData.lastName[0] || '?'}</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-gold-600 transition">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setAvatarPreview(reader.result as string);
                        setFormData({ ...formData, avatar: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <span className="text-white text-xs">📷</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="Prénom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="Nom"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              placeholder="email@organisation.org"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              placeholder="+261 34 12 345 67"
            />
          </div>

          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
            </div>
          )}

          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="admin">Administrateur</option>
                <option value="manager">Responsable</option>
                <option value="staff">Personnel</option>
                <option value="viewer">Observateur</option>
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-marine-900 rounded-lg hover:shadow-lg disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Enregistrement...' : user ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

