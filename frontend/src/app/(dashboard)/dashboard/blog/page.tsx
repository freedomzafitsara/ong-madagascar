// src/app/dashboard/blog/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Eye, Search, CheckCircle, AlertCircle,
  Calendar, User, Globe, FileText, Image as ImageIcon, 
  X, Upload, Heart, Star, Languages
} from 'lucide-react';
import Link from 'next/link';

// Types avec valeurs littérales
type ArticleType = 'news' | 'testimonial' | 'report' | 'success_story' | 'event_recap';
type PostStatus = 'draft' | 'published' | 'archived';

interface BlogPost {
  id: string;
  title: string;
  titleMg: string;
  slug: string;
  excerpt: string;
  excerptMg: string;
  content: string;
  contentMg: string;
  articleType: ArticleType;
  coverImage: string | null;
  status: PostStatus;
  category: string;
  tags: string[];
  author: string;
  authorId: string;
  isTestimonial: boolean;
  beneficiaryId?: string;
  beneficiaryName?: string;
  viewsCount: number;
  publishedAt: string | null;
  createdAt: string;
}

interface FormData {
  title: string;
  titleMg: string;
  excerpt: string;
  excerptMg: string;
  content: string;
  contentMg: string;
  articleType: ArticleType;
  category: string;
  tags: string;
  isTestimonial: boolean;
  beneficiaryName: string;
  status: PostStatus;
}

const articleTypes: { value: ArticleType; label: string; color: string }[] = [
  { value: 'news', label: '📰 Actualité', color: 'bg-blue-100 text-blue-700' },
  { value: 'testimonial', label: '💬 Témoignage', color: 'bg-green-100 text-green-700' },
  { value: 'report', label: '📊 Rapport', color: 'bg-purple-100 text-purple-700' },
  { value: 'success_story', label: '🏆 Success story', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'event_recap', label: '🎉 Bilan événement', color: 'bg-orange-100 text-orange-700' },
];

const categories: string[] = [
  'Éducation', 'Santé', 'Environnement', 'Agriculture', 
  'Social', 'Culture', 'Événement', 'Partenariat'
];

// Données par défaut
const initialPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Nouveau projet éducatif à Analamanga',
    titleMg: 'Tetabe fampianarana vaovao ao Analamanga',
    slug: 'nouveau-projet-educatif-analamanga',
    excerpt: 'Lancement d\'un programme de soutien scolaire dans les zones rurales d\'Analamanga.',
    excerptMg: 'Famoahana programa fanampiana sekoly any amin\'ny faritra ambanivohitr\'Analamanga.',
    content: 'Contenu complet du projet...',
    contentMg: 'Votoatiny feno momba ny tetikasa...',
    articleType: 'news',
    coverImage: null,
    status: 'published',
    category: 'Éducation',
    tags: ['éducation', 'enfants', 'Analamanga'],
    author: 'Marie Rakoto',
    authorId: '1',
    isTestimonial: false,
    viewsCount: 245,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Témoignage de Jean - De bénéficiaire à formateur',
    titleMg: 'Fijoroana ho vavolombelon\'i Jean - Avy ho mpianatra lasa mpanazatra',
    slug: 'temoignage-jean-beneficiaire-formateur',
    excerpt: 'Jean témoigne comment Y-Mad a changé sa vie.',
    excerptMg: 'Jean dia milaza amintsika ny fomba nanovan\'ny Y-Mad ny fiainany.',
    content: 'Témoignage complet...',
    contentMg: 'Fijoroana ho vavolombelona feno...',
    articleType: 'testimonial',
    coverImage: null,
    status: 'published',
    category: 'Social',
    tags: ['témoignage', 'formation', 'emploi'],
    author: 'Jean Randria',
    authorId: '2',
    isTestimonial: true,
    beneficiaryId: 'ben_123',
    beneficiaryName: 'Jean Randria',
    viewsCount: 189,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];

export default function DashboardBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete'>('create');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeLang, setActiveLang] = useState<'fr' | 'mg'>('fr');
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    titleMg: '',
    excerpt: '',
    excerptMg: '',
    content: '',
    contentMg: '',
    articleType: 'news',
    category: 'Éducation',
    tags: '',
    isTestimonial: false,
    beneficiaryName: '',
    status: 'draft'
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    setLoading(true);
    const stored = localStorage.getItem('ymad_blog_posts');
    if (stored) {
      const parsed = JSON.parse(stored) as BlogPost[];
      setPosts(parsed);
      setFilteredPosts(parsed);
    } else {
      setPosts(initialPosts);
      setFilteredPosts(initialPosts);
      localStorage.setItem('ymad_blog_posts', JSON.stringify(initialPosts));
    }
    setLoading(false);
  };

  const savePosts = (data: BlogPost[]) => {
    localStorage.setItem('ymad_blog_posts', JSON.stringify(data));
    setPosts(data);
    applyFilters(data, searchTerm, filterType, filterStatus);
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const applyFilters = (data: BlogPost[], term: string, type: string, status: string) => {
    let filtered = [...data];
    if (term) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(term.toLowerCase()) ||
        p.titleMg.toLowerCase().includes(term.toLowerCase())
      );
    }
    if (type) filtered = filtered.filter(p => p.articleType === type);
    if (status) filtered = filtered.filter(p => p.status === status);
    setFilteredPosts(filtered);
  };

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.excerpt) {
      showMessage('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    const slug = generateSlug(formData.title);

    if (modalMode === 'create') {
      const newPost: BlogPost = {
        id: Date.now().toString(),
        title: formData.title,
        titleMg: formData.titleMg || formData.title,
        slug: `${slug}-${Date.now()}`,
        excerpt: formData.excerpt,
        excerptMg: formData.excerptMg || formData.excerpt,
        content: formData.content,
        contentMg: formData.contentMg || formData.content,
        articleType: formData.articleType,
        coverImage: null,
        status: formData.status,
        category: formData.category,
        tags: tagsArray,
        author: 'Admin Y-Mad',
        authorId: 'admin',
        isTestimonial: formData.isTestimonial,
        beneficiaryId: formData.isTestimonial ? `ben_${Date.now()}` : undefined,
        beneficiaryName: formData.isTestimonial ? formData.beneficiaryName : undefined,
        viewsCount: 0,
        publishedAt: formData.status === 'published' ? new Date().toISOString() : null,
        createdAt: new Date().toISOString()
      };
      savePosts([newPost, ...posts]);
      showMessage('Article créé avec succès', 'success');
    } else if (modalMode === 'edit' && selectedPost) {
      const updated = posts.map(p =>
        p.id === selectedPost.id
          ? {
              ...p,
              title: formData.title,
              titleMg: formData.titleMg || formData.title,
              excerpt: formData.excerpt,
              excerptMg: formData.excerptMg || formData.excerpt,
              content: formData.content,
              contentMg: formData.contentMg || formData.content,
              articleType: formData.articleType,
              category: formData.category,
              tags: tagsArray,
              isTestimonial: formData.isTestimonial,
              beneficiaryName: formData.isTestimonial ? formData.beneficiaryName : p.beneficiaryName,
              status: formData.status,
              publishedAt: formData.status === 'published' && p.status !== 'published' 
                ? new Date().toISOString() 
                : p.publishedAt
            }
          : p
      );
      savePosts(updated);
      showMessage('Article modifié avec succès', 'success');
    }
    resetForm();
  };

  const handleDelete = () => {
    if (selectedPost) {
      savePosts(posts.filter(p => p.id !== selectedPost.id));
      showMessage('Article supprimé avec succès', 'success');
      setModalOpen(false);
    }
  };

  const handlePublish = (id: string) => {
    const updated = posts.map(p =>
      p.id === id
        ? { ...p, status: 'published' as PostStatus, publishedAt: new Date().toISOString() }
        : p
    );
    savePosts(updated);
    showMessage('Article publié avec succès !', 'success');
  };

  const handleArchive = (id: string) => {
    const updated = posts.map(p =>
      p.id === id ? { ...p, status: 'archived' as PostStatus } : p
    );
    savePosts(updated);
    showMessage('Article archivé', 'success');
  };

  const resetForm = () => {
    setModalOpen(false);
    setSelectedPost(null);
    setFormData({
      title: '', titleMg: '', excerpt: '', excerptMg: '', content: '', contentMg: '',
      articleType: 'news', category: 'Éducation', tags: '', isTestimonial: false,
      beneficiaryName: '', status: 'draft'
    });
  };

  const editPost = (post: BlogPost) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      titleMg: post.titleMg,
      excerpt: post.excerpt,
      excerptMg: post.excerptMg,
      content: post.content,
      contentMg: post.contentMg,
      articleType: post.articleType,
      category: post.category,
      tags: post.tags.join(', '),
      isTestimonial: post.isTestimonial,
      beneficiaryName: post.beneficiaryName || '',
      status: post.status
    });
    setModalMode('edit');
    setModalOpen(true);
  };

  useEffect(() => {
    applyFilters(posts, searchTerm, filterType, filterStatus);
  }, [searchTerm, filterType, filterStatus, posts]);

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
    testimonials: posts.filter(p => p.articleType === 'testimonial').length,
    totalViews: posts.reduce((sum, p) => sum + p.viewsCount, 0)
  };

  const getArticleTypeBadge = (type: ArticleType) => {
    const t = articleTypes.find(a => a.value === type) || articleTypes[0];
    return <span className={`px-2 py-0.5 text-xs rounded-full ${t.color}`}>{t.label}</span>;
  };

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'published': return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">✅ Publié</span>;
      case 'draft': return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">📝 Brouillon</span>;
      case 'archived': return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">📦 Archivé</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-ymad-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ymad-gray-500">Chargement des articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ymad-gray-800">Gestion du blog</h1>
          <p className="text-ymad-gray-500 mt-1">Créez et publiez des articles bilingues (Français/Malagasy)</p>
        </div>
        <button
          onClick={() => { resetForm(); setModalMode('create'); setModalOpen(true); }}
          className="flex items-center gap-2 bg-ymad-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-ymad-blue-700 transition"
        >
          <Plus className="w-5 h-5" /> Nouvel article
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-ymad-gray-100">
          <FileText className="w-6 h-6 text-ymad-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ymad-gray-800">{stats.total}</p>
          <p className="text-xs text-ymad-gray-500">Total articles</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-ymad-gray-100">
          <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ymad-gray-800">{stats.published}</p>
          <p className="text-xs text-ymad-gray-500">Publiés</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-ymad-gray-100">
          <Edit className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ymad-gray-800">{stats.draft}</p>
          <p className="text-xs text-ymad-gray-500">Brouillons</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-ymad-gray-100">
          <Heart className="w-6 h-6 text-rose-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ymad-gray-800">{stats.testimonials}</p>
          <p className="text-xs text-ymad-gray-500">Témoignages</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-ymad-gray-100">
          <Eye className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ymad-gray-800">{stats.totalViews}</p>
          <p className="text-xs text-ymad-gray-500">Vues totales</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ymad-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un article (français ou malagasy)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500 outline-none"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500 outline-none"
          >
            <option value="">📋 Tous les types</option>
            {articleTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500 outline-none"
          >
            <option value="">📊 Tous les statuts</option>
            <option value="published">✅ Publiés</option>
            <option value="draft">📝 Brouillons</option>
            <option value="archived">📦 Archivés</option>
          </select>
          {(searchTerm || filterType || filterStatus) && (
            <button
              onClick={() => { setSearchTerm(''); setFilterType(''); setFilterStatus(''); }}
              className="px-4 py-2 text-ymad-gray-500 hover:text-ymad-gray-700 border border-ymad-gray-300 rounded-lg hover:bg-ymad-gray-50 transition"
            >
              ✕ Effacer
            </button>
          )}
        </div>
      </div>

      {/* Switch langue d'affichage */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setActiveLang('fr')}
          className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition ${
            activeLang === 'fr' ? 'bg-ymad-blue-600 text-white' : 'bg-ymad-gray-100 text-ymad-gray-600 hover:bg-ymad-gray-200'
          }`}
        >
          <Languages className="w-3 h-3" /> Français
        </button>
        <button
          onClick={() => setActiveLang('mg')}
          className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition ${
            activeLang === 'mg' ? 'bg-ymad-blue-600 text-white' : 'bg-ymad-gray-100 text-ymad-gray-600 hover:bg-ymad-gray-200'
          }`}
        >
          <Languages className="w-3 h-3" /> Malagasy
        </button>
      </div>

      {/* Liste des articles */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm py-16 text-center">
          <FileText className="w-16 h-16 text-ymad-gray-300 mx-auto mb-4" />
          <p className="text-ymad-gray-500 text-lg">Aucun article trouvé</p>
          <button onClick={() => { resetForm(); setModalMode('create'); setModalOpen(true); }} className="mt-3 text-ymad-blue-600 hover:underline">
            Créer votre premier article
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y">
            {filteredPosts.map((post) => (
              <div key={post.id} className="p-5 hover:bg-ymad-gray-50 transition">
                <div className="flex flex-wrap justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-bold text-lg text-ymad-gray-800">
                        {activeLang === 'fr' ? post.title : post.titleMg}
                      </h3>
                      {getArticleTypeBadge(post.articleType)}
                      {getStatusBadge(post.status)}
                      {post.isTestimonial && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
                          <Heart className="w-3 h-3" /> Témoignage
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-ymad-gray-500 mb-2">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('fr-FR') : 'Non publié'}</span>
                      <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author}</span>
                      <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {post.viewsCount} vues</span>
                      <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {post.category}</span>
                    </div>
                    <p className="text-ymad-gray-600 text-sm line-clamp-2">
                      {activeLang === 'fr' ? post.excerpt : post.excerptMg}
                    </p>
                    {post.isTestimonial && post.beneficiaryName && (
                      <p className="text-xs text-ymad-blue-600 mt-1 flex items-center gap-1">
                        <Heart className="w-3 h-3" /> Témoignage de {post.beneficiaryName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/blog/${post.slug}`} target="_blank" className="p-2 text-ymad-blue-600 hover:bg-ymad-blue-50 rounded-lg transition" title="Voir">
                      <Eye className="w-5 h-5" />
                    </Link>
                    <button onClick={() => editPost(post)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Modifier">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => { setSelectedPost(post); setModalMode('delete'); setModalOpen(true); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Supprimer">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    {post.status === 'draft' && (
                      <button onClick={() => handlePublish(post.id)} className="px-3 py-1 text-green-600 text-sm bg-green-50 rounded-lg hover:bg-green-100 transition">
                        Publier
                      </button>
                    )}
                    {post.status === 'published' && (
                      <button onClick={() => handleArchive(post.id)} className="px-3 py-1 text-gray-600 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                        Archiver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Formulaire */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-ymad-gray-800">
                {modalMode === 'create' ? '➕ Nouvel article' : modalMode === 'edit' ? '✏️ Modifier' : '🗑️ Supprimer'}
              </h2>
              <button onClick={resetForm} className="p-1 hover:bg-ymad-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>

            {modalMode === 'delete' ? (
              <div className="p-6">
                <p>Êtes-vous sûr de vouloir supprimer <strong>{selectedPost?.title}</strong> ?</p>
                <p className="text-sm text-ymad-gray-500 mt-1">Cette action est irréversible.</p>
                <div className="flex gap-3 mt-6">
                  <button onClick={handleDelete} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                    Supprimer
                  </button>
                  <button onClick={resetForm} className="flex-1 border border-ymad-gray-300 px-4 py-2 rounded-lg hover:bg-ymad-gray-50 transition">
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {/* Type d'article */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ymad-gray-700 mb-1">Type d'article</label>
                    <select
                      value={formData.articleType}
                      onChange={(e) => setFormData({...formData, articleType: e.target.value as ArticleType})}
                      className="w-full px-4 py-2 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500"
                    >
                      {articleTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ymad-gray-700 mb-1">Catégorie</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Version française */}
                <div className="border-l-4 border-ymad-blue-500 pl-4">
                  <h3 className="text-sm font-semibold text-ymad-blue-700 mb-3 flex items-center gap-2">🇫🇷 Version française</h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="Titre (Français)" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                    <textarea placeholder="Résumé (Français)" rows={2} value={formData.excerpt} onChange={(e) => setFormData({...formData, excerpt: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                    <textarea placeholder="Contenu (Français)" rows={6} value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                </div>

                {/* Version malagasy */}
                <div className="border-l-4 border-ymad-green-500 pl-4">
                  <h3 className="text-sm font-semibold text-ymad-green-700 mb-3 flex items-center gap-2">🇲🇬 Version malagasy</h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="Titre (Malagasy)" value={formData.titleMg} onChange={(e) => setFormData({...formData, titleMg: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                    <textarea placeholder="Résumé (Malagasy)" rows={2} value={formData.excerptMg} onChange={(e) => setFormData({...formData, excerptMg: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                    <textarea placeholder="Contenu (Malagasy)" rows={6} value={formData.contentMg} onChange={(e) => setFormData({...formData, contentMg: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                </div>

                {/* Tags et statut */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ymad-gray-700 mb-1">Tags (séparés par virgules)</label>
                    <input type="text" placeholder="Ex: éducation, formation, jeunesse" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ymad-gray-700 mb-1">Statut</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as PostStatus})} className="w-full px-4 py-2 border rounded-lg">
                      <option value="draft">Brouillon</option>
                      <option value="published">Publié</option>
                    </select>
                  </div>
                </div>

                {/* Option témoignage */}
                <div className="border-t pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isTestimonial} onChange={(e) => setFormData({...formData, isTestimonial: e.target.checked})} className="w-4 h-4 rounded" />
                    <span className="text-sm font-medium text-ymad-gray-700">Cet article est un témoignage</span>
                  </label>
                  {formData.isTestimonial && (
                    <input type="text" placeholder="Nom du bénéficiaire" value={formData.beneficiaryName} onChange={(e) => setFormData({...formData, beneficiaryName: e.target.value})} className="mt-2 w-full px-4 py-2 border rounded-lg" />
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button onClick={resetForm} className="px-4 py-2 border border-ymad-gray-300 rounded-lg hover:bg-ymad-gray-50 transition">
                    Annuler
                  </button>
                  <button onClick={handleSubmit} className="px-6 py-2 bg-ymad-blue-600 text-white rounded-lg font-semibold hover:bg-ymad-blue-700 transition">
                    {modalMode === 'create' ? 'Créer' : 'Modifier'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}