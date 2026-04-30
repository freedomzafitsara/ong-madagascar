// src/services/imageStorage.ts
'use client';

export interface ProjectImage {
  id: string;
  url: string;
  name: string;
  isMain: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  mainImage: string;
  images: ProjectImage[];
  createdAt: string;
}

class ImageStorageService {
  
  // Récupérer tous les projets
  getProjects(): Project[] {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem('ymad_projects');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return parsed.map((p: any) => ({
          ...p,
          images: p.images || []
        }));
      } catch {
        return this.getDefaultProjects();
      }
    }
    return this.getDefaultProjects();
  }

  private getDefaultProjects(): Project[] {
    const defaultProjects: Project[] = [
      {
        id: '1',
        title: 'Éducation pour tous',
        description: 'Programme de soutien scolaire dans les zones rurales d\'Analamanga.',
        location: 'Analamanga',
        category: 'Éducation',
        mainImage: '',
        images: [],
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Reforestation Madagascar',
        description: 'Plantation d\'arbres pour lutter contre la déforestation.',
        location: 'Fianarantsoa',
        category: 'Environnement',
        mainImage: '',
        images: [],
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Accès à l\'eau potable',
        description: 'Construction de puits dans les villages isolés.',
        location: 'Toliara',
        category: 'Santé',
        mainImage: '',
        images: [],
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('ymad_projects', JSON.stringify(defaultProjects));
    return defaultProjects;
  }

  saveProjects(projects: Project[]): void {
    localStorage.setItem('ymad_projects', JSON.stringify(projects));
    // Déclencher un événement storage pour synchroniser toutes les pages
    window.dispatchEvent(new Event('storage'));
  }

  getProject(id: string): Project | null {
    const projects = this.getProjects();
    return projects.find(p => p.id === id) || null;
  }

  // CRÉER UN PROJET
  createProject(data: Omit<Project, 'id' | 'mainImage' | 'images' | 'createdAt'>): Project {
    const projects = this.getProjects();
    const newProject: Project = {
      id: Date.now().toString(),
      ...data,
      mainImage: '',
      images: [],
      createdAt: new Date().toISOString()
    };
    projects.push(newProject);
    this.saveProjects(projects);
    return newProject;
  }

  // MODIFIER UN PROJET
  updateProject(projectId: string, data: Partial<Project>): void {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...data };
      this.saveProjects(projects);
    }
  }

  // SUPPRIMER UN PROJET
  deleteProject(projectId: string): void {
    const projects = this.getProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    this.saveProjects(filtered);
  }

  // AJOUTER UNE IMAGE
  addProjectImage(projectId: string, file: File): Promise<ProjectImage> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const projects = this.getProjects();
        const projectIndex = projects.findIndex(p => p.id === projectId);
        
        if (projectIndex === -1) {
          reject(new Error('Projet non trouvé'));
          return;
        }
        
        const newImage: ProjectImage = {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          url: url,
          name: file.name,
          isMain: projects[projectIndex].images.length === 0,
          createdAt: new Date().toISOString()
        };
        
        projects[projectIndex].images.push(newImage);
        
        if (newImage.isMain) {
          projects[projectIndex].mainImage = newImage.url;
        }
        
        this.saveProjects(projects);
        resolve(newImage);
      };
      reader.onerror = () => reject(new Error('Erreur lecture fichier'));
      reader.readAsDataURL(file);
    });
  }

  // RÉCUPÉRER LES IMAGES
  getProjectImages(projectId: string): ProjectImage[] {
    const projects = this.getProjects();
    const project = projects.find(p => p.id === projectId);
    return project?.images || [];
  }

  // RÉCUPÉRER L'IMAGE PRINCIPALE
  getProjectMainImage(projectId: string): string {
    const projects = this.getProjects();
    const project = projects.find(p => p.id === projectId);
    
    if (project && project.mainImage) {
      return project.mainImage;
    }
    
    if (project && project.images.length > 0) {
      return project.images[0].url;
    }
    
    return '';
  }

  // DÉFINIR L'IMAGE PRINCIPALE
  setMainImage(projectId: string, imageId: string): void {
    const projects = this.getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex !== -1) {
      projects[projectIndex].images.forEach(img => {
        img.isMain = img.id === imageId;
        if (img.isMain) {
          projects[projectIndex].mainImage = img.url;
        }
      });
      this.saveProjects(projects);
    }
  }

  // SUPPRIMER UNE IMAGE
  deleteImage(projectId: string, imageId: string): void {
    const projects = this.getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex !== -1) {
      const wasMain = projects[projectIndex].images.find(img => img.id === imageId)?.isMain;
      projects[projectIndex].images = projects[projectIndex].images.filter(img => img.id !== imageId);
      
      if (wasMain && projects[projectIndex].images.length > 0) {
        projects[projectIndex].images[0].isMain = true;
        projects[projectIndex].mainImage = projects[projectIndex].images[0].url;
      } else if (projects[projectIndex].images.length === 0) {
        projects[projectIndex].mainImage = '';
      }
      
      this.saveProjects(projects);
    }
  }
}

export const imageStorage = new ImageStorageService();