'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Save, Calendar, MapPin, Users, DollarSign, 
  Clock, Trash2, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';

interface Event {
  id: string;
  title: string;           // ✅ CORRIGÉ: title au lieu de title_fr
  title_mg?: string;
  description: string;     // ✅ CORRIGÉ: description au lieu de description_fr
  description_mg?: string;
  start_datetime: string;
  end_datetime?: string;
  location: string;
  address?: string;
  max_capacity: number;
  current_registrations: number;
  is_free: boolean;
  price_mga?: number;
  event_type: 'camp' | 'workshop' | 'hackathon' | 'conference' | 'formation' | 'other';
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  organizer_name?: string;
  organizer_email?: string;
  organizer_phone?: string;
  created_at: string;
  updated_at?: string;
}

const eventTypes = [
  { value: 'camp', label: '🏕️ Camp' },
  { value: 'workshop', label: '🔧 Atelier' },
  { value: 'hackathon', label: '💻 Hackathon' },
  { value: 'conference', label: '🎤 Conférence' },
  { value: 'formation', label: '📚 Formation' },
  { value: 'other', label: '📌 Autre' },
];

// Fonction pour formater la date pour l'input datetime-local
const formatDateForInput = (dateString: string): string => {
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

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    title_mg: '',
    description: '',
    description_mg: '',
    start_datetime: '',
    location: '',
    address: '',
    max_capacity: 50,
    is_free: true,
    price_mga: 0,
    event_type: 'workshop' as const,
    status: 'draft' as const,
    organizer_name: 'Y-Mad',
    organizer_email: 'contact@y-mad.mg',
    organizer_phone: '+261 34 00 000 00'
  });

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('ymad_events');
      if (stored) {
        const events = JSON.parse(stored);
        const foundEvent = events.find((e: Event) => e.id === eventId);
        
        if (foundEvent) {
          setEvent(foundEvent);
          // ✅ CORRECTION: Utiliser les bons noms de champs
          setFormData({
            title: foundEvent.title || '',
            title_mg: foundEvent.title_mg || '',
            description: foundEvent.description || '',
            description_mg: foundEvent.description_mg || '',
            start_datetime: formatDateForInput(foundEvent.start_datetime),
            location: foundEvent.location || '',
            address: foundEvent.address || '',
            max_capacity: foundEvent.max_capacity || 50,
            is_free: foundEvent.is_free !== undefined ? foundEvent.is_free : true,
            price_mga: foundEvent.price_mga || 0,
            event_type: foundEvent.event_type || 'workshop',
            status: foundEvent.status || 'draft',
            organizer_name: foundEvent.organizer_name || 'Y-Mad',
            organizer_email: foundEvent.organizer_email || 'contact@y-mad.mg',
            organizer_phone: foundEvent.organizer_phone || '+261 34 00 000 00'
          });
        } else {
          setError('Événement non trouvé');
        }
      } else {
        setError('Aucun événement trouvé');
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // ✅ Validation
    if (!formData.title || !formData.description || !formData.location || !formData.start_datetime) {
      setError('Veuillez remplir tous les champs obligatoires');
      setSaving(false);
      return;
    }

    try {
      const stored = localStorage.getItem('ymad_events');
      if (stored) {
        const events = JSON.parse(stored);
        
        // ✅ CORRECTION: Conserver les valeurs existantes non modifiées
        const updatedEvents = events.map((e: Event) => 
          e.id === eventId 
            ? { 
                ...e,
                title: formData.title,
                title_mg: formData.title_mg || undefined,
                description: formData.description,
                description_mg: formData.description_mg || undefined,
                start_datetime: new Date(formData.start_datetime).toISOString(),
                location: formData.location,
                address: formData.address || undefined,
                max_capacity: formData.max_capacity,
                is_free: formData.is_free,
                price_mga: formData.is_free ? 0 : formData.price_mga,
                event_type: formData.event_type,
                status: formData.status,
                organizer_name: formData.organizer_name,
                organizer_email: formData.organizer_email,
                organizer_phone: formData.organizer_phone,
                updated_at: new Date().toISOString()
              }
            : e
        );
        
        localStorage.setItem('ymad_events', JSON.stringify(updatedEvents));
        setSuccess(true);
        
        setTimeout(() => {
          router.push('/dashboard/events');
        }, 1500);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.')) {
      try {
        const stored = localStorage.getItem('ymad_events');
        if (stored) {
          const events = JSON.parse(stored);
          const updatedEvents = events.filter((e: Event) => e.id !== eventId);
          localStorage.setItem('ymad_events', JSON.stringify(updatedEvents));
          router.push('/dashboard/events');
        }
      } catch (error) {
        console.error('Erreur suppression:', error);
        setError('Erreur lors de la suppression');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement de l'événement...</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">{error}</p>
          <Link href="/dashboard/events" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Retour aux événements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/events" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Modifier l'événement</h1>
            <p className="text-gray-500 text-sm mt-1">Modifiez les informations de l'événement</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </button>
      </div>

      {/* Message de succès */}
      {success && (
        <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Événement modifié avec succès ! Redirection...
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-5">
          {/* Titres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre (Français) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Titre en français"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre (Malagasy)</label>
              <input
                type="text"
                value={formData.title_mg}
                onChange={(e) => setFormData({...formData, title_mg: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Lohateny amin'ny malagasy"
              />
            </div>
          </div>

          {/* Type et statut */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d'événement</label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({...formData, event_type: e.target.value as any})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">📝 Brouillon</option>
                <option value="published">✅ Publié</option>
                <option value="cancelled">❌ Annulé</option>
                <option value="completed">🏁 Terminé</option>
              </select>
            </div>
          </div>

          {/* Date et lieu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date et heure <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                required
                value={formData.start_datetime}
                onChange={(e) => setFormData({...formData, start_datetime: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Antananarivo"
              />
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Adresse complète"
            />
          </div>

          {/* Capacité et prix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacité maximale</label>
              <input
                type="number"
                value={formData.max_capacity}
                onChange={(e) => setFormData({...formData, max_capacity: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">0 = illimité</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Événement gratuit ?</label>
              <select
                value={formData.is_free ? 'true' : 'false'}
                onChange={(e) => setFormData({...formData, is_free: e.target.value === 'true'})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">✅ Oui, gratuit</option>
                <option value="false">💰 Non, payant</option>
              </select>
            </div>
          </div>

          {!formData.is_free && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (Ariary)</label>
              <input
                type="number"
                value={formData.price_mga}
                onChange={(e) => setFormData({...formData, price_mga: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 25000"
              />
            </div>
          )}

          {/* Descriptions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Français) <span className="text-red-500">*</span></label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Description détaillée de l'événement..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Malagasy)</label>
            <textarea
              rows={4}
              value={formData.description_mg}
              onChange={(e) => setFormData({...formData, description_mg: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Famaritana amin'ny malagasy..."
            />
          </div>

          {/* Organisateur */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Informations de l'organisateur</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.organizer_name}
                  onChange={(e) => setFormData({...formData, organizer_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.organizer_email}
                  onChange={(e) => setFormData({...formData, organizer_email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={formData.organizer_phone}
                  onChange={(e) => setFormData({...formData, organizer_phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
          <Link
            href="/dashboard/events"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}