'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { pageService, PageBackground } from '@/services/pageService';
import { 
  Search, MapPin, Calendar, Heart, X, 
  ChevronRight, Grid3x3, LayoutList, Sparkles, TrendingUp, 
  Users, ArrowRight, Target, BookOpen, 
  Briefcase, UsersRound, Loader2, Clock, Ticket, AlertCircle
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

// ============================================================
// CONSTANTES
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

const EVENT_TYPES = [
  { value: 'camp', labelFr: 'Camp', labelMg: 'Toby', icon: Users },
  { value: 'workshop', labelFr: 'Atelier', labelMg: 'Atelier', icon: Briefcase },
  { value: 'hackathon', labelFr: 'Hackathon', labelMg: 'Hackathon', icon: Target },
  { value: 'conference', labelFr: 'Conference', labelMg: 'Konferansy', icon: UsersRound },
  { value: 'formation', labelFr: 'Formation', labelMg: 'Fampiofanana', icon: BookOpen },
  { value: 'other', labelFr: 'Autre', labelMg: 'Hafa', icon: Calendar },
];

interface Event {
  id: string;
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  location: string;
  type: string;
  startDate: string;
  endDate?: string;
  imageUrl?: string;
  maxCapacity: number;
  currentRegistrations: number;
  isFree: boolean;
  price: number;
  status: string;
  createdAt: string;
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function EventsPublicPage() {
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
  const [error, setError] = useState('');

  // ============================================================
  // SECTION 1 : CHARGEMENT DES DONNEES
  // ============================================================

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
      console.error('Erreur chargement fond d ecran:', error);
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      // Appel direct à l'API avec fetch pour plus de fiabilité
      const response = await fetch(`${API_URL}/events/public`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extraction des événements publiés
      let allEvents = data.data || data || [];
      const publishedEvents = allEvents.filter((e: Event) => e.status === 'published');
      
      // Trier par date de début (les plus proches d'abord)
      const sortedEvents = [...publishedEvents].sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
      
      console.log('Evenements charges:', sortedEvents.length);
      setEvents(sortedEvents);
      setFilteredEvents(sortedEvents);
    } catch (error) {
      console.error('Erreur chargement evenements:', error);
      setError(language === 'fr' ? 'Impossible de charger les evenements' : 'Tsy nahomby ny fitaterana ny hetsika');
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SECTION 2 : FILTRES
  // ============================================================

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
      filtered = filtered.filter(e => e.type === selectedType);
    }
    
    setFilteredEvents(filtered);
  }, [searchTerm, selectedType, events]);

  // ============================================================
  // SECTION 3 : FONCTIONS UTILITAIRES
  // ============================================================

  const getMainImageUrl = (event: Event): string => {
    return event.imageUrl || '/images/placeholder-event.jpg';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const getEventTypeIcon = (typeValue: string) => {
    const type = EVENT_TYPES.find(t => t.value === typeValue);
    if (!type) return Calendar;
    return type.icon;
  };

  const getEventTypeLabel = (typeValue: string) => {
    const type = EVENT_TYPES.find(t => t.value === typeValue);
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
    return event.maxCapacity > 0 && event.currentRegistrations >= event.maxCapacity;
  };

  const getAvailableSpots = (event: Event) => {
    if (event.maxCapacity === 0) return null;
    return event.maxCapacity - (event.currentRegistrations || 0);
  };

  const formatPrice = (price: number | undefined, isFree: boolean) => {
    if (isFree) return null;
    if (price === undefined || price === null) return '0 Ar';
    return price.toLocaleString() + ' Ar';
  };

  const openEventDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const stats = {
    total: events.length,
    types: new Set(events.map(e => e.type)).size,
    upcoming: events.filter(e => new Date(e.startDate) > new Date()).length,
  };

  const backgroundStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundImage: `url(${pageBackground.image_url})`,
    backgroundPosition: pageBackground.position || 'center',
    backgroundSize: pageBackground.size || 'cover',
  } : {};

  const overlayStyle = pageBackground?.image_url ? {
    backgroundColor: `rgba(0, 0, 0, ${(pageBackground.overlay_opacity || 30) / 100})`,
  } : {};

  // ============================================================
  // SECTION 4 : ECRAN DE CHARGEMENT
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{language === 'fr' ? 'Chargement...' : 'Miandry...'}</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // SECTION 5 : RENDU PRINCIPAL
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* SOUS-SECTION 5.1 : HERO AVEC FOND DYNAMIQUE */}
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
            {language === 'fr' ? 'Nos Evenements' : 'Ny Hetsika Atolotray'}
            <span className="block text-3xl md:text-4xl lg:text-5xl text-blue-200 mt-3">
              {language === 'fr' ? 'pour la jeunesse malgache' : 'ho an\'ny tanora malagasy'}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto mb-8 drop-shadow-md">
            {language === 'fr' 
              ? 'Participez a nos camps, ateliers et formations pour developper vos competences'
              : 'Mandraisa anjara amin\'ny toby, atelier ary fampiofanana hanatsarana ny fahaizanao'}
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <a 
              href="#events-list" 
              className="inline-flex items-center gap-2 bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
            >
              {language === 'fr' ? 'Decouvrir les evenements' : 'Hijery ny hetsika'} <ArrowRight className="w-5 h-5" />
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

      {/* SOUS-SECTION 5.2 : STATISTIQUES */}
      <section className="relative -mt-16 z-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                {language === 'fr' ? 'Nos Evenements en Chiffres' : 'Ny Hetsika Isanjohy'}
              </h2>
              <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full mt-3"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                  <Calendar className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-4xl font-bold text-gray-800 mb-2">{stats.total || 0}</p>
                <p className="text-gray-500 font-medium">{language === 'fr' ? 'Evenements organises' : 'Hetsika natao'}</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                  <Target className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-4xl font-bold text-gray-800 mb-2">{stats.types || 0}</p>
                <p className="text-gray-500 font-medium">{language === 'fr' ? 'Types d evenements' : 'Karazana hetsika'}</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                  <TrendingUp className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-4xl font-bold text-gray-800 mb-2">{stats.upcoming || 0}</p>
                <p className="text-gray-500 font-medium">{language === 'fr' ? 'A venir' : 'Ho avy'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOUS-SECTION 5.3 : FILTRES ET RECHERCHE */}
      <section className="max-w-7xl mx-auto px-4 py-16" id="events-list">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {language === 'fr' ? 'Prochains Evenements' : 'Hetsika Ho Avy'}
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Rejoignez-nous pour des moments de partage, d apprentissage et de developpement'
              : 'Miaraha aminay hizara, hianatra ary hamolavola ny tanora'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={language === 'fr' 
                  ? 'Rechercher un evenement...'
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
                {EVENT_TYPES.map(type => {
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

        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-blue-600">{filteredEvents.length}</span> 
            {language === 'fr' ? ' evenement(s) trouve(s)' : ' hetsika hita'}
          </p>
        </div>

        {/* SOUS-SECTION 5.4 : GRILLE DES EVENEMENTS */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-20 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl mb-2">
              {language === 'fr' ? 'Aucun evenement disponible' : 'Tsy misy hetsika misy'}
            </p>
            <p className="text-gray-400">
              {language === 'fr' ? 'Revenez plus tard pour decouvrir nos prochains evenements' : 'Miverina any aoriana hijery ny hetsika ho avy'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => {
              const EventIcon = getEventTypeIcon(event.type);
              const eventFull = isFull(event);
              const spotsLeft = getAvailableSpots(event);
              const priceDisplay = formatPrice(event.price, event.isFree);
              
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
                        <span className="text-sm text-blue-400">{language === 'fr' ? 'Image a venir' : 'Sary ho avy'}</span>
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full text-white font-medium shadow-lg bg-blue-600">
                        <EventIcon className="w-3 h-3" /> {getEventTypeLabel(event.type)}
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
                        {language === 'fr' ? 'S inscrire' : 'Misoratra anarana'} <Ticket className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition">
                      {getEventTitle(event)}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {formatDate(event.startDate)}
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {formatTime(event.startDate)}
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
                        {event.isFree ? (
                          <span className="text-sm font-semibold text-green-600">Gratuit</span>
                        ) : (
                          <span className="text-sm font-semibold text-blue-600">{priceDisplay}</span>
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
              const EventIcon = getEventTypeIcon(event.type);
              const eventFull = isFull(event);
              const priceDisplay = formatPrice(event.price, event.isFree);
              
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
                        <EventIcon className="w-3 h-3" /> {getEventTypeLabel(event.type)}
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
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(event.startDate)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatTime(event.startDate)}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</span>
                    </div>
                    <p className="text-gray-600 line-clamp-2 mb-4">{getEventDescription(event)}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        {event.isFree ? (
                          <span className="text-sm font-semibold text-green-600">Gratuit</span>
                        ) : (
                          <span className="text-sm font-semibold text-blue-600">{priceDisplay}</span>
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

      {/* SOUS-SECTION 5.5 : APPEL A L ACTION */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-900 py-20 mt-10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
            <Ticket className="w-4 h-4 text-blue-300" />
            <span className="text-sm text-white/90">{language === 'fr' ? 'Ne manquez aucun evenement' : 'Aza adino ny hetsika'}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {language === 'fr' ? 'Restez informe de nos prochains evenements' : 'Mijanòna ho voaomana amin\'ny hetsika ho avy'}
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Inscrivez-vous a notre newsletter pour recevoir toutes les actualites'
              : 'Misoratra anarana amin\'ny gazetintsika'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 bg-white text-blue-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              <Heart className="w-5 h-5" /> {language === 'fr' ? 'S abonner' : 'Misoratra anarana'}
            </Link>
            <Link 
              href="/volunteers" 
              className="inline-flex items-center gap-2 bg-blue-500/30 backdrop-blur-sm text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-500/50 transition border border-white/30"
            >
              <Users className="w-5 h-5" /> {language === 'fr' ? 'Devenir benevole' : 'Mpanao asa soa'} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* SOUS-SECTION 5.6 : MODAL DETAILS */}
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
                {language === 'fr' ? 'A propos de cet evenement' : 'Momba ity hetsika ity'}
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {getEventDescription(selectedEvent)}
              </p>
            </div>

            <div className="p-6 border-t grid grid-cols-2 gap-4 bg-gray-50">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500 mb-1">{language === 'fr' ? 'Date et heure' : 'Daty sy ora'}</p>
                <p className="font-medium text-gray-800">{formatDate(selectedEvent.startDate)} a {formatTime(selectedEvent.startDate)}</p>
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
                  : (language === 'fr' ? 'S inscrire' : 'Misoratra anarana')
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