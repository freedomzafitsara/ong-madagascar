'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calendar, User, Search, Tag, Sparkles, X, ChevronLeft, ChevronRight, 
  Eye, BookOpen, FolderOpen, GraduationCap, Leaf, 
  Calendar as CalendarIcon, Briefcase, Heart, Newspaper,
  Loader2, AlertCircle, Clock, Facebook, Twitter,
  Linkedin, Link as LinkIcon, Check, ArrowLeft
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { pageService, PageBackground } from '@/services/page.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

interface BlogPost {
  id: string;
  title_fr: string;
  title_mg?: string | null;
  slug: string;
  summary_fr: string;
  summary_mg?: string | null;
  content_fr: string;
  content_mg?: string | null;
  type: string;
  image_url: string | null;
  status: string;
  author_id: string;
  author?: { first_name: string; last_name: string };
  tags: string[];
  views: number;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

// Categories disponibles
const categoriesFr = ["Tous", "Actualites", "Environnement", "Evenements", "Agriculture", "Education", "Sante", "Social"];
const categoriesMg = ["Rehetra", "Vaovao", "Tontolo iainana", "Hetsika", "Fambolena", "Fampianarana", "Fahasalamana", "Sosialy"];

// Mapping des types d'articles vers categories
const typeToCategory: Record<string, string> = {
  'news': 'Actualites',
  'success_story': 'Social',
  'report': 'Actualites',
};

// Mapping des icones par categorie
const getCategoryIcon = (category: string) => {
  const icons: Record<string, any> = {
    'Actualites': Newspaper,
    'Environnement': Leaf,
    'Evenements': CalendarIcon,
    'Agriculture': Briefcase,
    'Education': GraduationCap,
    'Sante': Heart,
    'Social': Heart,
  };
  const Icon = icons[category];
  return Icon ? <Icon className="w-3 h-3" /> : <FolderOpen className="w-3 h-3" />;
};

export default function BlogPage() {
  const { language } = useLanguage();
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
      'Rehetra': 'Tous', 'Vaovao': 'Actualites', 'Tontolo iainana': 'Environnement',
      'Hetsika': 'Evenements', 'Fambolena': 'Agriculture', 'Fampianarana': 'Education',
      'Fahasalamana': 'Sante', 'Sosialy': 'Social'
    };
    return mapping[categoryMg] || categoryMg;
  };

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  const openPostDetails = (post: BlogPost) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const loadPageBackground = useCallback(async () => {
    try {
      const background = await pageService.getPageBackground('blog');
      if (background && background.is_active && background.image_url) {
        setPageBackground(background);
      }
    } catch (error) {
      console.error('Erreur chargement fond d ecran:', error);
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
            title_fr: p.title_fr,
            title_mg: p.title_mg,
            slug: p.slug,
            summary_fr: p.summary_fr,
            summary_mg: p.summary_mg,
            content_fr: p.content_fr,
            content_mg: p.content_mg,
            type: p.type,
            image_url: p.image_url,
            status: p.status,
            author_id: p.author_id,
            author: p.author,
            tags: p.tags || [],
            views: p.views || 0,
            is_published: p.is_published,
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
        (language === 'fr' ? p.title_fr : (p.title_mg || p.title_fr)).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (language === 'fr' ? p.summary_fr : (p.summary_mg || p.summary_fr)).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== (language === 'fr' ? "Tous" : "Rehetra")) {
      const categoryToFilter = language === 'fr' ? selectedCategory : getCategoryFr(selectedCategory);
      filtered = filtered.filter(p => {
        const postCategory = typeToCategory[p.type] || 'Actualites';
        return postCategory === categoryToFilter;
      });
    }
    
    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, posts, language]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return getText('Date non disponible', 'Tsy misy daty');
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
    return getText(`${minutes} min de lecture`, `${minutes} min famakiana`);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = selectedPost ? (language === 'fr' ? selectedPost.title_fr : (selectedPost.title_mg || selectedPost.title_fr)) : '';

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
    categories: new Set(posts.map(p => typeToCategory[p.type] || 'Actualites')).size,
    totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0)
  }), [posts]);

  // Style fond d ecran PLEIN ECRAN avec effet parallaxe
  const heroBackgroundStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundImage: `url(${pageBackground.image_url})`,
    backgroundPosition: pageBackground.position || 'center',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
  } : {};

  const heroOverlayStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundColor: `rgba(0, 0, 0, ${(pageBackground.overlay_opacity || 35) / 100})`,
  } : {};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{getText('Chargement...', 'Miandry...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ==================== HERO SECTION - PLEIN ECRAN ==================== */}
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {pageBackground?.image_url && pageBackground.is_active ? (
            <>
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed" style={heroBackgroundStyle} />
              <div className="absolute inset-0" style={heroOverlayStyle} />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-900 to-gray-900" />
          )}
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span className="text-sm font-medium text-white">Y-MaD Madagascar</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-2xl">
            {getText('Actualites et Blog', 'Vaovao sy Bitsika')}
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-blue-100 max-w-2xl mx-auto">
            {getText(
              'Suivez nos actions et decouvrez nos dernieres actualites',
              'Araho ny asantsika ary jereo ny vaovao farany'
            )}
          </p>
          
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-7 h-11 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1.5 h-2.5 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== STATISTIQUES ==================== */}
      <div className="bg-white rounded-t-3xl shadow-2xl -mt-10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-sm text-gray-500">{getText('Articles', 'Lahatsoratra')}</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FolderOpen className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.categories}</p>
              <p className="text-sm text-gray-500">{getText('Categories', 'Sokajy')}</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Eye className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.totalViews}</p>
              <p className="text-sm text-gray-500">{getText('Vues totales', 'Fijeriana rehetra')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SECTION FILTRES ==================== */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {getText('Derniers articles', 'Lahatsoratra farany')}
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={getText('Rechercher un article...', 'Karohy lahatsoratra...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
              >
                <option value="">{getText('Toutes les categories', 'Sokajy rehetra')}</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {(searchTerm || selectedCategory !== (language === 'fr' ? "Tous" : "Rehetra")) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              {searchTerm && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs">
                  {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="hover:text-red-500">✕</button>
                </span>
              )}
              {selectedCategory !== (language === 'fr' ? "Tous" : "Rehetra") && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory(language === 'fr' ? "Tous" : "Rehetra")} className="hover:text-red-500">✕</button>
                </span>
              )}
              <button onClick={() => { setSearchTerm(''); setSelectedCategory(language === 'fr' ? "Tous" : "Rehetra"); }} className="text-xs text-blue-600 hover:underline">
                {getText('Tout effacer', 'Fafana daholo')}
              </button>
            </div>
          )}
        </div>

        {/* Liste des articles */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md py-16 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{getText('Aucun article trouve', 'Tsy misy lahatsoratra hita')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {paginatedPosts.map((post) => {
              const displayTitle = language === 'fr' ? post.title_fr : (post.title_mg || post.title_fr);
              const displaySummary = language === 'fr' ? post.summary_fr : (post.summary_mg || post.summary_fr);
              const postCategory = typeToCategory[post.type] || 'Actualites';
              const CategoryIcon = getCategoryIcon(postCategory);
              const authorName = post.author ? `${post.author.first_name} ${post.author.last_name}` : 'Y-MaD';
              
              return (
                <div 
                  key={post.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition border border-gray-100 overflow-hidden cursor-pointer group"
                  onClick={() => openPostDetails(post)}
                >
                  <div className="flex flex-col md:flex-row gap-5 p-5">
                    <div className="flex-shrink-0 md:w-48 h-32 md:h-auto rounded-lg overflow-hidden bg-gray-100">
                      {post.image_url ? (
                        <img src={post.image_url} alt={displayTitle} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                          <BookOpen className="w-8 h-8 text-blue-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(post.published_at)}</span>
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {authorName}</span>
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          {CategoryIcon} {postCategory}
                        </span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views} {getText('vues', 'fijeriana')}</span>
                      </div>
                      
                      <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 line-clamp-1">
                        {displayTitle}
                      </h2>
                      
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed line-clamp-2">
                        {displaySummary}
                      </p>
                      
                      <span className="text-blue-600 font-medium text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
                        {getText('Lire la suite', 'Hamaky bebe kokoa')} <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ==================== CTA SECTION ==================== */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 py-16 mt-10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Heart className="w-12 h-12 text-blue-300 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {getText('Suivez notre actualite', 'Araho ny vaovao ataonay')}
          </h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            {getText(
              'Ne manquez aucune de nos actions et decouvertes',
              'Aza adino ny hetsika sy zava-baovao ataonay'
            )}
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-blue-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            {getText('Nous contacter', 'Mifandraisa aminay')} <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}