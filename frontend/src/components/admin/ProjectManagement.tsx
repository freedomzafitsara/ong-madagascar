'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectService } from '@/services/project.service';
import toast from 'react-hot-toast';
import { 
  Plus, Edit2, Trash2, Eye, Calendar, MapPin, 
  CheckCircle, Clock, AlertCircle, FolderOpen 
} from 'lucide-react';

interface Project {
  id: string;
  title_fr: string;
  title_mg?: string;
  description_fr: string;
  description_mg?: string;
  location?: string;
  start_date?: string;
  image_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function ProjectManagement() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const getText = (fr: string, mg: string) => {
    const language = localStorage.getItem('y-mad-language') || 'fr';
    return language === 'fr' ? fr : mg;
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await projectService.getAllProjects();
      setProjects(response.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(getText('Erreur chargement projets', 'Tsy nahomby ny fampidinana tetikasa'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmMsg = getText(
      'Êtes-vous sûr de vouloir supprimer ce projet ?',
      'Azafady, te-hamafa ity tetikasa ity ve ianao ?'
    );
    
    if (confirm(confirmMsg)) {
      try {
        await projectService.deleteProject(id);
        toast.success(getText('Projet supprimé avec succès', 'Voafafa soa aman-tsara ny tetikasa'));
        fetchProjects();
      } catch (error) {
        console.error('Erreur:', error);
        toast.error(getText('Erreur lors de la suppression', 'Nisy hadisoana tamin\'ny famafana'));
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: { fr: string; mg: string }; color: string; icon: any }> = {
      active: {
        label: { fr: 'Actif', mg: 'Mavitrika' },
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle
      },
      completed: {
        label: { fr: 'Terminé', mg: 'Vita' },
        color: 'bg-blue-100 text-blue-700',
        icon: Clock
      },
      planning: {
        label: { fr: 'Planification', mg: 'Fandaminana' },
        color: 'bg-yellow-100 text-yellow-700',
        icon: Calendar
      },
      draft: {
        label: { fr: 'Brouillon', mg: 'Volavola' },
        color: 'bg-gray-100 text-gray-700',
        icon: AlertCircle
      }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;
    const label = getText(config.label.fr, config.label.mg);
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchTerm === '' || 
      project.title_fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.title_mg && project.title_mg.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === '' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">{getText('Chargement...', 'Miandry...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {getText('Gestion des projets', 'Fitantanana tetikasa')}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {getText('Créez, modifiez et supprimez les projets', 'Mamorona, manova ary mamafa tetikasa')}
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/projects/new')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {getText('Nouveau projet', 'Tetikasa vaovao')}
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={getText('Rechercher un projet...', 'Karohy tetikasa...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
          >
            <option value="">{getText('Tous les statuts', 'Sata rehetra')}</option>
            <option value="active">{getText('Actifs', 'Mavitrika')}</option>
            <option value="completed">{getText('Terminés', 'Vita')}</option>
            <option value="planning">{getText('Planification', 'Fandaminana')}</option>
            <option value="draft">{getText('Brouillons', 'Volavola')}</option>
          </select>
        </div>
        
        {(searchTerm || filterStatus) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs">
                {getText('Recherche:', 'Fikarohana:')} {searchTerm}
                <button onClick={() => setSearchTerm('')} className="hover:text-red-500">✕</button>
              </span>
            )}
            {filterStatus && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs">
                {getText('Statut:', 'Sata:')} {filterStatus}
                <button onClick={() => setFilterStatus('')} className="hover:text-red-500">✕</button>
              </span>
            )}
            <button 
              onClick={() => { setSearchTerm(''); setFilterStatus(''); }} 
              className="text-xs text-blue-600 hover:underline"
            >
              {getText('Tout effacer', 'Fafana daholo')}
            </button>
          </div>
        )}
      </div>

      {/* Liste des projets */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {getText('Aucun projet trouvé', 'Tsy misy tetikasa hita')}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {getText('Créez votre premier projet', 'Mamorona tetikasa voalohany')}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {getText('Titre', 'Lohateny')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {getText('Lieu', 'Toerana')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {getText('Statut', 'Sata')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {getText('Date', 'Daty')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {getText('Actions', 'Asa')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {project.image_url ? (
                          <img 
                            src={project.image_url} 
                            alt={project.title_fr} 
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{project.title_fr}</p>
                          {project.title_mg && (
                            <p className="text-xs text-gray-400">{project.title_mg}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {project.location ? (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-3.5 h-3.5" />
                          {project.location}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(project.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title={getText('Voir', 'Jereo')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/projects/${project.id}/edit`)}
                          className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                          title={getText('Modifier', 'Ovaina')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title={getText('Supprimer', 'Fafana')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistiques */}
      {projects.length > 0 && (
        <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
          <div>
            {getText('Total:', 'Rehetra:')} {projects.length} {getText('projet(s)', 'tetikasa')}
            {filteredProjects.length !== projects.length && (
              <span className="ml-2 text-blue-600">
                ({filteredProjects.length} {getText('affiché(s)', 'hita')})
              </span>
            )}
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              {projects.filter(p => p.status === 'active').length} {getText('actifs', 'mavitrika')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              {projects.filter(p => p.status === 'completed').length} {getText('terminés', 'vita')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}