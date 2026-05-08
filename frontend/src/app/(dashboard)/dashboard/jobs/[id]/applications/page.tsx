'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ArrowLeft, Users, Search, Download, RefreshCw, Loader2,
  Eye, Mail, Phone, MapPin, Calendar, Clock,
  CheckCircle, XCircle, AlertCircle, FileText, User,
  ChevronLeft, ChevronRight, Filter, Briefcase
} from 'lucide-react';

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  experience: string;
  cover_letter: string;
  photo_url: string;
  cv_url: string;
  diploma_url: string;
  attestation_url: string;
  status: 'submitted' | 'reviewing' | 'shortlisted' | 'interview' | 'accepted' | 'rejected';
  createdAt: string;
  jobOffer?: {
    title: string;
    companyName: string;
  };
}

interface JobOffer {
  id: string;
  title: string;
  companyName: string;
}

const statusOptions = [
  { value: 'submitted', label: 'Soumise', color: 'bg-gray-100 text-gray-700', icon: Clock },
  { value: 'reviewing', label: 'En révision', color: 'bg-blue-100 text-blue-700', icon: Eye },
  { value: 'shortlisted', label: 'Présélectionnée', color: 'bg-purple-100 text-purple-700', icon: StarIcon },
  { value: 'interview', label: 'Entretien', color: 'bg-yellow-100 text-yellow-700', icon: Calendar },
  { value: 'accepted', label: 'Acceptée', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  { value: 'rejected', label: 'Refusée', color: 'bg-red-100 text-red-700', icon: XCircle },
];

export default function ApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const { token, hasRole } = useAuth();
  const { language } = useLanguage();
  const [job, setJob] = useState<JobOffer | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    reviewing: 0,
    shortlisted: 0,
    interview: 0,
    accepted: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchJob();
    fetchApplications();
  }, [params.id]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`http://localhost:4001/jobs/offers/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4001/jobs/offers/${params.id}/applications`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (apps: Application[]) => {
    setStats({
      total: apps.length,
      submitted: apps.filter(a => a.status === 'submitted').length,
      reviewing: apps.filter(a => a.status === 'reviewing').length,
      shortlisted: apps.filter(a => a.status === 'shortlisted').length,
      interview: apps.filter(a => a.status === 'interview').length,
      accepted: apps.filter(a => a.status === 'accepted').length,
      rejected: apps.filter(a => a.status === 'rejected').length,
    });
  };

  const updateStatus = async (applicationId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`http://localhost:4001/jobs/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        await fetchApplications();
        if (selectedApp && selectedApp.id === applicationId) {
          setSelectedApp({ ...selectedApp, status: newStatus as any });
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    if (!option) return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
    const Icon = option.icon;
    return (
      <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${option.color}`}>
        <Icon className="w-3 h-3" /> {option.label}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/jobs" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux offres
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Candidatures</h1>
            </div>
            {job && (
              <p className="text-gray-500 text-sm mt-1">
                Offre: <span className="font-medium text-gray-700">{job.title}</span> - {job.companyName}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={fetchApplications} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 text-gray-600" />
              Actualiser
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 text-gray-600" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        <StatCard label="Total" value={stats.total} color="blue" />
        <StatCard label="Soumises" value={stats.submitted} color="gray" />
        <StatCard label="En révision" value={stats.reviewing} color="blue" />
        <StatCard label="Présélection" value={stats.shortlisted} color="purple" />
        <StatCard label="Entretien" value={stats.interview} color="yellow" />
        <StatCard label="Acceptées" value={stats.accepted} color="green" />
        <StatCard label="Refusées" value={stats.rejected} color="red" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Tous les statuts</option>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Aucune candidature trouvée
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{app.fullName}</p>
                        <p className="text-xs text-gray-400 mt-1">ID: {app.id.slice(0, 8)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 flex items-center gap-1"><Mail className="w-3 h-3" />{app.email}</p>
                      {app.phone && <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{app.phone}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        disabled={updatingStatus}
                        className={`text-xs border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 ${
                          app.status === 'accepted' ? 'bg-green-50 border-green-300' :
                          app.status === 'rejected' ? 'bg-red-50 border-red-300' :
                          'bg-white border-gray-300'
                        }`}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {app.cv_url && (
                          <a href={app.cv_url} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-500 hover:text-blue-600" title="CV">
                            <FileText className="w-4 h-4" />
                          </a>
                        )}
                        {app.diploma_url && (
                          <a href={app.diploma_url} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-500 hover:text-green-600" title="Diplôme">
                            <AwardIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setSelectedApp(app); setShowDetailModal(true); }}
                        className="p-1 text-gray-500 hover:text-blue-600"
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

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className={`rounded-lg p-3 text-center ${colors[color as keyof typeof colors] || colors.gray}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}

function ApplicationDetailModal({ 
  application, 
  onClose, 
  onUpdateStatus, 
  statusOptions, 
  formatDate 
}: { 
  application: any; 
  onClose: () => void; 
  onUpdateStatus: (id: string, status: string) => void;
  statusOptions: any[];
  formatDate: (date: string) => string;
}) {
  const [status, setStatus] = useState(application.status);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    onUpdateStatus(application.id, newStatus);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Détail de la candidature</h2>
            <p className="text-sm text-gray-500">{application.jobOffer?.title || 'Offre d\'emploi'}</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut de la candidature</label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoDetail label="Nom complet" value={application.fullName} icon={User} />
            <InfoDetail label="Email" value={application.email} icon={Mail} />
            <InfoDetail label="Téléphone" value={application.phone || 'Non renseigné'} icon={Phone} />
            <InfoDetail label="Adresse" value={application.address} icon={MapPin} />
            <InfoDetail label="Date de candidature" value={formatDate(application.createdAt)} icon={Calendar} />
          </div>

          {application.experience && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expérience professionnelle</label>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 whitespace-pre-wrap">
                {application.experience}
              </div>
            </div>
          )}

          {application.cover_letter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lettre de motivation</label>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 whitespace-pre-wrap">
                {application.cover_letter}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Documents joints</label>
            <div className="flex flex-wrap gap-3">
              {application.cv_url && (
                <a href={application.cv_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                  <FileText className="w-4 h-4" /> CV
                </a>
              )}
              {application.diploma_url && (
                <a href={application.diploma_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                  <AwardIcon className="w-4 h-4" /> Diplôme
                </a>
              )}
              {application.attestation_url && (
                <a href={application.attestation_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
                  <FileText className="w-4 h-4" /> Attestation
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoDetail({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-800">{value}</span>
      </div>
    </div>
  );
}

// ✅ Composants SVG personnalisés pour éviter les conflits
function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function AwardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}