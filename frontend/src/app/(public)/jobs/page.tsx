'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, MapPin, Calendar, DollarSign, Search, 
  ChevronRight, Building, Sparkles, X,
  Clock, CheckCircle, Heart, Eye, TrendingUp,
  Users, Award, Globe, Target, ArrowRight,
  LayoutGrid, List, FileText, GraduationCap,
  Star, Zap, Shield, RefreshCw, Image as ImageIcon,
  BookOpen, Stethoscope, Leaf, Sprout, Handshake, Palette,
  Loader2
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { pageService, PageBackground } from '@/services/pageService';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  contractType: 'CDI' | 'CDD' | 'Stage' | 'Volontariat' | 'Alternance';
  description: string;
  requirements: string[];
  salary?: string;
  deadline: string;
  status: 'open' | 'closed';
  createdAt: string;
  imageUrl?: string;
}

// Fonction pour obtenir l'icone du type de contrat
const getContractIconComponent = (type: string) => {
  switch (type) {
    case 'CDI': return Star;
    case 'CDD': return Calendar;
    case 'Stage': return GraduationCap;
    case 'Volontariat': return Heart;
    case 'Alternance': return RefreshCw;
    default: return Briefcase;
  }
};

// Fonction pour obtenir le texte selon la langue
const getText = (language: 'fr' | 'mg', frText: string, mgText: string): string => {
  return language === 'fr' ? frText : mgText;
};

export default function JobsPage() {
  const { t, language } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    loadJobs();
    loadPageBackground();
  }, []);

  const loadPageBackground = async () => {
    try {
      const background = await pageService.getBackground('jobs');
      if (background && background.is_active && background.image_url) {
        setPageBackground(background);
      }
    } catch (error) {
      console.error('Erreur chargement fond d ecran:', error);
    }
  };

  const loadJobs = () => {
    const stored = localStorage.getItem('ymad_jobs');
    if (stored) {
      const parsedJobs = JSON.parse(stored);
      setJobs(parsedJobs);
      setFilteredJobs(parsedJobs);
    } else {
      const defaultJobs: Job[] = [
        { id: '1', title: 'Coordinateur de projet', department: 'Programmes', location: 'Antananarivo', contractType: 'CDI', description: 'Supervision et coordination des projets terrain a Madagascar.', requirements: ['Master en gestion de projet', '3 ans experience', 'Anglais courant'], salary: '800 000 - 1 200 000 Ar', deadline: '2025-06-30', status: 'open', createdAt: new Date().toISOString() },
        { id: '2', title: 'Charge de communication', department: 'Communication', location: 'Antananarivo', contractType: 'CDI', description: 'Gestion des reseaux sociaux et creation de contenu digital.', requirements: ['Licence en communication', 'Maitrise des reseaux sociaux', 'Creativite'], salary: '600 000 - 800 000 Ar', deadline: '2025-06-15', status: 'open', createdAt: new Date().toISOString() },
        { id: '3', title: 'Developpeur web (Stage)', department: 'IT', location: 'Antananarivo', contractType: 'Stage', description: 'Developpement et maintenance du site web Y-Mad.', requirements: ['React/Next.js', 'TypeScript', 'Tailwind CSS'], salary: '150 000 Ar', deadline: '2025-05-30', status: 'open', createdAt: new Date().toISOString() },
      ];
      setJobs(defaultJobs);
      setFilteredJobs(defaultJobs);
      localStorage.setItem('ymad_jobs', JSON.stringify(defaultJobs));
    }
    setLoading(false);
  };

  useEffect(() => {
    let filtered = [...jobs];
    if (searchTerm) {
      filtered = filtered.filter(j => 
        j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        j.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedType) {
      filtered = filtered.filter(j => j.contractType === selectedType);
    }
    setFilteredJobs(filtered);
  }, [searchTerm, selectedType, jobs]);

  const contractTypes = ['CDI', 'CDD', 'Stage', 'Volontariat', 'Alternance'];

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = { 
      CDI: 'bg-blue-100 text-blue-700', 
      CDD: 'bg-blue-100 text-blue-700', 
      Stage: 'bg-green-100 text-green-700', 
      Volontariat: 'bg-purple-100 text-purple-700', 
      Alternance: 'bg-orange-100 text-orange-700' 
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const stats = {
    total: jobs.length,
    types: new Set(jobs.map(j => j.contractType)).size,
    locations: new Set(jobs.map(j => j.location).filter(Boolean)).size,
  };

  // Style du fond d ecran PLEIN ECRAN avec overlay optimisé
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
          <p className="text-gray-500">{language === 'fr' ? 'Chargement...' : 'Miandry...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ==================== HERO SECTION PLEIN ECRAN AVEC DESIGN PROFESSIONNEL ==================== */}
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Fond d'écran dynamique */}
        <div className="absolute inset-0">
          {backgroundStyle.backgroundImage ? (
            <>
              <div className="absolute inset-0" style={backgroundStyle} />
              <div className="absolute inset-0" style={overlayStyle} />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-900" />
          )}
        </div>
        
        {/* Contenu centré avec design amélioré */}
<div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 py-20">          
          {/* Badge d'accueil */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span className="text-sm font-medium tracking-wide text-white">
              {language === 'fr' ? 'Rejoignez l\'équipe Y-Mad' : 'Miaraha amin\'ny ekipa Y-Mad'}
            </span>
          </div>
          
          {/* Titre principal en grand format */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-2xl animate-fade-in-up">
            {language === 'fr' ? 'Offres d\'emploi' : 'Asa'}
            <span className="block text-2xl md:text-3xl lg:text-4xl text-blue-200 mt-4 font-light tracking-wide">
              {language === 'fr' ? 'Construisons ensemble l\'avenir' : 'Miaraka manorina ny hoavy'}
            </span>
          </h1>
          
          {/* Sous-titre avec meilleure lisibilité */}
          <p className="text-lg md:text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed drop-shadow-lg animate-fade-in-up animation-delay-200">
            {language === 'fr' 
              ? 'Découvrez nos opportunités de carrière et rejoignez une équipe passionnée'
              : 'Jereo ny fahafahana asa atolotray ary miaraha amin\'ny ekipa iray mazoto'}
          </p>
          
          {/* Indicateur de défilement */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-7 h-11 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1.5 h-2.5 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

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
      `}</style>

      {/* ==================== SECTION STATISTIQUES ==================== */}
      <div className="relative z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 transition-colors">
                <Briefcase className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-gray-500">{language === 'fr' ? 'Offres disponibles' : 'Asa misokatra'}</p>
            </div>
            <div className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 transition-colors">
                <Users className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.types}</p>
              <p className="text-gray-500">{language === 'fr' ? 'Types de contrat' : 'Karazana fifanarahana'}</p>
            </div>
            <div className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 transition-colors">
                <MapPin className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.locations}</p>
              <p className="text-gray-500">{language === 'fr' ? 'Lieux de travail' : 'Toeram-piasana'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SECTION PRINCIPALE ==================== */}
      <div className="relative z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          
          {/* En-tête de section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {language === 'fr' ? 'Nos offres actuelles' : 'Ny asa misokatra'}
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              {language === 'fr' 
                ? 'Rejoignez une équipe passionnée et contribuez au développement de Madagascar'
                : 'Miaraha amin\'ny ekipa iray manana fo ary mandray anjara amin\'ny fivoaran\'i Madagasikara'}
            </p>
          </div>

          {/* Filtres de recherche */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-10 border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={language === 'fr' ? 'Rechercher une offre...' : 'Karohy ny asa...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                >
                  <option value="">{language === 'fr' ? 'Tous les types' : 'Karazana rehetra'}</option>
                  {contractTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                
                <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 px-4 transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    title={language === 'fr' ? 'Vue grille' : 'Fijery grid'}
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 px-4 transition-all duration-300 ${
                      viewMode === 'list' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    title={language === 'fr' ? 'Vue liste' : 'Fijery lisitra'}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {(searchTerm || selectedType) && (
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
                {selectedType && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
                    {selectedType}
                    <button onClick={() => setSelectedType('')} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedType(''); }} 
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
              <span className="font-semibold text-blue-700 text-lg">{filteredJobs.length}</span> 
              {language === 'fr' ? ' offre(s) trouvée(s)' : ' asa hita'}
            </p>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-20 text-center border border-gray-200">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-xl mb-2">{language === 'fr' ? 'Aucune offre trouvée' : 'Tsy misy asa hita'}</p>
              <p className="text-gray-400">{language === 'fr' ? 'Essayez de modifier vos critères de recherche' : 'Andramo hanova ny fikarohanao'}</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredJobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  getTypeColor={getTypeColor} 
                  language={language}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <JobListItem 
                  key={job.id} 
                  job={job} 
                  getTypeColor={getTypeColor} 
                  language={language}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ==================== SECTION APPEL À L'ACTION ==================== */}
      <div className="relative z-10 bg-gray-800 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 bg-gray-700 rounded-full px-5 py-2 mb-6">
            <Heart className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">
              {language === 'fr' ? 'Vous ne trouvez pas votre bonheur ?' : 'Tsy mahita ny tianao ve ianao?'}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {language === 'fr' ? 'Candidature spontanée' : 'Fangatahana asa tsy misy toerana'}
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Envoyez-nous votre CV et votre lettre de motivation, nous étudierons votre profil'
              : 'Alefaso aminay ny CV sy ny taratasy fanoloranao, hodinihinay ny momba anao'}
          </p>
          <Link 
            href="/contact" 
            className="group inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {language === 'fr' ? 'Envoyer ma candidature' : 'Alefaso ny fangatahana'} 
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPOSANT CARTE OFFRE (VUE GRILLE) ====================
function JobCard({ job, getTypeColor, language }: { job: Job; getTypeColor: (type: string) => string; language: 'fr' | 'mg' }) {
  const isExpired = new Date(job.deadline) < new Date();
  const ContractIcon = (() => {
    switch (job.contractType) {
      case 'CDI': return Star;
      case 'CDD': return Calendar;
      case 'Stage': return GraduationCap;
      case 'Volontariat': return Heart;
      case 'Alternance': return RefreshCw;
      default: return Briefcase;
    }
  })();

  return (
    <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200">
      <div className="relative h-48 overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="absolute inset-0 flex items-center justify-center">
          <Briefcase className="w-20 h-20 text-white/20" />
        </div>
        
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm ${getTypeColor(job.contractType)}`}>
            <ContractIcon className="w-3 h-3" /> {job.contractType}
          </span>
        </div>
        
        {isExpired && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-gray-700 text-white font-medium">
              <Clock className="w-3 h-3" /> {language === 'fr' ? 'Expirée' : 'Lany daty'}
            </span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
          <Link 
            href={`/jobs/${job.id}/apply`}
            className="bg-white text-gray-800 px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition duration-300 shadow-lg"
          >
            {language === 'fr' ? 'Postuler' : 'Mangataka'} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {job.title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Building className="w-4 h-4" />
          <span>{job.department}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4" />
          <span>{job.location}</span>
        </div>
        
        <p className="text-gray-600 line-clamp-2 mb-4 text-sm leading-relaxed">
          {job.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {job.requirements.slice(0, 2).map((req, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              <CheckCircle className="w-3 h-3 text-green-500" /> {req}
            </span>
          ))}
          {job.requirements.length > 2 && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              +{job.requirements.length - 2}
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          {job.salary && (
            <div className="flex items-center gap-1 text-sm text-blue-600 font-medium">
              <DollarSign className="w-4 h-4" />
              <span>{job.salary}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{language === 'fr' ? 'Jusqu\'au' : 'Hatramin\'ny'} {new Date(job.deadline).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPOSANT LIGNE OFFRE (VUE LISTE) ====================
function JobListItem({ job, getTypeColor, language }: { job: Job; getTypeColor: (type: string) => string; language: 'fr' | 'mg' }) {
  const isExpired = new Date(job.deadline) < new Date();
  const ContractIcon = (() => {
    switch (job.contractType) {
      case 'CDI': return Star;
      case 'CDD': return Calendar;
      case 'Stage': return GraduationCap;
      case 'Volontariat': return Heart;
      case 'Alternance': return RefreshCw;
      default: return Briefcase;
    }
  })();

  return (
    <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200">
      <div className="p-5">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                {job.title}
              </h3>
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getTypeColor(job.contractType)}`}>
                <ContractIcon className="w-3 h-3" /> {job.contractType}
              </span>
              {isExpired && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-700 text-white">
                  <Clock className="w-3 h-3" /> {language === 'fr' ? 'Expirée' : 'Lany daty'}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {job.department}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
              {job.salary && <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {job.salary}</span>}
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> 
                {language === 'fr' ? 'Limite :' : 'Farany :'} {new Date(job.deadline).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG')}
              </span>
            </div>
            
            <p className="text-gray-600 line-clamp-2 mb-3 leading-relaxed">{job.description}</p>
            
            <div className="flex flex-wrap gap-2">
              {job.requirements.slice(0, 3).map((req, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3 text-green-500" /> {req}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2 min-w-[140px]">
              {!isExpired && (
                <Link 
                  href={`/jobs/${job.id}/apply`}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-center hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  {language === 'fr' ? 'Postuler' : 'Mangataka'} <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <p className="text-xs text-gray-400 text-center">
                {!isExpired ? (
                  <span className="inline-flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> 
                    {language === 'fr' ? 'Offre active' : 'Asa misokatra'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3 text-gray-500" /> 
                    {language === 'fr' ? 'Offre expirée' : 'Lany daty'}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}