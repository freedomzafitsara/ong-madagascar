// src/app/dashboard/recruitment/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Edit, Trash2, Search, X, CheckCircle, AlertCircle, 
  Eye, Briefcase, MapPin, Calendar, DollarSign, Users, 
  FileText, Clock, Filter, ChevronRight, Heart, TrendingUp,
  Mail, Phone, Award, Target, BookOpen, Sparkles
} from 'lucide-react';

// ==================== TYPES ====================

interface Recruitment {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'CDI' | 'CDD' | 'Stage' | 'Volontariat' | 'Alternance';
  description: string;
  missions: string[];
  requirements: string[];
  benefits?: string[];
  salary?: string;
  deadline: string;
  status: 'open' | 'closed' | 'pending';
  views: number;
  candidates: number;
  createdAt: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface RecruitmentFormData {
  title: string;
  department: string;
  location: string;
  type: Recruitment['type'];
  description: string;
  missions: string;
  requirements: string;
  benefits: string;
  salary: string;
  deadline: string;
  status: Recruitment['status'];
  contactEmail: string;
  contactPhone: string;
}

// ==================== CONSTANTES ====================

const DEPARTMENTS = [
  'Programmes', 'Communication', 'IT', 'Éducation', 
  'Santé', 'Environnement', 'Administration', 'Finance', 'Ressources Humaines'
];

const LOCATIONS = [
  'Antananarivo', 'Fianarantsoa', 'Toamasina', 'Mahajanga', 
  'Toliara', 'Antsiranana', 'Antsirabe', 'Télétravail'
];

const CONTRACT_TYPES = [
  { value: 'CDI', label: 'CDI', color: 'bg-blue-100 text-blue-700', icon: '📄' },
  { value: 'CDD', label: 'CDD', color: 'bg-purple-100 text-purple-700', icon: '📅' },
  { value: 'Stage', label: 'Stage', color: 'bg-orange-100 text-orange-700', icon: '🎓' },
  { value: 'Volontariat', label: 'Volontariat', color: 'bg-green-100 text-green-700', icon: '🤝' },
  { value: 'Alternance', label: 'Alternance', color: 'bg-indigo-100 text-indigo-700', icon: '🔄' },
];

const STATUS_CONFIG = {
  open: { label: 'Ouvert', color: 'bg-green-100 text-green-700', icon: '🟢' },
  closed: { label: 'Fermé', color: 'bg-red-100 text-red-700', icon: '🔴' },
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
};

// Données par défaut
const DEFAULT_RECRUITMENTS: Recruitment[] = [
  {
    id: '1',
    title: 'Coordinateur(trice) de projet',
    department: 'Programmes',
    location: 'Antananarivo',
    type: 'CDI',
    description: 'Nous recherchons un(e) coordinateur(trice) de projet passionné(e) pour superviser nos programmes éducatifs et de développement à Madagascar.',
    missions: [
      'Planifier et coordonner les projets sur le terrain',
      'Superviser et former les équipes locales',
      'Assurer le suivi et l\'évaluation des projets',
      'Établir des rapports pour les partenaires et bailleurs'
    ],
    requirements: [
      'Master en développement, gestion de projet ou équivalent',
      'Minimum 3 ans d\'expérience en coordination de projet',
      'Excellente maîtrise du français et de l\'anglais',
      'Connaissance du contexte malgache',
      'Permis de conduire valide'
    ],
    benefits: [
      'Mutuelle santé prise en charge',
      'Frais de déplacement',
      'Formations continues',
      'Environnement de travail stimulant'
    ],
    salary: '800 000 - 1 200 000 Ar',
    deadline: '2025-05-30',
    status: 'open',
    views: 245,
    candidates: 12,
    createdAt: new Date().toISOString(),
    contactEmail: 'rh@y-mad.mg',
    contactPhone: '+261 34 00 000 00'
  },
  {
    id: '2',
    title: 'Chargé(e) de communication digitale',
    department: 'Communication',
    location: 'Antananarivo (télétravail partiel)',
    type: 'CDI',
    description: 'Rejoignez notre équipe communication pour développer notre présence en ligne et promouvoir nos actions auprès du grand public.',
    missions: [
      'Gérer les réseaux sociaux (Facebook, Instagram, LinkedIn)',
      'Créer du contenu (visuels, vidéos, articles)',
      'Animer la communauté en ligne',
      'Suivre les statistiques et proposer des améliorations',
      'Rédiger des newsletters'
    ],
    requirements: [
      'Licence/Bachelor en communication ou marketing',
      'Maîtrise des outils de création (Canva, Photoshop, etc.)',
      'Expérience en gestion de réseaux sociaux',
      'Créativité et réactivité',
      'Excellent rédactionnel'
    ],
    benefits: [
      'Matériel informatique fourni',
      'Horaires flexibles',
      'Évolution possible',
      'Tickets restaurant'
    ],
    salary: '600 000 - 800 000 Ar',
    deadline: '2025-05-15',
    status: 'open',
    views: 189,
    candidates: 8,
    createdAt: new Date().toISOString(),
    contactEmail: 'rh@y-mad.mg',
    contactPhone: '+261 34 00 000 00'
  },
  {
    id: '3',
    title: 'Stagiaire développeur web',
    department: 'IT',
    location: 'Antananarivo',
    type: 'Stage',
    description: 'Stage de fin d\'études pour contribuer au développement et à la maintenance du site web de l\'association.',
    missions: [
      'Développer de nouvelles fonctionnalités sur le site',
      'Corriger les bugs et optimiser les performances',
      'Participer à la refonte de certaines sections',
      'Documenter le code',
      'Assister l\'équipe technique'
    ],
    requirements: [
      'Étudiant en informatique (Bac+3/5)',
      'Connaissances en React/Next.js',
      'TypeScript et Tailwind CSS',
      'Curiosité et autonomie',
      'Bonne capacité d\'apprentissage'
    ],
    benefits: [
      'Gratification de stage',
      'Tickets restaurant',
      'Accompagnement personnalisé',
      'Possibilité d\'embauche'
    ],
    salary: '150 000 Ar',
    deadline: '2025-04-30',
    status: 'open',
    views: 312,
    candidates: 15,
    createdAt: new Date().toISOString(),
    contactEmail: 'rh@y-mad.mg',
    contactPhone: '+261 34 00 000 00'
  }
];

// ==================== COMPOSANT PRINCIPAL ====================

export default function RecruitmentManagement() {
  // États
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [filteredRecruitments, setFilteredRecruitments] = useState<Recruitment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Recruitment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Formulaire
  const [formData, setFormData] = useState<RecruitmentFormData>({
    title: '',
    department: '',
    location: '',
    type: 'CDI',
    description: '',
    missions: '',
    requirements: '',
    benefits: '',
    salary: '',
    deadline: '',
    status: 'open',
    contactEmail: '',
    contactPhone: '',
  });

  // Chargement des données
  useEffect(() => {
    loadRecruitments();
  }, []);

  const loadRecruitments = useCallback(() => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('ymad_recruitments');
      if (stored) {
        const data = JSON.parse(stored);
        setRecruitments(data);
        setFilteredRecruitments(data);
      } else {
        setRecruitments(DEFAULT_RECRUITMENTS);
        setFilteredRecruitments(DEFAULT_RECRUITMENTS);
        localStorage.setItem('ymad_recruitments', JSON.stringify(DEFAULT_RECRUITMENTS));
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      showMessage('Erreur lors du chargement des offres', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveRecruitments = (data: Recruitment[]) => {
    localStorage.setItem('ymad_recruitments', JSON.stringify(data));
    setRecruitments(data);
    applyFilters(data, searchTerm, filterStatus, filterType, filterDepartment);
  };

  const applyFilters = (
    data: Recruitment[],
    term: string,
    status: string,
    type: string,
    department: string
  ) => {
    let filtered = [...data];
    
    if (term) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(term.toLowerCase()) ||
        r.department.toLowerCase().includes(term.toLowerCase()) ||
        r.location.toLowerCase().includes(term.toLowerCase())
      );
    }
    if (status) filtered = filtered.filter(r => r.status === status);
    if (type) filtered = filtered.filter(r => r.type === type);
    if (department) filtered = filtered.filter(r => r.department === department);
    
    setFilteredRecruitments(filtered);
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      showMessage('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    const missionsArray = formData.missions.split('\n').filter(m => m.trim());
    const requirementsArray = formData.requirements.split('\n').filter(r => r.trim());
    const benefitsArray = formData.benefits.split('\n').filter(b => b.trim());

    if (editingId) {
      const updated = recruitments.map(r =>
        r.id === editingId
          ? {
              ...r,
              title: formData.title,
              department: formData.department,
              location: formData.location,
              type: formData.type,
              description: formData.description,
              missions: missionsArray,
              requirements: requirementsArray,
              benefits: benefitsArray,
              salary: formData.salary,
              deadline: formData.deadline,
              status: formData.status,
              contactEmail: formData.contactEmail,
              contactPhone: formData.contactPhone,
            }
          : r
      );
      saveRecruitments(updated);
      showMessage('Offre modifiée avec succès', 'success');
    } else {
      const newRecruitment: Recruitment = {
        id: Date.now().toString(),
        title: formData.title,
        department: formData.department,
        location: formData.location,
        type: formData.type,
        description: formData.description,
        missions: missionsArray,
        requirements: requirementsArray,
        benefits: benefitsArray,
        salary: formData.salary,
        deadline: formData.deadline,
        status: formData.status,
        views: 0,
        candidates: 0,
        createdAt: new Date().toISOString(),
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
      };
      saveRecruitments([newRecruitment, ...recruitments]);
      showMessage('Offre créée avec succès', 'success');
    }

    resetForm();
  };

  const handleEdit = (recruitment: Recruitment) => {
    setEditingId(recruitment.id);
    setFormData({
      title: recruitment.title,
      department: recruitment.department,
      location: recruitment.location,
      type: recruitment.type,
      description: recruitment.description,
      missions: recruitment.missions.join('\n'),
      requirements: recruitment.requirements.join('\n'),
      benefits: recruitment.benefits?.join('\n') || '',
      salary: recruitment.salary || '',
      deadline: recruitment.deadline,
      status: recruitment.status,
      contactEmail: recruitment.contactEmail || '',
      contactPhone: recruitment.contactPhone || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('⚠️ Supprimer définitivement cette offre ? Cette action est irréversible.')) {
      const filtered = recruitments.filter(r => r.id !== id);
      saveRecruitments(filtered);
      showMessage('Offre supprimée avec succès', 'success');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      department: '',
      location: '',
      type: 'CDI',
      description: '',
      missions: '',
      requirements: '',
      benefits: '',
      salary: '',
      deadline: '',
      status: 'open',
      contactEmail: '',
      contactPhone: '',
    });
  };

  // Gestion des filtres
  useEffect(() => {
    applyFilters(recruitments, searchTerm, filterStatus, filterType, filterDepartment);
  }, [searchTerm, filterStatus, filterType, filterDepartment, recruitments]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterType('');
    setFilterDepartment('');
  };

  // ✅ CORRECTION ICI : Utilisation de forEach au lieu de Set
  const getUniqueTypes = (): string[] => {
    const types: string[] = [];
    recruitments.forEach(r => {
      if (!types.includes(r.type)) {
        types.push(r.type);
      }
    });
    return types;
  };

  const getUniqueDepartments = (): string[] => {
    const depts: string[] = [];
    recruitments.forEach(r => {
      if (!depts.includes(r.department)) {
        depts.push(r.department);
      }
    });
    return depts;
  };

  // Statistiques
  const stats = {
    total: recruitments.length,
    open: recruitments.filter(r => r.status === 'open').length,
    closed: recruitments.filter(r => r.status === 'closed').length,
    pending: recruitments.filter(r => r.status === 'pending').length,
    totalCandidates: recruitments.reduce((sum, r) => sum + r.candidates, 0),
    totalViews: recruitments.reduce((sum, r) => sum + r.views, 0),
  };

  const uniqueTypes = getUniqueTypes();
  const uniqueDepartments = getUniqueDepartments();

  const getTypeConfig = (type: string) => {
    return CONTRACT_TYPES.find(t => t.value === type) || CONTRACT_TYPES[0];
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const isDeadlineExpired = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des offres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ==================== EN-TÊTE ==================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ymad-blue-800">Gestion des recrutements</h1>
          <p className="text-gray-500 mt-1">Gérez les offres d'emploi, stages et volontariats</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition shadow-sm"
        >
          <Plus className="w-5 h-5" /> Nouvelle offre
        </button>
      </div>

      {/* ==================== MESSAGE ==================== */}
      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* ==================== STATISTIQUES ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
          <Briefcase className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-500">Total offres</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
          <div className="w-6 h-6 bg-green-100 rounded-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-green-600 text-xs">●</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.open}</p>
          <p className="text-xs text-gray-500">Offres ouvertes</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
          <div className="w-6 h-6 bg-red-100 rounded-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-red-600 text-xs">●</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.closed}</p>
          <p className="text-xs text-gray-500">Offres fermées</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
          <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.totalCandidates}</p>
          <p className="text-xs text-gray-500">Candidats total</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
          <Eye className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.totalViews}</p>
          <p className="text-xs text-gray-500">Vues totales</p>
        </div>
      </div>

      {/* ==================== FILTRES ==================== */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une offre (titre, département, lieu)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
          >
            <option value="">📋 Tous les statuts</option>
            <option value="open">🟢 Ouvertes</option>
            <option value="closed">🔴 Fermées</option>
            <option value="pending">🟡 En attente</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
          >
            <option value="">📄 Tous les types</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
          >
            <option value="">🏢 Tous les départements</option>
            {uniqueDepartments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          {(searchTerm || filterStatus || filterType || filterDepartment) && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              ✕ Effacer les filtres
            </button>
          )}
        </div>
      </div>

      {/* ==================== LISTE DES OFFRES ==================== */}
      {filteredRecruitments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm py-16 text-center">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucune offre de recrutement trouvée</p>
          <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos filtres ou créez une nouvelle offre</p>
          <button onClick={() => setShowForm(true)} className="mt-4 text-yellow-600 hover:underline">
            + Créer une offre
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y">
            {filteredRecruitments.map((recruitment) => {
              const typeConfig = getTypeConfig(recruitment.type);
              const statusConfig = getStatusConfig(recruitment.status);
              const isExpired = isDeadlineExpired(recruitment.deadline);
              
              return (
                <div key={recruitment.id} className="p-5 hover:bg-gray-50 transition group">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-bold text-lg text-gray-800">{recruitment.title}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${typeConfig.color}`}>
                          {recruitment.type}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${statusConfig.color}`}>
                          {statusConfig.icon} {statusConfig.label}
                        </span>
                        {isExpired && recruitment.status === 'open' && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700">
                            ⚠️ Date dépassée
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {recruitment.department}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {recruitment.location}</span>
                        {recruitment.salary && <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {recruitment.salary}</span>}
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Limite: {formatDate(recruitment.deadline)}</span>
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-2">{recruitment.description}</p>
                      
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {recruitment.candidates} candidat(s)</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {recruitment.views} vue(s)</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Créé le {formatDate(recruitment.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-start">
                      <button 
                        onClick={() => { setSelectedOffer(recruitment); setShowDetailModal(true); }} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                        title="Voir détails"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleEdit(recruitment)} 
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition" 
                        title="Modifier"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(recruitment.id)} 
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" 
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== MODAL FORMULAIRE ==================== */}
      {showForm && (
        <RecruitmentFormModal
          formData={formData}
          setFormData={setFormData}
          editingId={editingId}
          onSave={handleSubmit}
          onCancel={resetForm}
          departments={DEPARTMENTS}
          locations={LOCATIONS}
          contractTypes={CONTRACT_TYPES}
        />
      )}

      {/* ==================== MODAL DÉTAIL ==================== */}
      {showDetailModal && selectedOffer && (
        <RecruitmentDetailModal
          offer={selectedOffer}
          onClose={() => setShowDetailModal(false)}
          formatDate={formatDate}
          getTypeConfig={getTypeConfig}
          getStatusConfig={getStatusConfig}
        />
      )}
    </div>
  );
}

// ==================== COMPOSANT MODAL FORMULAIRE ====================

function RecruitmentFormModal({ 
  formData, setFormData, editingId, onSave, onCancel,
  departments, locations, contractTypes 
}: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">
            {editingId ? '✏️ Modifier l\'offre' : '➕ Nouvelle offre de recrutement'}
          </h2>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre du poste *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                placeholder="Ex: Coordinateur de projet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              >
                <option value="">Sélectionner un département</option>
                {departments.map((dept: string) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              >
                <option value="">Sélectionner un lieu</option>
                {locations.map((loc: string) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              >
                {contractTypes.map((type: any) => (
                  <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salaire (optionnel)</label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                placeholder="Ex: 800 000 - 1 200 000 Ar"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date limite</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              >
                <option value="open">🟢 Ouvert</option>
                <option value="closed">🔴 Fermé</option>
                <option value="pending">🟡 En attente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                placeholder="rh@y-mad.mg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone de contact</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                placeholder="+261 34 00 000 00"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description du poste *</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              placeholder="Description détaillée du poste..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Missions (une par ligne)</label>
            <textarea
              rows={3}
              value={formData.missions}
              onChange={(e) => setFormData({...formData, missions: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              placeholder="Ex:&#10;Planifier et coordonner les projets&#10;Superviser les équipes&#10;Assurer le suivi et l'évaluation"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prérequis (une par ligne)</label>
            <textarea
              rows={3}
              value={formData.requirements}
              onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              placeholder="Ex:&#10;Master en développement&#10;3 ans d'expérience&#10;Maîtrise de l'anglais"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avantages (optionnel, une par ligne)</label>
            <textarea
              rows={2}
              value={formData.benefits}
              onChange={(e) => setFormData({...formData, benefits: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              placeholder="Ex:&#10;Mutuelle santé&#10;Tickets restaurant&#10;Formation continue"
            />
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-3 rounded-b-xl">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Annuler
          </button>
          <button onClick={onSave} className="px-6 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition">
            {editingId ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPOSANT MODAL DÉTAIL ====================

function RecruitmentDetailModal({ offer, onClose, formatDate, getTypeConfig, getStatusConfig }: any) {
  const typeConfig = getTypeConfig(offer.type);
  const statusConfig = getStatusConfig(offer.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{offer.title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          {/* En-tête */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`px-2 py-1 text-xs rounded-full ${typeConfig.color}`}>
              {offer.type}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${statusConfig.color}`}>
              {statusConfig.icon} {statusConfig.label}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-500 ml-auto">
              <Eye className="w-4 h-4" /> {offer.views} vues
            </span>
          </div>
          
          {/* Infos générales */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span>{offer.department}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{offer.location}</span>
            </div>
            {offer.salary && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span>{offer.salary}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Limite: {formatDate(offer.deadline)}</span>
            </div>
            {offer.contactEmail && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href={`mailto:${offer.contactEmail}`} className="text-blue-600 hover:underline">{offer.contactEmail}</a>
              </div>
            )}
            {offer.contactPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href={`tel:${offer.contactPhone}`} className="hover:underline">{offer.contactPhone}</a>
              </div>
            )}
          </div>
          
          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-yellow-500" /> Description
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{offer.description}</p>
          </div>
          
          {/* Missions */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-yellow-500" /> Missions
            </h3>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
              {offer.missions.map((m: string, i: number) => <li key={i}>{m}</li>)}
            </ul>
          </div>
          
          {/* Prérequis */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" /> Prérequis
            </h3>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
              {offer.requirements.map((r: string, i: number) => <li key={i}>{r}</li>)}
            </ul>
          </div>
          
          {/* Avantages */}
          {offer.benefits && offer.benefits.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" /> Avantages
              </h3>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                {offer.benefits.map((b: string, i: number) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}
          
          {/* Candidatures */}
          <div className="bg-gradient-to-r from-ymad-blue-50 to-ymad-blue-100 p-4 rounded-lg flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Candidatures reçues</p>
              <p className="text-2xl font-bold text-ymad-blue-800">{offer.candidates}</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition flex items-center gap-2">
                <Users className="w-4 h-4" /> Voir les candidats
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}