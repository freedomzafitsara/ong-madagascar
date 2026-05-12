'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  title_mg: string;
  description: string;
  description_mg: string;
  imageUrl: string;
  icon: string;
  order: number;
  isActive: boolean;
}

interface PageContentEditorProps {
  sections: Section[];
  onChange: (sections: Section[]) => void;
}

export default function PageContentEditor({ sections, onChange }: PageContentEditorProps) {
  const { language } = useLanguage();

  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: '',
      title_mg: '',
      description: '',
      description_mg: '',
      imageUrl: '',
      icon: '',
      order: sections.length + 1,
      isActive: true,
    };
    onChange([...sections, newSection]);
  };

  const updateSection = (index: number, field: keyof Section, value: string | boolean | number) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    onChange(newSections);
  };

  const removeSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    onChange(newSections.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;
    
    const newSections = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    onChange(newSections.map((s, i) => ({ ...s, order: i + 1 })));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Sections de la page</h3>
        <button
          type="button"
          onClick={addSection}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus className="w-4 h-4" /> Ajouter une section
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">Aucune section. Cliquez sur "Ajouter une section".</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={section.id} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                  <span className="text-sm text-gray-500">Section {index + 1}</span>
                  {section.isActive ? (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Active</span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">Inactive</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => moveSection(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveSection(index, 'down')}
                    disabled={index === sections.length - 1}
                    className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => updateSection(index, 'isActive', !section.isActive)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    {section.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => removeSection(index)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre (français)</label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre (malagasy)</label>
                  <input
                    type="text"
                    value={section.title_mg}
                    onChange={(e) => updateSection(index, 'title_mg', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (français)</label>
                  <textarea
                    rows={3}
                    value={section.description}
                    onChange={(e) => updateSection(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (malagasy)</label>
                  <textarea
                    rows={3}
                    value={section.description_mg}
                    onChange={(e) => updateSection(index, 'description_mg', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image</label>
                  <input
                    type="url"
                    value={section.imageUrl}
                    onChange={(e) => updateSection(index, 'imageUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icône</label>
                  <input
                    type="text"
                    value={section.icon}
                    onChange={(e) => updateSection(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="heart, users, calendar..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}