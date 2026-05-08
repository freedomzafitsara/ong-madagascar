'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Save, X, FolderOpen, MapPin, Users, DollarSign, Calendar, AlertCircle, Loader2 } from 'lucide-react';

interface ProjectFormData {
  title: string;
  title_mg: string;
  description: string;
  description_mg: string;
  location: string;
  region: string;
  budget: number;
  beneficiaries_count: number;
  jobs_created: number;
  start_date: string;
  end_date: string;
  is_featured: boolean;
}

export default function NewProjectPage() {
  const router = useRouter();
  const { token, hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!hasRole('super_admin') && !hasRole('admin') && !hasRole('staff')) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Accès non autorisé</h1>
          <p className="text-gray-500 mt-2">Vous n'avez pas les droits pour ajouter un projet.</p>
          <Link href="/dashboard/projects" className="mt-4 inline-flex items-center gap-2 text-blue-600">Retour</Link>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    title_mg: '',
    description: '',
    description_mg: '',
    location: '',
    region: 'Analamanga',
    budget: 0,
    beneficiaries_count: 0,
    jobs_created: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_featured: false,
  });

  const regions = ['Analamanga', 'Diana', 'Sava', 'Itasy', 'Vakinankaratra', 'Bongolava', 'Sofia', 'Boeny', 'Betsiboka', 'Melaky', 'Alaotra-Mangoro', 'Atsinanana', 'Analanjirofo', 'Amoron\'i Mania', 'Haute Matsiatra', 'Vatovavy-Fitovinany', 'Ihorombe', 'Atsimo-Atsinanana', 'Menabe', 'Atsimo-Andrefana', 'Androy', 'Anosy'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.title || !formData.description) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:4001/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/dashboard/projects');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de la création du projet');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/dashboard/projects" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Retour à la liste
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Ajouter un projet</h1>
          <p className="text-gray-500 text-sm">Créez un nouveau projet</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Section Informations générales */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-600" /> Informations générales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre (français) *</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Titre du projet" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre (malagasy)</label>
              <input type="text" value={formData.title_mg} onChange={(e) => setFormData({ ...formData, title_mg: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Lohatenin'ny tetikasa" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (français) *</label>
              <textarea rows={3} required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Description du projet" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (malagasy)</label>
              <textarea rows={3} value={formData.description_mg} onChange={(e) => setFormData({ ...formData, description_mg: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Famaritana ny tetikasa" />
            </div>
          </div>
        </div>

        {/* Section Localisation */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" /> Localisation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Région *</label>
              <select value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu précis</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Commune, fokontany" />
            </div>
          </div>
        </div>

        {/* Section Impact */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" /> Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (Ar)</label>
              <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg" placeholder="0" /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bénéficiaires</label>
              <div className="relative"><Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="number" value={formData.beneficiaries_count} onChange={(e) => setFormData({ ...formData, beneficiaries_count: parseInt(e.target.value) })} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg" placeholder="0" /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emplois créés</label>
              <input type="number" value={formData.jobs_created} onChange={(e) => setFormData({ ...formData, jobs_created: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0" />
            </div>
          </div>
        </div>

        {/* Section Dates */}
        <div className="p-6 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-600" /> Période</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label><input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label><input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
          </div>
          <div className="mt-4"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="rounded border-gray-300 text-blue-600" /><span className="text-sm text-gray-700">Mettre en avant (projet vedette)</span></label></div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <Link href="/dashboard/projects" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100">Annuler</Link>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{loading ? 'Enregistrement...' : 'Créer le projet'}</button>
        </div>
      </form>
    </div>
  );
}