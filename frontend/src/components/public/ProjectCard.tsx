'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      {project.image && (
        <img 
          src={project.image} 
          alt={project.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {project.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {project.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-green-600 font-medium">
            {project.status || 'En cours'}
          </span>
          <Link 
            href={`/projects/${project.id}`}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            En savoir plus →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;