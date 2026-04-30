'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Heart, 
  Users, 
  Globe, 
  Calendar, 
  MapPin, 
  Award,
  Target,
  HandHeart,
  GraduationCap,
  Stethoscope,
  Leaf,
  Droplets,
  Utensils,
  ChevronRight,
  Eye,
  Briefcase,
  Building,
  Sparkles,
  Loader2,
  Play,
  Star,
  Quote,
  Mail,
  Phone,
  Clock,
  Shield,
  TrendingUp,
  Zap,
  Coffee,
  Smile,
  ThumbsUp,
  Gift
} from 'lucide-react';

// ========================================
// TYPES
// ========================================

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  views: number;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  status: string;
  progressPercent: number;
  imageUrl: string;
}

interface JobOffer {
  id: string;
  title: string;
  department: string;
  location: string;
  contractType: string;
}

// ========================================
// API SERVICES
// ========================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchAPI<T>(endpoint: string): Promise<T[]> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) return [];
    const result = await response.json();
    return result.success ? (result.data || []) : [];
  } catch (error) {
    console.error(`Erreur fetch ${endpoint}:`, error);
    return [];
  }
}

// ========================================
// COMPOSANT PRINCIPAL
// ========================================

export default function HomePage() {
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [posts, projects, jobs] = await Promise.all([
        fetchAPI<BlogPost>('/blog-posts?status=published&limit=3'),
        fetchAPI<Project>('/projects?status=active&limit=3'),
        fetchAPI<JobOffer>('/job-offers?status=open&limit=3'),
      ]);
      setRecentPosts(posts);
      setFeaturedProjects(projects);
      setRecentJobs(jobs);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const actions = [
    { icon: GraduationCap, title: 'Éducation', description: 'Formation et accompagnement des jeunes', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', iconBg: 'bg-blue-100' },
    { icon: Stethoscope, title: 'Santé', description: 'Accès aux soins et prévention', color: 'from-green-500 to-green-600', bg: 'bg-green-50', iconBg: 'bg-green-100' },
    { icon: Leaf, title: 'Environnement', description: 'Protection et reboisement', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', iconBg: 'bg-emerald-100' },
    { icon: Droplets, title: 'Eau', description: 'Accès à l\'eau potable', color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50', iconBg: 'bg-cyan-100' },
    { icon: Utensils, title: 'Sécurité alimentaire', description: 'Lutte contre la malnutrition', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', iconBg: 'bg-amber-100' },
    { icon: HandHeart, title: 'Insertion sociale', description: 'Autonomisation des jeunes', color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50', iconBg: 'bg-rose-100' },
  ];

  const stats = [
    { value: '15+', label: 'Projets réalisés', icon: Target, color: 'text-blue-600' },
    { value: '12 450+', label: 'Bénéficiaires', icon: Users, color: 'text-green-600' },
    { value: '328', label: 'Bénévoles', icon: HandHeart, color: 'text-rose-600' },
    { value: '15 780', label: 'Arbres plantés', icon: Leaf, color: 'text-emerald-600' },
    { value: '15', label: 'Régions', icon: Globe, color: 'text-cyan-600' },
    { value: '24', label: 'Partenaires', icon: HandHeart, color: 'text-purple-600' },
  ];

  const testimonials = [
    { name: 'Marie Rakoto', role: 'Bénévole', content: 'Y-Mad a changé ma vision de l\'engagement communautaire. Une expérience enrichissante !', avatar: 'M', rating: 5 },
    { name: 'Jean Andrian', role: 'Partenaire', content: 'Un partenariat fructueux avec une équipe professionnelle et dévouée.', avatar: 'J', rating: 5 },
    { name: 'Sarah Rabe', role: 'Bénéficiaire', content: 'Grâce à Y-Mad, j\'ai pu suivre une formation qui a transformé ma vie.', avatar: 'S', rating: 5 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-800">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
            <Heart className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-white/80 text-lg">Chargement de Y-Mad Madagascar...</p>
          <p className="text-white/50 text-sm mt-2">Jeunesse Malgache en Action</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ======================================== */}
      {/* HERO SECTION AVEC VIDEO DE FOND */}
      {/* ======================================== */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="/images/hero-poster.jpg"
          >
            <source src="/videos/background.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-blue-900/90"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-5 py-2 mb-6 animate-fade-in-up border border-white/30">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Association reconnue • Depuis 2015</span>
          </div>

          {/* Main Title with gradient */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 animate-fade-in-up drop-shadow-2xl">
            Y-Mad
            <span className="block text-3xl md:text-4xl lg:text-5xl text-blue-200 mt-3 font-light">
              Jeunesse Malgache en Action
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-10 animate-fade-in-up leading-relaxed">
            Ensemble pour un développement durable et l'autonomisation des communautés malgaches
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center animate-fade-in-up">
            <Link 
              href="/donate" 
              className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              <span className="relative flex items-center gap-2">
                <Heart className="w-5 h-5 group-hover:scale-110 transition" />
                Faire un don
              </span>
            </Link>
            <Link 
              href="/projects" 
              className="group inline-flex items-center gap-2 border-2 border-white/50 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm"
            >
              <Play className="w-5 h-5 group-hover:translate-x-1 transition" />
              Découvrir nos projets
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-7 h-12 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1.5 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* STATISTIQUES SECTION AVEC CARTES */}
      {/* ======================================== */}
      <section className="relative -mt-16 z-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg">
                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* MISSION SECTION */}
      {/* ======================================== */}
      <section className="py-20 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-1.5 mb-4">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Notre Mission</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Autonomiser la jeunesse malgache
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 leading-relaxed">
              Y-Mad œuvre pour un développement durable et inclusif à travers l'éducation, 
              la formation professionnelle et l'entrepreneuriat des jeunes malgaches.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: 'Éducation', description: 'Formation et accompagnement des jeunes pour un avenir meilleur', stat: '500+ jeunes formés' },
              { icon: Heart, title: 'Solidarité', description: 'Valeurs malgaches du Fihavanana au cœur de nos actions', stat: '50+ projets solidaires' },
              { icon: Globe, title: 'Environnement', description: 'Protection de l\'environnement et développement durable', stat: '15 000+ arbres plantés' },
            ].map((item, index) => (
              <div key={index} className="group bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="inline-block bg-blue-50 text-blue-600 text-sm font-semibold px-4 py-2 rounded-full">
                  {item.stat}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* PROJETS SECTION - CORRIGÉE */}
      {/* ======================================== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-1.5 mb-4">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Nos Actions</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Projets en cours</h2>
              <p className="text-gray-500 mt-2">Découvrez comment nous transformons les défis en opportunités</p>
            </div>
            <Link href="/projects" className="group inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition">
              Voir tous les projets 
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          </div>
          
          {featuredProjects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun projet en cours pour le moment</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======================================== */}
      {/* VALEURS SECTION */}
      {/* ======================================== */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-1.5 mb-4">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Nos Valeurs</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Des principes qui nous guident
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Transparence', description: 'Toutes nos actions sont documentées et accessibles', color: 'from-blue-500 to-blue-600' },
              { icon: TrendingUp, title: 'Innovation', description: 'Solutions nouvelles pour Madagascar', color: 'from-green-500 to-green-600' },
              { icon: Award, title: 'Impact mesurable', description: 'Indicateurs clairs et vérifiables', color: 'from-purple-500 to-purple-600' },
              { icon: Users, title: 'Participation', description: 'Les communautés au cœur de nos projets', color: 'from-rose-500 to-rose-600' },
            ].map((value, index) => (
              <div key={index} className="group bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* ACTUALITÉS SECTION - CORRIGÉE */}
      {/* ======================================== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-1.5 mb-4">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Actualités</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Dernières nouvelles</h2>
              <p className="text-gray-500 mt-2">Suivez nos actions et événements</p>
            </div>
            <Link href="/blog" className="group inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition">
              Voir toutes les actualités 
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          </div>
          
          {recentPosts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <p className="text-gray-500">Aucun article pour le moment</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.map((post, index) => (
                <BlogCard key={post.id} post={post} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======================================== */}
      {/* TÉMOIGNAGES SECTION */}
      {/* ======================================== */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-4">
              <Quote className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">Ils parlent de nous</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ce qu'ils disent</h2>
            <div className="w-24 h-1 bg-yellow-400 rounded-full mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
                <Quote className="w-10 h-10 text-yellow-400/50 mb-4" />
                <p className="text-white/90 leading-relaxed mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-blue-200">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mt-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* NEWSLETTER SECTION */}
      {/* ======================================== */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-10 text-center shadow-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-6">
              <Mail className="w-4 h-4 text-white" />
              <span className="text-sm text-white">Newsletter</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Restez informés</h2>
            <p className="text-blue-100 mb-8 max-w-md mx-auto">
              Recevez nos actualités et événements directement dans votre boîte mail
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white text-gray-800"
                required
              />
              <button 
                type="submit"
                className="bg-white text-blue-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                S'abonner
              </button>
            </form>
            <p className="text-blue-200 text-sm mt-6">
              Pas de spam, désinscription facile à tout moment
            </p>
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* CTA FINALE - DON */}
      {/* ======================================== */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Gift className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Chaque don compte</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
            Votre soutien nous permet d'agir concrètement et de transformer des vies à Madagascar. 
            Ensemble, construisons un avenir meilleur.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link 
              href="/donate" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-10 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <Heart className="w-5 h-5" />
              Je fais un don
            </Link>
            <Link 
              href="/volunteer" 
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-white/10 hover:border-white transition-all duration-300"
            >
              <HandHeart className="w-5 h-5" />
              Devenir bénévole
            </Link>
          </div>
        </div>
      </section>

      {/* Backend Info */}
      <div className="bg-gray-100 py-2 text-center text-xs text-gray-400">
        🔗 Connecté au backend NestJS ({API_BASE_URL})
      </div>
    </div>
  );
}

// ========================================
// COMPOSANTS CORRIGÉS
// ========================================

function ProjectCard({ project, index }: { project: Project; index: number }) {
  // ✅ CORRECTION: Ajouter l'URL complète du backend
  const imageUrl = project.imageUrl ? `${API_BASE_URL}${project.imageUrl}` : null;
  
  return (
    <Link href={`/projects/${project.id}`} className="group">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
        <div className="relative h-56 overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Heart className="w-16 h-16 text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-4 left-4">
            <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
              {project.status === 'active' ? 'En cours' : 'Terminé'}
            </span>
          </div>
          {project.progressPercent > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000"
                style={{ width: `${project.progressPercent}%` }}
              />
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{project.location || 'Madagascar'}</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition">
            {project.title}
          </h3>
          <p className="text-gray-600 line-clamp-2 mb-4">{project.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-blue-600 font-semibold group-hover:gap-2 transition-all">
              En savoir plus <ArrowRight className="w-4 h-4" />
            </div>
            {project.progressPercent > 0 && (
              <span className="text-sm font-semibold text-blue-600">{project.progressPercent}%</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  // ✅ CORRECTION: Ajouter l'URL complète du backend
  const imageUrl = post.coverImage ? `${API_BASE_URL}${post.coverImage}` : null;
  
  return (
    <Link href={`/blog/${post.slug || post.id}`} className="group">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
        {imageUrl && (
          <div className="h-52 overflow-hidden relative">
            <img 
              src={imageUrl} 
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                {post.category || 'Article'}
              </span>
            </div>
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(post.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{post.views} vues</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
            {post.title}
          </h3>
          <p className="text-gray-600 line-clamp-2 mb-4">{post.excerpt || post.content?.substring(0, 100)}</p>
          <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
            Lire la suite <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>
    </Link>
  );
}