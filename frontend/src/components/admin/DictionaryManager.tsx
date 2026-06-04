// components/admin/DictionaryManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Search, Database, RefreshCw } from 'lucide-react';
import { autoSpellcheck } from '@/services/autoSpellcheck.service';
import toast from 'react-hot-toast';

export function DictionaryManager() {
  const [newWord, setNewWord] = useState('');
  const [stats, setStats] = useState({ total: 0, custom: 0, corrections: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const statsData = autoSpellcheck.getStats();
    setStats(statsData);
  };

  const handleAddWord = () => {
    if (newWord.trim().length < 2) {
      toast.error('Le mot doit contenir au moins 2 caractères');
      return;
    }
    
    autoSpellcheck.addCustomWord(newWord);
    toast.success(`"${newWord}" ajouté au dictionnaire`);
    setNewWord('');
    loadStats();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Gestion du dictionnaire</h2>
          <p className="text-sm text-gray-500">Ajoutez des mots personnalisés au dictionnaire</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <Database className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-500">Mots dans le dictionnaire</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <Plus className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.custom}</p>
          <p className="text-xs text-gray-500">Mots personnalisés</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <RefreshCw className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.corrections}</p>
          <p className="text-xs text-gray-500">Corrections apprises</p>
        </div>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="Ajouter un nouveau mot..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
        />
        <button
          onClick={handleAddWord}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-4">
         Les mots ajoutés seront automatiquement reconnus comme corrects dans l'éditeur.
      </p>
    </div>
  );
}