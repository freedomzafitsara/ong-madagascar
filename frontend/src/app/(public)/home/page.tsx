// frontend/src/app/(public)/home/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Users, Globe, MapPin, Award, Target, HandHeart, 
  Leaf, Mail, Shield, TrendingUp, Building, Calendar,
  Briefcase, BookOpen, ChevronRight, Play, Sparkles
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { pageService, PageBackground } from '@/services/page.service';
import { projectService, Project } from '@/services/project.service';
import { jobService, JobOffer } from '@/services/job.service';
import { blogService, BlogPost } from '@/services/blog.service';

// ============================================================
// PAGE D'ACCUEIL Y-MaD
// Plateforme de gestion des offres d'emploi
// Association: Young for Madagascar Development
// ============================================================

export default function HomePage() {
  const { language } = useLanguage();
  
  // État des données dynamiques
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  
  // État de la newsletter
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Fonction de traduction bilingue
  const getText = (frText: string, mgText: string): string => {
    return language === 'fr' ? frText : mgText;
  };

  // ============================================================
  // CHARGEMENT DU FOND D'ECRAN DEPUIS LE BACKEND
  // ============================================================
  const loadPageBackground = useCallback(async () => {
    try {
      const background = await pageService.getPageBackground('home');
      if (background?.is_active && background.image_url) {
        setPageBackground(background);
        console.log('Fond d\'ecran charge avec succes');
      } else {
        // Image par défaut si aucune n'est configurée
        setPageBackground({
          id: 'default',
          page_key: 'home',
          image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&h=1080&fit=crop',
          is_active: true,
          overlay_opacity: 45,
          position: 'center',
          alt_fr: 'Image de fond par defaut - Y-MaD',
          alt_mg: 'Sary fototra voafaritra - Y-MaD',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Erreur chargement du fond d'ecran:", error);
      // Ne pas bloquer l'affichage de la page
    }
  }, []);

  // ============================================================
  // CHARGEMENT DES DONNEES (Offres, Projets, Blog)
  // ============================================================
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Chargement parallèle des trois types de contenu
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

  // ============================================================
  // GESTION DE LA NEWSLETTER
  // ============================================================
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
          message: getText('Merci pour votre abonnement !', 'Misaotra nisoratra anarana !') 
        });
        setNewsletterEmail('');
        setTimeout(() => setNewsletterStatus(null), 5000);
      } else {
        setNewsletterStatus({ 
          type: 'error', 
          message: getText('Une erreur est survenue.', 'Nisy hadisoana nitranga.') 
        });
      }
    } catch (error) {
      setNewsletterStatus({ 
        type: 'error', 
        message: getText('Erreur de connexion.', 'Nisy hadisoana tamin\'ny fifandraisana.') 
      });
    } finally {
      setNewsletterLoading(false);
    }
  };

  // ============================================================
  // STYLES DU FOND D'ECRAN
  // ============================================================
  const backgroundStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundImage: `url(${pageBackground.image_url})`,
    backgroundPosition: pageBackground.position || 'center',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
  } : {};

  const overlayStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundColor: `rgba(0, 0, 0, ${(pageBackground.overlay_opacity || 45) / 100})`,
  } : {};

  // ============================================================
  // DONNEES STATIQUES DE L'ASSOCIATION
  // ============================================================
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

  // ============================================================
  // RENDU - CHARGEMENT
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">
            {getText('Chargement de la plateforme...', 'Fandefasana ny sehatra...')}
          </p>
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
      SECTION HERO - AVEC FOND D'ECRAN DYNAMIQUE
      ============================================================ */}
      <section className="relative w-full min-h-screen overflow-hidden">
        {backgroundStyle.backgroundImage ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${pageBackground?.image_url})`,
                backgroundPosition: pageBackground?.position || 'center',
                backgroundSize: 'cover',
                backgroundAttachment: 'fixed',
              }}
            />
            <div 
              className="absolute inset-0"
              style={{
                backgroundColor: `rgba(0, 0, 0, ${(pageBackground?.overlay_opacity || 45) / 100})`,
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900" />
        )}
        
        {/* Contenu superposé */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 py-20">
          
          {/* Badge de reconnaissance */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-8">
            <Award className="w-4 h-4 text-blue-200" />
            <span className="text-sm font-medium tracking-wide text-white">
              {getText('Association reconnue - Depuis 2015', 'Fikambanana ekena - Nanomboka 2015')}
            </span>
          </div>
          
          {/* Titre principal */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            Y-MaD
            <span className="block text-2xl md:text-3xl lg:text-4xl text-blue-200 mt-4 font-light tracking-wide">
              {getText('" Young for Madagascar Development "', '" Tanora Malagasy miasa ho an\'ny Fivoarana "')}
            </span>
          </h1>
          
          {/* Sous-titre */}
          <p className="text-lg md:text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-lg">
            {getText(
              'Plateforme de gestion des offres d\'emploi pour les jeunes a Madagascar',
              'Sehatra fitantanana asa ho an\'ny tanora eto Madagasikara'
            )}
          </p>
          
          {/* Boutons d'action */}
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
          
          {/* Indicateur de défilement */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1 h-2 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
      SECTION STATISTIQUES DE L'ASSOCIATION
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
      SECTION OFFRES D'EMPLOI RECENTES
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
                {getText('Voir toutes les offres', 'Jereo ny asa rehetra')} 
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {recentJobs.map((job) => (
                <JobCard key={job.id} job={job} language={language} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
      SECTION PROJETS PHARES
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
                {getText('Voir tous les projets', 'Jereo ny tetikasa rehetra')} 
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} language={language} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
      SECTION DERNIERS ARTICLES DU BLOG
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
                {getText('Voir tous les articles', 'Jereo ny vaovao rehetra')} 
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
                <BlogCard key={post.id} post={post} language={language} />
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
      SECTION NEWSLETTER - APPEL A L'ACTION
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
    </div>
  );
}

// ============================================================
// COMPOSANT : CARTE PROJET
// ============================================================
function ProjectCard({ project, language }: { project: Project; language: string }) {
  const title = language === 'fr' ? project.title_fr : (project.title_mg || project.title_fr);
  const description = language === 'fr' ? project.description_fr : (project.description_mg || project.description_fr);

  return (
    <Link href={`/projects/${project.id}`} className="group block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
            <MapPin className="w-4 h-4" /> {project.location}
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{title}</h3>
        <p className="text-gray-600 line-clamp-2 leading-relaxed">{description}</p>
        <div className="mt-4 text-blue-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
          {language === 'fr' ? 'Voir le projet' : 'Jereo ny tetikasa'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

// ============================================================
// COMPOSANT : CARTE BLOG
// ============================================================
function BlogCard({ post, language }: { post: BlogPost; language: string }) {
  const title = language === 'fr' ? post.title_fr : (post.title_mg || post.title_fr);
  const excerpt = language === 'fr' ? post.summary_fr : (post.summary_mg || post.summary_fr);
  const displayDate = post.published_at || post.created_at;

  return (
    <Link href={`/blog/${post.id}`} className="group block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="h-52 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
        {post.image_url ? (
          <img src={post.image_url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <BookOpen className="w-16 h-16 text-blue-300" />
        )}
      </div>
      <div className="p-6">
        <div className="flex gap-4 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {new Date(displayDate).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{title}</h3>
        {excerpt && <p className="text-gray-600 line-clamp-2 leading-relaxed">{excerpt}</p>}
        <div className="mt-4 text-blue-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
          {language === 'fr' ? 'Lire la suite' : 'Hamaky bebe kokoa'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

// ============================================================
// COMPOSANT : CARTE OFFRE D'EMPLOI
// ============================================================
function JobCard({ job, language }: { job: JobOffer; language: string }) {
  const title = language === 'fr' ? job.title_fr : (job.title_mg || job.title_fr);
  
  const getContractTypeLabel = (type?: string): string => {
    if (!type) return '';
    const types: Record<string, { fr: string; mg: string }> = {
      CDI: { fr: 'CDI', mg: 'CDI' },
      CDD: { fr: 'CDD', mg: 'CDD' },
      STAGE: { fr: 'Stage', mg: 'Fiofanana' },
      FREELANCE: { fr: 'Freelance', mg: 'Freelance' },
    };
    return types[type]?.[language === 'fr' ? 'fr' : 'mg'] || type;
  };

  return (
    <Link href={`/jobs/${job.id}`} className="group block bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{title}</h3>
      {job.company && (
        <p className="text-blue-600 font-medium mb-3 flex items-center gap-1">
          <Building className="w-4 h-4" /> {job.company}
        </p>
      )}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.contract_type && (
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
            {getContractTypeLabel(job.contract_type)}
          </span>
        )}
        {job.location && (
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {job.location}
          </span>
        )}
        {job.deadline && (
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {new Date(job.deadline).toLocaleDateString('fr-FR')}
          </span>
        )}
      </div>
      <div className="flex justify-end text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
        {language === 'fr' ? 'Postuler' : 'Mangataka'} <ArrowRight className="w-3 h-3 ml-1" />
      </div>
    </Link>
  );
}