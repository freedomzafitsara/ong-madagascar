'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { 
  Briefcase, Search, Plus, Download, RefreshCw, Loader2,
  Eye, Edit, Trash2, MapPin, Calendar, Users,
  CheckCircle, XCircle, Clock, Star, Filter,
  ChevronLeft, ChevronRight, Building, TrendingUp
} from 'lucide-react';

interface JobOffer {
  id: string;
  title: string;
  title_mg: string;
  description: string;
  companyName: string;
  location: string;
  region: string;
  jobType: string;
  salary: string;
  sector: string;
  deadline: string;
  status: 'draft' | 'published' | 'closed' | 'expired';
  applications_count: number;
  is_featured: boolean;
  createdAt: string;
}

export default function JobsPage() {
  const { hasRole, token } = useAuth();
  const { language } = useLanguage();
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    closed: 0,
    expired: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const itemsPerPage = 10;

  const hasEditRights = hasRole('super_admin') || hasRole('admin') || hasRole('staff') || hasRole('partner');

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, [currentPage, filterStatus, filterType, searchTerm]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterType !== 'all' && { jobType: filterType }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`http://localhost:4001/jobs/offers?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.data);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:4001/jobs/offers/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer l'offre "${title}" ?`)) return;
    try {
      const response = await fetch(`http://localhost:4001/jobs/offers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        fetchJobs();
        fetchStats();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'closed' : 'published';
    try {
      const response = await fetch(`http://localhost:4001/jobs/offers/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        fetchJobs();
        fetchStats();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getJobTypeLabel = (type: string) => {
    const types: Record<string, { fr: string; mg: string }> = {
      cdi: { fr: 'CDI', mg: 'CDI' },
      cdd: { fr: 'CDD', mg: 'CDD' },
      stage: { fr: 'Stage', mg: 'Fiofanana' },
      freelance: { fr: 'Freelance', mg: 'Freelance' },
      volunteer: { fr: 'Bénévolat', mg: 'Asa soa' },
    };
    return types[type]?.[language as 'fr' || 'mg'] || type;
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'published':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Publiée</span>;
      case 'draft':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" />Brouillon</span>;
      case 'closed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 flex items-center gap-1"><XCircle className="w-3 h-3" />Fermée</span>;
      case 'expired':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1"><Clock className="w-3 h-3" />Expirée</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  const isExpired = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const jobTypes = [
    { value: 'all', label: 'Tous les types' },
    { value: 'cdi', label: 'CDI' },
    { value: 'cdd', label: 'CDD' },
    { value: 'stage', label: 'Stage' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'volunteer', label: 'Bénévolat' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Tous statuts' },
    { value: 'published', label: 'Publiées' },
    { value: 'draft', label: 'Brouillons' },
    { value: 'closed', label: 'Fermées' },
    { value: 'expired', label: 'Expirées' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Offres d'emploi</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">Gérez les offres d'emploi et les candidatures</p>
        </div>
        {hasEditRights && (
          <Link href="/dashboard/jobs/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" />
            Nouvelle offre
          </Link>
        )}
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total offres" value={stats.total} icon={Briefcase} />
        <StatCard label="Publiées" value={stats.published} icon={CheckCircle} />
        <StatCard label="Fermées" value={stats.closed} icon={XCircle} />
        <StatCard label="Expirées" value={stats.expired} icon={Clock} />
        <StatCard label="Candidatures" value={stats.totalApplications} icon={Users} />
        <StatCard label="En attente" value={stats.pendingApplications} icon={Clock} />
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une offre..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {jobTypes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <button onClick={fetchJobs} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Tableau des offres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entreprise</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lieu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidatures</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date limite</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Aucune offre d'emploi trouvée
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{job.title}</p>
                        {job.is_featured && (
                          <span className="inline-flex items-center gap-1 text-xs text-yellow-600 mt-1">
                            <Star className="w-3 h-3" /> À la une
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Building className="w-3 h-3" />
                        {job.companyName}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                        {getJobTypeLabel(job.jobType)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location || job.region || 'Madagascar'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link 
                        href={`/dashboard/jobs/${job.id}/applications`}
                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                      >
                        <Users className="w-3 h-3" />
                        {job.applications_count} candidat(s)
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className={isExpired(job.deadline) ? 'text-red-500' : 'text-gray-600'}>
                          {new Date(job.deadline).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(job.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/dashboard/jobs/${job.id}`} className="p-1 text-gray-500 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/dashboard/jobs/${job.id}/edit`} className="p-1 text-gray-500 hover:text-green-600">
                          <Edit className="w-4 h-4" />
                        </Link>
                        {hasEditRights && (
                          <button
                            onClick={() => handleToggleStatus(job.id, job.status)}
                            className="p-1 text-gray-500 hover:text-yellow-600"
                            title={job.status === 'published' ? 'Fermer' : 'Publier'}
                          >
                            {job.status === 'published' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(job.id, job.title)}
                          className="p-1 text-gray-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Page {currentPage} / {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
      </div>
    </div>
  );
}