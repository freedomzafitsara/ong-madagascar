// backend/src/modules/jobs/jobs.service.ts

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, FindOptionsWhere, Like } from 'typeorm';
import { JobOffer } from '../../entities/job-offer.entity';
import { JobApplication } from '../../entities/job-application.entity';
import { CreateJobOfferDto, UpdateJobOfferDto, JobOfferQueryDto } from './dto/job-offer.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { 
  CreateJobApplicationDto, 
  UpdateApplicationStatusDto, 
  ApplicationQueryDto
} from './dto/application.dto';

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
  // GESTION DES OFFRES
  // ============================================================

  async create(createDto: CreateJobOfferDto): Promise<JobOffer> {
    try {
      const job = this.jobRepository.create({
        title_fr: createDto.title_fr,
        title_mg: createDto.title_mg || null,
        description_fr: createDto.description_fr,
        description_mg: createDto.description_mg || null,
        company: createDto.company || 'Y-Mad Madagascar',
        location: createDto.location || 'Antananarivo',
        contract_type: createDto.contract_type || 'CDI',
        deadline: createDto.deadline || null,
        is_published: createDto.is_published || false,
        image_url: createDto.image_url || null,
        status: createDto.is_published ? 'published' : 'draft',
      });
      
      const savedJob = await this.jobRepository.save(job);
      this.logger.log(`Offre creee: ${savedJob.title_fr} (ID: ${savedJob.id})`);
      return savedJob;
    } catch (error) {
      this.logger.error(`Erreur creation: ${error.message}`);
      throw new BadRequestException(`Erreur: ${error.message}`);
    }
  }

  async updateMainImage(jobId: string, imageId: string): Promise<JobOffer> {
    const job = await this.findOne(jobId);
    job.main_image_id = imageId;
    const updatedJob = await this.jobRepository.save(job);
    this.logger.log(`Image principale mise a jour: ${jobId} -> ${imageId}`);
    return updatedJob;
  }

  async updateImageUrl(jobId: string, imageUrl: string): Promise<JobOffer> {
    const job = await this.findOne(jobId);
    job.image_url = imageUrl;
    const updatedJob = await this.jobRepository.save(job);
    this.logger.log(`URL image mise a jour: ${jobId}`);
    return updatedJob;
  }

  async findAll(queryDto: JobOfferQueryDto) {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<JobOffer> = {};
    
    if (queryDto.status) where.status = queryDto.status;
    if (queryDto.is_published !== undefined) where.is_published = queryDto.is_published;
    if (queryDto.contract_type) where.contract_type = queryDto.contract_type;
    if (queryDto.search) {
      where.title_fr = Like(`%${queryDto.search}%`);
    }

    const [data, total] = await this.jobRepository.findAndCount({
      where,
      order: { [queryDto.sortBy || 'created_at']: queryDto.sortOrder || 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, totalPages: Math.ceil(total / limit), limit };
  }

  async findPublished(queryDto: JobOfferQueryDto) {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 100;
    const skip = (page - 1) * limit;
    const now = new Date();

    const where: FindOptionsWhere<JobOffer> = {
      is_published: true,
      status: 'published',
    };

    if (queryDto.contract_type) {
      where.contract_type = queryDto.contract_type;
    }

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
  }

  async findFeatured(): Promise<JobOffer[]> {
    const now = new Date();
    const offers = await this.jobRepository.find({
      where: { is_published: true, status: 'published' },
      order: { created_at: 'DESC' },
      take: 6,
    });
    
    return offers.filter(job => !job.deadline || new Date(job.deadline) > now);
  }

  async findOne(id: string): Promise<JobOffer> {
    if (!id || id === 'stats' || id === 'public' || id === 'featured' || id === 'applications') {
      throw new BadRequestException(`ID invalide: ${id}`);
    }
    
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Offre ${id} non trouvee`);
    }
    
    return job;
  }

  async update(id: string, updateDto: UpdateJobOfferDto): Promise<JobOffer> {
    const job = await this.findOne(id);
    
    if (updateDto.title_fr !== undefined) job.title_fr = updateDto.title_fr;
    if (updateDto.title_mg !== undefined) job.title_mg = updateDto.title_mg;
    if (updateDto.description_fr !== undefined) job.description_fr = updateDto.description_fr;
    if (updateDto.description_mg !== undefined) job.description_mg = updateDto.description_mg;
    if (updateDto.company !== undefined) job.company = updateDto.company;
    if (updateDto.location !== undefined) job.location = updateDto.location;
    if (updateDto.contract_type !== undefined) job.contract_type = updateDto.contract_type;
    if (updateDto.deadline !== undefined) job.deadline = updateDto.deadline;
    if (updateDto.image_url !== undefined) job.image_url = updateDto.image_url;
    
    if (updateDto.is_published !== undefined) {
      job.is_published = updateDto.is_published;
      job.status = updateDto.is_published ? 'published' : 'draft';
    }
    
    const updatedJob = await this.jobRepository.save(job);
    this.logger.log(`Offre mise a jour: ${id}`);
    return updatedJob;
  }

  async updateStatus(id: string, updateDto: UpdateJobStatusDto): Promise<JobOffer> {
    const job = await this.findOne(id);
    const newStatus = updateDto.status;
    job.status = newStatus;
    job.is_published = newStatus === 'published';
    const updatedJob = await this.jobRepository.save(job);
    this.logger.log(`Statut mis a jour: ${id} -> ${newStatus}`);
    return updatedJob;
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const job = await this.findOne(id);
    await this.jobRepository.remove(job);
    this.logger.log(`Offre supprimee: ${id}`);
    return { success: true, message: 'Offre supprimee avec succes' };
  }

  async getStats() {
    const total = await this.jobRepository.count();
    const published = await this.jobRepository.count({ where: { is_published: true, status: 'published' } });
    const draft = await this.jobRepository.count({ where: { is_published: false } });
    const expired = await this.jobRepository.count({ where: { deadline: LessThan(new Date()) } });
    const closed = await this.jobRepository.count({ where: { status: 'closed' } });
    const archived = await this.jobRepository.count({ where: { status: 'archived' } });
    
    const totalApplications = await this.applicationRepository.count();
    const pendingApplications = await this.applicationRepository.count({ where: { status: 'submitted' } });

    return { total, published, draft, expired, closed, archived, totalApplications, pendingApplications };
  }

  // ============================================================
  // GESTION DES CANDIDATURES - VERSION COMPLETE
  // ============================================================
async apply(createDto: CreateJobApplicationDto): Promise<JobApplication> {
  const job = await this.findOne(createDto.job_offer_id);

  if (!job.is_published) {
    throw new BadRequestException("Cette offre n'est plus disponible");
  }

  if (job.deadline && new Date(job.deadline) < new Date()) {
    throw new BadRequestException("Date limite depassee");
  }

  const existing = await this.applicationRepository.findOne({
    where: { 
      job_offer_id: createDto.job_offer_id, 
      email: createDto.email 
    },
  });

  if (existing) {
    throw new BadRequestException("Vous avez deja postule");
  }

  // Creation avec TOUS les champs
  const application = this.applicationRepository.create({
    job_offer_id: createDto.job_offer_id,
    full_name: createDto.full_name,
    email: createDto.email,
    phone: createDto.phone || null,
    address: createDto.address || null,
    experience_years: createDto.experience_years || 0,
    current_position: createDto.current_position || null,
    current_company: createDto.current_company || null,
    cv_url: createDto.cv_url || null,
    cover_letter: createDto.cover_letter || null,
    cover_letter_url: createDto.cover_letter_url || null,
    photo_url: createDto.photo_url || null,
    linkedin_url: createDto.linkedin_url || null,
    portfolio_url: createDto.portfolio_url || null,
    status: 'submitted',
  });

  const savedApplication = await this.applicationRepository.save(application);
  
  job.applications_count += 1;
  await this.jobRepository.save(job);
  
  this.logger.log(`Nouvelle candidature: ${createDto.email} pour l'offre ${createDto.job_offer_id}`);
  return savedApplication;
}

  async getAllApplications(queryDto: ApplicationQueryDto) {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<JobApplication> = {};
    if (queryDto.status) where.status = queryDto.status;
    if (queryDto.job_offer_id) where.job_offer_id = queryDto.job_offer_id;

    const [data, total] = await this.applicationRepository.findAndCount({
      where,
      relations: ['jobOffer'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });
    
    return { data, total, page, totalPages: Math.ceil(total / limit), limit };
  }

  async getApplicationsByJob(jobId: string, queryDto: ApplicationQueryDto) {
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
  }

  async getApplicationStats() {
    const total = await this.applicationRepository.count();
    const submitted = await this.applicationRepository.count({ where: { status: 'submitted' } });
    const reviewing = await this.applicationRepository.count({ where: { status: 'reviewing' } });
    const shortlisted = await this.applicationRepository.count({ where: { status: 'shortlisted' } });
    const accepted = await this.applicationRepository.count({ where: { status: 'accepted' } });
    const rejected = await this.applicationRepository.count({ where: { status: 'rejected' } });

    return { total, submitted, reviewing, shortlisted, accepted, rejected };
  }

  async updateApplicationStatus(id: string, updateDto: UpdateApplicationStatusDto): Promise<JobApplication> {
    const application = await this.applicationRepository.findOne({ where: { id } });
    if (!application) {
      throw new NotFoundException("Candidature non trouvee");
    }
    
    application.status = updateDto.status;
    if (updateDto.notes) {
      application.notes = updateDto.notes;
    }
    
    const updatedApplication = await this.applicationRepository.save(application);
    this.logger.log(`Statut candidature mis a jour: ${id} -> ${updateDto.status}`);
    return updatedApplication;
  }

  async deleteApplication(id: string): Promise<{ success: boolean; message: string }> {
    const application = await this.applicationRepository.findOne({ where: { id } });
    if (!application) {
      throw new NotFoundException("Candidature non trouvee");
    }
    await this.applicationRepository.remove(application);
    this.logger.log(`Candidature supprimee: ${id}`);
    return { success: true, message: 'Candidature supprimee avec succes' };
  }

  async exportApplicationsToCSV(jobId?: string): Promise<string> {
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
      'ID', 'ID Offre', 'Titre du poste', 'Entreprise',
      'Nom complet', 'Email', 'Telephone', 'Adresse',
      'Experience (annees)', 'Poste actuel', 'Entreprise actuelle',
      'Statut', 'Date de candidature', 'URL CV', 'Lettre motivation',
      'LinkedIn', 'Portfolio', 'Notes'
    ];

    const rows = applications.map(app => [
      app.id,
      app.job_offer_id,
      app.jobOffer?.title_fr || '',
      app.jobOffer?.company || '',
      app.full_name,
      app.email,
      app.phone || '',
      app.address || '',
      app.experience_years || 0,
      app.current_position || '',
      app.current_company || '',
      app.status,
      new Date(app.created_at).toLocaleDateString('fr-FR'),
      app.cv_url || '',
      app.cover_letter ? 'Texte saisi' : (app.cover_letter_url ? 'Fichier uploade' : ''),
      app.linkedin_url || '',
      app.portfolio_url || '',
      app.notes || ''
    ].map(escapeCsv).join(';'));

    const csvContent = [headers.map(escapeCsv).join(';'), ...rows].join('\n');
    this.logger.log(`Export CSV: ${applications.length} candidatures`);
    return csvContent;
  }
}