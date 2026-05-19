'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { jobsApi } from '@/lib/api';
import { 
  ArrowLeft, Users, Search, Download, RefreshCw, Loader2,
  Eye, Mail, Phone, MapPin, Calendar, Clock,
  CheckCircle, XCircle, AlertCircle, FileText, User,
  ChevronLeft, ChevronRight, Briefcase,
  Star, Award, X
} from 'lucide-react';
import toast from 'react-hot-toast';

// Types de statut
type ApplicationStatus = 'submitted' | 'reviewing' | 'shortlisted' | 'interview' | 'accepted' | 'rejected';

interface JobOffer {
  id: string;
  title: string;
  title_mg?: string;
  company_name: string;
  image_url?: string;
}

interface Application {
  id: string;
  job_offer_id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  experience_years?: number;
  cover_letter?: string;
  photo_url?: string;
  cv_url: string;
  diploma_url?: string;
  attestation_url?: string;
  status: ApplicationStatus;
  notes?: string;
  created_at: string;
  jobOffer?: JobOffer;
}

const statusOptions: { value: ApplicationStatus; label: string; color: string; icon: any }[] = [
  { value: 'submitted', label: 'Soumise', color: 'bg-gray-100 text-gray-700', icon: Clock },
  { value: 'reviewing', label: 'En révision', color: 'bg-blue-100 text-blue-700', icon: Eye },
  { value: 'shortlisted', label: 'Présélectionnée', color: 'bg-purple-100 text-purple-700', icon: Star },
  { value: 'interview', label: 'Entretien', color: 'bg-yellow-100 text-yellow-700', icon: Calendar },
  { value: 'accepted', label: 'Acceptée', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  { value: 'rejected', label: 'Refusée', color: 'bg-red-100 text-red-700', icon: XCircle },
];

export default function ApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [job, setJob] = useState<JobOffer | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const hasAccess = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff';

  useEffect(() => {
    if (!isAuthenticated || !hasAccess) {
      router.push('/dashboard/jobs');
      return;
    }
    fetchJob();
    fetchApplications();
  }, [params.id, currentPage, filterStatus]);

  const fetchJob = async () => {
    try {
      const response = await jobsApi.getOne(params.id as string);
      setJob(response);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur de chargement de l\'offre');
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await jobsApi.getApplications(
        params.id as string,
        currentPage,
        itemsPerPage,
        filterStatus !== 'all' ? filterStatus : undefined
      );
      setApplications(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur de chargement des candidatures');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    setUpdatingStatus(true);
    try {
      await jobsApi.updateApplicationStatus(applicationId, newStatus);
      toast.success('Statut mis à jour avec succès');
      await fetchApplications();
      if (selectedApp && selectedApp.id === applicationId) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const option = statusOptions.find(opt => opt.value === status);
    if (!option) return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
    const Icon = option.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full ${option.color}`}>
        <Icon className="w-3 h-3" /> {option.label}
      </span>
    );
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return date;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: applications.length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    interview: applications.filter(a => a.status === 'interview').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  if (loading && applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="text-gray-500 font-medium">Chargement des candidatures...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <Link href="/dashboard/jobs" className="inline-flex items-center text-gray-500 hover:text-blue-600 transition mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux offres
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Candidatures</h1>
                <p className="text-gray-500 text-sm">
                  {job ? `${job.title} - ${job.company_name}` : 'Chargement...'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchApplications} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <RefreshCw className="w-4 h-4 text-gray-600" />
              Actualiser
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <Download className="w-4 h-4 text-gray-600" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        <StatCard label="Total" value={stats.total} color="blue" />
        <StatCard label="Soumises" value={stats.submitted} color="gray" />
        <StatCard label="En révision" value={stats.reviewing} color="blue" />
        <StatCard label="Présélection" value={stats.shortlisted} color="purple" />
        <StatCard label="Entretien" value={stats.interview} color="yellow" />
        <StatCard label="Acceptées" value={stats.accepted} color="green" />
        <StatCard label="Refusées" value={stats.rejected} color="red" />
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau des candidatures */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidat</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Documents</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">Aucune candidature trouvée</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{app.full_name}</p>
                        {app.experience_years && (
                          <p className="text-xs text-gray-400 mt-0.5">{app.experience_years} ans d'expérience</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-600 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {app.email}
                      </p>
                      {app.phone && (
                        <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {app.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {formatDate(app.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                        disabled={updatingStatus}
                        className={`text-xs border rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer ${
                          app.status === 'accepted' ? 'bg-green-50 border-green-300 text-green-700' :
                          app.status === 'rejected' ? 'bg-red-50 border-red-300 text-red-700' :
                          'bg-white border-gray-300 text-gray-700'
                        }`}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {app.cv_url && (
                          <a href={app.cv_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg transition" title="CV">
                            <FileText className="w-4 h-4" />
                          </a>
                        )}
                        {app.diploma_url && (
                          <a href={app.diploma_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-500 hover:text-green-600 rounded-lg transition" title="Diplôme">
                            <Award className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => { setSelectedApp(app); setShowDetailModal(true); }}
                        className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg transition"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Page <span className="font-semibold text-blue-600">{currentPage}</span> sur {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Détail */}
      {showDetailModal && selectedApp && (
        <ApplicationDetailModal
          application={selectedApp}
          onClose={() => setShowDetailModal(false)}
          onUpdateStatus={updateStatus}
          statusOptions={statusOptions}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}

// Composant Carte Statistique
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className={`rounded-xl p-4 text-center ${colors[color] || colors.gray}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5">{label}</p>
    </div>
  );
}

// Modal Détail Candidature
function ApplicationDetailModal({ 
  application, 
  onClose, 
  onUpdateStatus, 
  statusOptions, 
  formatDate 
}: { 
  application: Application; 
  onClose: () => void; 
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  statusOptions: { value: ApplicationStatus; label: string; color: string; icon: any }[];
  formatDate: (date: string) => string;
}) {
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    setUpdating(true);
    setStatus(newStatus);
    await onUpdateStatus(application.id, newStatus);
    setUpdating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* En-tête */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Détail de la candidature</h2>
            <p className="text-sm text-gray-500 mt-0.5">{application.jobOffer?.title || 'Offre d\'emploi'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Statut */}
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut de la candidature</label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
              disabled={updating}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Informations personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoDetail label="Nom complet" value={application.full_name} icon={User} />
            <InfoDetail label="Email" value={application.email} icon={Mail} />
            <InfoDetail label="Téléphone" value={application.phone || 'Non renseigné'} icon={Phone} />
            <InfoDetail label="Adresse" value={application.address || 'Non renseignée'} icon={MapPin} />
            <InfoDetail label="Expérience" value={application.experience_years ? `${application.experience_years} ans` : 'Non renseignée'} icon={Briefcase} />
            <InfoDetail label="Date de candidature" value={formatDate(application.created_at)} icon={Calendar} />
          </div>

          {/* Lettre de motivation */}
          {application.cover_letter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lettre de motivation</label>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                {application.cover_letter}
              </div>
            </div>
          )}

          {/* Documents joints */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Documents joints</label>
            <div className="flex flex-wrap gap-3">
              {application.cv_url && (
                <a href={application.cv_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">
                  <FileText className="w-4 h-4" /> CV
                </a>
              )}
              {application.diploma_url && (
                <a href={application.diploma_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition">
                  <Award className="w-4 h-4" /> Diplôme
                </a>
              )}
              {application.attestation_url && (
                <a href={application.attestation_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition">
                  <FileText className="w-4 h-4" /> Attestation
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant Info Détail
function InfoDetail({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-800 font-medium">{value || 'Non renseigné'}</span>
      </div>
    </div>
  );
}