// backend/src/modules/jobs/jobs.service.ts

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, FindOptionsWhere } from 'typeorm';
import { JobOffer } from '../../entities/job-offer.entity';
import { JobApplication, ApplicationStatus } from '../../entities/job-application.entity';
import { CreateJobOfferDto, UpdateJobOfferDto, JobOfferQueryDto } from './dto/create-job-offer.dto';
import { CreateJobApplicationDto, UpdateApplicationStatusDto, JobApplicationQueryDto } from './dto/create-job-application.dto';

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
  // SECTION 1 : GESTION DES OFFRES D EMPLOI
  // ============================================================

  async create(createDto: CreateJobOfferDto, userId: string): Promise<JobOffer> {
    try {
      const job = this.jobRepository.create({
        title_fr: createDto.title_fr,
        title_mg: createDto.title_mg,
        description_fr: createDto.description_fr,
        description_mg: createDto.description_mg,
        company: createDto.company,
        location: createDto.location,
        contract_type: createDto.contract_type || 'CDI',
        deadline: createDto.deadline,
        is_published: createDto.is_published || false,
        image_url: createDto.image_url,
        status: createDto.is_published ? 'published' : 'draft',
      });
      
      const savedJob = await this.jobRepository.save(job);
      this.logger.log(`Offre d'emploi créée: ${savedJob.title_fr} par ${userId}`);
      return savedJob;
    } catch (error) {
      this.logger.error(`Erreur lors de la création de l'offre: ${error.message}`);
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
      this.logger.error(`Erreur lors de la récupération des offres: ${error.message}`);
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

      const [data, total] = await this.jobRepository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip,
        take: limit,
      });

      // Filtrer les offres expirées
      const activeData = data.filter(job => !job.deadline || new Date(job.deadline) > now);

      return { 
        data: activeData, 
        total: activeData.length, 
        page, 
        totalPages: Math.ceil(activeData.length / limit), 
        limit 
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des offres publiées: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0, limit: 9 };
    }
  }

  async findFeatured(): Promise<JobOffer[]> {
    try {
      return await this.jobRepository.find({
        where: {
          is_published: true,
          status: 'published',
        },
        order: { created_at: 'DESC' },
        take: 6,
      });
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des offres vedettes: ${error.message}`);
      return [];
    }
  }

  async findOne(id: string): Promise<JobOffer> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Offre d'emploi avec l'identifiant ${id} non trouvée`);
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
      this.logger.log(`Offre d'emploi mise à jour: ${updatedJob.id}`);
      return updatedJob;
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de l'offre: ${error.message}`);
      throw new BadRequestException(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  async updateStatus(id: string, status: string): Promise<JobOffer> {
    try {
      const job = await this.findOne(id);
      job.status = status;
      job.is_published = status === 'published';
      const updatedJob = await this.jobRepository.save(job);
      this.logger.log(`Statut de l'offre mis à jour: ${id} -> ${status}`);
      return updatedJob;
    } catch (error) {
      this.logger.error(`Erreur lors du changement de statut: ${error.message}`);
      throw new BadRequestException(`Erreur lors du changement de statut: ${error.message}`);
    }
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const job = await this.findOne(id);
    await this.jobRepository.remove(job);
    this.logger.log(`Offre d'emploi supprimée: ${id}`);
    return { success: true, message: 'Offre supprimée avec succès' };
  }

  async getStats() {
    try {
      const now = new Date();
      const total = await this.jobRepository.count();
      const published = await this.jobRepository.count({ where: { is_published: true, status: 'published' } });
      const draft = await this.jobRepository.count({ where: { is_published: false, status: 'draft' } });
      const expired = await this.jobRepository.count({ 
        where: { 
          is_published: true,
          deadline: LessThan(now),
        } 
      });

      const totalApplications = await this.applicationRepository.count();
      const pendingApplications = await this.applicationRepository.count({ 
        where: { status: ApplicationStatus.SUBMITTED } 
      });

      return { 
        total, 
        published, 
        draft, 
        expired, 
        totalApplications, 
        pendingApplications 
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des statistiques: ${error.message}`);
      return { 
        total: 0, 
        published: 0, 
        draft: 0, 
        expired: 0, 
        totalApplications: 0, 
        pendingApplications: 0 
      };
    }
  }

  // ============================================================
  // SECTION 2 : GESTION DES CANDIDATURES
  // ============================================================

  async apply(createDto: CreateJobApplicationDto, files: any, userId?: string): Promise<JobApplication> {
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
          email: createDto.email,
        },
      });

      if (existing) {
        throw new BadRequestException("Vous avez déjà postulé à cette offre");
      }

      const application = this.applicationRepository.create({
        job_offer_id: createDto.job_offer_id,
        user_id: userId,
        full_name: createDto.full_name,
        email: createDto.email,
        phone: createDto.phone,
        address: createDto.address,
        experience: createDto.experience,
        experience_years: createDto.experience_years,
        cover_letter: createDto.cover_letter,
        cv_url: files?.cv?.[0]?.path || createDto.cv_url,
        diploma_url: files?.diploma?.[0]?.path || createDto.diploma_url,
        photo_url: files?.photo?.[0]?.path || createDto.photo_url,
        attestation_url: files?.attestation?.[0]?.path || createDto.attestation_url,
        status: ApplicationStatus.SUBMITTED,
      });

      const savedApplication = await this.applicationRepository.save(application);
      this.logger.log(`Nouvelle candidature pour l'offre ${createDto.job_offer_id} par ${createDto.email}`);
      return savedApplication;
    } catch (error) {
      this.logger.error(`Erreur lors de la candidature: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  async getApplicationsByJob(jobId: string, queryDto: JobApplicationQueryDto): Promise<{
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
        relations: ['jobOffer'],
        order: { created_at: 'DESC' },
        skip,
        take: limit,
      });

      return { data, total, page, totalPages: Math.ceil(total / limit), limit };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des candidatures: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0, limit: 10 };
    }
  }

  async getApplication(id: string): Promise<JobApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['jobOffer', 'user'],
    });
    if (!application) {
      throw new NotFoundException("Candidature non trouvée");
    }
    return application;
  }

  async updateApplicationStatus(id: string, updateDto: UpdateApplicationStatusDto, reviewerId: string): Promise<JobApplication> {
    try {
      const application = await this.getApplication(id);
      application.status = updateDto.status;
      application.notes = updateDto.notes;
      application.reviewed_by = reviewerId;
      application.reviewed_at = new Date();
      
      const updatedApplication = await this.applicationRepository.save(application);
      this.logger.log(`Statut de candidature mis à jour: ${id} -> ${updateDto.status} par ${reviewerId}`);
      return updatedApplication;
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du statut de candidature: ${error.message}`);
      throw new BadRequestException(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  async getUserApplications(userId: string, queryDto: JobApplicationQueryDto): Promise<{
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

      const [data, total] = await this.applicationRepository.findAndCount({
        where: { user_id: userId },
        relations: ['jobOffer'],
        order: { created_at: 'DESC' },
        skip,
        take: limit,
      });
      return { data, total, page, totalPages: Math.ceil(total / limit), limit };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des candidatures: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0, limit: 10 };
    }
  }

  async getAllApplications(queryDto: JobApplicationQueryDto): Promise<{
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
      if (queryDto.user_id) where.user_id = queryDto.user_id;

      const [data, total] = await this.applicationRepository.findAndCount({
        where,
        relations: ['jobOffer', 'user'],
        order: { created_at: 'DESC' },
        skip,
        take: limit,
      });
      
      return { data, total, page, totalPages: Math.ceil(total / limit), limit };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des candidatures: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0, limit: 10 };
    }
  }

  // ============================================================
  // SECTION 3 : STATISTIQUES ET EXPORT DES CANDIDATURES
  // ============================================================

  async getApplicationStats(): Promise<{
    total: number;
    submitted: number;
    reviewing: number;
    shortlisted: number;
    interview: number;
    accepted: number;
    rejected: number;
  }> {
    const total = await this.applicationRepository.count();
    const submitted = await this.applicationRepository.count({ where: { status: ApplicationStatus.SUBMITTED } });
    const reviewing = await this.applicationRepository.count({ where: { status: ApplicationStatus.REVIEWING } });
    const shortlisted = await this.applicationRepository.count({ where: { status: ApplicationStatus.SHORTLISTED } });
    const interview = await this.applicationRepository.count({ where: { status: ApplicationStatus.INTERVIEW } });
    const accepted = await this.applicationRepository.count({ where: { status: ApplicationStatus.ACCEPTED } });
    const rejected = await this.applicationRepository.count({ where: { status: ApplicationStatus.REJECTED } });

    return { total, submitted, reviewing, shortlisted, interview, accepted, rejected };
  }

  async exportApplicationsToCSV(jobId?: string): Promise<string> {
    const where: FindOptionsWhere<JobApplication> = {};
    if (jobId) where.job_offer_id = jobId;

    const applications = await this.applicationRepository.find({
      where,
      relations: ['jobOffer'],
      order: { created_at: 'DESC' },
    });

    const headers = ['ID', 'Candidat', 'Email', 'Telephone', 'Poste', 'Entreprise', 'Statut', 'Date candidature'];
    const rows = applications.map(app => [
      app.id,
      app.full_name,
      app.email,
      app.phone || '',
      app.jobOffer?.title_fr || '',
      app.jobOffer?.company || '',
      app.status,
      new Date(app.created_at).toLocaleDateString('fr-FR'),
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(';')).join('\n');
    return csvContent;
  }

  async deleteApplication(id: string): Promise<{ success: boolean; message: string }> {
    const application = await this.getApplication(id);
    await this.applicationRepository.remove(application);
    this.logger.log(`Candidature supprimée: ${id}`);
    return { success: true, message: 'Candidature supprimée avec succès' };
  }
}