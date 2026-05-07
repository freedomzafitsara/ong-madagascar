// src/services/imageDB.ts
'use client';

// ==================== INDEXEDDB SETUP ====================

const DB_NAME = 'YMadDB';
const DB_VERSION = 7; // Version incrémentée pour les nouveaux champs

// ==================== TYPES COMPLETS (CDC) ====================

export interface ProjectImage {
  id: string;
  projectId: string;
  url: string;
  name: string;
  isMain: boolean;
  createdAt: string;
  size?: number;
  type?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  mainImageId: string;
  createdAt: string;
  status?: 'active' | 'completed' | 'draft';
  budget?: number;
  budgetSpent?: number;
  targetCount?: number;
  currentCount?: number;
  impactYouth?: number;
  jobsCreated?: number;
  trainingsCount?: number;
  progressPercent?: number;
  managerId?: string;
  objectives?: string[];
  achievements?: string[];
}

export interface Beneficiary {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  gender?: 'M' | 'F' | 'other';
  phone?: string;
  region: string;
  fokontany?: string;
  educationLevel?: string;
  employmentStatus?: string;
  beforeYmad?: string;
  afterYmad?: string;
  vulnerability?: string;
  projectIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventType: 'camp' | 'workshop' | 'hackathon' | 'conference' | 'formation' | 'reunion';
  location: string;
  region: string;
  startDatetime: string;
  endDatetime: string;
  maxCapacity: number | null;
  currentRegistrations: number;
  isFree: boolean;
  priceMga: number;
  coverImage?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdAt: string;
  createdBy: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registrationDate: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  paymentStatus: 'free' | 'pending' | 'paid' | 'refunded';
  amountPaid: number;
  paymentMethod?: string;
  qrCode: string;
  attended: boolean;
  notes?: string;
}

export interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorType: 'individual' | 'company' | 'member' | 'diaspora' | 'anonymous';
  amount: number;
  currency: 'MGA' | 'EUR' | 'USD';
  paymentMethod: 'mvola' | 'orange_money' | 'airtel_money' | 'bank' | 'cash' | 'paypal';
  mvolaNumber?: string;
  paymentRef?: string;
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  donationPurpose: 'general' | 'project' | 'event' | 'membership';
  projectId?: string;
  eventId?: string;
  receiptNumber: string;
  isRecurring: boolean;
  notes?: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  titleMg: string;
  slug: string;
  excerpt: string;
  excerptMg: string;
  content: string;
  contentMg: string;
  articleType: 'news' | 'testimonial' | 'report' | 'success_story' | 'event_recap';
  coverImage?: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  authorId: string;
  isTestimonial: boolean;
  beneficiaryId?: string;
  viewsCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobOffer {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  contractType: 'CDI' | 'CDD' | 'Stage' | 'Freelance' | 'Volontariat' | 'Alternance';
  sector: string;
  description: string;
  missions: string[];
  requirements: string[];
  benefits?: string[];
  salary?: string;
  deadline: string;
  status: 'draft' | 'published' | 'closed' | 'expired';
  isFeatured: boolean;
  applicationsCount: number;
  viewsCount: number;
  contactEmail: string;
  contactPhone?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobOfferId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  experience: string;
  motivation: string;
  photoUrl?: string;
  cvUrl: string;
  diplomaUrl?: string;
  attestationUrl?: string;
  disponibility?: string;
  salaryExpectation?: string;
  status: 'submitted' | 'reviewing' | 'shortlisted' | 'interview' | 'accepted' | 'rejected';
  notes?: string;
  appliedAt: string;
  updatedAt: string;
}

export interface Partner {
  id: string;
  name: string;
  type: 'company' | 'ngo' | 'embassy' | 'institution' | 'media';
  logoUrl?: string;
  description: string;
  website?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  partnershipStart: string;
  partnershipEnd?: string;
  contribution: string;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Volunteer {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  skills: string[];
  region: string;
  availability: 'weekend' | 'weekday' | 'both' | 'occasional';
  hoursWorked: number;
  status: 'active' | 'inactive';
  certificateUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  url: string;
  createdAt: string;
  alt?: string;
}

export interface Logo {
  id: string;
  url: string;
  createdAt: string;
  alt?: string;
}

// ==================== PAGE BACKGROUND (NOUVEAU) ====================

export interface PageBackground {
  id: string;
  pageKey: string;
  imageUrl: string;
  updatedAt: string;
  updatedBy?: string;
}

// ==================== UTILITAIRES ====================

const generateId = (prefix: string = 'item'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
};

const triggerUpdate = (eventName: string = 'projects-updated') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(eventName));
  }
};

// ==================== BASE DE DONNÉES ====================

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;
      
      console.log(`Mise à jour IndexedDB de version ${oldVersion} vers ${DB_VERSION}`);
      
      // Suppression des anciennes stores si nécessaire
      if (oldVersion < 7) {
        const storesToDelete = ['projects', 'images', 'banner', 'logo', 'beneficiaries', 'events', 'donations', 'blog', 'jobOffers', 'jobApplications', 'partners', 'volunteers', 'pageBackgrounds'];
        storesToDelete.forEach(storeName => {
          if (db.objectStoreNames.contains(storeName)) {
            db.deleteObjectStore(storeName);
          }
        });
      }
      
      // Table des projets
      if (!db.objectStoreNames.contains('projects')) {
        const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
        projectStore.createIndex('title', 'title', { unique: false });
        projectStore.createIndex('category', 'category', { unique: false });
        projectStore.createIndex('createdAt', 'createdAt', { unique: false });
        projectStore.createIndex('status', 'status', { unique: false });
        projectStore.createIndex('location', 'location', { unique: false });
        console.log('Store "projects" créé');
      }
      
      // Table des images
      if (!db.objectStoreNames.contains('images')) {
        const imageStore = db.createObjectStore('images', { keyPath: 'id' });
        imageStore.createIndex('projectId', 'projectId', { unique: false });
        imageStore.createIndex('createdAt', 'createdAt', { unique: false });
        imageStore.createIndex('isMain', 'isMain', { unique: false });
        console.log('Store "images" créé');
      }
      
      // Table des bénéficiaires
      if (!db.objectStoreNames.contains('beneficiaries')) {
        const beneficiaryStore = db.createObjectStore('beneficiaries', { keyPath: 'id' });
        beneficiaryStore.createIndex('region', 'region', { unique: false });
        beneficiaryStore.createIndex('createdAt', 'createdAt', { unique: false });
        beneficiaryStore.createIndex('employmentStatus', 'employmentStatus', { unique: false });
        console.log('Store "beneficiaries" créé');
      }
      
      // Table des événements
      if (!db.objectStoreNames.contains('events')) {
        const eventStore = db.createObjectStore('events', { keyPath: 'id' });
        eventStore.createIndex('eventType', 'eventType', { unique: false });
        eventStore.createIndex('region', 'region', { unique: false });
        eventStore.createIndex('startDatetime', 'startDatetime', { unique: false });
        eventStore.createIndex('status', 'status', { unique: false });
        console.log('Store "events" créé');
      }
      
      // Table des inscriptions événements
      if (!db.objectStoreNames.contains('eventRegistrations')) {
        const regStore = db.createObjectStore('eventRegistrations', { keyPath: 'id' });
        regStore.createIndex('eventId', 'eventId', { unique: false });
        regStore.createIndex('userId', 'userId', { unique: false });
        regStore.createIndex('status', 'status', { unique: false });
        console.log('Store "eventRegistrations" créé');
      }
      
      // Table des dons
      if (!db.objectStoreNames.contains('donations')) {
        const donationStore = db.createObjectStore('donations', { keyPath: 'id' });
        donationStore.createIndex('status', 'status', { unique: false });
        donationStore.createIndex('paymentMethod', 'paymentMethod', { unique: false });
        donationStore.createIndex('createdAt', 'createdAt', { unique: false });
        console.log('Store "donations" créé');
      }
      
      // Table du blog
      if (!db.objectStoreNames.contains('blog')) {
        const blogStore = db.createObjectStore('blog', { keyPath: 'id' });
        blogStore.createIndex('slug', 'slug', { unique: true });
        blogStore.createIndex('status', 'status', { unique: false });
        blogStore.createIndex('category', 'category', { unique: false });
        blogStore.createIndex('articleType', 'articleType', { unique: false });
        console.log('Store "blog" créé');
      }
      
      // Table des offres d'emploi
      if (!db.objectStoreNames.contains('jobOffers')) {
        const jobStore = db.createObjectStore('jobOffers', { keyPath: 'id' });
        jobStore.createIndex('status', 'status', { unique: false });
        jobStore.createIndex('contractType', 'contractType', { unique: false });
        jobStore.createIndex('deadline', 'deadline', { unique: false });
        jobStore.createIndex('isFeatured', 'isFeatured', { unique: false });
        console.log('Store "jobOffers" créé');
      }
      
      // Table des candidatures
      if (!db.objectStoreNames.contains('jobApplications')) {
        const appStore = db.createObjectStore('jobApplications', { keyPath: 'id' });
        appStore.createIndex('jobOfferId', 'jobOfferId', { unique: false });
        appStore.createIndex('email', 'email', { unique: false });
        appStore.createIndex('status', 'status', { unique: false });
        console.log('Store "jobApplications" créé');
      }
      
      // Table des partenaires
      if (!db.objectStoreNames.contains('partners')) {
        const partnerStore = db.createObjectStore('partners', { keyPath: 'id' });
        partnerStore.createIndex('type', 'type', { unique: false });
        partnerStore.createIndex('status', 'status', { unique: false });
        partnerStore.createIndex('isFeatured', 'isFeatured', { unique: false });
        console.log('Store "partners" créé');
      }
      
      // Table des bénévoles
      if (!db.objectStoreNames.contains('volunteers')) {
        const volunteerStore = db.createObjectStore('volunteers', { keyPath: 'id' });
        volunteerStore.createIndex('region', 'region', { unique: false });
        volunteerStore.createIndex('status', 'status', { unique: false });
        console.log('Store "volunteers" créé');
      }
      
      // ✅ Table des fonds d'écran des pages (NOUVEAU)
      if (!db.objectStoreNames.contains('pageBackgrounds')) {
        const pageBgStore = db.createObjectStore('pageBackgrounds', { keyPath: 'id' });
        pageBgStore.createIndex('pageKey', 'pageKey', { unique: true });
        pageBgStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        console.log('Store "pageBackgrounds" créé');
      }
      
      // Table de la bannière
      if (!db.objectStoreNames.contains('banner')) {
        db.createObjectStore('banner', { keyPath: 'id' });
        console.log('Store "banner" créé');
      }
      
      // Table du logo
      if (!db.objectStoreNames.contains('logo')) {
        db.createObjectStore('logo', { keyPath: 'id' });
        console.log('Store "logo" créé');
      }
    };
  });
};

// ==================== PROJETS ====================

export const saveProject = async (project: Project): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['projects'], 'readwrite');
    const store = transaction.objectStore('projects');
    const request = store.put(project);
    request.onerror = () => {
      console.error('Erreur saveProject:', request.error);
      reject(request.error);
    };
    request.onsuccess = () => {
      console.log('Projet sauvegardé:', project.id, project.title);
      triggerUpdate('projects-updated');
      resolve();
    };
  });
};

export const getAllProjects = async (): Promise<Project[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['projects'], 'readonly');
    const store = transaction.objectStore('projects');
    const request = store.getAll();
    request.onerror = () => {
      console.error('Erreur getAllProjects:', request.error);
      reject(request.error);
    };
    request.onsuccess = () => {
      let projects = request.result || [];
      projects = projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      resolve(projects);
    };
  });
};

export const getProjectById = async (id: string): Promise<Project | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['projects'], 'readonly');
    const store = transaction.objectStore('projects');
    const request = store.get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
};

export const createProject = async (data: Omit<Project, 'id' | 'createdAt' | 'mainImageId'>): Promise<Project> => {
  const newProject: Project = {
    id: generateId('proj'),
    ...data,
    mainImageId: '',
    createdAt: new Date().toISOString(),
    status: data.status || 'active',
    budget: data.budget || 0,
    budgetSpent: data.budgetSpent || 0,
    targetCount: data.targetCount || 0,
    currentCount: data.currentCount || 0,
    impactYouth: data.impactYouth || 0,
    jobsCreated: data.jobsCreated || 0,
    trainingsCount: data.trainingsCount || 0,
    progressPercent: data.progressPercent || 0,
    objectives: data.objectives || [],
    achievements: data.achievements || []
  };
  await saveProject(newProject);
  return newProject;
};

export const updateProject = async (id: string, data: Partial<Project>): Promise<void> => {
  const project = await getProjectById(id);
  if (project) {
    const updatedProject = { ...project, ...data };
    await saveProject(updatedProject);
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  const db = await openDB();
  const images = await getProjectImages(id);
  for (const img of images) {
    await deleteImage(img.id);
  }
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['projects'], 'readwrite');
    const store = transaction.objectStore('projects');
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      triggerUpdate('projects-updated');
      resolve();
    };
  });
};

// ==================== BÉNÉFICIAIRES ====================

export const getAllBeneficiaries = async (): Promise<Beneficiary[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['beneficiaries'], 'readonly');
    const store = transaction.objectStore('beneficiaries');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
};

export const saveBeneficiary = async (beneficiary: Beneficiary): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['beneficiaries'], 'readwrite');
    const store = transaction.objectStore('beneficiaries');
    const request = store.put(beneficiary);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      triggerUpdate('beneficiaries-updated');
      resolve();
    };
  });
};

export const createBeneficiary = async (data: Omit<Beneficiary, 'id' | 'createdAt' | 'updatedAt'>): Promise<Beneficiary> => {
  const newBeneficiary: Beneficiary = {
    id: generateId('ben'),
    ...data,
    projectIds: data.projectIds || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await saveBeneficiary(newBeneficiary);
  return newBeneficiary;
};

// ==================== ÉVÉNEMENTS ====================

export const getAllEvents = async (): Promise<Event[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['events'], 'readonly');
    const store = transaction.objectStore('events');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
};

export const saveEvent = async (event: Event): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['events'], 'readwrite');
    const store = transaction.objectStore('events');
    const request = store.put(event);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      triggerUpdate('events-updated');
      resolve();
    };
  });
};

export const createEvent = async (data: Omit<Event, 'id' | 'createdAt' | 'currentRegistrations'>): Promise<Event> => {
  const newEvent: Event = {
    id: generateId('evt'),
    ...data,
    currentRegistrations: 0,
    createdAt: new Date().toISOString()
  };
  await saveEvent(newEvent);
  return newEvent;
};

export const getEventById = async (id: string): Promise<Event | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['events'], 'readonly');
    const store = transaction.objectStore('events');
    const request = store.get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
};

// ==================== DONS ====================

export const getAllDonations = async (): Promise<Donation[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['donations'], 'readonly');
    const store = transaction.objectStore('donations');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
};

export const saveDonation = async (donation: Donation): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['donations'], 'readwrite');
    const store = transaction.objectStore('donations');
    const request = store.put(donation);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      triggerUpdate('donations-updated');
      resolve();
    };
  });
};

// ==================== BLOG ====================

export const getAllBlogPosts = async (): Promise<BlogPost[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['blog'], 'readonly');
    const store = transaction.objectStore('blog');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
};

// ==================== OFFRES D'EMPLOI ====================

export const getAllJobOffers = async (): Promise<JobOffer[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['jobOffers'], 'readonly');
    const store = transaction.objectStore('jobOffers');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
};

export const getJobOfferById = async (id: string): Promise<JobOffer | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['jobOffers'], 'readonly');
    const store = transaction.objectStore('jobOffers');
    const request = store.get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
};

// ==================== CANDIDATURES ====================

export const getAllJobApplications = async (): Promise<JobApplication[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['jobApplications'], 'readonly');
    const store = transaction.objectStore('jobApplications');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
};

// ==================== PARTENAIRES ====================

export const getAllPartners = async (): Promise<Partner[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['partners'], 'readonly');
    const store = transaction.objectStore('partners');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
};

// ==================== BÉNÉVOLES ====================

export const getAllVolunteers = async (): Promise<Volunteer[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['volunteers'], 'readonly');
    const store = transaction.objectStore('volunteers');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
};

// ==================== IMAGES ====================

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Erreur lecture fichier'));
    reader.readAsDataURL(file);
  });
};

export const saveImage = async (image: ProjectImage): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['images'], 'readwrite');
    const store = transaction.objectStore('images');
    const request = store.put(image);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      triggerUpdate('projects-updated');
      resolve();
    };
  });
};

export const addProjectImage = async (projectId: string, file: File): Promise<ProjectImage> => {
  const url = await fileToDataUrl(file);
  const existingImages = await getProjectImages(projectId);
  const project = await getProjectById(projectId);
  
  const newImage: ProjectImage = {
    id: generateId('img'),
    projectId: projectId,
    url: url,
    name: file.name,
    isMain: existingImages.length === 0,
    createdAt: new Date().toISOString(),
    size: file.size,
    type: file.type
  };
  
  await saveImage(newImage);
  
  if (newImage.isMain && project) {
    project.mainImageId = newImage.id;
    await saveProject(project);
  }
  
  return newImage;
};

export const getProjectImages = async (projectId: string): Promise<ProjectImage[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['images'], 'readonly');
    const store = transaction.objectStore('images');
    const index = store.index('projectId');
    const request = index.getAll(projectId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const images = request.result || [];
      images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      resolve(images);
    };
  });
};

export const getMainImageUrl = async (projectId: string): Promise<string> => {
  const project = await getProjectById(projectId);
  if (project && project.mainImageId) {
    const images = await getProjectImages(projectId);
    const mainImage = images.find(img => img.id === project.mainImageId);
    if (mainImage) return mainImage.url;
  }
  const images = await getProjectImages(projectId);
  return images.length > 0 ? images[0].url : '';
};

export const setMainImage = async (projectId: string, imageId: string): Promise<void> => {
  const project = await getProjectById(projectId);
  const images = await getProjectImages(projectId);
  
  if (project) {
    for (const img of images) {
      img.isMain = img.id === imageId;
      await saveImage(img);
    }
    project.mainImageId = imageId;
    await saveProject(project);
  }
};

export const deleteImage = async (imageId: string): Promise<void> => {
  const db = await openDB();
  
  const allProjects = await getAllProjects();
  for (const project of allProjects) {
    if (project.mainImageId === imageId) {
      project.mainImageId = '';
      await saveProject(project);
    }
  }
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['images'], 'readwrite');
    const store = transaction.objectStore('images');
    const request = store.delete(imageId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      triggerUpdate('projects-updated');
      resolve();
    };
  });
};

// ==================== BANNIÈRE ====================

export const saveBanner = async (file: File, alt?: string): Promise<string> => {
  const url = await fileToDataUrl(file);
  const db = await openDB();
  const transaction = db.transaction(['banner'], 'readwrite');
  const store = transaction.objectStore('banner');
  const banner: Banner = { 
    id: 'main', 
    url: url, 
    createdAt: new Date().toISOString(),
    alt: alt || 'Bannière Y-Mad'
  };
  store.put(banner);
  triggerUpdate('banner-updated');
  return url;
};

export const getBanner = async (): Promise<Banner | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['banner'], 'readonly');
    const store = transaction.objectStore('banner');
    const request = store.get('main');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
};

export const deleteBanner = async (): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction(['banner'], 'readwrite');
  const store = transaction.objectStore('banner');
  store.delete('main');
  triggerUpdate('banner-updated');
};

// ==================== LOGO ====================

export const saveLogo = async (file: File, alt?: string): Promise<string> => {
  const url = await fileToDataUrl(file);
  const db = await openDB();
  const transaction = db.transaction(['logo'], 'readwrite');
  const store = transaction.objectStore('logo');
  const logo: Logo = { 
    id: 'main', 
    url: url, 
    createdAt: new Date().toISOString(),
    alt: alt || 'Logo Y-Mad'
  };
  store.put(logo);
  triggerUpdate('logo-updated');
  return url;
};

export const getLogo = async (): Promise<Logo | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['logo'], 'readonly');
    const store = transaction.objectStore('logo');
    const request = store.get('main');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
};

export const deleteLogo = async (): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction(['logo'], 'readwrite');
  const store = transaction.objectStore('logo');
  store.delete('main');
  triggerUpdate('logo-updated');
};

// ==================== PAGE BACKGROUND (NOUVEAU) ====================

export const getPageBackground = async (pageKey: string): Promise<{ url: string } | null> => {
  if (typeof window === 'undefined') return null;
  
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pageBackgrounds'], 'readonly');
      const store = transaction.objectStore('pageBackgrounds');
      const index = store.index('pageKey');
      const request = index.get(pageKey);
      
      request.onerror = () => {
        console.error('Erreur getPageBackground:', request.error);
        resolve(null);
      };
      
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.imageUrl) {
          resolve({ url: result.imageUrl });
        } else {
          resolve(null);
        }
      };
    });
  } catch (error) {
    console.error('Erreur getPageBackground:', error);
    return null;
  }
};

export const savePageBackground = async (pageKey: string, imageUrl: string, updatedBy?: string): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  try {
    const db = await openDB();
    const transaction = db.transaction(['pageBackgrounds'], 'readwrite');
    const store = transaction.objectStore('pageBackgrounds');
    
    // Supprimer l'ancien fond pour cette page
    const index = store.index('pageKey');
    const existingRequest = index.get(pageKey);
    
    existingRequest.onsuccess = () => {
      const existing = existingRequest.result;
      if (existing) {
        store.delete(existing.id);
      }
      
      // Ajouter le nouveau
      const newBackground: PageBackground = {
        id: generateId('pgbg'),
        pageKey,
        imageUrl,
        updatedAt: new Date().toISOString(),
        updatedBy: updatedBy || 'admin'
      };
      
      store.put(newBackground);
      triggerUpdate('backgrounds-updated');
    };
    
    existingRequest.onerror = () => {
      // Si erreur, on ajoute quand même
      const newBackground: PageBackground = {
        id: generateId('pgbg'),
        pageKey,
        imageUrl,
        updatedAt: new Date().toISOString(),
        updatedBy: updatedBy || 'admin'
      };
      store.put(newBackground);
      triggerUpdate('backgrounds-updated');
    };
  } catch (error) {
    console.error('Erreur savePageBackground:', error);
  }
};

export const deletePageBackground = async (pageKey: string): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  try {
    const db = await openDB();
    const transaction = db.transaction(['pageBackgrounds'], 'readwrite');
    const store = transaction.objectStore('pageBackgrounds');
    const index = store.index('pageKey');
    const request = index.get(pageKey);
    
    request.onsuccess = () => {
      const result = request.result;
      if (result) {
        store.delete(result.id);
        triggerUpdate('backgrounds-updated');
      }
    };
  } catch (error) {
    console.error('Erreur deletePageBackground:', error);
  }
};

export const getAllPageBackgrounds = async (): Promise<PageBackground[]> => {
  if (typeof window === 'undefined') return [];
  
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pageBackgrounds'], 'readonly');
      const store = transaction.objectStore('pageBackgrounds');
      const request = store.getAll();
      
      request.onerror = () => {
        reject(request.error);
      };
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
    });
  } catch (error) {
    console.error('Erreur getAllPageBackgrounds:', error);
    return [];
  }
};

// ==================== UTILITAIRES ====================

export const clearAllData = async (): Promise<void> => {
  const db = await openDB();
  const stores = ['projects', 'images', 'banner', 'logo', 'beneficiaries', 'events', 'eventRegistrations', 'donations', 'blog', 'jobOffers', 'jobApplications', 'partners', 'volunteers', 'pageBackgrounds'];
  
  for (const storeName of stores) {
    if (db.objectStoreNames.contains(storeName)) {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      store.clear();
      console.log(`Store "${storeName}" vidé`);
    }
  }
  
  triggerUpdate('projects-updated');
  triggerUpdate('banner-updated');
  triggerUpdate('logo-updated');
  triggerUpdate('backgrounds-updated');
};

export const getDatabaseSize = async (): Promise<number> => {
  const db = await openDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(['projects', 'images'], 'readonly');
    let totalSize = 0;
    
    const stores = ['projects', 'images'];
    let completed = 0;
    
    stores.forEach(storeName => {
      if (!db.objectStoreNames.contains(storeName)) {
        completed++;
        if (completed === stores.length) resolve(totalSize);
        return;
      }
      
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => {
        const items = request.result || [];
        items.forEach((item: any) => {
          totalSize += JSON.stringify(item).length;
        });
        completed++;
        if (completed === stores.length) {
          resolve(Math.round(totalSize / 1024));
        }
      };
      request.onerror = () => {
        completed++;
        if (completed === stores.length) resolve(0);
      };
    });
  });
};

// ==================== EXPORTS POUR COMPATIBILITÉ ====================
export type { ProjectImage as ProjectImageType };
export type { Project as ProjectType };
export type { Banner as BannerType };
export type { Logo as LogoType };
export type { PageBackground as PageBackgroundType };