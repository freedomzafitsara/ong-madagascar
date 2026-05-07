import api from '@/lib/api';
import { User, CreateUserDto, UpdateUserDto, Project, Donation, BlogPost, ContactMessage } from '@/types';

// ========== DONNÉES DE DÉMONSTRATION ==========

export let demoUsers: User[] = [
  {
    id: 'dir_001',
    email: 'direction@ong-madagascar.org',
    firstName: 'Direction',
    lastName: 'Générale',
    role: 'admin',
    isActive: true,
    phone: '+261 34 12 345 67',
    department: 'Direction Stratégique',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ops_001',
    email: 'coordination@ong-madagascar.org',
    firstName: 'Coordination',
    lastName: 'Opérations',
    role: 'manager',
    isActive: true,
    phone: '+261 32 12 345 67',
    department: 'Opérations Terrain',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'edu_001',
    email: 'education@ong-madagascar.org',
    firstName: 'Programmes',
    lastName: 'Éducation',
    role: 'staff',
    isActive: true,
    phone: '+261 33 12 345 67',
    department: 'Éducation et Formation',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'sante_001',
    email: 'sante@ong-madagascar.org',
    firstName: 'Programmes',
    lastName: 'Santé',
    role: 'staff',
    isActive: true,
    phone: '+261 34 98 765 43',
    department: 'Santé Communautaire',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 'eau_001',
    email: 'eau.assainissement@ong-madagascar.org',
    firstName: 'Programmes',
    lastName: 'Eau',
    role: 'staff',
    isActive: true,
    phone: '+261 33 45 67 89',
    department: 'Eau et Assainissement',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'env_001',
    email: 'environnement@ong-madagascar.org',
    firstName: 'Programmes',
    lastName: 'Environnement',
    role: 'staff',
    isActive: true,
    phone: '+261 32 45 67 89',
    department: 'Environnement',
    createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z',
  },
  {
    id: 'part_001',
    email: 'partenariats@ong-madagascar.org',
    firstName: 'Partenariats',
    lastName: 'Institutionnels',
    role: 'manager',
    isActive: true,
    phone: '+261 34 56 78 90',
    department: 'Développement',
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z',
  },
];

export let demoProjects: Project[] = [
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
    startDate: '2024-01-15',
    endDate: '2024-12-20',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
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
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'proj_003',
    title: 'Centre de Santé Maternelle et Infantile',
    slug: 'centre-sante-maternelle',
    description: 'Réhabilitation et équipement d\'un centre de santé pour la prise en charge des mères et enfants.',
    category: 'Santé',
    status: 'completed',
    progress: 100,
    beneficiaries: 567,
    budget: 14200000,
    location: 'Haute Matsiatra',
    startDate: '2023-06-01',
    endDate: '2024-03-31',
    createdAt: '2023-05-15T00:00:00Z',
    updatedAt: '2024-03-31T00:00:00Z',
  },
  {
    id: 'proj_004',
    title: 'Agroécologie et Sécurité Alimentaire',
    slug: 'agroecologie-securite-alimentaire',
    description: 'Formation aux techniques agricoles durables et distribution de semences adaptées.',
    category: 'Agriculture',
    status: 'active',
    progress: 35,
    beneficiaries: 234,
    budget: 16900000,
    location: 'Boeny',
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z',
  },
  {
    id: 'proj_005',
    title: 'Reforestation Communautaire',
    slug: 'reforestation-communautaire',
    description: 'Plantation d\'espèces endémiques et création de pépinières communautaires.',
    category: 'Environnement',
    status: 'active',
    progress: 58,
    beneficiaries: 189,
    budget: 8900000,
    location: 'Atsinanana',
    startDate: '2024-01-10',
    endDate: '2024-10-30',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
];

export let demoDonations: Donation[] = [
  {
    id: 'don_001',
    donorName: 'Fondation de France',
    donorEmail: 'contact@fdf.org',
    amount: 1250000,
    currency: 'MGA',
    status: 'confirmed',
    projectId: 'proj_001',
    receiptNumber: 'REC-2024-001',
    isRecurring: false,
    createdAt: '2024-03-15T10:30:00Z',
    confirmedAt: '2024-03-16T08:00:00Z',
  },
  {
    id: 'don_002',
    donorName: 'Agence Française de Développement',
    donorEmail: 'contact@afd.fr',
    amount: 2500000,
    currency: 'MGA',
    status: 'confirmed',
    projectId: 'proj_002',
    receiptNumber: 'REC-2024-002',
    isRecurring: true,
    createdAt: '2024-03-10T14:20:00Z',
    confirmedAt: '2024-03-11T09:15:00Z',
  },
  {
    id: 'don_003',
    donorName: 'Mécène Anonyme',
    donorEmail: '',
    amount: 500000,
    currency: 'MGA',
    status: 'pending',
    projectId: null,
    isRecurring: false,
    createdAt: '2024-03-18T09:45:00Z',
  },
];

export let demoBlogPosts: BlogPost[] = [
  {
    id: 'blog_001',
    title: 'Rentrée scolaire : 500 kits distribués dans le Sud',
    slug: 'rentree-scolaire-500-kits',
    excerpt: 'Dans le cadre du programme d\'éducation, 500 kits scolaires ont été distribués aux enfants des communes rurales.',
    content: 'Contenu complet...',
    category: 'Actualités',
    status: 'published',
    tags: ['Éducation', 'Action sociale', 'Distribution'],
    authorId: 'edu_001',
    viewsCount: 1250,
    publishedAt: '2024-03-01T08:00:00Z',
    createdAt: '2024-02-25T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'blog_002',
    title: 'Inauguration du 15ème forage à Androy',
    slug: 'inauguration-15eme-forage',
    excerpt: 'Grâce au soutien de nos partenaires, le 15ème forage a été inauguré dans le district d\'Ambovombe.',
    content: 'Contenu complet...',
    category: 'Réalisations',
    status: 'published',
    tags: ['Eau', 'Forage', 'Impact'],
    authorId: 'eau_001',
    viewsCount: 890,
    publishedAt: '2024-03-10T10:00:00Z',
    createdAt: '2024-03-05T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
  },
];

export let demoContacts: ContactMessage[] = [
  {
    id: 'msg_001',
    name: 'Délégation Régionale du Ministère de la Santé',
    email: 'drs.androy@sante.gov.mg',
    phone: '+261 34 12 345 67',
    subject: 'Demande de collaboration sanitaire',
    message: 'Suite à la réussite du programme santé, nous souhaitons étendre la collaboration à d\'autres districts.',
    status: 'new',
    createdAt: '2024-03-17T15:30:00Z',
  },
  {
    id: 'msg_002',
    name: 'Ambassade de France à Madagascar',
    email: 'cooperation@ambafrance-mg.org',
    phone: '+261 32 98 765 43',
    subject: 'Proposition de partenariat institutionnel',
    message: 'Dans le cadre du Fonds de Solidarité pour les Projets Innovants, votre ONG est éligible à un financement.',
    status: 'read',
    createdAt: '2024-03-16T11:20:00Z',
  },
];

// ========== SERVICES ==========

export const userService = {
  getAll: async () => ({ data: demoUsers, total: demoUsers.length }),
  getById: async (id: string) => demoUsers.find(u => u.id === id),
  create: async (userData: any) => {
    const newUser = { ...userData, id: `usr_${Date.now()}`, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    demoUsers.push(newUser);
    return newUser;
  },
  update: async (id: string, userData: any) => {
    const index = demoUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      demoUsers[index] = { ...demoUsers[index], ...userData, updatedAt: new Date().toISOString() };
      return demoUsers[index];
    }
    throw new Error('Utilisateur non trouvé');
  },
  delete: async (id: string) => {
    const index = demoUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      demoUsers.splice(index, 1);
      return { success: true };
    }
    throw new Error('Utilisateur non trouvé');
  },
  toggleStatus: async (id: string, isActive: boolean) => {
    const index = demoUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      demoUsers[index].isActive = isActive;
      return demoUsers[index];
    }
    throw new Error('Utilisateur non trouvé');
  },
};

export const projectService = {
  getAll: async () => ({ data: demoProjects, total: demoProjects.length }),
  getById: async (id: string) => demoProjects.find(p => p.id === id),
  create: async (projectData: any) => {
    const newProject = { ...projectData, id: `proj_${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    demoProjects.push(newProject);
    return newProject;
  },
  update: async (id: string, projectData: any) => {
    const index = demoProjects.findIndex(p => p.id === id);
    if (index !== -1) {
      demoProjects[index] = { ...demoProjects[index], ...projectData, updatedAt: new Date().toISOString() };
      return demoProjects[index];
    }
    throw new Error('Projet non trouvé');
  },
  delete: async (id: string) => {
    const index = demoProjects.findIndex(p => p.id === id);
    if (index !== -1) {
      demoProjects.splice(index, 1);
      return { success: true };
    }
    throw new Error('Projet non trouvé');
  },
};

export const donationService = {
  getAll: async () => ({ data: demoDonations, total: demoDonations.length }),
  getById: async (id: string) => demoDonations.find(d => d.id === id),
  updateStatus: async (id: string, status: string) => {
    const index = demoDonations.findIndex(d => d.id === id);
    if (index !== -1) {
      demoDonations[index].status = status as any;
      if (status === 'confirmed') {
        demoDonations[index].confirmedAt = new Date().toISOString();
      }
      return demoDonations[index];
    }
    throw new Error('Don non trouvé');
  },
  delete: async (id: string) => {
    const index = demoDonations.findIndex(d => d.id === id);
    if (index !== -1) {
      demoDonations.splice(index, 1);
      return { success: true };
    }
    throw new Error('Don non trouvé');
  },
};

export const blogService = {
  getAll: async () => ({ data: demoBlogPosts, total: demoBlogPosts.length }),
  getById: async (id: string) => demoBlogPosts.find(p => p.id === id),
  create: async (postData: any) => {
    const newPost = { ...postData, id: `blog_${Date.now()}`, viewsCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    demoBlogPosts.push(newPost);
    return newPost;
  },
  update: async (id: string, postData: any) => {
    const index = demoBlogPosts.findIndex(p => p.id === id);
    if (index !== -1) {
      demoBlogPosts[index] = { ...demoBlogPosts[index], ...postData, updatedAt: new Date().toISOString() };
      return demoBlogPosts[index];
    }
    throw new Error('Article non trouvé');
  },
  delete: async (id: string) => {
    const index = demoBlogPosts.findIndex(p => p.id === id);
    if (index !== -1) {
      demoBlogPosts.splice(index, 1);
      return { success: true };
    }
    throw new Error('Article non trouvé');
  },
};

export const contactService = {
  getAll: async () => ({ data: demoContacts, total: demoContacts.length }),
  getById: async (id: string) => demoContacts.find(c => c.id === id),
  updateStatus: async (id: string, status: string) => {
    const index = demoContacts.findIndex(c => c.id === id);
    if (index !== -1) {
      demoContacts[index].status = status as any;
      return demoContacts[index];
    }
    throw new Error('Message non trouvé');
  },
  delete: async (id: string) => {
    const index = demoContacts.findIndex(c => c.id === id);
    if (index !== -1) {
      demoContacts.splice(index, 1);
      return { success: true };
    }
    throw new Error('Message non trouvé');
  },
};

// ========== SERVICE STATISTIQUES ==========
export const statsService = {
  getDashboardStats: async () => ({
    totalUsers: demoUsers.length,
    totalProjects: demoProjects.length,
    activeProjects: demoProjects.filter(p => p.status === 'active').length,
    totalDonations: demoDonations.length,
    donationsAmount: demoDonations.filter(d => d.status === 'confirmed').reduce((sum, d) => sum + d.amount, 0),
    totalBeneficiaries: demoProjects.reduce((sum, p) => sum + p.beneficiaries, 0),
    totalBlogPosts: demoBlogPosts.filter(p => p.status === 'published').length,
    pendingContacts: demoContacts.filter(c => c.status === 'new').length,
  }),
  getActivityLogs: async (params?: { page?: number; limit?: number }) => {
    return {
      data: [
        {
          id: 'act_001',
          user: { firstName: 'Direction', lastName: 'Générale' },
          action: 'Connexion',
          entityType: 'user',
          details: 'Connexion au tableau de bord',
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: params?.page || 1,
      lastPage: 1,
    };
  },
  exportData: async (type: 'users' | 'donations' | 'projects', format: 'csv' | 'excel') => {
    return { data: 'Export data', format };
  },
};
