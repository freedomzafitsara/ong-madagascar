'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, 
  CreditCard, Award, QrCode, Loader2, AlertCircle,
  CheckCircle, XCircle, Clock, Printer, Download
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

interface MemberUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  region: string;
  role?: string;
}

interface Member {
  id: string;
  memberNumber: string;
  userId: string;
  membershipType: string;
  status: string;
  amountPaid: number;
  startDate: string;
  expiryDate: string;
  paymentMethod: string;
  cardUrl?: string;
  qrCode?: string;
  createdAt: string;
  user?: MemberUser;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: 'Actif', color: 'text-green-600 bg-green-100', icon: CheckCircle },
  expired: { label: 'Expire', color: 'text-red-600 bg-red-100', icon: XCircle },
  pending: { label: 'En attente', color: 'text-yellow-600 bg-yellow-100', icon: Clock },
  suspended: { label: 'Suspendu', color: 'text-gray-600 bg-gray-100', icon: AlertCircle }
};

const TYPE_LABELS: Record<string, string> = {
  standard: 'Standard',
  premium: 'Premium',
  student: 'Etudiant',
  honorary: 'Honoraire'
};

const PAYMENT_LABELS: Record<string, string> = {
  mvola: 'MVola',
  orange_money: 'Orange Money',
  airtel: 'Airtel Money',
  bank: 'Virement bancaire',
  cash: 'Especes'
};

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuth();
  const memberId = params.id as string;
  
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (user?.role !== 'super_admin' && user?.role !== 'admin' && user?.role !== 'staff') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Acces non autorise</h1>
          <p className="text-gray-500 mt-2">Vous n avez pas les droits pour voir cette page.</p>
          <Link href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchMember = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/members/${memberId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setMember(data);
        } else if (response.status === 404) {
          setError('Membre non trouve');
        } else {
          setError('Erreur lors du chargement');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur de connexion');
      } finally {
        setLoading(false);
      }
    };

    if (token && memberId) {
      fetchMember();
    }
  }, [token, memberId]);

  const formatDate = (date: string) => {
    if (!date) return 'Non definie';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === undefined || amount === null) return '0 Ar';
    return new Intl.NumberFormat('fr-FR').format(amount) + ' Ar';
  };

  const openQRCodePage = () => {
    if (member?.memberNumber) {
      window.open(`/members/card/${member.memberNumber}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Erreur</h1>
          <p className="text-gray-500">{error || 'Membre non trouve'}</p>
          <Link href="/dashboard/members" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">
            Retour a la liste
          </Link>
        </div>
      </div>
    );
  }

  const StatusComponent = STATUS_CONFIG[member.status] || STATUS_CONFIG.pending;
  const StatusIcon = StatusComponent.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex justify-between items-center">
        <div>
          <Link href="/dashboard/members" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-2">
            <ArrowLeft className="w-4 h-4" /> Retour a la liste
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Details du membre</h1>
          <p className="text-gray-500 text-sm">Consultez les informations et la carte membre</p>
        </div>
        <div className="flex gap-2">
          {member.cardUrl && (
            <button
              onClick={() => window.open(member.cardUrl, '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Download className="w-4 h-4" /> Telecharger PDF
            </button>
          )}
          <button
            onClick={openQRCodePage}
            className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
          >
            <QrCode className="w-4 h-4" /> QR Code
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Informations personnelles</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Nom complet</p>
                <p className="text-gray-800 font-medium">
                  {member.user?.firstName} {member.user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Numero de membre</p>
                <p className="text-blue-600 font-mono font-bold">{member.memberNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-gray-800 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" /> {member.user?.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Telephone</p>
                <p className="text-gray-800 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" /> {member.user?.phone || 'Non renseigne'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-400">Region</p>
                <p className="text-gray-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" /> {member.user?.region || 'Non renseigne'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Informations d adhesion</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Type d adhesion</p>
                <p className="text-gray-800 font-medium">{TYPE_LABELS[member.membershipType] || member.membershipType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Statut</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${StatusComponent.color}`}>
                  <StatusIcon className="w-3 h-3" /> {StatusComponent.label}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400">Montant paye</p>
                <p className="text-gray-800 font-semibold">{formatCurrency(member.amountPaid)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Moyen de paiement</p>
                <p className="text-gray-800">{PAYMENT_LABELS[member.paymentMethod] || member.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Date de debut</p>
                <p className="text-gray-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" /> {formatDate(member.startDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Date d expiration</p>
                <p className="text-gray-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" /> {formatDate(member.expiryDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Carte membre</h3>
            <p className="text-xs text-gray-500 mb-4">
              Numero: {member.memberNumber}
            </p>
            {member.cardUrl ? (
              <div className="space-y-2">
                <button
                  onClick={() => window.open(member.cardUrl, '_blank')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Printer className="w-4 h-4" /> Voir la carte PDF
                </button>
                <button
                  onClick={openQRCodePage}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                >
                  <QrCode className="w-4 h-4" /> Afficher QR Code
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <QrCode className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-xs text-gray-400">Carte en cours de generation</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500">
              Une carte membre avec QR code est generee et stockee sur Cloudinary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}