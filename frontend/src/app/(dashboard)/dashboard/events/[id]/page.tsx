'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, Calendar, MapPin, Clock, Users, 
  DollarSign, Tag, User, Mail, Phone, Building2,
  Loader2, AlertCircle, CheckCircle, XCircle, Edit, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

interface Event {
  id: string;
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  type: string;
  status: string;
  location: string;
  address?: string;
  startDate: string;
  endDate?: string;
  maxCapacity: number;
  currentRegistrations: number;
  isFree: boolean;
  price: number;
  imageUrl?: string;
  image_url?: string;
  organizer_name?: string;
  organizer_email?: string;
  organizer_phone?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Brouillon', color: 'text-yellow-600 bg-yellow-100', icon: AlertCircle },
  published: { label: 'Publie', color: 'text-green-600 bg-green-100', icon: CheckCircle },
  cancelled: { label: 'Annule', color: 'text-red-600 bg-red-100', icon: XCircle },
  completed: { label: 'Termine', color: 'text-blue-600 bg-blue-100', icon: CheckCircle }
};

const TYPE_LABELS: Record<string, string> = {
  camp: 'Camp',
  workshop: 'Atelier',
  hackathon: 'Hackathon',
  conference: 'Conference',
  formation: 'Formation'
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuth();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ============================================================
  // SECTION 1 : VERIFICATION DES DROITS
  // ============================================================

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff';
  const isSuperAdmin = user?.role === 'super_admin';

  // ============================================================
  // SECTION 2 : CHARGEMENT DE L EVENEMENT
  // ============================================================

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/events/${eventId}`);
        
        if (response.ok) {
          const data = await response.json();
          setEvent(data);
        } else if (response.status === 404) {
          setError('Evenement non trouve');
        } else {
          setError('Erreur lors du chargement');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur de connexion au serveur');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // ============================================================
  // SECTION 3 : SUPPRESSION DE L EVENEMENT
  // ============================================================

  const handleDelete = async () => {
    if (!confirm('Etes-vous sur de vouloir supprimer cet evenement ? Cette action est irreversible.')) return;
    
    try {
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success('Evenement supprime avec succes');
        router.push('/dashboard/events');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur de connexion');
    }
  };

  // ============================================================
  // SECTION 4 : FONCTIONS UTILITAIRES
  // ============================================================

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non definie';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'Non definie';
    try {
      return new Date(dateString).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Heure invalide';
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Non definie';
    try {
      return `${formatDate(dateString)} a ${formatTime(dateString)}`;
    } catch {
      return 'Date invalide';
    }
  };

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === undefined || amount === null) return '0 Ar';
    return amount.toLocaleString('fr-FR') + ' Ar';
  };

  const getMainImageUrl = () => {
    return event?.imageUrl || event?.image_url || '/images/placeholder-event.jpg';
  };

  // ============================================================
  // SECTION 5 : ECRAN DE CHARGEMENT
  // ============================================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500">Chargement de l evenement...</p>
      </div>
    );
  }

  // ============================================================
  // SECTION 6 : ERREUR
  // ============================================================

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Evenement non trouve</h1>
          <p className="text-gray-500 mb-6">{error || "Cet evenement n'existe pas"}</p>
          <Link href="/dashboard/events" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Retour a la liste
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // SECTION 7 : RENDU PRINCIPAL
  // ============================================================

  const StatusComponent = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft;
  const StatusIcon = StatusComponent.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* SOUS-SECTION 7.1 : EN-TETE */}
      <div className="flex justify-between items-center">
        <div>
          <Link href="/dashboard/events" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-2">
            <ArrowLeft className="w-4 h-4" /> Retour a la liste
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
              {event.title_mg && (
                <p className="text-gray-500 text-sm">{event.title_mg}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {hasEditRights && (
            <Link
              href={`/dashboard/events/${event.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              <Edit className="w-4 h-4" /> Modifier
            </Link>
          )}
          {isSuperAdmin && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              <Trash2 className="w-4 h-4" /> Supprimer
            </button>
          )}
        </div>
      </div>

      {/* SOUS-SECTION 7.2 : IMAGE DE COUVERTURE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-64 bg-gray-100 relative">
          <img 
            src={getMainImageUrl()}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/placeholder-event.jpg';
            }}
          />
          <div className="absolute top-4 right-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${StatusComponent.color}`}>
              <StatusIcon className="w-3 h-3" /> {StatusComponent.label}
            </span>
          </div>
        </div>
      </div>

      {/* SOUS-SECTION 7.3 : INFORMATIONS PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="md:col-span-2 space-y-6">
          
          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
              {event.description}
            </p>
            {event.description_mg && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-gray-500 text-sm italic">{event.description_mg}</p>
              </div>
            )}
          </div>

          {/* Details de l evenement */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Details pratiques</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Date et heure</p>
                  <p className="text-gray-800 font-medium">{formatDateTime(event.startDate)}</p>
                </div>
              </div>
              {event.endDate && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Date de fin</p>
                    <p className="text-gray-800 font-medium">{formatDateTime(event.endDate)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Lieu</p>
                  <p className="text-gray-800 font-medium">{event.location}</p>
                  {event.address && (
                    <p className="text-sm text-gray-500 mt-0.5">{event.address}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Tag className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Type</p>
                  <p className="text-gray-800 font-medium">{TYPE_LABELS[event.type] || event.type}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Capacite</p>
                  <p className="text-gray-800 font-medium">
                    {event.currentRegistrations} / {event.maxCapacity > 0 ? event.maxCapacity : 'Illimite'} inscrits
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Tarif</p>
                  <p className="text-gray-800 font-medium">
                    {event.isFree ? 'Gratuit' : formatCurrency(event.price)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SOUS-SECTION 7.4 : INFORMATIONS ORGANISATEUR */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Organisateur
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">Nom</p>
                <p className="text-gray-800 font-medium">{event.organizer_name || 'Y-Mad Association'}</p>
              </div>
              {event.organizer_email && (
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {event.organizer_email}
                  </div>
                </div>
              )}
              {event.organizer_phone && (
                <div>
                  <p className="text-xs text-gray-400">Telephone</p>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {event.organizer_phone}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600">
              {event.currentRegistrations >= event.maxCapacity && event.maxCapacity > 0 ? (
                <>
                  <AlertCircle className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                  Evenement complet
                </>
              ) : event.isFree ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-2" />
                  Inscription gratuite
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                  Payant - {formatCurrency(event.price)}
                </>
              )}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500">
              Cree le {formatDate(event.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}