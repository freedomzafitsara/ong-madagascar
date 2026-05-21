'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, MapPin, Clock, Users, User, Mail, Phone, Ticket, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

interface Event {
  id: string;
  title_fr: string;
  title_mg: string;
  description_fr: string;
  description_mg: string;
  start_datetime: string;
  end_datetime?: string;
  location: string;
  address: string;
  max_capacity: number;
  current_registrations: number;
  is_free: boolean;
  price_mga: number;
  event_type: string;
  image_url?: string;
  gallery_images?: string[];
  organizer_name: string;
  organizer_email: string;
  organizer_phone: string;
}

// ============================================================
// TYPES D EVENEMENTS
// ============================================================

const EVENT_TYPE_ICONS: Record<string, string> = {
  camp: '🏕️',
  workshop: '🔧',
  hackathon: '💻',
  conference: '🎤',
  formation: '📚',
  other: '📅'
};

const EVENT_TYPE_LABELS: Record<string, { fr: string; mg: string }> = {
  camp: { fr: 'Camp', mg: 'Toby' },
  workshop: { fr: 'Atelier', mg: 'Atelier' },
  hackathon: { fr: 'Hackathon', mg: 'Hackathon' },
  conference: { fr: 'Conference', mg: 'Konferansy' },
  formation: { fr: 'Formation', mg: 'Fampiofanana' },
  other: { fr: 'Autre', mg: 'Hafa' }
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function EventDetailPage() {
  const { language } = useLanguage();
  const params = useParams();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
    } catch (error) {
      console.error('Erreur:', error);
      setError(language === 'fr' ? 'Erreur de connexion' : 'Olana amin\'ny fifandraisana');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // SECTION 2 : FONCTIONS UTILITAIRES
  // ============================================================

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === undefined) return '0 Ar';
    return amount.toLocaleString('fr-FR') + ' Ar';
  };

  const getEventTitle = () => {
    if (!event) return '';
    return language === 'fr' ? event.title_fr : event.title_mg;
  };

  const getEventDescription = () => {
    if (!event) return '';
    return language === 'fr' ? event.description_fr : event.description_mg;
  };

  const getEventTypeLabel = () => {
    if (!event) return '';
    const labels = EVENT_TYPE_LABELS[event.event_type] || EVENT_TYPE_LABELS.other;
    return language === 'fr' ? labels.fr : labels.mg;
  };

  const getEventTypeIcon = () => {
    if (!event) return '📅';
    return EVENT_TYPE_ICONS[event.event_type] || EVENT_TYPE_ICONS.other;
  };

  const availableSpots = event ? event.max_capacity - event.current_registrations : 0;
  const isFull = event ? event.max_capacity > 0 && availableSpots === 0 : false;
  const registrationProgress = event ? (event.current_registrations / event.max_capacity) * 100 : 0;

  // ============================================================
  // SECTION 3 : ECRAN DE CHARGEMENT
  // ============================================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  // ============================================================
  // SECTION 4 : ERREUR
  // ============================================================

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
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
  // SECTION 5 : RENDU PRINCIPAL
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        
        {/* SOUS-SECTION 5.1 : LIEN DE RETOUR */}
        <div className="mb-6">
          <Link href="/events" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition">
            <ArrowLeft className="w-4 h-4" />
            {language === 'fr' ? 'Tous les evenements' : 'Hetsika rehetra'}
          </Link>
        </div>

        {/* SOUS-SECTION 5.2 : CARTE PRINCIPALE */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* En-tete avec image/icone */}
          <div className="relative h-64 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
            <span className="text-8xl">{getEventTypeIcon()}</span>
            {event.is_free && (
              <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                {language === 'fr' ? 'Gratuit' : 'Maimaim-poana'}
              </div>
            )}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg px-4 py-2 text-gray-700 font-semibold">
              {getEventTypeLabel()}
            </div>
          </div>

          <div className="p-6 md:p-8">
            
            {/* Titre */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {getEventTitle()}
            </h1>

            {/* SOUS-SECTION 5.3 : INFORMATIONS PRATIQUES */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 text-gray-600 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">{language === 'fr' ? 'Date' : 'Daty'}</span>
                </div>
                <p className="text-gray-800 font-medium">{formatDate(event.start_datetime)}</p>
                <p className="text-gray-500 text-sm">{formatTime(event.start_datetime)}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 text-gray-600 mb-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">{language === 'fr' ? 'Lieu' : 'Toerana'}</span>
                </div>
                <p className="text-gray-800 font-medium">{event.location}</p>
                {event.address && (
                  <p className="text-gray-500 text-sm">{event.address}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 text-gray-600 mb-2">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">{language === 'fr' ? 'Capacite' : 'Fahaizana'}</span>
                </div>
                <p className="text-gray-800 font-medium">
                  {event.current_registrations} / {event.max_capacity > 0 ? event.max_capacity : '∞'} inscrits
                </p>
                {event.max_capacity > 0 && (
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(registrationProgress, 100)}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 text-gray-600 mb-2">
                  <User className="w-5 h-5" />
                  <span className="font-medium">{language === 'fr' ? 'Organisateur' : 'Mpandrindra'}</span>
                </div>
                <p className="text-gray-800 font-medium">{event.organizer_name}</p>
                <p className="text-gray-500 text-sm">{event.organizer_email}</p>
              </div>
            </div>

            {/* SOUS-SECTION 5.4 : DESCRIPTION */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                {language === 'fr' ? 'Description' : 'Famaritana'}
              </h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {getEventDescription()}
              </div>
            </div>

            {/* SOUS-SECTION 5.5 : PRIX */}
            {!event.is_free && (
              <div className="mb-8 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">{language === 'fr' ? 'Prix' : 'Vidiny'}</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(event.price_mga)}</span>
                </div>
              </div>
            )}

            {/* SOUS-SECTION 5.6 : BOUTON D INSCRIPTION */}
            <div className="border-t border-gray-200 pt-6">
              {isFull ? (
                <div className="block w-full text-center py-4 rounded-xl font-semibold text-lg bg-gray-200 text-gray-500 cursor-not-allowed">
                  {language === 'fr' ? 'Evenement complet' : 'Feno ny hetsika'}
                </div>
              ) : (
                <Link
                  href={`/events/${event.id}/register`}
                  className="block w-full text-center py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-md"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Ticket className="w-5 h-5" />
                    {language === 'fr' ? "S'inscrire maintenant" : 'Misoratra anarana izao'}
                  </span>
                </Link>
              )}
              {!isFull && !event.is_free && (
                <p className="text-center text-gray-500 text-sm mt-3">
                  {language === 'fr' 
                    ? 'Paiement securise par MVola, Orange Money ou Airtel Money'
                    : 'Fandoavam-bola azo antoka amin\'ny MVola, Orange Money na Airtel Money'}
                </p>
              )}
            </div>

            {/* SOUS-SECTION 5.7 : CONTACT ORGANISATEUR */}
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                {language === 'fr' 
                  ? `Une question ? Contactez ${event.organizer_name} au ${event.organizer_phone || YMAD_INFO.phone}`
                  : `Manana fanontaniana? Mifandraisa amin'ny ${event.organizer_name} amin'ny ${event.organizer_phone || YMAD_INFO.phone}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const YMAD_INFO = {
  phone: '+261 32 04 856 97',
  email: 'ymad.mg@gmail.com'
};