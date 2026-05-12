'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { backgroundService, BackgroundSettings } from '@/services/backgroundService';
import ImageUploader from '@/components/admin/ImageUploader';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle, Palette } from 'lucide-react';

// Liste des pages disponibles avec toutes les pages du site
const pagesList = [
  { value: 'home', label: 'Accueil', label_mg: 'Fandraisana' },
  { value: 'about', label: 'A propos', label_mg: 'Momba anay' },
  { value: 'projects', label: 'Projets', label_mg: 'Tetikasa' },
  { value: 'events', label: 'Evenements', label_mg: 'Hetsika' },
  { value: 'jobs', label: 'Emploi', label_mg: 'Asa' },
  { value: 'blog', label: 'Blog', label_mg: 'Bitsika' },
  { value: 'contact', label: 'Contact', label_mg: 'Fifandraisana' },
  { value: 'join', label: 'Adhesion', label_mg: 'Fandraisana mpikambana' },
  { value: 'donate', label: 'Faire un don', label_mg: 'Manome fanomezana' },
  { value: 'login', label: 'Connexion', label_mg: 'Hiditra' },
  { value: 'register', label: 'Inscription', label_mg: 'Hisoratra anarana' },
  { value: 'dashboard', label: 'Tableau de bord', label_mg: 'Dashboard' }
];

export default function BackgroundsManagementPage() {
  const { token, hasRole } = useAuth();
  const { language } = useLanguage();
  const [backgrounds, setBackgrounds] = useState<Record<string, BackgroundSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Verification des droits d'acces
  if (!hasRole('super_admin') && !hasRole('admin')) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Acces non autorise</h1>
          <p className="text-gray-500 mt-2">Vous n avez pas les droits pour acceder a cette page.</p>
          <Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 text-blue-600">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  // Chargement de tous les fonds d'ecran
  useEffect(() => {
    fetchAllBackgrounds();
  }, []);

  const fetchAllBackgrounds = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const loadedBackgrounds: Record<string, BackgroundSettings> = {};
      
      // Charger chaque page une par une
      for (const page of pagesList) {
        const bg = await backgroundService.getBackground(page.value);
        if (bg) {
          loadedBackgrounds[page.value] = bg;
        } else {
          // Valeurs par defaut si aucun fond d'ecran n'existe
          loadedBackgrounds[page.value] = {
            page: page.value,
            image_url: '',
            is_active: false,
            overlay_opacity: 30,
            position: 'center',
            size: 'cover',
            alt_text: ''
          };
        }
      }
      
      setBackgrounds(loadedBackgrounds);
    } catch (error) {
      console.error('Erreur de chargement:', error);
      setMessage({ type: 'error', text: 'Erreur de chargement des fonds d ecran' });
    } finally {
      setLoading(false);
    }
  };

  // Mise a jour d'un fond d'ecran
  const updateBackground = async (page: string, data: Partial<BackgroundSettings>) => {
    setSaving(prev => ({ ...prev, [page]: true }));
    setMessage(null);

    try {
      await backgroundService.updateBackground(page, token!, data);
      
      setBackgrounds(prev => ({
        ...prev,
        [page]: { ...prev[page], ...data }
      }));
      
      setMessage({ 
        type: 'success', 
        text: `Fond d ecran de la page ${page} mis a jour` 
      });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Erreur de mise a jour:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la mise a jour' });
    } finally {
      setSaving(prev => ({ ...prev, [page]: false }));
    }
  };

  // Gestion de l'upload d'image
  const handleImageUpload = (page: string, url: string) => {
    updateBackground(page, { image_url: url, is_active: true });
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
      {/* En-tete */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Gestion des fonds d ecran</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Personnalisez l image de fond de chaque page du site
          </p>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
      </div>

      {/* Message de statut */}
      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Grille des pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pagesList.map((page) => {
          const bg = backgrounds[page.value];
          const pageLabel = language === 'fr' ? page.label : page.label_mg;
          const isSaving = saving[page.value];

          if (!bg) return null;

          return (
            <div key={page.value} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* En-tete de la carte */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-800">{pageLabel}</h2>
                <p className="text-xs text-gray-500">Page: /{page.value}</p>
              </div>

              {/* Contenu de la carte */}
              <div className="p-4 space-y-4">
                
                {/* Zone d'upload d'image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image de fond
                  </label>
                  <ImageUploader
                    onUploadComplete={(url) => handleImageUpload(page.value, url)}
                    currentImageUrl={bg?.image_url}
                    pageKey={page.value}
                    label=""
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Format recommande: 1920x1080px (16:9). JPG, PNG ou WEBP, max 10 Mo.
                  </p>
                </div>

                {/* Apercu du rendu */}
                {bg.image_url && (
                  <div className="bg-gray-100 rounded-lg p-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apercu du rendu
                    </label>
                    <div className="relative h-32 rounded-lg overflow-hidden">
                      <img src={bg.image_url} alt="Apercu" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black" style={{ opacity: (bg.overlay_opacity || 0) / 100 }} />
                    </div>
                  </div>
                )}

                {/* Reglages avances (si une image est presente) */}
                {bg.image_url && (
                  <>
                    {/* Opacite */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Assombrissement du fond
                        </label>
                        <span className="text-sm text-gray-500">{bg.overlay_opacity || 0}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={bg.overlay_opacity || 0}
                        onChange={(e) => updateBackground(page.value, { overlay_opacity: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Plus le pourcentage est eleve, plus le texte est lisible
                      </p>
                    </div>

                    {/* Position et taille */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Position
                        </label>
                        <select
                          value={bg.position || 'center'}
                          onChange={(e) => updateBackground(page.value, { position: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="center">Centre</option>
                          <option value="top">Haut</option>
                          <option value="bottom">Bas</option>
                          <option value="left">Gauche</option>
                          <option value="right">Droite</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Taille
                        </label>
                        <select
                          value={bg.size || 'cover'}
                          onChange={(e) => updateBackground(page.value, { size: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="cover">Couvrir (cover)</option>
                          <option value="contain">Contenir (contain)</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>
                    </div>

                    {/* Texte alternatif */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Texte alternatif (SEO)
                      </label>
                      <input
                        type="text"
                        value={bg.alt_text || ''}
                        onChange={(e) => updateBackground(page.value, { alt_text: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Description de l image pour les moteurs de recherche"
                      />
                    </div>

                    {/* Activation */}
                    <label className="flex items-center gap-2 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        checked={bg.is_active || false}
                        onChange={(e) => updateBackground(page.value, { is_active: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Activer le fond d ecran sur cette page
                      </span>
                    </label>

                    {/* Indicateur de sauvegarde */}
                    {isSaving && (
                      <div className="flex items-center gap-2 text-sm text-blue-600 pt-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enregistrement en cours...
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}