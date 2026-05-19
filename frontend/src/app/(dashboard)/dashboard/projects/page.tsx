// frontend/src/app/(dashboard)/dashboard/projects/page.tsx
// VERSION FINALE - COULEURS UNIQUEMENT BLEU ET GRIS

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { 
  FolderOpen, Search, Plus, Download, RefreshCw, Loader2,
  Eye, Edit, Trash2, MapPin, Users, DollarSign, TrendingUp,
  CheckCircle, Clock, AlertCircle, ChevronLeft, ChevronRight,
  Award, Calendar, Target, X, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================

interface Project {
  id: string;
  title: string;
  title_mg: string;
  description: string;
  description_mg: string;
  location: string;
  region: string;
  status: 'active' | 'completed' | 'paused' | 'draft';
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
  created_at: string;
}

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  paused: number;
  totalBudget: number;
  totalSpent: number;
  totalBeneficiaries: number;
  totalJobsCreated: number;
}

// ============================================================
// CONSTANTES
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
const ITEMS_PER_PAGE = 9;

const REGIONS = [
  'Analamanga', 'Diana', 'Sava', 'Itasy', 'Vakinankaratra',
  'Bongolava', 'Sofia', 'Boeny', 'Betsiboka', 'Melaky',
  'Alaotra-Mangoro', 'Atsinanana', 'Analanjirofo', 'Amoron\'i Mania',
  'Haute Matsiatra', 'Vatovavy-Fitovinany', 'Ihorombe', 'Atsimo-Atsinanana',
  'Menabe', 'Atsimo-Andrefana', 'Androy', 'Anosy'
];

// STATUTS - UNIQUEMENT BLEU ET GRIS
const STATUS_LABELS: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  active: { label: 'En cours', bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
  completed: { label: 'Terminé', bg: 'bg-gray-100', text: 'text-gray-600', icon: CheckCircle },
  paused: { label: 'En pause', bg: 'bg-gray-100', text: 'text-gray-600', icon: Clock },
  draft: { label: 'Brouillon', bg: 'bg-gray-100', text: 'text-gray-500', icon: AlertCircle }
};

// ============================================================
// COMPOSANTS
// ============================================================

function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: any }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-800">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        </div>
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_LABELS[status] || STATUS_LABELS.draft;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" /> {config.label}
    </span>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function ProjectsPage() {
  const { user, token, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<ProjectStats>({
    total: 0, active: 0, completed: 0, paused: 0,
    totalBudget: 0, totalSpent: 0, totalBeneficiaries: 0, totalJobsCreated: 0
  });
  const [exporting, setExporting] = useState(false);

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff';

  if (!isAuthenticated) return null;

  // Chargement des projets
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterRegion !== 'all' && { region: filterRegion }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`${API_URL}/projects?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Erreur chargement projets:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, filterRegion, searchTerm, token]);

  // Chargement des statistiques
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/projects/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchProjects();
      fetchStats();
    }
  }, [token, fetchProjects, fetchStats]);

  // Suppression d'un projet
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer le projet "${title}" ? Cette action est irréversible.`)) return;
    
    try {
      const response = await fetch(`${API_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        toast.success('Projet supprimé avec succès');
        fetchProjects();
        fetchStats();
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Export CSV
  const exportToCSV = async () => {
    setExporting(true);
    try {
      const response = await fetch(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      const allProjects = data.data || [];

      const rows = [
        ['Titre', 'Région', 'Statut', 'Budget (Ar)', 'Dépenses (Ar)', 'Bénéficiaires', 'Emplois créés', 'Progression', 'Date début', 'Date fin']
      ];
      
      allProjects.forEach((p: Project) => {
        rows.push([
          p.title,
          p.region,
          STATUS_LABELS[p.status]?.label || p.status,
          p.budget?.toString() || '0',
          p.spent?.toString() || '0',
          p.beneficiaries_count?.toString() || '0',
          p.jobs_created?.toString() || '0',
          `${p.progress || 0}%`,
          new Date(p.start_date).toLocaleDateString('fr-FR'),
          new Date(p.end_date).toLocaleDateString('fr-FR')
        ]);
      });
      
      const csvContent = rows.map(row => row.join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `projets_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('Export CSV réussi');
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* EN-TETE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Projets</h1>
            {user?.role === 'super_admin' && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">Super Admin</span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">Gérez les projets et activités de l'association</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchProjects} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 text-gray-600" /> Actualiser
          </button>
          <button onClick={exportToCSV} disabled={exporting} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            <Download className="w-4 h-4 text-gray-600" /> {exporting ? 'Export...' : 'Exporter CSV'}
          </button>
          {hasEditRights && (
            <Link href="/dashboard/projects/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <Plus className="w-4 h-4" /> Nouveau projet
            </Link>
          )}
        </div>
      </div>

      {/* STATISTIQUES */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <StatCard label="Total projets" value={stats.total} icon={FolderOpen} />
        <StatCard label="En cours" value={stats.active} icon={TrendingUp} />
        <StatCard label="Terminés" value={stats.completed} icon={CheckCircle} />
        <StatCard label="Budget total" value={`${(stats.totalBudget / 1000000).toFixed(1)}M Ar`} icon={DollarSign} />
        <StatCard label="Dépenses" value={`${(stats.totalSpent / 1000000).toFixed(1)}M Ar`} icon={TrendingUp} />
        <StatCard label="Bénéficiaires" value={stats.totalBeneficiaries} icon={Users} />
        <StatCard label="Emplois créés" value={stats.totalJobsCreated} icon={Target} />
        <StatCard label="Taux réalisation" value={stats.totalBudget ? `${Math.round((stats.totalSpent / stats.totalBudget) * 100)}%` : '0%'} icon={TrendingUp} />
      </div>

      {/* FILTRES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="all">Tous statuts</option>
            <option value="active">En cours</option>
            <option value="completed">Terminés</option>
            <option value="paused">En pause</option>
            <option value="draft">Brouillons</option>
          </select>
          <select
            value={filterRegion}
            onChange={(e) => { setFilterRegion(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="all">Toutes régions</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {(searchTerm || filterStatus !== 'all' || filterRegion !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterRegion('all'); setCurrentPage(1); }}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <X className="w-4 h-4" /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* GRILLE DES PROJETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-gray-200">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun projet trouvé</p>
            {hasEditRights && (
              <Link href="/dashboard/projects/new" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline">
                <Plus className="w-4 h-4" /> Créer un projet
              </Link>
            )}
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              {/* Image */}
              <div className="relative h-48 bg-gray-100">
                {project.image_url ? (
                  <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderOpen className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                {project.is_featured && (
                  <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3" /> À la une
                  </div>
                )}
                <div className="absolute bottom-3 left-3">
                  <StatusBadge status={project.status} />
                </div>
              </div>
              
              {/* Contenu */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                  {language === 'fr' ? project.title : (project.title_mg || project.title)}
                </h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {language === 'fr' ? project.description : (project.description_mg || project.description)}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{project.location || project.region}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{project.beneficiaries_count || 0} bénéf.</span>
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" />{project.jobs_created || 0} emplois</span>
                </div>
                
                {/* Barre de progression */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progression</span>
                    <span>{project.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-blue-600 transition-all" 
                      style={{ width: `${project.progress || 0}%` }} 
                    />
                  </div>
                </div>
                
                {/* Budget et actions */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <div className="text-sm font-semibold text-blue-600">
                    {(project.budget || 0).toLocaleString()} Ar
                  </div>
                  {hasEditRights && (
                    <div className="flex gap-2">
                      <Link href={`/dashboard/projects/${project.id}`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Voir">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/dashboard/projects/${project.id}/edit`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Modifier">
                        <Edit className="w-4 h-4" />
                      </Link>
                      {user?.role === 'super_admin' && (
                        <button onClick={() => handleDelete(project.id, project.title)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
}