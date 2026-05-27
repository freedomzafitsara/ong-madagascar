'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Download, Award, Calendar, User, Clock, Loader2, Plus, X, 
  CheckCircle, AlertCircle, FileText, ChevronLeft, ChevronRight,
  Heart, TrendingUp, Star, Medal, Shield, RefreshCw, Search,
  Filter, Eye, Receipt, DollarSign, CreditCard, Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

// ============================================================
// TYPES
// ============================================================

interface DonationReceipt {
  id: string;
  donationId: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  projectName: string | null;
  receiptNumber: string;
  receiptUrl: string | null;
  issuedAt: string;
  signedBy: string;
  isAnonymous: boolean;
  message: string | null;
}

interface DonorStats {
  totalDonations: number;
  totalAmount: number;
  averageAmount: number;
  lastDonationDate: string;
  rank: string;
  rankColor: string;
}

interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalAmount: number;
}

// ============================================================
// COMPOSANT CARTE STATISTIQUE
// ============================================================

function StatCard({ label, value, icon: Icon, isBlue = false, suffix = '' }: { 
  label: string; 
  value: number | string; 
  icon: any; 
  isBlue?: boolean;
  suffix?: string;
}) {
  const bgClass = isBlue 
    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' 
    : 'bg-white border border-gray-200 text-gray-700';
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
// COMPOSANT BADGE RANG DONATEUR
// ============================================================

function DonorRankBadge({ rank, color }: { rank: string; color: string }) {
  const rankConfig: Record<string, { icon: any; label: string }> = {
    bienfaiteur: { icon: Medal, label: 'Bienfaiteur' },
    mécène: { icon: Star, label: 'Mécène' },
    donateur: { icon: Heart, label: 'Donateur' },
    soutien: { icon: Shield, label: 'Soutien' }
  };
  const config = rankConfig[rank.toLowerCase()] || rankConfig.soutien;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

// ============================================================
// COMPOSANT BADGE PAIEMENT
// ============================================================

function PaymentBadge({ method }: { method: string }) {
  const config: Record<string, { bg: string; text: string; icon: any; label: string }> = {
    mvola: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Smartphone, label: 'MVola' },
    orange_money: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Smartphone, label: 'Orange Money' },
    airtel: { bg: 'bg-red-100', text: 'text-red-700', icon: Smartphone, label: 'Airtel Money' },
    paypal: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CreditCard, label: 'PayPal' },
    bank: { bg: 'bg-gray-100', text: 'text-gray-700', icon: CreditCard, label: 'Virement' },
    cash: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: DollarSign, label: 'Espèces' }
  };
  const c = config[method.toLowerCase()] || config.cash;
  const Icon = c.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${c.bg} ${c.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {c.label}
    </span>
  );
}

// ============================================================
// COMPOSANT CARTE RECU
// ============================================================

function ReceiptCard({ receipt, onDownload }: { receipt: DonationReceipt; onDownload: (receipt: DonationReceipt) => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-mono text-sm font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
              {receipt.receiptNumber}
            </span>
            <PaymentBadge method={receipt.paymentMethod} />
          </div>
          <h3 className="font-semibold text-gray-800">
            {receipt.isAnonymous ? 'Donateur anonyme' : receipt.donorName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium text-blue-600">{receipt.amount.toLocaleString()} {receipt.currency}</span>
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Délivré le {new Date(receipt.issuedAt).toLocaleDateString('fr-FR')}
            </p>
            {receipt.projectName && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                Projet: {receipt.projectName}
              </p>
            )}
          </div>
          {receipt.message && !receipt.isAnonymous && (
            <p className="text-xs text-gray-400 italic mt-2 border-l-2 border-blue-200 pl-2">
              "{receipt.message}"
            </p>
          )}
        </div>
        <button
          onClick={() => onDownload(receipt)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Download className="w-4 h-4" />
          Télécharger reçu
        </button>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT STATISTIQUES DONATEUR
// ============================================================

function DonorStatsCards({ stats }: { stats: DonorStats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard 
        label="Montant total" 
        value={`${stats.totalAmount.toLocaleString()} Ar`} 
        icon={DollarSign} 
        isBlue={true} 
      />
      <StatCard 
        label="Dons effectués" 
        value={stats.totalDonations} 
        icon={Heart} 
        isBlue={false} 
      />
      <StatCard 
        label="Moyenne par don" 
        value={`${Math.round(stats.averageAmount).toLocaleString()} Ar`} 
        icon={TrendingUp} 
        isBlue={false} 
      />
      <StatCard 
        label="Rang" 
        value={stats.rank.charAt(0).toUpperCase() + stats.rank.slice(1)} 
        icon={Award} 
        isBlue={false} 
      />
    </div>
  );
}

// ============================================================
// MODAL GENERATION RECU
// ============================================================

interface GenerateReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: { signedBy: string }) => Promise<void>;
  donation: DonationReceipt | null;
  loading: boolean;
}

function GenerateReceiptModal({ isOpen, onClose, onGenerate, donation, loading }: GenerateReceiptModalProps) {
  const [formData, setFormData] = useState({
    signedBy: 'Directeur Exécutif Y-Mad'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate(formData);
  };

  if (!isOpen || !donation) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        
        {/* En-tête */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Générer un reçu fiscal</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Signé par</label>
            <input
              type="text"
              value={formData.signedBy}
              onChange={(e) => setFormData({...formData, signedBy: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="Nom du signataire"
              required
            />
          </div>

          {/* Récapitulatif du don */}
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm font-medium text-blue-800 mb-2">Récapitulatif du don</p>
            <div className="space-y-1 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">Donateur:</span> {donation.isAnonymous ? 'Anonyme' : donation.donorName}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Montant:</span> {donation.amount.toLocaleString()} {donation.currency}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Moyen de paiement:</span> {donation.paymentMethod}
              </p>
              {donation.projectName && (
                <p className="text-gray-700">
                  <span className="font-medium">Projet:</span> {donation.projectName}
                </p>
              )}
              <p className="text-gray-700">
                <span className="font-medium">Numéro de reçu:</span> {donation.receiptNumber}
              </p>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Générer le reçu PDF'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// PAGE PRINCIPALE - REÇUS DE DONS
// ============================================================

export default function DonationReceiptsPage() {
  const { token, user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const donorId = searchParams.get('donorId');
  const donationId = searchParams.get('donationId');
  
  const [receipts, setReceipts] = useState<DonationReceipt[]>([]);
  const [donor, setDonor] = useState<Donor | null>(null);
  const [donorStats, setDonorStats] = useState<DonorStats | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<DonationReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const hasAccess = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff';

  // ============================================================
  // CHARGEMENT DES DONNEES DEPUIS L'API
  // ============================================================

  const loadDonorInfo = useCallback(async () => {
    if (!donorId) return;
    
    try {
      const response = await fetch(`${API_URL}/donations/user/${donorId}/stats`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setDonor({
          id: donorId,
          name: data.donor_name || 'Donateur',
          email: data.donor_email,
          phone: data.donor_phone,
          totalAmount: data.total_amount
        });
      }
    } catch (error) {
      console.error('Erreur chargement donateur:', error);
    }
  }, [donorId, token]);

  const loadReceipts = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/donations?status=completed&limit=100`;
      if (donorId) {
        url = `${API_URL}/donations/user/${donorId}`;
      }
      if (donationId) {
        url = `${API_URL}/donations/${donationId}`;
      }
      
      const response = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        const donationsList = data.data || (data.id ? [data] : []);
        
        const receiptsList: DonationReceipt[] = donationsList
          .filter((d: any) => d.status === 'completed')
          .map((d: any) => ({
            id: d.id,
            donationId: d.id,
            donorName: d.is_anonymous ? 'Anonyme' : (d.donor_name || 'Donateur'),
            donorEmail: d.donor_email,
            donorPhone: d.donor_phone,
            amount: d.amount,
            currency: d.currency || 'MGA',
            paymentMethod: d.payment_method,
            projectName: d.project_name,
            receiptNumber: d.receipt_number,
            receiptUrl: d.receipt_url,
            issuedAt: d.confirmed_at || d.created_at,
            signedBy: d.confirmed_by_name || 'Y-Mad',
            isAnonymous: d.is_anonymous,
            message: d.message
          }));
        
        setReceipts(receiptsList);
        
        // Calculer les stats du donateur
        if (donorId && receiptsList.length > 0) {
          const totalAmount = receiptsList.reduce((sum, r) => sum + r.amount, 0);
          const averageAmount = totalAmount / receiptsList.length;
          let rank = 'soutien';
          let rankColor = 'bg-green-100 text-green-700';
          if (totalAmount >= 1000000) {
            rank = 'bienfaiteur';
            rankColor = 'bg-purple-100 text-purple-700';
          } else if (totalAmount >= 500000) {
            rank = 'mécène';
            rankColor = 'bg-yellow-100 text-yellow-700';
          } else if (totalAmount >= 100000) {
            rank = 'donateur';
            rankColor = 'bg-blue-100 text-blue-700';
          }
          
          setDonorStats({
            totalDonations: receiptsList.length,
            totalAmount,
            averageAmount,
            lastDonationDate: receiptsList[0]?.issuedAt || new Date().toISOString(),
            rank,
            rankColor
          });
        }
      }
    } catch (error) {
      console.error('Erreur chargement reçus:', error);
      toast.error('Erreur de chargement des reçus');
    } finally {
      setLoading(false);
    }
  }, [donorId, donationId, token]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!hasAccess) {
      router.push('/dashboard');
      return;
    }
    loadDonorInfo();
    loadReceipts();
  }, [isAuthenticated, hasAccess, router, loadDonorInfo, loadReceipts]);

  // ============================================================
  // GENERATION PDF DU REÇU
  // ============================================================

  const generateReceiptPDF = async (receipt: DonationReceipt) => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Logo Y-Mad (simulé)
      doc.setFontSize(22);
      doc.setTextColor(0, 51, 102);
      doc.text("Y-MAD", 105, 25, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Youthful Madagascar - Association de Jeunesse et Développement", 105, 35, { align: 'center' });
      
      // Titre
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 204);
      doc.text("REÇU DE DON", 105, 55, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`N° ${receipt.receiptNumber}`, 105, 65, { align: 'center' });
      
      // Ligne de séparation
      doc.line(20, 75, 190, 75);
      
      // Informations
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text("Donateur :", 20, 95);
      doc.setFont('helvetica', 'normal');
      doc.text(receipt.isAnonymous ? 'Anonyme' : receipt.donorName, 70, 95);
      
      if (receipt.donorEmail && !receipt.isAnonymous) {
        doc.text("Email :", 20, 110);
        doc.text(receipt.donorEmail, 70, 110);
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text("Montant :", 20, 130);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 102, 204);
      doc.text(`${receipt.amount.toLocaleString()} ${receipt.currency}`, 70, 130);
      
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text("Moyen de paiement :", 20, 145);
      doc.setFont('helvetica', 'normal');
      doc.text(receipt.paymentMethod, 70, 145);
      
      if (receipt.projectName) {
        doc.text("Projet soutenu :", 20, 160);
        doc.text(receipt.projectName, 70, 160);
      }
      
      doc.text("Date du don :", 20, 175);
      doc.text(new Date(receipt.issuedAt).toLocaleDateString('fr-FR'), 70, 175);
      
      doc.text("Date d'émission :", 20, 190);
      doc.text(new Date().toLocaleDateString('fr-FR'), 70, 190);
      
      // Message de remerciement
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text("Merci pour votre générosité qui soutient les projets de Y-Mad à Madagascar.", 105, 215, { align: 'center' });
      
      // Signature
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Signé par : ${receipt.signedBy}`, 20, 245);
      doc.text(`Association Y-Mad - Antananarivo, Madagascar`, 20, 255);
      doc.text(`www.y-mad.mg`, 20, 265);
      
      // Sauvegarde
      doc.save(`recu_don_${receipt.receiptNumber}.pdf`);
      toast.success('Reçu téléchargé avec succès');
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast.error('Erreur lors de la création du PDF');
    }
  };

  // ============================================================
  // GENERATION NOUVEAU REÇU
  // ============================================================

  const generateReceipt = async (data: { signedBy: string }) => {
    if (!selectedDonation) return;
    
    setGenerating(true);
    try {
      const response = await fetch(`${API_URL}/donations/${selectedDonation.donationId}/receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ signedBy: data.signedBy })
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success('Reçu généré avec succès');
        setShowGenerateModal(false);
        loadReceipts();
        
        if (result.receiptUrl) {
          window.open(result.receiptUrl, '_blank');
        }
      } else {
        toast.error('Erreur lors de la génération du reçu');
      }
    } catch (error) {
      console.error('Erreur génération reçu:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setGenerating(false);
    }
  };

  // ============================================================
  // FILTRES
  // ============================================================

  const filteredReceipts = receipts.filter(receipt =>
    receipt.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (receipt.projectName && receipt.projectName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedReceipts = filteredReceipts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);

  // ============================================================
  // RENDU CONDITIONNEL
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
        <p className="text-gray-500 font-medium">Chargement des reçus...</p>
      </div>
    );
  }

  // ============================================================
  // RENDU PRINCIPAL
  // ============================================================

  return (
    <div className="space-y-6">
      
      {/* EN-TETE Y-Mad */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Reçus de dons</h1>
                <p className="text-blue-100 text-sm mt-0.5">
                  Gérez et téléchargez les reçus fiscaux des donateurs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATISTIQUES DU DONATEUR */}
      {donorStats && <DonorStatsCards stats={donorStats} />}

      {/* BARRE DE RECHERCHE */}
      {receipts.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, numéro de reçu ou projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>
      )}

      {/* LISTE DES REÇUS */}
      {receipts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Aucun reçu disponible</h3>
            <p className="text-gray-500 text-sm">
              {donorId 
                ? "Ce donateur n'a pas encore de don confirmé."
                : "Aucun reçu n'a été généré pour le moment."}
            </p>
            {!donorId && (
              <Link href="/dashboard/donations" className="mt-2 text-blue-600 hover:underline text-sm">
                Voir la liste des dons
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedReceipts.map((receipt) => (
            <ReceiptCard
              key={receipt.id}
              receipt={receipt}
              onDownload={generateReceiptPDF}
            />
          ))}
        </div>
      )}

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

      {/* MODAL GENERATION REÇU */}
      {showGenerateModal && selectedDonation && (
        <GenerateReceiptModal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          onGenerate={generateReceipt}
          donation={selectedDonation}
          loading={generating}
        />
      )}
    </div>
  );
}