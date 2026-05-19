'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { eventsApi } from '@/lib/api';
import { Calendar, Plus, Search, RefreshCw, Loader2, Eye, Edit, Trash2, MapPin, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Event {
  id: string;
  title: string;
  title_mg?: string;
  description: string;
  type: string;
  status: string;
  location: string;
  startDate: string;
  maxCapacity: number;
  currentRegistrations: number;
  isFree: boolean;
  price: number;
}

interface StatsData {
  total: number;
  published: number;
  draft: number;
  upcoming: number;
}

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: 'Brouillon', bg: 'bg-gray-100', text: 'text-gray-600' },
  published: { label: 'Publié', bg: 'bg-blue-100', text: 'text-blue-700' },
  cancelled: { label: 'Annulé', bg: 'bg-gray-200', text: 'text-gray-700' },
  completed: { label: 'Terminé', bg: 'bg-blue-50', text: 'text-blue-600' }
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_STYLES[status] || STATUS_STYLES.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

function StatCard({ title, value, color = 'gray' }: { title: string; value: number; color?: 'blue' | 'gray' }) {
  const valueColor = color === 'blue' ? 'text-blue-600' : 'text-gray-800';
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}

export default function EventsPage() {
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<StatsData>({ total: 0, published: 0, draft: 0, upcoming: 0 });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff';
  const isSuperAdmin = user?.role === 'super_admin';

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await eventsApi.getAll(
        currentPage, 
        10, 
        undefined, 
        filterStatus !== 'all' ? filterStatus : undefined, 
        searchTerm
      );
      setEvents(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur de chargement');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, searchTerm, token]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const response = await eventsApi.getStats();
      setStats({
        total: response.total || 0,
        published: response.published || 0,
        draft: response.draft || 0,
        upcoming: response.upcoming || 0
      });
    } catch (error: any) {
      console.error('Erreur stats:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchEvents();
      fetchStats();
    }
  }, [token, currentPage, filterStatus, searchTerm, fetchEvents, fetchStats]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer l'événement "${title}" ? Cette action est irréversible.`)) return;
    try {
      await eventsApi.delete(id);
      toast.success('Événement supprimé avec succès');
      fetchEvents();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await eventsApi.changeStatus(id, 'published');
      toast.success('Événement publié avec succès');
      fetchEvents();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la publication');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non définie';
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

  const formatEventType = (type: string) => {
    const types: Record<string, string> = { 
      camp: 'Camp', 
      workshop: 'Atelier', 
      hackathon: 'Hackathon', 
      conference: 'Conférence', 
      formation: 'Formation' 
    };
    return types[type] || type;
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setCurrentPage(1);
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500">Chargement des événements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Événements</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez les camps, ateliers et formations</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { fetchEvents(); fetchStats(); }} 
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          {hasEditRights && (
            <Link 
              href="/dashboard/events/new" 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <Plus className="w-4 h-4" /> Nouvel événement
            </Link>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total événements" value={stats.total} />
        <StatCard title="Publiés" value={stats.published} color="blue" />
        <StatCard title="Brouillons" value={stats.draft} />
        <StatCard title="À venir" value={stats.upcoming} color="blue" />
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher par titre..." 
              value={searchTerm} 
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} 
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
            <option value="completed">Terminés</option>
            <option value="cancelled">Annulés</option>
          </select>
          {(searchTerm || filterStatus !== 'all') && (
            <button 
              onClick={resetFilters} 
              className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              <X className="w-4 h-4" /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Tableau des événements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Titre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Lieu</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Capacité</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">Aucun événement trouvé</p>
                      {hasEditRights && (
                        <Link href="/dashboard/events/new" className="mt-2 text-blue-600 hover:underline text-sm">
                          Créer un événement
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{event.title}</div>
                      {event.title_mg && (
                        <div className="text-xs text-gray-400 mt-0.5">{event.title_mg}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        {formatEventType(event.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" /> {event.location}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-3.5 h-3.5 text-gray-400" /> {formatDate(event.startDate)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <span className="font-medium">{event.currentRegistrations}</span>
                      <span className="text-gray-400">/{event.maxCapacity || '∞'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link 
                          href={`/dashboard/events/${event.id}`} 
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {hasEditRights && (
                          <>
                            <Link 
                              href={`/dashboard/events/${event.id}/edit`} 
                              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            {event.status === 'draft' && (
                              <button 
                                onClick={() => handlePublish(event.id)} 
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Publier"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {isSuperAdmin && (
                              <button 
                                onClick={() => handleDelete(event.id, event.title)} 
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && events.length > 0 && (
        <div className="flex justify-center items-center gap-4 py-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600">
            Page <span className="font-semibold text-blue-600">{currentPage}</span> sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}