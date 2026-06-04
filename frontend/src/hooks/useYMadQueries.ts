// src/hooks/useYMadQueries.ts

import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query';
import { jobsApi, projectsApi, blogApi, pagesApi, contactApi, languageApi, authApi } from '@/lib/api';

// ============================================================
// AUTH QUERIES
// ============================================================

export const useAuthUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: () => authApi.getProfile(),
    enabled: authApi.isAuthenticated(),
    retry: false,
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.auth.users,
    queryFn: () => authApi.getUsers(),
  });
};

// ============================================================
// JOBS QUERIES
// ============================================================

export const useJobOffers = (page: number = 1, limit: number = 10, status?: string, contract_type?: string) => {
  return useQuery({
    queryKey: [...queryKeys.jobs.offers, page, limit, status, contract_type],
    queryFn: () => jobsApi.getAll(page, limit, status, contract_type),
  });
};

export const usePublicJobOffers = (page: number = 1, limit: number = 9, contract_type?: string) => {
  return useQuery({
    queryKey: [...queryKeys.jobs.offers, 'public', page, limit, contract_type],
    queryFn: () => jobsApi.getPublic(page, limit, contract_type),
  });
};

export const useJobOffer = (id: string) => {
  return useQuery({
    queryKey: queryKeys.jobs.offer(id),
    queryFn: () => jobsApi.getOne(id),
    enabled: !!id,
  });
};

export const useFeaturedJobOffers = () => {
  return useQuery({
    queryKey: queryKeys.jobs.featured,
    queryFn: () => jobsApi.getFeatured(),
  });
};

export const useJobStats = () => {
  return useQuery({
    queryKey: queryKeys.jobs.stats,
    queryFn: () => jobsApi.getStats(),
  });
};

export const useApplications = (jobId?: string, page?: number, limit?: number, status?: string) => {
  return useQuery({
    queryKey: [...queryKeys.jobs.applications, jobId, page, limit, status],
    queryFn: () => jobsApi.getApplications(jobId, page, limit, status),
  });
};

export const useApplicationStats = () => {
  return useQuery({
    queryKey: queryKeys.jobs.applicationStats,
    queryFn: () => jobsApi.getApplicationStats(),
  });
};

// ============================================================
// PROJECTS QUERIES
// ============================================================

export const useProjects = (page: number = 1, limit: number = 10, status?: string) => {
  return useQuery({
    queryKey: [...queryKeys.projects.all, page, limit, status],
    queryFn: () => projectsApi.getAll(page, limit, status),
  });
};

export const usePublicProjects = (page: number = 1, limit: number = 9) => {
  return useQuery({
    queryKey: [...queryKeys.projects.all, 'public', page, limit],
    queryFn: () => projectsApi.getPublic(page, limit),
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectsApi.getOne(id),
    enabled: !!id,
  });
};

export const useFeaturedProjects = () => {
  return useQuery({
    queryKey: queryKeys.projects.featured,
    queryFn: () => projectsApi.getFeatured(),
  });
};

export const useProjectsStats = () => {
  return useQuery({
    queryKey: queryKeys.projects.stats,
    queryFn: () => projectsApi.getStats(),
  });
};

// ============================================================
// BLOG QUERIES
// ============================================================

export const useBlogPosts = (page: number = 1, limit: number = 10, status?: string, category_id?: string, search?: string) => {
  return useQuery({
    queryKey: [...queryKeys.blog.all, page, limit, status, category_id, search],
    queryFn: () => blogApi.getAll(page, limit, status, category_id, search),
  });
};

export const usePublicBlogPosts = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: [...queryKeys.blog.all, 'public', page, limit],
    queryFn: () => blogApi.getPublic(page, limit),
  });
};

export const useBlogPost = (id: string) => {
  return useQuery({
    queryKey: queryKeys.blog.post(id),
    queryFn: () => blogApi.getOne(id),
    enabled: !!id,
  });
};

export const useBlogPostBySlug = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.blog.postBySlug(slug),
    queryFn: () => blogApi.getBySlug(slug),
    enabled: !!slug,
  });
};

export const useBlogStats = () => {
  return useQuery({
    queryKey: queryKeys.blog.stats,
    queryFn: () => blogApi.getStats(),
  });
};

// ============================================================
// PAGES QUERIES
// ============================================================

export const usePageContent = (pageKey: string) => {
  return useQuery({
    queryKey: queryKeys.pages.content(pageKey),
    queryFn: () => pagesApi.getPublicPage(pageKey),
    enabled: !!pageKey,
  });
};

export const usePageContentAdmin = (pageKey: string) => {
  return useQuery({
    queryKey: [...queryKeys.pages.content(pageKey), 'admin'],
    queryFn: () => pagesApi.getPageForAdmin(pageKey),
    enabled: !!pageKey,
  });
};

export const useAllPageContents = () => {
  return useQuery({
    queryKey: queryKeys.pages.all,
    queryFn: () => pagesApi.getAll(),
  });
};

export const usePageBackgrounds = () => {
  return useQuery({
    queryKey: queryKeys.pages.backgrounds,
    queryFn: () => pagesApi.getAllBackgrounds(),
  });
};

export const usePageBackground = (pageKey: string) => {
  return useQuery({
    queryKey: queryKeys.pages.background(pageKey),
    queryFn: () => pagesApi.getBackground(pageKey),
    enabled: !!pageKey,
  });
};

// ============================================================
// CONTACT QUERIES
// ============================================================

export const useContactMessages = (page: number = 1, limit: number = 10, status?: string, search?: string) => {
  return useQuery({
    queryKey: [...queryKeys.contact.all, page, limit, status, search],
    queryFn: () => contactApi.getAll(page, limit, status, search),
  });
};

export const useContactMessage = (id: string) => {
  return useQuery({
    queryKey: queryKeys.contact.message(id),
    queryFn: () => contactApi.getOne(id),
    enabled: !!id,
  });
};

export const useContactStats = () => {
  return useQuery({
    queryKey: queryKeys.contact.stats,
    queryFn: () => contactApi.getStats(),
  });
};

// ============================================================
// LANGUAGE QUERIES
// ============================================================

export const useTranslations = (locale: string) => {
  return useQuery({
    queryKey: queryKeys.language.locale(locale),
    queryFn: () => languageApi.getByLocale(locale),
    enabled: !!locale,
  });
};

export const useTranslation = (key: string) => {
  return useQuery({
    queryKey: queryKeys.language.key(key),
    queryFn: () => languageApi.getByKey(key),
    enabled: !!key,
  });
};

export const useAllTranslations = () => {
  return useQuery({
    queryKey: queryKeys.language.all,
    queryFn: () => languageApi.getAll(),
  });
};

export const useLanguageStats = () => {
  return useQuery({
    queryKey: queryKeys.language.stats,
    queryFn: () => languageApi.getStats(),
  });
};

// ============================================================
// MUTATIONS
// ============================================================

import { queryClient, invalidateQueries } from '@/lib/react-query';

export const useCreateJobOffer = () => {
  return useMutation({
    mutationFn: jobsApi.create,
    onSuccess: () => {
      invalidateQueries('jobs');
    },
  });
};

export const useUpdateJobOffer = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => jobsApi.update(id, data),
    onSuccess: () => {
      invalidateQueries('jobs');
    },
  });
};

export const useDeleteJobOffer = () => {
  return useMutation({
    mutationFn: jobsApi.delete,
    onSuccess: () => {
      invalidateQueries('jobs');
    },
  });
};

export const useUpdateJobStatus = () => {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => jobsApi.updateStatus(id, status),
    onSuccess: () => {
      invalidateQueries('jobs');
    },
  });
};

export const useApplyToJob = () => {
  return useMutation({
    mutationFn: jobsApi.apply,
  });
};

export const useUpdateApplicationStatus = () => {
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) => 
      jobsApi.updateApplicationStatus(id, status, notes),
    onSuccess: () => {
      invalidateQueries('jobs');
    },
  });
};

export const useCreateProject = () => {
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      invalidateQueries('projects');
    },
  });
};

export const useUpdateProject = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => projectsApi.update(id, data),
    onSuccess: () => {
      invalidateQueries('projects');
    },
  });
};

export const useDeleteProject = () => {
  return useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => {
      invalidateQueries('projects');
    },
  });
};

export const useCreateBlogPost = () => {
  return useMutation({
    mutationFn: blogApi.create,
    onSuccess: () => {
      invalidateQueries('blog');
    },
  });
};

export const useUpdateBlogPost = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => blogApi.update(id, data),
    onSuccess: () => {
      invalidateQueries('blog');
    },
  });
};

export const usePublishBlogPost = () => {
  return useMutation({
    mutationFn: blogApi.publish,
    onSuccess: () => {
      invalidateQueries('blog');
    },
  });
};

export const useDeleteBlogPost = () => {
  return useMutation({
    mutationFn: blogApi.delete,
    onSuccess: () => {
      invalidateQueries('blog');
    },
  });
};

export const useSendContactMessage = () => {
  return useMutation({
    mutationFn: contactApi.sendMessage,
  });
};

export const useUpdateContactStatus = () => {
  return useMutation({
    mutationFn: ({ id, status, admin_notes }: { id: string; status: string; admin_notes?: string }) => 
      contactApi.updateStatus(id, status, admin_notes),
    onSuccess: () => {
      invalidateQueries('contact');
    },
  });
};

export const useCreateOrUpdateTranslation = () => {
  return useMutation({
    mutationFn: ({ key, value_fr, value_mg }: { key: string; value_fr: string; value_mg: string }) => 
      languageApi.createOrUpdate(key, value_fr, value_mg),
    onSuccess: () => {
      invalidateQueries('language');
    },
  });
};

export const useUpdatePageContent = () => {
  return useMutation({
    mutationFn: ({ pageKey, data }: { pageKey: string; data: any }) => pagesApi.updatePage(pageKey, data),
    onSuccess: () => {
      invalidateQueries('pages');
    },
  });
};

export const useUpdatePageBackground = () => {
  return useMutation({
    mutationFn: ({ pageKey, data }: { pageKey: string; data: any }) => pagesApi.updateBackground(pageKey, data),
    onSuccess: () => {
      invalidateQueries('pages');
    },
  });
};