// frontend/src/app/(public)/home/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Users, Globe, MapPin, Award, Target, HandHeart, 
  Leaf, Mail, Shield, TrendingUp, Building, Calendar,
  Briefcase, BookOpen, ChevronRight, Play, Sparkles,
  X, Loader2, Star, Clock, Heart
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { pageService, PageBackground } from '@/services/page.service';
import { projectService, Project } from '@/services/project.service';
import { jobService, JobOffer } from '@/services/job.service';
import { blogService, BlogPost } from '@/services/blog.service';

// ============================================================
// TYPES POUR LES OFFRES
// ============================================================

type ContractType = 'CDI' | 'CDD' | 'STAGE' | 'FREELANCE' | 'ALTERNANCE' | 'TEMPORARY';

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
  STAGE: 'bg-green-600 text-white',
  FREELANCE: 'bg-purple-600 text-white',
  ALTERNANCE: 'bg-orange-600 text-white',
  TEMPORARY: 'bg-red-600 text-white'
};

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

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

const getExcerpt = (html: string, maxLength: number = 120): string => {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// ============================================================
// PAGE D'ACCUEIL - Y-MaD Madagascar
// ============================================================

export default function HomePage() {
  const { language } = useLanguage();
  
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const getText = (frText: string, mgText: string): string => {
    return language === 'fr' ? frText : mgText;
  };

  const loadPageBackground = useCallback(async () => {
    try {
      const background = await pageService.getPageBackground('home');
      if (background?.is_active && background.image_url) {
        setPageBackground(background);
      }
    } catch (error) {
      console.error("Erreur chargement du fond d'ecran:", error);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [postsData, projectsData, jobsData] = await Promise.all([
        blogService.getPublishedPosts({ page: 1, limit: 3 }),
        projectService.getPublishedProjects({ page: 1, limit: 3 }),
        jobService.getPublishedOffers({ page: 1, limit: 3 }),
      ]);

      setRecentPosts(postsData?.data || []);
      setFeaturedProjects(projectsData?.data || []);
      setRecentJobs(jobsData?.data || []);
      
      await loadPageBackground();
    } catch (error) {
      console.error("Erreur lors du chargement des donnees:", error);
    } finally {
      setLoading(false);
    }
  }, [loadPageBackground]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeProjectModal = () => {
    setShowProjectModal(false);
    setSelectedProject(null);
    document.body.style.overflow = 'unset';
  };

  const openPostDetails = (post: BlogPost) => {
    setSelectedPost(post);
    setShowPostModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closePostModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
    document.body.style.overflow = 'unset';
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    setNewsletterLoading(true);
    setNewsletterStatus(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      
      if (response.ok) {
        setNewsletterStatus({ 
          type: 'success', 
          message: getText('Merci pour votre abonnement', 'Misaotra nisoratra anarana') 
        });
        setNewsletterEmail('');
        setTimeout(() => setNewsletterStatus(null), 5000);
      } else {
        setNewsletterStatus({ 
          type: 'error', 
          message: getText('Une erreur est survenue', 'Nisy hadisoana nitranga') 
        });
      }
    } catch (error) {
      setNewsletterStatus({ 
        type: 'error', 
        message: getText('Erreur de connexion', 'Nisy olana tamin\'ny fifandraisana') 
      });
    } finally {
      setNewsletterLoading(false);
    }
  };

  const stats = [
    { value: '50+', labelFr: 'Projets realises', labelMg: 'Tetikasa vita', icon: Target },
    { value: '12 450+', labelFr: 'Beneficiaires', labelMg: 'Tompondaka', icon: Users },
    { value: '328', labelFr: 'Benevoles', labelMg: 'Mpanao asa soa', icon: HandHeart },
    { value: '15 780', labelFr: 'Arbres plantes', labelMg: 'Hazo nambolena', icon: Leaf },
    { value: '22', labelFr: 'Regions', labelMg: 'Faritra', icon: Globe },
    { value: '30+', labelFr: 'Partenaires', labelMg: 'Mpiara-miasa', icon: Building },
  ];

  const values = [
    { 
      icon: Shield, 
      titleFr: 'Transparence', 
      titleMg: 'Fahamarinana', 
      descFr: 'Toutes nos actions et finances sont documentees publiquement', 
      descMg: 'Ny hetsika sy vola rehetra dia voarakitra ho an\'ny rehetra' 
    },
    { 
      icon: TrendingUp, 
      titleFr: 'Innovation', 
      titleMg: 'Fanavaozana', 
      descFr: 'Nous encourageons les solutions nouvelles et technologiques', 
      descMg: 'Mampahery ny vahaolana vaovao sy ara-teknolojia izahay' 
    },
    { 
      icon: Award, 
      titleFr: 'Impact mesurable', 
      titleMg: 'Vokatra azo refesina', 
      descFr: 'Nos actions sont suivies avec des indicateurs clairs', 
      descMg: 'Ny hetsika dia arahi-maso amin\'ny mari-pamantarana mazava' 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-800">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-medium">
            {getText('Chargement de la plateforme', 'Fandefasana ny sehatra')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      
      {/* ============================================================
      SECTION HERO
      ============================================================ */}
      <section className="relative w-full min-h-screen overflow-hidden">
        {pageBackground?.image_url ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${pageBackground.image_url})`,
                backgroundPosition: pageBackground.position || 'center',
                backgroundSize: 'cover',
                backgroundAttachment: 'fixed',
              }}
            />
            <div 
              className="absolute inset-0"
              style={{
                backgroundColor: `rgba(0, 0, 0, ${(pageBackground.overlay_opacity || 45) / 100})`,
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900" />
        )}
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 py-20">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-8">
            <Award className="w-4 h-4 text-blue-200" />
            <span className="text-sm font-medium tracking-wide text-white">
              {getText('Association reconnue depuis 2015', 'Fikambanana ekena nanomboka 2015')}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            <span>Y-MaD</span>
            <span className="block text-2xl md:text-3xl lg:text-4xl text-blue-200 mt-4 font-light tracking-wide">
              {getText('Young for Madagascar Development', 'Tanora Malagasy miasa ho an\'ny Fivoarana')}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-lg">
            {getText(
              'Plateforme de gestion des offres d\'emploi pour les jeunes a Madagascar',
              'Sehatra fitantanana asa ho an\'ny tanora eto Madagasikara'
            )}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link 
              href="/jobs" 
              className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Briefcase className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
              <span>{getText('Voir les offres', 'Jereo ny asa')}</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
            <Link 
              href="/projects" 
              className="group inline-flex items-center gap-2 border-2 border-white/60 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-300 hover:border-white transform hover:-translate-y-1"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
              <span>{getText('Decouvrir nos projets', 'Hijery ny tetikasa')}</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
          
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1 h-2 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
      SECTION STATISTIQUES
      ============================================================ */}
      <section className="relative z-20 px-4 -mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-1">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                      <Icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-sm text-gray-500">{getText(stat.labelFr, stat.labelMg)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
      SECTION OFFRES D'EMPLOI
      ============================================================ */}
      {recentJobs.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
              <div>
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                  {getText('Opportunites de carriere', 'Fahafahana miasa')}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
                  {getText('Offres d\'emploi recentes', 'Asa farany')}
                </h2>
                <p className="text-gray-500 mt-1">
                  {getText('Rejoignez une equipe passionnee', 'Miaraha amin\'ny ekipa mazoto')}
                </p>
              </div>
              <Link href="/jobs" className="group text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
                <span>{getText('Voir toutes les offres', 'Jereo ny asa rehetra')}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {recentJobs.map((job) => (
                <JobCard key={job.id} job={job} language={language} getText={getText} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
      SECTION PROJETS
      ============================================================ */}
      {featuredProjects.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
              <div>
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                  {getText('Nos actions sur le terrain', 'Ny asantsika eo an-toerana')}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
                  {getText('Projets en cours', 'Tetim-piasana mitohy')}
                </h2>
                <p className="text-gray-500 mt-1">
                  {getText('Decouvrez nos projets de developpement', 'Hitanareo ny tetikasantsika')}
                </p>
              </div>
              <Link href="/projects" className="group text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
                <span>{getText('Voir tous les projets', 'Jereo ny tetikasa rehetra')}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  language={language} 
                  onViewDetails={openProjectDetails}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
      SECTION BLOG AVEC MODAL
      ============================================================ */}
      {recentPosts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
              <div>
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                  {getText('Actualites', 'Vaovao')}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
                  {getText('Derniers articles', 'Vaovao farany')}
                </h2>
                <p className="text-gray-500 mt-1">
                  {getText('Restez informes des actualites de Y-MaD', 'Mijanona ho vaovao amin\'ny Y-MaD')}
                </p>
              </div>
              <Link href="/blog" className="group text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
                <span>{getText('Voir tous les articles', 'Jereo ny vaovao rehetra')}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
                <BlogCard 
                  key={post.id} 
                  post={post} 
                  language={language} 
                  onViewDetails={openPostDetails}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
      SECTION NOS VALEURS
      ============================================================ */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-12">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              {getText('Ce qui nous guide', 'Izay mitarika anay')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
              {getText('Nos Valeurs', 'Ny soatoavina')}
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full mt-4"></div>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              {getText(
                'Les principes fondamentaux qui guident nos actions',
                'Ny fototry ny soatoavina mitarika ny hetsika ataonay'
              )}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{getText(value.titleFr, value.titleMg)}</h3>
                  <p className="text-gray-600 leading-relaxed">{getText(value.descFr, value.descMg)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
      SECTION NEWSLETTER
      ============================================================ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-center text-white shadow-xl">
            <Mail className="w-14 h-14 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
              {getText('Restez informes', 'Mijanòna ho voa-tantara')}
            </h3>
            <p className="text-blue-100 mb-8 max-w-md mx-auto">
              {getText(
                'Recevez nos actualites directement dans votre boite mail',
                'Mahazoa ny vaovao ataonay isaky ny email'
              )}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder={getText('Votre adresse email', 'Adiresy email anao')} 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-5 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300" 
                required 
              />
              <button 
                type="submit" 
                disabled={newsletterLoading}
                className="bg-white text-blue-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                {newsletterLoading ? '...' : getText('S\'abonner', 'Manaraka')}
              </button>
            </form>
            {newsletterStatus && (
              <p className={`text-sm mt-4 ${newsletterStatus.type === 'success' ? 'text-green-200' : 'text-red-200'}`}>
                {newsletterStatus.message}
              </p>
            )}
            <p className="text-xs text-blue-200 mt-4 opacity-75">
              {getText(
                'Votre email est protege et ne sera jamais partage',
                'Ny email anao dia voaaro ary tsy hozaraina mihitsy'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
      MODAL PROJET
      ============================================================ */}
      {showProjectModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto" onClick={closeProjectModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-5 border-b flex justify-between items-center rounded-t-2xl z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {language === 'fr' ? selectedProject.title_fr : (selectedProject.title_mg || selectedProject.title_fr)}
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> 
                  <span>{selectedProject.location || 'Madagascar'}</span>
                </p>
              </div>
              <button onClick={closeProjectModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <img 
                src={selectedProject.image_url || '/images/placeholder-project.jpg'} 
                alt={language === 'fr' ? selectedProject.title_fr : (selectedProject.title_mg || selectedProject.title_fr)} 
                className="w-full h-[350px] object-cover rounded-xl shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder-project.jpg';
                }}
              />
            </div>
            <div className="p-6 border-t bg-gray-50">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">
                {getText('Description du projet', 'Famaritana ny tetikasa')}
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {stripHtml(
                  language === 'fr' 
                    ? selectedProject.description_fr 
                    : (selectedProject.description_mg || selectedProject.description_fr)
                )}
              </p>
              <div className="mt-4 text-sm text-gray-400">
                {getText('Date de publication:', 'Daty namoahana:')} {
                  new Date(selectedProject.created_at).toLocaleDateString(
                    language === 'fr' ? 'fr-FR' : 'mg-MG',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )
                }
              </div>
            </div>
            <div className="p-6 border-t flex justify-center">
              <Link 
                href="/contact" 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                onClick={closeProjectModal}
              >
                {getText('Nous contacter', 'Mifandraisa aminay')}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
      MODAL ARTICLE - SANS BOUTON "LIRE LA SUITE"
      ============================================================ */}
      {showPostModal && selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto" onClick={closePostModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            
            <div className="sticky top-0 bg-white p-5 border-b flex justify-between items-center rounded-t-2xl z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {language === 'fr' ? selectedPost.title_fr : (selectedPost.title_mg || selectedPost.title_fr)}
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(selectedPost.published_at || selectedPost.created_at).toLocaleDateString(
                      language === 'fr' ? 'fr-FR' : 'mg-MG',
                      { year: 'numeric', month: 'long', day: 'numeric' }
                    )}
                  </span>
                </p>
              </div>
              <button onClick={closePostModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {selectedPost.image_url && (
              <div className="p-6">
                <img 
                  src={selectedPost.image_url} 
                  alt={language === 'fr' ? selectedPost.title_fr : (selectedPost.title_mg || selectedPost.title_fr)} 
                  className="w-full h-[350px] object-cover rounded-xl shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholder-blog.jpg';
                  }}
                />
              </div>
            )}

            <div className="p-6 border-t bg-gray-50">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">
                {getText('Resume de l\'article', 'Famintinana ny lahatsoratra')}
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {stripHtml(
                  language === 'fr' 
                    ? (selectedPost.summary_fr || selectedPost.content_fr || '')
                    : (selectedPost.summary_mg || selectedPost.content_mg || selectedPost.content_fr || '')
                )}
              </p>
            </div>

            {selectedPost.content_fr && (
              <div className="p-6 border-t">
                <h3 className="font-semibold text-lg text-gray-800 mb-3">
                  {getText('Contenu complet', 'Lahatsoratra feno')}
                </h3>
                <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {stripHtml(
                    language === 'fr' 
                      ? selectedPost.content_fr 
                      : (selectedPost.content_mg || selectedPost.content_fr)
                  )}
                </div>
              </div>
            )}

            {/* ✅ SECTION BOUTON UNIQUE - SANS "Lire la suite" */}
            <div className="p-6 border-t flex justify-center">
              <Link 
                href="/blog" 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                onClick={closePostModal}
              >
                {getText('Voir tous les articles', 'Jereo ny lahatsoratra rehetra')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPOSANT : CARTE OFFRE D'EMPLOI
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
  
  const cleanDescription = getExcerpt(description, 100);

  const getImageUrl = (): string => {
    if (job.image_url) return job.image_url;
    
    const defaultImages: Record<ContractType, string> = {
      CDI: '/images/jobs/default-cdi.jpg',
      CDD: '/images/jobs/default-cdd.jpg',
      STAGE: '/images/jobs/default-stage.jpg',
      FREELANCE: '/images/jobs/default-freelance.jpg',
      ALTERNANCE: '/images/jobs/default-alternance.jpg',
      TEMPORARY: '/images/jobs/default-temp.jpg'
    };
    return defaultImages[contractType] || '/images/jobs/default-job.jpg';
  };

  const getFallbackBg = (): string => {
    const colors: Record<ContractType, string> = {
      CDI: 'from-blue-600 to-blue-800',
      CDD: 'from-gray-600 to-gray-800',
      STAGE: 'from-green-600 to-green-800',
      FREELANCE: 'from-purple-600 to-purple-800',
      ALTERNANCE: 'from-orange-600 to-orange-800',
      TEMPORARY: 'from-red-600 to-red-800'
    };
    return colors[contractType] || 'from-blue-600 to-blue-800';
  };

  return (
    <Link href={`/jobs/${job.id}`} className="group block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
      <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${getFallbackBg()}`}>
        <img 
          src={getImageUrl()} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
        
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium shadow-sm ${contractColor}`}>
            {language === 'fr' ? contractLabel.fr : contractLabel.mg}
          </span>
          {isFeatured && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium shadow-sm">
              <Star className="w-3 h-3 fill-yellow-500" /> 
              <span>{language === 'fr' ? 'A la une' : 'Manokana'}</span>
            </span>
          )}
        </div>
        
        {isExpired && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-700 text-white font-medium">
              <Clock className="w-3 h-3" /> 
              <span>{language === 'fr' ? 'Expiree' : 'Lany daty'}</span>
            </span>
          </div>
        )}
        
        {job.company && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
              <Building className="w-3 h-3" />
              <span>{job.company}</span>
            </span>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <MapPin className="w-4 h-4" />
          <span>{job.location || 'Madagascar'}</span>
        </div>
        
        <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed">
          {cleanDescription}
        </p>
        
        {job.deadline && !isExpired && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>{language === 'fr' ? 'Jusqu\'au' : 'Hatramin\'ny'} {new Date(job.deadline).toLocaleDateString('fr-FR')}</span>
          </div>
        )}
        
        <div className="mt-4 flex justify-end text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
          <span>{getText('Postuler', 'Mangataka')}</span>
          <ArrowRight className="w-3 h-3 ml-1" />
        </div>
      </div>
    </Link>
  );
}

// ============================================================
// COMPOSANT : CARTE PROJET
// ============================================================
function ProjectCard({ 
  project, 
  language, 
  onViewDetails 
}: { 
  project: Project; 
  language: string; 
  onViewDetails: (project: Project) => void;
}) {
  const title = language === 'fr' ? project.title_fr : (project.title_mg || project.title_fr);
  const description = language === 'fr' ? project.description_fr : (project.description_mg || project.description_fr);
  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  return (
    <div 
      className="group block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      onClick={() => onViewDetails(project)}
    >
      <div className="h-56 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
        {project.image_url ? (
          <img src={project.image_url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <Briefcase className="w-16 h-16 text-blue-400" />
        )}
      </div>
      <div className="p-6">
        {project.location && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{project.location}</span>
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{title}</h3>
        <p className="text-gray-600 line-clamp-2 leading-relaxed">{getExcerpt(description, 100)}</p>
        <div className="mt-4 text-blue-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
          <span>{getText('Voir le projet', 'Jereo ny tetikasa')}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT : CARTE BLOG AVEC MODAL
// ============================================================
function BlogCard({ 
  post, 
  language, 
  onViewDetails 
}: { 
  post: BlogPost; 
  language: string; 
  onViewDetails: (post: BlogPost) => void;
}) {
  const title = language === 'fr' ? post.title_fr : (post.title_mg || post.title_fr);
  const excerpt = language === 'fr' ? (post.summary_fr || post.content_fr) : (post.summary_mg || post.content_mg || post.content_fr);
  const displayDate = post.published_at || post.created_at;
  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  const getImageUrl = (): string => {
    if (post.image_url) return post.image_url;
    return '/images/placeholder-blog.jpg';
  };

  return (
    <div 
      className="group block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      onClick={() => onViewDetails(post)}
    >
      <div className="h-52 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
        <img 
          src={getImageUrl()} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/placeholder-blog.jpg';
          }}
        />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3 flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(displayDate).toLocaleDateString('fr-FR')}</span>
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{title}</h3>
        {excerpt && <p className="text-gray-600 line-clamp-2 leading-relaxed">{getExcerpt(excerpt, 100)}</p>}
        <div className="mt-4 text-blue-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
          <span>{getText('Lire la suite', 'Hamaky bebe kokoa')}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}