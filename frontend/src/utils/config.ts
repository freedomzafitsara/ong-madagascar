// frontend/src/utils/config.ts

export const config = {
  api: {
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api',
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001',
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Y-MaD',
    fullName: process.env.NEXT_PUBLIC_APP_FULL_NAME || 'Young for Madagascar Development',
    slogan: process.env.NEXT_PUBLIC_APP_SLOGAN || 'Plateforme de gestion des offres d\'emploi',
  },
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    email: process.env.NEXT_PUBLIC_SITE_EMAIL || 'ymad.mg@gmail.com',
    phone: process.env.NEXT_PUBLIC_SITE_PHONE || '+261 32 04 856 97',
    address: process.env.NEXT_PUBLIC_SITE_ADDRESS || 'Carion, Antananarivo, Madagascar',
  },
  colors: {
    primary: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#1E3A8A',
    secondary: process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#6B7280',
    accent: process.env.NEXT_PUBLIC_ACCENT_COLOR || '#3B82F6',
  },
  features: {
    jobs: process.env.NEXT_PUBLIC_ENABLE_JOBS_MODULE === 'true',
    blog: process.env.NEXT_PUBLIC_ENABLE_BLOG_MODULE === 'true',
    projects: process.env.NEXT_PUBLIC_ENABLE_PROJECTS_MODULE === 'true',
    contact: process.env.NEXT_PUBLIC_ENABLE_CONTACT_MODULE === 'true',
  },
  pagination: {
    defaultPageSize: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || '10'),
    maxPageSize: parseInt(process.env.NEXT_PUBLIC_MAX_PAGE_SIZE || '100'),
  },
  upload: {
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '5242880'),
    allowedFileTypes: process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES?.split(',') || [],
  },
  jobs: {
    perPage: parseInt(process.env.NEXT_PUBLIC_JOBS_PER_PAGE || '9'),
    applicationsEnabled: process.env.NEXT_PUBLIC_APPLICATIONS_ENABLED === 'true',
  },
  blog: {
    postsPerPage: parseInt(process.env.NEXT_PUBLIC_BLOG_POSTS_PER_PAGE || '6'),
  },
  projects: {
    perPage: parseInt(process.env.NEXT_PUBLIC_PROJECTS_PER_PAGE || '6'),
  },
};