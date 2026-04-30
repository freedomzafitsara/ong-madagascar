import { sharedDataService } from './sharedDataService';

// Service public qui utilise les mêmes données que l'admin
export const publicDataService = {
  // Récupérer les projets actifs
  getProjects: async () => {
    const allProjects = sharedDataService.getProjects();
    const activeProjects = allProjects.filter(p => p.status === 'active');
    return { data: activeProjects, total: activeProjects.length };
  },

  // Récupérer un projet par slug
  getProjectBySlug: async (slug: string) => {
    const project = sharedDataService.getProjectBySlug(slug);
    if (!project) throw new Error('Projet non trouvé');
    return project;
  },

  // Récupérer les projets en vedette (top 3)
  getFeaturedProjects: async () => {
    const projects = await publicDataService.getProjects();
    return projects.data.slice(0, 3);
  },

  // Récupérer les articles de blog (à connecter)
  getBlogPosts: async () => {
    // Simuler des articles pour l'instant
    return { data: [], total: 0 };
  },

  // Récupérer les actualités récentes
  getRecentNews: async () => {
    return [];
  },

  // Récupérer les statistiques publiques
  getPublicStats: async () => {
    const allProjects = sharedDataService.getProjects();
    const activeProjects = allProjects.filter(p => p.status === 'active');
    const totalBeneficiaries = allProjects.reduce((sum, p) => sum + p.beneficiaries, 0);
    const regions = [...new Set(allProjects.map(p => p.location.split(',')[0]))];
    
    return {
      projectsCount: activeProjects.length,
      totalProjects: allProjects.length,
      beneficiariesCount: totalBeneficiaries,
      regionsCount: regions.length,
      yearsExperience: new Date().getFullYear() - 2009,
      donationsAmount: 0 // À connecter plus tard
    };
  },

  // Témoignages
  getTestimonials: async () => {
    return [
      { id: '1', name: 'Rakoto Maminirina', role: 'Bénéficiaire', content: 'Grâce au programme éducatif, mes trois enfants peuvent enfin aller à l\'école.', avatar: '👨', rating: 5 },
      { id: '2', name: 'Dr. Raharison', role: 'Partenaire santé', content: 'La collaboration a permis d\'améliorer l\'accès aux soins.', avatar: '👩‍⚕️', rating: 5 },
      { id: '3', name: 'Rasoanaivo', role: 'Bénévole', content: 'Faire partie de cette aventure humaine est enrichissant.', avatar: '🤝', rating: 5 }
    ];
  }
};
