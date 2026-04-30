// Service centralisé des données partagées
// TOUTES les modifications dans l'admin sont immédiatement visibles sur le site public

export interface SharedProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  status: 'active' | 'completed' | 'paused' | 'planned';
  progress: number;
  beneficiaries: number;
  budget: number;
  location: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  order: number;
  updatedAt: string;
}

// DONNÉES CENTRALISÉES - C'est la source unique de vérité
let sharedProjects: SharedProject[] = [
  {
    id: 'proj_001',
    title: 'Programme d\'Alphabétisation Fonctionnelle',
    slug: 'alphabetisation-fonctionnelle',
    description: 'Formation en lecture, écriture et calcul pour adultes en situation d\'illettrisme dans les zones rurales.',
    category: 'Éducation',
    status: 'active',
    progress: 68,
    beneficiaries: 452,
    budget: 32500000,
    location: 'Analamanga',
    coverImage: '/images/projects/placeholder.svg',
    startDate: '2024-01-15',
    endDate: '2024-12-20',
    order: 1,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj_002',
    title: 'Forages et Points d\'Eau - Grand Sud',
    slug: 'forages-grand-sud',
    description: 'Construction de forages et points d\'eau potable dans les communes isolées de la région d\'Androy.',
    category: 'Eau',
    status: 'active',
    progress: 42,
    beneficiaries: 1250,
    budget: 18750000,
    location: 'Androy',
    coverImage: '/images/projects/placeholder.svg',
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    order: 2,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj_003',
    title: 'Centre de Santé Maternelle et Infantile',
    slug: 'centre-sante-maternelle',
    description: 'Réhabilitation et équipement d\'un centre de santé pour la prise en charge des mères et enfants.',
    category: 'Santé',
    status: 'active',
    progress: 100,
    beneficiaries: 567,
    budget: 14200000,
    location: 'Haute Matsiatra',
    coverImage: '/images/projects/placeholder.svg',
    startDate: '2023-06-01',
    endDate: '2024-03-31',
    order: 3,
    updatedAt: new Date().toISOString()
  }
];

// Listeners pour la synchronisation en temps réel
type Listener = () => void;
let listeners: Listener[] = [];

// Notifier tous les listeners des changements
function notifyListeners() {
  console.log('📢 Notification des changements à', listeners.length, 'abonnés');
  listeners.forEach(listener => listener());
}

// Service de données partagées
export const sharedDataService = {
  // Récupérer tous les projets (triés par ordre)
  getProjects: () => {
    return [...sharedProjects].sort((a, b) => a.order - b.order);
  },

  // Récupérer un projet par ID
  getProjectById: (id: string) => {
    return sharedProjects.find(p => p.id === id);
  },

  // Récupérer un projet par slug
  getProjectBySlug: (slug: string) => {
    return sharedProjects.find(p => p.slug === slug);
  },

  // Ajouter un projet
  addProject: (project: Omit<SharedProject, 'id' | 'updatedAt'>) => {
    const newOrder = sharedProjects.length + 1;
    const newProject = {
      ...project,
      id: `proj_${Date.now()}`,
      order: newOrder,
      updatedAt: new Date().toISOString()
    };
    sharedProjects.push(newProject);
    notifyListeners();
    console.log('📦 Projet ajouté:', newProject.title);
    return newProject;
  },

  // MODIFIER un projet
  updateProject: (id: string, updates: Partial<SharedProject>) => {
    const index = sharedProjects.findIndex(p => p.id === id);
    if (index !== -1) {
      sharedProjects[index] = {
        ...sharedProjects[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      notifyListeners();
      console.log('🔄 Projet modifié:', sharedProjects[index].title);
      return sharedProjects[index];
    }
    throw new Error('Projet non trouvé');
  },

  // MODIFIER l'image d'un projet
  updateProjectImage: (id: string, imageUrl: string) => {
    console.log('🖼️ Mise à jour image:', id, imageUrl);
    return sharedDataService.updateProject(id, { coverImage: imageUrl });
  },

  // Supprimer un projet
  deleteProject: (id: string) => {
    const index = sharedProjects.findIndex(p => p.id === id);
    if (index !== -1) {
      const deleted = sharedProjects[index];
      sharedProjects.splice(index, 1);
      // Réorganiser les ordres
      sharedProjects.forEach((p, idx) => {
        p.order = idx + 1;
      });
      notifyListeners();
      console.log('🗑️ Projet supprimé:', deleted.title);
      return true;
    }
    return false;
  },

  // Monter un projet
  moveProjectUp: (projectId: string) => {
    const index = sharedProjects.findIndex(p => p.id === projectId);
    if (index > 0) {
      // Échanger les ordres
      const temp = sharedProjects[index].order;
      sharedProjects[index].order = sharedProjects[index - 1].order;
      sharedProjects[index - 1].order = temp;
      
      // Retrier par ordre
      sharedProjects.sort((a, b) => a.order - b.order);
      notifyListeners();
      console.log('⬆️ Projet monté');
    }
    return sharedProjects;
  },

  // Descendre un projet
  moveProjectDown: (projectId: string) => {
    const index = sharedProjects.findIndex(p => p.id === projectId);
    if (index < sharedProjects.length - 1) {
      // Échanger les ordres
      const temp = sharedProjects[index].order;
      sharedProjects[index].order = sharedProjects[index + 1].order;
      sharedProjects[index + 1].order = temp;
      
      // Retrier par ordre
      sharedProjects.sort((a, b) => a.order - b.order);
      notifyListeners();
      console.log('⬇️ Projet descendu');
    }
    return sharedProjects;
  },

  // Réorganiser les projets
  reorderProjects: (projectId: string, newOrder: number) => {
    const project = sharedProjects.find(p => p.id === projectId);
    if (!project) throw new Error('Projet non trouvé');
    
    project.order = newOrder;
    sharedProjects.sort((a, b) => a.order - b.order);
    sharedProjects.forEach((p, idx) => {
      p.order = idx + 1;
    });
    
    notifyListeners();
    console.log('🔄 Ordre des projets mis à jour');
    return sharedProjects;
  },

  // S'abonner aux changements (pour le frontend public)
  subscribe: (listener: Listener) => {
    listeners.push(listener);
    console.log('👂 Nouvel abonné aux changements, total:', listeners.length);
    // Retourner une fonction pour se désabonner
    return () => {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
        console.log('👋 Désabonné, restant:', listeners.length);
      }
    };
  }
};

// Exposer les données pour le débogage
if (typeof window !== 'undefined') {
  (window as any).sharedData = sharedDataService;
  console.log('🟢 Service de données partagées prêt !');
  console.log('📊 Projets disponibles:', sharedDataService.getProjects().length);
}
