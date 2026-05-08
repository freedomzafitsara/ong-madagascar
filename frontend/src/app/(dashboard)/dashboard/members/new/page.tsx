'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ArrowLeft, Save, X, User, Mail, Phone, MapPin, 
  CreditCard, Calendar, Award, AlertCircle, CheckCircle,
  Upload, FileText, QrCode, Loader2
} from 'lucide-react';

interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  region: string;
  membershipType: 'standard' | 'premium' | 'student' | 'honorary';
  paymentMethod: 'mvola' | 'orange_money' | 'airtel' | 'bank' | 'cash';
  amountPaid: number;
  startDate: string;
  endDate: string;
}

export default function NewMemberPage() {
  const router = useRouter();
  const { token, hasRole } = useAuth();
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<{ url: string; qrCode: string } | null>(null);

  // Vérification des droits
  if (!hasRole('super_admin') && !hasRole('admin') && !hasRole('staff')) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Accès non autorisé</h1>
          <p className="text-gray-500 mt-2">Vous n'avez pas les droits pour ajouter un membre.</p>
          <Link href="/dashboard/members" className="mt-4 inline-flex items-center gap-2 text-blue-600">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState<MemberFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    region: 'Analamanga',
    membershipType: 'standard',
    paymentMethod: 'mvola',
    amountPaid: 25000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
  });

  const regions = [
    'Analamanga', 'Diana', 'Sava', 'Itasy', 'Vakinankaratra',
    'Bongolava', 'Sofia', 'Boeny', 'Betsiboka', 'Melaky',
    'Alaotra-Mangoro', 'Atsinanana', 'Analanjirofo', 'Amoron\'i Mania',
    'Haute Matsiatra', 'Vatovavy-Fitovinany', 'Ihorombe', 'Atsimo-Atsinanana',
    'Menabe', 'Atsimo-Andrefana', 'Androy', 'Anosy'
  ];

  const membershipPrices = {
    standard: 25000,
    premium: 100000,
    student: 15000,
    honorary: 0,
  };

  const handleMembershipTypeChange = (type: 'standard' | 'premium' | 'student' | 'honorary') => {
    setFormData({
      ...formData,
      membershipType: type,
      amountPaid: membershipPrices[type],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    try {
      const memberData = {
        user: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          region: formData.region,
        },
        membership_type: formData.membershipType,
        payment_method: formData.paymentMethod,
        amount_paid: formData.amountPaid,
        start_date: formData.startDate,
        end_date: formData.endDate,
      };

      const response = await fetch('http://localhost:4001/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(memberData),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(true);
        setGeneratedCard({
          url: data.card_url || '/images/member-card-placeholder.jpg',
          qrCode: data.qr_code || 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(data.member_number),
        });
        
        // Redirection après 3 secondes
        setTimeout(() => {
          router.push('/dashboard/members');
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de la création du membre');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Membre ajouté avec succès !</h2>
          <p className="text-gray-600 mb-6">
            Le membre {formData.firstName} {formData.lastName} a été enregistré.
          </p>
          
          {/* Carte membre générée */}
          {generatedCard && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 mb-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">Y-Mad</h3>
                  <p className="text-blue-200 text-sm">Carte membre</p>
                </div>
                {generatedCard.qrCode && (
                  <img src={generatedCard.qrCode} alt="QR Code" className="w-16 h-16 bg-white rounded-lg p-1" />
                )}
              </div>
              <div className="mt-4">
                <p className="font-bold text-lg">{formData.firstName} {formData.lastName}</p>
                <p className="text-blue-200 text-sm">{formData.email}</p>
              </div>
              <div className="mt-4 flex justify-between text-sm">
                <span>Membre {formData.membershipType}</span>
                <span>Expire le {new Date(formData.endDate).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          )}
          
          <div className="flex gap-3 justify-center">
            <Link
              href="/dashboard/members"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Voir la liste
            </Link>
            <Link
              href="/dashboard/members/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ajouter un autre
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/dashboard/members" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour à la liste
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Ajouter un membre</h1>
          <p className="text-gray-500 text-sm">Créez un nouveau membre avec adhésion</p>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Section Informations personnelles */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Informations personnelles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Prénom"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="NOM"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="prénom@exemple.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="032 00 000 00"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Région *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  required
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white"
                >
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section Adhésion */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Type d'adhésion
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
            {(['standard', 'premium', 'student', 'honorary'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleMembershipTypeChange(type)}
                className={`p-4 rounded-lg border-2 text-center transition ${
                  formData.membershipType === type
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <p className={`font-semibold ${formData.membershipType === type ? 'text-blue-600' : 'text-gray-800'}`}>
                  {type === 'standard' && 'Standard'}
                  {type === 'premium' && 'Premium'}
                  {type === 'student' && 'Étudiant'}
                  {type === 'honorary' && 'Honoraire'}
                </p>
                <p className="text-sm text-gray-500">{membershipPrices[type].toLocaleString()} Ar</p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Moyen de paiement</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white"
                >
                  <option value="mvola">MVola</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="airtel">Airtel Money</option>
                  <option value="bank">Virement bancaire</option>
                  <option value="cash">Espèces</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant payé (Ar)</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  required
                  value={formData.amountPaid}
                  onChange={(e) => setFormData({ ...formData, amountPaid: parseInt(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Montant"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Dates */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Période d'adhésion
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <Link
            href="/dashboard/members"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Enregistrement...' : 'Enregistrer le membre'}
          </button>
        </div>
      </form>
    </div>
  );
}