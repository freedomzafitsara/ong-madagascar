// frontend/src/app/(dashboard)/dashboard/projects/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { 
  FolderOpen, Search, Plus, Download, RefreshCw, Loader2,
  Eye, Edit, Trash2, MapPin, Users, DollarSign, TrendingUp,
  CheckCircle, Clock, AlertCircle, ChevronLeft, ChevronRight,
  Award, Calendar, Target, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// ============================================================
// TYPES
// ============================================================

interface Project {
  id: string;
  title_fr: string;
  title_mg?: string;
  description_fr: string;
  description_mg?: string;
  location?: string;
  region?: string;
  status: 'active' | 'completed' | 'paused' | 'draft';
  budget?: number;
  spent?: number;
  beneficiaries_count?: number;
  youth_impact?: number;
  jobs_created?: number;
  progress?: number;
  start_date?: string;
  end_date?: string;
  image_url?: string;
  is_featured?: boolean;
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

const ITEMS_PER_PAGE = 9;

const REGIONS = [
  'Analamanga', 'Diana', 'Sava', 'Itasy', 'Vakinankaratra',
  'Bongolava', 'Sofia', 'Boeny', 'Betsiboka', 'Melaky',
  'Alaotra-Mangoro', 'Atsinanana', 'Analanjirofo', 'Amoron\'i Mania',
  'Haute Matsiatra', 'Vatovavy-Fitovinany', 'Ihorombe', 'Atsimo-Atsinanana',
  'Menabe', 'Atsimo-Andrefana', 'Androy', 'Anosy'
];

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  active: { label: 'En cours', bg: 'bg-blue-100', text: 'text-blue-800', icon: TrendingUp },
  completed: { label: 'Termine', bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
  paused: { label: 'En pause', bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
  draft: { label: 'Brouillon', bg: 'bg-gray-100', text: 'text-gray-600', icon: AlertCircle }
};

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

/**
 * Supprime les balises HTML d'un texte
 */
const stripHtml = (html: string): string => {
  if (!html) return '';
  // Supprimer les balises HTML
  let cleaned = html.replace(/<[^>]*>/g, ' ');
  // Remplacer les entites HTML communes
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?p>/gi, ' ');
  // Supprimer les espaces multiples
  return cleaned.replace(/\s+/g, ' ').trim();
};

/**
 * Extrait un extrait de texte pour l'affichage
 */
const getExcerpt = (html: string, maxLength: number = 120): string => {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// ============================================================
// COMPOSANTS
// ============================================================

function StatCard({ label, value, icon: Icon, isBlue = false }: { label: string; value: number | string; icon: any; isBlue?: boolean }) {
  return (
    <div className={`rounded-xl p-4 transition-all duration-200 hover:shadow-md ${isBlue ? 'bg-blue-800 text-white' : 'bg-white border border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-sm font-medium ${isBlue ? 'text-white/70' : 'text-gray-500'}`}>{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isBlue ? 'bg-white/20' : 'bg-gray-100'}`}>
          <Icon className={`w-4 h-4 ${isBlue ? 'text-white' : 'text-gray-600'}`} />
        </div>
      </div>
      <p className={`text-xl font-bold ${isBlue ? 'text-white' : 'text-gray-800'}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_LABELS[status] || STATUS_LABELS.draft;
  const IconComponent = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
      <IconComponent className="w-3 h-3" /> {config.label}
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

  const isMounted = useRef(true);
  const initialFetchDone = useRef(false);

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin';
  const isSuperAdmin = user?.role === 'super_admin';

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  // Chargement des projets
  const fetchProjects = useCallback(async () => {
    if (!token || !isMounted.current) return;
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE
      };
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterRegion !== 'all') params.region = filterRegion;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/projects', { params });
      
      if (response.data && isMounted.current) {
        setProjects(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Erreur chargement projets:', error);
      toast.error(getText('Erreur de chargement des projets', 'Nisy hadisoana tamin\'ny fampidirana ny tetikasa'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, filterRegion, searchTerm, token, getText]);

  // Chargement des statistiques
  const fetchStats = useCallback(async () => {
    if (!token || !isMounted.current) return;
    try {
      const response = await api.get('/projects/stats');
      if (response.data && isMounted.current) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  }, [token]);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (token && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchStats();
      fetchProjects();
    }
  }, [token, fetchStats, fetchProjects]);

  useEffect(() => {
    if (initialFetchDone.current && token) {
      fetchProjects();
    }
  }, [currentPage, filterStatus, filterRegion, searchTerm, fetchProjects, token]);

  // Suppression d'un projet
  const handleDelete = async (id: string, title: string) => {
    const confirmMsg = getText(
      `Supprimer le projet "${title}" ? Cette action est irreversible.`,
      `Hofafana ny tetikasa "${title}" ? Tsy azo averina izany.`
    );
    
    if (!confirm(confirmMsg)) return;
    
    try {
      await api.delete(`/projects/${id}`);
      toast.success(getText('Projet supprime avec succes', 'Vita ny fanafoanana ny tetikasa'));
      fetchProjects();
      fetchStats();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error(getText('Erreur lors de la suppression', 'Nisy hadisoana tamin\'ny fanafoanana'));
    }
  };

  // Export CSV
  const exportToCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get('/projects', { params: { limit: 1000 } });
      const allProjects = response.data?.data || [];

      const headers = ['Titre FR', 'Titre MG', 'Region', 'Statut', 'Budget (Ar)', 'Beneficiaires', 'Emplois crees', 'Progression', 'Date creation'];
      const rows = allProjects.map((p: Project) => [
        p.title_fr,
        p.title_mg || '',
        p.region || '',
        STATUS_LABELS[p.status]?.label || p.status,
        p.budget?.toString() || '0',
        p.beneficiaries_count?.toString() || '0',
        p.jobs_created?.toString() || '0',
        `${p.progress || 0}%`,
        new Date(p.created_at).toLocaleDateString('fr-FR')
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(';')).join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `projets_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success(getText('Export CSV reussi', 'Vita ny fanondrana CSV'));
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error(getText('Erreur lors de l\'export', 'Nisy hadisoana tamin\'ny fanondrana'));
    } finally {
      setExporting(false);
    }
  };

  const handleRefresh = () => {
    fetchProjects();
    fetchStats();
    toast.success(getText('Donnees actualisees', 'Havaozina ny angona'));
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '0 Ar';
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M Ar`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}k Ar`;
    return `${amount.toLocaleString()} Ar`;
  };

  if (!isAuthenticated) return null;

  if (loading && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-800 animate-spin" />
        <p className="text-gray-500">{getText('Chargement des projets...', 'Fandefasana ny tetikasa...')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      
      {/* EN-TETE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center shadow-sm">
            <FolderOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{getText('Projets', 'Tetikasa')}</h1>
            <p className="text-gray-500 text-sm">{getText('Gerez les projets et activites de l\'association', 'Fitantanana ny tetikasa sy ny asan\'ny fikambanana')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh} 
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">{getText('Actualiser', 'Havaozina')}</span>
          </button>
          <button 
            onClick={exportToCSV} 
            disabled={exporting} 
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">{exporting ? getText('Export...', 'Fanondrana...') : getText('Exporter CSV', 'Hanondrana CSV')}</span>
          </button>
          {hasEditRights && (
            <Link href="/dashboard/projects/new" className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition shadow-sm">
              <Plus className="w-4 h-4" />
              {getText('Nouveau projet', 'Tetikasa vaovao')}
            </Link>
          )}
        </div>
      </div>

      {/* STATISTIQUES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={getText('Total projets', 'Tetikasa rehetra')} value={stats.total} icon={FolderOpen} isBlue={true} />
        <StatCard label={getText('En cours', 'Mandeha')} value={stats.active} icon={TrendingUp} />
        <StatCard label={getText('Termines', 'Vita')} value={stats.completed} icon={CheckCircle} />
        <StatCard label={getText('En pause', 'Mijanona')} value={stats.paused} icon={Clock} />
        <StatCard label={getText('Budget total', 'Tetibola')} value={formatCurrency(stats.totalBudget)} icon={DollarSign} />
        <StatCard label={getText('Beneficiaires', 'Mpandray anjara')} value={stats.totalBeneficiaries} icon={Users} />
        <StatCard label={getText('Emplois crees', 'Asa noforonina')} value={stats.totalJobsCreated} icon={Target} />
        <StatCard label={getText('Taux realisation', 'Tahan\'ny fahavitana')} value={`${stats.totalBudget ? Math.round((stats.totalSpent / stats.totalBudget) * 100) : 0}%`} icon={TrendingUp} />
      </div>

      {/* FILTRES */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={getText('Rechercher un projet...', 'Karohy ny tetikasa...')}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none bg-white min-w-[140px]"
          >
            <option value="all">{getText('Tous statuts', 'Sata rehetra')}</option>
            <option value="active">{getText('En cours', 'Mandeha')}</option>
            <option value="completed">{getText('Termines', 'Vita')}</option>
            <option value="paused">{getText('En pause', 'Mijanona')}</option>
            <option value="draft">{getText('Brouillons', 'Volavola')}</option>
          </select>
          <select
            value={filterRegion}
            onChange={(e) => { setFilterRegion(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none bg-white min-w-[160px]"
          >
            <option value="all">{getText('Toutes regions', 'Faritra rehetra')}</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {(searchTerm || filterStatus !== 'all' || filterRegion !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterRegion('all'); setCurrentPage(1); }}
              className="flex items-center gap-2 px-3 py-2.5 text-gray-500 hover:text-gray-700 text-sm"
            >
              <X className="w-4 h-4" /> {getText('Effacer', 'Fafao')}
            </button>
          )}
        </div>
      </div>

      {/* GRILLE DES PROJETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-gray-200">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">{getText('Aucun projet trouve', 'Tsy misy tetikasa hita')}</p>
            <p className="text-sm text-gray-400 mt-1">{getText('Modifiez vos filtres ou creez un nouveau projet', 'Hanova ny filtrao na mamorona tetikasa vaovao')}</p>
            {hasEditRights && (
              <Link href="/dashboard/projects/new" className="mt-4 inline-flex items-center gap-2 text-blue-800 hover:underline">
                <Plus className="w-4 h-4" /> {getText('Creer un projet', 'Mamorona tetikasa')}
              </Link>
            )}
          </div>
        ) : (
          projects.map((project) => {
            //  Obtention de la description nettoyee
            const descriptionText = language === 'fr' 
              ? project.description_fr 
              : (project.description_mg || project.description_fr);
            const cleanDescription = getExcerpt(descriptionText, 120);
            
            return (
              <div key={project.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  {project.image_url ? (
                    <img src={project.image_url} alt={project.title_fr} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderOpen className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  {project.is_featured && (
                    <div className="absolute top-3 right-3 bg-blue-800 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Award className="w-3 h-3" /> {getText('A la une', 'Voasongadina')}
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <StatusBadge status={project.status} />
                  </div>
                </div>
                
                {/* Contenu */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                    {language === 'fr' ? project.title_fr : (project.title_mg || project.title_fr)}
                  </h3>
                  
                  {/* ✅ DESCRIPTION CORRIGEE - Sans balises HTML */}
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {cleanDescription}
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    {project.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{project.location}</span>
                    )}
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{project.beneficiaries_count || 0} {getText('benef.', 'mpandray')}</span>
                    <span className="flex items-center gap-1"><Target className="w-3 h-3" />{project.jobs_created || 0} {getText('emplois', 'asa')}</span>
                  </div>
                  
                  {/* Progression */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{getText('Progression', 'Fandrosoana')}</span>
                      <span className="font-semibold text-blue-800">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-800 rounded-full h-2 transition-all duration-500" 
                        style={{ width: `${Math.min(project.progress || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-end items-center gap-2 pt-2 border-t border-gray-100">
                    <Link href={`/dashboard/projects/${project.id}`} className="p-1.5 text-gray-500 hover:text-blue-800 rounded-lg hover:bg-gray-100 transition" title={getText('Voir', 'Jereo')}>
                      <Eye className="w-4 h-4" />
                    </Link>
                    {hasEditRights && (
                      <Link href={`/dashboard/projects/${project.id}/edit`} className="p-1.5 text-gray-500 hover:text-blue-800 rounded-lg hover:bg-gray-100 transition" title={getText('Modifier', 'Hanova')}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    )}
                    {isSuperAdmin && (
                      <button onClick={() => handleDelete(project.id, project.title_fr)} className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition" title={getText('Supprimer', 'Hamafa')}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = currentPage;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg transition ${currentPage === pageNum ? 'bg-blue-800 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
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