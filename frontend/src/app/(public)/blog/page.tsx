// frontend/src/app/(public)/blog/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, Calendar, User, Heart, X, Image as ImageIcon, 
  ChevronRight, Grid3x3, LayoutList, Sparkles, TrendingUp, 
  Globe, ArrowRight, Target, BookOpen, Leaf, 
  Briefcase, UsersRound, Palette, GraduationCap, 
  Stethoscope, Sprout, Handshake, Loader2, Eye, Clock,
  Facebook, Twitter, Linkedin, Link as LinkIcon, Check, Send, Award
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { pageService, PageBackground } from '@/services/page.service';
import { api } from '@/lib/api';

// ============================================================
// INTERFACES
// ============================================================

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
  authorUser?: { first_name: string; last_name: string };
  author?: string;
  tags: string[];
  views: number;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

// ============================================================
// CATEGORIES DU BLOG
// ============================================================

const categories = [
  { value: 'news', labelFr: 'Actualites', labelMg: 'Vaovao', icon: Newspaper },
  { value: 'success_story', labelFr: 'Success story', labelMg: 'Fahombiazana', icon: Heart },
  { value: 'testimonial', labelFr: 'Temoignages', labelMg: 'Fijoroana vavolombelona', icon: UsersRound },
  { value: 'report', labelFr: 'Rapports', labelMg: 'Tatitra', icon: BookOpen },
  { value: 'event_recap', labelFr: 'Evenements', labelMg: 'Hetsika', icon: CalendarIcon },
];

// ============================================================
// ICONES PERSONNALISEES
// ============================================================

function Newspaper(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" />
      <path d="M15 18h-5" />
      <path d="M10 6h8v4h-8V6Z" />
    </svg>
  );
}

function CalendarIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function BlogPage() {
  const router = useRouter();
  const { language } = useLanguage();
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  const [copied, setCopied] = useState(false);

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  useEffect(() => {
    loadPageBackground();
    loadPosts();
  }, []);

  const loadPageBackground = async () => {
    try {
      const background = await pageService.getPageBackground('blog');
      if (background && background.is_active && background.image_url) {
        setPageBackground(background);
      }
    } catch (error) {
      console.error('Erreur chargement fond d ecran:', error);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/blog/public');
      let allPosts = response.data.data || response.data || [];
      const publishedPosts = allPosts.filter((p: BlogPost) => p.status === 'published');
      setPosts(publishedPosts);
      setFilteredPosts(publishedPosts);
    } catch (error) {
      console.error('Erreur chargement articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPostDetails = (post: BlogPost) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const handleReadMore = (slug: string) => {
    router.push(`/blog/${slug}`);
  };

  useEffect(() => {
    let filtered = [...posts];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.title_fr.toLowerCase().includes(term) ||
        (p.title_mg && p.title_mg.toLowerCase().includes(term)) ||
        p.summary_fr.toLowerCase().includes(term) ||
        (p.summary_mg && p.summary_mg.toLowerCase().includes(term))
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p.type === selectedCategory);
    }
    
    setFilteredPosts(filtered);
  }, [searchTerm, selectedCategory, posts]);

  const getMainImageUrl = (post: BlogPost): string => {
    return post.image_url || '/images/placeholder-blog.jpg';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return getText('Date non disponible', 'Tsy misy daty');
    try {
      return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const formatReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content?.split(/\s/g).length || 0;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return getText(`${minutes} min de lecture`, `${minutes} min famakiana`);
  };

  const getCategoryIcon = (categoryValue: string) => {
    const cat = categories.find(c => c.value === categoryValue);
    if (!cat) return BookOpen;
    return cat.icon;
  };

  const getCategoryLabel = (categoryValue: string) => {
    const cat = categories.find(c => c.value === categoryValue);
    if (!cat) return categoryValue;
    return language === 'fr' ? cat.labelFr : cat.labelMg;
  };

  const getPostTitle = (post: BlogPost) => {
    return language === 'fr' ? post.title_fr : (post.title_mg || post.title_fr);
  };

  const getPostSummary = (post: BlogPost) => {
    return language === 'fr' ? post.summary_fr : (post.summary_mg || post.summary_fr);
  };

  const getAuthorName = (post: BlogPost): string => {
    if (post.authorUser?.first_name) {
      return `${post.authorUser.first_name} ${post.authorUser.last_name || ''}`.trim();
    }
    if (post.author) return post.author;
    return 'Y-MaD';
  };

  const stats = {
    total: posts.length,
    categories: new Set(posts.map(p => p.type)).size,
    totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0),
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = selectedPost ? getPostTitle(selectedPost) : '';

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
          <Loader2 className="w-12 h-12 text-blue-800 animate-spin mx-auto mb-4" />
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
              'Decouvrez nos dernieres actualites et histoires inspirantes',
              'Jereo ny vaovao farany sy ny tantara manentana fanahy'
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
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-800" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-gray-500">{getText('Articles publies', 'Lahatsoratra navoaka')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-800" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.categories}</p>
              <p className="text-gray-500">{getText('Categories', 'Sokajy')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-blue-800" />
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.totalViews.toLocaleString()}</p>
              <p className="text-gray-500">{getText('Vues totales', 'Fijeriana rehetra')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== FILTRES ET LISTE ==================== */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {getText('Derniers articles', 'Lahatsoratra farany')}
          </h2>
          <div className="w-20 h-1 bg-blue-800 mx-auto rounded-full"></div>
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
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none bg-white cursor-pointer"
              >
                <option value="">{getText('Toutes les categories', 'Sokajy rehetra')}</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {language === 'fr' ? cat.labelFr : cat.labelMg}
                  </option>
                ))}
              </select>
              
              <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 px-3 ${viewMode === 'grid' ? 'bg-blue-800 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 px-3 ${viewMode === 'list' ? 'bg-blue-800 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {(searchTerm || selectedCategory) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              {searchTerm && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs">
                  {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="hover:text-red-500">✕</button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs">
                  {getCategoryLabel(selectedCategory)}
                  <button onClick={() => setSelectedCategory('')} className="hover:text-red-500">✕</button>
                </span>
              )}
              <button onClick={() => { setSearchTerm(''); setSelectedCategory(''); }} className="text-xs text-blue-800 hover:underline">
                {getText('Tout effacer', 'Fafana daholo')}
              </button>
            </div>
          )}
        </div>

        {/* Resultats */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-blue-800">{filteredPosts.length}</span> {getText(' article(s) trouve(s)', ' lahatsoratra hita')}
          </p>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md py-16 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{getText('Aucun article trouve', 'Tsy misy lahatsoratra hita')}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const CategoryIcon = getCategoryIcon(post.type);
              return (
                <div 
                  key={post.id}
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl cursor-pointer border border-gray-100 transition-all duration-300 hover:-translate-y-1"
                  onClick={() => openPostDetails(post)}
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {getMainImageUrl(post) !== '/images/placeholder-blog.jpg' ? (
                      <img src={getMainImageUrl(post)} alt={getPostTitle(post)} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                        <ImageIcon className="w-12 h-12 text-blue-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-800 text-white">
                        <CategoryIcon className="w-3 h-3" /> {getCategoryLabel(post.type)}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(post.published_at || post.created_at)}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {post.views}</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-800 transition">
                      {getPostTitle(post)}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{getPostSummary(post)}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-blue-800 font-medium text-sm flex items-center gap-1">
                        {getText('Lire la suite', 'Hamaky bebe kokoa')} <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const CategoryIcon = getCategoryIcon(post.type);
              return (
                <div 
                  key={post.id}
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg cursor-pointer flex flex-col md:flex-row border border-gray-100"
                  onClick={() => openPostDetails(post)}
                >
                  <div className="md:w-48 h-32 bg-gray-100 relative">
                    {getMainImageUrl(post) !== '/images/placeholder-blog.jpg' ? (
                      <img src={getMainImageUrl(post)} alt={getPostTitle(post)} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50">
                        <ImageIcon className="w-8 h-8 text-blue-300" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-800 text-white">
                        <CategoryIcon className="w-3 h-3" /> {getCategoryLabel(post.type)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 p-5">
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(post.published_at || post.created_at)}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {post.views}</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-blue-800 transition">
                      {getPostTitle(post)}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{getPostSummary(post)}</p>
                    <div className="mt-2">
                      <span className="text-blue-800 font-medium text-sm flex items-center gap-1">
                        {getText('Lire la suite', 'Hamaky bebe kokoa')} <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================== CTA SECTION ==================== */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 py-16 mt-10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Award className="w-12 h-12 text-blue-300 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {getText('Restez informes', 'Mijanona ho voa vaovao')}
          </h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            {getText(
              'Abonnez-vous pour recevoir nos dernieres actualites',
              'Misoratra anarana hahazo ny vaovao farany'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder={getText('Votre email', 'Ny mailakao')}
              className="flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:ring-white outline-none bg-white"
            />
            <button className="bg-white text-blue-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> {getText("S'abonner", 'Misoratra')}
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MODAL ARTICLE ==================== */}
      {showModal && selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            
            <div className="sticky top-0 bg-white p-5 border-b flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{getPostTitle(selectedPost)}</h2>
                <p className="text-sm text-gray-500">
                  {formatDate(selectedPost.published_at || selectedPost.created_at)} • {getAuthorName(selectedPost)}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            {selectedPost.image_url && (
              <div className="p-6">
                <img src={selectedPost.image_url} alt={getPostTitle(selectedPost)} className="w-full h-[350px] object-cover rounded-xl shadow-lg" />
              </div>
            )}

            <div className="p-6 border-t bg-gray-50">
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
                <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {selectedPost.views} {getText('vues', 'fijeriana')}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatReadingTime(selectedPost.content_fr)}</span>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 mb-6 border-l-4 border-blue-800">
                <p className="text-gray-700 italic">{getPostSummary(selectedPost)}</p>
              </div>
              <div className="prose prose-lg max-w-none text-gray-700">
                <div dangerouslySetInnerHTML={{ __html: selectedPost.content_fr }} />
              </div>
            </div>

            <div className="p-6 border-t flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => handleReadMore(selectedPost.slug)}
                className="bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition"
              >
                {getText('Lire la suite', 'Hamaky bebe kokoa')}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                {getText('Fermer', 'Hidy')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .prose {
          max-width: none;
        }
        .prose h1, .prose h2, .prose h3, .prose h4 {
          color: #1f2937;
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .prose p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        .prose ul, .prose ol {
          margin: 1rem 0 1rem 1.5rem;
        }
        .prose li {
          margin: 0.25rem 0;
        }
        .prose blockquote {
          border-left: 4px solid #1E3A8A;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #4b5563;
          font-style: italic;
        }
        .prose a {
          color: #1E3A8A;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}