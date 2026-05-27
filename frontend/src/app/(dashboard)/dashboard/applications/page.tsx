'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Eye, Search, X, XCircle, CheckCircle, AlertCircle, FileText, 
  User, Mail, Phone, MapPin, Calendar, Download, 
  ChevronLeft, ChevronRight, Briefcase, Filter,
  Loader2, RefreshCw, Star, Award, Clock, Trash2,
  ExternalLink, Building, Users, FileCheck, GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

type ApplicationStatus = 'submitted' | 'reviewing' | 'shortlisted' | 'interview' | 'accepted' | 'rejected';

interface Application {
  id: string;
  job_offer_id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  experience_years: number;
  cover_letter: string;
  photo_url: string;
  cv_url: string;
  diploma_url: string;
  attestation_url: string;
  status: ApplicationStatus;
  notes: string;
  created_at: string;
  jobOffer?: {
    id: string;
    title: string;
    company_name: string;
  };
}

interface JobOffer {
  id: string;
  title: string;
  company_name: string;
}

const statusOptions = [
  { value: 'submitted' as const, label: 'Soumise', color: 'bg-gray-100 text-gray-700', icon: Clock },
  { value: 'reviewing' as const, label: 'En revision', color: 'bg-blue-100 text-blue-700', icon: Eye },
  { value: 'shortlisted' as const, label: 'Préselectionnée', color: 'bg-purple-100 text-purple-700', icon: Star },
  { value: 'interview' as const, label: 'Entretien', color: 'bg-yellow-100 text-yellow-700', icon: Calendar },
  { value: 'accepted' as const, label: 'Acceptée', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  { value: 'rejected' as const, label: 'Refusée', color: 'bg-red-100 text-red-700', icon: XCircle },
];

function StatCard({ label, value, icon: Icon, isBlue = false }: { label: string; value: number; icon: any; isBlue?: boolean }) {
  return (
    <div className={`rounded-xl p-4 text-center ${isBlue ? 'bg-blue-600 text-white' : 'bg-gray-50 border border-gray-200'}`}>
      <Icon className={`w-6 h-6 mx-auto mb-2 ${isBlue ? 'text-white/80' : 'text-gray-500'}`} />
      <p className={`text-2xl font-bold ${isBlue ? 'text-white' : 'text-gray-800'}`}>{value}</p>
      <p className={`text-xs font-medium mt-0.5 ${isBlue ? 'text-white/70' : 'text-gray-500'}`}>{label}</p>
    </div>
  );
}

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

function ApplicationDetailModal({ 
  application, 
  onClose, 
  onUpdateStatus, 
  onDelete,
  formatDate 
}: { 
  application: Application; 
  onClose: () => void; 
  onUpdateStatus: (id: string, status: ApplicationStatus) => Promise<void>;
  onDelete: (id: string, name: string) => Promise<void>;
  formatDate: (date: string) => string;
}) {
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    await onUpdateStatus(application.id, newStatus as ApplicationStatus);
    setStatus(newStatus as ApplicationStatus);
    setUpdating(false);
  };

  const handleDelete = async () => {
    if (confirm(`Supprimer la candidature de ${application.full_name} ?`)) {
      await onDelete(application.id, application.full_name);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileCheck className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold">Détail de la candidature</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {application.jobOffer?.title} - {application.jobOffer?.company_name}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InfoDetail label="Nom complet" value={application.full_name} icon={User} />
            <InfoDetail label="Email" value={application.email} icon={Mail} />
            <InfoDetail label="Téléphone" value={application.phone || 'Non renseigné'} icon={Phone} />
            <InfoDetail label="Adresse" value={application.address || 'Non renseignée'} icon={MapPin} />
            <InfoDetail label="Expérience" value={application.experience_years ? `${application.experience_years} ans` : 'Non renseignée'} icon={Briefcase} />
            <InfoDetail label="Date de candidature" value={formatDate(application.created_at)} icon={Calendar} />
          </div>

          {application.cover_letter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lettre de motivation</label>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 whitespace-pre-wrap">
                {application.cover_letter}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Documents</label>
            <div className="flex flex-wrap gap-3">
              {application.cv_url && (
                <a href={application.cv_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                  <FileText className="w-4 h-4" /> CV
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {application.diploma_url && (
                <a href={application.diploma_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                  <GraduationCap className="w-4 h-4" /> Diplôme
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {application.attestation_url && (
                <a href={application.attestation_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                  <FileText className="w-4 h-4" /> Attestation
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {application.photo_url && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
              <img src={application.photo_url} alt={application.full_name} className="w-24 h-24 rounded-full object-cover" />
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            Fermer
          </button>
          <Link
            href={`/dashboard/jobs/${application.job_offer_id}`}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voir l offre
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CandidaturesPage() {
  const { token, user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJob, setFilterJob] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const hasAccess = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff';

  const handleUnauthorized = useCallback(() => {
    toast.error('Session expirée, veuillez vous reconnecter');
    logout();
    router.push('/login');
  }, [logout, router]);

  const fetchJobs = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/jobs/offers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) return handleUnauthorized();
      if (response.ok) {
        const data = await response.json();
        setJobs(data.data || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  }, [token, handleUnauthorized]);

  const fetchAllApplications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      let url = `${API_URL}/jobs/applications/all?page=${currentPage}&limit=${itemsPerPage}`;
      if (filterStatus !== 'all') url += `&status=${filterStatus}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 401) return handleUnauthorized();
      if (response.ok) {
        const data = await response.json();
        const apps = data.data || [];
        const enrichedApps = apps.map((app: Application) => ({
          ...app,
          jobOffer: jobs.find(j => j.id === app.job_offer_id)
        }));
        setApplications(enrichedApps);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, filterStatus, jobs, handleUnauthorized]);

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (!hasAccess) router.push('/dashboard');
    else if (!token) handleUnauthorized();
    else {
      fetchJobs();
      fetchAllApplications();
    }
  }, [isAuthenticated, hasAccess, token, router, handleUnauthorized, fetchJobs, fetchAllApplications]);

  const updateStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    if (!token) return;
    setUpdatingStatus(true);
    try {
      const response = await fetch(`${API_URL}/jobs/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.status === 401) return handleUnauthorized();
      if (response.ok) {
        toast.success('Statut mis à jour');
        fetchAllApplications();
      }
    } catch (error) {
      toast.error('Erreur');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const deleteApplication = async (applicationId: string, name: string) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/jobs/applications/${applicationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) return handleUnauthorized();
      if (response.ok) {
        toast.success(`Candidature de ${name} supprimée`);
        fetchAllApplications();
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch {
      return date;
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const option = statusOptions.find(opt => opt.value === status);
    return <span className={`px-2 py-1 text-xs rounded-full ${option?.color || 'bg-gray-100'}`}>{option?.label || status}</span>;
  };

  const filteredApplications = applications.filter(app => {
    const matchSearch = app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchJob = filterJob === '' || app.job_offer_id === filterJob;
    const matchStatus = filterStatus === 'all' || app.status === filterStatus;
    return matchSearch && matchJob && matchStatus;
  });

  const paginatedApps = filteredApplications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPagesCount = Math.ceil(filteredApplications.length / itemsPerPage);

  const stats = {
    total: applications.length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    interview: applications.filter(a => a.status === 'interview').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  if (!isAuthenticated || !hasAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Accès non autorisé</h1>
          <Link href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">
            Retour
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Gestion des candidatures</h1>
                <p className="text-blue-100 text-sm">Consultez et gérez toutes les candidatures reçues</p>
              </div>
            </div>
          </div>
          <button onClick={fetchAllApplications} className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard label="Total" value={stats.total} icon={Users} isBlue={true} />
        <StatCard label="Soumises" value={stats.submitted} icon={Clock} isBlue={false} />
        <StatCard label="En révision" value={stats.reviewing} icon={Eye} isBlue={false} />
        <StatCard label="Préselection" value={stats.shortlisted} icon={Star} isBlue={false} />
        <StatCard label="Entretien" value={stats.interview} icon={Calendar} isBlue={false} />
        <StatCard label="Acceptées" value={stats.accepted} icon={CheckCircle} isBlue={false} />
        <StatCard label="Refusées" value={stats.rejected} icon={XCircle} isBlue={false} />
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select value={filterJob} onChange={(e) => setFilterJob(e.target.value)} className="px-3 py-2 border rounded-lg bg-white">
            <option value="">Toutes les offres</option>
            {jobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border rounded-lg bg-white">
            <option value="all">Tous les statuts</option>
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Candidat</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Poste</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-gray-500">
                    Aucune candidature trouvée
                  </td>
                </tr>
              ) : (
                paginatedApps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold">{app.full_name}</p>
                      <p className="text-xs text-gray-500">{app.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium">{app.jobOffer?.title || '-'}</p>
                      <p className="text-xs text-gray-500">{app.jobOffer?.company_name || ''}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {app.email}</p>
                      {app.phone && <p className="text-xs text-gray-500 mt-1"><Phone className="w-3.5 h-3.5 inline" /> {app.phone}</p>}
                    </td>
                    <td className="px-5 py-4 text-sm">{formatDate(app.created_at)}</td>
                    <td className="px-5 py-4">
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                        disabled={updatingStatus}
                        className="text-xs border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button onClick={() => { setSelectedApp(app); setShowDetailModal(true); }} className="p-1 text-gray-500 hover:text-blue-600 rounded">
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
      {totalPagesCount > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-lg disabled:opacity-50">
            ←
          </button>
          {Array.from({ length: totalPagesCount }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded-lg ${currentPage === page ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}>
              {page}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPagesCount, p + 1))} disabled={currentPage === totalPagesCount} className="px-3 py-1 border rounded-lg disabled:opacity-50">
            →
          </button>
        </div>
      )}

      {/* Modal */}
      {showDetailModal && selectedApp && (
        <ApplicationDetailModal
          application={selectedApp}
          onClose={() => setShowDetailModal(false)}
          onUpdateStatus={updateStatus}
          onDelete={deleteApplication}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}