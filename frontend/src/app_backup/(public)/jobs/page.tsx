'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, MapPin, Calendar, DollarSign, Search, 
  ChevronRight, Building, Sparkles, X,
  Clock, CheckCircle, Heart, Eye, TrendingUp,
  Users, Award, Globe, Target, ArrowRight,
  LayoutGrid, List, FileText, GraduationCap,
  Star, Zap, Shield, RefreshCw, Image as ImageIcon
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

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
  imageUrl?: string;  // ← AJOUTÉ
}

const getContractIcon = (type: string): string => {
  switch (type) {
    case 'CDI': return '⭐';
    case 'CDD': return '📅';
    case 'Stage': return '🎓';
    case 'Volontariat': return '❤️';
    case 'Alternance': return '🔄';
    default: return '💼';
  }
};

export default function JobsPage() {
  const { t, language } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    loadJobs();
    loadBgImage();
  }, []);

  const loadJobs = () => {
    const stored = localStorage.getItem('ymad_jobs');
    if (stored) {
      const parsedJobs = JSON.parse(stored);
      setJobs(parsedJobs);
      setFilteredJobs(parsedJobs);
    } else {
      const defaultJobs: Job[] = [
        { id: '1', title: 'Coordinateur(trice) de projet', department: 'Programmes', location: 'Antananarivo', contractType: 'CDI', description: 'Supervision et coordination des projets terrain à Madagascar.', requirements: ['Master en gestion de projet', '3 ans expérience', 'Anglais courant'], salary: '800 000 - 1 200 000 Ar', deadline: '2025-06-30', status: 'open', createdAt: new Date().toISOString() },
        { id: '2', title: 'Chargé(e) de communication', department: 'Communication', location: 'Antananarivo', contractType: 'CDI', description: 'Gestion des réseaux sociaux et création de contenu digital.', requirements: ['Licence en communication', 'Maîtrise des réseaux sociaux', 'Créativité'], salary: '600 000 - 800 000 Ar', deadline: '2025-06-15', status: 'open', createdAt: new Date().toISOString() },
        { id: '3', title: 'Développeur web (Stage)', department: 'IT', location: 'Antananarivo', contractType: 'Stage', description: 'Développement et maintenance du site web Y-Mad.', requirements: ['React/Next.js', 'TypeScript', 'Tailwind CSS'], salary: '150 000 Ar', deadline: '2025-05-30', status: 'open', createdAt: new Date().toISOString() },
      ];
      setJobs(defaultJobs);
      setFilteredJobs(defaultJobs);
      localStorage.setItem('ymad_jobs', JSON.stringify(defaultJobs));
    }
    setLoading(false);
  };

  const loadBgImage = async () => {
    try {
      const response = await fetch('/api/admin/jobs-bg');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.url) {
          setBgImage(data.url);
        }
      }
    } catch (error) { 
      console.error('Erreur chargement fond:', error); 
    }
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
      Stage: 'bg-blue-100 text-blue-700', 
      Volontariat: 'bg-blue-100 text-blue-700', 
      Alternance: 'bg-blue-100 text-blue-700' 
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const stats = {
    total: jobs.length,
    types: new Set(jobs.map(j => j.contractType)).size,
    locations: new Set(jobs.map(j => j.location).filter(Boolean)).size,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ==================== HERO SECTION PLEIN ÉCRAN ==================== */}
      <div className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          {bgImage ? (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${bgImage})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-900" />
          )}
        </div>
        
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-5 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span className="text-sm">{language === 'fr' ? 'Rejoignez l\'équipe Y-Mad' : 'Miaraha amin\'ny ekipa Y-Mad'}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white">
            {t('jobs.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
            {language === 'fr' ? 'Découvrez nos opportunités de carrière' : 'Jereo ny fahafahana asa atolotray'}
          </p>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-7 h-11 border-2 border-white/40 rounded-full flex justify-center">
            <div className="w-1.5 h-2.5 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* ==================== STATISTIQUES ==================== */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                <Briefcase className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-gray-500">{language === 'fr' ? 'Offres disponibles' : 'Asa misokatra'}</p>
            </div>
            <div className="group">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.types}</p>
              <p className="text-gray-500">{language === 'fr' ? 'Types de contrat' : 'Karazana fifanarahana'}</p>
            </div>
            <div className="group">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                <MapPin className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.locations}</p>
              <p className="text-gray-500">{language === 'fr' ? 'Lieux de travail' : 'Toeram-piasana'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SECTION PRINCIPALE ==================== */}
      <div className="max-w-7xl mx-auto px-4 py-16">
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

        {/* Filtres */}
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
                <option value="">📋 {language === 'fr' ? 'Tous les types' : 'Karazana rehetra'}</option>
                {contractTypes.map(type => (
                  <option key={type} value={type}>
                    {getContractIcon(type)} {type}
                  </option>
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
                  🔍 {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedType && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
                  {getContractIcon(selectedType)} {selectedType}
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

        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-blue-700 text-lg">{filteredJobs.length}</span> 
            {language === 'fr' ? ' offre(s) trouvée(s)' : ' asa hita'}
          </p>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-20 text-center border border-gray-200">
            <div className="text-7xl mb-6">🔍</div>
            <p className="text-gray-500 text-xl mb-2">{t('common.no_data')}</p>
            <p className="text-gray-400">{language === 'fr' ? 'Essayez de modifier vos critères de recherche' : 'Andramo hanova ny fikarohanao'}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                getTypeColor={getTypeColor} 
                getContractIcon={getContractIcon}
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
                getContractIcon={getContractIcon}
                language={language}
              />
            ))}
          </div>
        )}
      </div>

      {/* ==================== SECTION APPEL À L'ACTION ==================== */}
      <div className="bg-gray-800 py-20">
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
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
          >
            {language === 'fr' ? 'Envoyer ma candidature' : 'Alefaso ny fangatahana'} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ==================== JOB CARD COMPONENT (AVEC IMAGE) ====================
function JobCard({ job, getTypeColor, getContractIcon, language }: { job: Job; getTypeColor: (type: string) => string; getContractIcon: (type: string) => string; language: 'fr' | 'mg' }) {
  const isExpired = new Date(job.deadline) < new Date();

  return (
    <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200">
      {/* Section image avec photo réelle */}
      <div className="relative h-48 overflow-hidden">
        {job.imageUrl ? (
          <>
            <img 
              src={job.imageUrl} 
              alt={job.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
            <Briefcase className="w-20 h-20 text-white/20" />
          </div>
        )}
        
        {/* Badge type de contrat */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm ${getTypeColor(job.contractType)}`}>
            <span>{getContractIcon(job.contractType)}</span> {job.contractType}
          </span>
        </div>
        
        {isExpired && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-gray-700 text-white font-medium">
              <Clock className="w-3 h-3" /> {language === 'fr' ? 'Expirée' : 'Lany daty'}
            </span>
          </div>
        )}
        
        {/* Bouton postuler au hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
          <Link 
            href={`/jobs/${job.id}/apply`}
            className="bg-white text-gray-800 px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition duration-300"
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
        
        <p className="text-gray-600 line-clamp-2 mb-4 text-sm">
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

// ==================== JOB LIST ITEM COMPONENT (AVEC IMAGE MINIATURE) ====================
function JobListItem({ job, getTypeColor, getContractIcon, language }: { job: Job; getTypeColor: (type: string) => string; getContractIcon: (type: string) => string; language: 'fr' | 'mg' }) {
  const isExpired = new Date(job.deadline) < new Date();

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
                <span>{getContractIcon(job.contractType)}</span> {job.contractType}
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
                {language === 'fr' ? 'Limite:' : 'Farany:'} {new Date(job.deadline).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG')}
              </span>
            </div>
            
            <p className="text-gray-600 line-clamp-2 mb-3">{job.description}</p>
            
            <div className="flex flex-wrap gap-2">
              {job.requirements.slice(0, 3).map((req, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3 text-green-500" /> {req}
                </span>
              ))}
            </div>
          </div>
          
          {/* Miniature image pour la vue liste */}
          <div className="flex items-center gap-4">
            {job.imageUrl && (
              <div className="hidden md:block w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img 
                  src={job.imageUrl} 
                  alt={job.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-col gap-2 min-w-[140px]">
              {!isExpired && (
                <Link 
                  href={`/jobs/${job.id}/apply`}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-center hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
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