'use client'

"use client";

import { useState, useEffect } from 'react';
import { projectService } from '@/services/adminService';
import { sharedDataService } from '@/services/sharedDataService';
import { Project } from '@/types';
import { ProjectImageUpload } from '@/components/ui/ProjectImageUpload';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export function ProjectsManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectService.getAll();
      // Trier par ordre
      const sortedProjects = (data.data || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      setProjects(sortedProjects);
    } catch (error) {
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Fonction pour monter un projet
  const handleMoveUp = async (projectId: string) => {
    try {
      await sharedDataService.moveProjectUp(projectId);
      toast.success('Projet déplacé vers le haut');
      fetchProjects();
    } catch (error) {
      toast.error('Erreur lors du déplacement');
    }
  };

  // Fonction pour descendre un projet
  const handleMoveDown = async (projectId: string) => {
    try {
      await sharedDataService.moveProjectDown(projectId);
      toast.success('Projet déplacé vers le bas');
      fetchProjects();
    } catch (error) {
      toast.error('Erreur lors du déplacement');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce projet ? Cette action est irréversible.')) {
      try {
        await projectService.delete(id);
        toast.success('Projet supprimé avec succès');
        fetchProjects();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700',
      paused: 'bg-yellow-100 text-yellow-700',
      planned: 'bg-blue-100 text-blue-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Actif',
      completed: 'Terminé',
      paused: 'En pause',
      planned: 'Planifié',
    };
    return labels[status] || status;
  };

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('fr-MG').format(amount) + ' MGA';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-marine-900">Gestion des projets</h2>
          <p className="text-sm text-gray-500 mt-1">
            Glissez ou utilisez les flèches pour réorganiser l'ordre d'affichage
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProject(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-gold-500 to-gold-600 text-marine-900 px-4 py-2 rounded-lg hover:shadow-lg transition flex items-center gap-2"
        >
          <span>+</span> Nouveau projet
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="completed">Terminés</option>
          <option value="paused">En pause</option>
          <option value="planned">Planifiés</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-sm text-blue-600">💡 Astuce : Utilisez les flèches ↑ ↓ pour réorganiser l'ordre d'affichage des projets sur la page d'accueil</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="w-full md:w-48 h-48 bg-gradient-to-br from-marine-600 to-marine-700 relative overflow-hidden">
                  {project.coverImage ? (
                    <img 
                      src={project.coverImage} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">
                        {project.category === 'Éducation' ? '📚' : 
                         project.category === 'Eau' ? '💧' : 
                         project.category === 'Santé' ? '🏥' : '🌱'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Contenu */}
                <div className="flex-1 p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gold-600 font-semibold bg-gold-50 px-3 py-1 rounded-full">
                          {project.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-marine-900">{project.title}</h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">{project.description}</p>
                    </div>
                    
                    {/* Boutons d'ordre */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveUp(project.id)}
                        disabled={index === 0}
                        className={`p-2 rounded-lg transition ${
                          index === 0 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Monter (déplacer vers le haut)"
                      >
                        ↑
                      </button>
                      <span className="text-sm text-gray-400 w-8 text-center">#{project.order || index + 1}</span>
                      <button
                        onClick={() => handleMoveDown(project.id)}
                        disabled={index === filteredProjects.length - 1}
                        className={`p-2 rounded-lg transition ${
                          index === filteredProjects.length - 1 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Descendre (déplacer vers le bas)"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">📍 Lieu</p>
                      <p className="font-medium text-gray-700">{project.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">👥 Bénéficiaires</p>
                      <p className="font-medium text-gray-700">{project.beneficiaries}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">💰 Budget</p>
                      <p className="font-medium text-gray-700">{formatBudget(project.budget)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">📊 Progression</p>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-gold-500 h-1.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-medium">{project.progress}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setShowModal(true);
                      }}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm"
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition text-sm"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Aucun projet trouvé
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editingProject}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
}

// Modal de création/modification de projet
function ProjectModal({ project, onClose, onSuccess }: { project: Project | null; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    slug: project?.slug || '',
    description: project?.description || '',
    category: project?.category || 'Éducation',
    status: project?.status || 'active',
    location: project?.location || '',
    beneficiaries: project?.beneficiaries || 0,
    budget: project?.budget || 0,
    startDate: project?.startDate?.split('T')[0] || '',
    endDate: project?.endDate?.split('T')[0] || '',
    progress: project?.progress || 0,
    order: project?.order || 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(project?.coverImage || null);

  const handleImageUpload = (file: File, preview: string) => {
    setImagePreview(preview);
    setFormData({ ...formData, coverImage: preview });
  };

  const handleImageRemove = () => {
    setImagePreview(null);
    setFormData({ ...formData, coverImage: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const data = { 
        ...formData, 
        slug, 
        beneficiaries: Number(formData.beneficiaries), 
        budget: Number(formData.budget), 
        progress: Number(formData.progress),
        coverImage: imagePreview || formData.coverImage
      };
      
      if (project) {
        await projectService.update(project.id, data);
        toast.success('Projet modifié avec succès');
      } else {
        await projectService.create(data);
        toast.success('Projet créé avec succès');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-marine-900">
            {project ? 'Modifier le projet' : 'Créer un projet'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Upload d'image */}
          <ProjectImageUpload
            currentImage={imagePreview}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            label="Image de couverture du projet"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre du projet *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              placeholder="Titre du projet"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              placeholder="Description du projet..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="Éducation">📚 Éducation</option>
                <option value="Eau">💧 Eau</option>
                <option value="Santé">🏥 Santé</option>
                <option value="Agriculture">🌾 Agriculture</option>
                <option value="Environnement">🌳 Environnement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="active">✅ Actif</option>
                <option value="planned">📅 Planifié</option>
                <option value="paused">⏸️ En pause</option>
                <option value="completed">🏁 Terminé</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              placeholder="Région, District"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bénéficiaires</label>
              <input
                type="number"
                value={formData.beneficiaries}
                onChange={(e) => setFormData({ ...formData, beneficiaries: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (MGA)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Progression (%)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm font-semibold text-marine-700 w-12 text-center">{formData.progress}%</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-marine-900 rounded-lg hover:shadow-lg disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Enregistrement...' : project ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

