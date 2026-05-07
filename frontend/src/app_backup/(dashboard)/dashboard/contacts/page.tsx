'use client'

"use client";

import { useState, useEffect } from 'react';
import { contactService } from '@/services/adminService';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import toast from 'react-hot-toast';

export default function DashboardContactsPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const data = await contactService.getAll();
      setMessages(data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await contactService.updateStatus(id, status);
      toast.success('Statut mis à jour');
      fetchMessages();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-red-100 text-red-700',
      read: 'bg-yellow-100 text-yellow-700',
      replied: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: 'Nouveau',
      read: 'Lu',
      replied: 'Répondu',
      closed: 'Fermé',
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-marine-900">Messages de contact</h1>
          <p className="text-gray-500 mt-1">Gérez les messages reçus via le formulaire de contact</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Expéditeur</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Sujet</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {messages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{message.name}</p>
                        <p className="text-xs text-gray-500">{message.email}</p>
                        {message.phone && <p className="text-xs text-gray-400">{message.phone}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{message.subject}</td>
                    <td className="px-4 py-3">
                      <select
                        value={message.status}
                        onChange={(e) => handleUpdateStatus(message.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-semibold border-0 focus:ring-2 focus:ring-gold-500 ${getStatusBadge(message.status)}`}
                      >
                        <option value="new">Nouveau</option>
                        <option value="read">Lu</option>
                        <option value="replied">Répondu</option>
                        <option value="closed">Fermé</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          alert(`Message de ${message.name}:\n\n${message.message}`);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {messages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun message reçu
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

