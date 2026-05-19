'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Briefcase, MapPin, Calendar, DollarSign, Search, 
  ChevronRight, Building, Sparkles, X,
  Clock, CheckCircle, Heart, Users, Award, 
  ArrowRight, LayoutGrid, List, GraduationCap,
  Star, Loader2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { pageService, PageBackground } from '@/services/pageService';
import { jobsApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Job {
  id: string;
  title: string;
  title_mg?: string;
  company_name: string;
  location?: string;
  region?: string;
  job_type: string;
  salary?: string;
  description: string;
  description_mg?: string;
  deadline?: string;
  status: string;
  is_featured: boolean;
  image_url?: string;
  created_at: string;
}

const getText = (language: 'fr' | 'mg', frText: string, mgText: string): string => {
  return language === 'fr' ? frText : mgText;
};

const getContractIcon = (type: string) => {
  switch (type) {
    case 'cdi': return Star;
    case 'cdd': return Calendar;
    case 'stage': return GraduationCap;
    case 'freelance': return Briefcase;
    case 'benevolat': return Heart;
    default: return Briefcase;
  }
};

const getContractLabel = (type: string, language: 'fr' | 'mg') => {
  const labels: Record<string, { fr: string; mg: string }> = {
    cdi: { fr: 'CDI', mg: 'CDI' },
    cdd: { fr: 'CDD', mg: 'CDD' },
    stage: { fr: 'Stage', mg: 'Fiofanana' },
    freelance: { fr: 'Freelance', mg: 'Freelance' },
    benevolat: { fr: 'Bénévolat', mg: 'Asa an-tsitrapo' },
  };
  return labels[type]?.[language] || type;
};

const getContractColor = (type: string) => {
  const colors: Record<string, string> = {
    cdi: 'bg-blue-100 text-blue-700',
    cdd: 'bg-blue-100 text-blue-700',
    stage: 'bg-green-100 text-green-700',
    freelance: 'bg-purple-100 text-purple-700',
    benevolat: 'bg-pink-100 text-pink-700',
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
};

export default function JobsPage() {
  const { language } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [stats, setStats] = useState({ total: 0, types: 0, locations: 0 });

  useEffect(() => {
    loadPageBackground();
    fetchJobs();
  }, []);

  const loadPageBackground = async () => {
    try {
      const background = await pageService.getBackground('emploi');
      if (background && background.is_active && background.image_url) {
        setPageBackground(background);
      }
    } catch (error) {
      console.error('Erreur chargement fond d ecran:', error);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await jobsApi.getPublic(1, 50);
      if (response && response.data) {
        setJobs(response.data);
        setFilteredJobs(response.data);
        
        const uniqueTypes = new Set(response.data.map((j: Job) => j.job_type));
        const uniqueLocations = new Set(response.data.map((j: Job) => j.region || j.location).filter(Boolean));
        setStats({
          total: response.data.length,
          types: uniqueTypes.size,
          locations: uniqueLocations.size,
        });
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur de chargement des offres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...jobs];
    if (searchTerm) {
      filtered = filtered.filter(j => 
        j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        j.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedType) {
      filtered = filtered.filter(j => j.job_type === selectedType);
    }
    setFilteredJobs(filtered);
  }, [searchTerm, selectedType, jobs]);

  const contractTypes = [
    { value: 'cdi', labelFr: 'CDI', labelMg: 'CDI' },
    { value: 'cdd', labelFr: 'CDD', labelMg: 'CDD' },
    { value: 'stage', labelFr: 'Stage', labelMg: 'Fiofanana' },
    { value: 'freelance', labelFr: 'Freelance', labelMg: 'Freelance' },
    { value: 'benevolat', labelFr: 'Bénévolat', labelMg: 'Asa an-tsitrapo' },
  ];

  // Style du fond d'écran PLEIN ECRAN
  const backgroundStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundImage: `url(${pageBackground.image_url})`,
    backgroundPosition: pageBackground.position || 'center',
    backgroundSize: pageBackground.size || 'cover',
    backgroundAttachment: 'fixed',
  } : {};

  const overlayStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundColor: `rgba(0, 0, 0, ${(pageBackground.overlay_opacity || 45) / 100})`,
  } : {};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{getText(language, 'Chargement...', 'Miandry...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ==================== HERO SECTION PLEIN ECRAN ==================== */}
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Fond d'écran dynamique - couvre TOUT l'écran */}
        <div className="absolute inset-0">
          {pageBackground?.image_url && pageBackground.is_active ? (
            <>
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={backgroundStyle} />
              <div className="absolute inset-0" style={overlayStyle} />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-900" />
          )}
        </div>
        
        {/* Contenu centré verticalement et horizontalement */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 py-20">
          {/* Badge d'accueil */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span className="text-sm font-medium tracking-wide text-white">
              {getText(language, 'Rejoignez l\'équipe Y-Mad', 'Miaraha amin\'ny ekipa Y-Mad')}
            </span>
          </div>
          
          {/* Titre principal */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-2xl animate-fade-in-up">
            {getText(language, 'Offres d\'emploi', 'Asa')}
            <span className="block text-2xl md:text-3xl lg:text-4xl text-blue-200 mt-4 font-light tracking-wide">
              {getText(language, 'Construisons ensemble l\'avenir', 'Miaraka manorina ny hoavy')}
            </span>
          </h1>
          
          {/* Sous-titre */}
          <p className="text-lg md:text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed drop-shadow-lg animate-fade-in-up animation-delay-200">
            {getText(language, 
              'Découvrez nos opportunités de carrière et rejoignez une équipe passionnée',
              'Jereo ny fahafahana asa atolotray ary miaraha amin\'ny ekipa iray mazoto')}
          </p>
          
          {/* Indicateur de défilement */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-7 h-11 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1.5 h-2.5 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Styles d'animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>

      {/* ==================== STATISTIQUES ==================== */}
      <div className="relative z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 transition-colors">
                <Briefcase className="w-6 h-6 md:w-7 md:h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs md:text-sm text-gray-500">{getText(language, 'Offres disponibles', 'Asa misokatra')}</p>
            </div>
            <div className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 transition-colors">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.types}</p>
              <p className="text-xs md:text-sm text-gray-500">{getText(language, 'Types de contrat', 'Karazana fifanarahana')}</p>
            </div>
            <div className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 transition-colors">
                <MapPin className="w-6 h-6 md:w-7 md:h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.locations}</p>
              <p className="text-xs md:text-sm text-gray-500">{getText(language, 'Lieux de travail', 'Toeram-piasana')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SECTION PRINCIPALE ==================== */}
      <div className="relative z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
          
          {/* En-tête */}
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              {getText(language, 'Nos offres actuelles', 'Ny asa misokatra')}
            </h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-sm md:text-base">
              {getText(language, 
                'Rejoignez une équipe passionnée et contribuez au développement de Madagascar',
                'Miaraha amin\'ny ekipa iray manana fo ary mandray anjara amin\'ny fivoaran\'i Madagasikara')}
            </p>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-md p-5 mb-8 border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={getText(language, 'Rechercher une offre...', 'Karohy ny asa...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer text-sm"
                >
                  <option value="">{getText(language, 'Tous les types', 'Karazana rehetra')}</option>
                  {contractTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {language === 'fr' ? type.labelFr : type.labelMg}
                    </option>
                  ))}
                </select>
                
                <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 px-3 transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    title={getText(language, 'Vue grille', 'Fijery grid')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 px-3 transition-all duration-300 ${
                      viewMode === 'list' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    title={getText(language, 'Vue liste', 'Fijery lisitra')}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {(searchTerm || selectedType) && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                {searchTerm && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-700">
                    <Search className="w-3 h-3" />
                    {searchTerm}
                    <button onClick={() => setSearchTerm('')} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedType && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-700">
                    {language === 'fr' 
                      ? contractTypes.find(t => t.value === selectedType)?.labelFr 
                      : contractTypes.find(t => t.value === selectedType)?.labelMg}
                    <button onClick={() => setSelectedType('')} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedType(''); }} 
                  className="text-xs text-blue-600 hover:underline"
                >
                  {getText(language, 'Tout effacer', 'Fafana daholo')}
                </button>
              </div>
            )}
          </div>

          {/* Résultats */}
          <div className="mb-5">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-blue-700 text-base">{filteredJobs.length}</span> 
              {getText(language, ' offre(s) trouvée(s)', ' asa hita')}
            </p>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md py-16 text-center border border-gray-200">
              <Search className="w-14 h-14 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">{getText(language, 'Aucune offre trouvée', 'Tsy misy asa hita')}</p>
              <p className="text-gray-400 text-sm">{getText(language, 'Essayez de modifier vos critères de recherche', 'Andramo hanova ny fikarohanao')}</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} language={language} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <JobListItem key={job.id} job={job} language={language} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ==================== CTA SECTION ==================== */}
      <div className="relative z-10 bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 bg-gray-700 rounded-full px-4 py-1.5 mb-6">
            <Heart className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-300">
              {getText(language, 'Vous ne trouvez pas votre bonheur ?', 'Tsy mahita ny tianao ve ianao?')}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {getText(language, 'Candidature spontanée', 'Fangatahana asa tsy misy toerana')}
          </h2>
          <p className="text-sm md:text-base text-gray-300 mb-6 max-w-2xl mx-auto">
            {getText(language, 
              'Envoyez-nous votre CV et votre lettre de motivation, nous étudierons votre profil',
              'Alefaso aminay ny CV sy ny taratasy fanoloranao, hodinihinay ny momba anao')}
          </p>
          <Link 
            href="/contact" 
            className="group inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
          >
            {getText(language, 'Envoyer ma candidature', 'Alefaso ny fangatahana')} 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPOSANT CARTE (VUE GRILLE) ====================
function JobCard({ job, language }: { job: Job; language: 'fr' | 'mg' }) {
  const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false;
  const ContractIcon = getContractIcon(job.job_type);
  const isFeatured = job.is_featured;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const getTitle = () => language === 'fr' ? job.title : (job.title_mg || job.title);
  const getDescription = () => language === 'fr' ? job.description : (job.description_mg || job.description);

  return (
    <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200">
      <div className="relative h-40 overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700">
        {job.image_url ? (
          <img 
            src={job.image_url} 
            alt={getTitle()} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Briefcase className="w-16 h-16 text-white/20" />
          </div>
        )}
        
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium shadow-sm ${getContractColor(job.job_type)}`}>
            <ContractIcon className="w-3 h-3" /> {getContractLabel(job.job_type, language)}
          </span>
          {isFeatured && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium shadow-sm">
              <Star className="w-3 h-3 fill-yellow-500" /> {language === 'fr' ? 'À la une' : 'Manokana'}
            </span>
          )}
        </div>
        
        {isExpired && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-700 text-white font-medium">
              <Clock className="w-3 h-3" /> {language === 'fr' ? 'Expirée' : 'Lany daty'}
            </span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-5">
          <Link 
            href={`/emploi/${job.id}`}
            className="bg-white text-gray-800 px-5 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition duration-300 shadow-md"
          >
            {language === 'fr' ? 'Voir détails' : 'Jereo'} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors text-base">
          {getTitle()}
        </h3>
        
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <Building className="w-3.5 h-3.5" />
          <span>{job.company_name}</span>
        </div>
        
        {job.region && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{job.region}</span>
          </div>
        )}
        
        <p className="text-gray-600 line-clamp-2 mb-3 text-xs leading-relaxed">
          {getDescription()}
        </p>
        
        {job.salary && (
          <div className="flex items-center gap-1 text-xs text-blue-600 font-medium mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span>{job.salary}</span>
          </div>
        )}
        
        {job.deadline && !isExpired && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{language === 'fr' ? 'Jusqu\'au' : 'Hatramin\'ny'} {formatDate(job.deadline)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== COMPOSANT LIGNE (VUE LISTE) ====================
function JobListItem({ job, language }: { job: Job; language: 'fr' | 'mg' }) {
  const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false;
  const ContractIcon = getContractIcon(job.job_type);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const getTitle = () => language === 'fr' ? job.title : (job.title_mg || job.title);
  const getDescription = () => language === 'fr' ? job.description : (job.description_mg || job.description);

  return (
    <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200">
      <div className="p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors text-base">
                {getTitle()}
              </h3>
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getContractColor(job.job_type)}`}>
                <ContractIcon className="w-3 h-3" /> {getContractLabel(job.job_type, language)}
              </span>
              {job.is_featured && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                  <Star className="w-3 h-3 fill-yellow-500" /> {language === 'fr' ? 'À la une' : 'Manokana'}
                </span>
              )}
              {isExpired && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-700 text-white">
                  <Clock className="w-3 h-3" /> {language === 'fr' ? 'Expirée' : 'Lany daty'}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
              <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {job.company_name}</span>
              {job.region && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.region}</span>}
              {job.salary && <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {job.salary}</span>}
              {job.deadline && (
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> 
                  {language === 'fr' ? 'Limite' : 'Farany'}: {formatDate(job.deadline)}
                </span>
              )}
            </div>
            
            <p className="text-gray-600 line-clamp-2 text-xs leading-relaxed">{getDescription()}</p>
          </div>
          
          <div className="flex items-center">
            {!isExpired && (
              <Link 
                href={`/emploi/${job.id}`}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold text-sm text-center hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {language === 'fr' ? 'Postuler' : 'Mangataka'} <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}