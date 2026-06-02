'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { pageService, PageBackground } from '@/services/page.service';
import { 
  Search, MapPin, Calendar, Heart, X, Image as ImageIcon, 
  ChevronRight, Grid3x3, LayoutList, Sparkles, TrendingUp, 
  Users, Globe, ArrowRight, Target, BookOpen, Leaf, 
  Briefcase, UsersRound, Palette, GraduationCap, 
  Stethoscope, Sprout, Handshake, Loader2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Project {
  id: string;
  title_fr: string;
  title_mg?: string;
  description_fr: string;
  description_mg?: string;
  location: string;
  category: string;
  image_url?: string;
  created_at: string;
  status?: string;
}

// Categories avec icones
const categories = [
  { value: 'education', labelFr: 'Education', labelMg: 'Fampianarana', icon: GraduationCap },
  { value: 'sante', labelFr: 'Sante', labelMg: 'Fahasalamana', icon: Stethoscope },
  { value: 'environnement', labelFr: 'Environnement', labelMg: 'Tontolo iainana', icon: Leaf },
  { value: 'agriculture', labelFr: 'Agriculture', labelMg: 'Fambolena', icon: Sprout },
  { value: 'social', labelFr: 'Social', labelMg: 'Sosialy', icon: Handshake },
  { value: 'culture', labelFr: 'Culture', labelMg: 'Kolontsaina', icon: Palette },
  { value: 'emploi', labelFr: 'Emploi', labelMg: 'Asa', icon: Briefcase },
  { value: 'formation', labelFr: 'Formation', labelMg: 'Fampiofanana', icon: UsersRound },
];

export default function ProjectsPage() {
  const { language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  useEffect(() => {
    loadPageBackground();
    loadProjects();
  }, []);

  const loadPageBackground = async () => {
    try {
      const background = await pageService.getPageBackground('projects');
      if (background && background.is_active && background.image_url) {
        setPageBackground(background);
      }
    } catch (error) {
      console.error('Erreur chargement fond d ecran:', error);
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get('/projects/public');
      let allProjects = response.data.data || response.data || [];
      const activeProjects = allProjects.filter((p: Project) => p.status !== 'draft');
      setProjects(activeProjects);
      setFilteredProjects(activeProjects);
    } catch (error) {
      console.error('Erreur chargement projets:', error);
    } finally {
      setLoading(false);
    }
  };

  const openProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  useEffect(() => {
    let filtered = [...projects];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.title_fr.toLowerCase().includes(term) ||
        (p.title_mg && p.title_mg.toLowerCase().includes(term)) ||
        p.description_fr.toLowerCase().includes(term) ||
        (p.description_mg && p.description_mg.toLowerCase().includes(term)) ||
        p.location.toLowerCase().includes(term)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    setFilteredProjects(filtered);
  }, [searchTerm, selectedCategory, projects]);

  const getMainImageUrl = (project: Project): string => {
    return project.image_url || '/images/placeholder-project.jpg';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const getCategoryIcon = (categoryValue: string) => {
    const cat = categories.find(c => c.value === categoryValue);
    if (!cat) return BookOpen;
    return cat.icon;
  };

  const getCategoryLabel = (categoryValue: string) => {
    const cat = categories.find(c => c.value === categoryValue);
    if (!cat) return categoryValue;
    return language === 'fr' ? cat.labelFr : cat.labelMg;
  };

  const getProjectTitle = (project: Project) => {
    return language === 'fr' ? project.title_fr : (project.title_mg || project.title_fr);
  };

  const getProjectDescription = (project: Project) => {
    return language === 'fr' ? project.description_fr : (project.description_mg || project.description_fr);
  };

  const stats = {
    total: projects.length,
    categories: new Set(projects.map(p => p.category)).size,
    locations: new Set(projects.map(p => p.location).filter(Boolean)).size,
  };

  // Style fond d'ecran PLEIN ECRAN
  const heroBackgroundStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundImage: `url(${pageBackground.image_url})`,
    backgroundPosition: pageBackground.position || 'center',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
  } : {};

  const heroOverlayStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundColor: `rgba(0, 0, 0, ${(pageBackground.overlay_opacity || 35) / 100})`,
  } : {};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{getText('Chargement...', 'Miandry...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ==================== HERO SECTION - PLEIN ECRAN ==================== */}
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {pageBackground?.image_url && pageBackground.is_active ? (
            <>
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed" style={heroBackgroundStyle} />
              <div className="absolute inset-0" style={heroOverlayStyle} />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-900 to-gray-900" />
          )}
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span className="text-sm font-medium text-white">Y-MaD Madagascar</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-2xl">
            {getText('Nos Projets', 'Ny Tetikasantsika')}
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-blue-100 max-w-2xl mx-auto">
            {getText(
              'Decouvrez comment nous transformons les defis en opportunites',
              'Jereo ny fomba hanovanay ny fanamby ho fahafahana'
            )}
          </p>
          
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-7 h-11 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1.5 h-2.5 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== STATISTIQUES ==================== */}
      <div className="bg-white rounded-t-3xl shadow-2xl -mt-10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-gray-500">{getText('Projets realises', 'Tetikasa vita')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.categories}</p>
              <p className="text-gray-500">{getText("Domaines d'action", 'Sekolin\'asa')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.locations}</p>
              <p className="text-gray-500">{getText('Regions couvertes', 'Faritra voarakotra')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== FILTRES ET LISTE ==================== */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {getText('Nos actions en cours', 'Ny hetsika mitohy')}
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={getText('Rechercher un projet...', 'Karohy ny tetikasa...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
              >
                <option value="">{getText('Toutes les categories', 'Sokajy rehetra')}</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {language === 'fr' ? cat.labelFr : cat.labelMg}
                  </option>
                ))}
              </select>
              
              <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 px-3 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 px-3 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {(searchTerm || selectedCategory) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              {searchTerm && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs">
                  {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="hover:text-red-500">✕</button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs">
                  {getCategoryLabel(selectedCategory)}
                  <button onClick={() => setSelectedCategory('')} className="hover:text-red-500">✕</button>
                </span>
              )}
              <button onClick={() => { setSearchTerm(''); setSelectedCategory(''); }} className="text-xs text-blue-600 hover:underline">
                {getText('Tout effacer', 'Fafana daholo')}
              </button>
            </div>
          )}
        </div>

        {/* Resultats */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-blue-700">{filteredProjects.length}</span> {getText(' projet(s) trouve(s)', ' tetikasa hita')}
          </p>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md py-16 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{getText('Aucun projet trouve', 'Tsy misy tetikasa hita')}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const CategoryIcon = getCategoryIcon(project.category);
              return (
                <div 
                  key={project.id}
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl cursor-pointer border border-gray-100"
                  onClick={() => openProjectDetails(project)}
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {getMainImageUrl(project) !== '/images/placeholder-project.jpg' ? (
                      <img src={getMainImageUrl(project)} alt={getProjectTitle(project)} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                        <ImageIcon className="w-12 h-12 text-blue-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-600 text-white">
                        <CategoryIcon className="w-3 h-3" /> {getCategoryLabel(project.category)}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1 group-hover:text-blue-600">
                      {getProjectTitle(project)}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <MapPin className="w-3.5 h-3.5" /> {project.location || 'Madagascar'}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{getProjectDescription(project)}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-blue-600 font-medium text-sm flex items-center gap-1">
                        {getText('Voir details', 'Jereo')} <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => {
              const CategoryIcon = getCategoryIcon(project.category);
              return (
                <div 
                  key={project.id}
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg cursor-pointer flex flex-col md:flex-row border border-gray-100"
                  onClick={() => openProjectDetails(project)}
                >
                  <div className="md:w-48 h-32 bg-gray-100 relative">
                    {getMainImageUrl(project) !== '/images/placeholder-project.jpg' ? (
                      <img src={getMainImageUrl(project)} alt={getProjectTitle(project)} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50">
                        <ImageIcon className="w-8 h-8 text-blue-300" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white">
                        <CategoryIcon className="w-3 h-3" /> {getCategoryLabel(project.category)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 p-5">
                    <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-blue-600">
                      {getProjectTitle(project)}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <MapPin className="w-3.5 h-3.5" /> {project.location || 'Madagascar'}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{getProjectDescription(project)}</p>
                    <div className="mt-2">
                      <span className="text-blue-600 font-medium text-sm flex items-center gap-1">
                        {getText('Voir details', 'Jereo')} <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================== CTA SECTION ==================== */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 py-16 mt-10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Heart className="w-12 h-12 text-blue-300 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {getText('Vous souhaitez nous soutenir ?', 'Te hanohana anay ve ianao?')}
          </h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            {getText(
              'Chaque don compte pour construire un Madagascar meilleur',
              'Ny fanomezana rehetra dia manan-danja hananganana an\'i Madagasikara tsara kokoa'
            )}
          </p>
          <Link 
            href="/contact" 
            className="inline-flex items-center gap-2 bg-white text-blue-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            {getText('Nous contacter', 'Mifandraisa aminay')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ==================== MODAL PROJET ==================== */}
      {showModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            
            <div className="sticky top-0 bg-white p-5 border-b flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{getProjectTitle(selectedProject)}</h2>
                <p className="text-sm text-gray-500">{selectedProject.location}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <img src={getMainImageUrl(selectedProject)} alt={getProjectTitle(selectedProject)} className="w-full h-[350px] object-cover rounded-xl shadow-lg" />
            </div>

            <div className="p-6 border-t bg-gray-50">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">{getText('Description du projet', 'Famaritana ny tetikasa')}</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{getProjectDescription(selectedProject)}</p>
            </div>

            <div className="p-6 border-t flex justify-center">
              <Link href="/contact" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700" onClick={() => setShowModal(false)}>
                {getText('Nous contacter', 'Mifandraisa aminay')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}