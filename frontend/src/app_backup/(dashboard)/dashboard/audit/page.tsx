// src/app/(dashboard)/dashboard/audit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Calendar, Eye, 
  CheckCircle, AlertCircle, Clock, User, 
  Shield, Activity, FileText, Trash2, Edit, LogIn,
  X, ChevronLeft, ChevronRight
} from 'lucide-react';

interface AuditLog {
  id: number;
  user: string;
  userRole?: string;
  action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'CONFIRM' | 'EXPORT' | 'VIEW';
  entity: string;
  entityId: string;
  timestamp: string;
  ip: string;
  details: string;
  status?: 'SUCCESS' | 'FAILURE';
  oldData?: string;
  newData?: string;
}

interface AuditStats {
  total: number;
  byAction: Record<string, number>;
  todayCount: number;
  uniqueUsers: number;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [stats, setStats] = useState<AuditStats>({
    total: 0,
    byAction: {},
    todayCount: 0,
    uniqueUsers: 0
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Charger les logs depuis localStorage ou utiliser des données mock
    const storedLogs = localStorage.getItem('ymad_audit_logs');
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    } else {
      // Données mock enrichies
      const mockLogs: AuditLog[] = [
        { 
          id: 1, 
          user: 'admin@y-mad.mg', 
          userRole: 'Super Admin',
          action: 'LOGIN', 
          entity: 'Auth', 
          entityId: '-', 
          timestamp: new Date().toLocaleString('fr-FR'), 
          ip: '192.168.1.1', 
          details: 'Connexion réussie depuis Chrome',
          status: 'SUCCESS'
        },
        { 
          id: 2, 
          user: 'admin@y-mad.mg', 
          userRole: 'Super Admin',
          action: 'CREATE', 
          entity: 'Project', 
          entityId: 'PROJ-001', 
          timestamp: new Date(Date.now() - 3600000).toLocaleString('fr-FR'), 
          ip: '192.168.1.1', 
          details: 'Création du projet "Éducation pour tous"',
          status: 'SUCCESS',
          newData: '{"title":"Éducation pour tous","budget":50000000}'
        },
        { 
          id: 3, 
          user: 'staff@y-mad.mg', 
          userRole: 'Staff',
          action: 'UPDATE', 
          entity: 'Beneficiary', 
          entityId: 'BEN-012', 
          timestamp: new Date(Date.now() - 7200000).toLocaleString('fr-FR'), 
          ip: '192.168.1.2', 
          details: 'Mise à jour des informations du bénéficiaire',
          status: 'SUCCESS',
          oldData: '{"status":"pending"}',
          newData: '{"status":"active"}'
        },
        { 
          id: 4, 
          user: 'staff@y-mad.mg', 
          userRole: 'Staff',
          action: 'CONFIRM', 
          entity: 'Donation', 
          entityId: 'DON-045', 
          timestamp: new Date(Date.now() - 86400000).toLocaleString('fr-FR'), 
          ip: '192.168.1.2', 
          details: 'Confirmation de don de 50 000 Ar',
          status: 'SUCCESS'
        },
        { 
          id: 5, 
          user: 'admin@y-mad.mg', 
          userRole: 'Super Admin',
          action: 'DELETE', 
          entity: 'User', 
          entityId: 'USR-008', 
          timestamp: new Date(Date.now() - 172800000).toLocaleString('fr-FR'), 
          ip: '192.168.1.1', 
          details: 'Suppression du compte utilisateur inactif',
          status: 'SUCCESS'
        },
        { 
          id: 6, 
          user: 'user@y-mad.mg', 
          userRole: 'Member',
          action: 'LOGIN', 
          entity: 'Auth', 
          entityId: '-', 
          timestamp: new Date(Date.now() - 259200000).toLocaleString('fr-FR'), 
          ip: '192.168.1.3', 
          details: 'Tentative de connexion échouée',
          status: 'FAILURE'
        },
        { 
          id: 7, 
          user: 'admin@y-mad.mg', 
          userRole: 'Super Admin',
          action: 'EXPORT', 
          entity: 'Report', 
          entityId: 'RPT-001', 
          timestamp: new Date(Date.now() - 345600000).toLocaleString('fr-FR'), 
          ip: '192.168.1.1', 
          details: 'Export du rapport d\'activité en PDF',
          status: 'SUCCESS'
        },
      ];
      setLogs(mockLogs);
      localStorage.setItem('ymad_audit_logs', JSON.stringify(mockLogs));
    }
  }, []);

  useEffect(() => {
    filterLogs();
    calculateStats();
  }, [logs, filter, searchTerm, dateFilter]);

  const filterLogs = (): void => {
    let filtered = [...logs];
    
    // Filtre par action
    if (filter !== 'all') {
      filtered = filtered.filter(log => log.action === filter.toUpperCase());
    }
    
    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtre par date
    const now = new Date();
    if (dateFilter === 'today') {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate.toDateString() === now.toDateString();
      });
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      filtered = filtered.filter(log => new Date(log.timestamp) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      filtered = filtered.filter(log => new Date(log.timestamp) >= monthAgo);
    }
    
    // Tri par date décroissante
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const calculateStats = (): void => {
    const byAction: Record<string, number> = {};
    logs.forEach(log => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
    });
    
    const today = new Date().toDateString();
    const todayCount = logs.filter(log => new Date(log.timestamp).toDateString() === today).length;
    
    const uniqueUsers = new Set(logs.map(log => log.user)).size;
    
    setStats({
      total: logs.length,
      byAction,
      todayCount,
      uniqueUsers
    });
  };

  const getActionColor = (action: string): string => {
    const colors: Record<string, string> = {
      'LOGIN': 'bg-blue-100 text-blue-700',
      'LOGOUT': 'bg-gray-100 text-gray-700',
      'CREATE': 'bg-green-100 text-green-700',
      'UPDATE': 'bg-amber-100 text-amber-700',
      'DELETE': 'bg-red-100 text-red-700',
      'CONFIRM': 'bg-purple-100 text-purple-700',
      'EXPORT': 'bg-indigo-100 text-indigo-700',
      'VIEW': 'bg-cyan-100 text-cyan-700',
    };
    return colors[action] || 'bg-gray-100 text-gray-700';
  };

  const getActionIcon = (action: string): React.ReactNode => {
    const icons: Record<string, React.ReactNode> = {
      'LOGIN': <LogIn className="w-3 h-3" />,
      'LOGOUT': <LogIn className="w-3 h-3" />,
      'CREATE': <CheckCircle className="w-3 h-3" />,
      'UPDATE': <Edit className="w-3 h-3" />,
      'DELETE': <Trash2 className="w-3 h-3" />,
      'CONFIRM': <CheckCircle className="w-3 h-3" />,
      'EXPORT': <Download className="w-3 h-3" />,
      'VIEW': <Eye className="w-3 h-3" />,
    };
    return icons[action] || <Activity className="w-3 h-3" />;
  };

  const getStatusBadge = (status?: string): React.ReactNode => {
    if (!status) return null;
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {status === 'SUCCESS' ? 'Succès' : 'Échec'}
      </span>
    );
  };

  const exportToCSV = (): void => {
    const headers = ['ID', 'Utilisateur', 'Action', 'Entité', 'ID Entité', 'Détails', 'Date/Heure', 'IP', 'Statut'];
    const rows = filteredLogs.map(log => [
      log.id,
      log.user,
      log.action,
      log.entity,
      log.entityId,
      log.details,
      log.timestamp,
      log.ip,
      log.status || ''
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = (): void => {
    setFilter('all');
    setSearchTerm('');
    setDateFilter('all');
  };

  const viewDetails = (log: AuditLog): void => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-600" />
            Journal d'audit
          </h1>
          <p className="text-gray-500 mt-1">Suivi de toutes les actions importantes du système</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Total actions</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Activity className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Aujourd'hui</p>
              <p className="text-2xl font-bold">{stats.todayCount}</p>
            </div>
            <Calendar className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm">Utilisateurs actifs</p>
              <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
            </div>
            <User className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-sm">Créations</p>
              <p className="text-2xl font-bold">{stats.byAction.CREATE || 0}</p>
            </div>
            <FileText className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4 border">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par utilisateur, action, entité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          {/* Filtre action */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">📋 Toutes actions</option>
            <option value="login">🔐 Connexions</option>
            <option value="logout">🚪 Déconnexions</option>
            <option value="create">➕ Créations</option>
            <option value="update">✏️ Modifications</option>
            <option value="delete">🗑️ Suppressions</option>
            <option value="confirm">✅ Confirmations</option>
            <option value="export">📥 Exports</option>
          </select>
          
          {/* Filtre date */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">📅 Toutes dates</option>
            <option value="today">📅 Aujourd'hui</option>
            <option value="week">📅 7 derniers jours</option>
            <option value="month">📅 30 derniers jours</option>
          </select>
          
          {/* Reset filters */}
          {(filter !== 'all' || searchTerm || dateFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 border rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Tableau des logs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Utilisateur</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Action</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Entité</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Détails</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Date/Heure</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">IP</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Statut</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun log d'audit trouvé</p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-sm text-gray-800">{log.user}</p>
                        {log.userRole && <p className="text-xs text-gray-400">{log.userRole}</p>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)} {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{log.entity}</p>
                      <p className="text-xs text-gray-400 font-mono">{log.entityId}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm max-w-xs truncate">{log.details}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {log.timestamp}
                      </p>
                    </td>
                    <td className="p-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{log.ip}</code>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => viewDetails(log)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Voir détails"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {filteredLogs.length} log{filteredLogs.length > 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Détails */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Détails de l'action
              </h2>
              <button onClick={() => setShowDetails(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Utilisateur</p>
                  <p className="font-medium">{selectedLog.user}</p>
                  {selectedLog.userRole && <p className="text-xs text-gray-400">{selectedLog.userRole}</p>}
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Action</p>
                  <span className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${getActionColor(selectedLog.action)}`}>
                    {getActionIcon(selectedLog.action)} {selectedLog.action}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Entité</p>
                  <p className="font-medium">{selectedLog.entity}</p>
                  <p className="text-xs font-mono text-gray-500">{selectedLog.entityId}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Adresse IP</p>
                  <code className="text-sm">{selectedLog.ip}</code>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                  <p className="text-xs text-gray-500">Date et heure</p>
                  <p className="font-medium">{selectedLog.timestamp}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                  <p className="text-xs text-gray-500">Détails</p>
                  <p className="text-sm">{selectedLog.details}</p>
                </div>
                {selectedLog.oldData && (
                  <div className="bg-yellow-50 p-3 rounded-lg col-span-1">
                    <p className="text-xs text-yellow-700">Anciennes données</p>
                    <pre className="text-xs mt-1 overflow-x-auto">{selectedLog.oldData}</pre>
                  </div>
                )}
                {selectedLog.newData && (
                  <div className="bg-green-50 p-3 rounded-lg col-span-1">
                    <p className="text-xs text-green-700">Nouvelles données</p>
                    <pre className="text-xs mt-1 overflow-x-auto">{selectedLog.newData}</pre>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end">
              <button onClick={() => setShowDetails(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}