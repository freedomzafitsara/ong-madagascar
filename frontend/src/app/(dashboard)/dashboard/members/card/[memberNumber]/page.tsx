'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, XCircle, User, Mail, Calendar, QrCode } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export default function MemberCardPage() {
  const params = useParams();
  const memberNumber = params.memberNumber as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [member, setMember] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const response = await fetch(`${API_URL}/members/card/${memberNumber}`);
        
        if (response.ok) {
          const data = await response.json();
          setMember(data);
          
          const pageUrl = `${window.location.origin}/members/card/${memberNumber}`;
          const googleChartUrl = `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(pageUrl)}&chs=200x200&choe=UTF-8&chld=M|2`;
          setQrCodeUrl(googleChartUrl);
        } else if (response.status === 404) {
          setError('Carte membre non trouvee');
        } else {
          setError('Erreur lors du chargement');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger la carte');
      } finally {
        setLoading(false);
      }
    };

    if (memberNumber) {
      fetchCard();
    }
  }, [memberNumber]);

  const formatDate = (date: string) => {
    if (!date) return 'Non definie';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Valide', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle };
      case 'expired':
        return { label: 'Expiree', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle };
      default:
        return { label: 'En attente', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertCircle };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Carte non trouvee</h2>
          <p className="text-gray-500">{error || 'Aucune carte trouvee pour ce numero'}</p>
          <Link href="/dashboard/members" className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">
            Retour a la liste
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(member.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        
        <Link href="/dashboard/members" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour a la liste des membres
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          <div className="bg-blue-600 px-6 py-4 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Y-Mad</h1>
                <p className="text-blue-200 text-sm">Youthful Madagascar</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-200">Carte membre</p>
                <p className="text-sm font-mono">{member.memberNumber}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              
              <div className="flex flex-col items-center justify-center">
                <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="w-28 h-28" />
                  ) : (
                    <QrCode className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">Code unique</p>
                <p className="text-xs text-gray-400">Cliquez pour scanner</p>
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {member.user?.firstName} {member.user?.lastName}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3" /> {statusInfo.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>Membre depuis: {new Date().getFullYear()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Valable jusqu au: {formatDate(member.expiryDate)}</span>
                  </div>
                  {member.user?.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{member.user.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Y-Mad - Ensemble, construisons le Madagascar de demain
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Cette carte est strictement personnelle
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Scannez le QR code pour verifier l adhesion
          </p>
        </div>
      </div>
    </div>
  );
}