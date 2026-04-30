// src/app/dashboard/membership/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Download, QrCode, Calendar, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

interface Membership {
  id: string;
  memberNumber: string;
  type: 'standard' | 'premium' | 'honorary' | 'student';
  status: 'pending' | 'active' | 'expired' | 'suspended';
  startDate: string;
  endDate: string;
  amountPaid: number;
  paymentMethod: string;
  cardUrl: string;
  qrCode: string;
}

export default function MembershipPage() {
  const { user } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRenewal, setShowRenewal] = useState(false);

  useEffect(() => {
    loadMembership();
  }, []);

  const loadMembership = () => {
    const stored = localStorage.getItem('ymad_membership');
    if (stored) {
      setMembership(JSON.parse(stored));
    } else {
      // Simulation d'une adhésion active
      const demoMembership: Membership = {
        id: '1',
        memberNumber: 'YM-2025-0001',
        type: 'standard',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        amountPaid: 25000,
        paymentMethod: 'mvola',
        cardUrl: '',
        qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=YM-2025-0001'
      };
      setMembership(demoMembership);
    }
    setLoading(false);
  };

  const downloadCard = () => {
    // Générer PDF de la carte membre
    alert('Téléchargement de la carte membre PDF...');
  };

  const renewMembership = () => {
    setShowRenewal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">✅ Actif</span>;
      case 'expired': return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">⚠️ Expiré</span>;
      case 'pending': return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">⏳ En attente</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-ymad-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ymad-gray-800">Mon adhésion</h1>
        <p className="text-ymad-gray-500">Gérez votre carte membre et votre cotisation</p>
      </div>

      {/* Carte membre */}
      <div className="bg-gradient-to-r from-ymad-blue-700 to-ymad-blue-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80">CARTE MEMBRE</p>
              <p className="text-2xl font-bold mt-1">Y-Mad Madagascar</p>
              <p className="text-sm opacity-80 mt-2">{membership?.memberNumber}</p>
            </div>
            {membership?.qrCode && (
              <img src={membership.qrCode} alt="QR Code" className="w-20 h-20 bg-white rounded-lg p-1" />
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-end">
            <div>
              <p className="text-xs opacity-70">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs opacity-70">{membership?.type === 'standard' ? 'Adhérent standard' : 'Adhérent premium'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-70">Valable jusqu'au</p>
              <p className="text-sm font-semibold">{membership?.endDate ? new Date(membership.endDate).toLocaleDateString('fr-FR') : '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={downloadCard} className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition">
          <Download className="w-5 h-5 text-ymad-blue-600" />
          <span>Télécharger la carte</span>
        </button>
        <button className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition">
          <QrCode className="w-5 h-5 text-ymad-blue-600" />
          <span>Afficher le QR code</span>
        </button>
        <button onClick={renewMembership} className="flex items-center justify-center gap-2 p-4 bg-ymad-blue-600 text-white rounded-xl shadow-sm hover:bg-ymad-blue-700 transition">
          <CreditCard className="w-5 h-5" />
          <span>Renouveler</span>
        </button>
      </div>

      {/* Informations */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-ymad-gray-800 mb-4">Détails de l'adhésion</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-ymad-gray-600">Statut</span>
            <span>{getStatusBadge(membership?.status || 'pending')}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-ymad-gray-600">Type d'adhésion</span>
            <span className="capitalize">{membership?.type}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-ymad-gray-600">Date d'adhésion</span>
            <span>{membership?.startDate ? new Date(membership.startDate).toLocaleDateString('fr-FR') : '-'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-ymad-gray-600">Date d'expiration</span>
            <span>{membership?.endDate ? new Date(membership.endDate).toLocaleDateString('fr-FR') : '-'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-ymad-gray-600">Cotisation payée</span>
            <span>{membership?.amountPaid.toLocaleString()} Ar</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-ymad-gray-600">Mode de paiement</span>
            <span className="capitalize">{membership?.paymentMethod}</span>
          </div>
        </div>
      </div>

      {/* Modal renouvellement */}
      {showRenewal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-ymad-gray-800 mb-4">Renouveler mon adhésion</h2>
            <p className="text-ymad-gray-600 mb-4">Montant : 25 000 Ar / an</p>
            <div className="space-y-3 mb-6">
              <button className="w-full p-3 border rounded-lg flex items-center justify-between hover:border-ymad-blue-400 transition">
                <span>📱 MVola</span>
                <span className="text-ymad-gray-500">Payer par MVola</span>
              </button>
              <button className="w-full p-3 border rounded-lg flex items-center justify-between hover:border-ymad-blue-400 transition">
                <span>🟠 Orange Money</span>
                <span className="text-ymad-gray-500">Payer par Orange Money</span>
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRenewal(false)} className="flex-1 px-4 py-2 border rounded-lg">Annuler</button>
              <button className="flex-1 px-4 py-2 bg-ymad-blue-600 text-white rounded-lg font-semibold">Payer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}