'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Heart, Users, Globe, MapPin, Award,
  Target, HandHeart, GraduationCap, Leaf, ChevronRight, Eye,
  Sparkles, Mail, Shield, TrendingUp, Gift,
  Building, Calendar, Star, BookOpen, Briefcase, Clock,
  Facebook, Instagram, Twitter, Linkedin, Youtube, Play
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { pageService, PageBackground } from '@/services/pageService';

// ============================================================
// DÉFINITION DES TYPES
// ============================================================
interface BlogPost {
  id: string;
  title: string;
  title_mg?: string;
  slug: string;
  excerpt: string;
  excerpt_mg?: string;
  featuredImage?: string;
  category: string;
  views: number;
  createdAt: string;
  publishedAt?: string;
}

interface Project {
  id: string;
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  location: string;
  status: 'active' | 'completed';
  imageUrl?: string;
  progress?: number;
  beneficiaries?: number;
}

interface JobOffer {
  id: string;
  title: string;
  title_mg?: string;
  companyName: string;
  jobType: string;
  location: string;
  isFeatured: boolean;
  deadline?: string;
}

interface PageHero {
  title: string;
  title_mg?: string;
  subtitle: string;
  subtitle_mg?: string;
  buttonText?: string;
  buttonText_mg?: string;
  buttonLink?: string;
  imageUrl?: string;
}

// ============================================================
// COMPOSANT PRINCIPAL DE LA PAGE D'ACCUEIL
// ============================================================
export default function HomePage() {
  const { language } = useLanguage();
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageHero, setPageHero] = useState<PageHero | null>(null);
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

  // Fonction pour obtenir le texte selon la langue
  const getText = (frText: string, mgText: string): string => {
    return language === 'fr' ? frText : mgText;
  };

  // Chargement du contenu
  const loadPageContent = useCallback(async () => {
    try {
      const contentResponse = await fetch(`${API_BASE_URL}/pages/public/home`);
      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        if (contentData?.hero) setPageHero(contentData.hero);
      }

      const background = await pageService.getBackground('home');
      if (background?.is_active && background.image_url) {
        setPageBackground(background);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du contenu :", error);
    }
  }, [API_BASE_URL]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [postsRes, projectsRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/blog?status=published&limit=3`),
        fetch(`${API_BASE_URL}/projects?status=active&limit=3`),
        fetch(`${API_BASE_URL}/jobs/offers?status=published&limit=3`),
      ]);

      const postsData = postsRes.ok ? (await postsRes.json()).data || [] : [];
      const projectsData = projectsRes.ok ? (await projectsRes.json()).data || [] : [];
      const jobsData = jobsRes.ok ? (await jobsRes.json()).data || [] : [];

      setRecentPosts(Array.isArray(postsData) ? postsData : []);
      setFeaturedProjects(Array.isArray(projectsData) ? projectsData : []);
      setRecentJobs(Array.isArray(jobsData) ? jobsData : []);
      
      await loadPageContent();
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, loadPageContent]);

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
      const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
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
      setNewsletterStatus({ type: 'error', message: getText('Erreur de connexion.', 'Nisy hadisoana tamin\'ny fifandraisana.') });
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Données statiques
  const stats = [
    { value: '50+', labelFr: 'Projets réalisés', labelMg: 'Tetikasa vita', icon: Target },
    { value: '12 450+', labelFr: 'Bénéficiaires', labelMg: 'Tompondaka', icon: Users },
    { value: '328', labelFr: 'Bénévoles', labelMg: 'Mpanao asa soa', icon: HandHeart },
    { value: '15 780', labelFr: 'Arbres plantés', labelMg: 'Hazo nambolena', icon: Leaf },
    { value: '22', labelFr: 'Régions', labelMg: 'Faritra', icon: Globe },
    { value: '30+', labelFr: 'Partenaires', labelMg: 'Mpiara-miasa', icon: Building },
  ];

  const actions = [
    { icon: GraduationCap, titleFr: 'Éducation', titleMg: 'Fampianarana', descFr: 'Formation et accompagnement des jeunes', descMg: 'Fampiofanana sy fanarahamaso ny tanora' },
    { icon: Leaf, titleFr: 'Environnement', titleMg: 'Tontolo iainana', descFr: 'Protection et reboisement', descMg: 'Fiarovana sy fambolena hazo' },
    { icon: HandHeart, titleFr: 'Insertion sociale', titleMg: 'Fampidirana ara-tsosialy', descFr: 'Autonomisation des jeunes', descMg: 'Fanomezana hery ny tanora' },
  ];

  const values = [
    { icon: Shield, titleFr: 'Transparence', titleMg: 'Fahamarinana', descFr: 'Toutes nos actions sont documentées', descMg: 'Ny hetsika rehetra dia voarakitra' },
    { icon: TrendingUp, titleFr: 'Innovation', titleMg: 'Fanavaozana', descFr: 'Solutions nouvelles pour Madagascar', descMg: 'Vahaolana vaovao ho an\'i Madagasikara' },
    { icon: Award, titleFr: 'Impact mesurable', titleMg: 'Vokatra azo refesina', descFr: 'Indicateurs clairs et vérifiables', descMg: 'Mari-pamantarana mazava sy azo hamarinina' },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/ymadorg', label: 'Facebook', bg: '#1877F2' },
    { icon: Instagram, href: 'https://instagram.com/ymad_mg', label: 'Instagram', bg: '#E4405F' },
    { icon: Linkedin, href: 'https://linkedin.com/company/ymad', label: 'LinkedIn', bg: '#0A66C2' },
    { icon: Twitter, href: 'https://twitter.com/ymad_mg', label: 'Twitter', bg: '#1DA1F2' },
    { icon: Youtube, href: 'https://youtube.com/@ymad', label: 'YouTube', bg: '#FF0000' },
  ];

  // Styles du fond d'écran avec overlay amélioré pour la lisibilité
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
      <div className="min-h-screen flex items-center justify-center bg-blue-600">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">{getText('Chargement...', 'Miandry...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ==================== BANNIÈRE PRINCIPALE (HERO) AVEC DESIGN AMÉLIORÉ ==================== */}
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Fond d'écran dynamique */}
        {backgroundStyle.backgroundImage ? (
          <>
            <div className="absolute inset-0" style={backgroundStyle} />
            <div className="absolute inset-0" style={overlayStyle} />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-900" />
        )}
        
        {/* Contenu avec design professionnel */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 py-20">
          
          {/* Badge d'association */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-8 animate-fade-in-up">
            <Award className="w-4 h-4 text-blue-200" />
            <span className="text-sm font-medium tracking-wide text-white">
              {getText('Association reconnue - Depuis 2015', 'Fikambanana ekena - Nanomboka 2015')}
            </span>
          </div>
          
          {/* Titre principal en grand format */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-2xl animate-fade-in-up">
            {pageHero ? (language === 'fr' ? pageHero.title : (pageHero.title_mg || pageHero.title)) : 'Y-Mad Madagascar'}
            <span className="block text-2xl md:text-3xl lg:text-4xl text-blue-200 mt-4 font-light tracking-wide">
              {getText('Jeunesse Malgache en Action', 'Tanora Malagasy miasa ho an\'ny Fivoarana')}
            </span>
          </h1>
          
          {/* Sous-titre avec meilleure lisibilité */}
          <p className="text-lg md:text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-lg animate-fade-in-up animation-delay-200">
            {pageHero ? (language === 'fr' ? pageHero.subtitle : (pageHero.subtitle_mg || pageHero.subtitle)) : 
              getText('Ensemble pour un développement durable et l\'autonomisation des communautés malgaches', 
                      'Miara-miasa ho an\'ny fampandrosoana maharitra sy fanomezana hery ny vondrom-piarahamonina malagasy')}
          </p>
          
          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center animate-fade-in-up animation-delay-400">
            <Link 
              href={pageHero?.buttonLink || '/donate'} 
              className="group inline-flex items-center gap-2 bg-white text-blue-800 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
              <span>{pageHero ? (language === 'fr' ? pageHero.buttonText : (pageHero.buttonText_mg || pageHero.buttonText)) : getText('Faire un don', 'Hanome')}</span>
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
          
          {/* Indicateur de défilement */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1 h-2 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== ANIMATION KEYFRAMES ==================== */}
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
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
      `}</style>

      {/* ==================== STATISTIQUES (juste en dessous) ==================== */}
      <section className="relative z-20 px-4 -mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={index} 
                    className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                      <Icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-sm text-gray-500">{language === 'fr' ? stat.labelFr : stat.labelMg}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== NOS MISSIONS ==================== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-12">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              {getText('Ce que nous faisons', 'Izay ataontsika')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
              {getText('Notre Mission', 'Ny asa ataonay')}
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full mt-4"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {actions.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1">
                  <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{language === 'fr' ? item.titleFr : item.titleMg}</h3>
                  <p className="text-gray-600 leading-relaxed">{language === 'fr' ? item.descFr : item.descMg}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== PROJETS PHARES ==================== */}
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
            </div>
            <Link href="/projects" className="group text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
              {getText('Voir tous les projets', 'Jereo ny tetikasa rehetra')} 
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} language={language} />
            ))}
          </div>
        </div>
      </section>

      {/* ==================== OFFRES D'EMPLOI ==================== */}
      {recentJobs.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
              <div>
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                  {getText('Opportunités de carrière', 'Fahafahana miasa')}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
                  {getText('Offres d\'emploi', 'Asa')}
                </h2>
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

      {/* ==================== NOS VALEURS ==================== */}
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
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{language === 'fr' ? value.titleFr : value.titleMg}</h3>
                  <p className="text-gray-600 leading-relaxed">{language === 'fr' ? value.descFr : value.descMg}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== BLOG & NEWSLETTER ==================== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              {getText('Actualités', 'Vaovao')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
              {getText('Dernières actualités', 'Vaovao farany')}
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full mt-4"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {recentPosts.map((post) => (
              <BlogCard key={post.id} post={post} language={language} />
            ))}
          </div>
          
          {/* Newsletter */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-center text-white shadow-xl">
            <Mail className="w-14 h-14 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-2">{getText('Restez informés', 'Mijanòna ho voa-tantara')}</h3>
            <p className="text-blue-100 mb-8 max-w-md mx-auto">
              {getText('Recevez nos actualités directement dans votre boîte mail', 'Mahazoa ny vaovao ataonay isaky ny email')}
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
          </div>
        </div>
      </section>

      {/* ==================== APPEL À L'ACTION (DON) ==================== */}
      <section className="py-20 bg-gray-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <Gift className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {getText('Chaque don compte', 'Ny fanomezana rehetra dia manan-danja')}
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            {getText('Votre soutien nous permet d\'agir concrètement et de transformer des vies à Madagascar.', 
                      'Ny fanohananao dia manampy anay hanao hetsika sy hanova ny fiainan\'ny olona eto Madagasikara.')}
          </p>
          <Link 
            href="/donate" 
            className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
            {getText('Je fais un don', 'Manome aho')}
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </section>

      {/* ==================== RÉSEAUX SOCIAUX ==================== */}
      <section className="py-12 bg-gray-100 text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {getText('Suivez-nous sur les réseaux', 'Araho izahay amin\'ny tambajotra sosialy')}
        </h3>
        <div className="flex justify-center gap-4 flex-wrap">
          {socialLinks.map((social, idx) => {
            const Icon = social.icon;
            return (
              <a 
                key={idx} 
                href={social.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                style={{ backgroundColor: social.bg }}
                aria-label={social.label}
              >
                <Icon className="w-5 h-5 text-white" />
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ============================================================
// COMPOSANTS SECONDAIRES (Cartes Projet, Blog, Offre)
// ============================================================

function ProjectCard({ project, language }: { project: Project; language: string }) {
  const title = language === 'fr' ? project.title : (project.title_mg || project.title);
  const description = language === 'fr' ? project.description : (project.description_mg || project.description);

  return (
    <Link href={`/projects/${project.id}`} className="group block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="h-56 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
        {project.imageUrl ? (
          <img src={project.imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <Briefcase className="w-16 h-16 text-blue-400" />
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2"><MapPin className="w-4 h-4" /> {project.location}</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{title}</h3>
        <p className="text-gray-600 line-clamp-2 leading-relaxed">{description}</p>
        <div className="mt-4 text-blue-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
          {language === 'fr' ? 'Voir le projet' : 'Jereo ny tetikasa'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

function BlogCard({ post, language }: { post: BlogPost; language: string }) {
  const title = language === 'fr' ? post.title : (post.title_mg || post.title);
  const excerpt = language === 'fr' ? post.excerpt : (post.excerpt_mg || post.excerpt);
  const displayDate = post.publishedAt || post.createdAt;

  return (
    <Link href={`/blog/${post.slug}`} className="group block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="h-52 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
        {post.featuredImage ? (
          <img src={post.featuredImage} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <BookOpen className="w-16 h-16 text-blue-300" />
        )}
      </div>
      <div className="p-6">
        <div className="flex gap-4 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(displayDate).toLocaleDateString('fr-FR')}</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views} vues</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{title}</h3>
        <p className="text-gray-600 line-clamp-2 leading-relaxed">{excerpt}</p>
        <div className="mt-4 text-blue-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
          {language === 'fr' ? 'Lire la suite' : 'Hamaky bebe kokoa'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

function JobCard({ job, language }: { job: JobOffer; language: string }) {
  const title = language === 'fr' ? job.title : (job.title_mg || job.title);
  const getJobTypeLabel = (type: string) => {
    const types: Record<string, { fr: string; mg: string }> = {
      cdi: { fr: 'CDI', mg: 'CDI' },
      cdd: { fr: 'CDD', mg: 'CDD' },
      stage: { fr: 'Stage', mg: 'Fiofanana' },
      freelance: { fr: 'Freelance', mg: 'Freelance' },
    };
    return types[type]?.[language === 'fr' ? 'fr' : 'mg'] || type.toUpperCase();
  };

  return (
    <Link href={`/jobs/${job.id}`} className="group block bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
      {job.isFeatured && (
        <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full mb-3">
          <Star className="w-3 h-3" /> {language === 'fr' ? 'À la une' : 'Voasongadina'}
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{title}</h3>
      <p className="text-blue-600 font-medium mb-3 flex items-center gap-1"><Building className="w-4 h-4" /> {job.companyName}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{getJobTypeLabel(job.jobType)}</span>
        {job.location && (
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {job.location}
          </span>
        )}
      </div>
      <div className="flex justify-end text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
        {language === 'fr' ? 'Voir détails' : 'Jereo ny antsipirihany'} <ArrowRight className="w-3 h-3 ml-1" />
      </div>
    </Link>
  );
}