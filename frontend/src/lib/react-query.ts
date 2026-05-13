// src/lib/react-query.ts

import { QueryClient, QueryKey } from '@tanstack/react-query';

// Configuration du client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ✅ Invalider une ou plusieurs queries
export const invalidateQueries = (...queryKeys: string[]) => {
  queryKeys.forEach(key => {
    queryClient.invalidateQueries({ queryKey: [key] });
  });
};

// ✅ Rafraîchir et récupérer les données
export const refetchQueries = async (...queryKeys: string[]) => {
  const promises = queryKeys.map(key => 
    queryClient.refetchQueries({ queryKey: [key] })
  );
  await Promise.all(promises);
};

// ✅ Préfixer les clés (autocomplétion IDE)
export const queryKeys = {
  // Auth
  auth: {
    user: ['auth', 'user'] as const,
    profile: ['auth', 'profile'] as const,
    users: ['auth', 'users'] as const,
  },
  
  // Beneficiaries
  beneficiaries: {
    all: ['beneficiaries'] as const,
    detail: (id: string) => ['beneficiaries', id] as const,
    stats: ['beneficiaries', 'stats'] as const,
    byRegion: ['beneficiaries', 'byRegion'] as const,
  },
  
  // Projects
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
    featured: ['projects', 'featured'] as const,
    stats: ['projects', 'stats'] as const,
  },
  
  // Events
  events: {
    all: ['events'] as const,
    detail: (id: string) => ['events', id] as const,
    upcoming: ['events', 'upcoming'] as const,
    registrations: ['events', 'registrations'] as const,
  },
  
  // Jobs
  jobs: {
    offers: ['jobs', 'offers'] as const,
    offer: (id: string) => ['jobs', 'offers', id] as const,
    applications: ['jobs', 'applications'] as const,
    myApplications: ['jobs', 'applications', 'my'] as const,
  },
  
  // Donations
  donations: {
    all: ['donations'] as const,
    stats: ['donations', 'stats'] as const,
    myDonations: ['donations', 'my'] as const,
  },
  
  // Blog
  blog: {
    all: ['blog'] as const,
    post: (id: string) => ['blog', id] as const,
    featured: ['blog', 'featured'] as const,
  },
};

// ✅ Type helper pour les clés (TypeScript)
export type QueryKeys = typeof queryKeys;