'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

export default function EventDetailPage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const getEventTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      camp: '⛺',
      workshop: '🔧',
      hackathon: '💻',
      conference: '🎤',
      formation: '📚',
    };
    return icons[type] || '📅';
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

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-700 mb-2">
            {language === 'fr' ? 'Événement non trouvé' : 'Tsy hita ny hetsika'}
          </h1>
          <Link href="/events" className="text-blue-600 hover:underline">
            {language === 'fr' ? 'Retour aux événements' : 'Hiverina any amin\'ny hetsika'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/events" className="text-blue-600 hover:underline flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {language === 'fr' ? 'Tous les événements' : 'Hetsika rehetra'}
          </Link>
        </div>

        {/* Event Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="relative h-64 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-8xl">{getEventTypeIcon(event.event_type)}</span>
            {event.is_free && (
              <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                {t('events.free')}
              </div>
            )}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg px-4 py-2 text-gray-700 font-semibold">
              {event.event_type === 'camp' && t('events.camp')}
              {event.event_type === 'workshop' && t('events.workshop')}
              {event.event_type === 'hackathon' && t('events.hackathon')}
              {event.event_type === 'conference' && t('events.conference')}
              {event.event_type === 'formation' && t('events.training')}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === 'fr' ? event.title_fr : event.title_mg}
            </h1>

            {/* Event Info Cards */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 text-gray-600 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{t('events.date')}</span>
                </div>
                <p className="text-gray-800">
                  {new Date(event.start_datetime).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-gray-500 text-sm">
                  {new Date(event.start_datetime).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'mg-MG')}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 text-gray-600 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">{t('events.location')}</span>
                </div>
                <p className="text-gray-800">{event.location}</p>
                <p className="text-gray-500 text-sm">{event.address}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 text-gray-600 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="font-medium">{t('events.capacity')}</span>
                </div>
                <p className="text-gray-800">
                  {event.current_registrations} / {event.max_capacity} inscrits
                </p>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${(event.current_registrations / event.max_capacity) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 text-gray-600 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">{t('events.organizer')}</span>
                </div>
                <p className="text-gray-800">{event.organizer_name}</p>
                <p className="text-gray-500 text-sm">{event.organizer_email}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                {language === 'fr' ? 'Description' : 'Famaritana'}
              </h2>
              <div className="prose max-w-none text-gray-600">
                <p>{language === 'fr' ? event.description_fr : event.description_mg}</p>
              </div>
            </div>

            {/* Price */}
            {!event.is_free && (
              <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">{language === 'fr' ? 'Prix' : 'Vidiny'}</span>
                  <span className="text-2xl font-bold text-blue-600">{event.price_mga.toLocaleString()} Ar</span>
                </div>
              </div>
            )}

            {/* Registration Button */}
            <div className="border-t border-gray-200 pt-6">
              <Link
                href={`/events/${event.id}/register`}
                className={`block w-full text-center py-4 rounded-xl font-semibold text-lg transition ${
                  isFull
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                onClick={(e) => isFull && e.preventDefault()}
              >
                {isFull ? t('events.full') : t('events.register')}
              </Link>
              {!isFull && !event.is_free && (
                <p className="text-center text-gray-500 text-sm mt-3">
                  {language === 'fr' ? 'Paiement sécurisé par MVola, Orange Money ou Airtel Money' : 'Fandoavam-bola azo antoka amin\'ny MVola, Orange Money na Airtel Money'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}