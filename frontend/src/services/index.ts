// ============================================================
// EXPORTS CENTRALISÉS DES SERVICES
// ============================================================

export { default as api } from '@/lib/axios';
export { authService } from './auth.service';
export { jobService } from './job.service';
export { uploadService } from './upload.service';
export { contactService } from './contact.service';
export { blogService } from './blog.service';
export { projectService } from './project.service';
export { pageService } from './page.service';

// Types
export type { JobOffer, JobApplication, JobStatus, ContractType } from './job.service';
export type { UploadedImage, UploadType } from './upload.service';
