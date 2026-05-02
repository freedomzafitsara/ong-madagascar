// src/app/(dashboard)/dashboard/events/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, X, CheckCircle, AlertCircle, 
  Calendar, MapPin, Users, Clock, DollarSign, Eye, Loader2,
  ChevronLeft, ChevronRight, Filter, Download
} from 'lucide-react';
import Link from 'next/link';

// ========================================
// TYPES
// ========================================
interface Event {
  id: string;
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  event_type: 'camp' | 'workshop' | 'hackathon' | 'conference' | 'formation' | 'other';
  location: string;
  address?: string;
  start_datetime: string;
  end_datetime?: string;
  max_capacity?: number;
  current_registrations?: number;
  is_free?: boolean;
  price_mga?: number;
  image_url?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  organizer_name?: string;
  organizer_email?: string;
  organizer_phone?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// DONNÉES PAR DÉFAUT
// ========================================
const defaultEvents: Event[] = [
  {
    id: '1',
    title: 'Camp de leadership',
    description: 'Un camp pour développer les compétences en leadership',
    event_type: 'camp',
    location: 'Antananarivo',
    start_datetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    max_capacity: 50,
    current_registrations: 25,
    is_free: false,
    price_mga: 25000,
    status: 'published',
    created_by: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Atelier développement web',
    description: 'Formation intensive au développement web',
    event_type: 'workshop',
    location: 'Antsirabe',
    start_datetime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    max_capacity: 30,
    current_registrations: 18,
    is_free: true,
    price_mga: 0,
    status: 'published',
    created_by: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// ========================================
// FONCTIONS UTILITAIRES
// ========================================
const formatDateTimeForInput = (dateString: string): string => {
  if (!dateString) return '';
  try {
    let cleanDate = dateString;
    if (cleanDate.includes('.')) {
      cleanDate = cleanDate.split('.')[0];
    }
    if (cleanDate.includes('Z')) {
      cleanDate = cleanDate.replace('Z', '');
    }
    return cleanDate.slice(0, 16);
  } catch (error) {
    console.error('Erreur formatage date:', error);
    return '';
  }
};

// ✅ Fonction sécurisée pour convertir en string
const safeToString = (value: any, defaultValue: string = '0'): string => {
  if (value === undefined || value === null) return defaultValue;
  return value.toString();
};

// ✅ Fonction sécurisée pour convertir en nombre
const safeToNumber = (value: any, defaultValue: number = 0): number => {
  if (value === undefined || value === null) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// ========================================
// FONCTIONS LOCALSTORAGE
// ========================================
const getStoredEvents = (): Event[] => {
  if (typeof window === 'undefined') return defaultEvents;
  const stored = localStorage.getItem('ymad_events');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultEvents;
    }
  }
  localStorage.setItem('ymad_events', JSON.stringify(defaultEvents));
  return defaultEvents;
};

const saveEvents = (events: Event[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ymad_events', JSON.stringify(events));
};

// ========================================
// COMPOSANT PRINCIPAL
// ========================================
export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Formulaire
  const [formData, setFormData] = useState({
    title: '',
    title_mg: '',
    description: '',
    description_mg: '',
    event_type: 'workshop' as Event['event_type'],
    location: '',
    address: '',
    start_datetime: '',
    end_datetime: '',
    max_capacity: '',
    is_free: true,
    price_mga: '',
    status: 'draft' as Event['status'],
    organizer_name: 'Y-Mad',
    organizer_email: 'contact@y-mad.mg',
    organizer_phone: '+261 34 00 000 00'
  });

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [searchTerm, filterType, filterStatus, events]);

  const loadEvents = () => {
    setLoading(true);
    try {
      const data = getStoredEvents();
      setEvents(data);
      setFilteredEvents(data);
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];
    
    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType) {
      filtered = filtered.filter(e => e.event_type === filterType);
    }
    
    if (filterStatus) {
      filtered = filtered.filter(e => e.status === filterStatus);
    }
    
    setFilteredEvents(filtered);
    setCurrentPage(1);
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.location || !formData.start_datetime) {
      showMessage('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    let priceValue = 0;
    if (!formData.is_free && formData.price_mga) {
      priceValue = parseInt(formData.price_mga) || 0;
    }

    const eventData: Event = {
      id: editingEvent?.id || Date.now().toString(),
      title: formData.title,
      title_mg: formData.title_mg || undefined,
      description: formData.description,
      description_mg: formData.description_mg || undefined,
      event_type: formData.event_type,
      location: formData.location,
      address: formData.address || undefined,
      start_datetime: new Date(formData.start_datetime).toISOString(),
      end_datetime: formData.end_datetime ? new Date(formData.end_datetime).toISOString() : undefined,
      max_capacity: parseInt(formData.max_capacity) || 0,
      current_registrations: editingEvent?.current_registrations || 0,
      is_free: formData.is_free,
      price_mga: priceValue,
      status: formData.status,
      organizer_name: formData.organizer_name,
      organizer_email: formData.organizer_email,
      organizer_phone: formData.organizer_phone,
      created_by: editingEvent?.created_by || 'admin',
      created_at: editingEvent?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      let updatedEvents: Event[];
      if (editingEvent) {
        updatedEvents = events.map(e => e.id === editingEvent.id ? eventData : e);
        showMessage('Événement modifié avec succès', 'success');
      } else {
        updatedEvents = [eventData, ...events];
        showMessage('Événement ajouté avec succès', 'success');
      }
      
      saveEvents(updatedEvents);
      setEvents(updatedEvents);
      resetForm();
    } catch (error) {
      showMessage('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cet événement définitivement ?')) {
      const filtered = events.filter(e => e.id !== id);
      saveEvents(filtered);
      setEvents(filtered);
      showMessage('Événement supprimé avec succès', 'success');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      title_mg: '',
      description: '',
      description_mg: '',
      event_type: 'workshop',
      location: '',
      address: '',
      start_datetime: '',
      end_datetime: '',
      max_capacity: '',
      is_free: true,
      price_mga: '',
      status: 'draft',
      organizer_name: 'Y-Mad',
      organizer_email: 'contact@y-mad.mg',
      organizer_phone: '+261 34 00 000 00'
    });
  };

  // ✅ CORRECTION: Fonction sécurisée pour l'édition
  const editEvent = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      title_mg: event.title_mg || '',
      description: event.description || '',
      description_mg: event.description_mg || '',
      event_type: event.event_type || 'workshop',
      location: event.location || '',
      address: event.address || '',
      start_datetime: formatDateTimeForInput(event.start_datetime || ''),
      end_datetime: event.end_datetime ? formatDateTimeForInput(event.end_datetime) : '',
      max_capacity: safeToString(event.max_capacity, '0'),
      is_free: event.is_free !== undefined ? event.is_free : true,
      price_mga: safeToString(event.price_mga, '0'),
      status: event.status || 'draft',
      organizer_name: event.organizer_name || 'Y-Mad',
      organizer_email: event.organizer_email || 'contact@y-mad.mg',
      organizer_phone: event.organizer_phone || '+261 34 00 000 00'
    });
    setShowForm(true);
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      camp: '🏕️ Camp',
      workshop: '🔧 Atelier',
      hackathon: '💻 Hackathon',
      conference: '🎤 Conférence',
      formation: '📚 Formation',
      other: '📌 Autre'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700'
    };
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      published: 'Publié',
      cancelled: 'Annulé',
      completed: 'Terminé'
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Fonction sécurisée pour afficher le prix
  const formatPrice = (event: Event): string => {
    if (event.is_free) {
      return 'Gratuit';
    }
    const price = event.price_mga;
    if (price && typeof price === 'number' && price > 0) {
      return `${price.toLocaleString()} Ar`;
    }
    return 'Gratuit';
  };

  // Fonction sécurisée pour afficher la capacité
  const formatCapacity = (event: Event): string => {
    const max = event.max_capacity || 0;
    const current = event.current_registrations || 0;
    if (max === 0) {
      return `${current} / ∞ inscrits`;
    }
    return `${current} / ${max} inscrits`;
  };

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-blue-600" />
            Événements
          </h1>
          <p className="text-gray-500 mt-1">Gestion des camps, ateliers et formations</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" /> Nouvel événement
        </button>
      </div>

      {/* Message notification */}
      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
          <p className="text-blue-100 text-sm">Total</p>
          <p className="text-2xl font-bold">{events.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
          <p className="text-green-100 text-sm">Publiés</p>
          <p className="text-2xl font-bold">{events.filter(e => e.status === 'published').length}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-4 text-white">
          <p className="text-yellow-100 text-sm">À venir</p>
          <p className="text-2xl font-bold">{events.filter(e => new Date(e.start_datetime) > new Date() && e.status === 'published').length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
          <p className="text-purple-100 text-sm">Inscriptions</p>
          <p className="text-2xl font-bold">{events.reduce((sum, e) => sum + (e.current_registrations || 0), 0)}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4 border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un événement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Tous types</option>
            <option value="camp">🏕️ Camp</option>
            <option value="workshop">🔧 Atelier</option>
            <option value="hackathon">💻 Hackathon</option>
            <option value="conference">🎤 Conférence</option>
            <option value="formation">📚 Formation</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Tous statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
            <option value="completed">Terminés</option>
            <option value="cancelled">Annulés</option>
          </select>
          {(searchTerm || filterType || filterStatus) && (
            <button
              onClick={() => { setSearchTerm(''); setFilterType(''); setFilterStatus(''); }}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 border rounded-lg hover:bg-gray-50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Liste des événements */}
      {paginatedEvents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun événement trouvé</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-blue-600 hover:underline">
            + Créer un événement
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {paginatedEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{event.title}</h3>
                    <p className="text-xs text-gray-500">{getEventTypeLabel(event.event_type)}</p>
                  </div>
                </div>
                {getStatusBadge(event.status)}
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(event.start_datetime).toLocaleDateString('fr-FR')} à {new Date(event.start_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{formatCapacity(event)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium text-blue-600">{formatPrice(event)}</span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/dashboard/events/${event.id}`}
                    className="flex-1 flex items-center justify-center gap-1 text-sm bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
                  >
                    <Eye className="w-4 h-4" /> Voir
                  </Link>
                  <button
                    onClick={() => editEvent(event)}
                    className="flex-1 flex items-center justify-center gap-1 text-sm bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4" /> Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="flex-1 flex items-center justify-center gap-1 text-sm bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 py-2 text-sm">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* MODAL FORMULAIRE */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingEvent ? '✏️ Modifier' : '➕ Nouvel'} événement
              </h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre (FR) *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre (MG)</label>
                  <input type="text" value={formData.title_mg} onChange={(e) => setFormData({...formData, title_mg: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (FR) *</label>
                  <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (MG)</label>
                  <textarea rows={3} value={formData.description_mg} onChange={(e) => setFormData({...formData, description_mg: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select value={formData.event_type} onChange={(e) => setFormData({...formData, event_type: e.target.value as any})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="camp">🏕️ Camp</option>
                    <option value="workshop">🔧 Atelier</option>
                    <option value="hackathon">💻 Hackathon</option>
                    <option value="conference">🎤 Conférence</option>
                    <option value="formation">📚 Formation</option>
                    <option value="other">📌 Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lieu *</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date et heure début *</label>
                  <input type="datetime-local" value={formData.start_datetime} onChange={(e) => setFormData({...formData, start_datetime: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date et heure fin</label>
                  <input type="datetime-local" value={formData.end_datetime} onChange={(e) => setFormData({...formData, end_datetime: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacité max</label>
                  <input type="number" value={formData.max_capacity} onChange={(e) => setFormData({...formData, max_capacity: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="0 = illimité" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                    <option value="cancelled">Annulé</option>
                    <option value="completed">Terminé</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_free} onChange={(e) => setFormData({...formData, is_free: e.target.checked})} className="w-4 h-4" />
                  <span className="text-sm font-medium text-gray-700">Événement gratuit</span>
                </label>
                
                {!formData.is_free && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix (Ariary)</label>
                    <input type="number" value={formData.price_mga} onChange={(e) => setFormData({...formData, price_mga: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: 25000" />
                  </div>
                )}
              </div>

              {/* Organisateur */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Informations de l'organisateur</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input type="text" value={formData.organizer_name} onChange={(e) => setFormData({...formData, organizer_name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={formData.organizer_email} onChange={(e) => setFormData({...formData, organizer_email: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input type="tel" value={formData.organizer_phone} onChange={(e) => setFormData({...formData, organizer_phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-3">
              <button onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Annuler
              </button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                {editingEvent ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}