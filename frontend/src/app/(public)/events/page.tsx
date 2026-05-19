// frontend/src/app/(public)/events/page.tsx
// VERSION FINALE - MÊME DESIGN QUE LA PAGE PROJETS

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { pageService, PageBackground } from '@/services/pageService';
import { 
  Search, MapPin, Calendar, Heart, X, Image as ImageIcon, 
  ChevronRight, Grid3x3, LayoutList, Sparkles, TrendingUp, 
  Users, Globe, ArrowRight, Target, BookOpen, 
  Briefcase, UsersRound, Loader2, Clock, Ticket, AlertCircle
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface Event {
  id: string;
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  location: string;
  event_type: string;
  start_datetime: string;
  end_datetime?: string;
  image_url?: string;
  max_capacity: number;
  current_registrations: number;
  is_free: boolean;
  price_mga: number;
  status: string;
  created_at: string;
}

// Types d'événements avec icones professionnelles
const eventTypes = [
  { value: 'camp', labelFr: 'Camp', labelMg: 'Toby', icon: Users },
  { value: 'workshop', labelFr: 'Atelier', labelMg: 'Atelier', icon: Briefcase },
  { value: 'hackathon', labelFr: 'Hackathon', labelMg: 'Hackathon', icon: Target },
  { value: 'conference', labelFr: 'Conférence', labelMg: 'Konferansy', icon: UsersRound },
  { value: 'formation', labelFr: 'Formation', labelMg: 'Fampiofanana', icon: BookOpen },
  { value: 'other', labelFr: 'Autre', labelMg: 'Hafa', icon: Calendar },
];

export default function EventsPage() {
  const { t, language } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);

  // Chargement du fond d'écran et des événements
  useEffect(() => {
    loadPageBackground();
    loadEvents();
  }, []);

  const loadPageBackground = async () => {
    try {
      const background = await pageService.getBackground('events');
      if (background && background.is_active && background.image_url) {
        setPageBackground(background);
      }
    } catch (error) {
      console.error('Erreur chargement fond d\'écran:', error);
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/events');
      let allEvents = response.data.data || response.data || [];
      
      // Filtrer les événements publiés
      const publishedEvents = allEvents.filter((e: Event) => e.status === 'published');
      setEvents(publishedEvents);
      setFilteredEvents(publishedEvents);
    } catch (error) {
      console.error('Erreur chargement événements:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEventDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  // Filtrer les événements
  useEffect(() => {
    let filtered = [...events];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(term) ||
        (e.title_mg && e.title_mg.toLowerCase().includes(term)) ||
        e.description.toLowerCase().includes(term) ||
        (e.description_mg && e.description_mg.toLowerCase().includes(term)) ||
        e.location.toLowerCase().includes(term)
      );
    }
    
    if (selectedType) {
      filtered = filtered.filter(e => e.event_type === selectedType);
    }
    
    setFilteredEvents(filtered);
  }, [searchTerm, selectedType, events]);

  const getMainImageUrl = (event: Event): string => {
    return event.image_url || '/images/placeholder-event.jpg';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const getEventTypeIcon = (typeValue: string) => {
    const type = eventTypes.find(t => t.value === typeValue);
    if (!type) return Calendar;
    return type.icon;
  };

  const getEventTypeLabel = (typeValue: string) => {
    const type = eventTypes.find(t => t.value === typeValue);
    if (!type) return typeValue;
    return language === 'fr' ? type.labelFr : type.labelMg;
  };

  const getEventTitle = (event: Event) => {
    return language === 'fr' ? event.title : (event.title_mg || event.title);
  };

  const getEventDescription = (event: Event) => {
    return language === 'fr' ? event.description : (event.description_mg || event.description);
  };

  const isFull = (event: Event) => {
    return event.max_capacity > 0 && event.current_registrations >= event.max_capacity;
  };

  const getAvailableSpots = (event: Event) => {
    if (event.max_capacity === 0) return null;
    return event.max_capacity - (event.current_registrations || 0);
  };

  const stats = {
    total: events.length,
    types: new Set(events.map(e => e.event_type)).size,
    upcoming: events.filter(e => new Date(e.start_datetime) > new Date()).length,
  };

  // Style du fond d'écran dynamique
  const backgroundStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundImage: `url(${pageBackground.image_url})`,
    backgroundPosition: pageBackground.position || 'center',
    backgroundSize: pageBackground.size || 'cover',
  } : {};

  const overlayStyle = pageBackground?.image_url ? {
    backgroundColor: `rgba(0, 0, 0, ${(pageBackground.overlay_opacity || 30) / 100})`,
  } : {};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{language === 'fr' ? 'Chargement...' : 'Miandry...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Section Hero avec fond d'écran dynamique */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          {backgroundStyle.backgroundImage ? (
            <>
              <div className="absolute inset-0" style={backgroundStyle} />
              <div className="absolute inset-0" style={overlayStyle} />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
          )}
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-6 border border-white/20">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-medium text-white">Y-Mad Madagascar</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            {language === 'fr' ? 'Nos Événements' : 'Ny Hetsika Atolotray'}
            <span className="block text-3xl md:text-4xl lg:text-5xl text-blue-200 mt-3">
              {language === 'fr' ? 'pour la jeunesse malgache' : 'ho an\'ny tanora malagasy'}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto mb-8 drop-shadow-md">
            {language === 'fr' 
              ? 'Participez à nos camps, ateliers et formations pour développer vos compétences'
              : 'Mandraisa anjara amin\'ny toby, atelier ary fampiofanana hanatsarana ny fahaizanao'}
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <a 
              href="#events-list" 
              className="inline-flex items-center gap-2 bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
            >
              {language === 'fr' ? 'Découvrir les événements' : 'Hijery ny hetsika'} <ArrowRight className="w-5 h-5" />
            </a>
            <Link 
              href="/donate" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition shadow-lg"
            >
              <Heart className="w-5 h-5" /> {language === 'fr' ? 'Soutenir Y-Mad' : 'Hanohana ny Y-Mad'}
            </Link>
          </div>
          
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-2 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Statistiques */}
      <section className="relative -mt-16 z-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                {language === 'fr' ? 'Nos Événements en Chiffres' : 'Ny Hetsika Isanjohy'}
              </h2>
              <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full mt-3"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                  <Calendar className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-4xl font-bold text-gray-800 mb-2">{stats.total || 0}</p>
                <p className="text-gray-500 font-medium">{language === 'fr' ? 'Événements organisés' : 'Hetsika natao'}</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                  <Target className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-4xl font-bold text-gray-800 mb-2">{stats.types || 0}</p>
                <p className="text-gray-500 font-medium">{language === 'fr' ? 'Types d\'événements' : 'Karazana hetsika'}</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                  <TrendingUp className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-4xl font-bold text-gray-800 mb-2">{stats.upcoming || 0}</p>
                <p className="text-gray-500 font-medium">{language === 'fr' ? 'À venir' : 'Ho avy'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Filtres et Recherche */}
      <section className="max-w-7xl mx-auto px-4 py-16" id="events-list">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {language === 'fr' ? 'Prochains Événements' : 'Hetsika Ho Avy'}
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Rejoignez-nous pour des moments de partage, d\'apprentissage et de développement'
              : 'Miaraha aminay hizara, hianatra ary hamolavola ny tanora'}
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={language === 'fr' 
                  ? 'Rechercher un événement par titre, description ou lieu...'
                  : 'Karohy ny hetsika...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
              >
                <option value="">{language === 'fr' ? 'Tous les types' : 'Karazana rehetra'}</option>
                {eventTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <option key={type.value} value={type.value}>
                      {language === 'fr' ? type.labelFr : type.labelMg}
                    </option>
                  );
                })}
              </select>
              
              <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 px-4 transition ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 px-4 transition ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <LayoutList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Filtres actifs */}
          {(searchTerm || selectedType) && (
            <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-gray-100">
              {searchTerm && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
                  <Search className="w-3 h-3" />
                  {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedType && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
                  {getEventTypeLabel(selectedType)}
                  <button onClick={() => setSelectedType('')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button 
                onClick={() => { setSearchTerm(''); setSelectedType(''); }} 
                className="text-sm text-blue-600 hover:underline"
              >
                {language === 'fr' ? 'Tout effacer' : 'Fafana daholo'}
              </button>
            </div>
          )}
        </div>

        {/* Résultats */}
        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-blue-600">{filteredEvents.length}</span> 
            {language === 'fr' ? ' événement(s) trouvé(s)' : ' hetsika hita'}
          </p>
        </div>

        {/* Grille des événements */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-20 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl mb-2">{language === 'fr' ? 'Aucun événement trouvé' : 'Tsy misy hetsika hita'}</p>
            <p className="text-gray-400">{language === 'fr' ? 'Revenez plus tard pour découvrir nos prochains événements' : 'Miverina any aoriana hijery ny hetsika ho avy'}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => {
              const EventIcon = getEventTypeIcon(event.event_type);
              const eventFull = isFull(event);
              const spotsLeft = getAvailableSpots(event);
              
              return (
                <div 
                  key={event.id}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
                  onClick={() => openEventDetails(event)}
                >
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    {getMainImageUrl(event) !== '/images/placeholder-event.jpg' ? (
                      <img 
                        src={getMainImageUrl(event)} 
                        alt={getEventTitle(event)} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                        <Calendar className="w-16 h-16 text-blue-300 mb-2" />
                        <span className="text-sm text-blue-400">{language === 'fr' ? 'Image à venir' : 'Sary ho avy'}</span>
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full text-white font-medium shadow-lg bg-blue-600">
                        <EventIcon className="w-3 h-3" /> {getEventTypeLabel(event.event_type)}
                      </span>
                    </div>
                    
                    {eventFull && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-red-500 text-white font-medium shadow-lg">
                          <AlertCircle className="w-3 h-3" /> Complet
                        </span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex items-end justify-center pb-6">
                      <span className="bg-white text-gray-800 px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition duration-300">
                        {language === 'fr' ? 'S\'inscrire' : 'Misoratra anarana'} <Ticket className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition">
                      {getEventTitle(event)}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {formatDate(event.start_datetime)}
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {formatTime(event.start_datetime)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4" /> {event.location}
                    </div>
                    
                    <p className="text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                      {getEventDescription(event)}
                    </p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex flex-col">
                        {event.is_free ? (
                          <span className="text-sm font-semibold text-green-600">Gratuit</span>
                        ) : (
                          <span className="text-sm font-semibold text-blue-600">{event.price_mga.toLocaleString()} Ar</span>
                        )}
                        {spotsLeft !== null && spotsLeft > 0 && spotsLeft < 10 && (
                          <span className="text-xs text-orange-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3 h-3" />
                            Plus que {spotsLeft} place{spotsLeft > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-400 group-hover:text-blue-600 transition flex items-center gap-1">
                        {language === 'fr' ? 'En savoir plus' : 'Hamaky bebe kokoa'} <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const EventIcon = getEventTypeIcon(event.event_type);
              const eventFull = isFull(event);
              return (
                <div 
                  key={event.id}
                  className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col md:flex-row border border-gray-100"
                  onClick={() => openEventDetails(event)}
                >
                  <div className="md:w-56 h-48 bg-gray-100 relative overflow-hidden">
                    {getMainImageUrl(event) !== '/images/placeholder-event.jpg' ? (
                      <img 
                        src={getMainImageUrl(event)} 
                        alt={getEventTitle(event)} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                        <Calendar className="w-10 h-10 text-blue-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full text-white font-medium bg-blue-600">
                        <EventIcon className="w-3 h-3" /> {getEventTypeLabel(event.event_type)}
                      </span>
                    </div>
                    {eventFull && (
                      <div className="absolute top-3 right-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-red-500 text-white">Complet</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6">
                    <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-blue-600 transition">
                      {getEventTitle(event)}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(event.start_datetime)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatTime(event.start_datetime)}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</span>
                    </div>
                    <p className="text-gray-600 line-clamp-2 mb-4">{getEventDescription(event)}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        {event.is_free ? (
                          <span className="text-sm font-semibold text-green-600">Gratuit</span>
                        ) : (
                          <span className="text-sm font-semibold text-blue-600">{event.price_mga.toLocaleString()} Ar</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-400 group-hover:text-blue-600 transition flex items-center gap-1">
                        {language === 'fr' ? 'En savoir plus' : 'Hamaky bebe kokoa'} <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section Appel à l'action */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-900 py-20 mt-10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
            <Ticket className="w-4 h-4 text-blue-300" />
            <span className="text-sm text-white/90">{language === 'fr' ? 'Ne manquez aucun événement' : 'Aza adino ny hetsika'}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {language === 'fr' ? 'Restez informé de nos prochains événements' : 'Mijanòna ho voaomana amin\'ny hetsika ho avy'}
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Inscrivez-vous à notre newsletter pour recevoir toutes les actualités et opportunités'
              : 'Misoratra anarana amin\'ny gazetintsika hahazoana ny vaovao sy ny fahafahana rehetra'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 bg-white text-blue-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              <Heart className="w-5 h-5" /> {language === 'fr' ? 'S\'abonner' : 'Misoratra anarana'}
            </Link>
            <Link 
              href="/volunteers" 
              className="inline-flex items-center gap-2 bg-blue-500/30 backdrop-blur-sm text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-500/50 transition border border-white/30"
            >
              <Users className="w-5 h-5" /> {language === 'fr' ? 'Devenir bénévole' : 'Mpanao asa soa'} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Modal Détails Événement */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-5 border-b flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{getEventTitle(selectedEvent)}</h2>
                <p className="text-sm text-gray-500">{selectedEvent.location}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <img 
                src={getMainImageUrl(selectedEvent)} 
                alt={getEventTitle(selectedEvent)}
                className="w-full h-[400px] object-cover rounded-xl shadow-lg"
              />
            </div>

            <div className="p-6 border-t bg-gray-50">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">
                {language === 'fr' ? 'À propos de cet événement' : 'Momba ity hetsika ity'}
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {getEventDescription(selectedEvent)}
              </p>
            </div>

            <div className="p-6 border-t grid grid-cols-2 gap-4 bg-gray-50">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500 mb-1">{language === 'fr' ? 'Date et heure' : 'Daty sy ora'}</p>
                <p className="font-medium text-gray-800">{formatDate(selectedEvent.start_datetime)} à {formatTime(selectedEvent.start_datetime)}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500 mb-1">{language === 'fr' ? 'Lieu' : 'Toerana'}</p>
                <p className="font-medium text-gray-800">{selectedEvent.location}</p>
              </div>
            </div>

            <div className="p-6 border-t flex justify-center gap-4">
              <Link 
                href={isFull(selectedEvent) ? '#' : `/events/${selectedEvent.id}/register`}
                onClick={() => setShowModal(false)}
                className={`px-8 py-3 rounded-full font-semibold transition flex items-center gap-2 shadow-lg ${
                  isFull(selectedEvent) 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Ticket className="w-5 h-5" /> 
                {isFull(selectedEvent) 
                  ? (language === 'fr' ? 'Complet' : 'Feno')
                  : (language === 'fr' ? "S'inscrire" : 'Misoratra anarana')
                }
              </Link>
              <Link 
                href="/contact" 
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition"
                onClick={() => setShowModal(false)}
              >
                {language === 'fr' ? 'Nous contacter' : 'Mifandraisa aminay'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}