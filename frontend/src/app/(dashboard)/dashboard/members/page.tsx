// frontend/src/app/(dashboard)/dashboard/members/page.tsx
// VERSION FINALE - GESTION COMPLETE DES MEMBRES

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, Search, Plus, Download, RefreshCw, Loader2,
  Eye, Mail, MapPin, CheckCircle, XCircle, Clock,
  ChevronLeft, ChevronRight, UserPlus, CreditCard, AlertCircle,
  Phone, Calendar, Filter, QrCode, Send, Trash2, Edit
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface MemberUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  region: string;
}

interface Member {
  id: string;
  memberNumber: string;
  userId: string;
  membershipType: 'standard' | 'premium' | 'student' | 'honorary';
  status: 'active' | 'expired' | 'pending' | 'suspended';
  amountPaid: number;
  startDate: string;
  expiryDate: string;
  paymentMethod: string;
  cardUrl?: string;
  qrCode?: string;
  createdAt: string;
  user?: MemberUser;
}

// ============================================================
// CONSTANTES
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
const ITEMS_PER_PAGE = 10;

const REGIONS = [
  'Analamanga', 'Diana', 'Sava', 'Itasy', 'Vakinankaratra',
  'Bongolava', 'Sofia', 'Boeny', 'Betsiboka', 'Melaky',
  'Alaotra-Mangoro', 'Atsinanana', 'Analanjirofo', 'Amoron\'i Mania',
  'Haute Matsiatra', 'Vatovavy-Fitovinany', 'Ihorombe', 'Atsimo-Atsinanana',
  'Menabe', 'Atsimo-Andrefana', 'Androy', 'Anosy'
];

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  active: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  expired: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
  suspended: { bg: 'bg-gray-100', text: 'text-gray-600', icon: AlertCircle }
};

const TYPE_STYLES: Record<string, { bg: string; text: string; price: number }> = {
  standard: { bg: 'bg-blue-100', text: 'text-blue-700', price: 25000 },
  premium: { bg: 'bg-yellow-100', text: 'text-yellow-700', price: 100000 },
  student: { bg: 'bg-green-100', text: 'text-green-700', price: 15000 },
  honorary: { bg: 'bg-purple-100', text: 'text-purple-700', price: 0 }
};

// ============================================================
// COMPOSANTS
// ============================================================

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
        </div>
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const Icon = style.icon;
  const label = { active: 'Actif', expired: 'Expiré', pending: 'En attente', suspended: 'Suspendu' }[status] || status;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const style = TYPE_STYLES[type] || TYPE_STYLES.standard;
  const label = { standard: 'Standard', premium: 'Premium', student: 'Étudiant', honorary: 'Honoraire' }[type] || type;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
      {label}
    </span>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function MembersPage() {
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, pending: 0, revenue: 0 });

  // Vérification des droits
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (user?.role !== 'super_admin' && user?.role !== 'admin' && user?.role !== 'staff') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Accès non autorisé</h1>
          <p className="text-gray-500 mb-6">Vous n'avez pas les droits pour accéder à cette page.</p>
          <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Retour au tableau de bord</Link>
        </div>
      </div>
    );
  }

  // Chargement des membres
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const list = data.data || (Array.isArray(data) ? data : []);
        setMembers(list);
        
        setStats({
          total: list.length,
          active: list.filter((m: Member) => m.status === 'active').length,
          expired: list.filter((m: Member) => m.status === 'expired').length,
          pending: list.filter((m: Member) => m.status === 'pending').length,
          revenue: list.reduce((sum: number, m: Member) => sum + (m.amountPaid || 0), 0)
        });
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { if (token) fetchMembers(); }, [token, fetchMembers]);

  // Export CSV
  const exportToCSV = async () => {
    setExporting(true);
    try {
      const rows = [['N° Membre', 'Nom', 'Email', 'Téléphone', 'Type', 'Statut', 'Montant', 'Expiration', 'Région']];
      members.forEach(m => {
        rows.push([
          m.memberNumber,
          `${m.user?.firstName || ''} ${m.user?.lastName || ''}`,
          m.user?.email || '',
          m.user?.phone || '',
          TYPE_STYLES[m.membershipType]?.price.toString() || m.membershipType,
          m.status,
          (m.amountPaid || 0).toString(),
          new Date(m.expiryDate).toLocaleDateString('fr-FR'),
          m.user?.region || ''
        ]);
      });
      const blob = new Blob(['\uFEFF' + rows.map(row => row.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `membres_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) { console.error(err); }
    finally { setExporting(false); }
  };

  // Filtres
  const formatDate = (date: string) => {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' Ar';
  };

  const filtered = members.filter(m => {
    if (!m.user) return false;
    const search = searchTerm.toLowerCase();
    const fullName = `${m.user.firstName} ${m.user.lastName}`.toLowerCase();
    return (search === '' || fullName.includes(search) || m.memberNumber.toLowerCase().includes(search)) &&
      (filterStatus === 'all' || m.status === filterStatus) &&
      (filterType === 'all' || m.membershipType === filterType) &&
      (filterRegion === 'all' || m.user.region === filterRegion);
  });

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500">Chargement des membres...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Membres</h1>
            {user?.role === 'super_admin' && <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">Super Admin</span>}
          </div>
          <p className="text-gray-500 text-sm">Gérez les adhésions et cartes membres</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchMembers} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <Link href="/dashboard/members/new" className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <UserPlus className="w-4 h-4" /> Nouveau membre
          </Link>
          <button onClick={exportToCSV} disabled={exporting || members.length === 0} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            <Download className="w-4 h-4" /> {exporting ? 'Export...' : 'Exporter'}
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total membres" value={stats.total} icon={<Users className="w-5 h-5" />} />
        <StatCard title="Actifs" value={stats.active} icon={<CheckCircle className="w-5 h-5 text-green-600" />} />
        <StatCard title="Expirés" value={stats.expired} icon={<XCircle className="w-5 h-5 text-red-600" />} />
        <StatCard title="En attente" value={stats.pending} icon={<Clock className="w-5 h-5 text-yellow-600" />} />
        <StatCard title="Revenus" value={stats.revenue} icon={<CreditCard className="w-5 h-5 text-blue-600" />} />
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg">
            <option value="all">Tous statuts</option>
            <option value="active">Actifs</option>
            <option value="expired">Expirés</option>
            <option value="pending">En attente</option>
          </select>
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg">
            <option value="all">Tous types</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="student">Étudiant</option>
            <option value="honorary">Honoraire</option>
          </select>
          <select value={filterRegion} onChange={e => { setFilterRegion(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg">
            <option value="all">Toutes régions</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">N° Membre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Membre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Région</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Montant</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Expiration</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginated.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-500">Aucun membre trouvé</td></tr>
              ) : (
                paginated.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><code className="text-sm text-blue-600 font-mono">{m.memberNumber}</code></td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{m.user?.firstName} {m.user?.lastName}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" /> {m.user?.email}</div>
                    </td>
                    <td className="px-4 py-3"><div className="flex items-center gap-1 text-sm text-gray-600"><Phone className="w-3 h-3 text-gray-400" /> {m.user?.phone || '—'}</div></td>
                    <td className="px-4 py-3"><TypeBadge type={m.membershipType} /></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-1 text-sm text-gray-600"><MapPin className="w-3 h-3 text-gray-400" /> {m.user?.region || '—'}</div></td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(m.amountPaid)}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={m.status} /></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-1 text-sm"><Calendar className="w-3 h-3 text-gray-400" /> {formatDate(m.expiryDate)}</div></td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/dashboard/members/${m.id}`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Détails"><Eye className="w-4 h-4" /></Link>
                        <button onClick={() => window.open(`/dashboard/members/card/${m.memberNumber}`, '_blank')} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Carte QR"><QrCode className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">{filtered.length} membre(s)</div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="p-2 border border-gray-300 rounded-lg disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
            <span className="px-3 py-1 text-sm">Page {currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="p-2 border border-gray-300 rounded-lg disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}