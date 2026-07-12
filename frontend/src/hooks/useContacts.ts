// frontend/src/hooks/useContacts.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { contactService, ContactStatus } from '@/services/contact.service';
import { ContactMessage, ContactStats, ApiResponse } from '@/types/contact';
import toast from 'react-hot-toast';

interface UseContactsOptions {
  initialPage?: number;
  initialLimit?: number;
  autoLoad?: boolean;
}

export function useContacts(options: UseContactsOptions = {}) {
  const { initialPage = 1, initialLimit = 10, autoLoad = true } = options;

  // ============================================================
  // ÉTATS
  // ============================================================
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ContactStats>({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
    archived: 0,
  });
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ============================================================
  // REFS
  // ============================================================
  const isMounted = useRef<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initialLoadDone = useRef<boolean>(false);
  const loadingRef = useRef<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================
  // NETTOYAGE
  // ============================================================
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // ============================================================
  // CHARGEMENT DES MESSAGES
  // ============================================================
  const loadMessages = useCallback(async (): Promise<void> => {
    // Éviter les appels multiples simultanés
    if (loadingRef.current || !isMounted.current) {
      return;
    }

    loadingRef.current = true;

    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await contactService.getAllMessages({
        page,
        limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
      });

      if (isMounted.current && !controller.signal.aborted) {
        setMessages(response.data || []);
        setTotalItems(response.total || 0);
        setTotalPages(response.totalPages || 1);
      }
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return;
      }
      if (isMounted.current && !controller.signal.aborted) {
        setError(error.message || 'Erreur de chargement');
        console.error('Erreur loadMessages:', error);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        loadingRef.current = false;
      }
    }
  }, [page, limit, statusFilter, searchQuery]);

  // ============================================================
  // CHARGEMENT DES STATISTIQUES
  // ============================================================
  const loadStats = useCallback(async (): Promise<void> => {
    if (!isMounted.current) return;

    try {
      const data = await contactService.getStats();
      if (isMounted.current) {
        setStats({
          total: data.total || 0,
          unread: data.unread || 0,
          read: data.read || 0,
          replied: data.replied || 0,
          archived: data.archived || 0,
        });
      }
    } catch (error) {
      if (isMounted.current) {
        console.error('Erreur loadStats:', error);
      }
    }
  }, []);

  // ============================================================
  // CHARGEMENT COMPLET
  // ============================================================
  const loadAllData = useCallback(async (): Promise<void> => {
    if (!isMounted.current) return;
    try {
      await Promise.all([loadMessages(), loadStats()]);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }, [loadMessages, loadStats]);

  // ============================================================
  // MISE À JOUR DU STATUT
  // ============================================================
  const updateStatus = useCallback(
    async (id: string, status: ContactStatus): Promise<ContactMessage | undefined> => {
      try {
        const result = await contactService.updateStatus(id, { status });
        if (isMounted.current) {
          toast.success('Statut mis à jour');
          await loadStats();
          await loadMessages();
        }
        return result;
      } catch (error) {
        console.error('Erreur updateStatus:', error);
        toast.error('Erreur lors de la mise à jour');
        throw error;
      }
    },
    [loadMessages, loadStats]
  );

  // ============================================================
  // SUPPRESSION
  // ============================================================
  const deleteMessage = useCallback(
    async (id: string): Promise<{ success: boolean; message: string } | undefined> => {
      try {
        const result = await contactService.deleteMessage(id);
        if (isMounted.current) {
          toast.success('Message supprimé');
          await loadStats();
          await loadMessages();
        }
        return result;
      } catch (error) {
        console.error('Erreur deleteMessage:', error);
        toast.error('Erreur lors de la suppression');
        throw error;
      }
    },
    [loadMessages, loadStats]
  );

  // ============================================================
  // RÉPONSE
  // ============================================================
  const sendReply = useCallback(
    async (id: string, reply: string, notes?: string): Promise<ApiResponse<ContactMessage> | undefined> => {
      try {
        const result = await contactService.replyToMessage(id, { reply, admin_notes: notes });
        if (isMounted.current) {
          toast.success('Réponse envoyée');
          await loadStats();
          await loadMessages();
        }
        return result;
      } catch (error) {
        console.error('Erreur sendReply:', error);
        toast.error('Erreur lors de l\'envoi');
        throw error;
      }
    },
    [loadMessages, loadStats]
  );

  // ============================================================
  // EXPORT
  // ============================================================
  const exportMessages = useCallback(async (status?: ContactStatus | string): Promise<boolean> => {
    try {
      const blob = await contactService.exportMessages(status);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `messages_contact_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Export réussi');
      return true;
    } catch (error) {
      console.error('Erreur exportMessages:', error);
      toast.error('Erreur lors de l\'export');
      return false;
    }
  }, []);

  // ============================================================
  // NAVIGATION ET FILTRES
  // ============================================================
  const goToPage = useCallback((newPage: number): void => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const setFilter = useCallback((status: ContactStatus | 'all'): void => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  const setSearch = useCallback((query: string): void => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const refresh = useCallback((): void => {
    loadAllData();
  }, [loadAllData]);

  // ============================================================
  // EFFETS - CHARGEMENT INITIAL
  // ============================================================
  useEffect(() => {
    if (autoLoad && !initialLoadDone.current && isMounted.current) {
      initialLoadDone.current = true;
      loadAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  // ============================================================
  // EFFETS - RECHARGEMENT AVEC DEBOUNCE
  // ============================================================
  useEffect(() => {
    if (!autoLoad || !initialLoadDone.current || !isMounted.current) {
      return;
    }

    // Nettoyer le timer précédent
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      loadMessages();
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusFilter, searchQuery]);

  // ============================================================
  // RETURN
  // ============================================================
  return {
    // Données
    messages,
    stats,
    loading,
    error,
    totalItems,
    totalPages,
    page,
    limit,
    statusFilter,
    searchQuery,

    // Actions
    loadMessages,
    loadStats,
    loadAllData,
    updateStatus,
    deleteMessage,
    sendReply,
    exportMessages,
    goToPage,
    setFilter,
    setSearch,
    setLimit,
    refresh,

    // Utilitaires
    getStatusLabel: contactService.getStatusLabel,
    getStatusColor: contactService.getStatusColor,
    formatDate: contactService.formatDate,
    getMessageSummary: contactService.getMessageSummary,
    isUnread: contactService.isUnread,
    isRead: contactService.isRead,
    isReplied: contactService.isReplied,
    isArchived: contactService.isArchived,
    isValidStatus: contactService.isValidStatus,
    toValidStatus: contactService.toValidStatus,
  };
}

export default useContacts;