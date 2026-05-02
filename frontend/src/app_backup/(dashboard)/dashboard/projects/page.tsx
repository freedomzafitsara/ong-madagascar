// src/app/dashboard/projects/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getAllProjects, 
  createProject,
  updateProject,
  deleteProject, 
  addProjectImage, 
  getProjectImages, 
  setMainImage, 
  deleteImage, 
  getMainImageUrl
} from '@/services/imageDB';
import { X, Plus, Edit, Trash2, Search, Upload, Image as ImageIcon, CheckCircle, AlertCircle, FolderOpen, MapPin, Calendar } from 'lucide-react';

// Types
interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  mainImageId: string;
  createdAt: string;
  status?: 'active' | 'completed' | 'draft';
}

interface ProjectImage {
  id: string;
  projectId: string;
  url: string;
  name: string;
  isMain: boolean;
  createdAt: string;
}

// Catégories disponibles - Version Y-Mad
const categories = [
  { value: 'Éducation', label: '📚 Éducation', color: 'bg-ymad-blue-100 text-ymad-blue-700' },
  { value: 'Santé', label: '🏥 Santé', color: 'bg-ymad-blue-100 text-ymad-blue-700' },
  { value: 'Environnement', label: '🌿 Environnement', color: 'bg-ymad-blue-100 text-ymad-blue-700' },
  { value: 'Agriculture', label: '🌾 Agriculture', color: 'bg-ymad-blue-100 text-ymad-blue-700' },
  { value: 'Social', label: '🤝 Social', color: 'bg-ymad-blue-100 text-ymad-blue-700' },
  { value: 'Culture', label: '🎨 Culture', color: 'bg-ymad-blue-100 text-ymad-blue-700' },
];

export default function ProjectsPage() {
  // États
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [mainImageUrls, setMainImageUrls] = useState<Record<string, string>>({});
  const [showGallery, setShowGallery] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Formulaire
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formCategory, setFormCategory] = useState('Éducation');

  // Chargement des projets
  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const allProjects = await getAllProjects();
      console.log('Projets chargés:', allProjects.length);
      setProjects(allProjects);
      
      // Charger les images principales
      const urls: Record<string, string> = {};
      for (const project of allProjects) {
        const url = await getMainImageUrl(project.id);
        if (url) urls[project.id] = url;
      }
      setMainImageUrls(urls);
    } catch (error) {
      console.error('Erreur chargement projets:', error);
      showMessage('Erreur lors du chargement des projets', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Ouvrir la galerie d'images
  const openGallery = async (project: Project) => {
    setSelectedProject(project);
    try {
      const projectImages = await getProjectImages(project.id);
      setImages(projectImages);
      setShowGallery(true);
    } catch (error) {
      showMessage('Erreur chargement des images', 'error');
    }
  };

  // Upload d'images
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedProject) return;
    
    setUploading(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          errorCount++;
          continue;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          errorCount++;
          continue;
        }
        
        await addProjectImage(selectedProject.id, file);
        successCount++;
      }
      
      const updatedImages = await getProjectImages(selectedProject.id);
      setImages(updatedImages);
      await loadProjects();
      
      if (successCount > 0) {
        showMessage(`${successCount} image(s) ajoutée(s) avec succès`, 'success');
      }
      if (errorCount > 0) {
        showMessage(`${errorCount} image(s) ignorée(s)`, 'error');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      showMessage('Erreur lors de l\'upload', 'error');
    } finally {
      setUploading(false);
      const input = document.getElementById('fileInput') as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  // Définir l'image principale
  const handleSetMainImage = async (imageId: string) => {
    if (selectedProject) {
      try {
        await setMainImage(selectedProject.id, imageId);
        const updatedImages = await getProjectImages(selectedProject.id);
        setImages(updatedImages);
        await loadProjects();
        showMessage('Image principale mise à jour', 'success');
      } catch (error) {
        showMessage('Erreur lors de la mise à jour', 'error');
      }
    }
  };

  // Supprimer une image
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Supprimer cette image définitivement ?') || !selectedProject) return;
    
    try {
      await deleteImage(imageId);
      const updatedImages = await getProjectImages(selectedProject.id);
      setImages(updatedImages);
      await loadProjects();
      showMessage('Image supprimée avec succès', 'success');
    } catch (error) {
      showMessage('Erreur lors de la suppression', 'error');
    }
  };

  // Créer ou modifier un projet
  const saveProjectHandler = async () => {
    if (!formTitle.trim()) {
      showMessage('Le titre est requis', 'error');
      return;
    }
    
    try {
      if (isEditing && selectedProject) {
        await updateProject(selectedProject.id, {
          title: formTitle,
          description: formDescription,
          location: formLocation,
          category: formCategory
        });
        showMessage('Projet modifié avec succès', 'success');
      } else {
        await createProject({
          title: formTitle,
          description: formDescription,
          location: formLocation,
          category: formCategory,
          status: 'active'
        });
        showMessage('Projet créé avec succès', 'success');
      }
      
      await loadProjects();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('Erreur lors de l\'enregistrement', 'error');
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormLocation('');
    setFormCategory('Éducation');
    setIsEditing(false);
    setSelectedProject(null);
  };

  // Ouvrir le formulaire d'édition
  const editProject = (project: Project) => {
    setIsEditing(true);
    setSelectedProject(project);
    setFormTitle(project.title);
    setFormDescription(project.description);
    setFormLocation(project.location);
    setFormCategory(project.category);
    setShowForm(true);
  };

  // Supprimer un projet
  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`Supprimer définitivement "${project.title}" ?`)) return;
    
    try {
      await deleteProject(project.id);
      await loadProjects();
      showMessage('Projet supprimé avec succès', 'success');
    } catch (error) {
      showMessage('Erreur lors de la suppression', 'error');
    }
  };

  // Formatage de date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // Filtrage des projets
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-ymad-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ymad-gray-500">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Message toast */}
      {message && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ymad-gray-800">Gestion des projets</h1>
          <p className="text-ymad-gray-500 mt-1">Créez, modifiez et gérez les images de vos projets</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(true); }} 
          className="flex items-center gap-2 bg-ymad-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-ymad-blue-700 transition shadow-sm"
        >
          <Plus className="w-5 h-5" /> Nouveau projet
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-ymad-gray-100">
          <FolderOpen className="w-6 h-6 text-ymad-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ymad-gray-800">{projects.length}</p>
          <p className="text-sm text-ymad-gray-500">Total projets</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-ymad-gray-100">
          <MapPin className="w-6 h-6 text-ymad-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ymad-gray-800">{new Set(projects.map(p => p.location).filter(Boolean)).size}</p>
          <p className="text-sm text-ymad-gray-500">Régions couvertes</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-ymad-gray-100">
          <Calendar className="w-6 h-6 text-ymad-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ymad-gray-800">{projects.filter(p => p.status === 'active').length}</p>
          <p className="text-sm text-ymad-gray-500">Projets actifs</p>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ymad-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher un projet par titre, lieu ou catégorie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500 focus:border-ymad-blue-500 outline-none"
        />
      </div>

      {/* Grille des projets */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-ymad-gray-500 mb-4">
            {searchTerm ? 'Aucun projet ne correspond à votre recherche' : 'Aucun projet pour le moment'}
          </p>
          {!searchTerm && (
            <button 
              onClick={() => { resetForm(); setShowForm(true); }} 
              className="text-ymad-blue-600 hover:underline"
            >
              Créer votre premier projet
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const imageUrl = mainImageUrls[project.id];
            const categoryInfo = categories.find(c => c.value === project.category) || categories[0];
            
            return (
              <div key={project.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group border border-ymad-gray-100">
                {/* Image */}
                <div className="relative h-48 bg-ymad-gray-100">
                  {imageUrl ? (
                    <img src={imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-ymad-gray-400">
                      <ImageIcon className="w-12 h-12 mb-2" />
                      <span className="text-sm">Aucune image</span>
                    </div>
                  )}
                  {/* Badge catégorie */}
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${categoryInfo.color}`}>
                      {categoryInfo.label}
                    </span>
                  </div>
                  {/* Bouton galerie */}
                  <button
                    onClick={() => openGallery(project)}
                    className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-black/80 transition flex items-center gap-1"
                  >
                    <ImageIcon className="w-4 h-4" /> Gérer les images
                  </button>
                </div>
                
                {/* Contenu */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-ymad-gray-800 line-clamp-1">{project.title}</h3>
                  <p className="text-sm text-ymad-gray-500 mt-1 flex items-center gap-1">
                    <span>📍</span> {project.location || 'Lieu non spécifié'}
                  </p>
                  <p className="text-sm text-ymad-gray-600 mt-2 line-clamp-2">{project.description}</p>
                  
                  {/* Actions */}
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-ymad-gray-100">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-ymad-gray-100 text-ymad-gray-600'
                    }`}>
                      {project.status === 'active' ? '✅ Actif' : '📝 Brouillon'}
                    </span>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => editProject(project)} 
                        className="text-ymad-blue-600 hover:text-ymad-blue-700 text-sm font-medium transition flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" /> Modifier
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(project)} 
                        className="text-red-500 hover:text-red-600 text-sm font-medium transition flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== MODAL GALERIE ==================== */}
      {showGallery && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* En-tête */}
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center rounded-t-xl">
              <div>
                <h2 className="text-xl font-bold text-ymad-gray-800">Galerie - {selectedProject.title}</h2>
                <p className="text-sm text-ymad-gray-500 mt-1">{images.length} image(s)</p>
              </div>
              <button onClick={() => setShowGallery(false)} className="p-1 hover:bg-ymad-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Zone d'upload */}
            <div className="p-4 border-b bg-ymad-gray-50">
              <label className="block cursor-pointer">
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition bg-white ${
                  uploading ? 'border-ymad-blue-400 bg-ymad-blue-50' : 'border-ymad-gray-300 hover:border-ymad-blue-400'
                }`}>
                  <input type="file" id="fileInput" accept="image/*" multiple onChange={handleUpload} className="hidden" />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-ymad-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-ymad-gray-600">Téléchargement en cours...</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-ymad-gray-400 mx-auto mb-2" />
                      <p className="text-ymad-gray-600 font-medium">Cliquez pour ajouter des images</p>
                      <p className="text-xs text-ymad-gray-400 mt-1">JPEG, PNG, WebP - Max 5MB par image</p>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Grille des images */}
            <div className="flex-1 overflow-auto p-4 bg-ymad-gray-50">
              {images.length === 0 ? (
                <div className="text-center py-12 text-ymad-gray-400">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Aucune image dans ce projet</p>
                  <p className="text-sm mt-2">Ajoutez des images en cliquant sur la zone ci-dessus</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map(img => (
                    <div key={img.id} className="bg-white rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition">
                      <img src={img.url} alt={img.name} className="w-full h-36 object-cover" />
                      <div className="p-2 text-xs text-ymad-gray-500 truncate text-center border-b">{img.name}</div>
                      <div className="p-2 flex justify-center gap-2 bg-ymad-gray-50">
                        {!img.isMain ? (
                          <button 
                            onClick={() => handleSetMainImage(img.id)} 
                            className="text-xs text-ymad-blue-600 hover:text-ymad-blue-700 transition px-2 py-1 rounded"
                          >
                            ⭐ Définir principale
                          </button>
                        ) : (
                          <span className="text-xs bg-ymad-blue-600 text-white px-2 py-1 rounded">⭐ Principale</span>
                        )}
                        <button 
                          onClick={() => handleDeleteImage(img.id)} 
                          className="text-xs text-red-500 hover:text-red-600 transition px-2 py-1 rounded"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pied */}
            <div className="sticky bottom-0 bg-white p-3 border-t text-right rounded-b-xl">
              <button onClick={() => setShowGallery(false)} className="px-4 py-2 bg-ymad-gray-200 rounded-lg hover:bg-ymad-gray-300 transition">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL FORMULAIRE ==================== */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            {/* En-tête */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-ymad-gray-800">
                {isEditing ? '✏️ Modifier le projet' : '➕ Nouveau projet'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-ymad-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Formulaire */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ymad-gray-700 mb-1">Titre du projet *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Éducation pour tous" 
                  value={formTitle} 
                  onChange={(e) => setFormTitle(e.target.value)} 
                  className="w-full p-2.5 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500 focus:border-ymad-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ymad-gray-700 mb-1">Description</label>
                <textarea 
                  placeholder="Description détaillée du projet..." 
                  rows={3} 
                  value={formDescription} 
                  onChange={(e) => setFormDescription(e.target.value)} 
                  className="w-full p-2.5 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500 focus:border-ymad-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ymad-gray-700 mb-1">Localisation</label>
                <input 
                  type="text" 
                  placeholder="Ex: Antananarivo, Madagascar" 
                  value={formLocation} 
                  onChange={(e) => setFormLocation(e.target.value)} 
                  className="w-full p-2.5 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500 focus:border-ymad-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ymad-gray-700 mb-1">Catégorie</label>
                <select 
                  value={formCategory} 
                  onChange={(e) => setFormCategory(e.target.value)} 
                  className="w-full p-2.5 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500 focus:border-ymad-blue-500 outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Boutons */}
            <div className="p-4 border-t flex justify-end gap-3">
              <button 
                onClick={() => setShowForm(false)} 
                className="px-4 py-2 border border-ymad-gray-300 rounded-lg hover:bg-ymad-gray-50 transition"
              >
                Annuler
              </button>
              <button 
                onClick={saveProjectHandler} 
                className="px-5 py-2 bg-ymad-blue-600 text-white rounded-lg font-semibold hover:bg-ymad-blue-700 transition"
              >
                {isEditing ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}