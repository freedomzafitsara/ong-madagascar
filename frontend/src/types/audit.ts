// src/types/audit.ts
export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'VIEW';
  entity: string; // Table name: 'users', 'projects', 'jobs', etc.
  entityId: string;
  oldData?: any;
  newData?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  status: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
}

export interface AuditFilters {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: string;
  entity?: string;
  status?: string;
}