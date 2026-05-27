// src/app/dashboard/blog/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, Edit, Trash2, Eye, Search, CheckCircle, AlertCircle,
  Calendar, User, FileText, ImageIcon, 
  X, Upload, Languages, Loader2, Archive,
  FolderOpen, Tag, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

// Types
type ArticleType = 'news' | 'testimonial' | 'report' | 'success_story' | 'event_recap';
type PostStatus = 'draft' | 'published' | 'archived';

interface BlogPost {
  id: string;
  title: string;
  title_mg: string | null;
  slug: string;
  summary: string;
  summary_mg: string | null;
  content: string;
  content_mg: string | null;
  type: ArticleType;
  image_url: string | null;
  status: PostStatus;
  author: string;
  author_id: string;
  tags: string[];
  views: number;
  published_at: string | null;
  created_at: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface FormData {
  title: string;
  title_mg: string;
  summary: string;
  summary_mg: string;
  content: string;
  content_mg: string;
  type: ArticleType;
  tags: string;
  status: PostStatus;
  image_url: string | null;
}

const articleTypes: { value: ArticleType; label: string }[] = [
  { value: 'news', label: 'Actualité' },
  { value: 'testimonial', label: 'Témoignage' },
  { value: 'report', label: 'Rapport' },
  { value: 'success_story', label: 'Success story' },
  { value: 'event_recap', label: 'Bilan événement' },
];

export default function DashboardBlogPage() {
  const { token, user, isAuthenticated } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete' | 'view'>('create');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeLang, setActiveLang] = useState<'fr' | 'mg'>('fr');
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    totalViews: 0
  });
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    title_mg: '',
    summary: '',
    summary_mg: '',
    content: '',
    content_mg: '',
    type: 'news',
    tags: '',
    status: 'draft',
    image_url: null
  });

  const hasAccess = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff';
  const itemsPerPage = 10;
  const totalPages = Math.ceil(posts.length / itemsPerPage);
  const paginatedPosts = posts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const fetchPosts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '100');
      if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus);
      if (filterType && filterType !== 'all') params.append('type', filterType);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`${API_URL}/blog?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.data || []);
        setCurrentPage(1);
      } else {
        toast.error('Erreur de chargement des articles');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus, filterType, searchTerm]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/blog/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!hasAccess) {
      router.push('/dashboard');
      return;
    }
    fetchPosts();
    fetchStats();
  }, [isAuthenticated, hasAccess, fetchPosts, fetchStats]);

  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return null;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 2MB');
      return null;
    }

    setUploadingImage(true);
    const formDataImg = new FormData();
    formDataImg.append('file', file);
    formDataImg.append('folder', 'blog');

    try {
      const response = await fetch(`${API_URL}/upload/single`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataImg
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Image uploadée avec succès');
        return data.url;
      } else {
        toast.error('Erreur lors de l\'upload');
        return null;
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur de connexion');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await handleImageUpload(file);
      if (url) {
        setFormData({ ...formData, image_url: url });
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const createPost = async () => {
    if (!formData.title || !formData.summary) {
      toast.error('Veuillez remplir le titre et le résumé');
      return;
    }

    setSaving(true);
    try {
      const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const authorName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Admin Y-Mad';
      
      const response = await fetch(`${API_URL}/blog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          title_mg: formData.title_mg || null,
          summary: formData.summary,
          summary_mg: formData.summary_mg || null,
          content: formData.content || '',
          content_mg: formData.content_mg || null,
          type: formData.type,
          image_url: formData.image_url || null,
          status: formData.status,
          tags: tagsArray,
          author: authorName
        })
      });

      if (response.ok) {
        toast.success('Article créé avec succès');
        await fetchPosts();
        await fetchStats();
        setModalOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const updatePost = async () => {
    if (!selectedPost) return;
    if (!formData.title || !formData.summary) {
      toast.error('Veuillez remplir le titre et le résumé');
      return;
    }

    setSaving(true);
    try {
      const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      
      const updateData: any = {
        title: formData.title,
        summary: formData.summary
      };
      
      if (formData.content) updateData.content = formData.content;
      if (formData.type && formData.type !== 'news') updateData.type = formData.type;
      if (formData.status && formData.status !== 'draft') updateData.status = formData.status;
      if (formData.image_url) updateData.image_url = formData.image_url;
      if (tagsArray.length > 0) updateData.tags = tagsArray;
      if (formData.title_mg) updateData.title_mg = formData.title_mg;
      if (formData.summary_mg) updateData.summary_mg = formData.summary_mg;
      if (formData.content_mg) updateData.content_mg = formData.content_mg;
      
      const response = await fetch(`${API_URL}/blog/${selectedPost.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        toast.success('Article modifié avec succès');
        await fetchPosts();
        await fetchStats();
        setModalOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: PostStatus) => {
    try {
      const response = await fetch(`${API_URL}/blog/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success(status === 'published' ? 'Article publié' : 'Article archivé');
        await fetchPosts();
        await fetchStats();
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur');
    }
  };

  const deletePost = async () => {
    if (!selectedPost) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/blog/${selectedPost.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Article supprimé avec succès');
        await fetchPosts();
        await fetchStats();
        setModalOpen(false);
        resetForm();
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const viewPost = (post: BlogPost) => {
    setSelectedPost(post);
    setModalMode('view');
    setModalOpen(true);
  };

  const resetForm = () => {
    setModalOpen(false);
    setSelectedPost(null);
    setModalMode('create');
    setFormData({
      title: '',
      title_mg: '',
      summary: '',
      summary_mg: '',
      content: '',
      content_mg: '',
      type: 'news',
      tags: '',
      status: 'draft',
      image_url: null
    });
  };

  const editPost = (post: BlogPost) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      title_mg: post.title_mg || '',
      summary: post.summary,
      summary_mg: post.summary_mg || '',
      content: post.content,
      content_mg: post.content_mg || '',
      type: post.type,
      tags: post.tags ? post.tags.join(', ') : '',
      status: post.status,
      image_url: post.image_url
    });
    setModalMode('edit');
    setModalOpen(true);
  };

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'published':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">Publié</span>;
      case 'draft':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">Brouillon</span>;
      case 'archived':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-500">Archivé</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isAuthenticated || !hasAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Accès non autorisé</h1>
          <p className="text-gray-500 mt-2">Vous n'avez pas les droits pour accéder à cette page.</p>
          <Link href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Chargement des articles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête Y-Mad */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gestion du blog</h1>
              <p className="text-blue-100 text-sm mt-0.5">
                Créez et publiez des articles bilingues (Français/Malagasy)
              </p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setModalMode('create'); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
          >
            <Plus className="w-4 h-4" /> Nouvel article
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
          <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-500">Total articles</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
          <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.published}</p>
          <p className="text-xs text-gray-500">Publiés</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
          <Edit className="w-6 h-6 text-gray-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.draft}</p>
          <p className="text-xs text-gray-500">Brouillons</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
          <Archive className="w-6 h-6 text-gray-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.archived}</p>
          <p className="text-xs text-gray-500">Archivés</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
          <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.totalViews}</p>
          <p className="text-xs text-gray-500">Vues totales</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="">Tous les types</option>
            {articleTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
            <option value="archived">Archivés</option>
          </select>
          <button
            onClick={() => { setSearchTerm(''); setFilterType(''); setFilterStatus(''); fetchPosts(); }}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" /> Réinitialiser
          </button>
        </div>
      </div>

      {/* Switch langue */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setActiveLang('fr')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
            activeLang === 'fr' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Languages className="w-3.5 h-3.5" /> Français
        </button>
        <button
          onClick={() => setActiveLang('mg')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
            activeLang === 'mg' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Languages className="w-3.5 h-3.5" /> Malagasy
        </button>
      </div>

      {/* Liste des articles avec boutons Voir et Modifier */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm py-16 text-center border border-gray-200">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucun article trouvé</p>
          <button onClick={() => { resetForm(); setModalMode('create'); setModalOpen(true); }} className="mt-3 text-blue-600 hover:underline font-medium">
            Créer votre premier article
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="divide-y divide-gray-100">
              {paginatedPosts.map((post) => {
                const displayTitle = activeLang === 'fr' ? post.title : (post.title_mg || post.title);
                const displaySummary = activeLang === 'fr' ? post.summary : (post.summary_mg || post.summary);
                
                return (
                  <div key={post.id} className="p-5 hover:bg-gray-50 transition">
                    <div className="flex flex-wrap gap-4">
                      {/* Image miniature */}
                      {post.image_url && (
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                            <img 
                              src={post.image_url} 
                              alt={displayTitle}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-bold text-lg text-gray-800 truncate">
                            {displayTitle}
                          </h3>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                            {articleTypes.find(t => t.value === post.type)?.label || post.type}
                          </span>
                          {getStatusBadge(post.status)}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> 
                            {formatDate(post.published_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> 
                            {post.user ? `${post.user.firstName} ${post.user.lastName}` : post.author || 'Admin'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5" /> 
                            {post.tags && post.tags.length > 0 ? post.tags.slice(0, 3).join(', ') : 'Aucun tag'}
                            {post.tags && post.tags.length > 3 && ` +${post.tags.length - 3}`}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {displaySummary}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {/* Bouton Voir */}
                        <button 
                          onClick={() => viewPost(post)} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                          title="Voir l'article"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* Bouton Modifier */}
                        <button 
                          onClick={() => editPost(post)} 
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition" 
                          title="Modifier l'article"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        {/* Bouton Supprimer */}
                        <button 
                          onClick={() => { setSelectedPost(post); setModalMode('delete'); setModalOpen(true); }} 
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" 
                          title="Supprimer l'article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        {/* Bouton Publier/Archiver */}
                        {post.status === 'draft' && (
                          <button 
                            onClick={() => updateStatus(post.id, 'published')} 
                            className="px-3 py-1 text-green-600 text-sm bg-green-50 rounded-lg hover:bg-green-100 transition"
                          >
                            Publier
                          </button>
                        )}
                        {post.status === 'published' && (
                          <button 
                            onClick={() => updateStatus(post.id, 'archived')} 
                            className="px-3 py-1 text-gray-600 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                          >
                            Archiver
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-2">
              <div className="text-sm text-gray-500">
                Page <span className="font-semibold text-blue-600">{currentPage}</span> sur {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Vue Article (View) */}
      {modalOpen && modalMode === 'view' && selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            
            {/* En-tête */}
            <div className="sticky top-0 bg-white p-5 border-b flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {activeLang === 'fr' ? selectedPost.title : (selectedPost.title_mg || selectedPost.title)}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(selectedPost.published_at)} • {selectedPost.author}
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Image */}
            {selectedPost.image_url && (
              <div className="p-6">
                <img 
                  src={selectedPost.image_url} 
                  alt={activeLang === 'fr' ? selectedPost.title : (selectedPost.title_mg || selectedPost.title)}
                  className="w-full h-[400px] object-cover rounded-xl shadow-lg"
                />
              </div>
            )}

            {/* Métadonnées */}
            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {formatDate(selectedPost.published_at)}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" /> {selectedPost.author}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" /> {selectedPost.views} vues
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

            {/* Contenu */}
            <div className="p-6 border-t bg-gray-50">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">
                {activeLang === 'fr' ? 'Contenu de l\'article' : 'Votoatin\'ny lahatsoratra'}
              </h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap prose prose-lg max-w-none">
                {activeLang === 'fr' ? selectedPost.content : (selectedPost.content_mg || selectedPost.content)}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t flex justify-end gap-3 bg-white rounded-b-2xl">
              <button
                onClick={() => { setModalOpen(false); editPost(selectedPost); }}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Formulaire (Create/Edit) */}
      {modalOpen && (modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {modalMode === 'create' ? 'Créer un article' : 'Modifier l\'article'}
                </h2>
              </div>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded-lg transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Upload d'image */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  Image de couverture
                </label>
                <div className="flex items-center gap-4 flex-wrap">
                  {formData.image_url && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-blue-200 shadow-sm">
                      <img 
                        src={formData.image_url} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: null })}
                        className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <div className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg transition ${
                      formData.image_url ? 'border-gray-300 hover:border-blue-400' : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                    }`}>
                      {uploadingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <Upload className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="text-sm text-gray-600">
                        {uploadingImage ? 'Upload en cours...' : (formData.image_url ? 'Changer l\'image' : 'Télécharger une image')}
                      </span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Formats acceptés: JPG, PNG, WebP. Taille max: 2MB
                </p>
              </div>

              {/* Version française */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-sm font-semibold text-blue-700 mb-3">Français</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Titre *"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    required
                  />
                  <textarea
                    placeholder="Résumé *"
                    rows={3}
                    value={formData.summary}
                    onChange={(e) => setFormData({...formData, summary: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                    required
                  />
                  <textarea
                    placeholder="Contenu complet"
                    rows={6}
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                  />
                </div>
              </div>

              {/* Version malagasy */}
              <div className="border-l-4 border-blue-400 pl-4">
                <h3 className="text-sm font-semibold text-blue-600 mb-3">Malagasy</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Titre"
                    value={formData.title_mg}
                    onChange={(e) => setFormData({...formData, title_mg: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                  <textarea
                    placeholder="Résumé"
                    rows={3}
                    value={formData.summary_mg}
                    onChange={(e) => setFormData({...formData, summary_mg: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                  />
                  <textarea
                    placeholder="Contenu complet"
                    rows={6}
                    value={formData.content_mg}
                    onChange={(e) => setFormData({...formData, content_mg: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    <FolderOpen className="w-4 h-4" /> Type d'article
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as ArticleType})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    {articleTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    <Tag className="w-4 h-4" /> Tags
                  </label>
                  <input
                    type="text"
                    placeholder="éducation, formation, jeunesse"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                  <CheckCircle className="w-4 h-4" /> Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as PostStatus})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                </select>
              </div>

              {/* Boutons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={modalMode === 'create' ? createPost : updatePost}
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 flex items-center gap-2 shadow-md"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {modalMode === 'create' ? 'Créer' : 'Modifier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {modalOpen && modalMode === 'delete' && selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <p className="text-center text-gray-700">
                Êtes-vous sûr de vouloir supprimer <strong className="text-gray-800">{selectedPost.title}</strong> ?
              </p>
              <p className="text-center text-sm text-gray-500 mt-1">Cette action est irréversible.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={deletePost} disabled={saving} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Supprimer'}
                </button>
                <button onClick={() => { setModalOpen(false); resetForm(); }} className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}