// src/types/audit.ts

// ========================================
// 1. TYPES PRINCIPAUX
// ========================================

export interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  user_role: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'VIEW' | 'CONFIRM';
  entity: string;
  entity_id: string;
  old_data?: any;
  new_data?: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  status: 'SUCCESS' | 'FAILURE';
  error_message?: string;
}

// ========================================
// 2. TYPES POUR LES FILTRES
// ========================================

export interface AuditFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  action?: string;
  entity?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ========================================
// 3. TYPES POUR LES RÉPONSES PAGINÉES
// ========================================

export interface AuditPaginatedResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========================================
// 4. TYPES POUR LES STATISTIQUES D'AUDIT
// ========================================

export interface AuditStats {
  total: number;
  byAction: Record<string, number>;
  byEntity: Record<string, number>;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  uniqueUsers: number;
  successRate: number;
  failureRate: number;
}

// ========================================
// 5. CONSTANTES POUR LES ACTIONS
// ========================================

export const AUDIT_ACTIONS = [
  { value: 'CREATE', label: 'Création', color: 'bg-green-100 text-green-700', icon: 'Plus' },
  { value: 'UPDATE', label: 'Modification', color: 'bg-blue-100 text-blue-700', icon: 'Edit' },
  { value: 'DELETE', label: 'Suppression', color: 'bg-red-100 text-red-700', icon: 'Trash2' },
  { value: 'LOGIN', label: 'Connexion', color: 'bg-purple-100 text-purple-700', icon: 'LogIn' },
  { value: 'LOGOUT', label: 'Déconnexion', color: 'bg-gray-100 text-gray-700', icon: 'LogOut' },
  { value: 'EXPORT', label: 'Export', color: 'bg-yellow-100 text-yellow-700', icon: 'Download' },
  { value: 'VIEW', label: 'Visualisation', color: 'bg-indigo-100 text-indigo-700', icon: 'Eye' },
  { value: 'CONFIRM', label: 'Confirmation', color: 'bg-emerald-100 text-emerald-700', icon: 'CheckCircle' }
] as const;

// ========================================
// 6. CONSTANTES POUR LES ENTITÉS
// ========================================

export const AUDIT_ENTITIES = [
  { value: 'users', label: 'Utilisateurs' },
  { value: 'projects', label: 'Projets' },
  { value: 'jobs', label: 'Offres d emploi' },
  { value: 'applications', label: 'Candidatures' },
  { value: 'events', label: 'Événements' },
  { value: 'donations', label: 'Dons' },
  { value: 'members', label: 'Membres' },
  { value: 'volunteers', label: 'Bénévoles' },
  { value: 'blog', label: 'Blog' },
  { value: 'partners', label: 'Partenaires' },
  { value: 'beneficiaries', label: 'Bénéficiaires' },
  { value: 'backgrounds', label: 'Fonds d écran' },
  { value: 'pages', label: 'Pages' }
] as const;

// ========================================
// 7. FONCTIONS UTILITAIRES
// ========================================

export const getActionLabel = (action: string): string => {
  const found = AUDIT_ACTIONS.find(a => a.value === action);
  return found?.label || action;
};

export const getActionColor = (action: string): string => {
  const found = AUDIT_ACTIONS.find(a => a.value === action);
  return found?.color || 'bg-gray-100 text-gray-700';
};

export const getEntityLabel = (entity: string): string => {
  const found = AUDIT_ENTITIES.find(e => e.value === entity);
  return found?.label || entity;
};

export const getStatusBadge = (status: string) => {
  if (status === 'SUCCESS') {
    return { bg: 'bg-green-100', text: 'text-green-700', label: 'Succès' };
  }
  return { bg: 'bg-red-100', text: 'text-red-700', label: 'Échec' };
};

// ========================================
// 8. INTERFACE POUR LE SERVICE D'AUDIT
// ========================================

export interface AuditServiceInterface {
  getAll: (filters?: AuditFilters) => Promise<AuditPaginatedResponse>;
  getById: (id: string) => Promise<AuditLog>;
  getStats: (filters?: AuditFilters) => Promise<AuditStats>;
  export: (filters?: AuditFilters, format?: 'csv' | 'json') => Promise<Blob>;
  getActions: () => typeof AUDIT_ACTIONS;
  getEntities: () => typeof AUDIT_ENTITIES;
}