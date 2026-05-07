// src/app/(dashboard)/dashboard/donations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Search, CheckCircle, Download, Eye, Trash2, 
  TrendingUp, Heart, X, AlertCircle, DollarSign, 
  Calendar, User, Mail, FileText, Clock
} from 'lucide-react';

interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  project: string;
  date: string;
  status: 'confirmed' | 'pending' | 'failed';
  receiptNumber: string;
  paymentMethod?: 'mvola' | 'orange_money' | 'bank' | 'cash';
  message?: string;
}

const initialDonations: Donation[] = [
  { 
    id: '1', 
    donorName: 'Jean Rakoto', 
    donorEmail: 'jean@example.com', 
    amount: 50000, 
    project: 'Éducation pour tous', 
    date: new Date().toLocaleDateString('fr-FR'), 
    status: 'confirmed', 
    receiptNumber: 'REC-001',
    paymentMethod: 'mvola'
  },
  { 
    id: '2', 
    donorName: 'Marie Andria', 
    donorEmail: 'marie@example.com', 
    amount: 100000, 
    project: 'Reforestation Madagascar', 
    date: new Date(Date.now() - 86400000).toLocaleDateString('fr-FR'), 
    status: 'confirmed', 
    receiptNumber: 'REC-002',
    paymentMethod: 'orange_money'
  },
  { 
    id: '3', 
    donorName: 'Anonyme', 
    donorEmail: 'anonyme@example.com', 
    amount: 25000, 
    project: 'Accès à l\'eau potable', 
    date: new Date(Date.now() - 172800000).toLocaleDateString('fr-FR'), 
    status: 'pending', 
    receiptNumber: '',
    paymentMethod: 'bank'
  },
  { 
    id: '4', 
    donorName: 'Firaisankina Entreprise', 
    donorEmail: 'contact@firaisankina.mg', 
    amount: 500000, 
    project: 'Formation professionnelle', 
    date: new Date(Date.now() - 259200000).toLocaleDateString('fr-FR'), 
    status: 'confirmed', 
    receiptNumber: 'REC-003',
    paymentMethod: 'bank',
    message: 'Soutien au développement des jeunes'
  },
];

export default function DashboardDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('ymad_donations');
      if (stored) {
        setDonations(JSON.parse(stored));
      } else {
        setDonations(initialDonations);
        localStorage.setItem('ymad_donations', JSON.stringify(initialDonations));
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      showMessage('Erreur lors du chargement des dons', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveDonations = (data: Donation[]) => {
    localStorage.setItem('ymad_donations', JSON.stringify(data));
    setDonations(data);
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleConfirm = (id: string) => {
    const updatedDonations: Donation[] = donations.map((d): Donation => {
      if (d.id === id) {
        return { 
          ...d, 
          status: 'confirmed' as const,
          receiptNumber: `REC-${Date.now()}` 
        };
      }
      return d;
    });
    saveDonations(updatedDonations);
    showMessage('Don confirmé et reçu généré', 'success');
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce don ?')) {
      const updatedDonations = donations.filter(d => d.id !== id);
      saveDonations(updatedDonations);
      showMessage('Don supprimé avec succès', 'success');
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Donateur', 'Email', 'Montant (MGA)', 'Projet', 'Date', 'Statut', 'Reçu', 'Méthode'];
    const rows = filtered.map(d => [
      d.id, d.donorName, d.donorEmail, d.amount, d.project, d.date, 
      d.status === 'confirmed' ? 'Confirmé' : d.status === 'pending' ? 'En attente' : 'Échoué',
      d.receiptNumber || '-', d.paymentMethod || '-'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dons_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('Export CSV réussi', 'success');
  };

  const filtered = donations.filter(d => 
    (d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     d.donorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
     d.project.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedStatus || d.status === selectedStatus) &&
    (!selectedPaymentMethod || d.paymentMethod === selectedPaymentMethod)
  );

  const totalAmount = filtered.reduce((sum, d) => sum + d.amount, 0);
  const confirmedAmount = filtered.filter(d => d.status === 'confirmed').reduce((sum, d) => sum + d.amount, 0);
  const pendingCount = filtered.filter(d => d.status === 'pending').length;

  // ✅ CORRECTION: Ajout d'une valeur par défaut pour éviter l'erreur
  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmé' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En attente' },
      failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Échoué' }
    };
    
    // ✅ Valeur par défaut si le statut n'existe pas
    const defaultConfig = { bg: 'bg-gray-100', text: 'text-gray-700', label: status || 'Inconnu' };
    const c = config[status] || defaultConfig;
    
    return <span className={`text-xs px-2 py-1 rounded-full ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  const getPaymentMethodLabel = (method?: string) => {
    const methods: Record<string, string> = {
      mvola: '📱 MVola',
      orange_money: '📱 Orange Money',
      bank: '🏦 Virement bancaire',
      cash: '💵 Espèce'
    };
    return methods[method || ''] || '💳 Autre';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des dons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Message notification */}
      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Heart className="w-7 h-7 text-blue-600" />
            Gestion des dons
          </h1>
          <p className="text-gray-500 mt-1">Suivez et gérez tous les dons reçus</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Download size={16} />
          Exporter CSV
        </button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalAmount.toLocaleString()} MGA</p>
          <p className="text-gray-500 text-sm">Total des dons</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{confirmedAmount.toLocaleString()} MGA</p>
          <p className="text-gray-500 text-sm">Dons confirmés</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
          <p className="text-gray-500 text-sm">En attente de confirmation</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par donateur, email ou projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">📊 Tous statuts</option>
            <option value="confirmed">✅ Confirmés</option>
            <option value="pending">⏳ En attente</option>
            <option value="failed">❌ Échoués</option>
          </select>
          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">💳 Tous moyens</option>
            <option value="mvola">📱 MVola</option>
            <option value="orange_money">📱 Orange Money</option>
            <option value="bank">🏦 Virement bancaire</option>
            <option value="cash">💵 Espèce</option>
          </select>
          {(searchTerm || selectedStatus || selectedPaymentMethod) && (
            <button
              onClick={() => { setSearchTerm(''); setSelectedStatus(''); setSelectedPaymentMethod(''); }}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Liste des dons */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun don trouvé</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Donateur</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Montant</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Projet</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Date</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Méthode</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Statut</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((donation) => (
                  <tr key={donation.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-800">{donation.donorName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {donation.donorEmail}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-blue-600">{donation.amount.toLocaleString()} MGA</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-600">{donation.project}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {donation.date}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-600">{getPaymentMethodLabel(donation.paymentMethod)}</p>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(donation.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {donation.status === 'pending' && (
                          <button
                            onClick={() => handleConfirm(donation.id)}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                            title="Confirmer le don"
                          >
                            Confirmer
                          </button>
                        )}
                        <button
                          onClick={() => { setSelectedDonation(donation); setModalOpen(true); }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Voir détails"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(donation.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {filtered.length} don{filtered.length > 1 ? 's' : ''} • Total: {totalAmount.toLocaleString()} MGA
            </p>
            <p className="text-sm text-gray-400">
              {donations.filter(d => d.status === 'confirmed').length} dons confirmés
            </p>
          </div>
        </div>
      )}

      {/* Modal détails */}
      {modalOpen && selectedDonation && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Heart className="w-5 h-5 text-blue-600" />
                Détails du don
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Donateur</p>
                  <p className="font-medium">{selectedDonation.donorName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm">{selectedDonation.donorEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Montant</p>
                  <p className="text-xl font-bold text-blue-600">{selectedDonation.amount.toLocaleString()} MGA</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Projet</p>
                  <p className="text-sm">{selectedDonation.project}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm">{selectedDonation.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Numéro de reçu</p>
                  <p className="text-sm font-mono">{selectedDonation.receiptNumber || 'Non généré'}</p>
                </div>
              </div>
              {selectedDonation.message && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Message du donateur</p>
                  <p className="text-sm italic">"{selectedDonation.message}"</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}