// src/services/imageStorageService.ts
// Service professionnel avec gestion d'état

export interface GalleryImage {
  id: string;
  dataUrl: string;
  fileName: string;
  fileSize: number;
  isMain: boolean;
  createdAt: string;
}

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  status: 'active' | 'completed' | 'draft';
  mainImage: string;
  gallery: GalleryImage[];
  createdAt: string;
}

class ImageStorage {
  
  // ==================== PROJETS ====================
  
  getAllProjects(): ProjectData[] {
    const stored = localStorage.getItem('ong_projects_v3');
    if (stored) {
      return JSON.parse(stored);
    }
    
    const initialProjects: ProjectData[] = [
      {
        id: 'proj_1',
        title: 'Éducation pour tous',
        description: 'Programme de soutien scolaire dans les zones rurales d\'Analamanga.',
        location: 'Analamanga',
        category: 'Éducation',
        status: 'active',
        mainImage: '',
        gallery: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'proj_2',
        title: 'Reforestation Madagascar',
        description: 'Plantation d\'arbres pour lutter contre la déforestation.',
        location: 'Fianarantsoa',
        category: 'Environnement',
        status: 'active',
        mainImage: '',
        gallery: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'proj_3',
        title: 'Accès à l\'eau potable',
        description: 'Construction de puits dans les villages isolés.',
        location: 'Toliara',
        category: 'Santé',
        status: 'active',
        mainImage: '',
        gallery: [],
        createdAt: new Date().toISOString()
      }
    ];
    
    localStorage.setItem('ong_projects_v3', JSON.stringify(initialProjects));
    return initialProjects;
  }
  
  saveProjects(projects: ProjectData[]): void {
    localStorage.setItem('ong_projects_v3', JSON.stringify(projects));
  }
  
  getProject(projectId: string): ProjectData | null {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === projectId) || null;
  }
  
  createProject(data: Omit<ProjectData, 'id' | 'createdAt' | 'mainImage' | 'gallery'>): ProjectData {
    const projects = this.getAllProjects();
    const newProject: ProjectData = {
      id: `proj_${Date.now()}`,
      title: data.title,
      description: data.description,
      location: data.location,
      category: data.category,
      status: data.status,
      mainImage: '',
      gallery: [],
      createdAt: new Date().toISOString()
    };
    projects.push(newProject);
    this.saveProjects(projects);
    return newProject;
  }
  
  updateProject(projectId: string, updates: Partial<ProjectData>): void {
    const projects = this.getAllProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates };
      this.saveProjects(projects);
    }
  }
  
  deleteProject(projectId: string): void {
    const projects = this.getAllProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    this.saveProjects(filtered);
  }
  
  // ==================== IMAGES ====================
  
  async addImageToProject(projectId: string, file: File): Promise<GalleryImage> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        const projects = this.getAllProjects();
        const projectIndex = projects.findIndex(p => p.id === projectId);
        
        if (projectIndex === -1) {
          reject(new Error('Projet non trouvé'));
          return;
        }
        
        const newImage: GalleryImage = {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          dataUrl: dataUrl,
          fileName: file.name,
          fileSize: file.size,
          isMain: projects[projectIndex].gallery.length === 0,
          createdAt: new Date().toISOString()
        };
        
        projects[projectIndex].gallery.push(newImage);
        
        if (newImage.isMain) {
          projects[projectIndex].mainImage = newImage.dataUrl;
        }
        
        this.saveProjects(projects);
        resolve(newImage);
      };
      
      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  getProjectGallery(projectId: string): GalleryImage[] {
    const project = this.getProject(projectId);
    return project?.gallery || [];
  }
  
  setMainImage(projectId: string, imageId: string): GalleryImage[] {
    const projects = this.getAllProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex !== -1) {
      projects[projectIndex].gallery.forEach(img => {
        img.isMain = img.id === imageId;
        if (img.isMain) {
          projects[projectIndex].mainImage = img.dataUrl;
        }
      });
      this.saveProjects(projects);
    }
    
    return this.getProjectGallery(projectId);
  }
  
  deleteImage(projectId: string, imageId: string): GalleryImage[] {
    const projects = this.getAllProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex !== -1) {
      const deletedImage = projects[projectIndex].gallery.find(img => img.id === imageId);
      projects[projectIndex].gallery = projects[projectIndex].gallery.filter(img => img.id !== imageId);
      
      if (deletedImage?.isMain && projects[projectIndex].gallery.length > 0) {
        projects[projectIndex].gallery[0].isMain = true;
        projects[projectIndex].mainImage = projects[projectIndex].gallery[0].dataUrl;
      } else if (projects[projectIndex].gallery.length === 0) {
        projects[projectIndex].mainImage = '';
      }
      
      this.saveProjects(projects);
    }
    
    return this.getProjectGallery(projectId);
  }
  
  // ==================== BANNIÈRE ====================
  
  setBanner(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        localStorage.setItem('ong_banner_v3', dataUrl);
        resolve(dataUrl);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  getBanner(): string | null {
    return localStorage.getItem('ong_banner_v3');
  }
}

export const imageStorage = new ImageStorage();
