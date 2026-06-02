'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, MapPin, Calendar, Search, 
  Building, Sparkles, X, Clock, Heart, ArrowRight,
  Users, LayoutGrid, List, GraduationCap,
  Star, Loader2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { pageService, PageBackground } from '@/services/page.service';
import { jobService, JobOffer } from '@/services/job.service';
import toast from 'react-hot-toast';

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

const getText = (language: 'fr' | 'mg', frText: string, mgText: string): string => {
  return language === 'fr' ? frText : mgText;
};

const getContractIcon = (type?: string) => {
  const typeLower = type?.toLowerCase() || '';
  switch (typeLower) {
    case 'cdi': return Star;
    case 'cdd': return Calendar;
    case 'stage': return GraduationCap;
    default: return Briefcase;
  }
};

const getContractLabel = (type?: string, language?: 'fr' | 'mg') => {
  const labels: Record<string, { fr: string; mg: string }> = {
    cdi: { fr: 'CDI', mg: 'CDI' },
    cdd: { fr: 'CDD', mg: 'CDD' },
    stage: { fr: 'Stage', mg: 'Fiofanana' },
    freelance: { fr: 'Freelance', mg: 'Freelance' },
  };
  const key = type?.toLowerCase() || '';
  return labels[key]?.[language === 'fr' ? 'fr' : 'mg'] || type || '';
};

const getContractColor = (type?: string) => {
  const typeLower = type?.toLowerCase() || '';
  const colors: Record<string, string> = {
    cdi: 'bg-blue-100 text-blue-700',
    cdd: 'bg-blue-100 text-blue-700',
    stage: 'bg-green-100 text-green-700',
    freelance: 'bg-purple-100 text-purple-700',
  };
  return colors[typeLower] || 'bg-gray-100 text-gray-700';
};

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function JobsPage() {
  const { language } = useLanguage();
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobOffer[]>([]);
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

  // Chargement du fond d'écran depuis l'admin
  const loadPageBackground = async () => {
    try {
      const background = await pageService.getPageBackground('jobs');
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
      const response = await jobService.getPublishedOffers({ page: 1, limit: 50 });
      if (response && response.data) {
        setJobs(response.data);
        setFilteredJobs(response.data);
        
        const uniqueTypes = new Set(response.data.map((j: JobOffer) => j.contract_type).filter(Boolean));
        const uniqueLocations = new Set(response.data.map((j: JobOffer) => j.location).filter(Boolean));
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
        j.title_fr.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (j.company && j.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        j.description_fr.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedType) {
      filtered = filtered.filter(j => j.contract_type === selectedType);
    }
    setFilteredJobs(filtered);
  }, [searchTerm, selectedType, jobs]);

  const contractTypes = [
    { value: 'CDI', labelFr: 'CDI', labelMg: 'CDI' },
    { value: 'CDD', labelFr: 'CDD', labelMg: 'CDD' },
    { value: 'STAGE', labelFr: 'Stage', labelMg: 'Fiofanana' },
    { value: 'FREELANCE', labelFr: 'Freelance', labelMg: 'Freelance' },
  ];

  // Style fond d'écran PLEIN ÉCRAN
  const heroBackgroundStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundImage: `url(${pageBackground.image_url})`,
    backgroundPosition: pageBackground.position || 'center',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
  } : {};

  const heroOverlayStyle = pageBackground?.image_url && pageBackground.is_active ? {
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
      {/* ==================== HERO SECTION - PLEIN ÉCRAN ==================== */}
      <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        {/* Image de fond dynamique (uploadée via admin) - PLEIN ÉCRAN */}
        <div className="absolute inset-0">
          {heroBackgroundStyle.backgroundImage ? (
            <>
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed" style={heroBackgroundStyle} />
              <div className="absolute inset-0" style={heroOverlayStyle} />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-900 to-gray-900" />
          )}
        </div>
        
        {/* Contenu centré verticalement et horizontalement */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span className="text-sm font-medium tracking-wide text-white">
              {getText(language, 'Rejoignez l\'équipe Y-MaD', 'Miaraha amin\'ny ekipa Y-MaD')}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-2xl">
            {getText(language, 'Offres d\'emploi', 'Asa')}
          </h1>
          
          <p className="text-xl md:text-2xl lg:text-3xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            {getText(language, 
              'Trouvez votre prochaine opportunité professionnelle à Madagascar',
              'Mitadiava asa vaovao eto Madagasikara')}
          </p>
          
          {/* Bouton de défilement */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-7 h-12 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1.5 h-3 bg-white rounded-full mt-3 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== STATISTIQUES ==================== */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-sm text-gray-500">{getText(language, 'Offres disponibles', 'Asa misokatra')}</p>
            </div>
            <div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.types}</p>
              <p className="text-sm text-gray-500">{getText(language, 'Types de contrat', 'Karazana fifanarahana')}</p>
            </div>
            <div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.locations}</p>
              <p className="text-sm text-gray-500">{getText(language, 'Lieux de travail', 'Toeram-piasana')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SECTION LISTE DES OFFRES ==================== */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* En-tête */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {getText(language, 'Nos offres actuelles', 'Ny asa misokatra')}
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              {getText(language, 
                'Découvrez les opportunités de carrière disponibles actuellement',
                'Jereo ny fahafahana asa misokatra amin\'izao fotoana izao')}
            </p>
          </div>

          {/* Filtres */}
          <div className="bg-gray-50 rounded-xl p-5 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={getText(language, 'Rechercher une offre...', 'Karohy ny asa...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                >
                  <option value="">{getText(language, 'Tous les types', 'Karazana rehetra')}</option>
                  {contractTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {language === 'fr' ? type.labelFr : type.labelMg}
                    </option>
                  ))}
                </select>
                
                <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 px-3 transition ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                    title={getText(language, 'Vue grille', 'Fijery grid')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 px-3 transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                    title={getText(language, 'Vue liste', 'Fijery lisitra')}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {(searchTerm || selectedType) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {searchTerm && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 rounded-full text-xs">
                    {searchTerm}
                    <button onClick={() => setSearchTerm('')} className="hover:text-red-500">✕</button>
                  </span>
                )}
                {selectedType && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 rounded-full text-xs">
                    {language === 'fr' ? contractTypes.find(t => t.value === selectedType)?.labelFr : contractTypes.find(t => t.value === selectedType)?.labelMg}
                    <button onClick={() => setSelectedType('')} className="hover:text-red-500">✕</button>
                  </span>
                )}
                <button onClick={() => { setSearchTerm(''); setSelectedType(''); }} className="text-xs text-blue-600 hover:underline">
                  {getText(language, 'Tout effacer', 'Fafana daholo')}
                </button>
              </div>
            )}
          </div>

          {/* Résultats */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-blue-700 text-base">{filteredJobs.length}</span> {getText(language, ' offre(s) trouvée(s)', ' asa hita')}
            </p>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bg-gray-50 rounded-xl py-16 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{getText(language, 'Aucune offre trouvée', 'Tsy misy asa hita')}</p>
              <p className="text-gray-400 text-sm mt-2">{getText(language, 'Essayez de modifier vos critères de recherche', 'Andramo hanova ny fikarohanao')}</p>
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
      <div className="bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Heart className="w-14 h-14 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {getText(language, 'Candidature spontanée', 'Fangatahana asa tsy misy toerana')}
          </h2>
          <p className="text-gray-300 mb-6 max-w-lg mx-auto">
            {getText(language, 
              'Vous ne trouvez pas votre bonheur ? Envoyez-nous votre CV',
              'Tsy mahita ny tianao ve ianao? Alefaso ny CV anao')}
          </p>
          <Link 
            href="/contact" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {getText(language, 'Envoyer ma candidature', 'Alefaso ny fangatahana')} 
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT CARTE (VUE GRILLE)
// ============================================================

function JobCard({ job, language }: { job: JobOffer; language: 'fr' | 'mg' }) {
  const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false;
  const ContractIcon = getContractIcon(job.contract_type);
  const getTitle = () => language === 'fr' ? job.title_fr : (job.title_mg || job.title_fr);
  const getDescription = () => language === 'fr' ? job.description_fr : (job.description_mg || job.description_fr);

  return (
    <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition border border-gray-200">
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 line-clamp-1">
            {getTitle()}
          </h3>
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getContractColor(job.contract_type)}`}>
            <ContractIcon className="w-3 h-3" /> {getContractLabel(job.contract_type, language)}
          </span>
        </div>
        
        {job.company && (
          <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
            <Building className="w-3.5 h-3.5" /> {job.company}
          </p>
        )}
        
        {job.location && (
          <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {job.location}
          </p>
        )}
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{getDescription()}</p>
        
        <div className="flex justify-between items-center">
          {job.deadline && !isExpired && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {new Date(job.deadline).toLocaleDateString()}
            </span>
          )}
          <Link href={`/jobs/${job.id}`} className="text-blue-600 font-medium text-sm hover:underline">
            {language === 'fr' ? 'Voir détails' : 'Jereo'} →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT LIGNE (VUE LISTE)
// ============================================================

function JobListItem({ job, language }: { job: JobOffer; language: 'fr' | 'mg' }) {
  const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false;
  const ContractIcon = getContractIcon(job.contract_type);
  const getTitle = () => language === 'fr' ? job.title_fr : (job.title_mg || job.title_fr);
  const getDescription = () => language === 'fr' ? job.description_fr : (job.description_mg || job.description_fr);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="p-5">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="font-bold text-lg text-gray-800 hover:text-blue-600">
                <Link href={`/jobs/${job.id}`}>{getTitle()}</Link>
              </h3>
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getContractColor(job.contract_type)}`}>
                <ContractIcon className="w-3 h-3" /> {getContractLabel(job.contract_type, language)}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-2">
              {job.company && <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {job.company}</span>}
              {job.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>}
              {job.deadline && !isExpired && (
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(job.deadline).toLocaleDateString()}</span>
              )}
            </div>
            
            <p className="text-gray-600 text-sm line-clamp-2">{getDescription()}</p>
          </div>
          
          <div className="flex items-center">
            <Link href={`/jobs/${job.id}`} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 whitespace-nowrap">
              {language === 'fr' ? 'Postuler' : 'Mangataka'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}