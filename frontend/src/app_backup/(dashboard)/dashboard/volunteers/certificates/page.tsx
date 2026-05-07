// src/app/(dashboard)/dashboard/volunteers/certificates/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, Award, Calendar, User, Clock, Loader2, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';

// Types
interface Certificate {
  id: string;
  volunteerId: string;
  volunteerName: string;
  totalHours: number;
  periodStart: string;
  periodEnd: string;
  issuedAt: string;
  certificateNumber: string;
  signedBy: string;
}

interface VolunteerStats {
  totalHours: number;
  monthlyHours: number;
  weeklyHours: number;
  activeAssignments: number;
  rank: string;
}

export default function CertificatesPage() {
  const searchParams = useSearchParams();
  const volunteerId = searchParams.get('volunteerId');
  
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [volunteerName, setVolunteerName] = useState('');
  const [volunteerStats, setVolunteerStats] = useState<VolunteerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    periodStart: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
    periodEnd: new Date().toISOString().split('T')[0],
    signedBy: 'Directeur Exécutif Y-Mad'
  });

  useEffect(() => {
    loadData();
  }, [volunteerId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les certificats
      const storedCerts = localStorage.getItem('ymad_certificates');
      let certs: Certificate[] = storedCerts ? JSON.parse(storedCerts) : [];
      if (volunteerId) {
        certs = certs.filter(c => c.volunteerId === volunteerId);
      }
      setCertificates(certs);
      
      // Charger les infos du bénévole
      if (volunteerId) {
        const storedVolunteers = localStorage.getItem('ymad_volunteers');
        if (storedVolunteers) {
          const volunteers = JSON.parse(storedVolunteers);
          const volunteer = volunteers.find((v: any) => v.id === volunteerId);
          if (volunteer) {
            const name = volunteer.name || `${volunteer.firstName || ''} ${volunteer.lastName || ''}`;
            setVolunteerName(name.trim());
          }
        }
        
        // Charger les statistiques
        const storedHours = localStorage.getItem('ymad_hours');
        let hours: any[] = storedHours ? JSON.parse(storedHours) : [];
        hours = hours.filter((h: any) => h.volunteerId === volunteerId && h.status === 'approved');
        const totalHours = hours.reduce((sum, h) => sum + (h.hours || 0), 0);
        
        setVolunteerStats({
          totalHours,
          monthlyHours: 0,
          weeklyHours: 0,
          activeAssignments: 0,
          rank: totalHours >= 500 ? 'Platine' : totalHours >= 200 ? 'Or' : totalHours >= 50 ? 'Argent' : 'Bronze'
        });
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      showMessage('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const generateCertificate = async () => {
    if (!volunteerId) return;
    
    try {
      const totalHoursValue = volunteerStats?.totalHours ?? 0;
      
      const newCertificate: Certificate = {
        id: Date.now().toString(),
        volunteerId,
        volunteerName,
        totalHours: totalHoursValue,
        periodStart: formData.periodStart,
        periodEnd: formData.periodEnd,
        issuedAt: new Date().toISOString(),
        certificateNumber: `VOL-${new Date().getFullYear()}-${String(certificates.length + 1).padStart(4, '0')}`,
        signedBy: formData.signedBy
      };
      
      const storedCerts = localStorage.getItem('ymad_certificates');
      const certs: Certificate[] = storedCerts ? JSON.parse(storedCerts) : [];
      certs.push(newCertificate);
      localStorage.setItem('ymad_certificates', JSON.stringify(certs));
      
      setCertificates(certs);
      setShowForm(false);
      showMessage('Attestation générée avec succès !', 'success');
    } catch (error) {
      console.error('Erreur génération:', error);
      showMessage('Erreur lors de la génération', 'error');
    }
  };

  // ✅ CORRECTION: Import correct de jsPDF
  const downloadCertificate = async (certificate: Certificate) => {
    try {
      // Importation dynamique correcte de jspdf
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      const doc = new jsPDF();
      
      // Logo (optionnel)
      try {
        const response = await fetch('/images/logo.png');
        if (response.ok) {
          const logoBlob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            const imgData = reader.result as string;
            doc.addImage(imgData, 'PNG', 14, 10, 40, 40);
            finalizePDF(doc, certificate);
          };
          reader.readAsDataURL(logoBlob);
        } else {
          finalizePDF(doc, certificate);
        }
      } catch (error) {
        finalizePDF(doc, certificate);
      }
    } catch (error) {
      console.error('Erreur import jspdf:', error);
      showMessage('Erreur lors du chargement de la bibliothèque PDF', 'error');
    }
  };

  // ✅ Fonction pour finaliser le PDF
  const finalizePDF = (doc: any, certificate: Certificate) => {
    try {
      // En-tête
      doc.setFontSize(22);
      doc.setTextColor(0, 51, 102);
      doc.text("ATTESTATION DE BÉNÉVOLAT", 105, 40, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`N° ${certificate.certificateNumber}`, 105, 50, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Je soussigné(e),", 20, 80);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(certificate.signedBy, 20, 90);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`atteste que ${certificate.volunteerName} a effectué`, 20, 105);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`${certificate.totalHours} heures de bénévolat au sein de l'association Y-Mad,`, 20, 115);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`du ${new Date(certificate.periodStart).toLocaleDateString('fr-FR')} au ${new Date(certificate.periodEnd).toLocaleDateString('fr-FR')}.`, 20, 125);
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Cette attestation est délivrée pour servir et valoir ce que de droit.", 20, 150);
      
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Fait à Antananarivo, le ${new Date().toLocaleDateString('fr-FR')}`, 20, 180);
      doc.text("Signature :", 20, 200);
      
      // Sauvegarde
      doc.save(`attestation_${certificate.certificateNumber}.pdf`);
      showMessage('PDF téléchargé avec succès', 'success');
    } catch (error) {
      console.error('Erreur finalisation PDF:', error);
      showMessage('Erreur lors de la création du PDF', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Message notification */}
      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Award className="w-7 h-7 text-blue-600" />
            Attestations de bénévolat
          </h1>
          {volunteerName && <p className="text-gray-500 mt-1">Bénévole: {volunteerName}</p>}
        </div>
        {volunteerId && volunteerStats && volunteerStats.totalHours > 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Générer attestation
          </button>
        )}
      </div>

      {/* Statistiques du bénévole */}
      {volunteerStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{volunteerStats.totalHours}h</p>
            <p className="text-sm text-gray-600">Heures totales</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <Award className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800 capitalize">{volunteerStats.rank}</p>
            <p className="text-sm text-gray-600">Rang</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{certificates.length}</p>
            <p className="text-sm text-gray-600">Attestations</p>
          </div>
        </div>
      )}

      {/* Liste des attestations */}
      {certificates.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Aucune attestation générée</p>
          {volunteerStats && volunteerStats.totalHours > 0 && (
            <button onClick={() => setShowForm(true)} className="mt-3 text-blue-600 hover:underline">
              Générer une attestation
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-between items-center hover:shadow-md transition">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span className="font-mono text-sm text-gray-500">{cert.certificateNumber}</span>
                </div>
                <p className="font-medium text-gray-800">{cert.volunteerName}</p>
                <p className="text-sm text-gray-600">{cert.totalHours} heures de bénévolat</p>
                <p className="text-xs text-gray-400">
                  Période: {new Date(cert.periodStart).toLocaleDateString('fr-FR')} - {new Date(cert.periodEnd).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-xs text-gray-400">Délivrée le {new Date(cert.issuedAt).toLocaleDateString('fr-FR')}</p>
              </div>
              <button
                onClick={() => downloadCertificate(cert)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal génération attestation */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Générer une attestation</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Période du</label>
                <input
                  type="date"
                  value={formData.periodStart}
                  onChange={(e) => setFormData({...formData, periodStart: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Période au</label>
                <input
                  type="date"
                  value={formData.periodEnd}
                  onChange={(e) => setFormData({...formData, periodEnd: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Signé par</label>
                <input
                  type="text"
                  value={formData.signedBy}
                  onChange={(e) => setFormData({...formData, signedBy: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">Récapitulatif:</p>
                <p className="text-sm">{volunteerName} - {volunteerStats?.totalHours ?? 0} heures totales</p>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Annuler
              </button>
              <button onClick={generateCertificate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Générer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}