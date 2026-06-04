// backend/src/modules/jobs/jobs.service.ts

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, FindOptionsWhere } from 'typeorm';
import { JobOffer } from '../../entities/job-offer.entity';
import { JobApplication } from '../../entities/job-application.entity';
import { CreateJobOfferDto, UpdateJobOfferDto, JobOfferQueryDto } from './dto/job-offer.dto';
import { CreateJobApplicationDto, UpdateApplicationStatusDto } from './dto/create-job-application.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';

export type ApplicationStatus = 'submitted' | 'reviewing' | 'shortlisted' | 'accepted' | 'rejected';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectRepository(JobOffer)
    private jobRepository: Repository<JobOffer>,
    @InjectRepository(JobApplication)
    private applicationRepository: Repository<JobApplication>,
  ) {}

  // ============================================================
  // SECTION 1 : GESTION DES OFFRES D'EMPLOI
  // ============================================================

  async create(createDto: CreateJobOfferDto): Promise<JobOffer> {
    try {
      const job = this.jobRepository.create({
        title_fr: createDto.title_fr,
        title_mg: createDto.title_mg || null,
        description_fr: createDto.description_fr,
        description_mg: createDto.description_mg || null,
        company: createDto.company,
        location: createDto.location || null,
        contract_type: createDto.contract_type || 'CDI',
        deadline: createDto.deadline,
        is_published: createDto.is_published || false,
        image_url: createDto.image_url || null,
        status: createDto.is_published ? 'published' : 'draft',
      });
      
      const savedJob = await this.jobRepository.save(job);
      this.logger.log(`Offre d'emploi créée: ${savedJob.title_fr}`);
      return savedJob;
    } catch (error) {
      this.logger.error(`Erreur lors de la création: ${error.message}`);
      throw new BadRequestException(`Erreur lors de la création: ${error.message}`);
    }
  }

  async findAll(queryDto: JobOfferQueryDto): Promise<{
    data: JobOffer[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  }> {
    try {
      const page = queryDto.page || 1;
      const limit = queryDto.limit || 10;
      const skip = (page - 1) * limit;

      const where: FindOptionsWhere<JobOffer> = {};

      if (queryDto.status) where.status = queryDto.status;
      if (queryDto.is_published !== undefined) where.is_published = queryDto.is_published;
      if (queryDto.contract_type) where.contract_type = queryDto.contract_type;

      const [data, total] = await this.jobRepository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip,
        take: limit,
      });

      return { data, total, page, totalPages: Math.ceil(total / limit), limit };
    } catch (error) {
      this.logger.error(`Erreur findAll: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0, limit: 10 };
    }
  }

  async findPublished(queryDto: JobOfferQueryDto): Promise<{
    data: JobOffer[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  }> {
    try {
      const page = queryDto.page || 1;
      const limit = queryDto.limit || 9;
      const skip = (page - 1) * limit;
      const now = new Date();

      const where: FindOptionsWhere<JobOffer> = {
        is_published: true,
        status: 'published',
      };

      if (queryDto.contract_type) where.contract_type = queryDto.contract_type;

      const data = await this.jobRepository.find({
        where,
        order: { created_at: 'DESC' },
      });

      const activeData = data.filter(job => !job.deadline || new Date(job.deadline) > now);
      const paginatedData = activeData.slice(skip, skip + limit);

      return { 
        data: paginatedData, 
        total: activeData.length, 
        page, 
        totalPages: Math.ceil(activeData.length / limit), 
        limit 
      };
    } catch (error) {
      this.logger.error(`Erreur findPublished: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0, limit: 9 };
    }
  }

  async findFeatured(): Promise<JobOffer[]> {
    try {
      const now = new Date();
      const offers = await this.jobRepository.find({
        where: { is_published: true, status: 'published' },
        order: { created_at: 'DESC' },
        take: 6,
      });
      
      return offers.filter(job => !job.deadline || new Date(job.deadline) > now);
    } catch (error) {
      this.logger.error(`Erreur findFeatured: ${error.message}`);
      return [];
    }
  }

  async findOne(id: string): Promise<JobOffer> {
    if (!id || id === 'stats' || id === 'public' || id === 'featured') {
      throw new BadRequestException(`ID invalide: ${id}`);
    }
    
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Offre d'emploi ${id} non trouvée`);
    }
    return job;
  }

  async update(id: string, updateDto: UpdateJobOfferDto): Promise<JobOffer> {
    try {
      const job = await this.findOne(id);
      
      if (updateDto.title_fr !== undefined) job.title_fr = updateDto.title_fr;
      if (updateDto.title_mg !== undefined) job.title_mg = updateDto.title_mg;
      if (updateDto.description_fr !== undefined) job.description_fr = updateDto.description_fr;
      if (updateDto.description_mg !== undefined) job.description_mg = updateDto.description_mg;
      if (updateDto.company !== undefined) job.company = updateDto.company;
      if (updateDto.location !== undefined) job.location = updateDto.location;
      if (updateDto.contract_type !== undefined) job.contract_type = updateDto.contract_type;
      if (updateDto.deadline !== undefined) job.deadline = updateDto.deadline;
      if (updateDto.is_published !== undefined) {
        job.is_published = updateDto.is_published;
        job.status = updateDto.is_published ? 'published' : 'draft';
      }
      if (updateDto.image_url !== undefined) job.image_url = updateDto.image_url;
      
      const updatedJob = await this.jobRepository.save(job);
      this.logger.log(`Offre mise à jour: ${id}`);
      return updatedJob;
    } catch (error) {
      this.logger.error(`Erreur update: ${error.message}`);
      throw new BadRequestException(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  async updateStatus(id: string, updateDto: UpdateJobStatusDto): Promise<JobOffer> {
    try {
      const job = await this.findOne(id);
      job.status = updateDto.status;
      job.is_published = updateDto.status === 'published';
      const updatedJob = await this.jobRepository.save(job);
      this.logger.log(`Statut mis à jour: ${id} -> ${updateDto.status}`);
      return updatedJob;
    } catch (error) {
      this.logger.error(`Erreur updateStatus: ${error.message}`);
      throw new BadRequestException(`Erreur lors du changement de statut: ${error.message}`);
    }
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const job = await this.findOne(id);
    await this.jobRepository.remove(job);
    this.logger.log(`Offre supprimée: ${id}`);
    return { success: true, message: 'Offre supprimée avec succès' };
  }

  async getStats() {
    try {
      const total = await this.jobRepository.count();
      const published = await this.jobRepository.count({ 
        where: { is_published: true, status: 'published' } 
      });
      const draft = await this.jobRepository.count({ 
        where: { is_published: false } 
      });
      const expired = await this.jobRepository.count({ 
        where: { is_published: true, deadline: LessThan(new Date()) } 
      });
      const closed = await this.jobRepository.count({ 
        where: { status: 'closed' } 
      });
      const archived = await this.jobRepository.count({ 
        where: { status: 'archived' } 
      });

      const totalApplications = await this.applicationRepository.count();
      const pendingApplications = await this.applicationRepository.count({ 
        where: { status: 'submitted' } 
      });

      return { total, published, draft, expired, closed, archived, totalApplications, pendingApplications };
    } catch (error) {
      this.logger.error(`Erreur getStats: ${error.message}`);
      return { total: 0, published: 0, draft: 0, expired: 0, closed: 0, archived: 0, totalApplications: 0, pendingApplications: 0 };
    }
  }

  // ============================================================
  // SECTION 2 : GESTION DES CANDIDATURES
  // ============================================================

  async apply(createDto: CreateJobApplicationDto): Promise<JobApplication> {
    try {
      const job = await this.findOne(createDto.job_offer_id);

      if (!job.is_published) {
        throw new BadRequestException("Cette offre n'est plus disponible");
      }

      if (job.deadline && new Date(job.deadline) < new Date()) {
        throw new BadRequestException("La date limite de candidature est dépassée");
      }

      const existing = await this.applicationRepository.findOne({
        where: { 
          job_offer_id: createDto.job_offer_id, 
          email: createDto.email 
        },
      });

      if (existing) {
        throw new BadRequestException("Vous avez déjà postulé à cette offre");
      }

      const application = this.applicationRepository.create({
        job_offer_id: createDto.job_offer_id,
        full_name: createDto.full_name,
        email: createDto.email,
        phone: createDto.phone || null,
        cv_url: createDto.cv_url || null,
        cover_letter: createDto.cover_letter || null,
        status: 'submitted',
      });

      const savedApplication = await this.applicationRepository.save(application);
      
      job.applications_count += 1;
      await this.jobRepository.save(job);
      
      this.logger.log(`Nouvelle candidature pour ${createDto.job_offer_id} par ${createDto.email}`);
      return savedApplication;
    } catch (error) {
      this.logger.error(`Erreur apply: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  async getAllApplications(queryDto: {
    page?: number; 
    limit?: number; 
    status?: string; 
    job_offer_id?: string 
  }): Promise<{
    data: JobApplication[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  }> {
    try {
      const page = queryDto.page || 1;
      const limit = queryDto.limit || 10;
      const skip = (page - 1) * limit;

      const where: FindOptionsWhere<JobApplication> = {};
      if (queryDto.status) where.status = queryDto.status;
      if (queryDto.job_offer_id) where.job_offer_id = queryDto.job_offer_id;

      const [data, total] = await this.applicationRepository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip,
        take: limit,
      });
      
      return { data, total, page, totalPages: Math.ceil(total / limit), limit };
    } catch (error) {
      this.logger.error(`Erreur getAllApplications: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0, limit: 10 };
    }
  }

  async getApplicationsByJob(jobId: string, queryDto: { 
    page?: number; 
    limit?: number; 
    status?: string 
  }): Promise<{
    data: JobApplication[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  }> {
    try {
      const page = queryDto.page || 1;
      const limit = queryDto.limit || 10;
      const skip = (page - 1) * limit;

      const where: FindOptionsWhere<JobApplication> = { job_offer_id: jobId };
      if (queryDto.status) where.status = queryDto.status;

      const [data, total] = await this.applicationRepository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip,
        take: limit,
      });

      return { data, total, page, totalPages: Math.ceil(total / limit), limit };
    } catch (error) {
      this.logger.error(`Erreur getApplicationsByJob: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0, limit: 10 };
    }
  }

  async getApplicationStats() {
    try {
      const total = await this.applicationRepository.count();
      const submitted = await this.applicationRepository.count({ where: { status: 'submitted' } });
      const reviewing = await this.applicationRepository.count({ where: { status: 'reviewing' } });
      const shortlisted = await this.applicationRepository.count({ where: { status: 'shortlisted' } });
      const accepted = await this.applicationRepository.count({ where: { status: 'accepted' } });
      const rejected = await this.applicationRepository.count({ where: { status: 'rejected' } });

      return { total, submitted, reviewing, shortlisted, accepted, rejected };
    } catch (error) {
      this.logger.error(`Erreur getApplicationStats: ${error.message}`);
      return { total: 0, submitted: 0, reviewing: 0, shortlisted: 0, accepted: 0, rejected: 0 };
    }
  }

  async updateApplicationStatus(id: string, updateDto: UpdateApplicationStatusDto): Promise<JobApplication> {
    try {
      const application = await this.applicationRepository.findOne({ where: { id } });
      if (!application) {
        throw new NotFoundException("Candidature non trouvée");
      }
      
      application.status = updateDto.status;
      if (updateDto.notes) {
        application.notes = updateDto.notes;
      }
      
      const updatedApplication = await this.applicationRepository.save(application);
      this.logger.log(`Statut candidature mis à jour: ${id} -> ${updateDto.status}`);
      return updatedApplication;
    } catch (error) {
      this.logger.error(`Erreur updateApplicationStatus: ${error.message}`);
      throw new BadRequestException(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  async deleteApplication(id: string): Promise<{ success: boolean; message: string }> {
    const application = await this.applicationRepository.findOne({ where: { id } });
    if (!application) {
      throw new NotFoundException("Candidature non trouvée");
    }
    await this.applicationRepository.remove(application);
    this.logger.log(`Candidature supprimée: ${id}`);
    return { success: true, message: 'Candidature supprimée avec succès' };
  }

  // ============================================================
  // SECTION 3 : EXPORT CSV
  // ============================================================

  async exportApplicationsToCSV(jobId?: string): Promise<string> {
    try {
      const where: any = {};
      if (jobId) where.job_offer_id = jobId;

      const applications = await this.applicationRepository.find({
        where,
        relations: ['jobOffer'],
        order: { created_at: 'DESC' },
      });

      const escapeCsv = (str: string): string => {
        if (!str) return '';
        return `"${str.replace(/"/g, '""')}"`;
      };

      const headers = [
        'ID',
        'ID Offre',
        'Titre du poste',
        'Entreprise',
        'Nom complet',
        'Email',
        'Téléphone',
        'Statut',
        'Date de candidature',
        'URL CV',
        'Notes'
      ];

      const rows = applications.map(app => [
        app.id,
        app.job_offer_id,
        app.jobOffer?.title_fr || '',
        app.jobOffer?.company || '',
        app.full_name,
        app.email,
        app.phone || '',
        app.status,
        new Date(app.created_at).toLocaleDateString('fr-FR'),
        app.cv_url || '',
        app.notes || ''
      ].map(escapeCsv).join(';'));

      const csvContent = [
        headers.map(escapeCsv).join(';'),
        ...rows
      ].join('\n');

      this.logger.log(`Export CSV: ${applications.length} candidatures exportées`);
      return csvContent;
    } catch (error) {
      this.logger.error(`Erreur export CSV: ${error.message}`);
      throw new BadRequestException(`Erreur lors de l'export: ${error.message}`);
    }
  }
}