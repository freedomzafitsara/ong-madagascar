'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Event {
  id: string;
  title_fr: string;
  title_mg: string;
  is_free: boolean;
  price_mga: number;
  max_capacity: number;
  current_registrations: number;
}

export default function EventRegistrationPage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    paymentMethod: 'mvola',
  });

  useEffect(() => {
    fetchEvent();
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`);
      const data = await response.json();
      setEvent(data);
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/events/${params.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setRegistrationId(data.registrationId);
        if (data.qrCode) {
          setQrCode(data.qrCode);
        }
        setStep(2);
      } else {
        alert(data.message || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSpots = event ? event.max_capacity - event.current_registrations : 0;
  const isFull = availableSpots === 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!event || isFull) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-700 mb-2">
            {isFull ? t('events.full') : (language === 'fr' ? 'Événement non trouvé' : 'Tsy hita ny hetsika')}
          </h1>
          <Link href="/events" className="text-blue-600 hover:underline">
            {language === 'fr' ? 'Retour aux événements' : 'Hiverina any amin\'ny hetsika'}
          </Link>
        </div>
      </div>
    );
  }

  if (step === 2 && qrCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
        <div className="container mx-auto max-w-md px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              {language === 'fr' ? 'Inscription confirmée !' : 'Vita ny fisoratana anarana !'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {language === 'fr' 
                ? 'Vous recevrez un email de confirmation avec votre billet QR Code.'
                : 'Hahazo mail fanamafisana misy ny tapakila QR Code anao.'}
            </p>

            <div className="bg-gray-100 rounded-xl p-4 mb-6">
              <div className="w-40 h-40 mx-auto bg-white rounded-lg flex items-center justify-center">
                {/* QR Code placeholder - à remplacer par vrai QR code */}
                <div className="text-center">
                  <div className="w-32 h-32 bg-black flex items-center justify-center text-white text-xs rounded">
                    QR CODE<br/>{registrationId?.slice(-8)}
                  </div>
                </div>
              </div>
              <p className="text-center text-gray-500 text-sm mt-3">
                {t('membership.qr_code')}
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/events"
                className="block w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                {language === 'fr' ? 'Voir d\'autres événements' : 'Jereo hetsika hafa'}
              </Link>
              <button
                onClick={() => window.print()}
                className="block w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                {language === 'fr' ? 'Imprimer le billet' : 'Atontosoro ny tapakila'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-2xl px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href={`/events/${event.id}`} className="text-blue-600 hover:underline flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {language === 'fr' ? 'Retour à l\'événement' : 'Hiverina any amin\'ny hetsika'}
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">
              {language === 'fr' ? 'Inscription à l\'événement' : 'Fisoratana anarana amin\'ny hetsika'}
            </h1>
            <p className="text-blue-100 mt-1">
              {language === 'fr' ? event.title_fr : event.title_mg}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'fr' ? 'Nom complet' : 'Anarana feno'} *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Rakoto Jean"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="jean.rakoto@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'fr' ? 'Téléphone' : 'Telefaonina'} *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="034 00 000 00"
              />
            </div>

            {!event.is_free && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('membership.payment_method')} *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['mvola', 'orange_money', 'airtel'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: method })}
                      className={`p-3 rounded-lg border-2 transition ${
                        formData.paymentMethod === method
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-700">{method.toUpperCase()}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!event.is_free && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{language === 'fr' ? 'Montant à payer' : 'Volana aloa'}</span>
                  <span className="text-2xl font-bold text-blue-600">{event.price_mga.toLocaleString()} Ar</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('common.loading')}</span>
                </div>
              ) : (
                t('events.register')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}