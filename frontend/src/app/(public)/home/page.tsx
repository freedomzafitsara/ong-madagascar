// src/app/(public)/home/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Users, Globe, MapPin, Award, Target, HandHeart, 
  Leaf, Mail, Shield, TrendingUp, Building, Calendar,
  Briefcase, BookOpen, ChevronRight, Play
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { pageService, PageBackground } from '@/services/page.service';
import { projectService, Project } from '@/services/project.service';
import { jobService, JobOffer } from '@/services/job.service';
import { blogService, BlogPost } from '@/services/blog.service';

// ============================================================
// COMPOSANT PRINCIPAL DE LA PAGE D'ACCUEIL
// ============================================================
export default function HomePage() {
  const { language } = useLanguage();
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Fonction pour obtenir le texte selon la langue
  const getText = (frText: string, mgText: string): string => {
    return language === 'fr' ? frText : mgText;
  };

  // Chargement du fond d'écran depuis l'API
  const loadPageBackground = useCallback(async () => {
    try {
      const background = await pageService.getPageBackground('home');
      if (background?.is_active && background.image_url) {
        setPageBackground(background);
      }
    } catch (error) {
      console.error("Erreur chargement fond d'écran:", error);
    }
  }, []);

  // Chargement des données
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
      console.error("Erreur chargement données:", error);
    } finally {
      setLoading(false);
    }
  }, [loadPageBackground]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Gestion de la newsletter
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

  // Styles du fond d'écran pleine page
  const backgroundStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundImage: `url(${pageBackground.image_url})`,
    backgroundPosition: pageBackground.position || 'center',
    backgroundSize: pageBackground.size || 'cover',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
  } : {};

  const overlayStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundColor: `rgba(0, 0, 0, ${(pageBackground.overlay_opacity || 45) / 100})`,
  } : {};

  // Données statiques Y-MaD
  const stats = [
    { value: '50+', labelFr: 'Projets réalisés', labelMg: 'Tetikasa vita', icon: Target },
    { value: '12 450+', labelFr: 'Bénéficiaires', labelMg: 'Tompondaka', icon: Users },
    { value: '328', labelFr: 'Bénévoles', labelMg: 'Mpanao asa soa', icon: HandHeart },
    { value: '15 780', labelFr: 'Arbres plantés', labelMg: 'Hazo nambolena', icon: Leaf },
    { value: '22', labelFr: 'Régions', labelMg: 'Faritra', icon: Globe },
    { value: '30+', labelFr: 'Partenaires', labelMg: 'Mpiara-miasa', icon: Building },
  ];

  const values = [
    { icon: Shield, titleFr: 'Transparence', titleMg: 'Fahamarinana', descFr: 'Toutes nos actions sont documentées', descMg: 'Ny hetsika rehetra dia voarakitra' },
    { icon: TrendingUp, titleFr: 'Innovation', titleMg: 'Fanavaozana', descFr: 'Solutions nouvelles pour Madagascar', descMg: 'Vahaolana vaovao ho an\'i Madagasikara' },
    { icon: Award, titleFr: 'Impact mesurable', titleMg: 'Vokatra azo refesina', descFr: 'Indicateurs clairs et vérifiables', descMg: 'Mari-pamantarana mazava sy azo hamarinina' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ymad-blue-700">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">{getText('Chargement...', 'Miandry...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ==================== HERO SECTION AVEC FOND D'ÉCRAN ==================== */}
      <section className="relative w-full min-h-screen overflow-hidden">
        {/* Image de fond - pleine page */}
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
          <div className="absolute inset-0 bg-gradient-to-br from-ymad-blue-800 to-ymad-blue-900" />
        )}
        
        {/* Contenu superposé */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 py-20">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-8">
            <Award className="w-4 h-4 text-ymad-blue-200" />
            <span className="text-sm font-medium tracking-wide text-white">
              {getText('Association reconnue - Depuis 2015', 'Fikambanana ekena - Nanomboka 2015')}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            Y-MaD
            <span className="block text-2xl md:text-3xl lg:text-4xl text-ymad-blue-200 mt-4 font-light tracking-wide">
              {getText('" Young for Madagascar Development "', '" Tanora Malagasy miasa ho an\'ny Fivoarana "')}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-ymad-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-lg">
            {getText(
              'Plateforme de gestion des offres d\'emploi pour les jeunes à Madagascar',
              'Sehatra fitantanana asa ho an\'ny tanora eto Madagasikara'
            )}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link 
              href="/jobs" 
              className="group inline-flex items-center gap-2 bg-ymad-blue-600 hover:bg-ymad-blue-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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
              <span>{getText('Découvrir nos projets', 'Hijery ny tetikasa')}</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1 h-2 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== STATISTIQUES ==================== */}
      <section className="relative z-20 px-4 -mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-1">
                    <div className="w-14 h-14 bg-ymad-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-ymad-blue-600 transition-colors duration-300">
                      <Icon className="w-7 h-7 text-ymad-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-2xl font-bold text-ymad-gray-800">{stat.value}</p>
                    <p className="text-sm text-ymad-gray-500">{getText(stat.labelFr, stat.labelMg)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== OFFRES D'EMPLOI RÉCENTES ==================== */}
      {recentJobs.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
              <div>
                <span className="text-sm font-semibold text-ymad-blue-600 uppercase tracking-wider">
                  {getText('Opportunités de carrière', 'Fahafahana miasa')}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-ymad-gray-800 mt-2">
                  {getText('Offres d\'emploi récentes', 'Asa farany')}
                </h2>
              </div>
              <Link href="/jobs" className="group text-ymad-blue-600 font-semibold hover:text-ymad-blue-700 flex items-center gap-1">
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

      {/* ==================== PROJETS PHARES ==================== */}
      {featuredProjects.length > 0 && (
        <section className="py-20 bg-ymad-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
              <div>
                <span className="text-sm font-semibold text-ymad-blue-600 uppercase tracking-wider">
                  {getText('Nos actions sur le terrain', 'Ny asantsika eo an-toerana')}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-ymad-gray-800 mt-2">
                  {getText('Projets en cours', 'Tetim-piasana mitohy')}
                </h2>
              </div>
              <Link href="/projects" className="group text-ymad-blue-600 font-semibold hover:text-ymad-blue-700 flex items-center gap-1">
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

      {/* ==================== DERNIERS ARTICLES DU BLOG ==================== */}
      {recentPosts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
              <div>
                <span className="text-sm font-semibold text-ymad-blue-600 uppercase tracking-wider">
                  {getText('Actualités', 'Vaovao')}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-ymad-gray-800 mt-2">
                  {getText('Derniers articles', 'Vaovao farany')}
                </h2>
              </div>
              <Link href="/blog" className="group text-ymad-blue-600 font-semibold hover:text-ymad-blue-700 flex items-center gap-1">
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

      {/* ==================== NOS VALEURS ==================== */}
      <section className="py-20 bg-ymad-blue-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-12">
            <span className="text-sm font-semibold text-ymad-blue-600 uppercase tracking-wider">
              {getText('Ce qui nous guide', 'Izay mitarika anay')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-ymad-gray-800 mt-2">
              {getText('Nos Valeurs', 'Ny soatoavina')}
            </h2>
            <div className="w-20 h-1 bg-ymad-blue-600 mx-auto rounded-full mt-4"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 bg-ymad-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-8 h-8 text-ymad-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-ymad-gray-800 mb-2">{getText(value.titleFr, value.titleMg)}</h3>
                  <p className="text-ymad-gray-600 leading-relaxed">{getText(value.descFr, value.descMg)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== NEWSLETTER ==================== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-ymad-blue-600 to-ymad-blue-700 rounded-3xl p-12 text-center text-white shadow-xl">
            <Mail className="w-14 h-14 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-2">{getText('Restez informés', 'Mijanòna ho voa-tantara')}</h3>
            <p className="text-ymad-blue-100 mb-8 max-w-md mx-auto">
              {getText('Recevez nos actualités directement dans votre boîte mail', 'Mahazoa ny vaovao ataonay isaky ny email')}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder={getText('Votre adresse email', 'Adiresy email anao')} 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-5 py-3 rounded-xl text-ymad-gray-800 focus:outline-none focus:ring-2 focus:ring-ymad-blue-300" 
                required 
              />
              <button 
                type="submit" 
                disabled={newsletterLoading}
                className="bg-white text-ymad-blue-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                {newsletterLoading ? '...' : getText('S\'abonner', 'Manaraka')}
              </button>
            </form>
            {newsletterStatus && (
              <p className={`text-sm mt-4 ${newsletterStatus.type === 'success' ? 'text-green-200' : 'text-red-200'}`}>
                {newsletterStatus.message}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// COMPOSANTS SECONDAIRES
// ============================================================

function ProjectCard({ project, language }: { project: Project; language: string }) {
  const title = language === 'fr' ? project.title_fr : (project.title_mg || project.title_fr);
  const description = language === 'fr' ? project.description_fr : (project.description_mg || project.description_fr);

  return (
    <Link href={`/projects/${project.id}`} className="group block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="h-56 bg-gradient-to-br from-ymad-blue-100 to-ymad-blue-200 flex items-center justify-center overflow-hidden">
        {project.image_url ? (
          <img src={project.image_url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <Briefcase className="w-16 h-16 text-ymad-blue-400" />
        )}
      </div>
      <div className="p-6">
        {project.location && (
          <div className="flex items-center gap-1 text-sm text-ymad-gray-500 mb-2">
            <MapPin className="w-4 h-4" /> {project.location}
          </div>
        )}
        <h3 className="text-xl font-bold text-ymad-gray-800 mb-2 group-hover:text-ymad-blue-600 transition-colors line-clamp-1">{title}</h3>
        <p className="text-ymad-gray-600 line-clamp-2 leading-relaxed">{description}</p>
        <div className="mt-4 text-ymad-blue-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
          {language === 'fr' ? 'Voir le projet' : 'Jereo ny tetikasa'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

function BlogCard({ post, language }: { post: BlogPost; language: string }) {
  const title = language === 'fr' ? post.title_fr : (post.title_mg || post.title_fr);
  const excerpt = language === 'fr' ? post.summary_fr : (post.summary_mg || post.summary_fr);
  const displayDate = post.published_at || post.created_at;

  return (
    <Link href={`/blog/${post.id}`} className="group block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="h-52 bg-gradient-to-br from-ymad-blue-50 to-ymad-blue-100 flex items-center justify-center overflow-hidden">
        {post.image_url ? (
          <img src={post.image_url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <BookOpen className="w-16 h-16 text-ymad-blue-300" />
        )}
      </div>
      <div className="p-6">
        <div className="flex gap-4 text-sm text-ymad-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {new Date(displayDate).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <h3 className="text-xl font-bold text-ymad-gray-800 mb-2 group-hover:text-ymad-blue-600 transition-colors line-clamp-2">{title}</h3>
        {excerpt && <p className="text-ymad-gray-600 line-clamp-2 leading-relaxed">{excerpt}</p>}
        <div className="mt-4 text-ymad-blue-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
          {language === 'fr' ? 'Lire la suite' : 'Hamaky bebe kokoa'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

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
    const label = types[type]?.[language === 'fr' ? 'fr' : 'mg'];
    return label || type;
  };

  return (
    <Link href={`/jobs/${job.id}`} className="group block bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-ymad-gray-100">
      <h3 className="text-xl font-bold text-ymad-gray-800 mb-2 group-hover:text-ymad-blue-600 transition-colors line-clamp-1">{title}</h3>
      {job.company && (
        <p className="text-ymad-blue-600 font-medium mb-3 flex items-center gap-1">
          <Building className="w-4 h-4" /> {job.company}
        </p>
      )}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.contract_type && (
          <span className="bg-ymad-gray-100 text-ymad-gray-600 text-xs px-2 py-1 rounded-full">
            {getContractTypeLabel(job.contract_type)}
          </span>
        )}
        {job.location && (
          <span className="bg-ymad-gray-100 text-ymad-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {job.location}
          </span>
        )}
        {job.deadline && (
          <span className="bg-ymad-gray-100 text-ymad-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {new Date(job.deadline).toLocaleDateString('fr-FR')}
          </span>
        )}
      </div>
      <div className="flex justify-end text-ymad-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
        {language === 'fr' ? 'Postuler' : 'Mangataka'} <ArrowRight className="w-3 h-3 ml-1" />
      </div>
    </Link>
  );
}