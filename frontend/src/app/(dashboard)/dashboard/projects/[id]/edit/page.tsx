// frontend/src/app/(dashboard)/dashboard/projects/[id]/edit/page.tsx
// VERSION COMPLETEMENT CORRIGEE

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, Save, Loader2, AlertCircle, 
  FolderOpen, MapPin, Users, DollarSign, Calendar,
  Target, CheckCircle, Award, TrendingUp, X
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================

interface ProjectFormData {
  id: string;
  title: string;
  title_mg: string;
  description: string;
  description_mg: string;
  location: string;
  region: string;
  status: string;
  budget: number;
  spent: number;
  beneficiaries_count: number;
  youth_impact: number;
  jobs_created: number;
  progress: number;
  start_date: string;
  end_date: string;
  is_featured: boolean;
  image_url: string;
}

// ============================================================
// CONSTANTES
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

const REGIONS = [
  'Analamanga', 'Diana', 'Sava', 'Itasy', 'Vakinankaratra',
  'Bongolava', 'Sofia', 'Boeny', 'Betsiboka', 'Melaky',
  'Alaotra-Mangoro', 'Atsinanana', 'Analanjirofo', 'Amoron\'i Mania',
  'Haute Matsiatra', 'Vatovavy-Fitovinany', 'Ihorombe', 'Atsimo-Atsinanana',
  'Menabe', 'Atsimo-Andrefana', 'Androy', 'Anosy'
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'En cours', bg: 'bg-blue-100', text: 'text-blue-700' },
  { value: 'completed', label: 'Terminé', bg: 'bg-gray-100', text: 'text-gray-600' },
  { value: 'paused', label: 'En pause', bg: 'bg-gray-100', text: 'text-gray-600' },
  { value: 'draft', label: 'Brouillon', bg: 'bg-gray-100', text: 'text-gray-500' }
];

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Partial<ProjectFormData>>({
    title: '',
    title_mg: '',
    description: '',
    description_mg: '',
    location: '',
    region: 'Analamanga',
    status: 'active',
    budget: 0,
    spent: 0,
    beneficiaries_count: 0,
    youth_impact: 0,
    jobs_created: 0,
    progress: 0,
    start_date: '',
    end_date: '',
    is_featured: false,
    image_url: '',
  });

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff';

  if (!hasEditRights) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Accès non autorisé</h1>
          <p className="text-gray-500 mt-2">Vous n'avez pas les droits pour modifier ce projet.</p>
          <Link href="/dashboard/projects" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline">
            Retour aux projets
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        // La route est publique (@Public) donc pas besoin de token
        const response = await fetch(`${API_URL}/projects/${params.id}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Projet chargé:', data);
          
          setFormData({
            id: data.id,
            title: data.title || '',
            title_mg: data.title_mg || '',
            description: data.description || '',
            description_mg: data.description_mg || '',
            location: data.location || '',
            region: data.region || 'Analamanga',
            status: data.status || 'active',
            budget: data.budget || 0,
            spent: data.spent || 0,
            beneficiaries_count: data.beneficiaries_count || 0,
            youth_impact: data.youth_impact || 0,
            jobs_created: data.jobs_created || 0,
            progress: data.progress || 0,
            start_date: data.start_date ? data.start_date.split('T')[0] : '',
            end_date: data.end_date ? data.end_date.split('T')[0] : '',
            is_featured: data.is_featured || false,
            image_url: data.image_url || '',
          });
        } else if (response.status === 404) {
          setError('Projet non trouvé');
          toast.error('Projet non trouvé');
        } else {
          setError('Erreur lors du chargement du projet');
          toast.error('Erreur lors du chargement');
        }
      } catch (error) {
        console.error('Erreur chargement:', error);
        setError('Erreur de connexion au serveur');
        toast.error('Erreur de connexion au serveur');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const projectData = {
        title: formData.title?.trim(),
        title_mg: formData.title_mg?.trim() || '',
        description: formData.description?.trim(),
        description_mg: formData.description_mg?.trim() || '',
        location: formData.location?.trim() || '',
        region: formData.region,
        status: formData.status,
        budget: Number(formData.budget) || 0,
        spent: Number(formData.spent) || 0,
        beneficiaries_count: Number(formData.beneficiaries_count) || 0,
        youth_impact: Number(formData.youth_impact) || 0,
        jobs_created: Number(formData.jobs_created) || 0,
        progress: Number(formData.progress) || 0,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_featured: Boolean(formData.is_featured),
        image_url: formData.image_url || '',
      };

      console.log('Donnees envoyees au backend:', projectData);

      const response = await fetch(`${API_URL}/projects/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();
      console.log('Reponse du backend:', result);

      if (response.ok) {
        toast.success('Projet modifié avec succès !');
        router.push(`/dashboard/projects/${params.id}`);
      } else {
        const errorMessage = result.message || result.error || 'Erreur lors de la mise à jour';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Erreur backend:', result);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
      toast.error('Erreur de connexion au serveur');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          href={`/dashboard/projects/${params.id}`} 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-2 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au projet
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Modifier le projet</h1>
        <p className="text-gray-500 text-sm">Mettez à jour les informations du projet</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        
        {/* Section Informations générales */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
            </div>
            Informations générales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre (français) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Titre du projet"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre (malagasy)</label>
              <input
                type="text"
                value={formData.title_mg}
                onChange={(e) => setFormData({ ...formData, title_mg: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Lohatenin'ny tetikasa"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (français) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Description détaillée du projet"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (malagasy)</label>
              <textarea
                rows={4}
                value={formData.description_mg}
                onChange={(e) => setFormData({ ...formData, description_mg: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Famaritana ny tetikasa"
              />
            </div>
          </div>
        </div>

        {/* Section Localisation */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
            </div>
            Localisation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Région <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu précis</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Commune, fokontany"
              />
            </div>
          </div>
        </div>

        {/* Section Statut */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
            </div>
            Statut du projet
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STATUS_OPTIONS.map(option => (
              <label
                key={option.value}
                className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition ${
                  formData.status === option.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={formData.status === option.value}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm ${option.bg} ${option.text} px-2 py-0.5 rounded-full`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Section Impact */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-blue-600" />
            </div>
            Impact du projet
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (Ar)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dépenses (Ar)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.spent}
                  onChange={(e) => setFormData({ ...formData, spent: parseInt(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bénéficiaires</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.beneficiaries_count}
                  onChange={(e) => setFormData({ ...formData, beneficiaries_count: parseInt(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jeunes impactés</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.youth_impact}
                  onChange={(e) => setFormData({ ...formData, youth_impact: parseInt(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Emplois créés</label>
              <input
                type="number"
                min="0"
                value={formData.jobs_created}
                onChange={(e) => setFormData({ ...formData, jobs_created: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Section Progression */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            </div>
            Progression
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avancement (%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>0%</span>
              <span className="font-semibold text-blue-600">{formData.progress}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Section Dates */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
            </div>
            Période
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section Mise en avant */}
        <div className="p-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 flex items-center gap-1">
              <Award className="w-4 h-4 text-yellow-500" />
              Mettre en avant (projet vedette)
            </span>
          </label>
        </div>

        {/* Boutons d'action */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <Link
            href={`/dashboard/projects/${params.id}`}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 text-center text-xs text-gray-400">
        Les données sont stockées dans PostgreSQL via l'API backend - Connexion sécurisée JWT
      </div>
    </div>
  );
}