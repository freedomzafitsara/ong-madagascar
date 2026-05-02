"use client";

import { useState, useEffect } from 'react';
import { donationService } from '@/services/adminService';
import toast from 'react-hot-toast';

export function DonationManagement() {
  const [donations, setDonations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDonations = async () => {
    try {
      const data = await donationService.getAll();
      setDonations(data.data || []);
    } catch (error) {
      toast.error('Erreur chargement dons');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  if (isLoading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-marine-900 mb-6">Gestion des dons</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Donateur</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Montant</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Statut</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {donations.map((donation) => (
              <tr key={donation.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-800">{donation.donorName || 'Anonyme'}</td>
                <td className="px-4 py-3 font-semibold text-marine-700">{donation.amount?.toLocaleString()} MGA</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${donation.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {donation.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-red-600 hover:text-red-800">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
