// src/app/dashboard/reports/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, Download, Calendar, TrendingUp, Users, 
  Briefcase, Heart, MapPin, DollarSign,
  Printer, CheckCircle, AlertCircle, Loader2, Award,
  Handshake, Globe, Building, Star, RefreshCw,
  ChevronLeft, ChevronRight, Eye, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

// ========================================
// TYPES
// ========================================

interface Project {
  id: string;
  title: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  beneficiaries_count: number;
  region: string;
  created_at: string;
}

interface Beneficiary {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  region: string;
  age: number;
  employment_status: string;
  education_level?: string;
  before_income?: number;
  after_income?: number;
  created_at: string;
}

interface Volunteer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  skills: string[];
  status: string;
  hours: number;
  created_at: string;
}

interface JobOffer {
  id: string;
  title: string;
  location: string;
  status: string;
  applications_count: number;
  views_count: number;
  created_at: string;
}

interface Donation {
  id: string;
  amount: number;
  donor_name: string | null;
  status: string;
  payment_method: string;
  created_at: string;
}

interface Stats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBeneficiaries: number;
  totalVolunteers: number;
  activeVolunteers: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalDonations: number;
  monthlyDonations: number;
  totalViews: number;
}

interface ImpactStats {
  employmentRate: number;
  averageIncomeIncrease: number;
  businessesCreated: number;
  trainingsCompleted: number;
  totalBeneficiaries: number;
}

// ========================================
// COMPOSANT PRINCIPAL
// ========================================

export default function ReportsPage() {
  const { token, user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState<'activity' | 'financial' | 'impact' | 'beneficiaries' | 'volunteers' | 'jobs' | 'donations'>('activity');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBeneficiaries: 0,
    totalVolunteers: 0,
    activeVolunteers: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalDonations: 0,
    monthlyDonations: 0,
    totalViews: 0
  });
  
  const [impactStats, setImpactStats] = useState<ImpactStats>({
    employmentRate: 0,
    averageIncomeIncrease: 0,
    businessesCreated: 0,
    trainingsCompleted: 0,
    totalBeneficiaries: 0
  });

  const hasAccess = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff';

  // ========================================
  // CHARGEMENT DES DONNÉES DEPUIS L'API
  // ========================================

  const fetchProjects = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement projets:', error);
    }
  }, [token]);

  const fetchBeneficiaries = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/beneficiaries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBeneficiaries(data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement bénéficiaires:', error);
    }
  }, [token]);

  const fetchVolunteers = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/volunteers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setVolunteers(data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement bénévoles:', error);
    }
  }, [token]);

  const fetchJobs = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/jobs/offers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement offres:', error);
    }
  }, [token]);

  const fetchDonations = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/donations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDonations(data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement dons:', error);
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
    
    Promise.all([
      fetchProjects(),
      fetchBeneficiaries(),
      fetchVolunteers(),
      fetchJobs(),
      fetchDonations()
    ]).finally(() => setLoading(false));
  }, [isAuthenticated, hasAccess, fetchProjects, fetchBeneficiaries, fetchVolunteers, fetchJobs, fetchDonations]);

  // ========================================
  // CALCUL DES STATISTIQUES
  // ========================================

  useEffect(() => {
    // Statistiques projets
    const activeProjects = projects.filter(p => p.status === 'active');
    const completedProjects = projects.filter(p => p.status === 'completed');
    
    // Statistiques bénévoles
    const activeVolunteers = volunteers.filter(v => v.status === 'active');
    
    // Statistiques offres d'emploi
    const activeJobs = jobs.filter(j => j.status === 'published' || j.status === 'open');
    const totalApplications = jobs.reduce((sum, j) => sum + (j.applications_count || 0), 0);
    
    // Statistiques dons
    const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const now = new Date();
    const monthlyDonations = donations
      .filter(d => {
        const dDate = new Date(d.created_at);
        return dDate.getMonth() === now.getMonth() && dDate.getFullYear() === now.getFullYear() && d.status === 'completed';
      })
      .reduce((sum, d) => sum + (d.amount || 0), 0);
    
    // Impact social
    const employedBeneficiaries = beneficiaries.filter(b => 
      b.employment_status === 'Employé' || b.employment_status === 'Entrepreneur' || 
      b.employment_status === 'employe' || b.employment_status === 'entrepreneur'
    ).length;
    const employmentRate = beneficiaries.length > 0 ? (employedBeneficiaries / beneficiaries.length) * 100 : 0;
    
    const businessesCreated = beneficiaries.filter(b => 
      b.employment_status === 'Entrepreneur' || b.employment_status === 'entrepreneur'
    ).length;
    
    const trainingsCompleted = beneficiaries.filter(b => 
      b.employment_status?.includes('Formation') || b.education_level?.includes('Formation')
    ).length;
    
    // Calcul de l'augmentation moyenne des revenus
    const incomeIncreases = beneficiaries
      .filter(b => b.before_income && b.after_income && b.after_income > 0)
      .map(b => (b.after_income || 0) - (b.before_income || 0));
    
    const averageIncomeIncrease = incomeIncreases.length > 0
      ? incomeIncreases.reduce((a, b) => a + b, 0) / incomeIncreases.length
      : 0;
    
    setStats({
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      totalBeneficiaries: beneficiaries.length,
      totalVolunteers: volunteers.length,
      activeVolunteers: activeVolunteers.length,
      totalJobs: jobs.length,
      activeJobs: activeJobs.length,
      totalApplications: totalApplications,
      totalDonations: totalDonations,
      monthlyDonations: monthlyDonations,
      totalViews: jobs.reduce((sum, j) => sum + (j.views_count || 0), 0)
    });
    
    setImpactStats({
      employmentRate,
      averageIncomeIncrease,
      businessesCreated,
      trainingsCompleted,
      totalBeneficiaries: beneficiaries.length
    });
    
  }, [projects, beneficiaries, volunteers, jobs, donations]);

  // ========================================
  // FILTRES PAR DATE
  // ========================================

  const getDateRangeFilter = (range: string): { start: Date; end: Date } => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setFullYear(2000);
        break;
    }
    
    return { start: startDate, end: endDate };
  };

  // ========================================
  // GÉNÉRATION RAPPORT
  // ========================================

  const generatePDFReport = async (): Promise<void> => {
    setGenerating(true);
    
    try {
      const { start, end } = getDateRangeFilter(dateRange);
      
      const reportData = {
        type: reportType,
        title: `${getReportTitle()} - ${new Date().toLocaleDateString('fr-FR')}`,
        period: dateRange,
        period_start: start.toISOString(),
        period_end: end.toISOString(),
        data: {
          projects: projects.slice(0, 20),
          beneficiaries: beneficiaries.slice(0, 20),
          volunteers: volunteers.slice(0, 20),
          jobs: jobs.slice(0, 20),
          donations: donations.slice(0, 20)
        },
        stats: stats,
        impact: impactStats
      };
      
      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reportData)
      });
      
      if (response.ok) {
        toast.success(`Rapport ${getReportTitle()} enregistré avec succès`);
        // Simuler un téléchargement PDF (à intégrer avec une vraie librairie PDF si besoin)
toast.success('Rapport enregistré avec succès. Fonctionnalité PDF à venir.');
      } else {
        toast.error('Erreur lors de la génération du rapport');
      }
      
    } catch (error) {
      console.error('Erreur génération rapport:', error);
      toast.error('Erreur de connexion');
    } finally {
      setGenerating(false);
    }
  };

  // ========================================
  // EXPORT CSV
  // ========================================

  const exportToCSV = (): void => {
    let csvData: any[] = [];
    let filename = '';
    
    switch (reportType) {
      case 'activity':
        csvData = projects.map(p => ({
          'Projet': p.title,
          'Statut': p.status === 'active' ? 'Actif' : p.status === 'completed' ? 'Terminé' : 'Planifié',
          'Bénéficiaires': p.beneficiaries_count || 0,
          'Région': p.region || 'N/A',
          'Progression': `${p.progress || 0}%`,
          'Date création': new Date(p.created_at).toLocaleDateString('fr-FR')
        }));
        filename = `rapport_activite_${new Date().toISOString().split('T')[0]}.csv`;
        break;
        
      case 'beneficiaries':
        csvData = beneficiaries.map(b => ({
          'Nom': `${b.first_name} ${b.last_name}`,
          'Email': b.email,
          'Âge': b.age || 'N/A',
          'Région': b.region || 'N/A',
          'Situation': b.employment_status || 'N/A',
          'Date inscription': new Date(b.created_at).toLocaleDateString('fr-FR')
        }));
        filename = `rapport_beneficiaires_${new Date().toISOString().split('T')[0]}.csv`;
        break;
        
      case 'volunteers':
        csvData = volunteers.map(v => ({
          'Nom': `${v.first_name} ${v.last_name}`,
          'Email': v.email,
          'Compétences': v.skills?.join(', ') || '',
          'Statut': v.status === 'active' ? 'Actif' : 'Inactif',
          'Heures': v.hours || 0,
          'Date inscription': new Date(v.created_at).toLocaleDateString('fr-FR')
        }));
        filename = `rapport_benevoles_${new Date().toISOString().split('T')[0]}.csv`;
        break;
        
      case 'jobs':
        csvData = jobs.map(j => ({
          'Titre': j.title,
          'Lieu': j.location,
          'Statut': j.status === 'published' ? 'Publié' : 'Fermé',
          'Candidatures': j.applications_count || 0,
          'Vues': j.views_count || 0,
          'Date création': new Date(j.created_at).toLocaleDateString('fr-FR')
        }));
        filename = `rapport_offres_${new Date().toISOString().split('T')[0]}.csv`;
        break;
        
      case 'donations':
        csvData = donations.filter(d => d.status === 'completed').map(d => ({
          'Donateur': d.donor_name || 'Anonyme',
          'Montant': `${d.amount.toLocaleString()} Ar`,
          'Méthode': d.payment_method === 'mvola' ? 'MVola' : d.payment_method === 'orange_money' ? 'Orange Money' : d.payment_method === 'airtel' ? 'Airtel' : 'Autre',
          'Date': new Date(d.created_at).toLocaleDateString('fr-FR')
        }));
        filename = `rapport_dons_${new Date().toISOString().split('T')[0]}.csv`;
        break;
        
      case 'impact':
        csvData = beneficiaries
          .filter(b => b.before_income && b.after_income)
          .map(b => ({
            'Nom': `${b.first_name} ${b.last_name}`,
            'Revenu avant': `${(b.before_income || 0).toLocaleString()} Ar`,
            'Revenu après': `${(b.after_income || 0).toLocaleString()} Ar`,
            'Progression': `${((b.after_income || 0) - (b.before_income || 0)).toLocaleString()} Ar`,
            'Taux progression': `${((((b.after_income || 0) - (b.before_income || 0)) / (b.before_income || 1)) * 100).toFixed(0)}%`
          }));
        filename = `rapport_impact_${new Date().toISOString().split('T')[0]}.csv`;
        break;
        
      default:
        return;
    }
    
    if (csvData.length > 0) {
      const headers = Object.keys(csvData[0]);
      const csvRows = [
        headers.join(';'),
        ...csvData.map(row => headers.map(h => {
          const value = row[h];
          return typeof value === 'string' && (value.includes(';') || value.includes(',')) ? `"${value}"` : value;
        }).join(';'))
      ];
      
      const blob = new Blob(["\uFEFF" + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success(`Export CSV ${getReportTitle()} réussi`);
    } else {
      toast.error('Aucune donnée à exporter');
    }
  };

  const printReport = (): void => {
    window.print();
  };

  const getReportTitle = (): string => {
    const titles = {
      activity: 'Rapport d\'Activité',
      financial: 'Rapport Financier',
      impact: 'Rapport d\'Impact Social',
      beneficiaries: 'Rapport Bénéficiaires',
      volunteers: 'Rapport Bénévoles',
      jobs: 'Rapport Offres d\'Emploi',
      donations: 'Rapport Dons'
    };
    return titles[reportType];
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString() + ' Ar';
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
        <p className="text-gray-500 font-medium">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête Y-Mad - Bleu */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Rapports et statistiques</h1>
              <p className="text-blue-100 text-sm mt-0.5">
                Analysez l'impact de vos actions et générez des rapports
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={printReport}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exporter CSV</span>
            </button>
            <button
              onClick={generatePDFReport}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {generating ? 'Génération...' : 'PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Sélecteur de rapport - Gris */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de rapport</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
            >
              <option value="activity">Rapport d'activité</option>
              <option value="financial">Rapport financier</option>
              <option value="impact">Rapport d'impact social</option>
              <option value="beneficiaries">Rapport bénéficiaires</option>
              <option value="volunteers">Rapport bénévoles</option>
              <option value="jobs">Rapport offres d'emploi</option>
              <option value="donations">Rapport dons</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois-ci</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
              <option value="all">Toutes les données</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg w-full border border-gray-200">
              <span className="font-semibold text-gray-700">{getReportTitle()}</span> - {dateRange === 'week' ? '7 derniers jours' : dateRange === 'month' ? '30 derniers jours' : dateRange === 'year' ? '12 derniers mois' : 'Toutes les données'}
            </div>
          </div>
        </div>
      </div>

      {/* Cartes statistiques - Bleu et Gris */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm">Projets</p>
              <p className="text-2xl font-bold">{stats.totalProjects}</p>
              <p className="text-xs text-blue-200 mt-1">{stats.activeProjects} actifs</p>
            </div>
            <Briefcase className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl shadow-lg p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-100 text-xs sm:text-sm">Bénéficiaires</p>
              <p className="text-2xl font-bold">{stats.totalBeneficiaries}</p>
              <p className="text-xs text-emerald-200 mt-1">Jeunes aidés</p>
            </div>
            <Users className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-xs sm:text-sm">Offres d'emploi</p>
              <p className="text-2xl font-bold">{stats.totalJobs}</p>
              <p className="text-xs text-purple-200 mt-1">{stats.activeJobs} actives</p>
            </div>
            <Briefcase className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-rose-600 to-rose-700 rounded-xl shadow-lg p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-rose-100 text-xs sm:text-sm">Dons collectés</p>
              <p className="text-lg font-bold">{formatCurrency(stats.totalDonations)}</p>
              <p className="text-xs text-rose-200 mt-1">+{formatCurrency(stats.monthlyDonations)}/mois</p>
            </div>
            <Heart className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Indicateurs clés - Gris */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Indicateurs clés
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Projets actifs</span>
                <span className="font-semibold text-gray-800">{stats.activeProjects} / {stats.totalProjects}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 rounded-full h-2 transition-all"
                  style={{ width: `${stats.totalProjects > 0 ? (stats.activeProjects / stats.totalProjects) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Bénévoles actifs</span>
                <span className="font-semibold text-gray-800">{stats.activeVolunteers} / {stats.totalVolunteers}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-600 rounded-full h-2 transition-all"
                  style={{ width: `${stats.totalVolunteers > 0 ? (stats.activeVolunteers / stats.totalVolunteers) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Taux d'emploi bénéficiaires</span>
                <span className="font-semibold text-gray-800">{impactStats.employmentRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-600 rounded-full h-2 transition-all"
                  style={{ width: `${impactStats.employmentRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Impact social
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-gray-700">Taux d'emploi</span>
              </div>
              <span className="font-semibold text-emerald-700">{impactStats.employmentRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700">Augmentation revenu</span>
              </div>
              <span className="font-semibold text-blue-700">+{formatCurrency(impactStats.averageIncomeIncrease)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-700">Entreprises créées</span>
              </div>
              <span className="font-semibold text-purple-700">{impactStats.businessesCreated}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-700">Formations complétées</span>
              </div>
              <span className="font-semibold text-orange-700">{impactStats.trainingsCompleted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé du rapport */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Aperçu du rapport - {getReportTitle()}
          </h3>
        </div>
        <div className="p-6">
          {reportType === 'activity' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-700">{stats.totalProjects}</p>
                <p className="text-sm text-gray-600">Projets</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-emerald-700">{stats.totalBeneficiaries}</p>
                <p className="text-sm text-gray-600">Bénéficiaires</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-700">{stats.totalVolunteers}</p>
                <p className="text-sm text-gray-600">Bénévoles</p>
              </div>
            </div>
          )}
          
          {reportType === 'financial' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-xl font-bold text-blue-700">{formatCurrency(stats.totalDonations)}</p>
                <p className="text-sm text-gray-600">Total collecté</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg text-center">
                <p className="text-xl font-bold text-emerald-700">{formatCurrency(stats.monthlyDonations)}</p>
                <p className="text-sm text-gray-600">Dons mensuels</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <p className="text-xl font-bold text-purple-700">{donations.length}</p>
                <p className="text-sm text-gray-600">Nombre de dons</p>
              </div>
            </div>
          )}
          
          {reportType === 'impact' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-emerald-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-emerald-700">{impactStats.employmentRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Taux d'emploi</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-xl font-bold text-blue-700">+{formatCurrency(impactStats.averageIncomeIncrease)}</p>
                <p className="text-sm text-gray-600">Augmentation revenu</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-700">{impactStats.businessesCreated}</p>
                <p className="text-sm text-gray-600">Entreprises créées</p>
              </div>
            </div>
          )}
          
          {reportType === 'beneficiaries' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-700">{stats.totalBeneficiaries}</p>
                <p className="text-sm text-gray-600">Bénéficiaires inscrits</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-emerald-700">{impactStats.trainingsCompleted}</p>
                <p className="text-sm text-gray-600">Formations complétées</p>
              </div>
            </div>
          )}
          
          {reportType === 'volunteers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-700">{stats.totalVolunteers}</p>
                <p className="text-sm text-gray-600">Bénévoles inscrits</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-emerald-700">{stats.activeVolunteers}</p>
                <p className="text-sm text-gray-600">Bénévoles actifs</p>
              </div>
            </div>
          )}
          
          {reportType === 'jobs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-700">{stats.totalJobs}</p>
                <p className="text-sm text-gray-600">Offres publiées</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-emerald-700">{stats.totalApplications}</p>
                <p className="text-sm text-gray-600">Candidatures reçues</p>
              </div>
            </div>
          )}
          
          {reportType === 'donations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-xl font-bold text-blue-700">{formatCurrency(stats.totalDonations)}</p>
                <p className="text-sm text-gray-600">Total collecté</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg text-center">
                <p className="text-xl font-bold text-emerald-700">{formatCurrency(stats.monthlyDonations)}</p>
                <p className="text-sm text-gray-600">Dons ce mois</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bouton d'action - Bleu */}
      <div className="flex justify-center pb-6">
        <button
          onClick={generatePDFReport}
          disabled={generating}
          className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Génération du rapport en cours...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Générer le rapport complet ({getReportTitle()})
            </>
          )}
        </button>
      </div>
    </div>
  );
}