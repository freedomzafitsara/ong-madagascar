'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, CheckCircle, Download, Eye, Trash2, 
  TrendingUp, Heart, X, AlertCircle, DollarSign, 
  Calendar, User, Mail, FileText, Clock, RefreshCw,
  Loader2, CreditCard, Smartphone, Landmark, Wallet,
  ChevronLeft, ChevronRight, Filter, Receipt, MessageSquare,
  CheckSquare, Ban, RotateCcw, Phone, Building, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

interface Donation {
  id: string;
  donor_name: string;
  email: string;
  amount: number;
  project_name: string;
  project_id?: string;
  created_at: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  receipt_number: string;
  payment_method: 'mvola' | 'orange_money' | 'paypal' | 'bank' | 'cash';
  message?: string;
  notes?: string;
  user_id?: string;
}

// ============================================================
// SECTION 1 : COMPOSANT CARTE STATISTIQUE
// ============================================================

function StatCard({ label, value, icon: Icon, isBlue = false, suffix = '' }: { 
  label: string; 
  value: number | string; 
  icon: any; 
  isBlue?: boolean;
  suffix?: string;
}) {
  const bgClass = isBlue ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-700';
  const iconClass = isBlue ? 'text-white/80' : 'text-blue-600';
  const valueClass = isBlue ? 'text-white' : 'text-gray-800';
  const labelClass = isBlue ? 'text-white/80' : 'text-gray-500';

  return (
    <div className={`rounded-2xl p-5 transition-all duration-200 hover:shadow-lg ${bgClass}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isBlue ? 'bg-white/20' : 'bg-blue-50'}`}>
        <Icon className={`w-5 h-5 ${iconClass}`} />
      </div>
      <p className={`text-2xl font-bold ${valueClass}`}>{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</p>
      <p className={`text-xs font-medium mt-1 ${labelClass}`}>{label}</p>
    </div>
  );
}

// ============================================================
// SECTION 2 : COMPOSANT BADGE STATUT
// ============================================================

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: any; label: string }> = {
    completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Confirmé' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'En attente' },
    failed: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: 'Échoué' },
    refunded: { bg: 'bg-gray-100', text: 'text-gray-700', icon: RotateCcw, label: 'Remboursé' }
  };
  const c = config[status] || config.pending;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${c.bg} ${c.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {c.label}
    </span>
  );
}

// ============================================================
// SECTION 3 : COMPOSANT BADGE METHODE DE PAIEMENT
// ============================================================

function PaymentMethodBadge({ method }: { method: string }) {
  const config: Record<string, { bg: string; text: string; icon: any; label: string }> = {
    mvola: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Smartphone, label: 'MVola' },
    orange_money: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Smartphone, label: 'Orange Money' },
    paypal: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CreditCard, label: 'PayPal' },
    bank: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Landmark, label: 'Virement bancaire' },
    cash: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: Wallet, label: 'Espèces' }
  };
  const c = config[method] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: Wallet, label: 'Autre' };
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${c.bg} ${c.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {c.label}
    </span>
  );
}

// ============================================================
// SECTION 4 : COMPOSANT MODAL DETAIL DON
// ============================================================

function DonationDetailModal({ 
  donation, 
  onClose, 
  onUpdateStatus, 
  onDelete,
  formatDate,
  updating 
}: { 
  donation: Donation; 
  onClose: () => void; 
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  onDelete: (id: string, name: string) => Promise<void>;
  formatDate: (date: string) => string;
  updating: boolean;
}) {
  const [status, setStatus] = useState(donation.status);
  const [notes, setNotes] = useState(donation.notes || '');
  const [saving, setSaving] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    setStatus(newStatus as any);
    await onUpdateStatus(donation.id, newStatus);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (confirm(`Supprimer le don de ${donation.donor_name} ? Cette action est irréversible.`)) {
      await onDelete(donation.id, donation.donor_name);
      onClose();
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'paypal': return <CreditCard className="w-5 h-5 text-gray-400" />;
      case 'mvola': return <Smartphone className="w-5 h-5 text-gray-400" />;
      case 'orange_money': return <Phone className="w-5 h-5 text-gray-400" />;
      case 'bank': return <Landmark className="w-5 h-5 text-gray-400" />;
      default: return <Wallet className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPaymentLabel = (method: string) => {
    const labels: Record<string, string> = {
      mvola: 'MVola',
      orange_money: 'Orange Money',
      paypal: 'PayPal',
      bank: 'Virement bancaire',
      cash: 'Espèces'
    };
    return labels[method] || method;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* En-tête modal */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Détail du don</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">Reçu {donation.receipt_number || 'Non généré'}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDelete} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corps modal */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-200px)]">
          
          {/* Statut */}
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut du don</label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={saving || updating}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white w-full md:w-auto"
            >
              <option value="pending">En attente</option>
              <option value="completed">Confirmé</option>
              <option value="failed">Échoué</option>
              <option value="refunded">Remboursé</option>
            </select>
            {saving && <Loader2 className="w-4 h-4 animate-spin ml-2 inline" />}
          </div>

          {/* Informations donateur */}
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Informations donateur</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Nom complet</p>
                  <p className="font-medium text-gray-800">{donation.donor_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm text-gray-600">{donation.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations don */}
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Informations don</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Montant</p>
                  <p className="text-xl font-bold text-green-600">{donation.amount.toLocaleString()} MGA</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getPaymentIcon(donation.payment_method)}
                <div>
                  <p className="text-xs text-gray-400">Moyen de paiement</p>
                  <p className="text-sm text-gray-600">{getPaymentLabel(donation.payment_method)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Projet</p>
                  <p className="text-sm text-gray-600">{donation.project_name || 'Non spécifié'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Date du don</p>
                  <p className="text-sm text-gray-600">{formatDate(donation.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message donateur */}
          {donation.message && (
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Message du donateur</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600 italic">"{donation.message}"</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes admin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes internes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ajouter une note sur ce don..."
            />
          </div>
        </div>

        {/* Footer modal */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium">
            Fermer
          </button>
          {donation.status === 'pending' && (
            <button
              onClick={() => handleStatusChange('completed')}
              disabled={saving}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" /> Confirmer le don
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SECTION 5 : PAGE PRINCIPALE - GESTION DES DONS
// ============================================================

export default function DashboardDonationsPage() {
  const { token, user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
    monthlyAmount: 0,
  });
  const itemsPerPage = 10;

  const hasAccess = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff';

  // ============================================================
  // SECTION 6 : CHARGEMENT DES DONNEES
  // ============================================================

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/donations/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  }, [token]);

  const fetchDonations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      let url = `${API_URL}/donations?page=${currentPage}&limit=${itemsPerPage}`;
      if (selectedStatus) url += `&status=${selectedStatus}`;
      if (selectedPaymentMethod) url += `&paymentMethod=${selectedPaymentMethod}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDonations(data.data || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de chargement des dons');
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, selectedStatus, selectedPaymentMethod, searchTerm]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!hasAccess) {
      router.push('/dashboard');
      return;
    }
    if (token) {
      fetchStats();
      fetchDonations();
    }
  }, [isAuthenticated, hasAccess, token, router, fetchStats, fetchDonations]);

  // ============================================================
  // SECTION 7 : ACTIONS CRUD
  // ============================================================

  const updateDonationStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`${API_URL}/donations/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        toast.success(`Don ${status === 'completed' ? 'confirmé' : 'mis à jour'} avec succès`);
        await fetchDonations();
        await fetchStats();
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  const deleteDonation = async (id: string, name: string) => {
    try {
      const response = await fetch(`${API_URL}/donations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success(`Don de ${name} supprimé`);
        await fetchDonations();
        await fetchStats();
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const exportToCSV = async () => {
    try {
      const response = await fetch(`${API_URL}/donations/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dons_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Export CSV réussi');
      }
    } catch (error) {
      toast.error('Erreur lors de l export CSV');
    }
  };

  // ============================================================
  // SECTION 8 : UTILITAIRES
  // ============================================================

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch {
      return date;
    }
  };

  // ============================================================
  // SECTION 9 : RENDU CONDITIONNEL
  // ============================================================

  if (!isAuthenticated || !hasAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Accès non autorisé</h1>
          <p className="text-gray-500 mt-2">Vous n'avez pas les droits pour accéder à cette page.</p>
          <Link href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Chargement des dons...</p>
      </div>
    );
  }

  // ============================================================
  // SECTION 10 : RENDU PRINCIPAL
  // ============================================================

  return (
    <div className="space-y-6">
      
      {/* EN-TETE Y-Mad */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Gestion des dons</h1>
                <p className="text-blue-100 text-sm mt-0.5">
                  Suivez et gérez tous les dons reçus par l'association
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchDonations} className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition text-white">
              <RefreshCw className="w-4 h-4" /> Actualiser
            </button>
            <button onClick={exportToCSV} className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition text-white">
              <Download className="w-4 h-4" /> Exporter CSV
            </button>
          </div>
        </div>
      </div>

      {/* STATISTIQUES */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total dons" value={stats.total} icon={Heart} isBlue={true} />
        <StatCard label="Montant total" value={stats.totalAmount} icon={DollarSign} isBlue={false} suffix=" MGA" />
        <StatCard label="Ce mois" value={stats.monthlyAmount} icon={TrendingUp} isBlue={false} suffix=" MGA" />
        <StatCard label="Confirmés" value={stats.completed} icon={CheckCircle} isBlue={false} />
        <StatCard label="En attente" value={stats.pending} icon={Clock} isBlue={false} />
        <StatCard label="Échoués" value={stats.failed} icon={AlertCircle} isBlue={false} />
      </div>

      {/* FILTRES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="">Tous les statuts</option>
            <option value="completed">Confirmés</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoués</option>
          </select>
          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="">Tous les moyens</option>
            <option value="mvola">MVola</option>
            <option value="orange_money">Orange Money</option>
            <option value="paypal">PayPal</option>
            <option value="bank">Virement bancaire</option>
          </select>
        </div>
      </div>

      {/* TABLEAU DES DONS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Donateur</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Projet</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Méthode</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {donations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Heart className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">Aucun don trouvé</p>
                    </div>
                  </td>
                </tr>
              ) : (
                donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{donation.donor_name}</p>
                        <p className="text-xs text-gray-500">{donation.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-green-600">{donation.amount.toLocaleString()} MGA</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-600">{donation.project_name || '-'}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {formatDate(donation.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <PaymentMethodBadge method={donation.payment_method} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={donation.status} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => { setSelectedDonation(donation); setShowDetailModal(true); }}
                        className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg transition"
                        title="Voir les détails"
                      >
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

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Page <span className="font-semibold text-blue-600">{currentPage}</span> sur {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETAIL */}
      {showDetailModal && selectedDonation && (
        <DonationDetailModal
          donation={selectedDonation}
          onClose={() => setShowDetailModal(false)}
          onUpdateStatus={updateDonationStatus}
          onDelete={deleteDonation}
          formatDate={formatDate}
          updating={updating}
        />
      )}
    </div>
  );
}