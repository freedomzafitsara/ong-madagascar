'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { 
  FolderOpen, Search, Plus, Download, RefreshCw, Loader2,
  Eye, Edit, Trash2, MapPin, Users, DollarSign, TrendingUp,
  CheckCircle, Clock, AlertCircle, ChevronLeft, ChevronRight,
  Award, Calendar, Target
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  title_mg: string;
  description: string;
  description_mg: string;
  location: string;
  region: string;
  status: string;
  budget: number;
  spent: number;
  beneficiaries_count: number;
  youth_impact: number;
  jobs_created: number;
  progress: number;
  start_date: string;
  end_date: string;
  image_url: string;
  is_featured: boolean;
  manager?: { firstName: string; lastName: string };
}

export default function ProjectsPage() {
  const { hasRole, token } = useAuth();
  const { language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    totalBudget: 0,
    totalBeneficiaries: 0,
    totalJobsCreated: 0,
  });
  const itemsPerPage = 9;

  const hasEditRights = hasRole('super_admin') || hasRole('admin') || hasRole('staff');

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, [currentPage, filterStatus, filterRegion, searchTerm]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterRegion !== 'all' && { region: filterRegion }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`http://localhost:4001/projects?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data);
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
      const response = await fetch('http://localhost:4001/projects/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer le projet "${title}" ?`)) return;
    try {
      const response = await fetch(`http://localhost:4001/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        fetchProjects();
        fetchStats();
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active': return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" />En cours</span>;
      case 'completed': return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Terminé</span>;
      case 'paused': return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1"><Clock className="w-3 h-3" />En pause</span>;
      default: return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const regions = ['Analamanga', 'Diana', 'Vakinankaratra', 'Atsimo-Andrefana', 'Haute Matsiatra'];

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
            <FolderOpen className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Projets</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">Gérez les projets de l'association</p>
        </div>
        {hasEditRights && (
          <Link href="/dashboard/projects/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" />
            Nouveau projet
          </Link>
        )}
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total projets" value={stats.total} icon={FolderOpen} />
        <StatCard label="En cours" value={stats.active} icon={TrendingUp} />
        <StatCard label="Terminés" value={stats.completed} icon={CheckCircle} />
        <StatCard label="Budget total" value={`${(stats.totalBudget / 1000000).toFixed(1)}M Ar`} icon={DollarSign} />
        <StatCard label="Bénéficiaires" value={stats.totalBeneficiaries} icon={Users} />
        <StatCard label="Emplois créés" value={stats.totalJobsCreated} icon={Target} />
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un projet..."
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
            <option value="all">Tous statuts</option>
            <option value="active">En cours</option>
            <option value="completed">Terminés</option>
            <option value="paused">En pause</option>
          </select>
          <select
            value={filterRegion}
            onChange={(e) => { setFilterRegion(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Toutes régions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={fetchProjects} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Grille des projets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-white rounded-lg border border-gray-200">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun projet trouvé</p>
          </div>
        ) : (
          projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              language={language}
              hasEditRights={hasEditRights}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, language, hasEditRights, onDelete }: any) {
  const title = language === 'fr' ? project.title : (project.title_mg || project.title);
  const progress = project.progress || 0;
  const progressColor = progress < 30 ? 'bg-red-500' : progress < 70 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200">
        {project.image_url ? (
          <img src={project.image_url} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FolderOpen className="w-16 h-16 text-blue-300" />
          </div>
        )}
        {project.is_featured && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Award className="w-3 h-3" /> À la une
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          {getStatusBadge(project.status)}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{project.location || project.region || 'Madagascar'}</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{project.beneficiaries_count || 0} bénéf.</span>
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progression</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${progress}%` }} />
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="text-sm font-semibold text-blue-600">
            {project.budget?.toLocaleString()} Ar
          </div>
          {hasEditRights && (
            <div className="flex gap-2">
              <Link href={`/dashboard/projects/${project.id}`} className="p-1 text-gray-500 hover:text-blue-600">
                <Eye className="w-4 h-4" />
              </Link>
              <Link href={`/dashboard/projects/${project.id}/edit`} className="p-1 text-gray-500 hover:text-green-600">
                <Edit className="w-4 h-4" />
              </Link>
              <button onClick={() => onDelete(project.id, title)} className="p-1 text-gray-500 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusBadge(status: string) {
  switch(status) {
    case 'active': return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">En cours</span>;
    case 'completed': return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Terminé</span>;
    case 'paused': return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">En pause</span>;
    default: return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{status}</span>;
  }
}