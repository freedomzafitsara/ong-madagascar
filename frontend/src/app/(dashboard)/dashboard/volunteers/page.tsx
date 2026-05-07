// src/app/dashboard/volunteers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, CheckCircle, AlertCircle, 
  Clock, MapPin, Mail, Phone, X, Heart, Users, Award
} from 'lucide-react';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  region: string;
  availability: string;
  hours: number;
  status: 'active' | 'inactive';
}

interface VolunteerFormData {
  name: string;
  email: string;
  phone: string;
  skills: string;
  region: string;
  availability: string;
  hours: number;
  status: 'active' | 'inactive';
}

const initialVolunteers: Volunteer[] = [
  { id: '1', name: 'Paul Rasoa', email: 'paul@example.com', phone: '034 00 000 01', skills: ['Informatique', 'Communication'], region: 'Analamanga', availability: 'Week-end', hours: 45, status: 'active' },
  { id: '2', name: 'Sarah Rajaona', email: 'sarah@example.com', phone: '034 00 000 02', skills: ['Médical', 'Formation'], region: 'Analamanga', availability: 'Semaine', hours: 32, status: 'active' },
  { id: '3', name: 'Michael Andry', email: 'michael@example.com', phone: '034 00 000 03', skills: ['Environnement'], region: 'Fianarantsoa', availability: 'Les deux', hours: 28, status: 'active' },
];

const regions = ['Analamanga', 'Fianarantsoa', 'Toamasina', 'Mahajanga', 'Toliara', 'Antsiranana', 'Antsirabe', 'Antananarivo'];

export default function DashboardVolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete'>('create');
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  
  const [formData, setFormData] = useState<VolunteerFormData>({
    name: '',
    email: '',
    phone: '',
    skills: '',
    region: '',
    availability: '',
    hours: 0,
    status: 'active'
  });
  
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVolunteers();
  }, []);

  const loadVolunteers = () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('ymad_volunteers');
      if (stored) {
        setVolunteers(JSON.parse(stored));
      } else {
        setVolunteers(initialVolunteers);
        localStorage.setItem('ymad_volunteers', JSON.stringify(initialVolunteers));
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      showMessage('Erreur lors du chargement des bénévoles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveVolunteers = (data: Volunteer[]) => {
    localStorage.setItem('ymad_volunteers', JSON.stringify(data));
    setVolunteers(data);
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const skillsStringToArray = (skillsStr: string): string[] => {
    return skillsStr.split(',').map(s => s.trim()).filter(s => s !== '');
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      showMessage('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    const skillsArray = skillsStringToArray(formData.skills);

    if (modalMode === 'create') {
      const newVolunteer: Volunteer = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        skills: skillsArray,
        region: formData.region,
        availability: formData.availability,
        hours: 0,
        status: 'active'
      };
      saveVolunteers([newVolunteer, ...volunteers]);
      showMessage('Bénévole ajouté avec succès', 'success');
    } else if (modalMode === 'edit' && selectedVolunteer) {
      const updatedVolunteer: Volunteer = {
        ...selectedVolunteer,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        skills: skillsArray,
        region: formData.region,
        availability: formData.availability,
        hours: formData.hours,
        status: formData.status
      };
      saveVolunteers(volunteers.map(v => v.id === selectedVolunteer.id ? updatedVolunteer : v));
      showMessage('Bénévole modifié avec succès', 'success');
    }
    
    setModalOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (selectedVolunteer) {
      saveVolunteers(volunteers.filter(v => v.id !== selectedVolunteer.id));
      showMessage('Bénévole supprimé avec succès', 'success');
      setModalOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      skills: '',
      region: '',
      availability: '',
      hours: 0,
      status: 'active'
    });
    setSelectedVolunteer(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode('create');
    setModalOpen(true);
  };

  const openEditModal = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setFormData({
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone,
      skills: volunteer.skills.join(', '),
      region: volunteer.region,
      availability: volunteer.availability,
      hours: volunteer.hours,
      status: volunteer.status
    });
    setModalMode('edit');
    setModalOpen(true);
  };

  const openDeleteModal = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setModalMode('delete');
    setModalOpen(true);
  };

  const filtered = volunteers.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalHours = volunteers.reduce((sum, v) => sum + v.hours, 0);
  const uniqueRegions = new Set(volunteers.map(v => v.region)).size;
  const activeCount = volunteers.filter(v => v.status === 'active').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des bénévoles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Messages */}
      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Heart className="w-7 h-7 text-blue-600" />
            Gestion des bénévoles
          </h1>
          <p className="text-gray-500 mt-1">Gérez les bénévoles et leurs heures de bénévolat</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={16} />
          Nouveau bénévole
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{volunteers.length}</p>
          <p className="text-gray-500 text-sm">Total bénévoles</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Heart className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{activeCount}</p>
          <p className="text-gray-500 text-sm">Bénévoles actifs</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalHours}</p>
          <p className="text-gray-500 text-sm">Heures totales</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{uniqueRegions}</p>
          <p className="text-gray-500 text-sm">Régions couvertes</p>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher par nom, email ou région..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Liste des bénévoles */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">Aucun bénévole trouvé</p>
          <button onClick={openCreateModal} className="text-blue-600 hover:underline">
            + Ajouter un bénévole
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Bénévole</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Contact</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Compétences</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Localisation</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Heures</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{v.name}</p>
                          <p className="text-xs text-gray-500">{v.availability}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm flex items-center gap-1"><Mail className="w-3 h-3" /> {v.email}</p>
                      {v.phone && <p className="text-sm flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {v.phone}</p>}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {v.skills.slice(0, 2).map(s => (
                          <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                        {v.skills.length > 2 && (
                          <span className="text-xs text-gray-400">+{v.skills.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm flex items-center gap-1"><MapPin className="w-3 h-3" /> {v.region}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-800">{v.hours}h</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(v)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(v)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer avec pagination simple */}
          <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {filtered.length} bénévole{filtered.length > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-gray-400">
              Total heures: {totalHours}h
            </p>
          </div>
        </div>
      )}

      {/* Modal Formulaire */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {modalMode === 'create' && '➕ Ajouter un bénévole'}
                {modalMode === 'edit' && '✏️ Modifier le bénévole'}
                {modalMode === 'delete' && '🗑️ Supprimer un bénévole'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {modalMode === 'delete' ? (
                <div>
                  <p className="text-gray-700">
                    Êtes-vous sûr de vouloir supprimer <strong>{selectedVolunteer?.name}</strong> ?
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Cette action est irréversible.</p>
                  <div className="flex gap-3 mt-6">
                    <button onClick={handleDelete} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                      Supprimer
                    </button>
                    <button onClick={() => setModalOpen(false)} className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                    <input
                      type="text"
                      placeholder="Ex: Jean Rakoto"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      placeholder="exemple@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      placeholder="034 00 000 00"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Compétences (séparées par virgules)</label>
                    <input
                      type="text"
                      placeholder="Ex: Informatique, Communication, Formation"
                      value={formData.skills}
                      onChange={(e) => setFormData({...formData, skills: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({...formData, region: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">Sélectionner une région</option>
                      {regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilité</label>
                    <input
                      type="text"
                      placeholder="Ex: Week-end, Lundi-Vendredi"
                      value={formData.availability}
                      onChange={(e) => setFormData({...formData, availability: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  {modalMode === 'edit' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Heures effectuées</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={formData.hours}
                        onChange={(e) => setFormData({...formData, hours: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleSave} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                      {modalMode === 'create' ? 'Ajouter' : 'Modifier'}
                    </button>
                    <button onClick={() => setModalOpen(false)} className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}