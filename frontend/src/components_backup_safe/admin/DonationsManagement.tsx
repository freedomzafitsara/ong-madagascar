'use client'

"use client";

import { useState, useEffect } from 'react';
import { donationService } from '@/services/adminService';
import { Donation } from '@/types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export function DonationsManagement() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const data = await donationService.getAll();
      setDonations(data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des dons');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce don ?')) {
      try {
        await donationService.delete(id);
        toast.success('Don supprimé avec succès');
        fetchDonations();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await donationService.updateStatus(id, status);
      toast.success(`Statut du don mis à jour : ${status === 'confirmed' ? 'Confirmé' : status === 'pending' ? 'En attente' : 'Échoué'}`);
      fetchDonations();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          donation.donorEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || donation.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
      refunded: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirmed: 'Confirmé',
      pending: 'En attente',
      failed: 'Échoué',
      refunded: 'Remboursé',
    };
    return labels[status] || status;
  };

  const totalConfirmed = donations.filter(d => d.status === 'confirmed').reduce((sum, d) => sum + d.amount, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-marine-900">Gestion des dons</h2>
          <p className="text-sm text-gray-500 mt-1">Suivez et gérez tous les dons reçus</p>
        </div>
        <button
          onClick={() => {
            setEditingDonation(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-gold-500 to-gold-600 text-marine-900 px-4 py-2 rounded-lg hover:shadow-lg transition flex items-center gap-2"
        >
          <span>+</span> Nouveau don
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{totalConfirmed.toLocaleString()} MGA</p>
          <p className="text-xs text-green-600">Total collecté</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{donations.length}</p>
          <p className="text-xs text-blue-600">Total dons</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-700">{donations.filter(d => d.status === 'pending').length}</p>
          <p className="text-xs text-orange-600">En attente</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-purple-700">{donations.filter(d => d.isRecurring).length}</p>
          <p className="text-xs text-purple-600">Dons récurrents</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Rechercher un donateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="confirmed">Confirmés</option>
          <option value="pending">En attente</option>
          <option value="failed">Échoués</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Donateur</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Montant</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Statut</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <AnimatePresence>
              {filteredDonations.map((donation) => (
                <motion.tr
                  key={donation.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-800">{donation.donorName || 'Anonyme'}</p>
                      {donation.donorEmail && <p className="text-xs text-gray-500">{donation.donorEmail}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-marine-700">{donation.amount.toLocaleString()} MGA</td>
                  <td className="px-4 py-3">
                    <select
                      value={donation.status}
                      onChange={(e) => handleUpdateStatus(donation.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-semibold border-0 focus:ring-2 focus:ring-gold-500 ${getStatusBadge(donation.status)}`}
                    >
                      <option value="pending">En attente</option>
                      <option value="confirmed">Confirmé</option>
                      <option value="failed">Échoué</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(donation.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingDonation(donation);
                          setShowModal(true);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800 transition"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(donation.id)}
                        className="p-1 text-red-600 hover:text-red-800 transition"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filteredDonations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun don trouvé
          </div>
        )}
      </div>

      {showModal && (
        <DonationModal
          donation={editingDonation}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchDonations();
          }}
        />
      )}
    </div>
  );
}

// Modal de création/modification de don
function DonationModal({ donation, onClose, onSuccess }: { donation: Donation | null; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    donorName: donation?.donorName || '',
    donorEmail: donation?.donorEmail || '',
    donorPhone: donation?.donorPhone || '',
    amount: donation?.amount || 0,
    status: donation?.status || 'pending',
    isRecurring: donation?.isRecurring || false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (donation) {
        await donationService.updateStatus(donation.id, formData.status);
        toast.success('Don modifié avec succès');
      } else {
        await donationService.create(formData);
        toast.success('Don créé avec succès');
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
        className="bg-white rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-marine-900">
            {donation ? 'Modifier le don' : 'Ajouter un don'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du donateur</label>
            <input
              type="text"
              value={formData.donorName}
              onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              placeholder="Nom ou organisation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.donorEmail}
              onChange={(e) => setFormData({ ...formData, donorEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              placeholder="email@exemple.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (MGA) *</label>
            <input
              type="number"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="failed">Échoué</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="h-4 w-4 text-gold-500 focus:ring-gold-500 border-gray-300 rounded"
            />
            <label htmlFor="recurring" className="ml-2 text-sm text-gray-700">
              Don récurrent (mensuel)
            </label>
          </div>

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
              {isSubmitting ? 'Enregistrement...' : donation ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

