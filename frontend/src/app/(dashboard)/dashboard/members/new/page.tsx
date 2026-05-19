// frontend/src/app/(dashboard)/dashboard/members/new/page.tsx
// VERSION FINALE CORRIGEE - PLACE AU SOUTENANCE

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, Save, User, Mail, Phone, MapPin, 
  CreditCard, Calendar, Award, AlertCircle, CheckCircle,
  Loader2, Database, X, Star, Heart, Users,
  PlusCircle, Info, ChevronDown, ChevronUp, DollarSign,
  ShieldCheck, QrCode
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

const REGIONS = [
  'Analamanga', 'Diana', 'Sava', 'Itasy', 'Vakinankaratra',
  'Bongolava', 'Sofia', 'Boeny', 'Betsiboka', 'Melaky',
  'Alaotra-Mangoro', 'Atsinanana', 'Analanjirofo', 'Amoron\'i Mania',
  'Haute Matsiatra', 'Vatovavy-Fitovinany', 'Ihorombe', 'Atsimo-Atsinanana',
  'Menabe', 'Atsimo-Andrefana', 'Androy', 'Anosy'
];

type MembershipType = 'standard' | 'premium' | 'student' | 'honorary';

const MEMBERSHIP_PRICES: Record<MembershipType, number> = { 
  standard: 25000, 
  premium: 100000, 
  student: 15000, 
  honorary: 0 
};

const MEMBERSHIP_LABELS: Record<MembershipType, string> = { 
  standard: 'Standard', 
  premium: 'Premium', 
  student: 'Étudiant', 
  honorary: 'Honoraire' 
};

function GraduationCap({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

export default function NewMemberPage() {
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [created, setCreated] = useState<{ memberNumber: string; email: string; firstName: string; lastName: string } | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  if (!isAuthenticated) { 
    router.push('/login'); 
    return null; 
  }
  
  if (user?.role !== 'super_admin' && user?.role !== 'admin' && user?.role !== 'staff') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Accès non autorisé</h1>
          <p className="text-gray-500 mt-2">Vous n'avez pas les droits pour ajouter un membre.</p>
          <Link href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    region: 'Analamanga',
    membershipType: 'standard' as MembershipType,
    paymentMethod: 'mvola' as 'mvola' | 'orange_money' | 'airtel' | 'bank' | 'cash',
    amountPaid: 25000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
  });

  const handleTypeChange = (type: MembershipType) => {
    setFormData({ 
      ...formData, 
      membershipType: type, 
      amountPaid: MEMBERSHIP_PRICES[type] 
    });
  };

  const validate = () => {
    if (!formData.firstName.trim()) { setError('Prénom requis'); return false; }
    if (!formData.lastName.trim()) { setError('Nom requis'); return false; }
    if (!formData.email.trim()) { setError('Email requis'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('Email invalide'); return false; }
    if (formData.amountPaid <= 0 && formData.membershipType !== 'honorary') { 
      setError('Le montant payé doit être supérieur à 0'); 
      return false; 
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');

    try {
      const memberData = {
        user: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          region: formData.region,
        },
        membership_type: formData.membershipType,
        payment_method: formData.paymentMethod,
        amount_paid: formData.amountPaid,
        start_date: formData.startDate,
        end_date: formData.endDate,
      };

      const response = await fetch(`${API_URL}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(memberData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        setCreated({
          memberNumber: result.member?.memberNumber || result.memberNumber,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
        setTimeout(() => router.push('/dashboard/members'), 3000);
      } else {
        setError(result.message || 'Erreur lors de la création');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  if (success && created) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Membre ajouté avec succès !</h2>
          <p className="text-gray-600 mb-4">
            {created.firstName} {created.lastName} a été enregistré.
          </p>
          <div className="bg-blue-600 rounded-xl p-6 mb-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">Y-Mad</h3>
                <p className="text-blue-200 text-sm">Carte membre</p>
                <p className="text-blue-200 text-xs mt-1">N°: {created.memberNumber}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <QrCode className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 border-t border-blue-500 pt-4">
              <p className="font-bold text-lg">{created.firstName} {created.lastName}</p>
              <p className="text-blue-200 text-sm">{created.email}</p>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard/members" className="px-4 py-2 bg-gray-600 text-white rounded-lg flex items-center gap-2">
              <Users className="w-4 h-4" /> Voir la liste
            </Link>
            <Link href="/dashboard/members/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Ajouter un autre
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/dashboard/members" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Ajouter un membre</h1>
          <p className="text-gray-500 text-sm">Créez une nouvelle adhésion</p>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <Info className="w-4 h-4" /> Aide
        </button>
      </div>

      {showHelp && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Le numéro de membre est généré automatiquement. Une carte membre avec QR code sera créée.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <AlertCircle className="w-5 h-5 inline mr-2" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" /> Informations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Région *</label>
              <select
                required
                value={formData.region}
                onChange={e => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" /> Type d'adhésion
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {(['standard', 'premium', 'student', 'honorary'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={`p-4 rounded-xl border-2 text-center transition ${
                  formData.membershipType === type
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {type === 'standard' && <Star className="w-6 h-6 mx-auto mb-2 text-gray-500" />}
                {type === 'premium' && <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />}
                {type === 'student' && <GraduationCap className="w-6 h-6 mx-auto mb-2 text-green-500" />}
                {type === 'honorary' && <Award className="w-6 h-6 mx-auto mb-2 text-purple-500" />}
                <p className="font-semibold">{MEMBERSHIP_LABELS[type]}</p>
                <p className="text-sm text-gray-500 mt-1">{MEMBERSHIP_PRICES[type].toLocaleString()} Ar</p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Moyen de paiement</label>
              <select
                value={formData.paymentMethod}
                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="mvola">MVola</option>
                <option value="orange_money">Orange Money</option>
                <option value="airtel">Airtel Money</option>
                <option value="bank">Virement bancaire</option>
                <option value="cash">Espèces</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (Ar) *</label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={formData.amountPaid}
                onChange={e => setFormData({ ...formData, amountPaid: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" /> Période
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
          <Link
            href="/dashboard/members"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>

      <div className="mt-4 text-center text-xs text-gray-400">
        <Database className="w-3 h-3 inline mr-1" /> Données stockées dans PostgreSQL
        <ShieldCheck className="w-3 h-3 inline ml-2 mr-1" /> Sécurisé JWT
      </div>
    </div>
  );
}