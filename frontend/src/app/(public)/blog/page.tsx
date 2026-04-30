'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, User, Search, Tag, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

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

// Catégories disponibles
const categoriesFr = ["Tous", "Actualités", "Environnement", "Événements", "Agriculture", "Éducation", "Santé", "Social"];
const categoriesMg = ["Rehetra", "Vaovao", "Tontolo iainana", "Hetsika", "Fambolena", "Fampianarana", "Fahasalamana", "Sosialy"];

// Données par défaut
const defaultPosts: BlogPost[] = [
  { id: '1', title: "Lancement du projet Éducation pour tous", slug: "lancement-education-pour-tous", excerpt: "Nous avons officiellement lancé notre nouveau programme éducatif dans la région d'Analamanga...", date: "15 Avril 2025", author: "Marie Rakoto", category: "Actualités", tags: ["Éducation", "Enfants"], viewsCount: 245 },
  { id: '2', title: "1000 arbres plantés en un mois", slug: "1000-arbres-plantes", excerpt: "Grâce à nos bénévoles, nous avons atteint un nouveau record de plantation...", date: "10 Avril 2025", author: "Jean Randria", category: "Environnement", tags: ["Reforestation", "Bénévoles"], viewsCount: 189 },
  { id: '3', title: "Retour sur notre campagne de collecte", slug: "campagne-collecte", excerpt: "La campagne de collecte de fonds a été un franc succès...", date: "5 Avril 2025", author: "Sarah Andria", category: "Événements", tags: ["Collecte", "Dons"], viewsCount: 312 },
  { id: '4', title: "Formation des agriculteurs à Toamasina", slug: "formation-agriculteurs-toamasina", excerpt: "Un atelier de formation sur les techniques agricoles durables...", date: "28 Mars 2025", author: "Paul Rasoa", category: "Agriculture", tags: ["Agriculture", "Formation"], viewsCount: 156 },
  { id: '5', title: "Nouveau partenariat avec l'Ambassade de France", slug: "partenariat-ambassade-france", excerpt: "Un accord de partenariat pour soutenir l'entrepreneuriat jeune...", date: "20 Mars 2025", author: "Marie Rakoto", category: "Actualités", tags: ["Partenariat", "Entrepreneuriat"], viewsCount: 98 },
  { id: '6', title: "Mission santé à Mahajanga", slug: "mission-sante-mahajanga", excerpt: "Une caravane médicale pour offrir des soins gratuits...", date: "15 Mars 2025", author: "Dr. Rabe", category: "Santé", tags: ["Santé", "Médical"], viewsCount: 234 },
];

export default function BlogPage() {
  const { t, language } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(language === 'fr' ? "Tous" : "Rehetra");
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Obtenir les catégories selon la langue
  const categories = language === 'fr' ? categoriesFr : categoriesMg;

  // Obtenir le libellé de catégorie en français pour le filtrage
  const getCategoryFr = (categoryMg: string): string => {
    const mapping: Record<string, string> = {
      'Rehetra': 'Tous',
      'Vaovao': 'Actualités',
      'Tontolo iainana': 'Environnement',
      'Hetsika': 'Événements',
      'Fambolena': 'Agriculture',
      'Fampianarana': 'Éducation',
      'Fahasalamana': 'Santé',
      'Sosialy': 'Social'
    };
    return mapping[categoryMg] || categoryMg;
  };

  // Chargement du fond d'écran
  const loadBgImage = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/page-bg?page=blog');
      if (response.ok) {
        const data = await response.json();
        if (data.url) setBgImage(data.url);
      }
    } catch (error) {
      console.error('Erreur chargement fond:', error);
    }
  }, []);

  // Chargement des articles
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
    loadBgImage();
    loadPosts();
  }, [loadBgImage, loadPosts]);

  // Réinitialiser la catégorie sélectionnée quand la langue change
  useEffect(() => {
    setSelectedCategory(language === 'fr' ? "Tous" : "Rehetra");
  }, [language]);

  // Filtrage des articles
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

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = useMemo(() => ({
    total: posts.length,
    categories: new Set(posts.map(p => p.category)).size,
    totalViews: posts.reduce((sum, p) => sum + p.viewsCount, 0)
  }), [posts]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ymad-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ymad-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ymad-gray-50">
      {/* Hero Section avec fond dynamique */}
      <div className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden">
        {bgImage ? (
          <>
            <img src={bgImage} alt="Fond blog" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/50"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-ymad-blue-800 to-ymad-blue-900">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          </div>
        )}
        
        <div className="relative z-10 text-center text-white px-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-4 h-4 text-ymad-blue-300" />
            <span className="text-sm">Y-Mad Madagascar</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('blog.title')}</h1>
          <p className="text-lg text-ymad-blue-100 max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Suivez nos actions et découvrez nos dernières actualités'
              : 'Araho ny asantsika ary jereo ny vaovao farany'}
          </p>
        </div>
      </div>

      {/* Statistiques */}
      {stats.total > 0 && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <StatCard value={stats.total} label={language === 'fr' ? 'Articles' : 'Lahatsoratra'} />
              <StatCard value={stats.categories} label={language === 'fr' ? 'Catégories' : 'Sokajy'} />
              <StatCard value={stats.totalViews} label={language === 'fr' ? 'Vues totales' : 'Fijeriana rehetra'} />
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm transition cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-ymad-blue-600 text-white' 
                      : 'bg-ymad-gray-100 text-ymad-gray-700 hover:bg-ymad-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ymad-gray-400" size={18} />
              <input
                type="text"
                placeholder={language === 'fr' ? 'Rechercher un article...' : 'Karohy lahatsoratra...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-ymad-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-ymad-blue-500 focus:border-ymad-blue-500 outline-none"
              />
            </div>
          </div>
          
          {/* Filtres actifs */}
          {(searchTerm || selectedCategory !== (language === 'fr' ? "Tous" : "Rehetra")) && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-ymad-gray-100">
              {searchTerm && (
                <FilterChip label={`🔍 ${searchTerm}`} onRemove={() => setSearchTerm('')} language={language} />
              )}
              {selectedCategory !== (language === 'fr' ? "Tous" : "Rehetra") && (
                <FilterChip label={`📂 ${selectedCategory}`} onRemove={() => setSelectedCategory(language === 'fr' ? "Tous" : "Rehetra")} language={language} />
              )}
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory(language === 'fr' ? "Tous" : "Rehetra"); }} 
                className="text-sm text-ymad-blue-600 hover:underline"
              >
                {language === 'fr' ? 'Tout effacer' : 'Fafana daholo'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Liste des articles */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          {paginatedPosts.length === 0 ? (
            <EmptyState language={language} />
          ) : (
            <>
              {paginatedPosts.map((post) => (
                <ArticleCard key={post.id} post={post} language={language} />
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

// ==================== SOUS-COMPOSANTS ====================

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-ymad-blue-800">{value}</p>
      <p className="text-sm text-ymad-gray-500">{label}</p>
    </div>
  );
}

function FilterChip({ label, onRemove, language }: { label: string; onRemove: () => void; language: 'fr' | 'mg' }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-ymad-gray-100 rounded-full text-sm text-ymad-gray-700">
      {label}
      <button onClick={onRemove} className="hover:text-red-500"><X className="w-3 h-3" /></button>
    </span>
  );
}

function EmptyState({ language }: { language: 'fr' | 'mg' }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-ymad-gray-100">
      <div className="text-6xl mb-4">📰</div>
      <p className="text-ymad-gray-500 text-lg mb-2">
        {language === 'fr' ? 'Aucun article trouvé' : 'Tsy misy lahatsoratra hita'}
      </p>
      <p className="text-ymad-gray-400">
        {language === 'fr' ? 'Essayez de modifier vos critères de recherche' : 'Andramo hanova ny fikarohanao'}
      </p>
    </div>
  );
}

function ArticleCard({ post, language }: { post: BlogPost; language: 'fr' | 'mg' }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 hover:shadow-md transition border border-ymad-gray-100">
      <div className="flex flex-wrap gap-4 text-sm text-ymad-gray-500 mb-3">
        <span className="flex items-center gap-1"><Calendar size={14} />{post.date}</span>
        <span className="flex items-center gap-1"><User size={14} />{post.author}</span>
        <span className="bg-ymad-blue-100 text-ymad-blue-700 px-2 py-0.5 rounded-full text-xs">{post.category}</span>
        <span className="flex items-center gap-1 text-xs text-ymad-gray-400">👁️ {post.viewsCount} {language === 'fr' ? 'vues' : 'fijeriana'}</span>
      </div>
      <h2 className="text-xl font-bold text-ymad-gray-800 mb-2">{post.title}</h2>
      <p className="text-ymad-gray-600 mb-4">{post.excerpt}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map(tag => (
          <span key={tag} className="text-xs bg-ymad-gray-100 text-ymad-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
            <Tag size={10} />{tag}
          </span>
        ))}
      </div>
      <Link href={`/blog/${post.slug || post.id}`} className="text-ymad-blue-600 font-semibold hover:text-ymad-blue-700 inline-flex items-center gap-1 transition">
        {language === 'fr' ? 'Lire la suite →' : 'Hamaky bebe kokoa →'}
      </Link>
    </div>
  );
}

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
    <div className="flex justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border border-ymad-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ymad-gray-50 transition"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      {getPageNumbers().map((page, idx) => (
        page === -1 ? (
          <span key={`sep-${idx}`} className="px-2 py-1 text-ymad-gray-400">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-lg transition ${
              currentPage === page
                ? 'bg-ymad-blue-600 text-white'
                : 'border border-ymad-gray-300 hover:bg-ymad-gray-50'
            }`}
          >
            {page}
          </button>
        )
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border border-ymad-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ymad-gray-50 transition"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}