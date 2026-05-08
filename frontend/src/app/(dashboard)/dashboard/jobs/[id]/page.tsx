'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ArrowLeft, Edit, Trash2, Building, MapPin, Calendar, 
  Users, Briefcase, DollarSign, Clock, CheckCircle, 
  XCircle, Star, Eye, Mail, Phone, FileText, Loader2,
  AlertCircle, TrendingUp, Award, ExternalLink
} from 'lucide-react';

interface JobOffer {
  id: string;
  title: string;
  title_mg: string;
  description: string;
  description_mg: string;
  companyName: string;
  location: string;
  region: string;
  jobType: string;
  salary: string;
  sector: string;
  requirements: string;
  contact_email: string;
  contact_phone: string;
  deadline: string;
  status: 'draft' | 'published' | 'closed' | 'expired';
  applications_count: number;
  is_featured: boolean;
  createdAt: string;
  updatedAt: string;
  creator?: { firstName: string; lastName: string };
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, hasRole } = useAuth();
  const { language } = useLanguage();
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasEditRights = hasRole('super_admin') || hasRole('admin') || hasRole('staff') || hasRole('partner');

  useEffect(() => {
    fetchJob();
  }, [params.id]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`http://localhost:4001/jobs/offers/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      } else {
        setError('Offre non trouvée');
      }
    } catch (error) {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Supprimer l'offre "${job?.title}" ?`)) return;
    try {
      const response = await fetch(`http://localhost:4001/jobs/offers/${params.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        router.push('/dashboard/jobs');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleToggleStatus = async () => {
    if (!job) return;
    const newStatus = job.status === 'published' ? 'closed' : 'published';
    try {
      const response = await fetch(`http://localhost:4001/jobs/offers/${job.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        fetchJob();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getJobTypeLabel = (type: string) => {
    const types: Record<string, { fr: string; mg: string }> = {
      cdi: { fr: 'CDI', mg: 'CDI' },
      cdd: { fr: 'CDD', mg: 'CDD' },
      stage: { fr: 'Stage', mg: 'Fiofanana' },
      freelance: { fr: 'Freelance', mg: 'Freelance' },
      volunteer: { fr: 'Bénévolat', mg: 'Asa soa' },
    };
    return types[type]?.[language as 'fr' || 'mg'] || type;
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'published':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Publiée</span>;
      case 'draft':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" />Brouillon</span>;
      case 'closed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 flex items-center gap-1"><XCircle className="w-3 h-3" />Fermée</span>;
      case 'expired':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1"><Clock className="w-3 h-3" />Expirée</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  const isExpired = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-red-500">{error || 'Offre non trouvée'}</p>
        <Link href="/dashboard/jobs" className="mt-4 inline-flex items-center gap-2 text-blue-600">
          Retour aux offres
        </Link>
      </div>
    );
  }

  const title = language === 'fr' ? job.title : (job.title_mg || job.title);
  const description = language === 'fr' ? job.description : (job.description_mg || job.description);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/dashboard/jobs" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux offres
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            {job.is_featured && (
              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                <Star className="w-3 h-3" /> À la une
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            {getStatusBadge(job.status)}
            {isExpired(job.deadline) && job.status !== 'closed' && (
              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Date dépassée</span>
            )}
          </div>
        </div>
        {hasEditRights && (
          <div className="flex gap-2">
            <button
              onClick={handleToggleStatus}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                job.status === 'published'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
            >
              {job.status === 'published' ? 'Fermer l\'offre' : 'Publier l\'offre'}
            </button>
            <Link 
              href={`/dashboard/jobs/${job.id}/edit`} 
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <Edit className="w-5 h-5 text-gray-600" />
            </Link>
            <button 
              onClick={handleDelete} 
              className="p-2 bg-red-50 rounded-lg hover:bg-red-100 transition"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
            </button>
          </div>
        )}
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard label="Entreprise" value={job.companyName} icon={Building} />
        <InfoCard label="Type de contrat" value={getJobTypeLabel(job.jobType)} icon={Briefcase} />
        <InfoCard label="Lieu" value={job.location || job.region || 'Madagascar'} icon={MapPin} />
        <InfoCard label="Secteur" value={job.sector || 'Non spécifié'} icon={TrendingUp} />
        <InfoCard label="Salaire" value={job.salary || 'À discuter'} icon={DollarSign} />
        <InfoCard label="Date limite" value={formatDate(job.deadline)} icon={Calendar} />
        <InfoCard 
          label="Candidatures reçues" 
          value={job.applications_count.toString()} 
          icon={Users}
          link={`/dashboard/jobs/${job.id}/applications`}
        />
        <InfoCard label="Date de création" value={formatDate(job.createdAt)} icon={Clock} />
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Description du poste
        </h2>
        <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
          {description}
        </div>
      </div>

      {/* Prérequis */}
      {job.requirements && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Prérequis et compétences
          </h2>
          <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
            {job.requirements}
          </div>
        </div>
      )}

      {/* Contact */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          Contact
        </h2>
        <div className="space-y-2">
          {job.contact_email && (
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <a href={`mailto:${job.contact_email}`} className="text-blue-600 hover:underline">
                {job.contact_email}
              </a>
            </div>
          )}
          {job.contact_phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <a href={`tel:${job.contact_phone}`} className="text-gray-600">
                {job.contact_phone}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/dashboard/jobs/${job.id}/applications`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Users className="w-4 h-4" />
            Voir les candidatures ({job.applications_count})
          </Link>
          <Link
            href={`/dashboard/jobs/${job.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            <Edit className="w-4 h-4" />
            Modifier l'offre
          </Link>
          <Link
            href={`/emploi/${job.id}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            <ExternalLink className="w-4 h-4" />
            Voir la page publique
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon: Icon, link }: { label: string; value: string; icon: any; link?: string }) {
  const content = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-lg font-semibold text-gray-800 mt-1">{value || '—'}</p>
        </div>
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
      </div>
    </div>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }
  return content;
}