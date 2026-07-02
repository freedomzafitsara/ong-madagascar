// frontend/src/app/(public)/jobs/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, MapPin, Calendar, Search, 
  Building, Sparkles, X, Clock, Users, ArrowRight,
  LayoutGrid, List, Star, Loader2, Heart
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================

type ContractType = 'CDI' | 'CDD' | 'STAGE' | 'FREELANCE' | 'ALTERNANCE' | 'TEMPORARY';
type JobStatus = 'draft' | 'published' | 'closed' | 'archived';

interface JobOffer {
  id: string;
  title_fr: string;
  title_mg?: string;
  description_fr: string;
  description_mg?: string;
  company?: string;
  location?: string;
  contract_type: ContractType;
  status: JobStatus;
  is_published: boolean;
  deadline?: string;
  image_url?: string;
  created_at: string;
}

interface PageBackground {
  id: string;
  page_key: string;
  image_url: string;
  is_active: boolean;
  overlay_opacity: number;
  position: string;
  alt_fr?: string;
  alt_mg?: string;
}

// ============================================================
// CONFIGURATION DES TYPES DE CONTRAT
// ============================================================

const CONTRACT_LABELS: Record<ContractType, { fr: string; mg: string }> = {
  CDI: { fr: 'CDI', mg: 'CDI' },
  CDD: { fr: 'CDD', mg: 'CDD' },
  STAGE: { fr: 'Stage', mg: 'Fiofanana' },
  FREELANCE: { fr: 'Freelance', mg: 'Freelance' },
  ALTERNANCE: { fr: 'Alternance', mg: 'Fiofanana mifandimby' },
  TEMPORARY: { fr: 'Temporaire', mg: 'Vonjimaika' }
};

const CONTRACT_COLORS: Record<ContractType, string> = {
  CDI: 'bg-blue-800 text-white',
  CDD: 'bg-gray-600 text-white',
  STAGE: 'bg-blue-800 text-white',
  FREELANCE: 'bg-gray-600 text-white',
  ALTERNANCE: 'bg-blue-800 text-white',
  TEMPORARY: 'bg-gray-600 text-white'
};

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

/**
 * Supprime les balises HTML d'un texte
 */
const stripHtml = (html: string): string => {
  if (!html) return '';
  let cleaned = html.replace(/<[^>]*>/g, ' ');
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?p>/gi, ' ');
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
// PAGE PRINCIPALE
// ============================================================

export default function JobsPublicPage() {
  const { language } = useLanguage();
  
  // Etat des offres d'emploi
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Etat des filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Etat du fond d'ecran
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  
  // Statistiques
  const [stats, setStats] = useState({ total: 0, types: 0, locations: 0 });

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  // ============================================================
  // CHARGEMENT DES DONNEES
  // ============================================================

  useEffect(() => {
    loadPageBackground();
    fetchJobs();
  }, []);

  const loadPageBackground = async () => {
    try {
      //  Utilisation directe de l'API
      const response = await api.get('/pages/backgrounds/jobs');
      const background = response.data;
      if (background && background.is_active && background.image_url) {
        setPageBackground(background);
      }
    } catch (error) {
      console.error('Erreur chargement du fond d\'ecran:', error);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      //  Utilisation directe de l'API
      const response = await api.get('/jobs/offers/public', { params: { limit: 100 } });
      
      if (response && response.data) {
        let jobsData = response.data.data || response.data || [];
        // Filtrer les offres actives: publiees et non expirees
        const activeJobs = jobsData.filter((job: JobOffer) => {
          const isPublished = job.status === 'published' && job.is_published === true;
          const isNotExpired = !job.deadline || new Date(job.deadline) > new Date();
          return isPublished && isNotExpired;
        });
        
        setJobs(activeJobs);
        setFilteredJobs(activeJobs);
        
        // Calcul des statistiques
        const uniqueTypes = new Set(activeJobs.map((j: JobOffer) => j.contract_type).filter(Boolean));
        const uniqueLocations = new Set(activeJobs.map((j: JobOffer) => j.location).filter(Boolean));
        setStats({
          total: activeJobs.length,
          types: uniqueTypes.size,
          locations: uniqueLocations.size,
        });
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des offres:', error);
      toast.error(error.message || getText('Erreur de chargement', 'Nisy hadisoana'));
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FILTRES
  // ============================================================

  useEffect(() => {
    let filtered = [...jobs];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title_fr.toLowerCase().includes(searchLower) || 
        (job.title_mg?.toLowerCase().includes(searchLower)) ||
        (job.company?.toLowerCase().includes(searchLower)) ||
        job.description_fr.toLowerCase().includes(searchLower)
      );
    }
    
    if (selectedType) {
      filtered = filtered.filter(job => job.contract_type === selectedType);
    }
    
    setFilteredJobs(filtered);
  }, [searchTerm, selectedType, jobs]);

  // ============================================================
  // TYPES DE CONTRAT
  // ============================================================

  const contractTypes = [
    { value: 'CDI' as ContractType, labelFr: 'CDI', labelMg: 'CDI' },
    { value: 'CDD' as ContractType, labelFr: 'CDD', labelMg: 'CDD' },
    { value: 'STAGE' as ContractType, labelFr: 'Stage', labelMg: 'Fiofanana' },
    { value: 'FREELANCE' as ContractType, labelFr: 'Freelance', labelMg: 'Freelance' },
    { value: 'ALTERNANCE' as ContractType, labelFr: 'Alternance', labelMg: 'Fiofanana mifandimby' },
    { value: 'TEMPORARY' as ContractType, labelFr: 'Temporaire', labelMg: 'Vonjimaika' },
  ];

  // ============================================================
  // STYLES DU FOND D'ECRAN
  // ============================================================

  const backgroundStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundImage: `url(${pageBackground.image_url})`,
    backgroundPosition: pageBackground.position || 'center',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
  } : {};

  const overlayStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundColor: `rgba(0, 0, 0, ${(pageBackground.overlay_opacity || 45) / 100})`,
  } : {};

  // ============================================================
  // RENDU - CHARGEMENT
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-800 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{getText('Chargement des offres...', 'Fandefasana ny asa...')}</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDU - PAGE PRINCIPALE
  // ============================================================

  return (
    <div className="min-h-screen">
      
      {/* ============================================================
      SECTION HERO - PLEIN ECRAN AVEC FOND D'ECRAN DYNAMIQUE
      ============================================================ */}
      <div className="relative h-screen w-full overflow-hidden">
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
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 md:px-5 md:py-2 mb-6 md:mb-8">
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span className="text-sm font-medium tracking-wide text-white">
              {getText("Rejoignez l'equipe Y-MaD", 'Miaraha amin\'ny ekipa Y-MaD')}
            </span>
          </div>
          
          {/* Titre principal */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 drop-shadow-2xl">
            {getText("Offres d'emploi", 'Asa')}
            <span className="block text-xl md:text-2xl lg:text-3xl text-blue-200 mt-3 font-light tracking-wide">
              {getText('Construisons ensemble l\'avenir', 'Miaraka manorina ny hoavy')}
            </span>
          </h1>
          
          {/* Sous-titre */}
          <p className="text-base md:text-lg lg:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            {getText(
              'Decouvrez nos opportunites de carriere et rejoignez une equipe passionnee',
              'Jereo ny fahafahana asa atolotray ary miaraha amin\'ny ekipa iray mazoto'
            )}
          </p>
        </div>
      </div>

      {/* ============================================================
      SECTION STATISTIQUES
      ============================================================ */}
      <div className="relative z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            
            <div className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-800 transition-colors">
                <Briefcase className="w-6 h-6 md:w-7 md:h-7 text-blue-800 group-hover:text-white transition-colors" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs md:text-sm text-gray-500">{getText('Offres disponibles', 'Asa misokatra')}</p>
            </div>
            
            <div className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-600 transition-colors">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.types}</p>
              <p className="text-xs md:text-sm text-gray-500">{getText('Types de contrat', 'Karazana fifanarahana')}</p>
            </div>
            
            <div className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-600 transition-colors">
                <MapPin className="w-6 h-6 md:w-7 md:h-7 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.locations}</p>
              <p className="text-xs md:text-sm text-gray-500">{getText('Lieux de travail', 'Toeram-piasana')}</p>
            </div>
            
          </div>
        </div>
      </div>

      {/* ============================================================
      SECTION FILTRES ET LISTE DES OFFRES
      ============================================================ */}
      <div className="relative z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
          
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              {getText('Nos offres actuelles', 'Ny asa misokatra')}
            </h2>
            <div className="w-16 h-1 bg-blue-800 mx-auto rounded-full"></div>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-sm md:text-base">
              {getText(
                'Rejoignez une equipe passionnee et contribuez au developpement de Madagascar',
                'Miaraha amin\'ny ekipa iray manana fo ary mandray anjara amin\'ny fivoaran\'i Madagasikara'
              )}
            </p>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="bg-white rounded-xl shadow-md p-5 mb-8 border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              
              {/* Recherche */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={getText('Rechercher une offre...', 'Karohy ny asa...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none transition text-sm"
                />
              </div>
              
              <div className="flex gap-3">
                {/* Filtre type de contrat */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-800 outline-none bg-white cursor-pointer text-sm min-w-[130px]"
                >
                  <option value="">{getText('Tous les types', 'Karazana rehetra')}</option>
                  {contractTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {language === 'fr' ? type.labelFr : type.labelMg}
                    </option>
                  ))}
                </select>
                
                {/* Mode d'affichage */}
                <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 px-3 transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? 'bg-blue-800 text-white' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    title={getText('Vue grille', 'Fijery grid')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 px-3 transition-all duration-300 ${
                      viewMode === 'list' 
                        ? 'bg-blue-800 text-white' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    title={getText('Vue liste', 'Fijery lisitra')}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Filtres actifs */}
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
                  className="text-xs text-blue-800 hover:underline"
                >
                  {getText('Tout effacer', 'Fafana daholo')}
                </button>
              </div>
            )}
          </div>

          {/* Résultats */}
          <div className="mb-5">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-blue-800 text-base">{filteredJobs.length}</span> 
              {' '}{getText(' offre(s) trouvee(s)', ' asa hita')}
            </p>
          </div>

          {/* Liste des offres */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md py-16 text-center border border-gray-200">
              <Search className="w-14 h-14 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">{getText('Aucune offre trouvee', 'Tsy misy asa hita')}</p>
              <p className="text-gray-400 text-sm">{getText('Essayez de modifier vos criteres de recherche', 'Andramo hanova ny fikarohanao')}</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} language={language} getText={getText} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <JobListItem key={job.id} job={job} language={language} getText={getText} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
      SECTION APPEL A L'ACTION - CANDIDATURE SPONTANEE
      ============================================================ */}
      <div className="relative z-10 bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 bg-gray-700 rounded-full px-4 py-1.5 mb-6">
            <Heart className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-300">
              {getText('Vous ne trouvez pas votre bonheur ?', 'Tsy mahita ny tianao ve ianao?')}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {getText('Candidature spontanee', 'Fangatahana asa tsy misy toerana')}
          </h2>
          <p className="text-sm md:text-base text-gray-300 mb-6 max-w-2xl mx-auto">
            {getText(
              'Envoyez-nous votre CV et votre lettre de motivation, nous etudierons votre profil',
              'Alefaso aminay ny CV sy ny taratasy fanoloranao, hodinihinay ny momba anao'
            )}
          </p>
          <Link 
            href="/contact" 
            className="group inline-flex items-center gap-2 bg-blue-800 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-900 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
          >
            {getText('Envoyer ma candidature', 'Alefaso ny fangatahana')} 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT : CARTE OFFRE (VUE GRILLE)
// ============================================================

function JobCard({ 
  job, 
  language, 
  getText 
}: { 
  job: JobOffer; 
  language: 'fr' | 'mg';
  getText: (fr: string, mg: string) => string;
}) {
  const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false;
  const contractType = job.contract_type as ContractType;
  const contractColor = CONTRACT_COLORS[contractType] || CONTRACT_COLORS.CDI;
  const contractLabel = CONTRACT_LABELS[contractType] || CONTRACT_LABELS.CDI;
  const title = language === 'fr' ? job.title_fr : (job.title_mg || job.title_fr);
  const description = language === 'fr' ? job.description_fr : (job.description_mg || job.description_fr);
  const isFeatured = job.status === 'published' && job.is_published === true;
  
  //  Nettoyer la description
  const cleanDescription = getExcerpt(description, 100);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch { return ''; }
  };

  return (
    <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200">
      
      {/* Image d'en-tete */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-r from-blue-800 to-blue-900">
        {job.image_url ? (
          <img 
            src={job.image_url} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/placeholder-job.jpg';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Briefcase className="w-16 h-16 text-white/20" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium shadow-sm ${contractColor}`}>
            {language === 'fr' ? contractLabel.fr : contractLabel.mg}
          </span>
          {isFeatured && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium shadow-sm">
              <Star className="w-3 h-3 fill-yellow-500" /> {language === 'fr' ? 'A la une' : 'Manokana'}
            </span>
          )}
        </div>
        
        {isExpired && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-700 text-white font-medium">
              <Clock className="w-3 h-3" /> {language === 'fr' ? 'Expiree' : 'Lany daty'}
            </span>
          </div>
        )}
        
        {/* Overlay au survol */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-5">
          <Link 
            href={`/jobs/${job.id}`}
            className="bg-white text-gray-800 px-5 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition duration-300 shadow-md"
          >
            {language === 'fr' ? 'Voir details' : 'Jereo'} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      
      {/* Contenu de la carte */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-blue-800 transition-colors text-base">
          {title}
        </h3>
        
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <Building className="w-3.5 h-3.5" />
          <span>{job.company || 'Y-MaD'}</span>
        </div>
        
        {job.location && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{job.location}</span>
          </div>
        )}
        
        {/*  Description sans balises HTML */}
        <p className="text-gray-600 line-clamp-2 mb-3 text-xs leading-relaxed">
          {cleanDescription}
        </p>
        
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

// ============================================================
// COMPOSANT : LIGNE OFFRE (VUE LISTE)
// ============================================================

function JobListItem({ 
  job, 
  language, 
  getText 
}: { 
  job: JobOffer; 
  language: 'fr' | 'mg';
  getText: (fr: string, mg: string) => string;
}) {
  const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false;
  const contractType = job.contract_type as ContractType;
  const contractColor = CONTRACT_COLORS[contractType] || CONTRACT_COLORS.CDI;
  const contractLabel = CONTRACT_LABELS[contractType] || CONTRACT_LABELS.CDI;
  const title = language === 'fr' ? job.title_fr : (job.title_mg || job.title_fr);
  const description = language === 'fr' ? job.description_fr : (job.description_mg || job.description_fr);
  const isFeatured = job.status === 'published' && job.is_published === true;
  
  //  Nettoyer la description
  const cleanDescription = getExcerpt(description, 150);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch { return ''; }
  };

  return (
    <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200">
      <div className="p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            
            {/* Titre et badges */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="font-bold text-gray-800 group-hover:text-blue-800 transition-colors text-base">
                <Link href={`/jobs/${job.id}`}>{title}</Link>
              </h3>
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${contractColor}`}>
                {language === 'fr' ? contractLabel.fr : contractLabel.mg}
              </span>
              {isFeatured && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                  <Star className="w-3 h-3 fill-yellow-500" /> {language === 'fr' ? 'A la une' : 'Manokana'}
                </span>
              )}
              {isExpired && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-700 text-white">
                  <Clock className="w-3 h-3" /> {language === 'fr' ? 'Expiree' : 'Lany daty'}
                </span>
              )}
            </div>
            
            {/* Informations */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
              <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {job.company || 'Y-MaD'}</span>
              {job.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>}
              {job.deadline && !isExpired && (
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> 
                  {language === 'fr' ? 'Limite' : 'Farany'}: {formatDate(job.deadline)}
                </span>
              )}
            </div>
            
            {/*  Description sans balises HTML */}
            <p className="text-gray-600 line-clamp-2 text-xs leading-relaxed">{cleanDescription}</p>
          </div>
          
          {/* Bouton d'action */}
          <div className="flex items-center">
            {!isExpired && (
              <Link 
                href={`/jobs/${job.id}`}
                className="bg-blue-800 text-white px-5 py-2 rounded-lg font-semibold text-sm text-center hover:bg-blue-900 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
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