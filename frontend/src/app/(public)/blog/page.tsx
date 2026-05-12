'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calendar, User, Search, Tag, Sparkles, X, ChevronLeft, ChevronRight, 
  Eye, BookOpen, Newspaper, FolderOpen, GraduationCap, Leaf, 
  Calendar as CalendarIcon, Briefcase, Stethoscope, Handshake, 
  Loader2, AlertCircle
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { pageService, PageBackground } from '@/services/pageService';

interface BlogPost {
  id: string;
  title: string;
  titleMg?: string;
  slug: string;
  excerpt: string;
  excerptMg?: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  coverImage?: string;
  viewsCount: number;
}

// Categories disponibles
const categoriesFr = ["Tous", "Actualites", "Environnement", "Evenements", "Agriculture", "Education", "Sante", "Social"];
const categoriesMg = ["Rehetra", "Vaovao", "Tontolo iainana", "Hetsika", "Fambolena", "Fampianarana", "Fahasalamana", "Sosialy"];

// Mapping des icones par categorie
const getCategoryIcon = (category: string) => {
  const icons: Record<string, any> = {
    'Actualites': Newspaper,
    'Environnement': Leaf,
    'Evenements': CalendarIcon,
    'Agriculture': Briefcase,
    'Education': GraduationCap,
    'Sante': Stethoscope,
    'Social': Handshake,
  };
  const Icon = icons[category];
  return Icon ? <Icon className="w-3 h-3" /> : null;
};

// Donnees par defaut
const defaultPosts: BlogPost[] = [
  { id: '1', title: "Lancement du projet Education pour tous", slug: "lancement-education-pour-tous", excerpt: "Nous avons officiellement lance notre nouveau programme educatif dans la region d'Analamanga...", date: "15 Avril 2025", author: "Marie Rakoto", category: "Actualites", tags: ["Education", "Enfants"], viewsCount: 245 },
  { id: '2', title: "1000 arbres plantes en un mois", slug: "1000-arbres-plantes", excerpt: "Grace a nos benevoles, nous avons atteint un nouveau record de plantation...", date: "10 Avril 2025", author: "Jean Randria", category: "Environnement", tags: ["Reforestation", "Benevoles"], viewsCount: 189 },
  { id: '3', title: "Retour sur notre campagne de collecte", slug: "campagne-collecte", excerpt: "La campagne de collecte de fonds a ete un franc succes...", date: "5 Avril 2025", author: "Sarah Andria", category: "Evenements", tags: ["Collecte", "Dons"], viewsCount: 312 },
  { id: '4', title: "Formation des agriculteurs a Toamasina", slug: "formation-agriculteurs-toamasina", excerpt: "Un atelier de formation sur les techniques agricoles durables...", date: "28 Mars 2025", author: "Paul Rasoa", category: "Agriculture", tags: ["Agriculture", "Formation"], viewsCount: 156 },
  { id: '5', title: "Nouveau partenariat avec l'Ambassade de France", slug: "partenariat-ambassade-france", excerpt: "Un accord de partenariat pour soutenir l'entrepreneuriat jeune...", date: "20 Mars 2025", author: "Marie Rakoto", category: "Actualites", tags: ["Partenariat", "Entrepreneuriat"], viewsCount: 98 },
  { id: '6', title: "Mission sante a Mahajanga", slug: "mission-sante-mahajanga", excerpt: "Une caravane medicale pour offrir des soins gratuits...", date: "15 Mars 2025", author: "Dr. Rabe", category: "Sante", tags: ["Sante", "Medical"], viewsCount: 234 },
];

export default function BlogPage() {
  const { t, language } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(language === 'fr' ? "Tous" : "Rehetra");
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  const loadPageBackground = useCallback(async () => {
    try {
      const background = await pageService.getBackground('blog');
      if (background && background.is_active && background.image_url) {
        setPageBackground(background);
      }
    } catch (error) {
      console.error('Erreur chargement fond d ecran:', error);
    }
  }, []);

  const loadPosts = useCallback(() => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('ymad_blog_posts');
      if (stored) {
        const parsed = JSON.parse(stored);
        const formatted = parsed.map((p: any) => ({
          ...p,
          date: new Date(p.createdAt || p.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'mg-MG', { day: 'numeric', month: 'long', year: 'numeric' })
        }));
        setPosts(formatted);
        setFilteredPosts(formatted);
      } else {
        setPosts(defaultPosts);
        setFilteredPosts(defaultPosts);
        localStorage.setItem('ymad_blog_posts', JSON.stringify(defaultPosts));
      }
    } catch (error) {
      console.error('Erreur chargement articles:', error);
      setPosts(defaultPosts);
      setFilteredPosts(defaultPosts);
    } finally {
      setLoading(false);
    }
  }, [language]);

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
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (selectedCategory !== (language === 'fr' ? "Tous" : "Rehetra")) {
      const categoryToFilter = language === 'fr' ? selectedCategory : getCategoryFr(selectedCategory);
      filtered = filtered.filter(p => p.category === categoryToFilter);
    }
    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, posts, language]);

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = useMemo(() => ({
    total: posts.length,
    categories: new Set(posts.map(p => p.category)).size,
    totalViews: posts.reduce((sum, p) => sum + p.viewsCount, 0)
  }), [posts]);

  const overlayStyle = pageBackground?.image_url && pageBackground.is_active ? {
    backgroundColor: `rgba(0, 0, 0, ${(pageBackground.overlay_opacity || 30) / 100})`,
  } : {};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{language === 'fr' ? 'Chargement...' : 'Miandry...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ==================== HERO SECTION PLEIN ECRAN AVEC TEXTE BLANC ==================== */}
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Fond d'ecran */}
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
            <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-900">
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          )}
        </div>

        {/* Contenu centre avec TEXTE BLANC */}
<div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 py-20">          
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Y-Mad Madagascar</span>
          </div>
          
          {/* Titre principal - TEXTE BLANC */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-2xl animate-fade-in-up">
            {language === 'fr' ? 'Actualites et Blog' : 'Vaovao sy Bitsika'}
          </h1>
          
          {/* Sous-titre - TEXTE BLANC */}
          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Suivez nos actions et decouvrez nos dernieres actualites'
              : 'Araho ny asantsika ary jereo ny vaovao farany'}
          </p>
        </div>
      </section>

      {/* ==================== STATISTIQUES CENTREES ==================== */}
      {stats.total > 0 && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
              {/* Articles */}
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
                <p className="text-sm text-gray-500 mt-1">{language === 'fr' ? 'Articles' : 'Lahatsoratra'}</p>
              </div>
              
              {/* Categories */}
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <FolderOpen className="w-7 h-7 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-blue-700">{stats.categories}</p>
                <p className="text-sm text-gray-500 mt-1">{language === 'fr' ? 'Categories' : 'Sokajy'}</p>
              </div>
              
              {/* Vues totales */}
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <Eye className="w-7 h-7 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-blue-700">{stats.totalViews}</p>
                <p className="text-sm text-gray-500 mt-1">{language === 'fr' ? 'Vues totales' : 'Fijeriana rehetra'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== FILTRES ==================== */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Boutons de categories */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map(cat => {
                const isActive = selectedCategory === cat;
                const CategoryIcon = getCategoryIcon(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
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
            
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={language === 'fr' ? 'Rechercher un article...' : 'Karohy lahatsoratra...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>
          
          {/* Filtres actifs */}
          {(searchTerm || selectedCategory !== (language === 'fr' ? "Tous" : "Rehetra")) && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 justify-center">
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                  <Search className="w-3 h-3" /> {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="hover:text-red-500 transition">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory !== (language === 'fr' ? "Tous" : "Rehetra") && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory(language === 'fr' ? "Tous" : "Rehetra")} className="hover:text-red-500 transition">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory(language === 'fr' ? "Tous" : "Rehetra"); }} 
                className="text-sm text-blue-600 hover:underline transition"
              >
                {language === 'fr' ? 'Tout effacer' : 'Fafana daholo'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================== LISTE DES ARTICLES ==================== */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          {paginatedPosts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-16 text-center border border-gray-100">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {language === 'fr' ? 'Aucun article trouve' : 'Tsy misy lahatsoratra hita'}
              </p>
              <p className="text-gray-400">
                {language === 'fr' ? 'Essayez de modifier vos criteres de recherche' : 'Andramo hanova ny fikarohanao'}
              </p>
            </div>
          ) : (
            <>
              {paginatedPosts.map((post, index) => (
                <ArticleCard key={post.id} post={post} language={language} index={index} />
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={setCurrentPage}
                  language={language}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant Carte Article
function ArticleCard({ post, language, index }: { post: BlogPost; language: 'fr' | 'mg'; index: number }) {
  const CategoryIcon = getCategoryIcon(post.category);
  const delay = `${index * 100}ms`;

  return (
    <div 
      className="bg-white rounded-xl shadow-sm p-6 mb-6 hover:shadow-md transition-all duration-300 border border-gray-100"
      style={{ animation: 'fadeInUp 0.5s ease-out forwards', animationDelay: delay }}
    >
      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
        <span className="inline-flex items-center gap-1">
          <Calendar className="w-4 h-4" /> {post.date}
        </span>
        <span className="inline-flex items-center gap-1">
          <User className="w-4 h-4" /> {post.author}
        </span>
        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
          {CategoryIcon} {post.category}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
          <Eye className="w-3 h-3" /> {post.viewsCount} {language === 'fr' ? 'vues' : 'fijeriana'}
        </span>
      </div>
      
      <h2 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
        <Link href={`/blog/${post.slug || post.id}`}>
          {post.title}
        </Link>
      </h2>
      
      <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            <Tag className="w-3 h-3" /> {tag}
          </span>
        ))}
      </div>
      
      <Link 
        href={`/blog/${post.slug || post.id}`} 
        className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center gap-1 transition-all duration-200 hover:gap-2"
      >
        {language === 'fr' ? 'Lire la suite' : 'Hamaky bebe kokoa'} <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// Composant Pagination
function Pagination({ currentPage, totalPages, onPageChange, language }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void; language: 'fr' | 'mg' }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex justify-center gap-2 mt-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      {getPageNumbers().map((page, idx) => (
        page === -1 ? (
          <span key={`sep-${idx}`} className="px-2 py-1 text-gray-400">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-lg transition ${
              currentPage === page
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        )
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}