'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, CheckCircle, ArrowLeft, CreditCard, 
  Phone, Mail, User, Ticket, XCircle, MapPin, Calendar
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

interface Event {
  id: string;
  title: string;
  title_mg?: string;
  description?: string;
  description_mg?: string;
  is_free: boolean;
  price_mga?: number;
  price?: number;
  max_capacity?: number;
  current_registrations?: number;
  currentRegistrations?: number;
  location?: string;
  start_date?: string;
  start_datetime?: string;
  startDate?: string;
  end_date?: string;
  end_datetime?: string;
  image_url?: string;
  status: string;
}

interface RegistrationResponse {
  success: boolean;
  message: string;
  registrationId: string;
  registration: {
    id: string;
    fullName: string;
    email: string;
    status: string;
  };
}

export default function EventRegistrationPage() {
  const { language } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [registration, setRegistration] = useState<any>(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    paymentMethod: 'mvola',
  });

  // ============================================================
  // SECTION 1 : CHARGEMENT DE L EVENEMENT
  // ============================================================

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else if (response.status === 404) {
        setError(language === 'fr' ? 'Evenement non trouve' : 'Tsy hita ny hetsika');
      } else {
        setError(language === 'fr' ? 'Erreur de chargement' : 'Tsy nahomby ny fandefasana');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(language === 'fr' ? 'Erreur de connexion' : 'Olana amin\'ny fifandraisana');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // SECTION 2 : VALIDATION ET SOUMISSION
  // ============================================================

  const validateForm = () => {
    const trimmedName = formData.fullName.trim();
    const nameParts = trimmedName.split(' ');
    
    if (trimmedName.length < 3) {
      setError(language === 'fr' ? 'Veuillez entrer votre nom et prenom complets' : 'Ampidiro ny anaranao feno');
      return false;
    }
    
    if (nameParts.length < 2) {
      setError(language === 'fr' ? 'Veuillez entrer votre nom et votre prenom' : 'Ampidiro ny anaranao sy ny fanampiny');
      return false;
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError(language === 'fr' ? 'Veuillez entrer une adresse email valide' : 'Ampidiro ny adiresy email manan-kery');
      return false;
    }
    
    if (formData.phone.trim() && formData.phone.trim().length < 9) {
      setError(language === 'fr' ? 'Le numero doit contenir au moins 9 chiffres' : 'Ny laharana dia tsy maintsy misy isa 9 farafahakeliny');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        paymentMethod: event?.is_free ? null : formData.paymentMethod,
      };
      
      console.log('Envoi inscription:', payload);
      
      const response = await fetch(`${API_URL}/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data: RegistrationResponse = await response.json();
      
      if (response.ok) {
        setRegistration(data.registration);
        setStep(2);
      } else {
        console.error('Erreur backend:', data);
        const errorMsg = data.message || (language === 'fr' ? 'Erreur lors de l inscription' : 'Nisy olana tamin\'ny fisoratana anarana');
        setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(language === 'fr' ? 'Erreur de connexion au serveur' : 'Olana amin\'ny fifandraisana');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // SECTION 3 : FONCTIONS UTILITAIRES
  // ============================================================

  const formatPrice = (eventData: Event | null) => {
    if (!eventData) return '0 Ar';
    if (eventData.is_free) return 'Gratuit';
    const price = eventData.price_mga || eventData.price || 0;
    return price.toLocaleString('fr-FR') + ' Ar';
  };

  const formatDate = (eventData: Event | null) => {
    if (!eventData) return language === 'fr' ? 'A definir' : 'Ho fantatra';
    const dateStr = eventData.start_date || eventData.start_datetime || eventData.startDate;
    if (!dateStr) return language === 'fr' ? 'A definir' : 'Ho fantatra';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return language === 'fr' ? 'Date invalide' : 'Daty tsy azo';
    }
  };

  const getEventTitle = (eventData: Event | null) => {
    if (!eventData) return '';
    return language === 'fr' ? eventData.title : (eventData.title_mg || eventData.title);
  };

  const getEventLocation = (eventData: Event | null) => {
    if (!eventData) return '';
    return eventData.location || '';
  };

  const isEventFull = (eventData: Event | null) => {
    if (!eventData) return false;
    const maxCap = eventData.max_capacity ?? 0;
    const currentReg = eventData.current_registrations ?? eventData.currentRegistrations ?? 0;
    return maxCap > 0 && currentReg >= maxCap;
  };

  // ============================================================
  // SECTION 4 : ECRAN DE CHARGEMENT
  // ============================================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  // ============================================================
  // SECTION 5 : ERREUR OU EVENEMENT NON TROUVE
  // ============================================================

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {language === 'fr' ? 'Evenement non trouve' : 'Tsy hita ny hetsika'}
          </h1>
          <p className="text-gray-500 mb-6">{error || (language === 'fr' ? "Cet evenement n'existe pas" : 'Tsy misy ity hetsika ity')}</p>
          <Link href="/events" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            {language === 'fr' ? 'Voir tous les evenements' : 'Jereo ny hetsika rehetra'}
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // SECTION 6 : EVENEMENT COMPLET
  // ============================================================

  if (isEventFull(event)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {language === 'fr' ? 'Evenement complet' : 'Feno ny hetsika'}
          </h1>
          <p className="text-gray-500 mb-6">
            {language === 'fr' 
              ? 'Cet evenement a atteint sa capacite maximale.'
              : 'Feno ny toerana ho an\'ity hetsika ity.'}
          </p>
          <Link href="/events" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            {language === 'fr' ? 'Decouvrir d autres evenements' : 'Hijery hetsika hafa'}
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // SECTION 7 : CONFIRMATION D INSCRIPTION
  // ============================================================

  if (step === 2 && registration) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto max-w-md px-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5 text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                {language === 'fr' ? 'Inscription confirmee' : 'Vita ny fisoratana anarana'}
              </h1>
            </div>

            <div className="p-6 text-center">
              <p className="text-gray-600 mb-1">
                {language === 'fr' ? 'Merci' : 'Misaotra'} <span className="font-semibold text-gray-800">{registration.fullName}</span>
              </p>
              <p className="text-gray-500 text-sm">
                {language === 'fr' 
                  ? 'Votre inscription a bien ete enregistree.'
                  : 'Vita soa aman-tsara ny fisoratanao anarana.'}
              </p>
            </div>

            <div className="border-t border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-3 text-center">
                {language === 'fr' ? 'Details de l evenement' : 'Antsipirihan\'ny hetsika'}
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{language === 'fr' ? 'Evenement :' : 'Hetsika :'}</span> {getEventTitle(event)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{language === 'fr' ? 'Date :' : 'Daty :'}</span> {formatDate(event)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{language === 'fr' ? 'Lieu :' : 'Toerana :'}</span> {getEventLocation(event) || 'Antananarivo'}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 p-6 space-y-3">
              <Link
                href="/events"
                className="block w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-center"
              >
                {language === 'fr' ? 'Voir d autres evenements' : 'Jereo hetsika hafa'}
              </Link>
              <button
                onClick={() => window.print()}
                className="block w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                {language === 'fr' ? 'Imprimer la confirmation' : 'Atontosoro ny fanamafisana'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // SECTION 8 : FORMULAIRE D INSCRIPTION
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto max-w-2xl px-4">
        
        <div className="mb-6">
          <Link href="/events" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition">
            <ArrowLeft className="w-4 h-4" />
            {language === 'fr' ? 'Retour aux evenements' : 'Hiverina any amin\'ny hetsika'}
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
            <h1 className="text-2xl font-bold text-white">
              {language === 'fr' ? 'Formulaire d inscription' : 'Fisoratana anarana'}
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              {getEventTitle(event)}
            </p>
          </div>

          <div className="px-6 pt-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                {event.start_date || event.start_datetime || event.startDate ? (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(event)}
                  </span>
                ) : null}
                {event.location ? (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.location}
                  </span>
                ) : null}
                <span className={event.is_free ? 'text-green-600 font-semibold' : 'text-blue-600 font-semibold'}>
                  {formatPrice(event)}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'fr' ? 'Nom complet' : 'Anarana feno'} *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Votre nom et prenom"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'fr' ? 'Telephone' : 'Telefaonina'}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="032 12 345 67"
                />
              </div>
            </div>

            {!event.is_free && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'fr' ? 'Moyen de paiement' : 'Fomba fandoavana'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['mvola', 'orange_money', 'airtel'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: method })}
                      className={`p-3 rounded-xl border-2 transition flex items-center justify-center gap-2 ${
                        formData.paymentMethod === method
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className={`w-4 h-4 ${formData.paymentMethod === method ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="font-semibold text-gray-700 uppercase text-sm">{method.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{language === 'fr' ? 'Inscription en cours...' : 'Fisoratana...'}</span>
                  </>
                ) : (
                  <span>{language === 'fr' ? "S'inscrire" : 'Misoratra anarana'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            {language === 'fr' 
              ? 'Une confirmation vous sera envoyee par email.'
              : 'Hahazo mail fanamafisana.'}
          </p>
        </div>
      </div>
    </div>
  );
}