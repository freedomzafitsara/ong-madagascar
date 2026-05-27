// src/app/dashboard/partners/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Handshake, Search, Plus, RefreshCw, Loader2,
  Eye, Edit, Trash2, Building, Mail, Phone, Globe,
  CheckCircle, XCircle, Star, ExternalLink,
  ChevronLeft, ChevronRight, Briefcase, Calendar,
  AlertCircle, X, Upload, ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

interface Partner {
  id: string;
  name: string;
  name_mg: string | null;
  logo_url: string | null;
  website: string | null;
  description: string;
  description_mg: string | null;
  partner_type: 'company' | 'ngo' | 'embassy' | 'institution';
  is_featured: boolean;
  contract_url: string | null;
  contribution_amount: number | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

interface PartnerFormData {
  name: string;
  name_mg: string;
  logo_url: string | null;
  website: string;
  description: string;
  description_mg: string;
  partner_type: 'company' | 'ngo' | 'embassy' | 'institution';
  is_featured: boolean;
  contract_url: string;
  contribution_amount: string;
  contact_email: string;
  contact_phone: string;
}

const typeOptions = [
  { value: 'company', label: 'Entreprise', icon: Building, color: 'bg-blue-100 text-blue-700' },
  { value: 'ngo', label: 'ONG', icon: Handshake, color: 'bg-green-100 text-green-700' },
  { value: 'embassy', label: 'Ambassade', icon: Globe, color: 'bg-purple-100 text-purple-700' },
  { value: 'institution', label: 'Institution', icon: Briefcase, color: 'bg-yellow-100 text-yellow-700' },
];

export default function DashboardPartnersPage() {
  const { token, user, isAuthenticated } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete' | 'view'>('create');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    featured: 0,
    byType: { company: 0, ngo: 0, embassy: 0, institution: 0 }
  });
  
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    name_mg: '',
    logo_url: null,
    website: '',
    description: '',
    description_mg: '',
    partner_type: 'company',
    is_featured: false,
    contract_url: '',
    contribution_amount: '',
    contact_email: '',
    contact_phone: '',
  });

  const hasAccess = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff';
  const itemsPerPage = 10;
  const totalPages = Math.ceil(partners.length / itemsPerPage);
  const paginatedPartners = partners.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleLogoUpload = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return null;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 2MB');
      return null;
    }

    setUploadingLogo(true);
    const formDataImg = new FormData();
    formDataImg.append('file', file);
    formDataImg.append('folder', 'partners');

    try {
      const response = await fetch(`${API_URL}/upload/single`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataImg
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Logo uploadé avec succès');
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
      setUploadingLogo(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await handleLogoUpload(file);
      if (url) {
        setFormData({ ...formData, logo_url: url });
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fetchPartners = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/partners`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setPartners(data.data);
        } else if (Array.isArray(data)) {
          setPartners(data);
        } else {
          setPartners([]);
        }
        setCurrentPage(1);
      } else {
        toast.error('Erreur de chargement des partenaires');
        setPartners([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/partners/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats({
          total: data.total || 0,
          featured: data.featured || 0,
          byType: data.byType || { company: 0, ngo: 0, embassy: 0, institution: 0 }
        });
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
    fetchPartners();
    fetchStats();
  }, [isAuthenticated, hasAccess, fetchPartners, fetchStats]);

  const createPartner = async () => {
    if (!formData.name || !formData.description || !formData.contact_email) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        name_mg: formData.name_mg || null,
        logo_url: formData.logo_url || null,
        website: formData.website || null,
        description: formData.description,
        description_mg: formData.description_mg || null,
        partner_type: formData.partner_type,
        is_featured: formData.is_featured,
        contract_url: formData.contract_url || null,
        contribution_amount: formData.contribution_amount ? parseFloat(formData.contribution_amount) : null,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone || null,
      };
      
      const response = await fetch(`${API_URL}/partners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Partenaire créé avec succès');
        await fetchPartners();
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

  const updatePartner = async () => {
    if (!selectedPartner) return;
    if (!formData.name || !formData.description || !formData.contact_email) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        name_mg: formData.name_mg || null,
        logo_url: formData.logo_url || null,
        website: formData.website || null,
        description: formData.description,
        description_mg: formData.description_mg || null,
        partner_type: formData.partner_type,
        is_featured: formData.is_featured,
        contract_url: formData.contract_url || null,
        contribution_amount: formData.contribution_amount ? parseFloat(formData.contribution_amount) : null,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone || null,
      };
      
      const response = await fetch(`${API_URL}/partners/${selectedPartner.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Partenaire modifié avec succès');
        await fetchPartners();
        await fetchStats();
        setModalOpen(false);
        resetForm();
      } else {
        toast.error('Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const deletePartner = async () => {
    if (!selectedPartner) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/partners/${selectedPartner.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Partenaire supprimé avec succès');
        await fetchPartners();
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

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_URL}/partners/${id}/featured`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success(currentStatus ? 'Retiré de la une' : 'Mis à la une');
        await fetchPartners();
        await fetchStats();
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    }
  };

  const resetForm = () => {
    setModalOpen(false);
    setSelectedPartner(null);
    setModalMode('create');
    setFormData({
      name: '',
      name_mg: '',
      logo_url: null,
      website: '',
      description: '',
      description_mg: '',
      partner_type: 'company',
      is_featured: false,
      contract_url: '',
      contribution_amount: '',
      contact_email: '',
      contact_phone: '',
    });
  };

  const editPartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setFormData({
      name: partner.name,
      name_mg: partner.name_mg || '',
      logo_url: partner.logo_url,
      website: partner.website || '',
      description: partner.description,
      description_mg: partner.description_mg || '',
      partner_type: partner.partner_type,
      is_featured: partner.is_featured,
      contract_url: partner.contract_url || '',
      contribution_amount: partner.contribution_amount?.toString() || '',
      contact_email: partner.contact_email || '',
      contact_phone: partner.contact_phone || '',
    });
    setModalMode('edit');
    setModalOpen(true);
  };

  const viewPartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setModalMode('view');
    setModalOpen(true);
  };

  const getTypeBadge = (type: string) => {
    const t = typeOptions.find(opt => opt.value === type) || typeOptions[0];
    const Icon = t.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full ${t.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {t.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
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
        <p className="text-gray-500 font-medium">Chargement des partenaires...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête Y-Mad - Bleu */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Handshake className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gestion des partenaires</h1>
              <p className="text-blue-100 text-sm mt-0.5">
                Gérez les partenaires et sponsors de Y-Mad
              </p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setModalMode('create'); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
          >
            <Plus className="w-4 h-4" /> Nouveau partenaire
          </button>
        </div>
      </div>

      {/* Statistiques - Gris et Bleu */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
          <Handshake className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-500">Total partenaires</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
          <Star className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.featured}</p>
          <p className="text-xs text-gray-500">À la une</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
          <Building className="w-6 h-6 text-gray-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.byType?.company || 0}</p>
          <p className="text-xs text-gray-500">Entreprises</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm">
          <Globe className="w-6 h-6 text-gray-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{(stats.byType?.embassy || 0) + (stats.byType?.ngo || 0) + (stats.byType?.institution || 0)}</p>
          <p className="text-xs text-gray-500">Autres</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un partenaire..."
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
            {typeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <button
            onClick={() => { setSearchTerm(''); setFilterType(''); fetchPartners(); }}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" /> Réinitialiser
          </button>
        </div>
      </div>

      {/* Liste des partenaires AVEC LOGOS */}
      {partners.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm py-16 text-center border border-gray-200">
          <Handshake className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucun partenaire trouvé</p>
          <button onClick={() => { resetForm(); setModalMode('create'); setModalOpen(true); }} className="mt-3 text-blue-600 hover:underline font-medium">
            Ajouter votre premier partenaire
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partenaire</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">À la une</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedPartners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* Logo Cloudinary */}
                          {partner.logo_url ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm flex-shrink-0">
                              <img 
                                src={partner.logo_url} 
                                alt={partner.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  const parent = (e.target as HTMLImageElement).parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-blue-100"><svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /></svg></div>';
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Building className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800">{partner.name}</p>
                            {partner.name_mg && (
                              <p className="text-xs text-gray-400">{partner.name_mg}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getTypeBadge(partner.partner_type)}</td>
                      <td className="px-4 py-3">
                        {partner.contact_email && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 truncate max-w-[150px]">
                            <Mail className="w-3 h-3 flex-shrink-0" /> 
                            <span className="truncate">{partner.contact_email}</span>
                          </p>
                        )}
                        {partner.contact_phone && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" /> {partner.contact_phone}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {partner.is_featured ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                            <Star className="w-3 h-3" /> À la une
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Non</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => viewPartner(partner)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Voir">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => editPartner(partner)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Modifier">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => toggleFeatured(partner.id, partner.is_featured)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition" title={partner.is_featured ? 'Retirer de la une' : 'Mettre à la une'}>
                            <Star className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setSelectedPartner(partner); setModalMode('delete'); setModalOpen(true); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Supprimer">
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

      {/* Modal Vue Détail avec logo Cloudinary */}
      {modalOpen && modalMode === 'view' && selectedPartner && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-5 border-b flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedPartner.name}</h2>
                {selectedPartner.name_mg && (
                  <p className="text-sm text-gray-500">{selectedPartner.name_mg}</p>
                )}
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  {selectedPartner.logo_url ? (
                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                      <img 
                        src={selectedPartner.logo_url} 
                        alt={selectedPartner.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200"><svg class="w-12 h-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /></svg></div>';
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <Building className="w-12 h-12 text-blue-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium">{getTypeBadge(selectedPartner.partner_type)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">À la une</p>
                      <p className="font-medium">{selectedPartner.is_featured ? 'Oui' : 'Non'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email de contact</p>
                      <p className="font-medium">{selectedPartner.contact_email || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p className="font-medium">{selectedPartner.contact_phone || 'Non renseigné'}</p>
                    </div>
                    {selectedPartner.website && (
                      <div>
                        <p className="text-sm text-gray-500">Site web</p>
                        <a href={selectedPartner.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                          {selectedPartner.website}
                        </a>
                      </div>
                    )}
                    {selectedPartner.contribution_amount && (
                      <div>
                        <p className="text-sm text-gray-500">Contribution</p>
                        <p className="font-medium">{selectedPartner.contribution_amount.toLocaleString()} Ar</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedPartner.description}</p>
                {selectedPartner.description_mg && (
                  <>
                    <h3 className="font-semibold text-gray-800 mt-4 mb-2">Description (Malagasy)</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedPartner.description_mg}</p>
                  </>
                )}
              </div>

              <div className="mt-6 pt-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => { setModalOpen(false); editPartner(selectedPartner); }}
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
        </div>
      )}

      {/* Modal Formulaire (Create/Edit) */}
      {modalOpen && (modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Handshake className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {modalMode === 'create' ? 'Ajouter un partenaire' : 'Modifier le partenaire'}
                </h2>
              </div>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded-lg transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Upload logo Cloudinary */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  Logo du partenaire
                </label>
                <div className="flex items-center gap-4 flex-wrap">
                  {formData.logo_url && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-blue-200 shadow-sm">
                      <img 
                        src={formData.logo_url} 
                        alt="Logo" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logo_url: null })}
                        className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <div className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg transition ${
                      formData.logo_url ? 'border-gray-300 hover:border-blue-400' : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                    }`}>
                      {uploadingLogo ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <Upload className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="text-sm text-gray-600">
                        {uploadingLogo ? 'Upload en cours...' : (formData.logo_url ? 'Changer le logo' : 'Télécharger un logo')}
                      </span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploadingLogo}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Formats acceptés: JPG, PNG, WebP. Taille max: 2MB
                </p>
              </div>

              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom (Malagasy)</label>
                  <input
                    type="text"
                    value={formData.name_mg}
                    onChange={(e) => setFormData({...formData, name_mg: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact *</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={formData.partner_type}
                    onChange={(e) => setFormData({...formData, partner_type: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    {typeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Mettre à la une</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Malagasy)</label>
                <textarea
                  rows={4}
                  value={formData.description_mg}
                  onChange={(e) => setFormData({...formData, description_mg: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL du contrat</label>
                  <input
                    type="url"
                    value={formData.contract_url}
                    onChange={(e) => setFormData({...formData, contract_url: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant de contribution (Ar)</label>
                  <input
                    type="number"
                    value={formData.contribution_amount}
                    onChange={(e) => setFormData({...formData, contribution_amount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    min="0"
                    step="1000"
                  />
                </div>
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
                  onClick={modalMode === 'create' ? createPartner : updatePartner}
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 flex items-center gap-2 shadow-md"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {modalMode === 'create' ? 'Créer' : 'Modifier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {modalOpen && modalMode === 'delete' && selectedPartner && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <p className="text-center text-gray-700">
                Êtes-vous sûr de vouloir supprimer <strong className="text-gray-800">{selectedPartner.name}</strong> ?
              </p>
              <p className="text-center text-sm text-gray-500 mt-1">Cette action est irréversible.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={deletePartner} disabled={saving} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
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