// src/app/blog/page.tsx

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calendar, User, Search, Tag, Sparkles, X, ChevronLeft, ChevronRight, 
  Eye, BookOpen, Newspaper, FolderOpen, GraduationCap, Leaf, 
  Calendar as CalendarIcon, Briefcase, Stethoscope, Handshake, 
  Loader2, AlertCircle, Heart, Clock, Share2, Facebook, Twitter, 
  Linkedin, Link as LinkIcon, Check, ArrowLeft
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { pageService, PageBackground } from '@/services/pageService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

interface BlogPost {
  id: string;
  title: string;
  title_mg?: string | null;
  slug: string;
  summary: string;
  summary_mg?: string | null;
  content: string;
  content_mg?: string | null;
  type: string;
  image_url: string | null;
  status: string;
  author: string;
  tags: string[];
  views: number;
  published_at: string | null;
  created_at: string;
}

// Catégories disponibles
const categoriesFr = ["Tous", "Actualités", "Environnement", "Événements", "Agriculture", "Éducation", "Santé", "Social"];
const categoriesMg = ["Rehetra", "Vaovao", "Tontolo iainana", "Hetsika", "Fambolena", "Fampianarana", "Fahasalamana", "Sosialy"];

// Mapping des types d'articles vers catégories
const typeToCategory: Record<string, string> = {
  'news': 'Actualités',
  'testimonial': 'Social',
  'report': 'Actualités',
  'success_story': 'Social',
  'event_recap': 'Événements'
};

// Mapping des icônes par catégorie
const getCategoryIcon = (category: string) => {
  const icons: Record<string, any> = {
    'Actualités': Newspaper,
    'Environnement': Leaf,
    'Événements': CalendarIcon,
    'Agriculture': Briefcase,
    'Éducation': GraduationCap,
    'Santé': Stethoscope,
    'Social': Heart,
  };
  const Icon = icons[category];
  return Icon ? <Icon className="w-3 h-3" /> : <FolderOpen className="w-3 h-3" />;
};

export default function BlogPage() {
  const { t, language } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(language === 'fr' ? "Tous" : "Rehetra");
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const itemsPerPage = 6;

  const categories = language === 'fr' ? categoriesFr : categoriesMg;

  const getCategoryFr = (categoryMg: string): string => {
    const mapping: Record<string, string> = {
      'Rehetra': 'Tous', 'Vaovao': 'Actualités', 'Tontolo iainana': 'Environnement',
      'Hetsika': 'Événements', 'Fambolena': 'Agriculture', 'Fampianarana': 'Éducation',
      'Fahasalamana': 'Santé', 'Sosialy': 'Social'
    };
    return mapping[categoryMg] || categoryMg;
  };

  const openPostDetails = (post: BlogPost) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const loadPageBackground = useCallback(async () => {
    try {
      const background = await pageService.getBackground('blog');
      if (background && background.is_active && background.image_url) {
        setPageBackground(background);
      }
    } catch (error) {
      console.error('Erreur chargement fond d\'écran:', error);
    }
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/blog/public?page=1&limit=100`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const formatted = data.data.map((p: any) => ({
            id: p.id,
            title: p.title,
            title_mg: p.title_mg,
            slug: p.slug,
            summary: p.summary,
            summary_mg: p.summary_mg,
            content: p.content,
            content_mg: p.content_mg,
            type: p.type,
            image_url: p.image_url,
            status: p.status,
            author: p.author || (p.user ? `${p.user.firstName} ${p.user.lastName}` : 'Y-Mad'),
            tags: p.tags || [],
            views: p.views || 0,
            published_at: p.published_at,
            created_at: p.created_at
          }));
          setPosts(formatted);
          setFilteredPosts(formatted);
        } else {
          setPosts([]);
          setFilteredPosts([]);
        }
      } else {
        console.error('Erreur chargement API');
        setPosts([]);
        setFilteredPosts([]);
      }
    } catch (error) {
      console.error('Erreur chargement articles:', error);
      setPosts([]);
      setFilteredPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPageBackground();
    loadPosts();
  }, [loadPageBackground, loadPosts]);

  useEffect(() => {
    setSelectedCategory(language === 'fr' ? "Tous" : "Rehetra");
  }, [language]);

  useEffect(() => {
    let filtered = [...posts];
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        (language === 'fr' ? p.title : (p.title_mg || p.title)).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (language === 'fr' ? p.summary : (p.summary_mg || p.summary)).toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory !== (language === 'fr' ? "Tous" : "Rehetra")) {
      const categoryToFilter = language === 'fr' ? selectedCategory : getCategoryFr(selectedCategory);
      filtered = filtered.filter(p => {
        const postCategory = typeToCategory[p.type] || 'Actualités';
        return postCategory === categoryToFilter;
      });
    }
    
    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, posts, language]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return language === 'fr' ? 'Date non disponible' : 'Tsy misy daty';
    return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s/g).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return language === 'fr' 
      ? `${minutes} min de lecture` 
      : `${minutes} min famakiana`;
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = selectedPost ? (language === 'fr' ? selectedPost.title : (selectedPost.title_mg || selectedPost.title)) : '';

  const handleShare = async (platform: string) => {
    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'copy':
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
    }
    if (url) window.open(url, '_blank', 'width=600,height=400');
  };

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = useMemo(() => ({
    total: posts.length,
    categories: new Set(posts.map(p => typeToCategory[p.type] || 'Actualités')).size,
    totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0)
  }), [posts]);

  const overlayStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundColor: `rgba(0, 0, 0, ${(pageBackground.overlay_opacity || 30) / 100})`,
  } : {};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{language === 'fr' ? 'Chargement...' : 'Miandry...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section Plein Écran */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          {pageBackground?.image_url && pageBackground.is_active ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${pageBackground.image_url})` }}
              />
              <div className="absolute inset-0" style={overlayStyle} />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
          )}
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 py-16 md:py-20">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-6 md:mb-8 border border-white/20">
            <Heart className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-medium text-white">Y-Mad Madagascar</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight drop-shadow-lg">
            {language === 'fr' ? 'Actualités et Blog' : 'Vaovao sy Bitsika'}
          </h1>
          
          <p className="text-base md:text-lg lg:text-xl text-white max-w-2xl mx-auto px-4 drop-shadow-md">
            {language === 'fr' 
              ? 'Suivez nos actions et découvrez nos dernières actualités'
              : 'Araho ny asantsika ary jereo ny vaovao farany'}
          </p>
          
          <div className="mt-6 md:mt-8 flex flex-wrap gap-3 justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 md:px-6 py-1.5 md:py-2 border border-white/20">
              <p className="text-white font-semibold text-sm">{stats.total} {language === 'fr' ? 'Articles' : 'Lahatsoratra'}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 md:px-6 py-1.5 md:py-2 border border-white/20">
              <p className="text-white font-semibold text-sm">{stats.categories} {language === 'fr' ? 'Catégories' : 'Sokajy'}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 md:px-6 py-1.5 md:py-2 border border-white/20">
              <p className="text-white font-semibold text-sm">{stats.totalViews} {language === 'fr' ? 'Vues' : 'Fijeriana'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Principale */}
      <div className="relative z-10 bg-white rounded-t-3xl shadow-2xl -mt-6 md:-mt-10">
        
        {/* Statistiques */}
        <div className="border-b border-gray-100 py-8 md:py-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              <div className="text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-blue-700">{stats.total}</p>
                <p className="text-xs md:text-sm text-gray-500 mt-1">{language === 'fr' ? 'Articles' : 'Lahatsoratra'}</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <FolderOpen className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-blue-700">{stats.categories}</p>
                <p className="text-xs md:text-sm text-gray-500 mt-1">{language === 'fr' ? 'Catégories' : 'Sokajy'}</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <Eye className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-blue-700">{stats.totalViews}</p>
                <p className="text-xs md:text-sm text-gray-500 mt-1">{language === 'fr' ? 'Vues totales' : 'Fijeriana rehetra'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm py-3 md:py-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map(cat => {
                  const isActive = selectedCategory === cat;
                  const CategoryIcon = getCategoryIcon(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`inline-flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {CategoryIcon}
                      {cat}
                    </button>
                  );
                })}
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={language === 'fr' ? 'Rechercher un article...' : 'Karohy lahatsoratra...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 md:py-2 border border-gray-300 rounded-full w-56 md:w-64 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>
            
            {(searchTerm || selectedCategory !== (language === 'fr' ? "Tous" : "Rehetra")) && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 justify-center">
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                    <Search className="w-3 h-3" /> {searchTerm}
                    <button onClick={() => setSearchTerm('')} className="hover:text-red-500 transition">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategory !== (language === 'fr' ? "Tous" : "Rehetra") && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory(language === 'fr' ? "Tous" : "Rehetra")} className="hover:text-red-500 transition">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedCategory(language === 'fr' ? "Tous" : "Rehetra"); }} 
                  className="text-xs text-blue-600 hover:underline transition"
                >
                  {language === 'fr' ? 'Tout effacer' : 'Fafana daholo'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Liste des articles avec images */}
        <div className="py-12 md:py-16">
          <div className="max-w-5xl mx-auto px-4">
            {paginatedPosts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 md:p-16 text-center border border-gray-100">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  {language === 'fr' ? 'Aucun article trouvé' : 'Tsy misy lahatsoratra hita'}
                </p>
                <p className="text-gray-400 text-sm">
                  {language === 'fr' ? 'Essayez de modifier vos critères de recherche' : 'Andramo hanova ny fikarohanao'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {paginatedPosts.map((post) => {
                    const displayTitle = language === 'fr' ? post.title : (post.title_mg || post.title);
                    const displaySummary = language === 'fr' ? post.summary : (post.summary_mg || post.summary);
                    const postCategory = typeToCategory[post.type] || 'Actualités';
                    const CategoryIcon = getCategoryIcon(postCategory);
                    
                    return (
                      <div 
                        key={post.id}
                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer group"
                      >
                        <div className="flex flex-col md:flex-row gap-5 p-5">
                          {/* Image de couverture */}
                          <div className="flex-shrink-0 md:w-48 h-32 md:h-auto rounded-lg overflow-hidden bg-gray-100">
                            {post.image_url ? (
                              <img 
                                src={post.image_url} 
                                alt={displayTitle}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                                <BookOpen className="w-8 h-8 text-blue-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* Contenu */}
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> {formatDate(post.published_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" /> {post.author}
                              </span>
                              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                {CategoryIcon} {postCategory}
                              </span>
                              <span className="flex items-center gap-1 text-gray-400">
                                <Eye className="w-3 h-3" /> {post.views} {language === 'fr' ? 'vues' : 'fijeriana'}
                              </span>
                            </div>
                            
                            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                              {displayTitle}
                            </h2>
                            
                            <p className="text-gray-600 text-sm mb-3 leading-relaxed line-clamp-3">
                              {displaySummary}
                            </p>
                            
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {post.tags && post.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                  <Tag className="w-2.5 h-2.5" /> {tag}
                                </span>
                              ))}
                              {post.tags && post.tags.length > 3 && (
                                <span className="text-xs text-gray-400">+{post.tags.length - 3}</span>
                              )}
                            </div>
                            
                            <button 
                              onClick={() => openPostDetails(post)}
                              className="text-blue-600 font-medium text-sm hover:text-blue-700 inline-flex items-center gap-1 transition-all duration-200 hover:gap-2 group-hover:gap-2"
                            >
                              {language === 'fr' ? 'Lire la suite' : 'Hamaky bebe kokoa'} 
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded-lg transition ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="px-2 py-1 text-gray-400">...</span>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className={`px-3 py-1 rounded-lg transition border border-gray-300 hover:bg-gray-50`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Détails Article - Comme dans la page projets */}
      {showModal && selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            
            {/* En-tête du modal */}
            <div className="sticky top-0 bg-white p-5 border-b flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {language === 'fr' ? selectedPost.title : (selectedPost.title_mg || selectedPost.title)}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(selectedPost.published_at)} • {selectedPost.author}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Image de couverture */}
            {selectedPost.image_url && (
              <div className="p-6">
                <img 
                  src={selectedPost.image_url} 
                  alt={language === 'fr' ? selectedPost.title : (selectedPost.title_mg || selectedPost.title)}
                  className="w-full h-[400px] object-cover rounded-xl shadow-lg"
                />
              </div>
            )}

            {/* Métadonnées détaillées */}
            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {formatDate(selectedPost.published_at)}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" /> {selectedPost.author}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {formatReadingTime(selectedPost.content)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" /> {selectedPost.views} {language === 'fr' ? 'vues' : 'fijeriana'}
                </span>
              </div>
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedPost.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Contenu texte */}
            <div className="p-6 border-t bg-gray-50">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">
                {language === 'fr' ? 'Contenu de l\'article' : 'Votoatin\'ny lahatsoratra'}
              </h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap prose prose-lg max-w-none">
                {language === 'fr' ? selectedPost.content : (selectedPost.content_mg || selectedPost.content)}
              </div>
            </div>

            {/* Section Partage */}
            <div className="p-6 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {language === 'fr' ? 'Partager cet article' : 'Zaraina ity lahatsoratra ity'}
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1877f2] text-white rounded-full hover:bg-[#1877f2]/90 transition shadow-sm"
                >
                  <Facebook className="w-4 h-4" />
                  <span className="text-sm">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1da1f2] text-white rounded-full hover:bg-[#1da1f2]/90 transition shadow-sm"
                >
                  <Twitter className="w-4 h-4" />
                  <span className="text-sm">Twitter</span>
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0077b5] text-white rounded-full hover:bg-[#0077b5]/90 transition shadow-sm"
                >
                  <Linkedin className="w-4 h-4" />
                  <span className="text-sm">LinkedIn</span>
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                  <span className="text-sm">{copied ? 'Copié !' : 'Copier le lien'}</span>
                </button>
              </div>
            </div>

            {/* Call to Action */}
            <div className="p-6 border-t bg-gradient-to-r from-blue-50 to-blue-100 rounded-b-2xl">
              <div className="text-center">
                <Heart className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {language === 'fr' ? 'Cet article vous a plu ?' : 'Nahafinaritra anao ve ity lahatsoratra ity?'}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {language === 'fr' 
                    ? 'Partagez-le autour de vous et rejoignez notre mission.'
                    : 'Zarao amin\'ny manodidina anao ary miaraha amin\'ny asantsika.'}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link 
                    href="/blog" 
                    className="inline-flex items-center gap-2 px-5 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition shadow-sm"
                    onClick={() => setShowModal(false)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {language === 'fr' ? 'Voir tous les articles' : 'Jereo ny lahatsoratra rehetra'}
                  </Link>
                  <Link 
                    href="/donate" 
                    className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm"
                    onClick={() => setShowModal(false)}
                  >
                    <Heart className="w-4 h-4" />
                    {language === 'fr' ? 'Soutenir Y-Mad' : 'Hanohana ny Y-Mad'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}