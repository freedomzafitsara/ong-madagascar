'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { pageService, PageBackground } from '@/services/pageService';
import { 
  Search, MapPin, Calendar, Heart, X, Image as ImageIcon, 
  ChevronRight, Grid3x3, LayoutList, Sparkles, TrendingUp, 
  Users, Globe, ArrowRight, Target, BookOpen, Leaf, 
  Briefcase, UsersRound, Palette, GraduationCap, 
  Stethoscope, Sprout, Handshake, Loader2
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface Project {
  id: string;
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  location: string;
  category: string;
  image_url?: string;
  cover_image_url?: string;
  gallery_images?: string[];
  createdAt: string;
  status?: 'active' | 'completed' | 'draft' | 'planning';
}

// Categories avec icones professionnelles Lucide
const categories = [
  { value: 'education', labelFr: 'Éducation', labelMg: 'Fampianarana', icon: GraduationCap },
  { value: 'sante', labelFr: 'Santé', labelMg: 'Fahasalamana', icon: Stethoscope },
  { value: 'environnement', labelFr: 'Environnement', labelMg: 'Tontolo iainana', icon: Leaf },
  { value: 'agriculture', labelFr: 'Agriculture', labelMg: 'Fambolena', icon: Sprout },
  { value: 'social', labelFr: 'Social', labelMg: 'Sosialy', icon: Handshake },
  { value: 'culture', labelFr: 'Culture', labelMg: 'Kolontsaina', icon: Palette },
  { value: 'emploi', labelFr: 'Emploi', labelMg: 'Asa', icon: Briefcase },
  { value: 'formation', labelFr: 'Formation', labelMg: 'Fampiofanana', icon: UsersRound },
];

export default function ProjectsPage() {
  const { t, language } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);

  // Chargement du fond d'écran et des projets
  useEffect(() => {
    loadPageBackground();
    loadProjects();
  }, []);

  const loadPageBackground = async () => {
    try {
      const background = await pageService.getBackground('projects');
      if (background && background.is_active && background.image_url) {
        setPageBackground(background);
      }
    } catch (error) {
      console.error('Erreur chargement fond d\'écran:', error);
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get('/projects');
      let allProjects = response.data.data || response.data || [];
      
      // Filtrer les projets non draft
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

  // Filtrer les projets
  useEffect(() => {
    let filtered = [...projects];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(term) ||
        (p.title_mg && p.title_mg.toLowerCase().includes(term)) ||
        p.description.toLowerCase().includes(term) ||
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
    return project.image_url || project.cover_image_url || '/images/placeholder-project.jpg';
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
    return language === 'fr' ? project.title : (project.title_mg || project.title);
  };

  const getProjectDescription = (project: Project) => {
    return language === 'fr' ? project.description : (project.description_mg || project.description);
  };

  const stats = {
    total: projects.length,
    categories: new Set(projects.map(p => p.category)).size,
    locations: new Set(projects.map(p => p.location).filter(Boolean)).size,
  };

  // Style du fond d'écran dynamique
  const backgroundStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundImage: `url(${pageBackground.image_url})`,
    backgroundPosition: pageBackground.position || 'center',
    backgroundSize: pageBackground.size || 'cover',
  } : {};

  const overlayStyle = pageBackground?.image_url ? {
    backgroundColor: `rgba(0, 0, 0, ${(pageBackground.overlay_opacity || 30) / 100})`,
  } : {};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{language === 'fr' ? 'Chargement...' : 'Miandry...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Section Hero avec fond d'écran dynamique */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          {backgroundStyle.backgroundImage ? (
            <>
              <div className="absolute inset-0" style={backgroundStyle} />
              <div className="absolute inset-0" style={overlayStyle} />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
          )}
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-6 border border-white/20">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-medium text-white">Y-Mad Madagascar</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            {language === 'fr' ? 'Nos Projets' : 'Ny Tetikasantsika'}
            <span className="block text-3xl md:text-4xl lg:text-5xl text-blue-200 mt-3">
              {language === 'fr' ? 'pour un avenir meilleur' : 'ho an\'ny hoavy tsara kokoa'}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto mb-8 drop-shadow-md">
            {language === 'fr' 
              ? 'Découvrez comment nous transformons les défis en opportunités pour la jeunesse malgache'
              : 'Jereo ny fomba hanovanay ny fanamby ho fahafahana ho an\'ny tanora malagasy'}
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <a 
              href="#projects-list" 
              className="inline-flex items-center gap-2 bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
            >
              {language === 'fr' ? 'Découvrir nos actions' : 'Hijery ny asantsika'} <ArrowRight className="w-5 h-5" />
            </a>
            <Link 
              href="/donate" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition shadow-lg"
            >
              <Heart className="w-5 h-5" /> {language === 'fr' ? 'Soutenir Y-Mad' : 'Hanohana ny Y-Mad'}
            </Link>
          </div>
          
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-2 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Statistiques */}
      <section className="relative -mt-16 z-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                {language === 'fr' ? 'Notre Impact en Chiffres' : 'Ny Vokatray'}
              </h2>
              <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full mt-3"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                  <TrendingUp className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-4xl font-bold text-gray-800 mb-2">{stats.total || 0}</p>
                <p className="text-gray-500 font-medium">{language === 'fr' ? 'Projets réalisés' : 'Tetikasa vita'}</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                  <Target className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-4xl font-bold text-gray-800 mb-2">{stats.categories || 0}</p>
                <p className="text-gray-500 font-medium">{language === 'fr' ? "Domaines d'action" : 'Sekolin\'asa'}</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                  <Globe className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-4xl font-bold text-gray-800 mb-2">{stats.locations || 0}</p>
                <p className="text-gray-500 font-medium">{language === 'fr' ? 'Régions couvertes' : 'Faritra voarakotra'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Filtres et Recherche */}
      <section className="max-w-7xl mx-auto px-4 py-16" id="projects-list">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {language === 'fr' ? 'Nos Actions en Cours' : 'Ny Hetsika Mitohy'}
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Découvrez les projets qui transforment concrètement la vie des jeunes Malgaches'
              : 'Jereo ny tetikasa izay manova ny fiainan\'ny tanora Malagasy'}
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={language === 'fr' 
                  ? 'Rechercher un projet par titre, description ou lieu...'
                  : 'Karohy ny tetikasa...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
              >
                <option value="">{language === 'fr' ? 'Toutes les catégories' : 'Sokajy rehetra'}</option>
                {categories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <option key={cat.value} value={cat.value}>
                      {language === 'fr' ? cat.labelFr : cat.labelMg}
                    </option>
                  );
                })}
              </select>
              
              <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 px-4 transition ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 px-4 transition ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <LayoutList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Filtres actifs */}
          {(searchTerm || selectedCategory) && (
            <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-gray-100">
              {searchTerm && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
                  <Search className="w-3 h-3" />
                  {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
                  {getCategoryLabel(selectedCategory)}
                  <button onClick={() => setSelectedCategory('')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory(''); }} 
                className="text-sm text-blue-600 hover:underline"
              >
                {language === 'fr' ? 'Tout effacer' : 'Fafana daholo'}
              </button>
            </div>
          )}
        </div>

        {/* Résultats */}
        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-blue-600">{filteredProjects.length}</span> 
            {language === 'fr' ? ' projet(s) trouvé(s)' : ' tetikasa hita'}
          </p>
        </div>

        {/* Grille des projets */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-20 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl mb-2">{language === 'fr' ? 'Aucun projet trouvé' : 'Tsy misy tetikasa hita'}</p>
            <p className="text-gray-400">{language === 'fr' ? 'Essayez de modifier vos critères de recherche' : 'Andramo hanova ny fikarohanao'}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => {
              const CategoryIcon = getCategoryIcon(project.category);
              return (
                <div 
                  key={project.id}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
                  onClick={() => openProjectDetails(project)}
                >
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    {getMainImageUrl(project) !== '/images/placeholder-project.jpg' ? (
                      <img 
                        src={getMainImageUrl(project)} 
                        alt={getProjectTitle(project)} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <ImageIcon className="w-16 h-16 text-gray-300 mb-2" />
                        <span className="text-sm text-gray-400">{language === 'fr' ? 'Image à venir' : 'Sary ho avy'}</span>
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full text-white font-medium shadow-lg bg-blue-600">
                        <CategoryIcon className="w-3 h-3" /> {getCategoryLabel(project.category)}
                      </span>
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex items-end justify-center pb-6">
                      <span className="bg-white text-gray-800 px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition duration-300">
                        {language === 'fr' ? 'Voir les détails' : 'Jereo ny antsipirihany'} <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition">
                      {getProjectTitle(project)}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {project.location || 'Madagascar'}
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {formatDate(project.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                      {getProjectDescription(project)}
                    </p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-sm text-blue-600">
                        <Heart className="w-4 h-4" /> 
                        <span>{language === 'fr' ? 'À découvrir' : 'Hojerena'}</span>
                      </div>
                      <span className="text-sm text-gray-400 group-hover:text-blue-600 transition flex items-center gap-1">
                        {language === 'fr' ? 'En savoir plus' : 'Hamaky bebe kokoa'} <ArrowRight className="w-4 h-4" />
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
                  className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col md:flex-row border border-gray-100"
                  onClick={() => openProjectDetails(project)}
                >
                  <div className="md:w-56 h-48 bg-gray-100 relative overflow-hidden">
                    {getMainImageUrl(project) !== '/images/placeholder-project.jpg' ? (
                      <img 
                        src={getMainImageUrl(project)} 
                        alt={getProjectTitle(project)} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full text-white font-medium bg-blue-600">
                        <CategoryIcon className="w-3 h-3" /> {getCategoryLabel(project.category)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 p-6">
                    <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-blue-600 transition">
                      {getProjectTitle(project)}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {project.location || 'Madagascar'}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(project.createdAt)}</span>
                    </div>
                    <p className="text-gray-600 line-clamp-2 mb-4">{getProjectDescription(project)}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-blue-600 flex items-center gap-1 font-medium">
                        <Heart className="w-4 h-4" /> {language === 'fr' ? 'Soutenir' : 'Hanohana'}
                      </span>
                      <span className="text-sm text-gray-400 group-hover:text-blue-600 transition flex items-center gap-1">
                        {language === 'fr' ? 'En savoir plus' : 'Hamaky bebe kokoa'} <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section Appel à l'action */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-900 py-20 mt-10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
            <Heart className="w-4 h-4 text-blue-300" />
            <span className="text-sm text-white/90">{language === 'fr' ? 'Rejoignez le mouvement' : 'Miaraha aminay'}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {language === 'fr' ? 'Vous souhaitez nous soutenir ?' : 'Te hanohana anay ve ianao?'}
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Chaque don, chaque partage, chaque engagement compte pour construire un Madagascar meilleur'
              : 'Ny fanomezana rehetra, ny fizarana rehetra, ny fandraisana andraikitra rehetra dia manan-danja hananganana an\'i Madagasikara tsara kokoa'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href="/donate" 
              className="inline-flex items-center gap-2 bg-white text-blue-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              <Heart className="w-5 h-5" /> {language === 'fr' ? 'Faire un don' : 'Manome'}
            </Link>
            <Link 
              href="/volunteers" 
              className="inline-flex items-center gap-2 bg-blue-500/30 backdrop-blur-sm text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-500/50 transition border border-white/30"
            >
              <Users className="w-5 h-5" /> {language === 'fr' ? 'Devenir bénévole' : 'Mpanao asa soa'} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 bg-transparent text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition border border-white/50"
            >
              {language === 'fr' ? 'Nous contacter' : 'Mifandraisa aminay'}
            </Link>
          </div>
        </div>
      </section>

      {/* Modal Détails Projet */}
      {showModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-5 border-b flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{getProjectTitle(selectedProject)}</h2>
                <p className="text-sm text-gray-500">{selectedProject.location}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <img 
                src={getMainImageUrl(selectedProject)} 
                alt={getProjectTitle(selectedProject)}
                className="w-full h-[400px] object-cover rounded-xl shadow-lg"
              />
            </div>

            <div className="p-6 border-t bg-gray-50">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">
                {language === 'fr' ? 'Description du projet' : 'Famaritana ny tetikasa'}
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {getProjectDescription(selectedProject)}
              </p>
            </div>

            <div className="p-6 border-t flex justify-center gap-4">
              <Link 
                href="/donate" 
                className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg"
                onClick={() => setShowModal(false)}
              >
                <Heart className="w-5 h-5" /> {language === 'fr' ? 'Soutenir ce projet' : 'Hanohana ity tetikasa ity'}
              </Link>
              <Link 
                href="/contact" 
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition"
                onClick={() => setShowModal(false)}
              >
                {language === 'fr' ? 'Nous contacter' : 'Mifandraisa aminay'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}