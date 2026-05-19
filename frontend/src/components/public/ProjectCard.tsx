'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import { Calendar, MapPin, Users, Target, ChevronRight, Heart, Image as ImageIcon } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  variant?: 'default' | 'compact' | 'featured';
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, variant = 'default' }) => {
  
  // Récupérer l'URL de l'image (imageUrl est la propriété correcte selon votre type)
  const imageUrl = project.imageUrl;

  // Formatage du statut (basé sur votre enum Project)
  const getStatusLabel = (status?: string) => {
    const statusMap: Record<string, { label: string; color: string; bg: string }> = {
      'planning': { label: 'Planification', color: 'text-yellow-700', bg: 'bg-yellow-100' },
      'active': { label: 'En cours', color: 'text-blue-700', bg: 'bg-blue-100' },
      'completed': { label: 'Terminé', color: 'text-green-700', bg: 'bg-green-100' },
      'suspended': { label: 'Suspendu', color: 'text-red-700', bg: 'bg-red-100' },
      'draft': { label: 'Brouillon', color: 'text-gray-500', bg: 'bg-gray-100' },
      'cancelled': { label: 'Annulé', color: 'text-red-700', bg: 'bg-red-100' },
    };
    return statusMap[status || 'active'] || statusMap.active;
  };

  // Formatage de la date
  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const statusInfo = getStatusLabel(project.status);
  const startDate = formatDate(project.startDate);
  const progress = project.progress || 0;

  // Version compacte
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group">
        <div className="flex">
          {imageUrl && (
            <div className="w-28 h-28 flex-shrink-0">
              <img 
                src={imageUrl} 
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 p-4">
            <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition mb-1">
              <Link href={`/projects/${project.id}`}>
                {project.title}
              </Link>
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              {project.region && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {project.region}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Version mise en avant (featured)
  if (variant === 'featured') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md border border-blue-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
        <div className="relative">
          {imageUrl && (
            <div className="relative h-56">
              <img 
                src={imageUrl} 
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color} shadow-sm`}>
              {statusInfo.label}
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            {startDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {startDate}
              </span>
            )}
            {project.region && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {project.region}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition">
            <Link href={`/projects/${project.id}`}>
              {project.title}
            </Link>
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
          {progress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progression</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          <Link 
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700 transition-all hover:gap-2"
          >
            Découvrir <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Version par défaut (default)
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group">
      {imageUrl && (
        <div className="relative overflow-hidden h-52">
          <img 
            src={imageUrl} 
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color} shadow-sm`}>
              {statusInfo.label}
            </span>
          </div>
        </div>
      )}
      
      {!imageUrl && (
        <div className="relative overflow-hidden h-52 bg-gradient-to-br from-blue-100 to-gray-100 flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-gray-400" />
          <div className="absolute top-3 right-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color} shadow-sm`}>
              {statusInfo.label}
            </span>
          </div>
        </div>
      )}
      
      <div className="p-5">
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
          {startDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {startDate}
            </span>
          )}
          {project.region && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {project.region}
            </span>
          )}
          {project.beneficiariesCount !== undefined && project.beneficiariesCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {project.beneficiariesCount}
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition">
          <Link href={`/projects/${project.id}`}>
            {project.title}
          </Link>
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {project.description}
        </p>
        
        {progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                Progression
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 rounded-full h-1.5 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            {project.isFeatured && (
              <span className="text-xs text-yellow-600 flex items-center gap-1">
                <Heart className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                À la une
              </span>
            )}
          </div>
          <Link 
            href={`/projects/${project.id}`}
            className="text-blue-600 text-sm font-medium hover:text-blue-700 inline-flex items-center gap-1 transition-all hover:gap-2"
          >
            En savoir plus
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;