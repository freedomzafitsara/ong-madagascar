// src/app/(dashboard)/dashboard/volunteers/assignments/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Edit, Trash2, CheckCircle, X, Loader2, Calendar, Briefcase, Clock } from 'lucide-react';
import volunteerService from '@/services/volunteerService';
import { VolunteerAssignment } from '@/types/volunteer';

export default function AssignmentsPage() {
  const searchParams = useSearchParams();
  const volunteerId = searchParams.get('volunteerId');
  
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([]);
  const [volunteerName, setVolunteerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<VolunteerAssignment | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    volunteerId: volunteerId || '',
    projectId: '',
    projectName: '',
    role: '',
    tasks: [] as string[],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active' as 'active' | 'completed' | 'cancelled'
  });

  useEffect(() => {
    loadData();
    loadProjects();
  }, [volunteerId]);

  const loadData = async () => {
    setLoading(true);
    const data = await volunteerService.getAssignments(volunteerId || undefined);
    setAssignments(data);
    
    if (volunteerId) {
      const volunteer = await volunteerService.getById(volunteerId);
      setVolunteerName(volunteer ? `${volunteer.firstName} ${volunteer.lastName}` : '');
    }
    setLoading(false);
  };

  const loadProjects = async () => {
    const stored = localStorage.getItem('ymad_projects');
    setProjects(stored ? JSON.parse(stored) : []);
  };

  const handleSubmit = async () => {
    if (!formData.projectId || !formData.role) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const project = projects.find(p => p.id === formData.projectId);
    
    if (editing) {
      await volunteerService.updateAssignment(editing.id, formData);
      alert('Mission modifiée avec succès');
    } else {
      await volunteerService.createAssignment({
        ...formData,
        projectName: project?.title || '',
        volunteerId: volunteerId || formData.volunteerId
      });
      alert('Mission ajoutée avec succès');
    }
    
    setShowForm(false);
    setEditing(null);
    loadData();
  };

  const handleComplete = async (id: string) => {
    await volunteerService.updateAssignment(id, { status: 'completed', endDate: new Date().toISOString().split('T')[0] });
    loadData();
  };

  const getStatusBadge = (status: string) => {
    const colors = { active: 'bg-green-100 text-green-700', completed: 'bg-gray-100 text-gray-700', cancelled: 'bg-red-100 text-red-700' };
    return <span className={`text-xs px-2 py-1 rounded-full ${colors[status as keyof typeof colors]}`}>{status === 'active' ? 'En cours' : status === 'completed' ? 'Terminée' : 'Annulée'}</span>;
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Missions des bénévoles</h1>
          {volunteerName && <p className="text-gray-500">Bénévole: {volunteerName}</p>}
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-5 h-5" /> Nouvelle mission
        </button>
      </div>

      <div className="grid gap-4">
        {assignments.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400">
            <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aucune mission assignée</p>
          </div>
        ) : (
          assignments.map(a => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{a.projectName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{a.role}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {a.tasks.map((task, i) => (
                      <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{task}</span>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Début: {new Date(a.startDate).toLocaleDateString('fr-FR')}</span>
                    {a.endDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Fin: {new Date(a.endDate).toLocaleDateString('fr-FR')}</span>}
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(a.status)}
                  {a.status === 'active' && (
                    <button onClick={() => handleComplete(a.id)} className="block mt-2 text-green-600 text-sm hover:underline">Marquer terminée</button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex justify-between">
              <h3 className="text-lg font-bold">Nouvelle mission</h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Projet</label>
                <select value={formData.projectId} onChange={(e) => setFormData({...formData, projectId: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                  <option value="">Sélectionner</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rôle / Poste</label>
                <input type="text" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="Ex: Coordinateur terrain" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tâches (séparées par des virgules)</label>
                <input type="text" value={formData.tasks.join(', ')} onChange={(e) => setFormData({...formData, tasks: e.target.value.split(',').map(s => s.trim())})} className="w-full border rounded-lg px-3 py-2" placeholder="Ex: Organisation, Logistique, Formation" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium mb-1">Date début</label><input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Date fin</label><input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Créer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}