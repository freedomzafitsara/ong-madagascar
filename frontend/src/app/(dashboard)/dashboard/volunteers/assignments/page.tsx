'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, Edit, Trash2, Search, CheckCircle, AlertCircle, 
  Clock, MapPin, Mail, Phone, X, Heart, Users, Award,
  Calendar, Briefcase, Globe, Filter, RefreshCw, Loader2,
  ChevronLeft, ChevronRight, User, Star, TrendingUp, Activity,
  Download, FileText, Eye, Settings, Shield, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

// ============================================================
// TYPES
// ============================================================

interface Volunteer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  skills: string[];
  region: string;
  availability: string;
  availability_type: 'weekend' | 'weekday' | 'both';
  hours: number;
  status: 'active' | 'inactive';
  assignments?: {
    id: string;
    project_name: string;
    role: string;
    hours: number;
  }[];
  created_at: string;
  updated_at: string;
}

interface VolunteerFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  skills: string;
  region: string;
  availability: string;
  availability_type: 'weekend' | 'weekday' | 'both';
  hours: number;
  status: 'active' | 'inactive';
}

// ============================================================
// CONSTANTES
// ============================================================

const regions = [
  'Analamanga', 'Diana', 'Sava', 'Itasy', 'Vakinankaratra',
  'Bongolava', 'Sofia', 'Boeny', 'Betsiboka', 'Melaky',
  'Alaotra-Mangoro', 'Atsinanana', 'Analanjirofo', 'Amoron i Mania',
  'Haute Matsiatra', 'Vatovavy-Fitovinany', 'Ihorombe', 'Atsimo-Atsinanana',
  'Menabe', 'Atsimo-Andrefana', 'Androy', 'Anosy'
];

const availabilityOptions = [
  { value: 'weekend', label: 'Week-end', icon: Calendar },
  { value: 'weekday', label: 'Semaine', icon: Briefcase },
  { value: 'both', label: 'Les deux', icon: Activity }
];

const STORAGE_KEY = 'ymad_volunteers_data';

// ============================================================
// COMPOSANT BADGE STATUT (avec Clock correctement importe)
// ============================================================

function VolunteerStatusBadge({ status }: { status: 'active' | 'inactive' }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle className="w-3.5 h-3.5" />
        Actif
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
      <X className="w-3.5 h-3.5" />
      Inactif
    </span>
  );
}

// ============================================================
// COMPOSANT BADGE DISPONIBILITE
// ============================================================

function AvailabilityBadge({ type }: { type: 'weekend' | 'weekday' | 'both' }) {
  const config = {
    weekend: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Calendar, label: 'Week-end' },
    weekday: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Briefcase, label: 'Semaine' },
    both: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: Activity, label: 'Les deux' }
  };
  const c = config[type];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${c.bg} ${c.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {c.label}
    </span>
  );
}

// ============================================================
// COMPOSANT CARTE STATISTIQUE
// ============================================================

function StatCard({ label, value, icon: Icon, isBlue = false }: { 
  label: string; 
  value: number | string; 
  icon: any; 
  isBlue?: boolean;
}) {
  const bgClass = isBlue 
    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' 
    : 'bg-white border border-gray-200 text-gray-700';
  const iconClass = isBlue ? 'text-white/80' : 'text-blue-600';
  const valueClass = isBlue ? 'text-white' : 'text-gray-800';
  const labelClass = isBlue ? 'text-white/80' : 'text-gray-500';

  return (
    <div className={`rounded-2xl p-5 transition-all duration-200 hover:shadow-lg ${bgClass}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isBlue ? 'bg-white/20' : 'bg-blue-50'}`}>
        <Icon className={`w-5 h-5 ${iconClass}`} />
      </div>
      <p className={`text-2xl font-bold ${valueClass}`}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className={`text-xs font-medium mt-1 ${labelClass}`}>{label}</p>
    </div>
  );
}

// ============================================================
// COMPOSANT CARTE BENEVOLE
// ============================================================

function VolunteerCard({ 
  volunteer, 
  onEdit, 
  onDelete,
  canEdit 
}: { 
  volunteer: Volunteer; 
  onEdit: (volunteer: Volunteer) => void;
  onDelete: (id: string) => Promise<void>;
  canEdit: boolean;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Supprimer ${volunteer.first_name} ${volunteer.last_name} ? Cette action est irreversible.`)) {
      setDeleting(true);
      await onDelete(volunteer.id);
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        
        {/* Informations principales */}
        <div className="flex-1">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg text-gray-800">
              {volunteer.first_name} {volunteer.last_name}
            </h3>
            <VolunteerStatusBadge status={volunteer.status} />
            <AvailabilityBadge type={volunteer.availability_type} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2">
            <p className="text-gray-600 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              {volunteer.email}
            </p>
            {volunteer.phone && (
              <p className="text-gray-600 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {volunteer.phone}
              </p>
            )}
            <p className="text-gray-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {volunteer.region}
            </p>
            <p className="text-gray-600 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {volunteer.hours} heures effectuees
            </p>
          </div>
          
          {volunteer.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {volunteer.skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {skill}
                </span>
              ))}
              {volunteer.skills.length > 3 && (
                <span className="text-xs text-gray-400">+{volunteer.skills.length - 3}</span>
              )}
            </div>
          )}
          
          {volunteer.availability && (
            <p className="text-xs text-gray-400 mt-2 italic">
              {volunteer.availability}
            </p>
          )}
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(volunteer)}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Modifier"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Supprimer"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
            <Link
              href={`/dashboard/assignments?volunteerId=${volunteer.id}`}
              className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
              title="Voir les missions"
            >
              <Briefcase className="w-4 h-4" />
            </Link>
            <Link
              href={`/dashboard/certificates?volunteerId=${volunteer.id}`}
              className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
              title="Attestations"
            >
              <Award className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MODAL FORMULAIRE BENEVOLE
// ============================================================

function VolunteerModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  mode,
  volunteer,
  saving
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (data: VolunteerFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  mode: 'create' | 'edit' | 'delete';
  volunteer?: Volunteer | null;
  saving: boolean;
}) {
  const [formData, setFormData] = useState<VolunteerFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    skills: '',
    region: '',
    availability: '',
    availability_type: 'both',
    hours: 0,
    status: 'active'
  });

  useEffect(() => {
    if (mode === 'edit' && volunteer) {
      setFormData({
        first_name: volunteer.first_name,
        last_name: volunteer.last_name,
        email: volunteer.email,
        phone: volunteer.phone || '',
        skills: volunteer.skills.join(', '),
        region: volunteer.region,
        availability: volunteer.availability,
        availability_type: volunteer.availability_type || 'both',
        hours: volunteer.hours,
        status: volunteer.status
      });
    } else if (mode === 'create') {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        skills: '',
        region: '',
        availability: '',
        availability_type: 'both',
        hours: 0,
        status: 'active'
      });
    }
  }, [mode, volunteer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.region) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    await onSave(formData);
  };

  const handleDelete = async () => {
    if (volunteer && onDelete) {
      await onDelete(volunteer.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* En-tete */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                {mode === 'create' && 'Ajouter un benevole'}
                {mode === 'edit' && 'Modifier le benevole'}
                {mode === 'delete' && 'Supprimer un benevole'}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {mode === 'delete' ? (
            <div>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <p className="text-center text-gray-700">
                Etes-vous sur de vouloir supprimer <strong>{volunteer?.first_name} {volunteer?.last_name}</strong> ?
              </p>
              <p className="text-center text-sm text-gray-500 mt-2">Cette action est irreversible.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={handleDelete} disabled={saving} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Supprimer'}
                </button>
                <button onClick={onClose} className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prenom *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telephone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="034 00 000 00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Competences (separees par virgules)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="Informatique, Communication, Formation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  required
                >
                  <option value="">Selectionner une region</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilite</label>
                <div className="grid grid-cols-3 gap-2">
                  {availabilityOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({...formData, availability_type: opt.value as any})}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition ${
                        formData.availability_type === opt.value
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <opt.icon className="w-4 h-4" />
                      <span className="text-sm">{opt.label}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.availability}
                  onChange={(e) => setFormData({...formData, availability: e.target.value})}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="Precisions supplementaires..."
                />
              </div>

              {mode === 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heures effectuees</label>
                  <input
                    type="number"
                    value={formData.hours}
                    onChange={(e) => setFormData({...formData, hours: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    min="0"
                  />
                </div>
              )}

              {mode === 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (mode === 'create' ? 'Ajouter' : 'Modifier')}
                </button>
                <button type="button" onClick={onClose} className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function DashboardVolunteersPage() {
  const { token, user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete'>('create');
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const hasAccess = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff';

  // ============================================================
  // CHARGEMENT DES DONNEES DEPUIS L'API
  // ============================================================

  const fetchVolunteers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      if (selectedRegion) params.append('region', selectedRegion);
      if (selectedStatus) params.append('status', selectedStatus);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`${API_URL}/volunteers?${params.toString()}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setVolunteers(data.data || []);
      } else {
        console.error('Erreur API:', response.status);
        setVolunteers([]);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur de connexion au serveur');
      setVolunteers([]);
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, selectedRegion, selectedStatus, searchTerm]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!hasAccess) {
      router.push('/dashboard');
      return;
    }
    fetchVolunteers();
  }, [isAuthenticated, hasAccess, token, router, fetchVolunteers]);

  // ============================================================
  // ACTIONS CRUD
  // ============================================================

  const createVolunteer = async (data: VolunteerFormData) => {
    setSaving(true);
    try {
      const skillsArray = data.skills.split(',').map(s => s.trim()).filter(s => s !== '');
      
      const newVolunteer = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        skills: skillsArray,
        region: data.region,
        availability: data.availability,
        availability_type: data.availability_type,
        status: 'active'
      };
      
      const response = await fetch(`${API_URL}/volunteers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newVolunteer)
      });
      
      if (response.ok) {
        toast.success('Benevole ajoute avec succes');
        await fetchVolunteers();
        setModalOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors de l ajout');
      }
    } catch (error) {
      console.error('Erreur creation:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setSaving(false);
    }
  };

  const updateVolunteer = async (data: VolunteerFormData) => {
    if (!selectedVolunteer) return;
    setSaving(true);
    
    try {
      const skillsArray = data.skills.split(',').map(s => s.trim()).filter(s => s !== '');
      
      const updatedVolunteer = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        skills: skillsArray,
        region: data.region,
        availability: data.availability,
        availability_type: data.availability_type,
        hours: data.hours,
        status: data.status
      };
      
      const response = await fetch(`${API_URL}/volunteers/${selectedVolunteer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedVolunteer)
      });
      
      if (response.ok) {
        toast.success('Benevole modifie avec succes');
        await fetchVolunteers();
        setModalOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur modification:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setSaving(false);
    }
  };

  const deleteVolunteer = async (id: string) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/volunteers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success('Benevole supprime avec succes');
        await fetchVolunteers();
        setModalOpen(false);
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // EXPORT CSV
  // ============================================================

  const exportToCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedRegion) params.append('region', selectedRegion);
      if (selectedStatus) params.append('status', selectedStatus);
      
      const response = await fetch(`${API_URL}/volunteers/export?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `benevoles_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Export CSV reussi');
      } else {
        toast.error('Erreur lors de l export');
      }
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Erreur de connexion au serveur');
    }
  };

  // ============================================================
  // STATISTIQUES
  // ============================================================

  const totalVolunteers = volunteers.length;
  const activeVolunteers = volunteers.filter(v => v.status === 'active').length;
  const totalHours = volunteers.reduce((sum, v) => sum + v.hours, 0);
  const uniqueRegions = new Set(volunteers.map(v => v.region)).size;

  // ============================================================
  // FILTRES
  // ============================================================

  const filteredVolunteers = volunteers.filter(v => {
    const matchSearch = searchTerm === '' || 
      `${v.first_name} ${v.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRegion = selectedRegion === '' || v.region === selectedRegion;
    const matchStatus = selectedStatus === '' || v.status === selectedStatus;
    return matchSearch && matchRegion && matchStatus;
  });

  const paginatedVolunteers = filteredVolunteers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredVolunteers.length / itemsPerPage);

  // ============================================================
  // RENDU CONDITIONNEL
  // ============================================================

  if (!isAuthenticated || !hasAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Acces non autorise</h1>
          <p className="text-gray-500 mt-2">Vous n'avez pas les droits pour acceder a cette page.</p>
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
        <p className="text-gray-500 font-medium">Chargement des benevoles...</p>
      </div>
    );
  }

  // ============================================================
  // RENDU PRINCIPAL
  // ============================================================

  return (
    <div className="space-y-6">
      
      {/* EN-TETE Y-Mad */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Gestion des benevoles</h1>
                <p className="text-blue-100 text-sm mt-0.5">
                  Ge.rez les benevoles et leurs heures de benevolat
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition text-white"
            >
              <Download className="w-4 h-4" /> Exporter CSV
            </button>
            <button 
              onClick={() => { setModalMode('create'); setSelectedVolunteer(null); setModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition text-white"
            >
              <Plus className="w-4 h-4" /> Nouveau benevole
            </button>
          </div>
        </div>
      </div>

      {/* STATISTIQUES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total benevoles" value={totalVolunteers} icon={Users} />
        <StatCard label="Benevoles actifs" value={activeVolunteers} icon={CheckCircle} isBlue />
        <StatCard label="Heures totales" value={`${totalHours} h`} icon={Clock} />
        <StatCard label="Regions couvertes" value={uniqueRegions} icon={MapPin} />
      </div>

      {/* FILTRES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="">Toutes les regions</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedRegion('');
              setSelectedStatus('');
              setCurrentPage(1);
              fetchVolunteers();
            }} 
            className="flex items-center gap-2 px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" /> Reinitialiser
          </button>
        </div>
      </div>

      {/* LISTE DES BENEVOLES */}
      {filteredVolunteers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Aucun benevole trouve</h3>
            <p className="text-gray-500 text-sm">
              Aucun benevole ne correspond a vos criteres de recherche.
            </p>
            <button
              onClick={() => { setModalMode('create'); setSelectedVolunteer(null); setModalOpen(true); }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Ajouter un benevole
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedVolunteers.map((volunteer) => (
            <VolunteerCard
              key={volunteer.id}
              volunteer={volunteer}
              onEdit={(v) => { setSelectedVolunteer(v); setModalMode('edit'); setModalOpen(true); }}
              onDelete={deleteVolunteer}
              canEdit={hasAccess}
            />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
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

      {/* MODAL FORMULAIRE */}
      <VolunteerModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedVolunteer(null); }}
        onSave={modalMode === 'create' ? createVolunteer : updateVolunteer}
        onDelete={deleteVolunteer}
        mode={modalMode}
        volunteer={selectedVolunteer}
        saving={saving}
      />
    </div>
  );
}