'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Plus, Edit, Trash2, Search, CheckCircle, AlertCircle, 
  Clock, MapPin, Mail, Phone, X, Heart, Users, Award,
  Calendar, Briefcase, Filter, RefreshCw, Loader2,
  ChevronLeft, ChevronRight, User, TrendingUp, Activity,
  Download, FileText, Camera, Upload, Image as ImageIcon
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
  photo_url: string | null;
  skills: string[];
  region: string;
  availability: string;
  availability_type: 'weekend' | 'weekday' | 'both';
  hours: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface VolunteerFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo_url: string | null;
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
// COMPOSANT BADGE STATUT
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
// COMPOSANT UPLOAD PHOTO 
// ============================================================

interface PhotoUploadProps {
  currentPhotoUrl: string | null;
  onPhotoUploaded: (url: string) => void;
  isUploading: boolean;
  volunteerId?: string;
}

function PhotoUpload({ currentPhotoUrl, onPhotoUploaded, isUploading, volunteerId }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    // CRITIQUE: Passer volunteerId si disponible
    if (volunteerId) {
      formData.append('volunteerId', volunteerId);
    }

    try {
      const token = localStorage.getItem('token');
      
      // Utiliser l'endpoint spécifique pour les bénévoles
      const endpoint = `${API_URL}/upload/volunteer-photo`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && (data.url || data.secureUrl)) {
        const photoUrl = data.url || data.secureUrl;
        onPhotoUploaded(photoUrl);
        toast.success('Photo uploadée avec succès');
      } else {
        toast.error(data.message || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur de connexion au serveur');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {currentPhotoUrl ? (
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-blue-200">
            <img 
              src={currentPhotoUrl} 
              alt="Photo de profil" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
            <User className="w-10 h-10 text-gray-400" />
          </div>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute -bottom-2 -right-2 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <p className="text-xs text-gray-500">JPG, PNG (max 2MB)</p>
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
  onGenerateCertificate,
  canEdit 
}: { 
  volunteer: Volunteer; 
  onEdit: (volunteer: Volunteer) => void;
  onDelete: (id: string) => Promise<void>;
  onGenerateCertificate: (volunteer: Volunteer) => void;
  canEdit: boolean;
}) {
  const [deleting, setDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Supprimer ${volunteer.first_name} ${volunteer.last_name} ?`)) {
      setDeleting(true);
      await onDelete(volunteer.id);
      setDeleting(false);
    }
  };

  // Réinitialiser l'état d'erreur quand l'URL change
  useEffect(() => {
    setImageError(false);
  }, [volunteer.photo_url]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        
        {/* Photo et infos */}
        <div className="flex gap-4 flex-1">
          <div className="flex-shrink-0">
            {volunteer.photo_url && !imageError ? (
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100">
                <img 
                  src={volunteer.photo_url} 
                  alt={`${volunteer.first_name} ${volunteer.last_name}`}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <User className="w-7 h-7 text-blue-600" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <h3 className="font-bold text-lg text-gray-800">
                {volunteer.first_name} {volunteer.last_name}
              </h3>
              <VolunteerStatusBadge status={volunteer.status} />
              <AvailabilityBadge type={volunteer.availability_type} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
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
                {volunteer.hours} heures
              </p>
            </div>
            
            {volunteer.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {volunteer.skills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={() => onGenerateCertificate(volunteer)}
              className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
              title="Générer attestation"
            >
              <Award className="w-4 h-4" />
            </button>
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
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MODAL FORMULAIRE BENEVOLE (VERSION CORRIGÉE)
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
    photo_url: null,
    skills: '',
    region: '',
    availability: '',
    availability_type: 'both',
    hours: 0,
    status: 'active'
  });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && volunteer) {
      setFormData({
        first_name: volunteer.first_name,
        last_name: volunteer.last_name,
        email: volunteer.email,
        phone: volunteer.phone || '',
        photo_url: volunteer.photo_url || null,
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
        photo_url: null,
        skills: '',
        region: '',
        availability: '',
        availability_type: 'both',
        hours: 0,
        status: 'active'
      });
    }
  }, [mode, volunteer]);

  const handlePhotoUploaded = (url: string) => {
    setFormData({ ...formData, photo_url: url });
  };

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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center">
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
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {mode === 'delete' ? (
            <div>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <p className="text-center text-gray-700">
                Supprimer <strong>{volunteer?.first_name} {volunteer?.last_name}</strong> ?
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={handleDelete} disabled={saving} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Supprimer'}
                </button>
                <button onClick={onClose} className="flex-1 border border-gray-300 px-4 py-2 rounded-lg">
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Upload photo avec passage de volunteerId */}
              <PhotoUpload 
                currentPhotoUrl={formData.photo_url}
                onPhotoUploaded={handlePhotoUploaded}
                isUploading={isUploadingPhoto}
                volunteerId={mode === 'edit' && volunteer ? volunteer.id : undefined}
              />

              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Prenom *" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                <input type="text" placeholder="Nom *" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <input type="email" placeholder="Email *" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              <input type="tel" placeholder="Telephone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              <input type="text" placeholder="Competences (virgules)" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              <select value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required>
                <option value="">Region *</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              
              <div className="flex gap-2">
                {availabilityOptions.map(opt => (
                  <button key={opt.value} type="button" onClick={() => setFormData({...formData, availability_type: opt.value as any})} className={`flex-1 py-2 rounded-lg border transition ${formData.availability_type === opt.value ? 'bg-blue-600 text-white' : 'border-gray-300 hover:bg-gray-50'}`}>
                    <opt.icon className="w-4 h-4 inline mr-1" /> {opt.label}
                  </button>
                ))}
              </div>

              {mode === 'edit' && (
                <>
                  <input type="number" placeholder="Heures" value={formData.hours} onChange={(e) => setFormData({...formData, hours: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </>
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
// MODAL GENERATION ATTESTATION PDF
// ============================================================

function CertificateModal({ 
  isOpen, 
  onClose, 
  volunteer, 
  onGenerate 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  volunteer: Volunteer | null;
  onGenerate: (volunteer: Volunteer, periodStart: string, periodEnd: string) => Promise<void>;
}) {
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(today.getMonth() - 6);
      setPeriodEnd(today.toISOString().split('T')[0]);
      setPeriodStart(sixMonthsAgo.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!volunteer) return;
    setIsGenerating(true);
    await onGenerate(volunteer, periodStart, periodEnd);
    setIsGenerating(false);
    onClose();
  };

  if (!isOpen || !volunteer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Générer une attestation</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
            {volunteer.photo_url ? (
              <img src={volunteer.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-800">{volunteer.first_name} {volunteer.last_name}</p>
              <p className="text-sm text-gray-500">{volunteer.hours} heures de bénévolat</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Période du</label>
            <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Période au</label>
            <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={handleGenerate} disabled={isGenerating} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Générer PDF'}
            </button>
            <button onClick={onClose} className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
              Annuler
            </button>
          </div>
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
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const hasAccess = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff';

  // Chargement depuis l'API
  const fetchVolunteers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      if (selectedRegion) params.append('region', selectedRegion);
      if (selectedStatus) params.append('status', selectedStatus);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`${API_URL}/volunteers?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVolunteers(data.data || []);
      } else {
        setVolunteers([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
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
  }, [isAuthenticated, hasAccess, fetchVolunteers]);

  // Creation
  const createVolunteer = async (data: VolunteerFormData) => {
    setSaving(true);
    try {
      const skillsArray = data.skills.split(',').map(s => s.trim()).filter(Boolean);
      const response = await fetch(`${API_URL}/volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          ...data, 
          skills: skillsArray, 
          hours: 0,
          photo_url: data.photo_url
        })
      });
      if (response.ok) {
        toast.success('Benevole ajoute');
        await fetchVolunteers();
        setModalOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur');
      }
    } catch (error) {
      toast.error('Erreur');
    } finally {
      setSaving(false);
    }
  };

  // Modification
  const updateVolunteer = async (data: VolunteerFormData) => {
    if (!selectedVolunteer) return;
    setSaving(true);
    try {
      const skillsArray = data.skills.split(',').map(s => s.trim()).filter(Boolean);
      const response = await fetch(`${API_URL}/volunteers/${selectedVolunteer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          ...data, 
          skills: skillsArray,
          photo_url: data.photo_url
        })
      });
      if (response.ok) {
        toast.success('Benevole modifie');
        await fetchVolunteers();
        setModalOpen(false);
      } else {
        toast.error('Erreur');
      }
    } catch (error) {
      toast.error('Erreur');
    } finally {
      setSaving(false);
    }
  };

  // Suppression
  const deleteVolunteer = async (id: string) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/volunteers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('Benevole supprime');
        await fetchVolunteers();
        setModalOpen(false);
      } else {
        toast.error('Erreur');
      }
    } catch (error) {
      toast.error('Erreur');
    } finally {
      setSaving(false);
    }
  };

  // Generation attestation PDF
  const generateCertificate = async (volunteer: Volunteer, periodStart: string, periodEnd: string) => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // En-tête Y-Mad
      doc.setFontSize(24);
      doc.setTextColor(0, 51, 102);
      doc.text("Y-MAD", 105, 30, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Youthful Madagascar - Association de Jeunesse et Développement", 105, 40, { align: 'center' });
      
      // Titre
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 204);
      doc.text("ATTESTATION DE BENEVOLAT", 105, 65, { align: 'center' });
      
      // Numéro d'attestation
      const certNumber = `VOL-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`N° ${certNumber}`, 105, 75, { align: 'center' });
      
      doc.line(20, 85, 190, 85);
      
      // Corps
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text("Je soussigné(e),", 20, 105);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bolditalic');
      doc.text("Le Directeur Exécutif de Y-Mad", 20, 118);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`atteste que ${volunteer.first_name} ${volunteer.last_name} a effectué`, 20, 138);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204);
      doc.setFont('helvetica', 'bold');
      doc.text(`${volunteer.hours} heures`, 20, 155);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(`de bénévolat au sein de l'association Y-Mad,`, 20, 170);
      
      doc.setFontSize(12);
      doc.text(`du ${new Date(periodStart).toLocaleDateString('fr-FR')} au ${new Date(periodEnd).toLocaleDateString('fr-FR')}.`, 20, 185);
      
      doc.setFontSize(11);
      doc.text("Cette attestation est délivrée pour servir et valoir ce que de droit.", 20, 210);
      
      // Pied de page
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Fait à Antananarivo, le ${new Date().toLocaleDateString('fr-FR')}`, 20, 240);
      doc.text("Signature :", 20, 260);
      doc.line(50, 257, 120, 257);
      
      // Sauvegarde
      doc.save(`attestation_${volunteer.first_name}_${volunteer.last_name}.pdf`);
      toast.success('Attestation générée avec succès');
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast.error('Erreur lors de la création du PDF');
    }
  };

  // Export CSV
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
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `benevoles_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Export CSV reussi');
      }
    } catch (error) {
      toast.error('Erreur export');
    }
  };

  // Stats
  const totalVolunteers = volunteers.length;
  const activeVolunteers = volunteers.filter(v => v.status === 'active').length;
  const totalHours = volunteers.reduce((sum, v) => sum + v.hours, 0);
  const uniqueRegions = new Set(volunteers.map(v => v.region)).size;

  // Filtres
  const filteredVolunteers = volunteers.filter(v => {
    const matchSearch = searchTerm === '' || `${v.first_name} ${v.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRegion = selectedRegion === '' || v.region === selectedRegion;
    const matchStatus = selectedStatus === '' || v.status === selectedStatus;
    return matchSearch && matchRegion && matchStatus;
  });

  const paginatedVolunteers = filteredVolunteers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredVolunteers.length / itemsPerPage);

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
        <p className="text-gray-500 font-medium">Chargement des bénévoles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gestion des bénévoles</h1>
              <p className="text-blue-100 text-sm mt-0.5">
                Gérez les bénévoles, leurs photos et générez des attestations
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition">
              <Download className="w-4 h-4" /> CSV
            </button>
            <button onClick={() => { setModalMode('create'); setSelectedVolunteer(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition">
              <Plus className="w-4 h-4" /> Nouveau
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total bénévoles" value={totalVolunteers} icon={Users} />
        <StatCard label="Bénévoles actifs" value={activeVolunteers} icon={CheckCircle} isBlue />
        <StatCard label="Heures totales" value={`${totalHours} h`} icon={Clock} />
        <StatCard label="Régions couvertes" value={uniqueRegions} icon={MapPin} />
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="">Toutes les régions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedRegion(''); setSelectedStatus(''); fetchVolunteers(); }} 
            className="flex items-center gap-2 px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" /> Réinitialiser
          </button>
        </div>
      </div>

      {/* Liste */}
      {filteredVolunteers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Aucun bénévole trouvé</h3>
            <p className="text-gray-500 text-sm">
              Aucun bénévole ne correspond à vos critères de recherche.
            </p>
            <button
              onClick={() => { setModalMode('create'); setSelectedVolunteer(null); setModalOpen(true); }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Ajouter un bénévole
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedVolunteers.map(v => (
            <VolunteerCard
              key={v.id}
              volunteer={v}
              onEdit={(v) => { setSelectedVolunteer(v); setModalMode('edit'); setModalOpen(true); }}
              onDelete={deleteVolunteer}
              onGenerateCertificate={(v) => { setSelectedVolunteer(v); setCertificateModalOpen(true); }}
              canEdit={hasAccess}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
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

      {/* Modal Formulaire */}
      <VolunteerModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedVolunteer(null); }}
        onSave={modalMode === 'create' ? createVolunteer : updateVolunteer}
        onDelete={deleteVolunteer}
        mode={modalMode}
        volunteer={selectedVolunteer}
        saving={saving}
      />

      {/* Modal Attestation */}
      <CertificateModal
        isOpen={certificateModalOpen}
        onClose={() => setCertificateModalOpen(false)}
        volunteer={selectedVolunteer}
        onGenerate={generateCertificate}
      />
    </div>
  );
}