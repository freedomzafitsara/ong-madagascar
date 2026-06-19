// frontend/src/app/(dashboard)/dashboard/pages/[key]/edit/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, Save, Loader2, AlertCircle, 
  FileText, Globe, Eye, EyeOff, X,
  CheckCircle, Calendar, User, Code,
  Home, FolderOpen, Briefcase, Mail, LogIn,
  LayoutDashboard, UserCircle, Info, HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// Import dynamique de l'editeur Quill
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  )
});

import 'react-quill/dist/quill.snow.css';

// ============================================================
// CONFIGURATION DE L'EDITEUR
// ============================================================

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

// ============================================================
// CONSTANTES - PAGE_KEYS
// ============================================================

const PAGE_KEYS: Record<string, { labelFr: string; labelMg: string; icon: any }> = {
  home: { labelFr: 'Accueil', labelMg: 'Fandraisana', icon: Home },
  projects: { labelFr: 'Projets', labelMg: 'Tetikasa', icon: FolderOpen },
  jobs: { labelFr: 'Offres d\'emploi', labelMg: 'Asa', icon: Briefcase },
  blog: { labelFr: 'Blog', labelMg: 'Blaogy', icon: FileText },
  contact: { labelFr: 'Contact', labelMg: 'Fifandraisana', icon: Mail },
  login: { labelFr: 'Connexion', labelMg: 'Hiditra', icon: LogIn },
  dashboard: { labelFr: 'Tableau de bord', labelMg: 'Tabilao', icon: LayoutDashboard },
  profile: { labelFr: 'Profil', labelMg: 'Momba', icon: UserCircle },
  about: { labelFr: 'A propos', labelMg: 'Mikasika', icon: Info },
  faq: { labelFr: 'FAQ', labelMg: 'Fanontaniana', icon: HelpCircle },
  all: { labelFr: 'Toutes les pages', labelMg: 'Pejy rehetra', icon: FileText },
  register: { labelFr: 'Inscription', labelMg: 'Fisoratana', icon: UserCircle },
};

// ============================================================
// INTERFACES
// ============================================================

interface PageData {
  id: string;
  page_key: string;
  content_fr: string;
  content_mg: string;
  hero?: any;
  seo_title_fr?: string;
  seo_title_mg?: string;
  seo_description_fr?: string;
  seo_description_mg?: string;
  seo_keywords?: string;
  is_published: boolean;
}

// ✅ Interface pour le contenu
interface ContentData {
  fr: string;
  mg: string;
}

// ============================================================
// COMPOSANTS
// ============================================================

function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
      isPublished 
        ? 'bg-green-100 text-green-700 border border-green-200' 
        : 'bg-gray-100 text-gray-500 border border-gray-200'
    }`}>
      {isPublished ? (
        <CheckCircle className="w-3 h-3 text-green-600" />
      ) : (
        <X className="w-3 h-3 text-gray-400" />
      )}
      {isPublished ? 'Publiee' : 'Brouillon'}
    </span>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function EditPagePage() {
  const params = useParams();
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  
  const pageKey = Array.isArray(params.key) ? params.key[0] : params.key as string;
  
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  // ✅ Contenu avec type correct
  const [content, setContent] = useState<ContentData>({
    fr: '',
    mg: '',
  });

  const isMounted = useRef(true);

  const hasAccess = user?.role === 'super_admin' || user?.role === 'admin';

  const getText = useCallback((fr: string, mg: string): string => {
    if (language === 'fr') {
      return fr || '';
    }
    return mg || fr || '';
  }, [language]);

  // Fonction pour obtenir le libelle d'une page
  const getPageLabel = useCallback((key: string): string => {
    const pageInfo = PAGE_KEYS[key];
    if (pageInfo) {
      return getText(pageInfo.labelFr, pageInfo.labelMg);
    }
    return key || '';
  }, [getText]);

  // ✅ Fonction pour mettre a jour le contenu FR
  const updateContentFr = (value: string) => {
    setContent(prev => ({ ...prev, fr: value }));
  };

  // ✅ Fonction pour mettre a jour le contenu MG
  const updateContentMg = (value: string) => {
    setContent(prev => ({ ...prev, mg: value }));
  };

  // ============================================================
  // CHARGEMENT DE LA PAGE
  // ============================================================

  const loadPage = useCallback(async () => {
    if (!token || !isMounted.current || !pageKey) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/pages/${pageKey}`);
      
      if (response.data && isMounted.current) {
        setPageData(response.data);
        setContent({
          fr: response.data.content_fr || '',
          mg: response.data.content_mg || '',
        });
        setError('');
      }
    } catch (error: any) {
      console.error('Erreur chargement page:', error);
      if (error.response?.status === 404) {
        setError(getText('Page non trouvee', 'Tsy hita ny pejy'));
      } else {
        setError(getText('Erreur de chargement', 'Nisy hadisoana'));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [pageKey, token, getText]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!hasAccess) {
      router.push('/dashboard');
    } else if (pageKey) {
      loadPage();
    }
  }, [isAuthenticated, hasAccess, router, pageKey, loadPage]);

  // ============================================================
  // SAUVEGARDE
  // ============================================================

  const handleSave = async () => {
    if (!pageData) return;
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await api.put(`/pages/${pageKey}`, {
        content_fr: content.fr,
        content_mg: content.mg,
        is_published: pageData.is_published,
      });
      
      setSuccess(getText('Page sauvegardee avec succes', 'Vita ny fitehirizana'));
      toast.success(getText('Page sauvegardee', 'Vita ny fitehirizana'));
      
      // Recharger les donnees
      loadPage();
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      const errorMsg = error.response?.data?.message || getText('Erreur lors de la sauvegarde', 'Nisy hadisoana');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    if (!pageData) return;
    
    try {
      await api.put(`/pages/${pageKey}`, {
        is_published: !pageData.is_published,
      });
      
      setPageData({ ...pageData, is_published: !pageData.is_published });
      toast.success(
        pageData.is_published 
          ? getText('Page depubliee', 'Navoaka') 
          : getText('Page publiee', 'Navoaka')
      );
      
      loadPage();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(getText('Erreur lors de la mise a jour', 'Nisy hadisoana'));
    }
  };

  // ============================================================
  // RENDU
  // ============================================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-800 animate-spin" />
        <p className="text-gray-500">{getText('Chargement...', 'Fandefasana...')}</p>
      </div>
    );
  }

  if (error && !pageData) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{getText('Erreur', 'Hadisoana')}</h3>
        <p className="text-gray-500">{error}</p>
        <Link href="/dashboard/pages" className="mt-4 inline-flex items-center gap-2 text-blue-800 hover:underline">
          <ArrowLeft className="w-4 h-4" /> {getText('Retour aux pages', 'Hiverina any amin\'ny pejy')}
        </Link>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="text-center py-16">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{getText('Page non trouvee', 'Tsy hita ny pejy')}</h3>
        <Link href="/dashboard/pages" className="mt-4 inline-flex items-center gap-2 text-blue-800 hover:underline">
          <ArrowLeft className="w-4 h-4" /> {getText('Retour aux pages', 'Hiverina any amin\'ny pejy')}
        </Link>
      </div>
    );
  }

  const pageLabel = getPageLabel(pageKey);

  return (
    <div className="max-w-5xl mx-auto pb-8">
      
      {/* Navigation */}
      <div className="mb-6">
        <Link 
          href="/dashboard/pages" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-800 mb-3 transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          {getText('Retour aux pages', 'Hiverina any amin\'ny pejy')}
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center shadow-sm">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {getText('Modifier la page', 'Hanova ny pejy')}
              </h1>
              <p className="text-gray-500 text-sm">
                {pageLabel} <span className="text-gray-400">({pageKey})</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge isPublished={pageData.is_published} />
            <button
              onClick={togglePublish}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              {pageData.is_published ? (
                <span className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4" /> {getText('Depublier', 'Ajanony')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4" /> {getText('Publier', 'Avoahy')}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          
          {/* Contenu FR */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {getText('Contenu (francais)', 'Votoaty (frantsay)')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-800 transition"
              >
                {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPreview ? getText('Modifier', 'Hanova') : getText('Apercu', 'Topi-maso')}
              </button>
            </div>
            
            {showPreview ? (
              <div className="min-h-[200px] p-4 bg-gray-50 rounded-xl border border-gray-200 prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: content.fr || '<em>Aucun contenu</em>' }} />
              </div>
            ) : (
              <div className="quill-editor">
                <ReactQuill
                  theme="snow"
                  value={content.fr}
                  onChange={updateContentFr}
                  modules={QUILL_MODULES}
                  formats={QUILL_FORMATS}
                  placeholder={getText('Contenu de la page...', 'Votoatin\'ny pejy...')}
                />
              </div>
            )}
          </div>

          {/* Contenu MG */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {getText('Contenu (malagasy)', 'Votoaty (malagasy)')}
                <span className="text-xs text-gray-400 ml-2">({getText('Optionnel', 'Tsy voatery')})</span>
              </label>
            </div>
            <div className="quill-editor">
              <ReactQuill
                theme="snow"
                value={content.mg}
                onChange={updateContentMg}
                modules={QUILL_MODULES}
                formats={QUILL_FORMATS}
                placeholder="Votoatin'ny pejy..."
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Link
              href="/dashboard/pages"
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-medium"
            >
              <X className="w-4 h-4" /> {getText('Annuler', 'Aoka')}
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm font-medium"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {getText('Enregistrement...', 'Fitehirizana...')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {getText('Enregistrer', 'Tehirizo')}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <style jsx global>{`
        .quill-editor .ql-container {
          min-height: 200px;
          font-size: 15px;
          border-radius: 0 0 10px 10px;
        }
        .quill-editor .ql-editor {
          min-height: 200px;
        }
        .quill-editor .ql-toolbar {
          border-radius: 10px 10px 0 0;
          border-color: #e5e7eb;
          background-color: #f9fafb;
        }
        .quill-editor .ql-container {
          border-color: #e5e7eb;
        }
        .prose {
          max-width: none;
        }
        .prose h1, .prose h2, .prose h3, .prose h4 {
          font-weight: bold;
          margin: 0.5rem 0;
        }
        .prose p {
          margin: 0.5rem 0;
        }
        .prose ul, .prose ol {
          margin: 0.5rem 0 0.5rem 1.5rem;
        }
        .prose li {
          margin: 0.2rem 0;
        }
        .prose blockquote {
          border-left: 4px solid #1E3A8A;
          padding-left: 1rem;
          margin: 0.5rem 0;
          color: #4b5563;
        }
        .prose code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em;
        }
        .prose a {
          color: #1E3A8A;
          text-decoration: underline;
        }
        .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}