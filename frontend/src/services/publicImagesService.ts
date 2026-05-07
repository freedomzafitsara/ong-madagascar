// Service pour gérer les images publiques de la page d'accueil
export interface HomeImage {
  id: string;
  url: string;
  title: string;
  description: string;
  category: 'hero' | 'project' | 'impact' | 'testimonial' | 'partner';
  order: number;
}

// Images par défaut (à remplacer par vos vraies photos)
export const defaultHomeImages = {
  hero: [
    {
      id: 'hero-1',
      url: '/images/hero/education-madagascar.jpg',
      title: 'Éducation pour tous',
      description: 'Des enfants malgaches scolarisés grâce à vos dons'
    }
  ],
  projects: [
    {
      id: 'proj-1',
      url: '/images/projects/ecole-rurale.jpg',
      title: 'Construction d\'écoles rurales',
      description: 'Nouvelles salles de classe dans la région d\'Analamanga'
    },
    {
      id: 'proj-2',
      url: '/images/projects/forage-eau.jpg',
      title: 'Accès à l\'eau potable',
      description: 'Forage dans le village d\'Ambovombe'
    },
    {
      id: 'proj-3',
      url: '/images/projects/sante-maternelle.jpg',
      title: 'Santé maternelle',
      description: 'Consultation prénatale dans un centre de santé'
    }
  ],
  impact: [
    {
      id: 'impact-1',
      url: '/images/impact/enfants-heureux.jpg',
      title: '500 enfants scolarisés',
      description: 'Rentrée scolaire 2024'
    },
    {
      id: 'impact-2',
      url: '/images/impact/puits-construit.jpg',
      title: '50 puits construits',
      description: 'Accès à l\'eau potable pour 10 000 personnes'
    }
  ]
};

export const publicImagesService = {
  // Récupérer toutes les images
  getAllImages: async () => {
    return defaultHomeImages;
  },

  // Récupérer les images du hero
  getHeroImages: async () => {
    return defaultHomeImages.hero;
  },

  // Récupérer les images des projets
  getProjectImages: async () => {
    return defaultHomeImages.projects;
  },

  // Récupérer les images d'impact
  getImpactImages: async () => {
    return defaultHomeImages.impact;
  }
};
