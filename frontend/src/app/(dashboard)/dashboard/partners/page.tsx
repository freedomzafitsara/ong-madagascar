'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Handshake, Search, Plus, Download, RefreshCw, Loader2,
  Eye, Edit, Trash2, Building, Mail, Phone, Globe,
  CheckCircle, XCircle, Star, ExternalLink, Filter,
  ChevronLeft, ChevronRight, Briefcase, Calendar
} from 'lucide-react';
import Link from 'next/link';

interface Partner {
  id: string;
  name: string;
  name_mg?: string;
  logo: string;
  website: string;
  email: string;
  phone: string;
  description: string;
  description_mg?: string;
  type: 'company' | 'ngo' | 'embassy' | 'institution';
  status: 'active' | 'pending' | 'inactive';
  isFeatured: boolean;
  partnershipDate: string;
  expiresAt?: string;
  createdAt: string;
}

export default function PartnersPage() {
  const { hasRole, token } = useAuth();
  const { language, t } = useLanguage();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const itemsPerPage = 10;

  // Vérification des droits
  if (!hasRole('super_admin') && !hasRole('admin') && !hasRole('staff')) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Handshake className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Accès non autorisé</h1>
          <p className="text-gray-500 mt-2">
            Vous n'avez pas les droits pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4001/partners', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPartners(data);
      } else {
        // Données de démonstration
        setPartners([
          {
            id: '1',
            name: 'Orange Madagascar',
            name_mg: 'Orange Madagasikara',
            logo: '',
            website: 'https://orange.mg',
            email: 'contact@orange.mg',
            phone: '+261 32 05 000 00',
            description: 'Opérateur télécommunications leader à Madagascar',
            description_mg: 'Mpandraharaha fifandraisan-davitra eto Madagasikara',
            type: 'company',
            status: 'active',
            isFeatured: true,
            partnershipDate: '2024-01-15',
            createdAt: '2024-01-15T00:00:00Z',
          },
          {
            id: '2',
            name: 'Ambassade de France',
            name_mg: 'Ambassade de France',
            logo: '',
            website: 'https://mg.ambafrance.org',
            email: 'contact@ambafrance.mg',
            phone: '+261 20 22 000 00',
            description: 'Soutien aux projets éducatifs et culturels',
            description_mg: 'Fanohanana ny tetikasa ara-pampianarana sy ara-kolontsaina',
            type: 'embassy',
            status: 'active',
            isFeatured: true,
            partnershipDate: '2024-03-10',
            createdAt: '2024-03-10T00:00:00Z',
          },
          {
            id: '3',
            name: 'Telma Madagascar',
            name_mg: 'Telma Madagasikara',
            logo: '',
            website: 'https://telma.mg',
            email: 'partenariat@telma.mg',
            phone: '+261 34 05 000 00',
            description: 'Partenariat pour l\'inclusion numérique',
            description_mg: 'Fiaraha-miasa amin\'ny fampidirana ny nomerika',
            type: 'company',
            status: 'active',
            isFeatured: false,
            partnershipDate: '2024-06-01',
            createdAt: '2024-06-01T00:00:00Z',
          },
          {
            id: '4',
            name: 'UNICEF Madagascar',
            name_mg: 'UNICEF Madagasikara',
            logo: '',
            website: 'https://unicef.org/madagascar',
            email: 'antananarivo@unicef.org',
            phone: '+261 20 23 000 00',
            description: 'Appui aux programmes jeunesse',
            description_mg: 'Fanohanana ny programa ho an\'ny tanora',
            type: 'ngo',
            status: 'pending',
            isFeatured: false,
            partnershipDate: '2024-08-20',
            createdAt: '2024-08-20T00:00:00Z',
          },
          {
            id: '5',
            name: 'Ministère de la Jeunesse',
            name_mg: 'Minisiteran\'ny Tanora',
            logo: '',
            website: 'https://jeunesse.gov.mg',
            email: 'contact@jeunesse.gov.mg',
            phone: '+261 20 22 111 11',
            description: 'Partenariat institutionnel',
            description_mg: 'Fiaraha-miasa ara-dalàna',
            type: 'institution',
            status: 'active',
            isFeatured: true,
            partnershipDate: '2024-02-01',
            createdAt: '2024-02-01T00:00:00Z',
          },
        ]);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePartner = async (id: string, name: string) => {
    if (!confirm(`Supprimer le partenaire "${name}" ?`)) return;
    try {
      const response = await fetch(`http://localhost:4001/partners/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: `Partenaire "${name}" supprimé` });
        fetchPartners();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, { fr: string; mg: string; className: string }> = {
      company: { fr: 'Entreprise', mg: 'Orinasa', className: 'bg-blue-100 text-blue-700' },
      ngo: { fr: 'ONG', mg: 'ONG', className: 'bg-green-100 text-green-700' },
      embassy: { fr: 'Ambassade', mg: 'Ambassade', className: 'bg-purple-100 text-purple-700' },
      institution: { fr: 'Institution', mg: 'Andrim-panjakana', className: 'bg-yellow-100 text-yellow-700' },
    };
    const config = types[type] || types.company;
    return <span className={`px-2 py-1 text-xs rounded-full ${config.className}`}>{config.fr}</span>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Actif</span>;
    }
    if (status === 'pending') {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">En attente</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 flex items-center gap-1"><XCircle className="w-3 h-3" />Inactif</span>;
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          partner.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || partner.type === filterType;
    const matchesStatus = filterStatus === 'all' || partner.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const paginatedPartners = filteredPartners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);

  const stats = {
    total: partners.length,
    active: partners.filter(p => p.status === 'active').length,
    pending: partners.filter(p => p.status === 'pending').length,
    featured: partners.filter(p => p.isFeatured).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message de notification */}
      {message && (
        <div className={`p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Handshake className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Partenaires</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">Gérez les partenaires et sponsors de l'association</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchPartners} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 text-gray-600" />
            Actualiser
          </button>
          <Link href="/dashboard/partners/new" className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Nouveau partenaire
          </Link>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 text-gray-600" />
            Exporter
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total partenaires</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Partenaires actifs</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">En attente</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">À la une</p>
          <p className="text-2xl font-bold text-blue-600">{stats.featured}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un partenaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Tous les types</option>
            <option value="company">Entreprises</option>
            <option value="ngo">ONG</option>
            <option value="embassy">Ambassades</option>
            <option value="institution">Institutions</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Tous statuts</option>
            <option value="active">Actifs</option>
            <option value="pending">En attente</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
      </div>

      {/* Tableau des partenaires */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partenaire</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partenariat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedPartners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{partner.name}</p>
                        {partner.isFeatured && (
                          <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
                            <Star className="w-3 h-3" /> À la une
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getTypeLabel(partner.type)}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600 flex items-center gap-1"><Mail className="w-3 h-3" />{partner.email}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{partner.phone}</p>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(partner.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(partner.partnershipDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <a href={partner.website} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-500 hover:text-blue-600">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button className="p-1 text-gray-500 hover:text-blue-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePartner(partner.id, partner.name)}
                        className="p-1 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredPartners.length)} sur {filteredPartners.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}