'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

interface Event {
  id: string;
  title_fr: string;
  title_mg: string;
  description_fr: string;
  description_mg: string;
  start_datetime: string;
  location: string;
  max_capacity: number;
  current_registrations: number;
  is_free: boolean;
  price_mga: number;
  event_type: string;
  image_url?: string;
}

export default function EventsPage() {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
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

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, { fr: string; mg: string }> = {
      camp: { fr: 'Camp', mg: 'Toby' },
      workshop: { fr: 'Atelier', mg: 'Atelier' },
      hackathon: { fr: 'Hackathon', mg: 'Hackathon' },
      conference: { fr: 'Conférence', mg: 'Konferansy' },
      formation: { fr: 'Formation', mg: 'Fampiofanana' },
    };
    return labels[type]?.[language] || type;
  };

  const filteredEvents = events.filter(event => 
    filter === 'all' || event.event_type === filter
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('events.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('events.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {['all', 'camp', 'workshop', 'hackathon', 'conference', 'formation'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {type === 'all' && (language === 'fr' ? 'Tous' : 'Rehetra')}
                {type !== 'all' && getEventTypeLabel(type)}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {viewMode === 'grid' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const availableSpots = event.max_capacity - event.current_registrations;
              const isAlmostFull = availableSpots < 10 && availableSpots > 0;
              const isFull = availableSpots === 0;
              
              return (
                <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  {/* Event Image/Icon */}
                  <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-6xl">{getEventTypeIcon(event.event_type)}</span>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg px-3 py-1 text-sm font-semibold text-gray-700">
                      {getEventTypeLabel(event.event_type)}
                    </div>
                    {event.is_free && (
                      <div className="absolute top-4 left-4 bg-green-500 text-white rounded-lg px-3 py-1 text-sm font-semibold">
                        {t('events.free')}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                      {language === 'fr' ? event.title_fr : event.title_mg}
                    </h3>
                    
                    <div className="space-y-2 mb-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(event.start_datetime).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>{availableSpots} / {event.max_capacity} {t('events.spots_left')}</span>
                      </div>
                    </div>

                    {!event.is_free && (
                      <div className="mb-4">
                        <span className="text-blue-600 font-bold text-lg">
                          {event.price_mga.toLocaleString()} Ar
                        </span>
                      </div>
                    )}
                    
                    {isAlmostFull && !isFull && (
                      <div className="mb-3 p-2 bg-orange-100 text-orange-700 rounded-lg text-sm text-center">
                        ⚠️ {language === 'fr' ? 'Plus que quelques places !' : 'Toerana vitsy sisa !'}
                      </div>
                    )}
                    
                    {isFull && (
                      <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-lg text-sm text-center">
                        {t('events.full')}
                      </div>
                    )}

                    <Link
                      href={`/events/${event.id}`}
                      className={`block text-center py-3 rounded-lg font-medium transition ${
                        isFull
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      onClick={(e) => isFull && e.preventDefault()}
                    >
                      {isFull ? t('events.waiting_list') : t('events.register')}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Events List View */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const availableSpots = event.max_capacity - event.current_registrations;
              const isFull = availableSpots === 0;
              
              return (
                <div key={event.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getEventTypeIcon(event.event_type)}</span>
                        <span className="text-sm text-gray-500">{getEventTypeLabel(event.event_type)}</span>
                        {event.is_free && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                            {t('events.free')}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {language === 'fr' ? event.title_fr : event.title_mg}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>📅 {new Date(event.start_datetime).toLocaleDateString()}</span>
                        <span>📍 {event.location}</span>
                        <span>👥 {availableSpots} places</span>
                      </div>
                    </div>
                    <Link
                      href={`/events/${event.id}`}
                      className={`px-6 py-2 rounded-lg font-medium transition ${
                        isFull
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      onClick={(e) => isFull && e.preventDefault()}
                    >
                      {isFull ? t('events.full') : t('events.register')}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {language === 'fr' ? 'Aucun événement trouvé' : 'Tsy misy hetsika hita'}
            </h3>
            <p className="text-gray-500">
              {language === 'fr' ? 'Revenez plus tard pour découvrir nos prochains événements' : 'Miverena any aoriana hijery ny hetsika ho avy'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}