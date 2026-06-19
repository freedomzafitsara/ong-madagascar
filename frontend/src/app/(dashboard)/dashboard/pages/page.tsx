// frontend/src/app/(dashboard)/dashboard/pages/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, Search, RefreshCw, Loader2, Eye, Edit,
  CheckCircle, AlertCircle, Calendar, User,
  Globe, Lock, Unlock, X, Plus, ArrowRight,
  Home, FolderOpen, Briefcase, Mail, LogIn,
  LayoutDashboard, UserCircle, Info, HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// ============================================================
// INTERFACES
// ============================================================

interface PageContent {
  id: string;
  page_key: string;
  content_fr?: string;
  content_mg?: string;
  hero?: any;
  sections?: any[];
  stats?: any[];
  cta?: any;
  seo_title_fr?: string;
  seo_title_mg?: string;
  seo_description_fr?: string;
  seo_description_mg?: string;
  seo_keywords?: string;
  is_published: boolean;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

interface PageStats {
  total: number;
  published: number;
  draft: number;
}

// ============================================================
// CONSTANTES
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
// COMPOSANTS
// ============================================================

function StatCard({ label, value, icon: Icon, isBlue = false }: { 
  label: string; value: number; icon: any; isBlue?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 transition-all duration-200 hover:shadow-md ${isBlue ? 'bg-blue-800 text-white' : 'bg-white border border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-sm font-medium ${isBlue ? 'text-white/70' : 'text-gray-500'}`}>{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isBlue ? 'bg-white/20' : 'bg-gray-100'}`}>
          <Icon className={`w-4 h-4 ${isBlue ? 'text-white' : 'text-gray-600'}`} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${isBlue ? 'text-white' : 'text-gray-800'}`}>{value}</p>
    </div>
  );
}

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
// PAGE PRINCIPALE
// ============================================================

export default function PagesPage() {
  const { token, user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<PageStats>({
    total: 0,
    published: 0,
    draft: 0,
  });

  const isMounted = useRef(true);
  const initialLoaded = useRef(false);

  const hasAccess = user?.role === 'super_admin' || user?.role === 'admin';

  // ✅ Fonction getText securisee
  const getText = useCallback((fr: string, mg: string): string => {
    if (language === 'fr') {
      return fr || '';
    }
    return mg || fr || '';
  }, [language]);

  // ✅ Fonction pour obtenir le libelle d'une page
  const getPageLabel = useCallback((key: string): string => {
    const pageInfo = PAGE_KEYS[key];
    if (pageInfo) {
      return getText(pageInfo.labelFr, pageInfo.labelMg);
    }
    return key || '';
  }, [getText]);

  // ✅ Fonction pour obtenir l'icone d'une page
  const getPageIcon = useCallback((key: string): any => {
    const pageInfo = PAGE_KEYS[key];
    return pageInfo?.icon || FileText;
  }, []);

  // ============================================================
  // CHARGEMENT DES DONNEES
  // ============================================================

  const loadPages = useCallback(async () => {
    if (!token || !isMounted.current) return;
    
    setLoading(true);
    try {
      const response = await api.get('/pages');
      
      if (response.data && isMounted.current) {
        setPages(response.data || []);
        
        // Calcul des statistiques
        const published = response.data.filter((p: PageContent) => p.is_published).length;
        setStats({
          total: response.data.length,
          published: published,
          draft: response.data.length - published,
        });
      }
    } catch (error) {
      console.error('Erreur chargement pages:', error);
      toast.error(getText('Erreur de chargement', 'Nisy hadisoana'));
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [token, getText]);

  // ============================================================
  // HOOKS
  // ============================================================

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
    }
  }, [isAuthenticated, hasAccess, router]);

  useEffect(() => {
    if (token && !initialLoaded.current && isMounted.current) {
      initialLoaded.current = true;
      loadPages();
    }
  }, [token, loadPages]);

  // ============================================================
  // FILTRAGE - CORRIGE
  // ============================================================

  const filteredPages = pages.filter(page => {
    // ✅ Securiser la recherche
    const label = getPageLabel(page.page_key);
    const searchLower = (searchTerm || '').toLowerCase();
    
    return (label || '').toLowerCase().includes(searchLower) ||
           (page.page_key || '').toLowerCase().includes(searchLower);
  });

  // ============================================================
  // RENDU
  // ============================================================

  if (!isAuthenticated || !hasAccess) {
    return null;
  }

  if (loading && pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-800 animate-spin" />
        <p className="text-gray-500">{getText('Chargement des pages...', 'Fandefasana ny pejy...')}</p>
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
            <h1 className="text-2xl font-bold text-gray-800">{getText('Gestion des pages', 'Fitantanana ny pejy')}</h1>
            <p className="text-gray-500 text-sm">{getText('Gerez le contenu des pages du site', 'Tantano ny votoatin\'ny pejy')}</p>
          </div>
        </div>
        <button 
          onClick={loadPages} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-600">{getText('Actualiser', 'Havaozina')}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          label={getText('Total des pages', 'Pejy rehetra')} 
          value={stats.total} 
          icon={FileText} 
          isBlue={true}
        />
        <StatCard 
          label={getText('Publiees', 'Navoaka')} 
          value={stats.published} 
          icon={CheckCircle}
        />
        <StatCard 
          label={getText('Brouillons', 'Volavola')} 
          value={stats.draft} 
          icon={X}
        />
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={getText('Rechercher une page...', 'Karohy ny pejy...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none text-sm"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              <X className="w-4 h-4" /> {getText('Effacer', 'Fafao')}
            </button>
          )}
        </div>
      </div>

      {/* Liste des pages */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Page', 'Pejy')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Clé', 'Fanalahidy')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Statut', 'Sata')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Derniere modification', 'Fanovana farany')}
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Actions', 'Hetsika')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">{getText('Aucune page trouvee', 'Tsy misy pejy hita')}</p>
                      <p className="text-sm text-gray-400">{getText('Modifiez vos filtres', 'Hanova ny sivanao')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => {
                  const Icon = getPageIcon(page.page_key);
                  const label = getPageLabel(page.page_key);
                  
                  return (
                    <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="font-medium text-gray-800">{label}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {page.page_key}
                        </code>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge isPublished={page.is_published} />
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {page.updated_at ? new Date(page.updated_at).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/dashboard/pages/${page.page_key}/edit`}
                            className="p-2 text-gray-500 hover:text-blue-800 rounded-lg hover:bg-gray-100 transition"
                            title={getText('Modifier', 'Hanova')}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/${page.page_key === 'home' ? '' : page.page_key}`}
                            target="_blank"
                            className="p-2 text-gray-500 hover:text-blue-800 rounded-lg hover:bg-gray-100 transition"
                            title={getText('Voir sur le site', 'Jereo amin\'ny tranokala')}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400">
        {getText(
          'Les pages sont stockees dans la base de donnees PostgreSQL',
          'Ny pejy dia voatahiry ao amin\'ny base de donnees PostgreSQL'
        )}
      </div>
    </div>
  );
}