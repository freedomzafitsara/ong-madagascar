// src/lib/react-query.ts

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const invalidateQueries = (...queryKeys: string[]) => {
  queryKeys.forEach(key => {
    queryClient.invalidateQueries({ queryKey: [key] });
  });
};

export const refetchQueries = async (...queryKeys: string[]) => {
  const promises = queryKeys.map(key => 
    queryClient.refetchQueries({ queryKey: [key] })
  );
  await Promise.all(promises);
};

export const queryKeys = {
  auth: {
    user: ['auth', 'user'] as const,
    profile: ['auth', 'profile'] as const,
    users: ['auth', 'users'] as const,
  },
  jobs: {
    offers: ['jobs', 'offers'] as const,
    offer: (id: string) => ['jobs', 'offers', id] as const,
    featured: ['jobs', 'featured'] as const,
    stats: ['jobs', 'stats'] as const,
    applications: ['jobs', 'applications'] as const,
    application: (id: string) => ['jobs', 'applications', id] as const,
    applicationStats: ['jobs', 'applications', 'stats'] as const,
  },
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
    featured: ['projects', 'featured'] as const,
    stats: ['projects', 'stats'] as const,
  },
  blog: {
    all: ['blog'] as const,
    post: (id: string) => ['blog', id] as const,
    postBySlug: (slug: string) => ['blog', 'slug', slug] as const,
    stats: ['blog', 'stats'] as const,
  },
  pages: {
    all: ['pages'] as const,
    content: (pageKey: string) => ['pages', 'content', pageKey] as const,
    backgrounds: ['pages', 'backgrounds'] as const,
    background: (pageKey: string) => ['pages', 'backgrounds', pageKey] as const,
  },
  contact: {
    all: ['contact'] as const,
    message: (id: string) => ['contact', id] as const,
    stats: ['contact', 'stats'] as const,
  },
  language: {
    all: ['language'] as const,
    key: (key: string) => ['language', key] as const,
    locale: (locale: string) => ['language', 'locale', locale] as const,
    stats: ['language', 'stats'] as const,
  },
  upload: {
    images: ['upload', 'images'] as const,
  },
};

export type QueryKeys = typeof queryKeys;