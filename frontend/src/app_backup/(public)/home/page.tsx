// frontend/src/app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Heart, Users, Globe, MapPin, Award,
  Target, HandHeart, GraduationCap, Leaf, ChevronRight, Eye,
  Sparkles, Play, Quote, Mail, Shield, TrendingUp, Gift,
  Building, Calendar, Star, BookOpen, Briefcase
} from 'lucide-react';
import api from '@/services/apiService';
import type { BlogPost, Project, JobOffer } from '@/types';

// ========================================
// CONFIGURATION
// ========================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

// ========================================
// COMPOSANT PRINCIPAL
// ========================================

export default function HomePage() {
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [postsRes, projectsRes, jobsRes] = await Promise.all([
        api.get('/blog/posts', { params: { status: 'published', limit: 3 } }),
        api.get('/projects', { params: { status: 'active', limit: 3 } }),
        api.get('/jobs/offers', { params: { status: 'published', limit: 3 } }),
      ]);
      
      setRecentPosts(postsRes.data || []);
      setFeaturedProjects(projectsRes.data || []);
      setRecentJobs(jobsRes.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = [
    { value: '15+', label: 'Projets réalisés', icon: Target },
    { value: '12 450+', label: 'Bénéficiaires', icon: Users },
    { value: '328', label: 'Bénévoles', icon: HandHeart },
    { value: '15 780', label: 'Arbres plantés', icon: Leaf },
    { value: '22', label: 'Régions', icon: Globe },
    { value: '24', label: 'Partenaires', icon: Building },
  ];

  const actions = [
    { icon: GraduationCap, title: 'Éducation', description: 'Formation et accompagnement des jeunes' },
    { icon: Leaf, title: 'Environnement', description: 'Protection et reboisement' },
    { icon: HandHeart, title: 'Insertion sociale', description: 'Autonomisation des jeunes' },
  ];

  const values = [
    { icon: Shield, title: 'Transparence', description: 'Toutes nos actions sont documentées' },
    { icon: TrendingUp, title: 'Innovation', description: 'Solutions nouvelles pour Madagascar' },
    { icon: Award, title: 'Impact mesurable', description: 'Indicateurs clairs et vérifiables' },
    { icon: Users, title: 'Participation', description: 'Les communautés au cœur de nos projets' },
  ];

  const testimonials = [
    { name: 'Marie Rakoto', role: 'Bénévole', content: 'Y-Mad a changé ma vision de l\'engagement communautaire.', avatar: 'M' },
    { name: 'Jean Andrian', role: 'Partenaire', content: 'Un partenariat fructueux avec une équipe professionnelle.', avatar: 'J' },
    { name: 'Sarah Rabe', role: 'Bénéficiaire', content: 'Grâce à Y-Mad, j\'ai pu suivre une formation transformante.', avatar: 'S' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 to-blue-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Chargement de Y-Mad Madagascar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-700 to-blue-800">
          <div className="absolute inset-0 opacity-10"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
            <Award className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-medium text-white">Association reconnue • Depuis 2015</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Y-Mad
            <span className="block text-3xl md:text-4xl text-blue-200 mt-3">
              Jeunesse Malgache en Action
            </span>
          </h1>
          
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
            Ensemble pour un développement durable et l'autonomisation des communautés malgaches
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/donate" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition hover:scale-105">
              <Heart className="w-5 h-5" /> Faire un don
            </Link>
            <Link href="/projects" className="inline-flex items-center gap-2 border-2 border-white/50 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition">
              <Play className="w-5 h-5" /> Découvrir nos projets
            </Link>
          </div>
        </div>
      </section>

      {/* STATISTIQUES */}
      <section className="relative -mt-16 z-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                    <stat.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-1.5 mb-4">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Notre Mission</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Autonomiser la jeunesse malgache</h2>
            <div className="w-24 h-1 bg-blue-600 rounded-full mx-auto mt-4 mb-6"></div>
            <p className="text-lg text-gray-600">
              Y-Mad œuvre pour un développement durable à travers l'éducation, la formation professionnelle et l'entrepreneuriat.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {actions.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 text-center shadow-md hover:shadow-lg transition hover:-translate-y-2 border border-gray-100">
                <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJETS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-1.5 mb-4">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Nos Actions</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Projets en cours</h2>
              <p className="text-gray-500 mt-2">Découvrez comment nous transformons les défis en opportunités</p>
            </div>
            <Link href="/projects" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700">
              Voir tous les projets <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {featuredProjects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun projet en cours pour le moment</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* OFFRES D'EMPLOI */}
      {recentJobs.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-1.5 mb-4">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Carrières</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Offres d'emploi</h2>
                <p className="text-gray-500 mt-2">Rejoignez notre équipe</p>
              </div>
              <Link href="/emploi" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700">
                Voir toutes les offres <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {recentJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VALEURS */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-200 rounded-full px-4 py-1.5 mb-4">
              <Shield className="w-4 h-4 text-blue-700" />
              <span className="text-sm font-medium text-blue-700">Nos Valeurs</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Des principes qui nous guident</h2>
            <div className="w-24 h-1 bg-blue-600 rounded-full mx-auto mt-4"></div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition hover:-translate-y-2">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <value.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTUALITÉS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-1.5 mb-4">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Actualités</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Dernières actualités</h2>
              <p className="text-gray-500 mt-2">Suivez nos actions</p>
            </div>
            <Link href="/blog" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700">
              Voir toutes les actualités <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {recentPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun article pour le moment</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="py-20 bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-4">
              <Quote className="w-4 h-4 text-blue-300" />
              <span className="text-sm font-medium">Ils parlent de nous</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Ce qu'ils disent</h2>
            <div className="w-24 h-1 bg-blue-400 rounded-full mx-auto mt-4"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/15 transition">
                <Quote className="w-10 h-10 text-blue-300/50 mb-4" />
                <p className="text-white/90 leading-relaxed mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-blue-200">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-blue-600 rounded-3xl p-10 text-center">
            <Mail className="w-12 h-12 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Restez informés</h2>
            <p className="text-blue-100 mb-6">Recevez nos actualités directement dans votre boîte mail</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input type="email" placeholder="Votre email" className="flex-1 px-4 py-3 rounded-xl text-gray-800" required />
              <button type="submit" className="bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition">
                S'abonner
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA DON */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Gift className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Chaque don compte</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            Votre soutien nous permet d'agir concrètement et de transformer des vies à Madagascar.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/donate" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition">
              <Heart className="w-5 h-5" /> Je fais un don
            </Link>
            <Link href="/volunteers" className="inline-flex items-center gap-2 border-2 border-white/30 px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition">
              <HandHeart className="w-5 h-5" /> Devenir bénévole
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
// COMPOSANTS
// ========================================

function ProjectCard({ project }: { project: Project }) {
  const imageUrl = project.imageUrl ? `${API_BASE_URL}${project.imageUrl}` : null;
  
  return (
    <Link href={`/projects/${project.id}`} className="group">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition hover:-translate-y-2">
        <div className="relative h-56 bg-gray-200">
          {imageUrl ? (
            <img src={imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          ) : (
            <div className="w-full h-full bg-blue-100 flex items-center justify-center">
              <Heart className="w-16 h-16 text-blue-300" />
            </div>
          )}
          <div className="absolute bottom-4 left-4">
            <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
              {project.status === 'active' ? 'En cours' : 'Terminé'}
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{project.location || 'Madagascar'}</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition">
            {project.title}
          </h3>
          <p className="text-gray-600 line-clamp-2">{project.description}</p>
        </div>
      </div>
    </Link>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  const imageUrl = post.featuredImage ? `${API_BASE_URL}${post.featuredImage}` : null;
  
  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition hover:-translate-y-2">
        {imageUrl && (
          <div className="h-52 overflow-hidden relative bg-gray-200">
            <img src={imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
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
          <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>
          <div className="mt-4 flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
            Lire la suite <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function JobCard({ job }: { job: JobOffer }) {
  return (
    <Link href={`/emploi/${job.id}`} className="group">
      <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition hover:-translate-y-2 border border-gray-100">
        {job.isFeatured && (
          <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full mb-3">
            <Star className="w-3 h-3" />
            <span>À la une</span>
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition line-clamp-1">
          {job.title}
        </h3>
        <p className="text-blue-600 font-medium mb-3 flex items-center gap-1">
          <Building className="w-4 h-4" />
          {job.companyName}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{job.jobType?.toUpperCase()}</span>
          {job.location && (
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {job.location}
            </span>
          )}
        </div>
        <div className="flex justify-end">
          <span className="text-blue-600 font-medium text-sm group-hover:translate-x-1 transition inline-flex items-center gap-1">
            Voir détails <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}