'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Heart, Users, Globe, MapPin, Award,
  Target, HandHeart, GraduationCap, Leaf, ChevronRight, Eye,
  Sparkles, Play, Quote, Mail, Shield, TrendingUp, Gift,
  Building, Calendar, Star, BookOpen, Briefcase, Clock
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// ========================================
// TYPES
// ========================================

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

// ========================================
// COMPOSANT PRINCIPAL
// ========================================

export default function HomePage() {
  const { language, t } = useLanguage();
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [postsRes, projectsRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/blog/posts?status=published&limit=3`).then(res => res.ok ? res.json() : []),
        fetch(`${API_BASE_URL}/projects?status=active&limit=3`).then(res => res.ok ? res.json() : []),
        fetch(`${API_BASE_URL}/jobs/offers?status=published&limit=3`).then(res => res.ok ? res.json() : []),
      ]);
      
      setRecentPosts(Array.isArray(postsRes) ? postsRes : []);
      setFeaturedProjects(Array.isArray(projectsRes) ? projectsRes : []);
      setRecentJobs(Array.isArray(jobsRes) ? jobsRes : []);
    } catch (error) {
      console.error('Erreur chargement:', error);
      // Données de démonstration
      setFeaturedProjects([
        {
          id: '1',
          title: 'Éducation pour tous',
          description: 'Programme éducatif pour les jeunes défavorisés',
          location: 'Antananarivo',
          status: 'active',
        },
        {
          id: '2',
          title: 'Reforestation Madagascar',
          description: 'Plantation d\'arbres pour lutter contre la déforestation',
          location: 'Atsimo-Andrefana',
          status: 'active',
        },
      ]);
      setRecentJobs([
        {
          id: '1',
          title: 'Coordinateur de projet',
          companyName: 'Y-Mad',
          jobType: 'cdi',
          location: 'Antananarivo',
          isFeatured: true,
        },
        {
          id: '2',
          title: 'Chargé de communication',
          companyName: 'Y-Mad',
          jobType: 'cdd',
          location: 'Antananarivo',
          isFeatured: false,
        },
      ]);
      setRecentPosts([
        {
          id: '1',
          title: 'Lancement du projet éducatif',
          slug: 'lancement-projet-educatif',
          excerpt: 'Y-Mad lance un nouveau programme éducatif',
          category: 'actualite',
          views: 150,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: '1000 arbres plantés',
          slug: '1000-arbres-plantes',
          excerpt: 'Succès de notre campagne de reforestation',
          category: 'environnement',
          views: 89,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
          message: language === 'fr' ? 'Merci pour votre abonnement !' : 'Misaotra nisoratra anarana !' 
        });
        setNewsletterEmail('');
        setTimeout(() => setNewsletterStatus(null), 5000);
      } else {
        setNewsletterStatus({ 
          type: 'error', 
          message: language === 'fr' ? 'Une erreur est survenue' : 'Nisy hadisoana nitranga' 
        });
      }
    } catch (error) {
      setNewsletterStatus({ type: 'error', message: 'Erreur de connexion' });
    } finally {
      setNewsletterLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">{language === 'fr' ? 'Chargement...' : 'Miandry...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
            <Award className="w-4 h-4 text-blue-200" />
            <span className="text-sm font-medium text-white">
              {language === 'fr' ? 'Association reconnue • Depuis 2015' : 'Fikambanana ekena • Nanomboka 2015'}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Y-Mad
            <span className="block text-2xl md:text-3xl text-blue-200 mt-3">
              {language === 'fr' ? 'Jeunesse Malgache en Action' : 'Tanora Malagasy miasa ho an\'ny Fivoarana'}
            </span>
          </h1>
          
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
            {language === 'fr' 
              ? 'Ensemble pour un développement durable et l\'autonomisation des communautés malgaches'
              : 'Miara-miasa ho an\'ny fampandrosoana maharitra sy fanomezana hery ny vondrom-piarahamonina malagasy'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/donate" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition hover:scale-105 shadow-lg">
              <Heart className="w-5 h-5" /> {language === 'fr' ? 'Faire un don' : 'Hanome'}
            </Link>
            <Link href="/projects" className="inline-flex items-center gap-2 border-2 border-white/50 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition">
              <Play className="w-5 h-5" /> {language === 'fr' ? 'Découvrir nos projets' : 'Hijery ny tetikasa'}
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== STATISTIQUES ==================== */}
      <section className="relative -mt-16 z-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition group-hover:scale-110">
                      <Icon className="w-7 h-7 text-blue-600" />
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

      {/* ==================== MISSION SECTION ==================== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-1.5 mb-4">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">{language === 'fr' ? 'Notre Mission' : 'Ny asa ataonay'}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              {language === 'fr' ? 'Autonomiser la jeunesse malgache' : 'Manome hery ny tanora malagasy'}
            </h2>
            <div className="w-24 h-1 bg-blue-600 rounded-full mx-auto mt-4 mb-6"></div>
            <p className="text-lg text-gray-600">
              {language === 'fr' 
                ? 'Y-Mad œuvre pour un développement durable à travers l\'éducation, la formation professionnelle et l\'entrepreneuriat.'
                : 'Y-Mad miasa ho an\'ny fampandrosoana maharitra amin\'ny alalan\'ny fampianarana, fampiofanana matihanina ary fandraharahana.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {actions.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition hover:-translate-y-2 border border-gray-100">
                  <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{language === 'fr' ? item.titleFr : item.titleMg}</h3>
                  <p className="text-gray-600">{language === 'fr' ? item.descFr : item.descMg}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== PROJETS SECTION ==================== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-1.5 mb-4">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">{language === 'fr' ? 'Nos Actions' : 'Ny asantsika'}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">{language === 'fr' ? 'Projets en cours' : 'Tetim-piasana'}</h2>
              <p className="text-gray-500 mt-2">{language === 'fr' ? 'Découvrez comment nous transformons les défis en opportunités' : 'Hijery ny fomba hamadihana ny fanamby ho fahafahana'}</p>
            </div>
            <Link href="/projects" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700">
              {language === 'fr' ? 'Voir tous les projets' : 'Jereo ny tetikasa rehetra'} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {featuredProjects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">{language === 'fr' ? 'Aucun projet pour le moment' : 'Tsy misy tetikasa amin\'izao fotoana izao'}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} language={language} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== OFFRES D'EMPLOI SECTION ==================== */}
      {recentJobs.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-1.5 mb-4">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">{language === 'fr' ? 'Carrières' : 'Asa'}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">{language === 'fr' ? 'Offres d\'emploi' : 'Asa'}</h2>
                <p className="text-gray-500 mt-2">{language === 'fr' ? 'Rejoignez notre équipe' : 'Miara-miasa aminay'}</p>
              </div>
              <Link href="/jobs" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700">
                {language === 'fr' ? 'Voir toutes les offres' : 'Jereo ny asa rehetra'} <ChevronRight className="w-4 h-4" />
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

      {/* ==================== VALEURS SECTION ==================== */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-200 rounded-full px-4 py-1.5 mb-4">
              <Shield className="w-4 h-4 text-blue-700" />
              <span className="text-sm font-medium text-blue-700">{language === 'fr' ? 'Nos Valeurs' : 'Ny soatoavina'}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              {language === 'fr' ? 'Des principes qui nous guident' : 'Ireo fitsipika mitarika anay'}
            </h2>
            <div className="w-24 h-1 bg-blue-600 rounded-full mx-auto mt-4"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition hover:-translate-y-2">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{language === 'fr' ? value.titleFr : value.titleMg}</h3>
                  <p className="text-gray-600">{language === 'fr' ? value.descFr : value.descMg}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== BLOG SECTION ==================== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-1.5 mb-4">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">{language === 'fr' ? 'Actualités' : 'Vaovao'}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">{language === 'fr' ? 'Dernières actualités' : 'Vaovao farany'}</h2>
              <p className="text-gray-500 mt-2">{language === 'fr' ? 'Suivez nos actions' : 'Araho ny asantsika'}</p>
            </div>
            <Link href="/blog" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700">
              {language === 'fr' ? 'Voir toutes les actualités' : 'Jereo ny vaovao rehetra'} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {recentPosts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">{language === 'fr' ? 'Aucun article pour le moment' : 'Tsy misy lahatsoratra amin\'izao fotoana izao'}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
                <BlogCard key={post.id} post={post} language={language} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== NEWSLETTER SECTION ==================== */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 text-center">
            <Mail className="w-12 h-12 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              {language === 'fr' ? 'Restez informés' : 'Mijanòna ho voa-tantara'}
            </h2>
            <p className="text-blue-100 mb-6">
              {language === 'fr' ? 'Recevez nos actualités directement dans votre boîte mail' : 'Mahazoa ny vaovao ataonay isaky ny email'}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder={language === 'fr' ? 'Votre email' : 'Adiresy email anao'} 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300" 
                required 
              />
              <button 
                type="submit" 
                disabled={newsletterLoading}
                className="bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition disabled:opacity-50"
              >
                {newsletterLoading ? '...' : (language === 'fr' ? 'S\'abonner' : 'Manaraka')}
              </button>
            </form>
            {newsletterStatus && (
              <p className={`text-sm mt-3 ${newsletterStatus.type === 'success' ? 'text-green-200' : 'text-red-200'}`}>
                {newsletterStatus.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ==================== CTA DON SECTION ==================== */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Gift className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'fr' ? 'Chaque don compte' : 'Ny fanomezana rehetra dia manan-danja'}
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            {language === 'fr' 
              ? 'Votre soutien nous permet d\'agir concrètement et de transformer des vies à Madagascar.'
              : 'Ny fanohananao dia manampy anay hanao hetsika sy hanova ny fiainan\'ny olona eto Madagasikara.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/donate" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition">
              <Heart className="w-5 h-5" /> {language === 'fr' ? 'Je fais un don' : 'Manome aho'}
            </Link>
            <Link href="/volunteers" className="inline-flex items-center gap-2 border-2 border-white/30 px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition">
              <HandHeart className="w-5 h-5" /> {language === 'fr' ? 'Devenir bénévole' : 'Mpanao asa soa'}
            </Link>
          </div>
        </div>
      </section>

      {/* Backend Info */}
      <div className="bg-gray-900 py-2 text-center text-xs text-gray-500">
        🔗 {language === 'fr' ? 'Connecté au backend' : 'Mifandray amin\'ny backend'} NestJS ({API_BASE_URL})
      </div>
    </div>
  );
}

// ========================================
// COMPOSANT CARTE PROJET
// ========================================

function ProjectCard({ project, language }: { project: Project; language: string }) {
  const title = language === 'fr' ? project.title : (project.title_mg || project.title);
  const description = language === 'fr' ? project.description : (project.description_mg || project.description);

  return (
    <Link href={`/projects/${project.id}`} className="group">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition hover:-translate-y-2">
        <div className="relative h-56 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
          <Briefcase className="w-16 h-16 text-blue-400" />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{project.location}</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition">{title}</h3>
          <p className="text-gray-600 line-clamp-2">{description}</p>
          <div className="mt-4 flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
            {language === 'fr' ? 'Voir le projet' : 'Jereo ny tetikasa'} <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ========================================
// COMPOSANT CARTE BLOG
// ========================================

function BlogCard({ post, language }: { post: BlogPost; language: string }) {
  const title = language === 'fr' ? post.title : (post.title_mg || post.title);
  const excerpt = language === 'fr' ? post.excerpt : (post.excerpt_mg || post.excerpt);
  const displayDate = post.publishedAt || post.createdAt;

  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition hover:-translate-y-2">
        <div className="relative h-52 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <BookOpen className="w-16 h-16 text-blue-300" />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(displayDate).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{post.views} vues</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition">{title}</h3>
          <p className="text-gray-600 line-clamp-2">{excerpt}</p>
          <div className="mt-4 flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
            {language === 'fr' ? 'Lire la suite' : 'Hamaky bebe kokoa'} <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ========================================
// COMPOSANT CARTE OFFRE D'EMPLOI
// ========================================

function JobCard({ job, language }: { job: JobOffer; language: string }) {
  const title = language === 'fr' ? job.title : (job.title_mg || job.title);
  
  const getJobTypeLabel = (type: string) => {
    const types: Record<string, { fr: string; mg: string }> = {
      cdi: { fr: 'CDI', mg: 'CDI' },
      cdd: { fr: 'CDD', mg: 'CDD' },
      stage: { fr: 'Stage', mg: 'Fiofanana' },
      freelance: { fr: 'Freelance', mg: 'Freelance' },
    };
    return types[type]?.[language as 'fr' || 'mg'] || type.toUpperCase();
  };

  return (
    <Link href={`/jobs/${job.id}`} className="group">
      <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition hover:-translate-y-2 border border-gray-100">
        {job.isFeatured && (
          <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full mb-3">
            <Star className="w-3 h-3" />
            <span>{language === 'fr' ? 'À la une' : 'Voasongadina'}</span>
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition line-clamp-1">{title}</h3>
        <p className="text-blue-600 font-medium mb-3 flex items-center gap-1">
          <Building className="w-4 h-4" />
          {job.companyName}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{getJobTypeLabel(job.jobType)}</span>
          {job.location && (
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {job.location}
            </span>
          )}
        </div>
        {job.deadline && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
            <Clock className="w-3 h-3" />
            <span>{language === 'fr' ? 'Date limite' : 'Daty farany'}: {new Date(job.deadline).toLocaleDateString('fr-FR')}</span>
          </div>
        )}
        <div className="flex justify-end mt-3">
          <span className="text-blue-600 font-medium text-sm group-hover:translate-x-1 transition inline-flex items-center gap-1">
            {language === 'fr' ? 'Voir détails' : 'Jereo ny antsipirihany'} <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
