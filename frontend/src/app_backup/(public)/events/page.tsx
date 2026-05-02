'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, MapPin, Clock, Users, Search, Filter, 
  Sparkles, ChevronRight, Ticket, CheckCircle, AlertCircle
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

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
  event_type: 'camp' | 'workshop' | 'hackathon' | 'conference' | 'formation';
  status: string;
  organizer_name: string;
  image_url?: string;
}

const eventTypes = [
  { value: 'camp', labelFr: 'Camp', labelMg: 'Toby', icon: '⛺', color: 'bg-green-100 text-green-700' },
  { value: 'workshop', labelFr: 'Atelier', labelMg: 'Atelier', icon: '🔧', color: 'bg-blue-100 text-blue-700' },
  { value: 'hackathon', labelFr: 'Hackathon', labelMg: 'Hackathon', icon: '💻', color: 'bg-purple-100 text-purple-700' },
  { value: 'conference', labelFr: 'Conférence', labelMg: 'Konferansy', icon: '🎤', color: 'bg-orange-100 text-orange-700' },
  { value: 'formation', labelFr: 'Formation', labelMg: 'Fampiofanana', icon: '📚', color: 'bg-rose-100 text-rose-700' },
];

export default function EventsPage() {
  const { t, language } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [bgImage, setBgImage] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
    loadBgImage();
  }, []);

  const loadEvents = () => {
    try {
      const stored = localStorage.getItem('ymad_events');
      if (stored) {
        const allEvents = JSON.parse(stored);
        const publishedEvents = allEvents.filter((e: Event) => e.status === 'published');
        setEvents(publishedEvents);
        setFilteredEvents(publishedEvents);
      } else {
        // Données par défaut
        const defaultEvents: Event[] = [
          {
            id: '1',
            title_fr: 'Camp de Leadership 2025',
            title_mg: 'Toby Fitarihana 2025',
            description_fr: 'Un camp de 5 jours pour développer vos compétences en leadership. Au programme : ateliers, team building, conférences.',
            description_mg: 'Toby 5 andro hampandroso ny fahaizanao fitarihana. Hetsika : atelier, team building, konferansy.',
            start_datetime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Antananarivo',
            address: 'Centre de Formation Ampefiloha',
            max_capacity: 100,
            current_registrations: 45,
            is_free: false,
            price_mga: 50000,
            event_type: 'camp',
            status: 'published',
            organizer_name: 'Y-Mad',
          },
          {
            id: '2',
            title_fr: 'Atelier Entrepreneuriat',
            title_mg: 'Atelier Fandraharahana',
            description_fr: 'Apprenez à créer et gérer votre entreprise avec des experts du secteur.',
            description_mg: 'Mianatra mamorona sy mitantana orinasa miaraka amin\'ny manam-pahaizana.',
            start_datetime: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Toamasina',
            address: 'Centre de Formation Toamasina',
            max_capacity: 50,
            current_registrations: 30,
            is_free: true,
            price_mga: 0,
            event_type: 'workshop',
            status: 'published',
            organizer_name: 'Y-Mad',
          },
          {
            id: '3',
            title_fr: 'Hackathon Innovation',
            title_mg: 'Hackathon Fanavaozana',
            description_fr: '48h pour créer des solutions innovantes aux défis de Madagascar.',
            description_mg: '48 ora hamoronana vahaolana vaovao ho an\'ny fanambin\'i Madagasikara.',
            start_datetime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Antananarivo',
            address: 'Ivato International Conference Center',
            max_capacity: 80,
            current_registrations: 25,
            is_free: false,
            price_mga: 25000,
            event_type: 'hackathon',
            status: 'published',
            organizer_name: 'Y-Mad',
          },
        ];
        setEvents(defaultEvents);
        setFilteredEvents(defaultEvents);
        localStorage.setItem('ymad_events', JSON.stringify(defaultEvents));
      }
    } catch (error) {
      console.error('Erreur chargement événements:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBgImage = async () => {
    try {
      const response = await fetch('/api/admin/page-bg?page=events');
      if (response.ok) {
        const data = await response.json();
        if (data.url) setBgImage(data.url);
      }
    } catch (error) {
      console.error('Erreur chargement fond:', error);
    }
  };

  useEffect(() => {
    let filtered = [...events];
    if (searchTerm) {
      filtered = filtered.filter(e => 
        (language === 'fr' ? e.title_fr : e.title_mg).toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterType) {
      filtered = filtered.filter(e => e.event_type === filterType);
    }
    setFilteredEvents(filtered);
  }, [searchTerm, filterType, events, language]);

  const getEventTypeLabel = (type: string) => {
    const found = eventTypes.find(t => t.value === type);
    if (!found) return type;
    return language === 'fr' ? found.labelFr : found.labelMg;
  };

  const getEventTypeIcon = (type: string) => {
    const found = eventTypes.find(t => t.value === type);
    return found ? found.icon : '📅';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvailableSpots = (event: Event) => {
    return event.max_capacity - event.current_registrations;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-80 flex items-center justify-center overflow-hidden">
        {bgImage ? (
          <>
            <img src={bgImage} alt="Fond événements" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/50"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-900">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          </div>
        )}
        
        <div className="relative z-10 text-center text-white px-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span className="text-sm">Y-Mad Madagascar</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {language === 'fr' ? 'Nos événements' : 'Hetsika ataonay'}
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Participez à nos camps, ateliers et formations pour développer vos compétences'
              : 'Mandraisa anjara amin\'ny toby, atelier ary fampiofanana hanatsarana ny fahaizanao'}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType('')}
                className={`px-4 py-2 rounded-full text-sm transition ${
                  filterType === '' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {language === 'fr' ? 'Tous' : 'Rehetra'}
              </button>
              {eventTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  className={`px-4 py-2 rounded-full text-sm transition flex items-center gap-1 ${
                    filterType === type.value 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{language === 'fr' ? type.labelFr : type.labelMg}</span>
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={language === 'fr' ? 'Rechercher...' : 'Karohy...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des événements */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {language === 'fr' ? 'Aucun événement trouvé' : 'Tsy misy hetsika hita'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const availableSpots = getAvailableSpots(event);
              const isAlmostFull = availableSpots < 10 && availableSpots > 0;
              const isFull = availableSpots === 0;
              
              return (
                <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition group">
                  {/* Bannière colorée */}
                  <div className={`h-2 ${event.is_free ? 'bg-green-500' : 'bg-blue-500'}`} />
                  
                  <div className="p-6">
                    {/* Type et prix */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                        <span>{getEventTypeIcon(event.event_type)}</span>
                        <span>{getEventTypeLabel(event.event_type)}</span>
                      </span>
                      {event.is_free ? (
                        <span className="text-xs text-green-600 font-medium">Gratuit</span>
                      ) : (
                        <span className="text-sm font-bold text-blue-600">
                          {event.price_mga.toLocaleString()} Ar
                        </span>
                      )}
                    </div>
                    
                    {/* Titre */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                      {language === 'fr' ? event.title_fr : event.title_mg}
                    </h3>
                    
                    {/* Détails */}
                    <div className="space-y-2 text-gray-600 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(event.start_datetime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{formatTime(event.start_datetime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{event.current_registrations} / {event.max_capacity} inscrits</span>
                      </div>
                    </div>
                    
                    {/* Barre de progression */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`rounded-full h-1.5 transition-all ${isAlmostFull ? 'bg-orange-500' : 'bg-blue-600'}`}
                          style={{ width: `${(event.current_registrations / event.max_capacity) * 100}%` }}
                        />
                      </div>
                      {isAlmostFull && !isFull && (
                        <p className="text-xs text-orange-500 mt-1">
                          {language === 'fr' ? 'Plus que quelques places !' : 'Toerana vitsy sisa !'}
                        </p>
                      )}
                      {isFull && (
                        <p className="text-xs text-red-500 mt-1">
                          {language === 'fr' ? 'Complet' : 'Feno'}
                        </p>
                      )}
                    </div>
                    
                    {/* Bouton inscription */}
                    <Link
                      href={`/events/${event.id}`}
                      className={`block text-center py-2.5 rounded-lg font-medium transition ${
                        isFull
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isFull 
                        ? (language === 'fr' ? 'Complet' : 'Feno')
                        : (language === 'fr' ? 'S\'inscrire' : 'Misoratra anarana')
                      }
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}