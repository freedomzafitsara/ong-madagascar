// frontend/src/app/(dashboard)/dashboard/projects/[id]/page.tsx
// VERSION CORRIGEE - PAGE DETAIL DU PROJET

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ArrowLeft, Edit, Trash2, MapPin, Users, DollarSign, 
  Calendar, Target, CheckCircle, Clock, Award, Loader2,
  BarChart3, TrendingUp, FileText, CalendarDays, X
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================

interface Project {
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
  image_url: string;
  gallery_images: string[];
  is_featured: boolean;
  manager?: { firstName: string; lastName: string };
  createdAt: string;
}

// ============================================================
// CONSTANTES
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

// ============================================================
// COMPOSANTS
// ============================================================

function InfoCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
      <Icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value || 0}</p>
    </div>
  );
}

function getStatusBadge(status: string) {
  switch(status) {
    case 'active':
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" />En cours</span>;
    case 'completed':
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Terminé</span>;
    case 'paused':
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1"><Clock className="w-3 h-3" />En pause</span>;
    default:
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{status}</span>;
  }
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasEditRights = user?.role === 'super_admin' || user?.role === 'admin' ;

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        // Utiliser API_URL au lieu de localhost:4001
        const response = await fetch(`${API_URL}/projects/${params.id}`);
        
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        } else if (response.status === 404) {
          setError('Projet non trouvé');
        } else {
          setError('Erreur lors du chargement du projet');
        }
      } catch (error) {
        console.error('Erreur chargement:', error);
        setError('Erreur de connexion au serveur');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm(`Supprimer le projet "${project?.title}" ? Cette action est irréversible.`)) return;
    
    try {
      const response = await fetch(`${API_URL}/projects/${params.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        toast.success('Projet supprimé avec succès');
        router.push('/dashboard/projects');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur de connexion au serveur');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-red-500">{error || 'Projet non trouvé'}</p>
        <Link href="/dashboard/projects" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Retour aux projets
        </Link>
      </div>
    );
  }

  const title = language === 'fr' ? project.title : (project.title_mg || project.title);
  const description = language === 'fr' ? project.description : (project.description_mg || project.description);
  const progress = project.progress || 0;
  const progressColor = progress < 30 ? 'bg-red-500' : progress < 70 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/dashboard/projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-2 transition">
            <ArrowLeft className="w-4 h-4" /> Retour aux projets
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <div className="flex gap-2 mt-2">
            {getStatusBadge(project.status)}
            {project.is_featured && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                <Award className="w-3 h-3" /> À la une
              </span>
            )}
          </div>
        </div>
        {hasEditRights && (
          <div className="flex gap-2">
            <Link 
              href={`/dashboard/projects/${project.id}/edit`} 
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              title="Modifier"
            >
              <Edit className="w-5 h-5 text-gray-600" />
            </Link>
            {user?.role === 'super_admin' && (
              <button 
                onClick={handleDelete} 
                className="p-2 bg-red-50 rounded-lg hover:bg-red-100 transition"
                title="Supprimer"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Image principale */}
      <div className="bg-gray-100 rounded-xl h-64 overflow-hidden">
        {project.image_url ? (
          <img src={project.image_url} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
            <FileText className="w-16 h-16 text-blue-300" />
          </div>
        )}
      </div>

      {/* Informations clés */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard label="Budget" value={`${(project.budget || 0).toLocaleString()} Ar`} icon={DollarSign} />
        <InfoCard label="Bénéficiaires" value={(project.beneficiaries_count || 0).toLocaleString()} icon={Users} />
        <InfoCard label="Emplois créés" value={(project.jobs_created || 0).toLocaleString()} icon={Target} />
        <InfoCard label="Progression" value={`${progress}%`} icon={BarChart3} />
      </div>

      {/* Barre de progression */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Avancement du projet</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${progressColor}`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Description</h2>
        <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{description}</p>
      </div>

      {/* Localisation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" /> Localisation
        </h2>
        <p className="text-gray-600">Région: <span className="font-medium">{project.region}</span></p>
        {project.location && <p className="text-gray-600 mt-1">Lieu: {project.location}</p>}
      </div>

      {/* Dates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" /> Calendrier
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Date de début</p>
            <p className="font-medium text-gray-800">
              {project.start_date ? new Date(project.start_date).toLocaleDateString('fr-FR') : 'Non définie'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date de fin</p>
            <p className="font-medium text-gray-800">
              {project.end_date ? new Date(project.end_date).toLocaleDateString('fr-FR') : 'Non définie'}
            </p>
          </div>
        </div>
      </div>

      {/* Gestionnaire */}
      {project.manager && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Responsable
          </h2>
          <p className="text-gray-600">{project.manager.firstName} {project.manager.lastName}</p>
        </div>
      )}
    </div>
  );
}