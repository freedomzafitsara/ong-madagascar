// src/app/dashboard/jobs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Eye, Search, X, CheckCircle, AlertCircle, 
  Briefcase, MapPin, Calendar, DollarSign, Users, Building, 
  Clock, Filter, ChevronRight, Send, FileText
} from 'lucide-react';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  contractType: 'CDI' | 'CDD' | 'Stage' | 'Freelance' | 'Volontariat' | 'Alternance';
  description: string;
  missions: string[];
  requirements: string[];
  benefits?: string[];
  salary?: string;
  deadline: string;
  status: 'draft' | 'published' | 'open' | 'closed' | 'expired';
  applicationsCount: number;
  viewsCount: number;
  isFeatured: boolean;
  contactEmail: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

const contractTypes = [
  { value: 'CDI', label: 'CDI', color: 'bg-blue-100 text-blue-700' },
  { value: 'CDD', label: 'CDD', color: 'bg-purple-100 text-purple-700' },
  { value: 'Stage', label: 'Stage', color: 'bg-orange-100 text-orange-700' },
  { value: 'Freelance', label: 'Freelance', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'Volontariat', label: 'Volontariat', color: 'bg-green-100 text-green-700' },
  { value: 'Alternance', label: 'Alternance', color: 'bg-teal-100 text-teal-700' }
];

const departments = ['Programmes', 'Communication', 'IT', 'Administration', 'Finance', 'RH', 'Logistique', 'Terrain'];

export default function JobsManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    contractType: 'CDI' as Job['contractType'],
    description: '',
    missions: '',
    requirements: '',
    benefits: '',
    salary: '',
    deadline: '',
    status: 'draft' as Job['status'],
    isFeatured: false,
    contactEmail: '',
    contactPhone: ''
  });

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = () => {
    const stored = localStorage.getItem('ymad_jobs');
    if (stored) {
      const data = JSON.parse(stored);
      setJobs(data);
      setFilteredJobs(data);
    } else {
      const defaultJobs: Job[] = [
        {
          id: '1',
          title: 'Coordinateur(trice) de projet',
          department: 'Programmes',
          location: 'Antananarivo',
          contractType: 'CDI',
          description: 'Supervision et coordination des projets éducatifs et de développement à Madagascar.',
          missions: ['Planifier et coordonner les projets', 'Superviser les équipes locales', 'Assurer le suivi et l\'évaluation'],
          requirements: ['Master en gestion de projet', '3 ans expérience', 'Anglais courant'],
          benefits: ['Mutuelle santé', 'Frais de déplacement', 'Formations'],
          salary: '800 000 - 1 200 000 Ar',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'open',
          applicationsCount: 12,
          viewsCount: 245,
          isFeatured: true,
          contactEmail: 'recrutement@y-mad.mg',
          contactPhone: '+261 34 00 000 01',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Chargé(e) de communication digitale',
          department: 'Communication',
          location: 'Antananarivo',
          contractType: 'CDI',
          description: 'Gestion des réseaux sociaux et création de contenu pour promouvoir les actions de Y-Mad.',
          missions: ['Gérer les réseaux sociaux', 'Créer du contenu', 'Animer la communauté'],
          requirements: ['Licence en communication', 'Maîtrise des réseaux sociaux', 'Créativité'],
          benefits: ['Horaires flexibles', 'Tickets restaurant', 'Évolution possible'],
          salary: '600 000 - 800 000 Ar',
          deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'open',
          applicationsCount: 8,
          viewsCount: 189,
          isFeatured: false,
          contactEmail: 'recrutement@y-mad.mg',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setJobs(defaultJobs);
      setFilteredJobs(defaultJobs);
      localStorage.setItem('ymad_jobs', JSON.stringify(defaultJobs));
    }
    setLoading(false);
  };

  const saveJobs = (data: Job[]) => {
    localStorage.setItem('ymad_jobs', JSON.stringify(data));
    setJobs(data);
    applyFilters(data, searchTerm, filterStatus, filterType);
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const applyFilters = (data: Job[], term: string, status: string, type: string) => {
    let filtered = [...data];
    if (term) {
      filtered = filtered.filter(j => 
        j.title.toLowerCase().includes(term.toLowerCase()) ||
        j.department.toLowerCase().includes(term.toLowerCase()) ||
        j.location.toLowerCase().includes(term.toLowerCase())
      );
    }
    if (status) filtered = filtered.filter(j => j.status === status);
    if (type) filtered = filtered.filter(j => j.contractType === type);
    setFilteredJobs(filtered);
    setCurrentPage(1);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.contactEmail) {
      showMessage('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    const missionsArray = formData.missions.split('\n').filter(m => m.trim());
    const requirementsArray = formData.requirements.split('\n').filter(r => r.trim());
    const benefitsArray = formData.benefits.split('\n').filter(b => b.trim());

    if (editingId) {
      const updated = jobs.map(j =>
        j.id === editingId
          ? {
              ...j,
              title: formData.title,
              department: formData.department,
              location: formData.location,
              contractType: formData.contractType,
              description: formData.description,
              missions: missionsArray,
              requirements: requirementsArray,
              benefits: benefitsArray,
              salary: formData.salary,
              deadline: formData.deadline,
              status: formData.status,
              isFeatured: formData.isFeatured,
              contactEmail: formData.contactEmail,
              contactPhone: formData.contactPhone,
              updatedAt: new Date().toISOString()
            }
          : j
      );
      saveJobs(updated);
      showMessage('Offre modifiée avec succès', 'success');
    } else {
      const newJob: Job = {
        id: Date.now().toString(),
        title: formData.title,
        department: formData.department,
        location: formData.location,
        contractType: formData.contractType,
        description: formData.description,
        missions: missionsArray,
        requirements: requirementsArray,
        benefits: benefitsArray,
        salary: formData.salary,
        deadline: formData.deadline,
        status: formData.status,
        applicationsCount: 0,
        viewsCount: 0,
        isFeatured: formData.isFeatured,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveJobs([newJob, ...jobs]);
      showMessage('Offre créée avec succès', 'success');
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('⚠️ Supprimer définitivement cette offre ?')) {
      const filtered = jobs.filter(j => j.id !== id);
      saveJobs(filtered);
      showMessage('Offre supprimée avec succès', 'success');
    }
  };

  const handlePublish = (id: string) => {
    const updated = jobs.map(j =>
      j.id === id ? { ...j, status: 'published' as Job['status'] } : j
    );
    saveJobs(updated);
    showMessage('Offre publiée avec succès !', 'success');
  };

  const handleClose = (id: string) => {
    if (confirm('Fermer cette offre ? Les candidatures ne seront plus acceptées.')) {
      const updated = jobs.map(j =>
        j.id === id ? { ...j, status: 'closed' as Job['status'] } : j
      );
      saveJobs(updated);
      showMessage('Offre fermée', 'success');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '', department: '', location: '', contractType: 'CDI', description: '', missions: '', requirements: '', benefits: '', salary: '', deadline: '', status: 'draft', isFeatured: false, contactEmail: '', contactPhone: ''
    });
  };

  const editJob = (job: Job) => {
    setEditingId(job.id);
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      contractType: job.contractType,
      description: job.description,
      missions: job.missions.join('\n'),
      requirements: job.requirements.join('\n'),
      benefits: job.benefits?.join('\n') || '',
      salary: job.salary || '',
      deadline: job.deadline,
      status: job.status,
      isFeatured: job.isFeatured,
      contactEmail: job.contactEmail,
      contactPhone: job.contactPhone || ''
    });
    setShowForm(true);
  };

  useEffect(() => {
    applyFilters(jobs, searchTerm, filterStatus, filterType);
  }, [searchTerm, filterStatus, filterType, jobs]);

  // Pagination
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'open' || j.status === 'published').length,
    closed: jobs.filter(j => j.status === 'closed' || j.status === 'expired').length,
    totalApplications: jobs.reduce((sum, j) => sum + j.applicationsCount, 0),
    totalViews: jobs.reduce((sum, j) => sum + j.viewsCount, 0)
  };

  const getContractTypeColor = (type: string) => {
    return contractTypes.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': case 'published': return { label: '✅ Ouvert', color: 'bg-green-100 text-green-700' };
      case 'closed': return { label: '🔒 Fermé', color: 'bg-red-100 text-red-700' };
      case 'expired': return { label: '⏰ Expiré', color: 'bg-gray-100 text-gray-700' };
      default: return { label: '📝 Brouillon', color: 'bg-yellow-100 text-yellow-700' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-ymad-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ymad-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ymad-gray-800">📋 Gestion des offres d'emploi</h1>
          <p className="text-ymad-gray-500 mt-1">Créez, publiez et gérez les offres d'emploi pour les jeunes</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-ymad-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-ymad-blue-700 transition shadow-sm">
          <Plus className="w-5 h-5" /> Nouvelle offre
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-ymad-gray-100">
          <Briefcase className="w-6 h-6 text-ymad-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ymad-gray-800">{stats.total}</p>
          <p className="text-xs text-ymad-gray-500">Total offres</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-ymad-gray-100">
          <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ymad-gray-800">{stats.open}</p>
          <p className="text-xs text-ymad-gray-500">Offres ouvertes</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-ymad-gray-100">
          <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ymad-gray-800">{stats.totalApplications}</p>
          <p className="text-xs text-ymad-gray-500">Candidatures reçues</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-ymad-gray-100">
          <Eye className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ymad-gray-800">{stats.totalViews}</p>
          <p className="text-xs text-ymad-gray-500">Vues totales</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ymad-gray-400 w-5 h-5" />
            <input type="text" placeholder="Rechercher une offre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-ymad-blue-500 outline-none" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ymad-blue-500 outline-none">
            <option value="">📋 Tous les statuts</option>
            <option value="open">✅ Ouvertes</option>
            <option value="closed">🔒 Fermées</option>
            <option value="draft">📝 Brouillons</option>
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ymad-blue-500 outline-none">
            <option value="">📄 Tous les types</option>
            {contractTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {(searchTerm || filterStatus || filterType) && (
            <button onClick={() => { setSearchTerm(''); setFilterStatus(''); setFilterType(''); }} className="px-4 py-2 text-ymad-gray-500 hover:text-ymad-gray-700 border rounded-lg hover:bg-ymad-gray-50 transition">✕ Effacer</button>
          )}
        </div>
      </div>

      {/* Liste des offres avec pagination */}
      {paginatedJobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm py-16 text-center">
          <Briefcase className="w-16 h-16 text-ymad-gray-300 mx-auto mb-4" />
          <p className="text-ymad-gray-500 text-lg">Aucune offre trouvée</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-ymad-blue-600 hover:underline">+ Créer une offre</button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y">
              {paginatedJobs.map(job => {
                const statusInfo = getStatusLabel(job.status);
                const typeColor = getContractTypeColor(job.contractType);
                const isExpired = new Date(job.deadline) < new Date();
                
                return (
                  <div key={job.id} className="p-5 hover:bg-ymad-gray-50 transition group">
                    <div className="flex flex-wrap justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-bold text-lg text-ymad-gray-800">{job.title}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${typeColor}`}>{job.contractType}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>
                          {job.isFeatured && <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">⭐ En vedette</span>}
                          {isExpired && job.status !== 'closed' && <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700">⏰ Date dépassée</span>}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-ymad-gray-500 mb-2">
                          <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {job.department}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                          {job.salary && <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {job.salary}</span>}
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Limite: {new Date(job.deadline).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <p className="text-ymad-gray-600 text-sm line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-ymad-gray-400">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {job.applicationsCount} candidat(s)</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {job.viewsCount} vue(s)</span>
                        </div>
                      </div>
                      <div className="flex gap-2 items-start">
                        <button onClick={() => { setSelectedJob(job); setShowDetail(true); }} className="p-2 text-ymad-blue-600 hover:bg-ymad-blue-50 rounded-lg transition" title="Voir détails">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button onClick={() => editJob(job)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Modifier">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(job.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Supprimer">
                          <Trash2 className="w-5 h-5" />
                        </button>
                        {job.status === 'draft' && (
                          <button onClick={() => handlePublish(job.id)} className="px-3 py-1 text-green-600 text-sm bg-green-50 rounded-lg hover:bg-green-100 transition">
                            Publier
                          </button>
                        )}
                        {(job.status === 'open' || job.status === 'published') && (
                          <button onClick={() => handleClose(job.id)} className="px-3 py-1 text-red-600 text-sm bg-red-50 rounded-lg hover:bg-red-100 transition">
                            Fermer
                          </button>
                        )}
                        <Link href={`/dashboard/applications?job=${job.id}`} className="px-3 py-1 text-ymad-blue-600 text-sm bg-ymad-blue-50 rounded-lg hover:bg-ymad-blue-100 transition flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Candidatures ({job.applicationsCount})
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ymad-gray-50"
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === page
                      ? 'bg-ymad-blue-600 text-white'
                      : 'border hover:bg-ymad-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ymad-gray-50"
              >
                →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Formulaire */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-ymad-gray-800">{editingId ? '✏️ Modifier' : '➕ Nouvelle'} offre d'emploi</h2>
              <button onClick={resetForm} className="p-1 hover:bg-ymad-gray-100 rounded"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-ymad-gray-700 mb-1">Titre du poste *</label><input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required /></div>
                <div><label className="block text-sm font-medium text-ymad-gray-700 mb-1">Département</label><select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full px-4 py-2 border rounded-lg"><option value="">Sélectionner</option>{departments.map(d => <option key={d}>{d}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-ymad-gray-700 mb-1">Lieu</label><input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="Antananarivo" /></div>
                <div><label className="block text-sm font-medium text-ymad-gray-700 mb-1">Type de contrat</label><select value={formData.contractType} onChange={(e) => setFormData({...formData, contractType: e.target.value as any})} className="w-full px-4 py-2 border rounded-lg">{contractTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-ymad-gray-700 mb-1">Salaire (optionnel)</label><input type="text" value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="800 000 - 1 200 000 Ar" /></div>
                <div><label className="block text-sm font-medium text-ymad-gray-700 mb-1">Date limite</label><input type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="w-full px-4 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-ymad-gray-700 mb-1">Statut</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full px-4 py-2 border rounded-lg"><option value="draft">Brouillon</option><option value="published">Publié</option><option value="open">Ouvert</option></select></div>
                <div><label className="block text-sm font-medium text-ymad-gray-700 mb-1">Email de contact *</label><input type="email" value={formData.contactEmail} onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required /></div>
                <div><label className="block text-sm font-medium text-ymad-gray-700 mb-1">Téléphone de contact</label><input type="tel" value={formData.contactPhone} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} className="w-full px-4 py-2 border rounded-lg" /></div>
                <div className="flex items-center gap-4"><label className="flex items-center gap-2"><input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})} className="w-4 h-4 rounded" /><span className="text-sm">⭐ Mettre en vedette</span></label></div>
              </div>
              <div><label className="block text-sm font-medium text-ymad-gray-700 mb-1">Description du poste *</label><textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required /></div>
              <div><label className="block text-sm font-medium text-ymad-gray-700 mb-1">Missions (une par ligne)</label><textarea rows={4} value={formData.missions} onChange={(e) => setFormData({...formData, missions: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="Planifier les projets&#10;Superviser les équipes&#10;Assurer le suivi" /></div>
              <div><label className="block text-sm font-medium text-ymad-gray-700 mb-1">Prérequis (une par ligne)</label><textarea rows={4} value={formData.requirements} onChange={(e) => setFormData({...formData, requirements: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="Master en gestion de projet&#10;3 ans expérience&#10;Anglais courant" /></div>
              <div><label className="block text-sm font-medium text-ymad-gray-700 mb-1">Avantages (optionnel)</label><textarea rows={3} value={formData.benefits} onChange={(e) => setFormData({...formData, benefits: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="Mutuelle santé&#10;Tickets restaurant" /></div>
            </div>
            <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-3">
              <button onClick={resetForm} className="px-4 py-2 border rounded-lg hover:bg-ymad-gray-50 transition">Annuler</button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-ymad-blue-600 text-white rounded-lg font-semibold hover:bg-ymad-blue-700 transition">{editingId ? 'Modifier' : 'Créer'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL DÉTAIL CORRIGÉ ==================== */}
      {showDetail && selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowDetail(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* En-tête */}
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-ymad-gray-800">{selectedJob.title}</h2>
              <button onClick={() => setShowDetail(false)} className="p-1 hover:bg-ymad-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`px-2 py-1 text-xs rounded-full ${getContractTypeColor(selectedJob.contractType)}`}>
                  {selectedJob.contractType}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusLabel(selectedJob.status).color}`}>
                  {getStatusLabel(selectedJob.status).label}
                </span>
                {selectedJob.isFeatured && (
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">⭐ En vedette</span>
                )}
              </div>

              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-ymad-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-ymad-gray-500">Département</p>
                  <p className="font-medium">{selectedJob.department || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-sm text-ymad-gray-500">Lieu</p>
                  <p className="font-medium">{selectedJob.location || 'Madagascar'}</p>
                </div>
                {selectedJob.salary && (
                  <div>
                    <p className="text-sm text-ymad-gray-500">Salaire</p>
                    <p className="font-medium">{selectedJob.salary}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-ymad-gray-500">Date limite</p>
                  <p className="font-medium">{new Date(selectedJob.deadline).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-ymad-gray-500">Candidatures</p>
                  <p className="font-medium">{selectedJob.applicationsCount} candidat(s)</p>
                </div>
                <div>
                  <p className="text-sm text-ymad-gray-500">Vues</p>
                  <p className="font-medium">{selectedJob.viewsCount} vue(s)</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-ymad-gray-800 mb-2">📝 Description</h3>
                <p className="text-ymad-gray-600 whitespace-pre-wrap">{selectedJob.description}</p>
              </div>

              {/* Missions avec vérification */}
              <div>
                <h3 className="font-semibold text-ymad-gray-800 mb-2">🎯 Missions</h3>
                {selectedJob.missions && selectedJob.missions.length > 0 ? (
                  <ul className="list-disc list-inside text-ymad-gray-600 space-y-1">
                    {selectedJob.missions.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                ) : (
                  <p className="text-ymad-gray-500 italic">Aucune mission spécifiée</p>
                )}
              </div>

              {/* Prérequis avec vérification */}
              <div>
                <h3 className="font-semibold text-ymad-gray-800 mb-2">✅ Prérequis</h3>
                {selectedJob.requirements && selectedJob.requirements.length > 0 ? (
                  <ul className="list-disc list-inside text-ymad-gray-600 space-y-1">
                    {selectedJob.requirements.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                ) : (
                  <p className="text-ymad-gray-500 italic">Aucun prérequis spécifié</p>
                )}
              </div>

              {/* Avantages avec vérification */}
              {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                <div>
                  <h3 className="font-semibold text-ymad-gray-800 mb-2">🎁 Avantages</h3>
                  <ul className="list-disc list-inside text-ymad-gray-600 space-y-1">
                    {selectedJob.benefits.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
              )}

              {/* Contact et action */}
              <div className="bg-ymad-blue-50 p-4 rounded-lg flex flex-wrap justify-between items-center gap-3">
                <div>
                  <p className="text-sm text-ymad-gray-600">Contact</p>
                  <p className="font-medium">{selectedJob.contactEmail}</p>
                  {selectedJob.contactPhone && <p className="text-sm">{selectedJob.contactPhone}</p>}
                </div>
                <Link 
                  href={`/dashboard/applications?job=${selectedJob.id}`} 
                  className="px-4 py-2 bg-ymad-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-ymad-blue-700 transition flex items-center gap-2"
                >
                  <Users className="w-4 h-4" /> Voir les candidatures ({selectedJob.applicationsCount})
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}