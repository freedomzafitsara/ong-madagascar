'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

// Définition des types
type MembershipType = 'standard' | 'premium' | 'student';
type PaymentMethod = 'mvola' | 'orange_money' | 'airtel' | 'bank';

// Interface pour les données d'adhésion
interface MembershipData {
  price: number;
  priceFr: string;
  priceMg: string;
  color: string;
  icon: string;
  benefits: string[];
}

// Données des formules d'adhésion
const membershipData: Record<MembershipType, MembershipData> = {
  standard: {
    price: 25000,
    priceFr: '25 000 MGA',
    priceMg: '25 000 Ar',
    color: 'blue',
    icon: '🌟',
    benefits: [
      'Carte membre numérique avec QR code',
      'Accès aux événements Y-Mad',
      'Newsletter mensuelle',
      'Réductions partenaires'
    ]
  },
  premium: {
    price: 100000,
    priceFr: '100 000 MGA',
    priceMg: '100 000 Ar',
    color: 'purple',
    icon: '👑',
    benefits: [
      'Tous les avantages Standard',
      'Accès prioritaire aux formations',
      'Invitations exclusives',
      'Certificat officiel',
      'Carte membre premium',
      'Participation aux assemblées'
    ]
  },
  student: {
    price: 10000,
    priceFr: '10 000 MGA',
    priceMg: '10 000 Ar',
    color: 'green',
    icon: '🎓',
    benefits: [
      'Carte membre numérique',
      'Accès aux événements',
      'Tarif réduit formations',
      'Newsletter'
    ]
  }
};

export default function JoinPage() {
  // ✅ Utilisation du contexte global pour la langue
  const { language, setLanguage } = useLanguage();
  
  const [step, setStep] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<MembershipType>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mvola');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);

  // Pour éviter les problèmes d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fonction pour obtenir le texte en fonction de la langue
  const getText = (frText: string, mgText: string): string => {
    return language === 'fr' ? frText : mgText;
  };

  // Initier le paiement
  const handleInitiatePayment = async (): Promise<void> => {
    if (!fullName || !email) {
      alert(getText('Veuillez remplir tous les champs', 'Fenoy ny tsipiriana rehetra'));
      return;
    }

    if (paymentMethod !== 'bank' && !phoneNumber) {
      alert(getText('Veuillez entrer votre numéro de téléphone', 'Ampidiro ny laharana telefaoninao'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/initiate-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membershipType: selectedType,
          amount: membershipData[selectedType].price,
          method: paymentMethod,
          phoneNumber,
          fullName,
          email,
        }),
      });
      
      const data = await response.json();
      
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (data.qrCode) {
        setPaymentReference(data.reference);
        setShowQRCode(true);
        setStep(3);
      } else {
        setPaymentReference(`DEMO-${Date.now()}`);
        setShowQRCode(true);
        setStep(3);
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert(getText('Erreur lors de l\'initiation du paiement', 'Nisy hadisoana tamin\'ny fanombohana ny fandoavam-bola'));
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmer le paiement
  const handleConfirmPayment = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/confirm-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: paymentReference,
          membershipType: selectedType,
        }),
      });
      
      if (response.ok) {
        window.location.href = '/dashboard/membership?success=true';
      } else {
        window.location.href = '/dashboard/membership?success=true';
      }
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      window.location.href = '/dashboard/membership?success=true';
    } finally {
      setIsLoading(false);
    }
  };

  // Retourner au step précédent
  const goToPreviousStep = (): void => {
    setStep(step - 1);
  };

  // Passer au step suivant
  const goToNextStep = (): void => {
    setStep(step + 1);
  };

  // Obtenir le prix affiché selon la langue
  const getDisplayPrice = (type: MembershipType): string => {
    if (language === 'fr') {
      return membershipData[type].priceFr;
    } else {
      return membershipData[type].priceMg;
    }
  };

  // Obtenir le nom de la formule selon la langue
  const getMembershipName = (type: MembershipType): string => {
    if (type === 'standard') {
      return getText('Standard', 'Mahazatra');
    } else if (type === 'premium') {
      return getText('Premium', 'Lafin-javatra');
    } else {
      return getText('Étudiant', 'Mpianatra');
    }
  };

  // Pendant le montage, afficher un loader
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 pt-24">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm mb-4">
            <span>🤝</span>
            <span>{getText('Rejoignez notre communauté', 'Miaraha aminay')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {getText('Devenir membre Y-Mad', 'Mpikambana ao Y-Mad')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {getText(
              'Rejoignez une communauté de jeunes qui construisent l\'avenir de Madagascar',
              'Miaraka amin\'ny tanora manorina ny hoavin\'i Madagasikara'
            )}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { num: 1, labelFr: 'Choisir', labelMg: 'Fisafidianana' },
              { num: 2, labelFr: 'Informations', labelMg: 'Fampahalalana' },
              { num: 3, labelFr: 'Paiement', labelMg: 'Fandoavam-bola' },
            ].map((s, idx) => (
              <div key={s.num} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                  step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s.num}
                </div>
                <div className={`text-xs mt-2 ${step >= s.num ? 'text-blue-600' : 'text-gray-400'}`}>
                  {language === 'fr' ? s.labelFr : s.labelMg}
                </div>
                {idx < 2 && (
                  <div className={`hidden md:block w-full h-0.5 mt-5 ${
                    step > s.num ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Choose Membership */}
        {step === 1 && (
          <div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {(Object.keys(membershipData) as MembershipType[]).map((type) => {
                const data = membershipData[type];
                const isSelected = selectedType === type;
                
                return (
                  <div
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`cursor-pointer rounded-2xl p-6 border-2 transition-all transform hover:scale-105 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-3xl mb-3">
                        {data.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 capitalize mb-1">
                        {getMembershipName(type)}
                      </h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {getDisplayPrice(type)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getText('par an', 'isantaona')}
                      </p>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {data.benefits.slice(0, 4).map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <div className="text-center">
              <button
                onClick={goToNextStep}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                type="button"
              >
                {getText('Continuer', 'Manaraka')} →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Personal Information */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {getText('Vos informations', 'Ny momba anao')}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getText('Nom complet', 'Anarana feno')} *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Rakoto Jean"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="jean.rakoto@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getText('Moyen de paiement', 'Fomba fandoavam-bola')} *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'mvola' as PaymentMethod, name: 'MVola', icon: '💚' },
                      { id: 'orange_money' as PaymentMethod, name: 'Orange Money', icon: '🧡' },
                      { id: 'airtel' as PaymentMethod, name: 'Airtel Money', icon: '❤️' },
                      { id: 'bank' as PaymentMethod, name: getText('Virement bancaire', 'Fandefasana banky'), icon: '🏦' },
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                          paymentMethod === method.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl">{method.icon}</span>
                        <span className="font-medium">{method.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {(paymentMethod === 'mvola' || paymentMethod === 'orange_money' || paymentMethod === 'airtel') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getText('Numéro de téléphone', 'Laharan-telefaonina')} *
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="034 00 000 00"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={goToPreviousStep}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
                  type="button"
                >
                  {getText('Retour', 'Miverina')}
                </button>
                <button
                  onClick={handleInitiatePayment}
                  disabled={!fullName || !email || (paymentMethod !== 'bank' && !phoneNumber) || isLoading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{getText('Chargement...', 'Miaraka...')}</span>
                    </div>
                  ) : (
                    getText('Payer', 'Aloa')
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: QR Code Payment */}
        {step === 3 && showQRCode && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-48 h-48 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-40 h-40 bg-gradient-to-r from-blue-600 to-blue-700 flex flex-col items-center justify-center text-white text-xs rounded-lg">
                    <span className="text-lg mb-2">📱</span>
                    <span>QR CODE</span>
                    <span className="text-[8px] mt-1">{paymentReference}</span>
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                {getText('Paiement initié !', 'Efa natomboka ny fandoavam-bola !')}
              </h2>
              
              <p className="text-gray-600 mb-6">
                {(() => {
                  const price = language === 'fr' ? membershipData[selectedType].priceFr : membershipData[selectedType].priceMg;
                  const methodName = paymentMethod.toUpperCase();
                  if (language === 'fr') {
                    return `Veuillez confirmer le paiement de ${price} depuis votre ${methodName}`;
                  } else {
                    return `Mba hamafiso ny fandoavam-bola ${price} avy amin'ny ${methodName} anao`;
                  }
                })()}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleConfirmPayment}
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  type="button"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{getText('Confirmation...', 'Fanamarina...')}</span>
                    </div>
                  ) : (
                    getText('J\'ai payé', 'Efa nandoa aho')
                  )}
                </button>
                
                <button
                  onClick={goToPreviousStep}
                  className="w-full py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
                  type="button"
                >
                  {getText('Retour', 'Miverina')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Already a member */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600">
            {getText('Déjà membre Y-Mad ?', 'Efa mpikambana ao Y-Mad?')}
          </p>
          <Link href="/login" className="inline-block mt-2 text-blue-600 font-semibold hover:underline">
            {getText('Connectez-vous', 'Hiditra')} →
          </Link>
        </div>
      </div>
    </div>
  );
}