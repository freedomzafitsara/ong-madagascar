'use client'

"use client";

import { useState, useEffect } from 'react';
import { projectService } from '@/services/adminService';
import toast from 'react-hot-toast';

export function ProjectManagement() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data.data || []);
    } catch (error) {
      toast.error('Erreur chargement projets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce projet ?')) {
      try {
        await projectService.delete(id);
        toast.success('Projet supprimé');
        fetchProjects();
      } catch (error) {
        toast.error('Erreur suppression');
      }
    }
  };

  if (isLoading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-marine-900">Gestion des projets</h2>
        <button className="bg-gold-500 text-marine-900 px-4 py-2 rounded-lg hover:bg-gold-400 transition">
          + Nouveau projet
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Titre</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Catégorie</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Statut</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{project.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{project.category}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {project.status === 'active' ? 'Actif' : 'Terminé'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">✏️</button>
                    <button onClick={() => handleDelete(project.id)} className="text-red-600 hover:text-red-800">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

