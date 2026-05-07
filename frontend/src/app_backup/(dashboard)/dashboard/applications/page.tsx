// src/app/dashboard/applications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Eye, Search, X, CheckCircle, AlertCircle, FileText, 
  User, Mail, Phone, MapPin, Calendar, Download, 
  ChevronLeft, ChevronRight, Briefcase, Filter
} from 'lucide-react';
import Link from 'next/link';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  experience: string;
  motivation: string;
  cvUrl: string;
  photoUrl?: string;
  diplomaUrl?: string;
  attestationUrl?: string;
  disponibility?: string;
  salaryExpectation?: string;
  status: 'submitted' | 'reviewing' | 'shortlisted' | 'interview' | 'accepted' | 'rejected';
  appliedAt: string;
  notes?: string;
}

interface Job {
  id: string;
  title: string;
}

const statusOptions = [
  { value: 'submitted', label: '📥 Soumise', color: 'bg-gray-100 text-gray-700' },
  { value: 'reviewing', label: '🔍 En révision', color: 'bg-blue-100 text-blue-700' },
  { value: 'shortlisted', label: '⭐ Présélectionnée', color: 'bg-purple-100 text-purple-700' },
  { value: 'interview', label: '🎯 Entretien', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'accepted', label: '✅ Acceptée', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: '❌ Refusée', color: 'bg-red-100 text-red-700' }
];

export default function ApplicationsManagement() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJob, setFilterJob] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    try {
      const apps = JSON.parse(localStorage.getItem('ymad_applications') || '[]');
      const jobsList = JSON.parse(localStorage.getItem('ymad_jobs') || '[]').map((j: any) => ({ id: j.id, title: j.title }));
      setApplications(apps);
      setFilteredApps(apps);
      setJobs(jobsList);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (id: string, newStatus: Application['status']) => {
    const updated = applications.map(app => app.id === id ? { ...app, status: newStatus } : app);
    localStorage.setItem('ymad_applications', JSON.stringify(updated));
    setApplications(updated);
    setFilteredApps(updated);
    if (selectedApp?.id === id) setSelectedApp({ ...selectedApp, status: newStatus });
  };

  useEffect(() => {
    let filtered = [...applications];
    if (searchTerm) filtered = filtered.filter(a => a.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || a.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterJob) filtered = filtered.filter(a => a.jobId === filterJob);
    if (filterStatus) filtered = filtered.filter(a => a.status === filterStatus);
    setFilteredApps(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterJob, filterStatus, applications]);

  // Pagination
  const paginatedApps = filteredApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);

  const stats = {
    total: applications.length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  const getStatusBadge = (status: string) => {
    const s = statusOptions.find(opt => opt.value === status) || statusOptions[0];
    return <span className={`px-2 py-0.5 text-xs rounded-full ${s.color}`}>{s.label}</span>;
  };

  if (loading) return <div className="flex justify-center h-64"><div className="w-10 h-10 border-4 border-ymad-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><div><h1 className="text-2xl font-bold text-ymad-gray-800">📋 Gestion des candidatures</h1><p className="text-ymad-gray-500">Consultez et gérez toutes les candidatures reçues</p></div></div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center"><FileText className="w-6 h-6 text-ymad-blue-600 mx-auto mb-2" /><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-ymad-gray-500">Total</p></div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center"><div className="w-6 h-6 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center"><span className="text-gray-600 text-xs">📥</span></div><p className="text-2xl font-bold">{stats.submitted}</p><p className="text-xs text-ymad-gray-500">Soumises</p></div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center"><div className="w-6 h-6 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center"><span className="text-blue-600 text-xs">🔍</span></div><p className="text-2xl font-bold">{stats.reviewing}</p><p className="text-xs text-ymad-gray-500">En révision</p></div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center"><div className="w-6 h-6 bg-green-100 rounded-full mx-auto mb-2 flex items-center justify-center"><span className="text-green-600 text-xs">✅</span></div><p className="text-2xl font-bold">{stats.accepted}</p><p className="text-xs text-ymad-gray-500">Acceptées</p></div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center"><div className="w-6 h-6 bg-red-100 rounded-full mx-auto mb-2 flex items-center justify-center"><span className="text-red-600 text-xs">❌</span></div><p className="text-2xl font-bold">{stats.rejected}</p><p className="text-xs text-ymad-gray-500">Refusées</p></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ymad-gray-400 w-5 h-5" /><input type="text" placeholder="Rechercher par nom ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div><select value={filterJob} onChange={(e) => setFilterJob(e.target.value)} className="px-4 py-2 border rounded-lg"><option value="">📋 Toutes les offres</option>{jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}</select><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-lg"><option value="">📊 Tous les statuts</option>{statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ymad-gray-50 border-b">
              <tr>
                <th className="p-4 text-left">Candidat</th>
                <th className="p-4 text-left">Poste</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Statut</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedApps.map(app => (
                <tr key={app.id} className="border-b hover:bg-ymad-gray-50">
                  <td className="p-4">
                    <p className="font-medium">{app.firstName} {app.lastName}</p>
                    <p className="text-sm text-ymad-gray-500">{app.email}</p>
                  </td>
                  <td className="p-4">{app.jobTitle}</td>
                  <td className="p-4">{new Date(app.appliedAt).toLocaleDateString('fr-FR')}</td>
                  <td className="p-4">{getStatusBadge(app.status)}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedApp(app); setShowDetail(true); }} className="p-1 text-ymad-blue-600 hover:bg-ymad-blue-50 rounded">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
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

      {/* Modal Détail */}
      {showDetail && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowDetail(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Candidature de {selectedApp.firstName} {selectedApp.lastName}</h2>
              <button onClick={() => setShowDetail(false)}><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">{getStatusBadge(selectedApp.status)}</div>
                  <h3 className="text-lg font-semibold">{selectedApp.jobTitle}</h3>
                  <p className="text-sm text-ymad-gray-500">Postulé le {new Date(selectedApp.appliedAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex gap-2">
                  <select value={selectedApp.status} onChange={(e) => updateStatus(selectedApp.id, e.target.value as Application['status'])} className="px-3 py-1 border rounded-lg text-sm">
                    {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-ymad-gray-50 rounded-lg">
                <div><p className="text-sm text-ymad-gray-500">Email</p><p className="font-medium">{selectedApp.email}</p></div>
                <div><p className="text-sm text-ymad-gray-500">Téléphone</p><p className="font-medium">{selectedApp.phone}</p></div>
                <div><p className="text-sm text-ymad-gray-500">Adresse</p><p className="font-medium">{selectedApp.address}</p></div>
                {selectedApp.disponibility && <div><p className="text-sm text-ymad-gray-500">Disponibilité</p><p className="font-medium">{selectedApp.disponibility}</p></div>}
                {selectedApp.salaryExpectation && <div><p className="text-sm text-ymad-gray-500">Prétention salariale</p><p className="font-medium">{selectedApp.salaryExpectation}</p></div>}
              </div>
              <div><h3 className="font-semibold mb-2">💼 Expérience professionnelle</h3><p className="text-ymad-gray-600">{selectedApp.experience || 'Non renseignée'}</p></div>
              <div><h3 className="font-semibold mb-2">📝 Lettre de motivation</h3><p className="text-ymad-gray-600">{selectedApp.motivation}</p></div>
              <div><h3 className="font-semibold mb-2">📎 Documents</h3><div className="space-y-2"><a href={selectedApp.cvUrl} target="_blank" className="flex items-center gap-2 text-ymad-blue-600 hover:underline"><FileText className="w-4 h-4" /> CV</a>{selectedApp.diplomaUrl && <a href={selectedApp.diplomaUrl} target="_blank" className="flex items-center gap-2 text-ymad-blue-600 hover:underline"><FileText className="w-4 h-4" /> Diplôme</a>}{selectedApp.attestationUrl && <a href={selectedApp.attestationUrl} target="_blank" className="flex items-center gap-2 text-ymad-blue-600 hover:underline"><FileText className="w-4 h-4" /> Attestation</a>}</div></div>
              <div className="flex gap-3 pt-4 border-t">
                <button onClick={() => updateStatus(selectedApp.id, 'accepted')} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700">✅ Accepter</button>
                <button onClick={() => updateStatus(selectedApp.id, 'rejected')} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700">❌ Refuser</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}