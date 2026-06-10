// frontend/src/app/(dashboard)/dashboard/blog/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, Edit, Trash2, Eye, Search, CheckCircle, AlertCircle,
  Calendar, User, FileText, ImageIcon, 
  X, Upload, Languages, Loader2, Archive,
  FolderOpen, Tag, RefreshCw, ChevronLeft, ChevronRight,
  Code, Bold, Italic, Underline, AlignLeft, AlignCenter,
  AlignRight, List, ListOrdered, Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// Import dynamique de l'éditeur Quill
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Configuration de l'éditeur Quill
const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean']
  ],
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'list', 'bullet', 'check',
  'indent', 'align', 'blockquote', 'code-block',
  'link', 'image'
];

// Types
type ArticleType = 'news' | 'testimonial' | 'report' | 'success_story' | 'event_recap';
type PostStatus = 'draft' | 'published' | 'archived';

interface BlogPost {
  id: string;
  title_fr: string;
  title_mg: string | null;
  slug: string;
  summary_fr: string;
  summary_mg: string | null;
  content_fr: string;
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
}

interface FormData {
  title_fr: string;
  title_mg: string;
  summary_fr: string;
  summary_mg: string;
  content_fr: string;
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
  const { language } = useLanguage();
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
  const [showPreviewFr, setShowPreviewFr] = useState(false);
  const [showPreviewMg, setShowPreviewMg] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    totalViews: 0
  });
  
  const [formData, setFormData] = useState<FormData>({
    title_fr: '',
    title_mg: '',
    summary_fr: '',
    summary_mg: '',
    content_fr: '',
    content_mg: '',
    type: 'news',
    tags: '',
    status: 'draft',
    image_url: null
  });

  const isMounted = useRef(true);
  const initialFetchDone = useRef(false);

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  const hasAccess = user?.role === 'super_admin' || user?.role === 'admin';
  const itemsPerPage = 10;
  const totalPages = Math.ceil(posts.length / itemsPerPage);
  const paginatedPosts = posts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const fetchPosts = useCallback(async () => {
    if (!token || !isMounted.current) return;
    setLoading(true);
    try {
      const params: any = { page: 1, limit: 100 };
      if (filterStatus && filterStatus !== 'all') params.status = filterStatus;
      if (filterType && filterType !== 'all') params.type = filterType;
      if (searchTerm) params.search = searchTerm;
      
      const response = await api.get('/blog', { params });
      
      if (response.data && isMounted.current) {
        setPosts(response.data.data || []);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(getText('Erreur de chargement des articles', 'Nisy hadisoana tamin\'ny fampidirana'));
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus, filterType, searchTerm, getText]);

  const fetchStats = useCallback(async () => {
    if (!token || !isMounted.current) return;
    try {
      const response = await api.get('/blog/stats');
      if (response.data && isMounted.current) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  }, [token]);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!hasAccess) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, hasAccess, router]);

  useEffect(() => {
    if (token && !initialFetchDone.current && isMounted.current) {
      initialFetchDone.current = true;
      fetchPosts();
      fetchStats();
    }
  }, [token, fetchPosts, fetchStats]);

  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      toast.error(getText('Veuillez sélectionner une image', 'Mifidiana sary azafady'));
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(getText('L\'image ne doit pas dépasser 5 Mo', 'Ny sary dia tsy tokony mihoatra 5 Mo'));
      return null;
    }

    setUploadingImage(true);
    const formDataImg = new FormData();
    formDataImg.append('file', file);
    formDataImg.append('entityType', 'blog');

    try {
      const response = await api.post('/upload/single', formDataImg, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const imageUrl = response.data.url || `/api/upload/image/${response.data.id}`;
      toast.success(getText('Image uploadée avec succès', 'Vita ny fampidirana sary'));
      return imageUrl;
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error(getText('Erreur lors de l\'upload', 'Nisy hadisoana tamin\'ny fampidirana'));
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
    if (!formData.title_fr || !formData.summary_fr) {
      toast.error(getText('Veuillez remplir le titre et le résumé', 'Fenoy ny lohateny sy ny famintinana'));
      return;
    }

    setSaving(true);
    try {
      const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const authorName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Admin Y-Mad' : 'Admin Y-Mad';
      
      const response = await api.post('/blog', {
        title_fr: formData.title_fr,
        title_mg: formData.title_mg || null,
        summary_fr: formData.summary_fr,
        summary_mg: formData.summary_mg || null,
        content_fr: formData.content_fr || '',
        content_mg: formData.content_mg || null,
        type: formData.type,
        image_url: formData.image_url || null,
        status: formData.status,
        tags: tagsArray,
        author: authorName
      });

      if (response.data) {
        toast.success(getText('Article créé avec succès', 'Vita ny famoronana lahatsoratra'));
        fetchPosts();
        fetchStats();
        setModalOpen(false);
        resetForm();
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      const errorMessage = error.response?.data?.message || getText('Erreur lors de la création', 'Nisy hadisoana tamin\'ny famoronana');
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const updatePost = async () => {
    if (!selectedPost) return;
    if (!formData.title_fr || !formData.summary_fr) {
      toast.error(getText('Veuillez remplir le titre et le résumé', 'Fenoy ny lohateny sy ny famintinana'));
      return;
    }

    setSaving(true);
    try {
      const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      
      const updateData: any = {
        title_fr: formData.title_fr,
        summary_fr: formData.summary_fr,
        content_fr: formData.content_fr || '',
        type: formData.type,
        status: formData.status,
        tags: tagsArray
      };
      
      if (formData.title_mg) updateData.title_mg = formData.title_mg;
      if (formData.summary_mg) updateData.summary_mg = formData.summary_mg;
      if (formData.content_mg) updateData.content_mg = formData.content_mg;
      if (formData.image_url) updateData.image_url = formData.image_url;
      
      const response = await api.patch(`/blog/${selectedPost.id}`, updateData);

      if (response.data) {
        toast.success(getText('Article modifié avec succès', 'Vita ny fanovana lahatsoratra'));
        fetchPosts();
        fetchStats();
        setModalOpen(false);
        resetForm();
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      const errorMessage = error.response?.data?.message || getText('Erreur lors de la modification', 'Nisy hadisoana tamin\'ny fanovana');
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: PostStatus) => {
    try {
      const response = await api.patch(`/blog/${id}/status`, { status });

      if (response.data) {
        toast.success(status === 'published' ? getText('Article publié', 'Navoaka ny lahatsoratra') : getText('Article archivé', 'Voatahiry ny lahatsoratra'));
        fetchPosts();
        fetchStats();
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(getText('Erreur lors du changement de statut', 'Nisy hadisoana tamin\'ny fanovana sata'));
    }
  };

  const deletePost = async () => {
    if (!selectedPost) return;
    setSaving(true);
    try {
      await api.delete(`/blog/${selectedPost.id}`);
      toast.success(getText('Article supprimé avec succès', 'Vita ny fanafoanana lahatsoratra'));
      fetchPosts();
      fetchStats();
      setModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(getText('Erreur lors de la suppression', 'Nisy hadisoana tamin\'ny fanafoanana'));
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
      title_fr: '',
      title_mg: '',
      summary_fr: '',
      summary_mg: '',
      content_fr: '',
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
      title_fr: post.title_fr,
      title_mg: post.title_mg || '',
      summary_fr: post.summary_fr,
      summary_mg: post.summary_mg || '',
      content_fr: post.content_fr,
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
        return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">Publié</span>;
      case 'draft':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">Brouillon</span>;
      case 'archived':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">Archivé</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return getText('Date non disponible', 'Tsy misy daty');
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
          <h1 className="text-2xl font-bold text-gray-800">{getText('Accès non autorisé', 'Tsy manana alalana')}</h1>
          <p className="text-gray-500 mt-2">{getText('Vous n\'avez pas les droits pour accéder à cette page.', 'Tsy manana alalana hiditra ity pejy ity ianao.')}</p>
          <Link href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition">
            {getText('Retour au tableau de bord', 'Hiverina any amin\'ny fandraisana')}
          </Link>
        </div>
      </div>
    );
  }

  if (loading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-800 animate-spin" />
        <p className="text-gray-500">{getText('Chargement des articles...', 'Fandefasana ny lahatsoratra...')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center shadow-sm">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{getText('Gestion du blog', 'Fitantanana ny bilaogy')}</h1>
            <p className="text-gray-500 text-sm">{getText('Créez et publiez des articles bilingues', 'Mamorona sy mamoaka lahatsoratra amin\'ny fiteny roa')}</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setModalMode('create'); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> {getText('Nouvel article', 'Lahatsoratra vaovao')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
          <FileText className="w-6 h-6 text-blue-800 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-500">{getText('Total articles', 'Lahatsoratra rehetra')}</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
          <CheckCircle className="w-6 h-6 text-blue-800 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.published}</p>
          <p className="text-xs text-gray-500">{getText('Publiés', 'Navoaka')}</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
          <Edit className="w-6 h-6 text-gray-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.draft}</p>
          <p className="text-xs text-gray-500">{getText('Brouillons', 'Volavola')}</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
          <Archive className="w-6 h-6 text-gray-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.archived}</p>
          <p className="text-xs text-gray-500">{getText('Archivés', 'Voatahiry')}</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
          <Eye className="w-6 h-6 text-blue-800 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.totalViews}</p>
          <p className="text-xs text-gray-500">{getText('Vues totales', 'Fijerena rehetra')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={getText('Rechercher un article...', 'Karohy lahatsoratra...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-800 outline-none"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-800 outline-none"
          >
            <option value="">{getText('Tous les types', 'Karazana rehetra')}</option>
            {articleTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-800 outline-none"
          >
            <option value="">{getText('Tous les statuts', 'Sata rehetra')}</option>
            <option value="published">{getText('Publiés', 'Navoaka')}</option>
            <option value="draft">{getText('Brouillons', 'Volavola')}</option>
            <option value="archived">{getText('Archivés', 'Voatahiry')}</option>
          </select>
          <button
            onClick={() => { setSearchTerm(''); setFilterType(''); setFilterStatus(''); fetchPosts(); }}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" /> {getText('Réinitialiser', 'Averina')}
          </button>
        </div>
      </div>

      {/* Language Switch */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setActiveLang('fr')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
            activeLang === 'fr' ? 'bg-blue-800 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Languages className="w-3.5 h-3.5" /> Français
        </button>
        <button
          onClick={() => setActiveLang('mg')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
            activeLang === 'mg' ? 'bg-blue-800 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Languages className="w-3.5 h-3.5" /> Malagasy
        </button>
      </div>

      {/* Articles List */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm py-16 text-center border border-gray-200">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">{getText('Aucun article trouvé', 'Tsy misy lahatsoratra hita')}</p>
          <button onClick={() => { resetForm(); setModalMode('create'); setModalOpen(true); }} className="mt-3 text-blue-800 hover:underline font-medium">
            {getText('Créer votre premier article', 'Mamorona lahatsoratra voalohany')}
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-100">
              {paginatedPosts.map((post) => {
                const displayTitle = activeLang === 'fr' ? post.title_fr : (post.title_mg || post.title_fr);
                const displaySummary = activeLang === 'fr' ? post.summary_fr : (post.summary_mg || post.summary_fr);
                
                return (
                  <div key={post.id} className="p-5 hover:bg-gray-50 transition">
                    <div className="flex flex-wrap gap-4">
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
                            {post.author || 'Admin'}
                          </span>
                          {post.tags && post.tags.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Tag className="w-3.5 h-3.5" /> 
                              {post.tags.slice(0, 3).join(', ')}
                              {post.tags.length > 3 && ` +${post.tags.length - 3}`}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {displaySummary}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => viewPost(post)} 
                          className="p-2 text-blue-800 hover:bg-gray-100 rounded-lg transition" 
                          title={getText('Voir', 'Jereo')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => editPost(post)} 
                          className="p-2 text-amber-600 hover:bg-gray-100 rounded-lg transition" 
                          title={getText('Modifier', 'Hanova')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedPost(post); setModalMode('delete'); setModalOpen(true); }} 
                          className="p-2 text-red-500 hover:bg-gray-100 rounded-lg transition" 
                          title={getText('Supprimer', 'Hamafa')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {post.status === 'draft' && (
                          <button 
                            onClick={() => updateStatus(post.id, 'published')} 
                            className="px-3 py-1 text-green-600 text-sm bg-green-50 rounded-lg hover:bg-green-100 transition"
                          >
                            {getText('Publier', 'Hamoa')}
                          </button>
                        )}
                        {post.status === 'published' && (
                          <button 
                            onClick={() => updateStatus(post.id, 'archived')} 
                            className="px-3 py-1 text-gray-600 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                          >
                            {getText('Archiver', 'Tehirizo')}
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
                {getText('Page', 'Pejy')} <span className="font-semibold text-blue-800">{currentPage}</span> / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg transition ${currentPage === pageNum ? 'bg-blue-800 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View Modal */}
      {modalOpen && modalMode === 'view' && selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-5 border-b flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {activeLang === 'fr' ? selectedPost.title_fr : (selectedPost.title_mg || selectedPost.title_fr)}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(selectedPost.published_at)} • {selectedPost.author}
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            {selectedPost.image_url && (
              <div className="p-6">
                <img 
                  src={selectedPost.image_url} 
                  alt={activeLang === 'fr' ? selectedPost.title_fr : (selectedPost.title_mg || selectedPost.title_fr)}
                  className="w-full h-[400px] object-cover rounded-xl shadow-lg"
                />
              </div>
            )}

            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(selectedPost.published_at)}</span>
                <span className="flex items-center gap-1"><User className="w-4 h-4" /> {selectedPost.author}</span>
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {selectedPost.views} vues</span>
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

            <div className="p-6 border-t bg-gray-50">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">
                {getText('Contenu de l\'article', 'Votoatin\'ny lahatsoratra')}
              </h3>
              <div className="text-gray-700 leading-relaxed prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: activeLang === 'fr' ? selectedPost.content_fr : (selectedPost.content_mg || selectedPost.content_fr) }} />
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3 bg-white rounded-b-2xl">
              <button
                onClick={() => { setModalOpen(false); editPost(selectedPost); }}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition flex items-center gap-2"
              >
                <Edit className="w-4 h-4" /> {getText('Modifier', 'Hanova')}
              </button>
              <button onClick={() => setModalOpen(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                {getText('Fermer', 'Hidy')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-5 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {modalMode === 'create' ? getText('Créer un article', 'Mamorona lahatsoratra') : getText('Modifier l\'article', 'Hanova lahatsoratra')}
                </h2>
              </div>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded-lg transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Image upload */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon className="w-4 h-4 text-blue-800" />
                  {getText('Image de couverture', 'Sary fonony')}
                </label>
                <div className="flex items-center gap-4 flex-wrap">
                  {formData.image_url && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-blue-200 shadow-sm">
                      <img src={formData.image_url} alt="Cover" className="w-full h-full object-cover" />
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
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-blue-800" /> : <Upload className="w-4 h-4 text-blue-800" />}
                      <span className="text-sm text-gray-600">
                        {uploadingImage ? getText('Upload...', 'Fandefasana...') : (formData.image_url ? getText('Changer l\'image', 'Hanova sary') : getText('Télécharger une image', 'Alefaso sary'))}
                      </span>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={uploadingImage} />
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {getText('Formats acceptés: JPG, PNG, WEBP, GIF. Max 5 Mo.', 'Endrika azo: JPG, PNG, WEBP, GIF. Farany 5 Mo.')}
                </p>
              </div>

              {/* Version française */}
              <div className="border-l-4 border-blue-800 pl-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-3">Français</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder={getText('Titre *', 'Lohateny *')}
                    value={formData.title_fr}
                    onChange={(e) => setFormData({...formData, title_fr: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-sm"
                    required
                  />
                  <textarea
                    placeholder={getText('Résumé *', 'Famintinana *')}
                    rows={3}
                    value={formData.summary_fr}
                    onChange={(e) => setFormData({...formData, summary_fr: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-sm resize-none"
                    required
                  />
                  <div className="quill-editor">
                    <ReactQuill
                      theme="snow"
                      value={formData.content_fr}
                      onChange={(value) => setFormData({...formData, content_fr: value})}
                      modules={QUILL_MODULES}
                      formats={QUILL_FORMATS}
                      placeholder={getText('Contenu complet...', 'Votoatiny feno...')}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Version malagasy */}
              <div className="border-l-4 border-blue-400 pl-4">
                <h3 className="text-sm font-semibold text-blue-600 mb-3">Malagasy</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder={getText('Titre', 'Lohateny')}
                    value={formData.title_mg}
                    onChange={(e) => setFormData({...formData, title_mg: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-sm"
                  />
                  <textarea
                    placeholder={getText('Résumé', 'Famintinana')}
                    rows={3}
                    value={formData.summary_mg}
                    onChange={(e) => setFormData({...formData, summary_mg: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-sm resize-none"
                  />
                  <div className="quill-editor">
                    <ReactQuill
                      theme="snow"
                      value={formData.content_mg}
                      onChange={(value) => setFormData({...formData, content_mg: value})}
                      modules={QUILL_MODULES}
                      formats={QUILL_FORMATS}
                      placeholder="Votoatiny feno..."
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    <FolderOpen className="w-4 h-4" /> {getText('Type d\'article', 'Karazana lahatsoratra')}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as ArticleType})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-sm"
                  >
                    {articleTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    <Tag className="w-4 h-4" /> {getText('Tags', 'Marika')}
                  </label>
                  <input
                    type="text"
                    placeholder={getText('éducation, formation, jeunesse', 'fanabeazana, fanofanana, tanora')}
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                  <CheckCircle className="w-4 h-4" /> {getText('Statut', 'Sata')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as PostStatus})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-sm"
                >
                  <option value="draft">{getText('Brouillon', 'Volavola')}</option>
                  <option value="published">{getText('Publié', 'Navoaka')}</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={resetForm}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  {getText('Annuler', 'Aoka')}
                </button>
                <button
                  onClick={modalMode === 'create' ? createPost : updatePost}
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-900 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {modalMode === 'create' ? getText('Créer', 'Hamorona') : getText('Modifier', 'Hanova')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
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
                {getText('Êtes-vous sûr de vouloir supprimer', 'Azonao antoka ve fa tianao hofafana')} <strong className="text-gray-800">{selectedPost.title_fr}</strong> ?
              </p>
              <p className="text-center text-sm text-gray-500 mt-1">{getText('Cette action est irréversible.', 'Tsy azo averina izany.')}</p>
              <div className="flex gap-3 mt-6">
                <button onClick={deletePost} disabled={saving} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : getText('Supprimer', 'Fafao')}
                </button>
                <button onClick={() => { setModalOpen(false); resetForm(); }} className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                  {getText('Annuler', 'Aoka')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .quill-editor .ql-container {
          min-height: 200px;
          font-size: 14px;
        }
        .quill-editor .ql-editor {
          min-height: 200px;
        }
        .quill-editor .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          border-color: #e5e7eb;
          background-color: #f9fafb;
        }
        .quill-editor .ql-container {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          border-color: #e5e7eb;
        }
        .prose {
          max-width: none;
        }
        .prose h1 { font-size: 1.5rem; font-weight: bold; margin: 1rem 0; }
        .prose h2 { font-size: 1.3rem; font-weight: bold; margin: 0.8rem 0; }
        .prose h3 { font-size: 1.1rem; font-weight: bold; margin: 0.6rem 0; }
        .prose ul, .prose ol { margin: 0.5rem 0 0.5rem 1.5rem; }
        .prose li { margin: 0.2rem 0; }
        .prose blockquote { border-left: 4px solid #1E3A8A; padding-left: 1rem; color: #4b5563; }
        .prose a { color: #1E3A8A; text-decoration: underline; }
      `}</style>
    </div>
  );
}

// Composant Save manquant
function Save(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}