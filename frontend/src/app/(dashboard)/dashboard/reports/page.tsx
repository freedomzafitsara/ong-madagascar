// src/app/(dashboard)/dashboard/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, Download, Calendar, TrendingUp, Users, 
  Briefcase, Heart, MapPin, DollarSign,
  BarChart3, PieChart, Activity, Printer, Mail,
  CheckCircle, AlertCircle, Loader2, Eye, Award
} from 'lucide-react';
import Link from 'next/link';
import { PDFService } from '@/services/pdfService';

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
  beneficiaries: number;
  region: string;
  createdAt: string;
}

interface Beneficiary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  region: string;
  age: number;
  employmentStatus: string;
  educationLevel?: string;
  beforeIncome?: number;
  afterIncome?: number;
  beforeYmad?: string;
  afterYmad?: string;
  createdAt: string;
}

interface Volunteer {
  id: string;
  fullName: string;
  email: string;
  skills: string;
  status: string;
  hoursVolunteered: number;
  registeredAt: string;
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  status: string;
  applicationsCount: number;
  views: number;
  createdAt: string;
}

interface Application {
  id: string;
  fullName: string;
  email: string;
  status: string;
  jobTitle: string;
  appliedAt: string;
}

interface Donation {
  id: string;
  amount: number;
  donorName: string;
  status: string;
  method: string;
  createdAt: string;
}

interface BlogPost {
  id: string;
  title: string;
  viewsCount: number;
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  registrations: number;
  status: string;
}

interface ReportData {
  projects: Project[];
  beneficiaries: Beneficiary[];
  volunteers: Volunteer[];
  jobs: Job[];
  applications: Application[];
  donations: Donation[];
  blogPosts: BlogPost[];
  events: Event[];
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
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState<'activity' | 'financial' | 'impact' | 'beneficiaries' | 'volunteers' | 'jobs' | 'donations'>('activity');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month');
  const [data, setData] = useState<ReportData>({
    projects: [],
    beneficiaries: [],
    volunteers: [],
    jobs: [],
    applications: [],
    donations: [],
    blogPosts: [],
    events: []
  });
  const [impactStats, setImpactStats] = useState<ImpactStats>({
    employmentRate: 0,
    averageIncomeIncrease: 0,
    businessesCreated: 0,
    trainingsCompleted: 0,
    totalBeneficiaries: 0
  });

  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBeneficiaries: 0,
    totalVolunteers: 0,
    activeVolunteers: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    totalDonations: 0,
    monthlyDonations: 0,
    totalViews: 0,
    eventsCount: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  // ========================================
  // CHARGEMENT DES DONNÉES - CORRIGÉ
  // ========================================
  const loadData = (): void => {
    setLoading(true);
    try {
      // Charger les données depuis localStorage
      const projects: Project[] = JSON.parse(localStorage.getItem('ymad_projects') || '[]');
      const beneficiaries: Beneficiary[] = JSON.parse(localStorage.getItem('ymad_beneficiaries') || '[]');
      const volunteers: Volunteer[] = JSON.parse(localStorage.getItem('ymad_volunteers') || '[]');
      const jobs: Job[] = JSON.parse(localStorage.getItem('ymad_jobs') || '[]');
      const applications: Application[] = JSON.parse(localStorage.getItem('ymad_applications') || '[]');
      const donations: Donation[] = JSON.parse(localStorage.getItem('ymad_donations') || '[]');
      const blogPosts: BlogPost[] = JSON.parse(localStorage.getItem('ymad_blog_posts') || '[]');
      const events: Event[] = JSON.parse(localStorage.getItem('ymad_events') || '[]');
      
      // ========================================
      // CALCUL DES STATISTIQUES D'IMPACT - CORRIGÉ
      // ========================================
      
      // 1. Taux d'emploi
      const employedBeneficiaries = beneficiaries.filter(b => 
        b.employmentStatus === 'Employé' || b.employmentStatus === 'Entrepreneur'
      ).length;
      const employmentRate = beneficiaries.length > 0 ? (employedBeneficiaries / beneficiaries.length) * 100 : 0;
      
      // 2. Augmentation moyenne des revenus
      const incomeIncreases = beneficiaries
        .filter(b => b.beforeIncome && b.afterIncome && b.afterIncome > 0)
        .map(b => (b.afterIncome || 0) - (b.beforeIncome || 0));
      
      const averageIncomeIncrease = incomeIncreases.length > 0
        ? incomeIncreases.reduce((a, b) => a + b, 0) / incomeIncreases.length
        : 0;
      
      // 3. Entreprises créées
      const businessesCreated = beneficiaries.filter(b => b.employmentStatus === 'Entrepreneur').length;
      
      // 4. Formations complétées - ✅ CORRIGÉ
      const trainingsCompleted = beneficiaries.filter(b => 
        b.employmentStatus === 'Formation' || 
        b.educationLevel === 'Formation pro' ||
        b.educationLevel === 'Formation professionnelle'
      ).length;
      
      // ========================================
      // CALCUL DES STATISTIQUES GÉNÉRALES
      // ========================================
      const activeProjects = projects.filter(p => p.status === 'active');
      const completedProjects = projects.filter(p => p.status === 'completed');
      const activeVolunteers = volunteers.filter(v => v.status === 'active');
      const activeJobs = jobs.filter(j => j.status === 'open' || j.status === 'published');
      const pendingApps = applications.filter(a => a.status === 'pending' || a.status === 'submitted');
      const acceptedApps = applications.filter(a => a.status === 'accepted');
      const rejectedApps = applications.filter(a => a.status === 'rejected');
      const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
      
      // Dons du mois
      const now = new Date();
      const monthlyDonations = donations
        .filter(d => {
          const dDate = new Date(d.createdAt);
          return dDate.getMonth() === now.getMonth() && dDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, d) => sum + (d.amount || 0), 0);
      
      const totalViews = blogPosts.reduce((sum, post) => sum + (post.viewsCount || 0), 0);
      
      // Mise à jour des states
      setData({
        projects,
        beneficiaries,
        volunteers,
        jobs,
        applications,
        donations,
        blogPosts,
        events
      });
      
      setImpactStats({
        employmentRate,
        averageIncomeIncrease,
        businessesCreated,
        trainingsCompleted,
        totalBeneficiaries: beneficiaries.length
      });
      
      setStats({
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        totalBeneficiaries: beneficiaries.length,
        totalVolunteers: volunteers.length,
        activeVolunteers: activeVolunteers.length,
        totalJobs: jobs.length,
        activeJobs: activeJobs.length,
        totalApplications: applications.length,
        pendingApplications: pendingApps.length,
        acceptedApplications: acceptedApps.length,
        rejectedApplications: rejectedApps.length,
        totalDonations,
        monthlyDonations,
        totalViews,
        eventsCount: events.length
      });
      
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // AUTRES FONCTIONS
  // ========================================
  
  const getDateRangeFilter = (range: string): { start: Date; end: Date } => {
    const now = new Date();
    const start = new Date();
    
    switch (range) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return { start: new Date(0), end: now };
    }
    
    return { start, end: now };
  };

  const generatePDFReport = async (): Promise<void> => {
    setGenerating(true);
    
    try {
      const { start, end } = getDateRangeFilter(dateRange);
      
      if (reportType === 'activity') {
        const activities = [
          ...data.projects.map(p => ({
            title: p.title,
            date: p.createdAt,
            participants: p.beneficiaries || 0,
            status: p.status === 'active' ? 'En cours' : p.status === 'completed' ? 'Terminé' : 'Planifié'
          })),
          ...data.events.map(e => ({
            title: e.title,
            date: e.date,
            participants: e.registrations || 0,
            status: new Date(e.date) > new Date() ? 'À venir' : 'Terminé'
          }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);
        
        const blob = await PDFService.generateActivityReport({
          period: { start, end },
          stats: {
            membersCount: stats.totalBeneficiaries,
            eventsCount: stats.eventsCount,
            projectsCount: stats.totalProjects,
            beneficiariesCount: stats.totalBeneficiaries,
            volunteersCount: stats.totalVolunteers
          },
          activities
        });
        
        downloadBlob(blob, `rapport_activite_${formatDate()}.pdf`);
        alert('✅ Rapport d\'activité généré avec succès');
        
      } else if (reportType === 'financial') {
        const revenues = [
          { source: 'Dons individuels', amount: stats.totalDonations * 0.6 },
          { source: 'Partenariats', amount: stats.totalDonations * 0.3 },
          { source: 'Événements', amount: stats.totalDonations * 0.1 }
        ];
        
        const expenses = [
          { category: 'Projets terrain', amount: stats.totalDonations * 0.5 },
          { category: 'Administration', amount: stats.totalDonations * 0.2 },
          { category: 'Communication', amount: stats.totalDonations * 0.15 },
          { category: 'Formation', amount: stats.totalDonations * 0.15 }
        ];
        
        const blob = await PDFService.generateFinancialReport({
          period: { start, end },
          revenues,
          expenses,
          totalRevenue: stats.totalDonations,
          totalExpense: stats.totalDonations * 0.85,
          balance: stats.totalDonations * 0.15
        });
        
        downloadBlob(blob, `rapport_financier_${formatDate()}.pdf`);
        alert('✅ Rapport financier généré avec succès');
        
      } else if (reportType === 'impact') {
        const blob = await PDFService.generateImpactReport({
          period: { start, end },
          beneficiaries: data.beneficiaries,
          impact: {
            employmentRate: impactStats.employmentRate,
            averageIncomeIncrease: impactStats.averageIncomeIncrease,
            businessesCreated: impactStats.businessesCreated,
            trainingsCompleted: impactStats.trainingsCompleted
          }
        });
        
        downloadBlob(blob, `rapport_impact_${formatDate()}.pdf`);
        alert('✅ Rapport d\'impact généré avec succès');
      }
      
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('❌ Erreur lors de la génération du PDF');
    } finally {
      setGenerating(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  const exportToCSV = (): void => {
    let csvData: any[] = [];
    let filename = '';
    
    switch (reportType) {
      case 'activity':
        csvData = data.projects.map(p => ({
          'Projet': p.title,
          'Statut': p.status === 'active' ? 'Actif' : p.status === 'completed' ? 'Terminé' : 'Planifié',
          'Bénéficiaires': p.beneficiaries || 0,
          'Région': p.region || 'N/A',
          'Date création': new Date(p.createdAt).toLocaleDateString('fr-FR')
        }));
        filename = `rapport_activite_${formatDate()}.csv`;
        break;
        
      case 'beneficiaries':
        csvData = data.beneficiaries.map(b => ({
          'Nom': `${b.firstName} ${b.lastName}`,
          'Email': b.email,
          'Âge': b.age || 'N/A',
          'Région': b.region || 'N/A',
          'Situation': b.employmentStatus || 'N/A',
          'Revenu avant': b.beforeIncome?.toLocaleString() || '0',
          'Revenu après': b.afterIncome?.toLocaleString() || '0',
          'Date inscription': new Date(b.createdAt).toLocaleDateString('fr-FR')
        }));
        filename = `rapport_beneficiaires_${formatDate()}.csv`;
        break;
        
      case 'volunteers':
        csvData = data.volunteers.map(v => ({
          'Nom': v.fullName,
          'Email': v.email,
          'Compétences': v.skills,
          'Statut': v.status === 'active' ? 'Actif' : 'Inactif',
          'Heures': v.hoursVolunteered || 0,
          'Date inscription': new Date(v.registeredAt).toLocaleDateString('fr-FR')
        }));
        filename = `rapport_benevoles_${formatDate()}.csv`;
        break;
        
      case 'jobs':
        csvData = data.jobs.map(j => ({
          'Titre': j.title,
          'Département': j.department,
          'Lieu': j.location,
          'Statut': j.status === 'open' ? 'Ouvert' : j.status === 'published' ? 'Publié' : 'Fermé',
          'Candidatures': j.applicationsCount || 0,
          'Vues': j.views || 0,
          'Date création': new Date(j.createdAt).toLocaleDateString('fr-FR')
        }));
        filename = `rapport_offres_${formatDate()}.csv`;
        break;
        
      case 'donations':
        csvData = data.donations.map(d => ({
          'Donateur': d.donorName || 'Anonyme',
          'Montant': `${d.amount.toLocaleString()} Ar`,
          'Méthode': d.method === 'mvola' ? 'MVola' : d.method === 'orange_money' ? 'Orange Money' : 'Virement',
          'Statut': d.status === 'completed' ? 'Complété' : 'En attente',
          'Date': new Date(d.createdAt).toLocaleDateString('fr-FR')
        }));
        filename = `rapport_dons_${formatDate()}.csv`;
        break;
        
      case 'impact':
        csvData = data.beneficiaries
          .filter(b => b.beforeIncome && b.afterIncome)
          .map(b => ({
            'Nom': `${b.firstName} ${b.lastName}`,
            'Revenu avant': `${(b.beforeIncome || 0).toLocaleString()} Ar`,
            'Revenu après': `${(b.afterIncome || 0).toLocaleString()} Ar`,
            'Progression': `${((b.afterIncome || 0) - (b.beforeIncome || 0)).toLocaleString()} Ar`,
            'Taux progression': `${((((b.afterIncome || 0) - (b.beforeIncome || 0)) / (b.beforeIncome || 1)) * 100).toFixed(0)}%`
          }));
        filename = `rapport_impact_${formatDate()}.csv`;
        break;
    }
    
    if (csvData.length > 0) {
      const headers = Object.keys(csvData[0]);
      const csvRows = [
        headers.join(';'),
        ...csvData.map(row => headers.map(h => {
          const value = row[h];
          return typeof value === 'string' && (value.includes(';') || value.includes(',')) 
            ? `"${value}"` 
            : value;
        }).join(';'))
      ];
      
      const blob = new Blob(["\uFEFF" + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      alert(`✅ Export CSV ${reportType} réussi`);
    } else {
      alert('❌ Aucune donnée à exporter');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Rapports et statistiques</h1>
          <p className="text-gray-500 mt-1">Analysez l'impact de vos actions</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={printReport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimer</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter CSV</span>
          </button>
          <button
            onClick={generatePDFReport}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
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

      {/* Sélecteur de rapport */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de rapport</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="activity">📊 Rapport d'activité</option>
              <option value="financial">💰 Rapport financier</option>
              <option value="impact">🌍 Rapport d'impact social</option>
              <option value="beneficiaries">👥 Rapport bénéficiaires</option>
              <option value="volunteers">🤝 Rapport bénévoles</option>
              <option value="jobs">💼 Rapport offres d'emploi</option>
              <option value="donations">💝 Rapport dons</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">📅 Cette semaine</option>
              <option value="month">📅 Ce mois-ci</option>
              <option value="quarter">📅 Ce trimestre</option>
              <option value="year">📅 Cette année</option>
              <option value="all">📅 Toutes les données</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg w-full">
              <span className="font-semibold">{getReportTitle()}</span> - {dateRange === 'week' ? '7 derniers jours' : dateRange === 'month' ? '30 derniers jours' : dateRange === 'year' ? '12 derniers mois' : 'Toutes les données'}
            </div>
          </div>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm">Projets</p>
              <p className="text-2xl font-bold">{stats.totalProjects}</p>
              <p className="text-xs text-blue-200 mt-1">{stats.activeProjects} actifs</p>
            </div>
            <Briefcase className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-xs sm:text-sm">Bénéficiaires</p>
              <p className="text-2xl font-bold">{stats.totalBeneficiaries}</p>
              <p className="text-xs text-green-200 mt-1">Jeunes aidés</p>
            </div>
            <Users className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-xs sm:text-sm">Offres d'emploi</p>
              <p className="text-2xl font-bold">{stats.totalJobs}</p>
              <p className="text-xs text-purple-200 mt-1">{stats.activeJobs} actives</p>
            </div>
            <Briefcase className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-rose-100 text-xs sm:text-sm">Dons collectés</p>
              <p className="text-lg font-bold">{stats.totalDonations.toLocaleString()} Ar</p>
              <p className="text-xs text-rose-200 mt-1">+{stats.monthlyDonations.toLocaleString()} Ar/mois</p>
            </div>
            <Heart className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Indicateurs clés
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Projets actifs</span>
                <span className="font-semibold">{stats.activeProjects} / {stats.totalProjects}</span>
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
                <span className="font-semibold">{stats.activeVolunteers} / {stats.totalVolunteers}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 rounded-full h-2 transition-all"
                  style={{ width: `${stats.totalVolunteers > 0 ? (stats.activeVolunteers / stats.totalVolunteers) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Candidatures traitées</span>
                <span className="font-semibold">{stats.totalApplications - stats.pendingApplications} / {stats.totalApplications}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 rounded-full h-2 transition-all"
                  style={{ width: `${stats.totalApplications > 0 ? ((stats.totalApplications - stats.pendingApplications) / stats.totalApplications) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Taux d'emploi bénéficiaires</span>
                <span className="font-semibold">{impactStats.employmentRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 rounded-full h-2 transition-all"
                  style={{ width: `${impactStats.employmentRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Impact social
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Taux d'emploi</span>
              </div>
              <span className="font-semibold text-green-700">{impactStats.employmentRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700">Augmentation revenu</span>
              </div>
              <span className="font-semibold text-blue-700">+{impactStats.averageIncomeIncrease.toLocaleString()} Ar</span>
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
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Aperçu du rapport - {getReportTitle()}
          </h3>
        </div>
        <div className="p-6">
          {reportType === 'activity' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-gray-600">📊 <strong>{stats.totalProjects}</strong> projets au total</p>
                <p className="text-gray-600">✅ <strong>{stats.activeProjects}</strong> projets actifs</p>
                <p className="text-gray-600">🎯 <strong>{stats.completedProjects}</strong> projets terminés</p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600">👥 <strong>{stats.totalBeneficiaries}</strong> bénéficiaires touchés</p>
                <p className="text-gray-600">🤝 <strong>{stats.totalVolunteers}</strong> bénévoles engagés</p>
                <p className="text-gray-600">👁️ <strong>{stats.totalViews.toLocaleString()}</strong> vues totales</p>
              </div>
            </div>
          )}
          
          {reportType === 'financial' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-gray-600">💰 Total collecté: <strong>{stats.totalDonations.toLocaleString()} Ar</strong></p>
                <p className="text-gray-600">📊 Dons mensuels: <strong>{stats.monthlyDonations.toLocaleString()} Ar</strong></p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600">💝 Nombre de dons: <strong>{data.donations.length}</strong></p>
                <p className="text-gray-600">📈 Progression: <strong>+{stats.monthlyDonations > 0 ? ((stats.monthlyDonations / (stats.totalDonations / 12)) * 100).toFixed(0) : 0}%</strong></p>
              </div>
            </div>
          )}
          
          {reportType === 'impact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-gray-600">📈 Taux d'emploi: <strong>{impactStats.employmentRate.toFixed(1)}%</strong></p>
                <p className="text-gray-600">💰 Augmentation revenu: <strong>+{impactStats.averageIncomeIncrease.toLocaleString()} Ar</strong></p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600">🚀 Entreprises créées: <strong>{impactStats.businessesCreated}</strong></p>
                <p className="text-gray-600">🎓 Formations: <strong>{impactStats.trainingsCompleted}</strong></p>
              </div>
            </div>
          )}
          
          {reportType === 'beneficiaries' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-gray-600">👥 <strong>{stats.totalBeneficiaries}</strong> bénéficiaires inscrits</p>
                <p className="text-gray-600">📅 Dernier ajout: {data.beneficiaries[data.beneficiaries.length - 1]?.createdAt ? new Date(data.beneficiaries[data.beneficiaries.length - 1].createdAt).toLocaleDateString('fr-FR') : 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600">✅ <strong>{stats.acceptedApplications}</strong> en emploi</p>
                <p className="text-gray-600">📚 <strong>{impactStats.trainingsCompleted}</strong> en formation</p>
              </div>
            </div>
          )}
          
          {reportType === 'volunteers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-gray-600">🤝 <strong>{stats.totalVolunteers}</strong> bénévoles inscrits</p>
                <p className="text-gray-600">✅ <strong>{stats.activeVolunteers}</strong> actifs</p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600">⏱️ Heures totales: <strong>{data.volunteers.reduce((sum, v) => sum + (v.hoursVolunteered || 0), 0)}h</strong></p>
              </div>
            </div>
          )}
          
          {reportType === 'jobs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-gray-600">💼 <strong>{stats.totalJobs}</strong> offres publiées</p>
                <p className="text-gray-600">✅ <strong>{stats.activeJobs}</strong> offres actives</p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600">📝 <strong>{stats.totalApplications}</strong> candidatures reçues</p>
                <p className="text-gray-600">⏳ <strong>{stats.pendingApplications}</strong> en attente</p>
              </div>
            </div>
          )}
          
          {reportType === 'donations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-gray-600">💰 Total collecté: <strong>{stats.totalDonations.toLocaleString()} Ar</strong></p>
                <p className="text-gray-600">📊 Nombre de dons: <strong>{data.donations.length}</strong></p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600">💝 Don moyen: <strong>{data.donations.length > 0 ? (stats.totalDonations / data.donations.length).toLocaleString() : 0} Ar</strong></p>
                <p className="text-gray-600">📈 Dons mensuels: <strong>{stats.monthlyDonations.toLocaleString()} Ar</strong></p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bouton d'action */}
      <div className="flex justify-center">
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