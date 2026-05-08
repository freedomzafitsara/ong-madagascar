'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { backgroundService, Background, backgroundPages } from '@/services/backgroundService';
import { 
  Image as ImageIcon, Plus, Edit, Trash2, Eye, RefreshCw, Loader2,
  CheckCircle, XCircle as XCircleIcon, AlertCircle, Upload, Link as LinkIcon
} from 'lucide-react';
import NextImage from 'next/image';

export default function BackgroundsPage() {
  const { token, hasRole } = useAuth();
  const { language } = useLanguage();
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Background | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    page: 'home',
    image_url: '',
    thumbnail_url: '',
    mobile_url: '',
    is_active: true,
    alt_text: '',
    overlay_opacity: 0,
    position: 'center',
    size: 'cover',
  });

  useEffect(() => {
    fetchBackgrounds();
  }, []);

  const fetchBackgrounds = async () => {
    setLoading(true);
    try {
      const data = await backgroundService.getAll(token!);
      setBackgrounds(data);
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur de chargement' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await backgroundService.update(token!, editing.id, formData);
        setMessage({ type: 'success', text: 'Fond d\'écran mis à jour' });
      } else {
        await backgroundService.create(token!, formData);
        setMessage({ type: 'success', text: 'Fond d\'écran créé' });
      }
      setShowModal(false);
      setEditing(null);
      setFormData({
        page: 'home',
        image_url: '',
        thumbnail_url: '',
        mobile_url: '',
        is_active: true,
        alt_text: '',
        overlay_opacity: 0,
        position: 'center',
        size: 'cover',
      });
      fetchBackgrounds();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce fond d\'écran ?')) return;
    try {
      await backgroundService.delete(token!, id);
      setMessage({ type: 'success', text: 'Fond d\'écran supprimé' });
      fetchBackgrounds();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
  };

  const handleEdit = (background: Background) => {
    setEditing(background);
    setFormData({
      page: background.page,
      image_url: background.image_url,
      thumbnail_url: background.thumbnail_url || '',
      mobile_url: background.mobile_url || '',
      is_active: background.is_active,
      alt_text: background.alt_text || '',
      overlay_opacity: background.overlay_opacity || 0,
      position: background.position || 'center',
      size: background.size || 'cover',
    });
    setShowModal(true);
  };

  const getPageLabel = (page: string) => {
    const found = backgroundPages.find(p => p.value === page);
    return found ? (language === 'fr' ? found.label : found.label_mg) : page;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Fonds d'écran</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">Gérez les images de fond pour chaque page</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Liste des fonds d'écran */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {backgrounds.map((bg) => (
          <div key={bg.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="relative h-40 bg-gray-100">
              {bg.image_url ? (
                <img src={bg.image_url} alt={bg.alt_text || bg.page} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                </div>
              )}
              {bg.is_active && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">Actif</div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800">{getPageLabel(bg.page)}</h3>
              <p className="text-xs text-gray-500 mt-1 truncate">{bg.image_url}</p>
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => handleEdit(bg)} className="p-1 text-gray-500 hover:text-blue-600">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(bg.id)} className="p-1 text-gray-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'ajout/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-800">
                {editing ? 'Modifier le fond d\'écran' : 'Ajouter un fond d\'écran'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page *</label>
                <select
                  required
                  value={formData.page}
                  onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {backgroundPages.map(page => (
                    <option key={page.value} value={page.value}>
                      {language === 'fr' ? page.label : page.label_mg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image *</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://..."
                  />
                  {formData.image_url && (
                    <div className="w-12 h-12 bg-gray-100 rounded border overflow-hidden">
                      <img src={formData.image_url} alt="Aperçu" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL miniature (optionnel)</label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL mobile (optionnel)</label>
                <input
                  type="url"
                  value={formData.mobile_url}
                  onChange={(e) => setFormData({ ...formData, mobile_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texte alternatif</label>
                <input
                  type="text"
                  value={formData.alt_text}
                  onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Description de l'image"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opacité overlay (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.overlay_opacity}
                    onChange={(e) => setFormData({ ...formData, overlay_opacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="center">Centre</option>
                    <option value="top">Haut</option>
                    <option value="bottom">Bas</option>
                    <option value="left">Gauche</option>
                    <option value="right">Droite</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Actif (afficher sur le site)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editing ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}