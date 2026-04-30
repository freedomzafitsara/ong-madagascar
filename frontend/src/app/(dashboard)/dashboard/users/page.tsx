// src/app/dashboard/users/page.tsx
'use client';

import { useState } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'staff' | 'volunteer' | 'reader';
  status: 'active' | 'inactive';
  lastLogin: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([
    { id: '1', email: 'admin@ong-madagascar.mg', firstName: 'Admin', lastName: 'ONG', role: 'admin', status: 'active', lastLogin: '15/04/2025' },
    { id: '2', email: 'staff@ong-madagascar.mg', firstName: 'Staff', lastName: 'ONG', role: 'staff', status: 'active', lastLogin: '14/04/2025' },
    { id: '3', email: 'volunteer@ong-madagascar.mg', firstName: 'Jean', lastName: 'Rakoto', role: 'volunteer', status: 'active', lastLogin: '10/04/2025' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    showMessage('Statut utilisateur modifié');
  };

  const deleteUser = (id: string) => {
    if (confirm('Supprimer cet utilisateur ?')) {
      setUsers(users.filter(u => u.id !== id));
      showMessage('Utilisateur supprimé');
    }
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'staff': return 'bg-blue-100 text-blue-700';
      case 'volunteer': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'admin': return 'Administrateur';
      case 'staff': return 'Staff ONG';
      case 'volunteer': return 'Bénévole';
      default: return 'Lecteur';
    }
  };

  return (
    <div className="p-6">
      {message && <div className="fixed top-20 right-4 z-50 px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg">✓ {message}</div>}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-marine-600">Gestion des utilisateurs</h1>
          <p className="text-gray-500 mt-1">Gérez les comptes et les rôles</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-marine-600 text-white px-4 py-2 rounded-lg hover:bg-marine-700">+ Nouvel utilisateur</button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr><th className="p-4 text-left">Nom</th><th className="p-4 text-left">Email</th><th className="p-4 text-left">Rôle</th><th className="p-4 text-left">Statut</th><th className="p-4 text-left">Dernière connexion</th><th className="p-4 text-left">Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{u.firstName} {u.lastName}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4"><span className={`text-xs px-2 py-1 rounded ${getRoleColor(u.role)}`}>{getRoleLabel(u.role)}</span></td>
                <td className="p-4"><button onClick={() => toggleUserStatus(u.id)} className={`text-xs px-2 py-1 rounded ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status === 'active' ? 'Actif' : 'Inactif'}</button></td>
                <td className="p-4 text-sm">{u.lastLogin}</td>
                <td className="p-4"><button onClick={() => deleteUser(u.id)} className="text-red-500">🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-marine-600">Nouvel utilisateur</h2>
              <button onClick={() => setShowForm(false)} className="text-2xl">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <input type="text" placeholder="Prénom" className="w-full p-2 border rounded-lg" />
              <input type="text" placeholder="Nom" className="w-full p-2 border rounded-lg" />
              <input type="email" placeholder="Email" className="w-full p-2 border rounded-lg" />
              <select className="w-full p-2 border rounded-lg"><option>Bénévole</option><option>Staff ONG</option><option>Administrateur</option></select>
            </div>
            <div className="p-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
              <button className="px-5 py-2 bg-marine-600 text-white rounded-lg">Créer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
