'use client'

"use client";

import { useState, useEffect } from 'react';
import { blogService } from '@/services/adminService';
import toast from 'react-hot-toast';

export function BlogManagement() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const data = await blogService.getAll();
      setPosts(data.data || []);
    } catch (error) {
      toast.error('Erreur chargement articles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cet article ?')) {
      try {
        await blogService.delete(id);
        toast.success('Article supprimé');
        fetchPosts();
      } catch (error) {
        toast.error('Erreur');
      }
    }
  };

  if (isLoading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-marine-900">Gestion du blog</h2>
        <button className="bg-gold-500 text-marine-900 px-4 py-2 rounded-lg hover:bg-gold-400 transition">
          + Nouvel article
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
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{post.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{post.category}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {post.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">✏️</button>
                    <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-800">🗑️</button>
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

