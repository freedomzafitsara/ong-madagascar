'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { pageService, PageBackground } from '@/services/pageService';
import { 
  Sparkles, CheckCircle, ArrowRight, Loader2, Star, Crown, GraduationCap,
  Smartphone, Building, QrCode
} from 'lucide-react';

// Definition des types
type MembershipType = 'standard' | 'premium' | 'student';
type PaymentMethod = 'mvola' | 'orange_money' | 'airtel' | 'bank';

// Interface pour les donnees d'adhesion
interface MembershipData {
  price: number;
  priceFr: string;
  priceMg: string;
  color: string;
  icon: JSX.Element;
  benefits: string[];
}

// Donnees des formules d'adhesion
const membershipData: Record<MembershipType, MembershipData> = {
  standard: {
    price: 25000,
    priceFr: '25 000 MGA',
    priceMg: '25 000 Ar',
    color: 'blue',
    icon: <Star className="w-8 h-8" />,
    benefits: [
      'Carte membre numerique avec QR code',
      'Acces aux evenements Y-Mad',
      'Newsletter mensuelle',
      'Reductions partenaires'
    ]
  },
  premium: {
    price: 100000,
    priceFr: '100 000 MGA',
    priceMg: '100 000 Ar',
    color: 'purple',
    icon: <Crown className="w-8 h-8" />,
    benefits: [
      'Tous les avantages Standard',
      'Acces prioritaire aux formations',
      'Invitations exclusives',
      'Certificat officiel',
      'Carte membre premium',
      'Participation aux assemblees'
    ]
  },
  student: {
    price: 10000,
    priceFr: '10 000 MGA',
    priceMg: '10 000 Ar',
    color: 'green',
    icon: <GraduationCap className="w-8 h-8" />,
    benefits: [
      'Carte membre numerique',
      'Acces aux evenements',
      'Tarif reduit formations',
      'Newsletter'
    ]
  }
};

export default function JoinPage() {
  const { language } = useLanguage();
  const [step, setStep] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<MembershipType>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mvola');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    loadPageBackground();
  }, []);

  // Chargement du fond d'ecran depuis l'espace super-admin
  const loadPageBackground = async () => {
    try {
      const background = await pageService.getBackground('join');
      if (background && background.is_active && background.image_url) {
        setPageBackground(background);
      }
    } catch (error) {
      console.error('Erreur chargement fond d ecran:', error);
    }
  };

  const getText = (frText: string, mgText: string): string => {
    return language === 'fr' ? frText : mgText;
  };

  const handleInitiatePayment = async (): Promise<void> => {
    if (!fullName || !email) {
      alert(getText('Veuillez remplir tous les champs', 'Fenoy ny tsipiriana rehetra'));
      return;
    }

    if (paymentMethod !== 'bank' && !phoneNumber) {
      alert(getText('Veuillez entrer votre numero de telephone', 'Ampidiro ny laharana telefaoninao'));
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
      alert(getText('Erreur lors de l initiation du paiement', 'Nisy hadisoana tamin\'ny fanombohana ny fandoavam-bola'));
    } finally {
      setIsLoading(false);
    }
  };

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

  const goToPreviousStep = (): void => setStep(step - 1);
  const goToNextStep = (): void => setStep(step + 1);

  const getDisplayPrice = (type: MembershipType): string => {
    return language === 'fr' ? membershipData[type].priceFr : membershipData[type].priceMg;
  };

  const getMembershipName = (type: MembershipType): string => {
    const names = {
      standard: getText('Standard', 'Mahazatra'),
      premium: getText('Premium', 'Lafin-javatra'),
      student: getText('Etudiant', 'Mpianatra')
    };
    return names[type];
  };

  // Style du fond d'ecran plein ecran
  const overlayStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundColor: `rgba(0, 0, 0, ${(pageBackground.overlay_opacity || 40) / 100})`,
  } : {};

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section avec fond d'ecran PLEIN ECRAN */}
      <section className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          {pageBackground?.image_url && pageBackground.is_active ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${pageBackground.image_url})` }}
              />
              <div className="absolute inset-0" style={overlayStyle} />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-900">
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          )}
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 py-20">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium tracking-wide text-white">
              {getText('Rejoignez notre communaute', 'Miaraha aminay')}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-2xl animate-fade-in-up">
            {getText('Devenir membre Y-Mad', 'Mpikambana ao Y-Mad')}
          </h1>
          
          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto">
            {getText(
              'Rejoignez une communaute de jeunes qui construisent l avenir de Madagascar',
              'Miaraka amin\'ny tanora manorina ny hoavin\'i Madagasikara'
            )}
          </p>
        </div>
      </section>

      {/* Section contenu avec fond blanc */}
      <div className="relative z-10 bg-white">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          
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
                        <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
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
                            <CheckCircle className="w-4 h-4 text-green-500" />
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
                  {getText('Continuer', 'Manaraka')} <ArrowRight className="w-4 h-4 inline ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {step === 2 && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {getText('Vos informations', 'Ny momba anao')}
                </h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getText('Nom complet', 'Anarana feno')} *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="jean.rakoto@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getText('Moyen de paiement', 'Fomba fandoavam-bola')} *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mvola')}
                        className={`p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                          paymentMethod === 'mvola'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Smartphone className="w-5 h-5 text-green-600" />
                        <span className="font-medium">MVola</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('orange_money')}
                        className={`p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                          paymentMethod === 'orange_money'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Smartphone className="w-5 h-5 text-orange-500" />
                        <span className="font-medium">Orange Money</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('airtel')}
                        className={`p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                          paymentMethod === 'airtel'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Smartphone className="w-5 h-5 text-red-600" />
                        <span className="font-medium">Airtel Money</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bank')}
                        className={`p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                          paymentMethod === 'bank'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Building className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">{getText('Virement bancaire', 'Fandefasana banky')}</span>
                      </button>
                    </div>
                  </div>

                  {(paymentMethod === 'mvola' || paymentMethod === 'orange_money' || paymentMethod === 'airtel') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {getText('Numero de telephone', 'Laharan-telefaonina')} *
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                        <Loader2 className="w-5 h-5 animate-spin" />
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
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
                <div className="w-48 h-48 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <div className="w-40 h-40 bg-gradient-to-r from-blue-600 to-blue-700 flex flex-col items-center justify-center text-white text-xs rounded-lg">
                    <QrCode className="w-16 h-16 mb-2" />
                    <span>QR CODE</span>
                    <span className="text-[8px] mt-1">{paymentReference}</span>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-green-600 mb-4">
                  {getText('Paiement initie', 'Efa natomboka ny fandoavam-bola')}
                </h2>
                
                <p className="text-gray-600 mb-6">
                  {(() => {
                    const price = language === 'fr' ? membershipData[selectedType].priceFr : membershipData[selectedType].priceMg;
                    const methodName = paymentMethod.toUpperCase();
                    return `${getText('Veuillez confirmer le paiement de', 'Mba hamafiso ny fandoavam-bola')} ${price} ${getText('depuis votre', 'avy amin\'ny')} ${methodName}`;
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
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{getText('Confirmation...', 'Fanamarina...')}</span>
                      </div>
                    ) : (
                      getText('J ai paye', 'Efa nandoa aho')
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
              {getText('Deja membre Y-Mad ?', 'Efa mpikambana ao Y-Mad?')}
            </p>
            <Link href="/login" className="inline-block mt-2 text-blue-600 font-semibold hover:underline">
              {getText('Connectez-vous', 'Hiditra')} <ArrowRight className="w-4 h-4 inline ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}