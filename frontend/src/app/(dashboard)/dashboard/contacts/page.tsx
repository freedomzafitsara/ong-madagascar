// frontend/src/app/(dashboard)/dashboard/contacts/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { 
  Mail, Search, RefreshCw, Loader2, Eye, Reply,
  CheckCircle, AlertCircle, Calendar, User,
  Phone, MessageSquare, Archive, Trash2,
  ChevronLeft, ChevronRight, Download,
  X, Send, AtSign, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// ============================================================
// INTERFACES
// ============================================================

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  admin_notes?: string;
  created_at: string;
}

interface ContactStats {
  total: number;
  unread: number;
  read: number;
  replied: number;
  archived: number;
}

// ============================================================
// CONSTANTES
// ============================================================

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: 'unread', label: 'Non lu', color: 'text-red-800', bg: 'bg-red-100', icon: AlertCircle },
  { value: 'read', label: 'Lu', color: 'text-blue-800', bg: 'bg-blue-100', icon: CheckCircle },
  { value: 'replied', label: 'Repondu', color: 'text-green-800', bg: 'bg-green-100', icon: Reply },
  { value: 'archived', label: 'Archive', color: 'text-gray-600', bg: 'bg-gray-100', icon: Archive }
];

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

const stripHtml = (html: string): string => {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

const getExcerpt = (html: string, maxLength: number = 80): string => {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// ============================================================
// COMPOSANTS
// ============================================================

function StatCard({ label, value, icon: Icon, isBlue = false, onClick }: { 
  label: string; value: number; icon: any; isBlue?: boolean; onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className={`rounded-xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${isBlue ? 'bg-blue-800 text-white' : 'bg-white border border-gray-200'}`}
    >
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

function StatusBadge({ status }: { status: string }) {
  const option = STATUS_OPTIONS.find(opt => opt.value === status);
  const Icon = option?.icon || AlertCircle;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${option?.bg} ${option?.color}`}>
      <Icon className="w-3 h-3" /> {option?.label || status}
    </span>
  );
}

// ============================================================
// MODAL DE DETAIL
// ============================================================

function MessageDetailModal({ 
  message, 
  onClose, 
  onUpdateStatus,
  onDelete,
  formatDate,
  getText,
  onSendReply
}: { 
  message: ContactMessage; 
  onClose: () => void; 
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  formatDate: (date: string) => string;
  getText: (fr: string, mg: string) => string;
  onSendReply: (id: string, reply: string, notes?: string) => Promise<void>;
}) {
  const [status, setStatus] = useState(message.status);
  const [updating, setUpdating] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [adminNotes, setAdminNotes] = useState(message.admin_notes || '');
  const [showReply, setShowReply] = useState(false);
  const [sending, setSending] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    await onUpdateStatus(message.id, newStatus);
    setStatus(newStatus);
    setUpdating(false);
  };

  const handleDelete = async () => {
    const confirmMsg = getText(
      `Supprimer le message de ${message.name} ?`,
      `Hofafana ny hafatra avy amin'i ${message.name} ?`
    );
    if (confirm(confirmMsg)) {
      await onDelete(message.id);
      onClose();
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error(getText('Veuillez saisir votre reponse', 'Ampidiro ny valinteninao'));
      return;
    }

    setSending(true);
    try {
      await onSendReply(message.id, replyText, adminNotes);
      toast.success(getText('Reponse envoyee avec succes au client', 'Vita ny fandefasana valiny ho an\'ny mpangataka'));
      setShowReply(false);
      setReplyText('');
      await onUpdateStatus(message.id, 'replied');
      onClose();
    } catch (error: any) {
      console.error('Erreur:', error);
      const errorMsg = error.response?.data?.message || error.message || getText('Erreur lors de l\'envoi de la reponse', 'Nisy hadisoana tamin\'ny fandefasana valiny');
      toast.error(errorMsg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        
        <div className="sticky top-0 bg-white px-6 py-5 border-b flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{getText('Detail du message', 'Antsipirihan\'ny hafatra')}</h2>
              <p className="text-sm text-gray-500">{getText('Message de', 'Hafatra avy amin\'i')} {message.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition">
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">{getText('Statut :', 'Sata :')}</span>
                <StatusBadge status={status} />
              </div>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none bg-white text-sm"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{getText('Nom complet', 'Anarana feno')}</p>
                  <p className="text-sm font-medium text-gray-800">{message.name}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                  <AtSign className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <a href={`mailto:${message.email}`} className="text-sm font-medium text-blue-800 hover:underline">
                    {message.email}
                  </a>
                </div>
              </div>
            </div>
            {message.phone && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{getText('Telephone', 'Telefaonina')}</p>
                    <p className="text-sm font-medium text-gray-800">{message.phone}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{getText('Date de reception', 'Daty nahazoana')}</p>
                  <p className="text-sm font-medium text-gray-800">{formatDate(message.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-800" />
              {getText('Sujet', 'Lohahevitra')}
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-800 font-medium">{message.subject}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-800" />
              {getText('Message', 'Hafatra')}
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: message.message }} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-800" />
              {getText('Notes internes', 'Fanamarihana')}
            </h3>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              onBlur={async () => {
                if (adminNotes !== message.admin_notes) {
                  try {
                    await api.patch(`/contact/${message.id}/status`, { admin_notes: adminNotes });
                    toast.success(getText('Notes sauvegardees', 'Vita ny fitehirizana'));
                  } catch (error) {
                    console.error('Erreur:', error);
                  }
                }
              }}
              placeholder={getText('Ajouter des notes internes...', 'Ampidiro fanamarihana...')}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none resize-none text-sm"
              rows={3}
            />
          </div>

          {!showReply ? (
            <button 
              onClick={() => setShowReply(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition"
            >
              <Reply className="w-4 h-4" /> {getText('Repondre', 'Valio')}
            </button>
          ) : (
            <div className="space-y-3 border rounded-xl p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  {getText('Votre reponse', 'Valinteninao')}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <span className="text-xs text-gray-400">
                  {getText('Le client recevra cette reponse par email', 'Hahazo valiny amin\'ny mail ny mpangataka')}
                </span>
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none resize-none"
                placeholder={getText('Saisissez votre reponse ici...', 'Ampidiro ny valinteninao eto...')}
              />
              <div className="flex gap-3">
                <button 
                  onClick={handleSendReply}
                  disabled={sending}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {getText('Envoyer la reponse', 'Alefaso ny valiny')}
                </button>
                <button 
                  onClick={() => setShowReply(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {getText('Annuler', 'Aoka')}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
            {getText('Fermer', 'Hidy')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE PRINCIPALE - CORRIGEE
// ============================================================

export default function ContactsPage() {
  const { token, user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState<ContactStats>({
    total: 0, unread: 0, read: 0, replied: 0, archived: 0
  });
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const initialLoaded = useRef(false);
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const hasAccess = user?.role === 'super_admin' || user?.role === 'admin';

  const getText = (fr: string, mg: string) => language === 'fr' ? fr : mg;

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return date;
    }
  };

  // ✅ loadMessages avec AbortController
  const loadMessages = useCallback(async () => {
    if (!token || !isMounted.current) return;

    // Annuler la requete precedente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    setLoading(true);
    try {
      const params: any = { page: currentPage, limit: ITEMS_PER_PAGE };
      if (filterStatus !== 'all') params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/contact', { 
        params,
        signal: controller.signal 
      });
      
      if (response.data && isMounted.current) {
        setMessages(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.total || 0);
      }
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        // Requete annulee volontairement
        return;
      }
      console.error('Erreur chargement messages:', error);
      if (isMounted.current) {
        toast.error(getText('Erreur de chargement', 'Nisy hadisoana'));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [currentPage, filterStatus, searchTerm, token, getText]);

  // ✅ loadStats
  const loadStats = useCallback(async () => {
    if (!token || !isMounted.current) return;
    try {
      const response = await api.get('/contact/stats');
      if (response.data && isMounted.current) {
        setStats({
          total: response.data.total || 0,
          unread: response.data.unread || 0,
          read: response.data.read || 0,
          replied: response.data.replied || 0,
          archived: response.data.archived || 0
        });
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  }, [token]);

  // ✅ loadAllData - avec verification du montage
  const loadAllData = useCallback(async () => {
    if (!token || !isMounted.current) return;
    try {
      await Promise.all([loadMessages(), loadStats()]);
    } catch (error) {
      console.error('Erreur chargement donnees:', error);
    }
  }, [loadMessages, loadStats, token]);

  // ✅ Montage / Demontage
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ✅ Redirection
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!hasAccess) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, hasAccess, router]);

  // ✅ Chargement initial UNIQUE
  useEffect(() => {
    if (token && !initialLoaded.current && isMounted.current) {
      initialLoaded.current = true;
      // Charger avec un delai pour eviter les conflits
      const timer = setTimeout(() => {
        loadAllData();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [token, loadAllData]);

  // ✅ Rechargement quand les filtres changent
  useEffect(() => {
    if (initialLoaded.current && token && isMounted.current) {
      const timer = setTimeout(() => {
        loadMessages();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentPage, filterStatus, searchTerm, loadMessages, token]);

  // ✅ updateStatus
  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/contact/${id}/status`, { status });
      toast.success(getText('Statut mis a jour', 'Vita ny fanovana sata'));
      setTimeout(() => {
        loadMessages();
        loadStats();
      }, 200);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(getText('Erreur lors de la mise a jour', 'Nisy hadisoana'));
    }
  };

  // ✅ deleteMessage
  const deleteMessage = async (id: string) => {
    try {
      await api.delete(`/contact/${id}`);
      toast.success(getText('Message supprime', 'Vita ny fanafoanana'));
      setTimeout(() => {
        loadMessages();
        loadStats();
      }, 200);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(getText('Erreur lors de la suppression', 'Nisy hadisoana'));
    }
  };

  // ✅ sendReply
  const sendReply = async (id: string, reply: string, notes?: string) => {
    try {
      const response = await api.post(`/contact/${id}/reply`, {
        reply: reply,
        admin_notes: notes || '',
      });
      return response.data;
    } catch (error: any) {
      console.error('Erreur sendReply:', error);
      if (error.response?.status === 404) {
        throw new Error('La route de reponse n\'existe pas.');
      }
      throw error;
    }
  };

  const handleRefresh = () => {
    loadMessages();
    loadStats();
    toast.success(getText('Donnees actualisees', 'Havaozina ny angona'));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setCurrentPage(1);
    toast.success(getText('Filtres effaces', 'Vonoina ny sivana'));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/contact/export', { 
        params: { status: filterStatus !== 'all' ? filterStatus : undefined },
        responseType: 'blob' 
      });
      
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `messages_contact_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(getText('Export reussi', 'Vita ny fanondrana'));
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error(getText('Erreur lors de l\'export', 'Nisy hadisoana tamin\'ny fanondrana'));
    } finally {
      setExporting(false);
    }
  };

  const handleStatusFilterClick = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  if (!isAuthenticated || !hasAccess) {
    return null;
  }

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-800 animate-spin" />
        <p className="text-gray-500">{getText('Chargement...', 'Fandefasana...')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center shadow-sm">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{getText('Messages de contact', 'Hafatra')}</h1>
            <p className="text-gray-500 text-sm">{getText('Gerez les messages recus', 'Fitantanana ny hafatra')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport} 
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-gray-600" />}
            <span className="text-sm text-gray-600">{getText('Exporter CSV', 'Hanondrana CSV')}</span>
          </button>
          <button 
            onClick={handleRefresh} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">{getText('Actualiser', 'Havaozina')}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard 
          label={getText('Total', 'Rehetra')} 
          value={stats.total} 
          icon={Mail} 
          isBlue={true}
          onClick={() => handleStatusFilterClick('all')}
        />
        <StatCard 
          label={getText('Non lus', 'Tsy novakiana')} 
          value={stats.unread} 
          icon={AlertCircle}
          onClick={() => handleStatusFilterClick('unread')}
        />
        <StatCard 
          label={getText('Lus', 'Vakiana')} 
          value={stats.read} 
          icon={CheckCircle}
          onClick={() => handleStatusFilterClick('read')}
        />
        <StatCard 
          label={getText('Repondus', 'Valiana')} 
          value={stats.replied} 
          icon={Reply}
          onClick={() => handleStatusFilterClick('replied')}
        />
        <StatCard 
          label={getText('Archives', 'Tehirizina')} 
          value={stats.archived} 
          icon={Archive}
          onClick={() => handleStatusFilterClick('archived')}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={getText('Rechercher par nom, email...', 'Karohy...')}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-800 focus:border-blue-800 outline-none text-sm min-w-[150px]"
          >
            <option value="all">{getText('Tous les statuts', 'Sata rehetra')}</option>
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            <X className="w-4 h-4" /> {getText('Effacer les filtres', 'Fafao ny sivana')}
          </button>
        </div>
        
        {(searchTerm || filterStatus !== 'all') && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-full text-xs">
                Recherche: {searchTerm}
                <button onClick={() => setSearchTerm('')} className="hover:text-red-500">✕</button>
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-full text-xs">
                Statut: {STATUS_OPTIONS.find(o => o.value === filterStatus)?.label}
                <button onClick={() => setFilterStatus('all')} className="hover:text-red-500">✕</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Date', 'Daty')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Expediteur', 'Mpandefa')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Sujet / Message', 'Lohahevitra / Hafatra')}
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Statut', 'Sata')}
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {getText('Actions', 'Hetsika')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Mail className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">{getText('Aucun message trouve', 'Tsy misy hafatra hita')}</p>
                      <p className="text-sm text-gray-400">{getText('Modifiez vos filtres', 'Hanova ny sivanao')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                messages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(message.created_at).split(',')[0]}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{message.name}</p>
                        <p className="text-xs text-gray-500">{message.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-700 font-medium truncate">{message.subject}</p>
                        <div 
                          className="text-xs text-gray-500 truncate"
                          dangerouslySetInnerHTML={{ 
                            __html: getExcerpt(message.message, 60)
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={message.status} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button 
                        onClick={() => { setSelectedMessage(message); setShowDetailModal(true); }} 
                        className="p-2 text-gray-500 hover:text-blue-800 rounded-lg hover:bg-gray-100 transition"
                        title={getText('Voir le detail', 'Jereo ny antsipirihany')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <div className="text-sm text-gray-500">
            {getText('Page', 'Pejy')} {currentPage} / {totalPages} ({totalItems} {getText('messages', 'hafatra')})
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
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
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {showDetailModal && selectedMessage && (
        <MessageDetailModal
          message={selectedMessage}
          onClose={() => setShowDetailModal(false)}
          onUpdateStatus={updateStatus}
          onDelete={deleteMessage}
          formatDate={formatDate}
          getText={getText}
          onSendReply={sendReply}
        />
      )}
    </div>
  );
}