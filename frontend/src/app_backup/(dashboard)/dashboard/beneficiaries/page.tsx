// src/app/(dashboard)/dashboard/beneficiaries/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, X, CheckCircle, AlertCircle, 
  User, Mail, Phone, MapPin, Calendar, Users, FileText, Heart,
  TrendingUp, Award, Filter, Download, Eye, Loader2,
  Briefcase, FolderOpen
} from 'lucide-react';
import Link from 'next/link';

// ========================================
// TYPES COMPLETS
// ========================================
interface Beneficiary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  region: string;
  fokontany?: string;
  age?: number;
  gender?: 'M' | 'F' | 'other';
  educationLevel?: string;
  employmentStatus?: string;
  beforeYmad?: string;
  afterYmad?: string;
  vulnerability?: string;
  projectIds: string[];
  beforeIncome?: number;
  afterIncome?: number;
  beforeSkills?: string[];
  afterSkills?: string[];
  beforeConfidence?: number;
  afterConfidence?: number;
  employmentFound?: {
    company: string;
    position: string;
    startDate: string;
    salary: number;
  };
  businessCreated?: {
    name: string;
    type: string;
    employees: number;
    monthlyRevenue: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  title: string;
  status: string;
  progress: number;
}

interface ImpactStats {
  totalBeneficiaries: number;
  employedCount: number;
  employmentRate: number;
  averageIncomeIncrease: number;
  businessesCreated: number;
  averageConfidenceIncrease: number;
  byRegion: Record<string, number>;
  byAgeGroup: Record<string, number>;
}

// ========================================
// DONNÉES STATIQUES
// ========================================
const regions: string[] = [
  'Analamanga', 'Atsimo-Andrefana', 'Atsimo-Atsinanana', 'Atsinanana', 
  'Alaotra-Mangoro', 'Amoron\'i Mania', 'Androy', 'Anosy', 
  'Betsiboka', 'Boeny', 'Bongolava', 'Diana', 
  'Haute Matsiatra', 'Ihorombe', 'Itasy', 'Melaky', 
  'Menabe', 'Sava', 'Sofia', 'Vakinankaratra', 'Vatovavy-Fitovinany'
];

const educationLevels: string[] = ['Primaire', 'Secondaire', 'Lycée', 'Université', 'Formation pro', 'Aucun'];
const employmentStatuses: string[] = ['Étudiant', 'Employé', 'Chômeur', 'Entrepreneur', 'Auto-entrepreneur', 'Stage', 'Autre'];
const vulnerabilities: string[] = ['Orphelin', 'Handicap', 'Très pauvre', 'Zone reculée', 'Famille nombreuse', 'Aucune'];
const genders: { value: 'M' | 'F' | 'other'; label: string }[] = [
  { value: 'M', label: 'Homme' },
  { value: 'F', label: 'Femme' },
  { value: 'other', label: 'Autre' }
];

// ========================================
// DONNÉES PAR DÉFAUT
// ========================================
const defaultBeneficiaries: Beneficiary[] = [
  {
    id: '1',
    firstName: 'Jean',
    lastName: 'Rakoto',
    email: 'jean.rakoto@email.com',
    phone: '034 00 000 01',
    region: 'Analamanga',
    fokontany: 'Antananarivo',
    age: 22,
    gender: 'M',
    educationLevel: 'Lycée',
    employmentStatus: 'Employé',
    beforeYmad: 'Sans emploi, difficultés financières',
    afterYmad: 'Employé dans une entreprise tech',
    vulnerability: 'Très pauvre',
    projectIds: ['1'],
    beforeIncome: 0,
    afterIncome: 350000,
    beforeSkills: ['Communication de base'],
    afterSkills: ['Développement web', 'Gestion de projet'],
    beforeConfidence: 3,
    afterConfidence: 8,
    employmentFound: {
      company: 'Tech Madagascar',
      position: 'Développeur Junior',
      startDate: '2024-03-15',
      salary: 350000
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    firstName: 'Marie',
    lastName: 'Rasoanaivo',
    email: 'marie.rasoanaivo@email.com',
    phone: '034 00 000 02',
    region: 'Fianarantsoa',
    fokontany: 'Fianarantsoa',
    age: 25,
    gender: 'F',
    educationLevel: 'Université',
    employmentStatus: 'Entrepreneur',
    beforeYmad: 'Étudiante sans expérience',
    afterYmad: 'Création de sa propre entreprise',
    vulnerability: 'Aucune',
    projectIds: ['2', '4'],
    beforeIncome: 50000,
    afterIncome: 450000,
    beforeSkills: ['Marketing'],
    afterSkills: ['Gestion d\'entreprise', 'Comptabilité'],
    beforeConfidence: 5,
    afterConfidence: 9,
    businessCreated: {
      name: 'Saveurs de Madagascar',
      type: 'Agroalimentaire',
      employees: 3,
      monthlyRevenue: 450000
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    firstName: 'Toky',
    lastName: 'Randria',
    email: 'toky@email.com',
    phone: '034 00 000 03',
    region: 'Toamasina',
    age: 20,
    gender: 'M',
    educationLevel: 'Secondaire',
    employmentStatus: 'Formation',
    beforeYmad: 'Décrocheur scolaire',
    afterYmad: 'En formation professionnelle',
    vulnerability: 'Orphelin',
    projectIds: ['4'],
    beforeIncome: 0,
    afterIncome: 0,
    beforeConfidence: 2,
    afterConfidence: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const defaultProjects: Project[] = [
  { id: '1', title: '📚 Éducation pour tous', status: 'active', progress: 75 },
  { id: '2', title: '🌿 Reforestation Madagascar', status: 'active', progress: 45 },
  { id: '3', title: '💧 Accès à l\'eau potable', status: 'active', progress: 60 },
  { id: '4', title: '💼 Formation professionnelle', status: 'active', progress: 80 },
  { id: '5', title: '🚀 Entrepreneuriat jeune', status: 'active', progress: 55 }
];

// ========================================
// FONCTIONS LOCALSTORAGE
// ========================================
const getStoredBeneficiaries = (): Beneficiary[] => {
  if (typeof window === 'undefined') return defaultBeneficiaries;
  const stored = localStorage.getItem('ymad_beneficiaries');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultBeneficiaries;
    }
  }
  localStorage.setItem('ymad_beneficiaries', JSON.stringify(defaultBeneficiaries));
  return defaultBeneficiaries;
};

const saveBeneficiaries = (beneficiaries: Beneficiary[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ymad_beneficiaries', JSON.stringify(beneficiaries));
};

const getStoredProjects = (): Project[] => {
  if (typeof window === 'undefined') return defaultProjects;
  const stored = localStorage.getItem('ymad_projects_list');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultProjects;
    }
  }
  localStorage.setItem('ymad_projects_list', JSON.stringify(defaultProjects));
  return defaultProjects;
};

// ========================================
// COMPOSANT PRINCIPAL
// ========================================
export default function BeneficiariesPage() {
  // États
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState<Beneficiary[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterRegion, setFilterRegion] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showImpactModal, setShowImpactModal] = useState<boolean>(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [impactStats, setImpactStats] = useState<ImpactStats>({
    totalBeneficiaries: 0,
    employedCount: 0,
    employmentRate: 0,
    averageIncomeIncrease: 0,
    businessesCreated: 0,
    averageConfidenceIncrease: 0,
    byRegion: {},
    byAgeGroup: {}
  });
  
  // Formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    region: '',
    fokontany: '',
    age: '',
    gender: 'M' as 'M' | 'F' | 'other',
    educationLevel: '',
    employmentStatus: '',
    beforeYmad: '',
    afterYmad: '',
    vulnerability: '',
    projectIds: [] as string[],
    beforeIncome: '',
    afterIncome: '',
    beforeConfidence: '5',
    afterConfidence: '5',
    beforeSkills: '',
    afterSkills: '',
    companyName: '',
    position: '',
    employmentDate: '',
    salary: '',
    businessName: '',
    businessType: '',
    businessEmployees: '',
    businessRevenue: ''
  });

  // ========================================
  // CHARGEMENT DES DONNÉES
  // ========================================
  useEffect(() => {
    loadBeneficiaries();
    loadProjects();
  }, []);

  useEffect(() => {
    filterBeneficiaries();
  }, [searchTerm, filterRegion, filterStatus, beneficiaries]);

  useEffect(() => {
    calculateImpactStats();
  }, [beneficiaries]);

  const loadBeneficiaries = (): void => {
    setLoading(true);
    try {
      const data = getStoredBeneficiaries();
      setBeneficiaries(data);
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = (): void => {
    try {
      const data = getStoredProjects();
      setProjects(data);
    } catch (error) {
      console.error('Erreur:', error);
      setProjects(defaultProjects);
    }
  };

  const filterBeneficiaries = (): void => {
    let filtered = [...beneficiaries];
    
    if (searchTerm) {
      filtered = filtered.filter((b: Beneficiary) => 
        b.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterRegion) {
      filtered = filtered.filter((b: Beneficiary) => b.region === filterRegion);
    }
    
    if (filterStatus) {
      if (filterStatus === 'employed') {
        filtered = filtered.filter((b: Beneficiary) => b.employmentStatus === 'Employé' || b.employmentStatus === 'Entrepreneur');
      } else if (filterStatus === 'training') {
        filtered = filtered.filter((b: Beneficiary) => b.employmentStatus === 'Étudiant' || b.employmentStatus === 'Formation');
      } else if (filterStatus === 'unemployed') {
        filtered = filtered.filter((b: Beneficiary) => b.employmentStatus === 'Chômeur');
      }
    }
    
    setFilteredBeneficiaries(filtered);
  };

  const calculateImpactStats = (): void => {
    const total = beneficiaries.length;
    const employed = beneficiaries.filter((b: Beneficiary) => 
      b.employmentStatus === 'Employé' || b.employmentStatus === 'Entrepreneur'
    ).length;
    
    const incomeIncreases: number[] = beneficiaries
      .filter((b: Beneficiary) => b.beforeIncome !== undefined && b.afterIncome !== undefined && b.afterIncome > 0)
      .map((b: Beneficiary) => (b.afterIncome || 0) - (b.beforeIncome || 0));
    
    const avgIncomeIncrease = incomeIncreases.length > 0 
      ? incomeIncreases.reduce((a: number, b: number) => a + b, 0) / incomeIncreases.length 
      : 0;
    
    const businessesCreated = beneficiaries.filter((b: Beneficiary) => b.businessCreated !== undefined).length;
    
    const confidenceIncreases: number[] = beneficiaries
      .filter((b: Beneficiary) => b.beforeConfidence !== undefined && b.afterConfidence !== undefined)
      .map((b: Beneficiary) => (b.afterConfidence || 0) - (b.beforeConfidence || 0));
    
    const avgConfidenceIncrease = confidenceIncreases.length > 0 
      ? confidenceIncreases.reduce((a: number, b: number) => a + b, 0) / confidenceIncreases.length 
      : 0;
    
    const byRegion: Record<string, number> = {};
    beneficiaries.forEach((b: Beneficiary) => {
      byRegion[b.region] = (byRegion[b.region] || 0) + 1;
    });
    
    const byAgeGroup: Record<string, number> = {};
    beneficiaries.forEach((b: Beneficiary) => {
      if (b.age) {
        const group = b.age < 18 ? '-18' : b.age < 25 ? '18-24' : b.age < 35 ? '25-34' : '35+';
        byAgeGroup[group] = (byAgeGroup[group] || 0) + 1;
      }
    });
    
    setImpactStats({
      totalBeneficiaries: total,
      employedCount: employed,
      employmentRate: total > 0 ? (employed / total) * 100 : 0,
      averageIncomeIncrease: avgIncomeIncrease,
      businessesCreated,
      averageConfidenceIncrease: avgConfidenceIncrease,
      byRegion,
      byAgeGroup
    });
  };

  const showMessage = (text: string, type: 'success' | 'error'): void => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // ========================================
  // CRUD OPÉRATIONS
  // ========================================
  const handleSubmit = (): void => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      showMessage('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    const beneficiaryData: Beneficiary = {
      id: editingBeneficiary?.id || Date.now().toString(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      region: formData.region,
      fokontany: formData.fokontany || undefined,
      age: formData.age ? parseInt(formData.age) : undefined,
      gender: formData.gender,
      educationLevel: formData.educationLevel || undefined,
      employmentStatus: formData.employmentStatus || undefined,
      beforeYmad: formData.beforeYmad || undefined,
      afterYmad: formData.afterYmad || undefined,
      vulnerability: formData.vulnerability || undefined,
      projectIds: formData.projectIds,
      beforeIncome: formData.beforeIncome ? parseInt(formData.beforeIncome) : undefined,
      afterIncome: formData.afterIncome ? parseInt(formData.afterIncome) : undefined,
      beforeConfidence: formData.beforeConfidence ? parseInt(formData.beforeConfidence) : undefined,
      afterConfidence: formData.afterConfidence ? parseInt(formData.afterConfidence) : undefined,
      beforeSkills: formData.beforeSkills ? formData.beforeSkills.split(',').map(s => s.trim()) : undefined,
      afterSkills: formData.afterSkills ? formData.afterSkills.split(',').map(s => s.trim()) : undefined,
      employmentFound: (formData.companyName && formData.position) ? {
        company: formData.companyName,
        position: formData.position,
        startDate: formData.employmentDate,
        salary: parseInt(formData.salary) || 0
      } : undefined,
      businessCreated: formData.businessName ? {
        name: formData.businessName,
        type: formData.businessType,
        employees: parseInt(formData.businessEmployees) || 0,
        monthlyRevenue: parseInt(formData.businessRevenue) || 0
      } : undefined,
      createdAt: editingBeneficiary?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      let updatedBeneficiaries: Beneficiary[];
      if (editingBeneficiary) {
        updatedBeneficiaries = beneficiaries.map((b: Beneficiary) => 
          b.id === editingBeneficiary.id ? beneficiaryData : b
        );
        showMessage('Bénéficiaire modifié avec succès', 'success');
      } else {
        updatedBeneficiaries = [beneficiaryData, ...beneficiaries];
        showMessage('Bénéficiaire ajouté avec succès', 'success');
      }
      
      saveBeneficiaries(updatedBeneficiaries);
      setBeneficiaries(updatedBeneficiaries);
      resetForm();
    } catch (error) {
      showMessage('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleDelete = (id: string): void => {
    if (confirm('Supprimer ce bénéficiaire définitivement ?')) {
      const filtered = beneficiaries.filter((b: Beneficiary) => b.id !== id);
      saveBeneficiaries(filtered);
      setBeneficiaries(filtered);
      showMessage('Bénéficiaire supprimé avec succès', 'success');
    }
  };

  const resetForm = (): void => {
    setShowForm(false);
    setShowImpactModal(false);
    setEditingBeneficiary(null);
    setSelectedBeneficiary(null);
    setFormData({
      firstName: '', lastName: '', email: '', phone: '', region: '', fokontany: '', age: '',
      gender: 'M', educationLevel: '', employmentStatus: '', beforeYmad: '', afterYmad: '', 
      vulnerability: '', projectIds: [],
      beforeIncome: '', afterIncome: '', beforeConfidence: '5', afterConfidence: '5',
      beforeSkills: '', afterSkills: '', companyName: '', position: '', employmentDate: '',
      salary: '', businessName: '', businessType: '', businessEmployees: '', businessRevenue: ''
    });
  };

  const editBeneficiary = (beneficiary: Beneficiary): void => {
    setEditingBeneficiary(beneficiary);
    setFormData({
      firstName: beneficiary.firstName,
      lastName: beneficiary.lastName,
      email: beneficiary.email,
      phone: beneficiary.phone || '',
      region: beneficiary.region || '',
      fokontany: beneficiary.fokontany || '',
      age: beneficiary.age?.toString() || '',
      gender: beneficiary.gender || 'M',
      educationLevel: beneficiary.educationLevel || '',
      employmentStatus: beneficiary.employmentStatus || '',
      beforeYmad: beneficiary.beforeYmad || '',
      afterYmad: beneficiary.afterYmad || '',
      vulnerability: beneficiary.vulnerability || '',
      projectIds: beneficiary.projectIds || [],
      beforeIncome: beneficiary.beforeIncome?.toString() || '',
      afterIncome: beneficiary.afterIncome?.toString() || '',
      beforeConfidence: beneficiary.beforeConfidence?.toString() || '5',
      afterConfidence: beneficiary.afterConfidence?.toString() || '5',
      beforeSkills: beneficiary.beforeSkills?.join(', ') || '',
      afterSkills: beneficiary.afterSkills?.join(', ') || '',
      companyName: beneficiary.employmentFound?.company || '',
      position: beneficiary.employmentFound?.position || '',
      employmentDate: beneficiary.employmentFound?.startDate || '',
      salary: beneficiary.employmentFound?.salary?.toString() || '',
      businessName: beneficiary.businessCreated?.name || '',
      businessType: beneficiary.businessCreated?.type || '',
      businessEmployees: beneficiary.businessCreated?.employees?.toString() || '',
      businessRevenue: beneficiary.businessCreated?.monthlyRevenue?.toString() || ''
    });
    setShowForm(true);
  };

  const viewImpact = (beneficiary: Beneficiary): void => {
    setSelectedBeneficiary(beneficiary);
    setShowImpactModal(true);
  };

  const toggleProjectId = (projectId: string): void => {
    setFormData((prev) => ({
      ...prev,
      projectIds: prev.projectIds.includes(projectId)
        ? prev.projectIds.filter((id: string) => id !== projectId)
        : [...prev.projectIds, projectId]
    }));
  };

  const exportToCSV = (): void => {
    const headers = ['ID', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Région', 'Âge', 'Genre', 'Niveau étude', 'Situation', 'Statut emploi', 'Revenu avant', 'Revenu après', 'Créé le'];
    const rows = beneficiaries.map((b: Beneficiary) => [
      b.id, b.firstName, b.lastName, b.email, b.phone, b.region, b.age || '', b.gender || '',
      b.educationLevel || '', b.employmentStatus || '', b.beforeIncome || '', b.afterIncome || '', 
      new Date(b.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `beneficiaires_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showMessage('Export CSV réussi', 'success');
  };

  // ========================================
  // RENDU
  // ========================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement des bénéficiaires...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Bénéficiaires</h1>
          <p className="text-gray-500 mt-1">Gestion et suivi d&apos;impact des jeunes bénéficiaires</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            <Download className="w-4 h-4" /> Exporter CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" /> Nouveau
          </button>
        </div>
      </div>

      {/* Message notification */}
      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Cartes statistiques d'impact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Total bénéficiaires</p>
              <p className="text-3xl font-bold">{impactStats.totalBeneficiaries}</p>
            </div>
            <Users className="w-8 h-8 opacity-80" />
          </div>
          <div className="mt-2 text-blue-100 text-sm">
            {Object.keys(impactStats.byRegion).length} régions couvertes
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Taux d&apos;emploi</p>
              <p className="text-3xl font-bold">{impactStats.employmentRate.toFixed(1)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
          <div className="mt-2 text-green-100 text-sm">
            {impactStats.employedCount} jeunes employés/entrepreneurs
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm">Augmentation revenu</p>
              <p className="text-2xl font-bold">+{impactStats.averageIncomeIncrease.toLocaleString()} Ar</p>
            </div>
            <Award className="w-8 h-8 opacity-80" />
          </div>
          <div className="mt-2 text-purple-100 text-sm">
            {impactStats.businessesCreated} entreprises créées
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-sm">Confiance</p>
              <p className="text-3xl font-bold">+{impactStats.averageConfidenceIncrease.toFixed(1)}</p>
            </div>
            <Heart className="w-8 h-8 opacity-80" />
          </div>
          <div className="mt-2 text-orange-100 text-sm">
            Sur une échelle de 1 à 10
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4 border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={filterRegion}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterRegion(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">🌍 Toutes régions</option>
            {regions.map((r: string) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">📊 Tous statuts</option>
            <option value="employed">✅ Employés/Entrepreneurs</option>
            <option value="training">📚 En formation</option>
            <option value="unemployed">🔍 En recherche</option>
          </select>
          {(searchTerm || filterRegion || filterStatus) && (
            <button
              onClick={() => { setSearchTerm(''); setFilterRegion(''); setFilterStatus(''); }}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 border rounded-lg hover:bg-gray-50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Liste des bénéficiaires */}
      {filteredBeneficiaries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun bénéficiaire trouvé</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-blue-600 hover:underline">
            + Ajouter un bénéficiaire
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left">Bénéficiaire</th>
                  <th className="p-4 text-left">Contact</th>
                  <th className="p-4 text-left">Localisation</th>
                  <th className="p-4 text-left">Niveau</th>
                  <th className="p-4 text-left">Impact</th>
                  <th className="p-4 text-left">Statut</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBeneficiaries.map((b: Beneficiary) => (
                  <tr key={b.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{b.firstName} {b.lastName}</p>
                          <p className="text-xs text-gray-500">{b.age} ans • {b.gender === 'M' ? 'Homme' : b.gender === 'F' ? 'Femme' : 'Autre'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm flex items-center gap-1"><Mail className="w-3 h-3" /> {b.email}</p>
                      {b.phone && <p className="text-sm flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {b.phone}</p>}
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{b.region}</p>
                      {b.fokontany && <p className="text-xs text-gray-500">{b.fokontany}</p>}
                    </td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                        {b.educationLevel || 'Non renseigné'}
                      </span>
                    </td>
                    <td className="p-4">
                      {b.afterIncome && b.beforeIncome !== undefined && b.afterIncome > 0 ? (
                        <div className="text-sm">
                          <span className="text-green-600 font-semibold">+{(b.afterIncome - (b.beforeIncome || 0)).toLocaleString()} Ar</span>
                          <p className="text-xs text-gray-500">revenu mensuel</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Non mesuré</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        b.employmentStatus === 'Employé' || b.employmentStatus === 'Entrepreneur' 
                          ? 'bg-green-100 text-green-700' 
                          : b.employmentStatus === 'Formation' || b.employmentStatus === 'Étudiant'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {b.employmentStatus || 'Non renseigné'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => viewImpact(b)} className="p-1 text-purple-600 hover:bg-purple-50 rounded" title="Voir impact">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button onClick={() => editBeneficiary(b)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Modifier">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(b.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Supprimer">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {filteredBeneficiaries.length} bénéficiaire{filteredBeneficiaries.length > 1 ? 's' : ''}
            </p>
            <Link href="/dashboard/reports/impact" className="text-blue-600 text-sm hover:underline">
              Voir rapport d&apos;impact complet →
            </Link>
          </div>
        </div>
      )}

      {/* MODAL AJOUT/MODIFICATION BÉNÉFICIAIRE */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingBeneficiary ? '✏️ Modifier' : '➕ Nouveau'} bénéficiaire
              </h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Informations personnelles */}
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2"><User className="w-4 h-4" /> Informations personnelles</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                  <select value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Sélectionner</option>
                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fokontany</label>
                  <input type="text" value={formData.fokontany} onChange={(e) => setFormData({...formData, fokontany: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Âge</label>
                  <input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                  <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value as 'M' | 'F' | 'other'})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    {genders.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau d&apos;étude</label>
                  <select value={formData.educationLevel} onChange={(e) => setFormData({...formData, educationLevel: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Sélectionner</option>
                    {educationLevels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Situation pro</label>
                  <select value={formData.employmentStatus} onChange={(e) => setFormData({...formData, employmentStatus: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Sélectionner</option>
                    {employmentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vulnérabilité</label>
                  <select value={formData.vulnerability} onChange={(e) => setFormData({...formData, vulnerability: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Sélectionner</option>
                    {vulnerabilities.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              {/* Mesure d'impact AVANT Y-Mad */}
              <div className="bg-yellow-50 p-3 rounded-lg mt-4">
                <h3 className="font-semibold text-yellow-800 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Situation AVANT Y-Mad</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Revenu mensuel (Ar)</label>
                  <input type="number" value={formData.beforeIncome} onChange={(e) => setFormData({...formData, beforeIncome: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau de confiance (1-10)</label>
                  <input type="range" min="1" max="10" value={formData.beforeConfidence} onChange={(e) => setFormData({...formData, beforeConfidence: e.target.value})} className="w-full" />
                  <span className="text-sm text-gray-500">{formData.beforeConfidence}/10</span>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Compétences (séparées par des virgules)</label>
                  <input type="text" value={formData.beforeSkills} onChange={(e) => setFormData({...formData, beforeSkills: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: Communication, Anglais, Excel" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description de la situation</label>
                  <textarea rows={2} value={formData.beforeYmad} onChange={(e) => setFormData({...formData, beforeYmad: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="Décrivez la situation avant l&apos;aide de Y-Mad..." />
                </div>
              </div>

              {/* Mesure d'impact APRÈS Y-Mad */}
              <div className="bg-green-50 p-3 rounded-lg mt-4">
                <h3 className="font-semibold text-green-800 flex items-center gap-2"><Award className="w-4 h-4" /> Situation APRÈS Y-Mad</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau revenu (Ar)</label>
                  <input type="number" value={formData.afterIncome} onChange={(e) => setFormData({...formData, afterIncome: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau niveau de confiance (1-10)</label>
                  <input type="range" min="1" max="10" value={formData.afterConfidence} onChange={(e) => setFormData({...formData, afterConfidence: e.target.value})} className="w-full" />
                  <span className="text-sm text-gray-500">{formData.afterConfidence}/10</span>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nouvelles compétences acquises</label>
                  <input type="text" value={formData.afterSkills} onChange={(e) => setFormData({...formData, afterSkills: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: Développement web, Gestion, Marketing" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description de l&apos;impact</label>
                  <textarea rows={2} value={formData.afterYmad} onChange={(e) => setFormData({...formData, afterYmad: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="Décrivez l&apos;impact après l&apos;accompagnement..." />
                </div>
              </div>

              {/* Emploi trouvé */}
              <div className="bg-purple-50 p-3 rounded-lg mt-4">
                <h3 className="font-semibold text-purple-800 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Emploi trouvé (optionnel)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                  <input type="text" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                  <input type="text" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d&apos;embauche</label>
                  <input type="date" value={formData.employmentDate} onChange={(e) => setFormData({...formData, employmentDate: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salaire (Ar)</label>
                  <input type="number" value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>

              {/* Projets */}
              <div className="bg-indigo-50 p-3 rounded-lg mt-4">
                <h3 className="font-semibold text-indigo-800 flex items-center gap-2"><FolderOpen className="w-4 h-4" /> Projets rattachés</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {projects.map((project: Project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => toggleProjectId(project.id)}
                    className={`px-3 py-1.5 rounded-full text-sm transition ${
                      formData.projectIds.includes(project.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {project.title}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-3">
              <button onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Annuler
              </button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                {editingBeneficiary ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VISUALISATION IMPACT */}
      {showImpactModal && selectedBeneficiary && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-xl">
              <h2 className="text-xl font-bold">📊 Impact - {selectedBeneficiary.firstName} {selectedBeneficiary.lastName}</h2>
              <button onClick={resetForm} className="p-1 hover:bg-white/20 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Impact général */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Avant Y-Mad</p>
                  <p className="text-2xl font-bold text-gray-800">{selectedBeneficiary.beforeIncome?.toLocaleString() || 0} Ar</p>
                  <p className="text-xs text-gray-500">Revenu mensuel</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Après Y-Mad</p>
                  <p className="text-2xl font-bold text-green-600">{selectedBeneficiary.afterIncome?.toLocaleString() || 0} Ar</p>
                  <p className="text-xs text-gray-500">Revenu mensuel</p>
                </div>
              </div>

              {/* Augmentation */}
              {selectedBeneficiary.beforeIncome !== undefined && selectedBeneficiary.afterIncome !== undefined && selectedBeneficiary.afterIncome > 0 && (
                <div className="bg-gradient-to-r from-green-100 to-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Augmentation du revenu</p>
                  <p className="text-3xl font-bold text-green-600">
                    +{(selectedBeneficiary.afterIncome - (selectedBeneficiary.beforeIncome || 0)).toLocaleString()} Ar
                  </p>
                  <p className="text-xs text-gray-500">
                    {((((selectedBeneficiary.afterIncome - (selectedBeneficiary.beforeIncome || 0)) / (selectedBeneficiary.beforeIncome || 1)) * 100).toFixed(0))}% de progression
                  </p>
                </div>
              )}

              {/* Confiance */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Confiance avant</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`w-3 h-3 rounded-full ${i < (selectedBeneficiary.beforeConfidence || 0) ? 'bg-yellow-500' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{selectedBeneficiary.beforeConfidence || 0}/10</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Confiance après</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`w-3 h-3 rounded-full ${i < (selectedBeneficiary.afterConfidence || 0) ? 'bg-yellow-500' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{selectedBeneficiary.afterConfidence || 0}/10</p>
                </div>
              </div>

              {/* Compétences */}
              {(selectedBeneficiary.beforeSkills?.length || selectedBeneficiary.afterSkills?.length) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Compétences avant</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedBeneficiary.beforeSkills?.map((skill: string, i: number) => (
                        <span key={i} className="text-xs bg-gray-200 px-2 py-1 rounded">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Compétences après</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedBeneficiary.afterSkills?.map((skill: string, i: number) => (
                        <span key={i} className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Emploi trouvé */}
              {selectedBeneficiary.employmentFound && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="font-semibold text-purple-800 mb-2">💼 Emploi trouvé</p>
                  <p><strong>Entreprise:</strong> {selectedBeneficiary.employmentFound.company}</p>
                  <p><strong>Poste:</strong> {selectedBeneficiary.employmentFound.position}</p>
                  <p><strong>Salaire:</strong> {selectedBeneficiary.employmentFound.salary.toLocaleString()} Ar</p>
                </div>
              )}

              {/* Entreprise créée */}
              {selectedBeneficiary.businessCreated && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-semibold text-green-800 mb-2">🚀 Entreprise créée</p>
                  <p><strong>Nom:</strong> {selectedBeneficiary.businessCreated.name}</p>
                  <p><strong>Type:</strong> {selectedBeneficiary.businessCreated.type}</p>
                  <p><strong>Employés:</strong> {selectedBeneficiary.businessCreated.employees}</p>
                  <p><strong>CA mensuel:</strong> {selectedBeneficiary.businessCreated.monthlyRevenue.toLocaleString()} Ar</p>
                </div>
              )}

              {/* Témoignage */}
              {selectedBeneficiary.afterYmad && (
                <div className="bg-gray-50 p-4 rounded-lg italic">
                  <p className="text-gray-600">"{selectedBeneficiary.afterYmad}"</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t flex justify-end">
              <button onClick={resetForm} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}