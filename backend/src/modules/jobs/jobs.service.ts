import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { JobOffer, JobStatus, JobType } from '../../entities/job-offer.entity';
import { JobApplication, ApplicationStatus } from '../../entities/job-application.entity';
import { CreateJobOfferDto, UpdateJobOfferDto } from './dto/create-job-offer.dto';
import { CreateJobApplicationDto, UpdateApplicationStatusDto } from './dto/create-job-application.dto';

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
      const job = new JobOffer();
      job.title = createDto.title;
      job.title_mg = createDto.title_mg;
      job.description = createDto.description;
      job.description_mg = createDto.description_mg;
      job.company_name = createDto.company_name;
      job.image_url = createDto.image_url;
      job.location = createDto.location;
      job.region = createDto.region;
      job.job_type = createDto.job_type;
      job.sector = createDto.sector;
      job.salary = createDto.salary;
      job.requirements = createDto.requirements;
      job.requirements_mg = createDto.requirements_mg;
      job.benefits = createDto.benefits;
      job.deadline = createDto.deadline;
      job.is_featured = createDto.is_featured || false;
      job.contact_email = createDto.contact_email;
      job.contact_phone = createDto.contact_phone;
      job.status = createDto.status || JobStatus.DRAFT;
      job.created_by = userId;
      job.applications_count = 0;
      
      const savedJob = await this.jobRepository.save(job);
      this.logger.log(`Offre d emploi créée: ${savedJob.title} par ${userId}`);
      return savedJob;
    } catch (error) {
      this.logger.error(`Erreur lors de la création de l offre: ${error.message}`);
      throw new BadRequestException(`Erreur lors de la création: ${error.message}`);
    }
  }

  async findAll(page: number = 1, limit: number = 10, status?: string, jobType?: string, search?: string, region?: string) {
    try {
      const skip = (page - 1) * limit;
      const query = this.jobRepository.createQueryBuilder('job');

      if (status && status !== 'all') {
        query.andWhere('job.status = :status', { status });
      }

      if (jobType && jobType !== 'all') {
        query.andWhere('job.job_type = :jobType', { jobType });
      }

      if (region && region !== 'all') {
        query.andWhere('job.region = :region', { region });
      }

      if (search) {
        query.andWhere('(job.title ILIKE :search OR job.company_name ILIKE :search OR job.description ILIKE :search)', {
          search: `%${search}%`,
        });
      }

      const [data, total] = await query
        .orderBy('job.created_at', 'DESC')
        .addOrderBy('job.is_featured', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return { data, total, page, totalPages: Math.ceil(total / limit), limit };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des offres: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0, limit };
    }
  }

  async findPublished(page: number = 1, limit: number = 9, jobType?: string, region?: string) {
    try {
      const skip = (page - 1) * limit;
      const now = new Date();

      const query = this.jobRepository.createQueryBuilder('job')
        .where('job.status = :status', { status: JobStatus.PUBLISHED })
        .andWhere('(job.deadline IS NULL OR job.deadline > :now)', { now });

      if (jobType && jobType !== 'all') {
        query.andWhere('job.job_type = :jobType', { jobType });
      }

      if (region && region !== 'all') {
        query.andWhere('job.region = :region', { region });
      }

      const [data, total] = await query
        .orderBy('job.is_featured', 'DESC')
        .addOrderBy('job.created_at', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return { data, total, page, totalPages: Math.ceil(total / limit), limit };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des offres publiées: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0, limit };
    }
  }

  async findFeatured(): Promise<JobOffer[]> {
    try {
      const now = new Date();
      return await this.jobRepository.find({
        where: {
          status: JobStatus.PUBLISHED,
          is_featured: true,
          deadline: MoreThan(now),
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
      throw new NotFoundException(`Offre d emploi avec l identifiant ${id} non trouvée`);
    }
    return job;
  }

  async update(id: string, updateDto: UpdateJobOfferDto): Promise<JobOffer> {
    try {
      const job = await this.findOne(id);
      
      if (updateDto.title !== undefined) job.title = updateDto.title;
      if (updateDto.title_mg !== undefined) job.title_mg = updateDto.title_mg;
      if (updateDto.description !== undefined) job.description = updateDto.description;
      if (updateDto.description_mg !== undefined) job.description_mg = updateDto.description_mg;
      if (updateDto.company_name !== undefined) job.company_name = updateDto.company_name;
      if (updateDto.image_url !== undefined) job.image_url = updateDto.image_url;
      if (updateDto.location !== undefined) job.location = updateDto.location;
      if (updateDto.region !== undefined) job.region = updateDto.region;
      if (updateDto.job_type !== undefined) job.job_type = updateDto.job_type;
      if (updateDto.sector !== undefined) job.sector = updateDto.sector;
      if (updateDto.salary !== undefined) job.salary = updateDto.salary;
      if (updateDto.requirements !== undefined) job.requirements = updateDto.requirements;
      if (updateDto.requirements_mg !== undefined) job.requirements_mg = updateDto.requirements_mg;
      if (updateDto.benefits !== undefined) job.benefits = updateDto.benefits;
      if (updateDto.deadline !== undefined) job.deadline = updateDto.deadline;
      if (updateDto.is_featured !== undefined) job.is_featured = updateDto.is_featured;
      if (updateDto.contact_email !== undefined) job.contact_email = updateDto.contact_email;
      if (updateDto.contact_phone !== undefined) job.contact_phone = updateDto.contact_phone;
      if (updateDto.status !== undefined) job.status = updateDto.status;
      
      const updatedJob = await this.jobRepository.save(job);
      this.logger.log(`Offre d emploi mise à jour: ${updatedJob.id}`);
      return updatedJob;
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de l offre: ${error.message}`);
      throw new BadRequestException(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  async updateStatus(id: string, status: JobStatus): Promise<JobOffer> {
    try {
      const job = await this.findOne(id);
      job.status = status;
      const updatedJob = await this.jobRepository.save(job);
      this.logger.log(`Statut de l offre mis à jour: ${id} -> ${status}`);
      return updatedJob;
    } catch (error) {
      this.logger.error(`Erreur lors du changement de statut: ${error.message}`);
      throw new BadRequestException(`Erreur lors du changement de statut: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    const job = await this.findOne(id);
    await this.jobRepository.remove(job);
    this.logger.log(`Offre d emploi supprimée: ${id}`);
  }

  async getStats() {
    try {
      const now = new Date();
      const total = await this.jobRepository.count();
      const published = await this.jobRepository.count({ where: { status: JobStatus.PUBLISHED } });
      const draft = await this.jobRepository.count({ where: { status: JobStatus.DRAFT } });
      const closed = await this.jobRepository.count({ where: { status: JobStatus.CLOSED } });
      const expired = await this.jobRepository.count({ 
        where: { 
          status: JobStatus.PUBLISHED,
          deadline: LessThan(now),
        } 
      });
      const featured = await this.jobRepository.count({ where: { is_featured: true } });

      const totalApplications = await this.applicationRepository.count();
      const pendingApplications = await this.applicationRepository.count({ 
        where: { status: ApplicationStatus.SUBMITTED } 
      });

      return { 
        total, 
        published, 
        draft, 
        closed, 
        expired, 
        featured, 
        totalApplications, 
        pendingApplications 
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des statistiques: ${error.message}`);
      return { 
        total: 0, 
        published: 0, 
        draft: 0, 
        closed: 0, 
        expired: 0, 
        featured: 0, 
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

      if (job.status !== JobStatus.PUBLISHED) {
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

      const application = new JobApplication();
      application.job_offer_id = createDto.job_offer_id;
      application.user_id = userId;
      application.full_name = createDto.full_name;
      application.email = createDto.email;
      application.phone = createDto.phone;
      application.address = createDto.address;
      application.experience_years = createDto.experience_years;
      application.cover_letter = createDto.cover_letter || createDto.message;
      application.cv_url = files?.cv?.[0]?.path || files?.cv_url;
      application.photo_url = files?.photo?.[0]?.path;
      application.diploma_url = files?.diploma?.[0]?.path;
      application.attestation_url = files?.attestation?.[0]?.path;
      application.status = ApplicationStatus.SUBMITTED;

      const savedApplication = await this.applicationRepository.save(application);

      job.applications_count += 1;
      await this.jobRepository.save(job);

      this.logger.log(`Nouvelle candidature pour l offre ${createDto.job_offer_id} par ${createDto.email}`);
      return savedApplication;
    } catch (error) {
      this.logger.error(`Erreur lors de la candidature: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  async getApplicationsByJob(jobId: string, page: number = 1, limit: number = 10, status?: string) {
    try {
      const skip = (page - 1) * limit;
      const query = this.applicationRepository.createQueryBuilder('app')
        .where('app.job_offer_id = :jobId', { jobId })
        .leftJoinAndSelect('app.jobOffer', 'jobOffer')
        .orderBy('app.created_at', 'DESC');

      if (status && status !== 'all') {
        query.andWhere('app.status = :status', { status });
      }

      const [data, total] = await query.skip(skip).take(limit).getManyAndCount();
      return { data, total, page, totalPages: Math.ceil(total / limit), limit };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des candidatures pour l offre: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0, limit };
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

  async getUserApplications(userId: string, page: number = 1, limit: number = 10) {
    try {
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
      this.logger.error(`Erreur lors de la récupération des candidatures de l utilisateur: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0, limit };
    }
  }

  async getAllApplications(page: number = 1, limit: number = 10, status?: string) {
    try {
      const skip = (page - 1) * limit;
      const query = this.applicationRepository.createQueryBuilder('app')
        .leftJoinAndSelect('app.jobOffer', 'jobOffer')
        .orderBy('app.created_at', 'DESC');

      if (status && status !== 'all') {
        query.andWhere('app.status = :status', { status });
      }

      const [data, total] = await query.skip(skip).take(limit).getManyAndCount();
      return { data, total, page, totalPages: Math.ceil(total / limit), limit };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de toutes les candidatures: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0, limit };
    }
  }
}