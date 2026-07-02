// backend/src/modules/jobs/jobs.service.ts

import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  Logger,
  ConflictException,
  ForbiddenException,
  UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, FindOptionsWhere, Like, MoreThan, Between } from 'typeorm';
import { JobOffer } from '../../entities/job-offer.entity';
import { JobApplication } from '../../entities/job-application.entity';
import { User } from '../../entities/user.entity';
import { 
  CreateJobOfferDto, 
  UpdateJobOfferDto, 
  JobOfferQueryDto,
  JobOfferResponseDto,
  JobOfferStatsDto,
  PaginatedResponseDto,
  CONTRACT_TYPES,
  JOB_STATUSES
} from './dto/job-offer.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { 
  CreateJobApplicationDto, 
  UpdateApplicationStatusDto, 
  ApplicationQueryDto,
  ApplicationResponseDto,
  ApplicationStatsResponseDto,
  ApplicationStatusEnum
} from './dto/application.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private readonly MAX_APPLICATIONS_PER_OFFER = 1000;

  constructor(
    @InjectRepository(JobOffer)
    private jobRepository: Repository<JobOffer>,
    @InjectRepository(JobApplication)
    private applicationRepository: Repository<JobApplication>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private uploadService: UploadService,
  ) {}

  // ============================================================
  // GESTION DES OFFRES
  // ============================================================

  async create(createDto: CreateJobOfferDto): Promise<JobOfferResponseDto> {
    try {
      this.validateOfferData(createDto);

      const job = this.jobRepository.create({
        title_fr: createDto.title_fr.trim(),
        title_mg: createDto.title_mg?.trim() || null,
        description_fr: createDto.description_fr.trim(),
        description_mg: createDto.description_mg?.trim() || null,
        company: createDto.company?.trim() || 'Y-Mad Madagascar',
        location: createDto.location?.trim() || 'Antananarivo',
        contract_type: createDto.contract_type as any || 'CDI',
        deadline: createDto.deadline || null,
        is_published: createDto.is_published || false,
        image_url: createDto.image_url || null,
        main_image_id: createDto.main_image_id || null,
        status: createDto.is_published ? 'published' : 'draft',
        views_count: 0,
        applications_count: 0,
      });
      
      const savedJob = await this.jobRepository.save(job);
      this.logger.log(`Offre créée: ${savedJob.title_fr} (ID: ${savedJob.id})`);
      
      return JobOfferResponseDto.fromEntity(savedJob);
    } catch (error) {
      this.logger.error(`Erreur création: ${error.message}`);
      throw new BadRequestException(`Erreur lors de la création: ${error.message}`);
    }
  }

  private validateOfferData(data: CreateJobOfferDto): void {
    if (data.title_fr && data.title_fr.length < 3) {
      throw new BadRequestException('Le titre doit contenir au moins 3 caractères');
    }
    if (data.description_fr && data.description_fr.length < 20) {
      throw new BadRequestException('La description doit contenir au moins 20 caractères');
    }
  }

  // ============================================================
  // CANDIDATURES - AVEC UTILISATEUR CONNECTE
  // ============================================================

  /**
   * ✅ Postuler à une offre (avec utilisateur connecté)
   */
  async apply(createDto: CreateJobApplicationDto, currentUser: User): Promise<ApplicationResponseDto> {
    // Vérifier que l'utilisateur est authentifié
    if (!currentUser) {
      throw new UnauthorizedException('Vous devez être connecté pour postuler.');
    }

    // Vérifier l'offre
    const job = await this.jobRepository.findOne({ 
      where: { id: createDto.job_offer_id } 
    });
    
    if (!job) {
      throw new NotFoundException('Offre non trouvée');
    }

    if (!job.is_published || job.status !== 'published') {
      throw new BadRequestException("Cette offre n'est plus disponible");
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
      throw new BadRequestException("Date limite dépassée");
    }

    // Vérifier si l'utilisateur a déjà postulé
    const existing = await this.applicationRepository.findOne({
      where: { 
        job_offer_id: createDto.job_offer_id, 
        user_id: currentUser.id 
      },
    });

    if (existing) {
      throw new ConflictException("Vous avez déjà postulé à cette offre");
    }

    // Limiter le nombre de candidatures
    const applicationCount = await this.applicationRepository.count({
      where: { job_offer_id: createDto.job_offer_id }
    });

    if (applicationCount >= this.MAX_APPLICATIONS_PER_OFFER) {
      throw new BadRequestException('Cette offre a atteint le nombre maximum de candidatures');
    }

    // Créer la candidature
    const application = this.applicationRepository.create({
      job_offer_id: createDto.job_offer_id,
      user_id: currentUser.id,
      full_name: createDto.full_name?.trim() || `${currentUser.first_name} ${currentUser.last_name}`.trim(),
      email: createDto.email?.trim()?.toLowerCase() || currentUser.email,
      phone: createDto.phone?.trim() || currentUser.phone || null,
      address: createDto.address?.trim() || null,
      experience_years: createDto.experience_years || 0,
      current_position: createDto.current_position?.trim() || null,
      current_company: createDto.current_company?.trim() || null,
      cv_url: createDto.cv_url || null,
      cover_letter: createDto.cover_letter?.trim() || null,
      cover_letter_url: createDto.cover_letter_url || null,
      photo_url: createDto.photo_url || null,
      linkedin_url: createDto.linkedin_url?.trim() || null,
      portfolio_url: createDto.portfolio_url?.trim() || null,
      diploma_url: createDto.diploma_url || null,
      attestation_url: createDto.attestation_url || null,
      applied_at: new Date(),
      status: ApplicationStatusEnum.SUBMITTED,
    });

    const savedApplication = await this.applicationRepository.save(application);
    
    // Incrémenter le compteur
    job.applications_count += 1;
    await this.jobRepository.save(job);
    
    this.logger.log(`Nouvelle candidature: ${currentUser.email} pour l'offre ${createDto.job_offer_id}`);
    return ApplicationResponseDto.fromEntity(savedApplication);
  }

  /**
   * ✅ Vérifier si l'utilisateur a déjà postulé à une offre
   */
  async hasApplied(jobId: string, userId: string): Promise<boolean> {
    const application = await this.applicationRepository.findOne({
      where: { 
        job_offer_id: jobId, 
        user_id: userId 
      },
    });
    return !!application;
  }

  /**
   * ✅ Récupérer les candidatures de l'utilisateur connecté
   */
  async getMyApplications(userId: string, queryDto: ApplicationQueryDto): Promise<PaginatedResponseDto<ApplicationResponseDto>> {
    const page = Math.max(1, queryDto.page || 1);
    const limit = Math.min(100, queryDto.limit || 10);
    const skip = (page - 1) * limit;

    const queryBuilder = this.applicationRepository.createQueryBuilder('app')
      .leftJoinAndSelect('app.jobOffer', 'jobOffer')
      .where('app.user_id = :userId', { userId });

    if (queryDto.status) {
      queryBuilder.andWhere('app.status = :status', { status: queryDto.status });
    }

    queryBuilder.orderBy('app.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const responseData = data.map(app => ApplicationResponseDto.fromEntity(app));

    return new PaginatedResponseDto(responseData, total, page, limit);
  }

  // ============================================================
  // RECHERCHE DES OFFRES
  // ============================================================

  async updateMainImage(jobId: string, imageId: string): Promise<JobOfferResponseDto> {
    const job = await this.findOne(jobId);
    job.main_image_id = imageId;
    const updatedJob = await this.jobRepository.save(job);
    this.logger.log(`Image principale mise à jour: ${jobId} -> ${imageId}`);
    return JobOfferResponseDto.fromEntity(updatedJob);
  }

  async updateImageUrl(jobId: string, imageUrl: string): Promise<JobOfferResponseDto> {
    const job = await this.findOne(jobId);
    job.image_url = imageUrl;
    const updatedJob = await this.jobRepository.save(job);
    this.logger.log(`URL image mise à jour: ${jobId}`);
    return JobOfferResponseDto.fromEntity(updatedJob);
  }

  async findAll(queryDto: JobOfferQueryDto): Promise<PaginatedResponseDto<JobOfferResponseDto>> {
    const page = Math.max(1, queryDto.page || 1);
    const limit = Math.min(100, queryDto.limit || 10);
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<JobOffer> = {};
    
    if (queryDto.status) where.status = queryDto.status;
    if (queryDto.is_published !== undefined) where.is_published = queryDto.is_published;
    if (queryDto.contract_type) where.contract_type = queryDto.contract_type as any;
    if (queryDto.search) {
      where.title_fr = Like(`%${queryDto.search}%`);
    }

    const [data, total] = await this.jobRepository.findAndCount({
      where,
      order: { 
        [queryDto.sortBy || 'created_at']: queryDto.sortOrder || 'DESC' 
      },
      skip,
      take: limit,
    });

    const enrichedData = await this.enrichJobsWithImages(data);
    const responseData = enrichedData.map(job => JobOfferResponseDto.fromEntity(job));

    return new PaginatedResponseDto(responseData, total, page, limit);
  }

  async findPublished(queryDto: JobOfferQueryDto): Promise<PaginatedResponseDto<JobOfferResponseDto>> {
    const page = Math.max(1, queryDto.page || 1);
    const limit = Math.min(100, queryDto.limit || 10);
    const skip = (page - 1) * limit;
    const now = new Date();

    const queryBuilder = this.jobRepository.createQueryBuilder('job')
      .where('job.is_published = :isPublished', { isPublished: true })
      .andWhere('job.status = :status', { status: 'published' })
      .andWhere('(job.deadline IS NULL OR job.deadline > :now)', { now })
      .orderBy('job.created_at', 'DESC');

    if (queryDto.contract_type) {
      queryBuilder.andWhere('job.contract_type = :contractType', { 
        contractType: queryDto.contract_type 
      });
    }
    if (queryDto.search) {
      queryBuilder.andWhere('(job.title_fr LIKE :search OR job.title_mg LIKE :search)', { 
        search: `%${queryDto.search}%` 
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const enrichedData = await this.enrichJobsWithImages(data);
    const responseData = enrichedData.map(job => JobOfferResponseDto.fromEntity(job));

    return new PaginatedResponseDto(responseData, total, page, limit);
  }

  async findFeatured(): Promise<JobOfferResponseDto[]> {
    const now = new Date();
    const offers = await this.jobRepository.find({
      where: { 
        is_published: true, 
        status: 'published',
      },
      order: { created_at: 'DESC' },
      take: 6,
    });
    
    const enrichedData = await this.enrichJobsWithImages(offers);
    return enrichedData.map(job => JobOfferResponseDto.fromEntity(job));
  }

  async findOne(id: string): Promise<JobOffer> {
    if (!id || id.length < 10) {
      throw new BadRequestException('ID invalide');
    }
    
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Offre avec l'ID ${id} non trouvée`);
    }
    return job;
  }

  async findOnePublic(id: string): Promise<JobOffer | null> {
    try {
      const job = await this.jobRepository.findOne({
        where: { 
          id, 
          is_published: true, 
          status: 'published' 
        }
      });
      return job;
    } catch (error) {
      return null;
    }
  }

  async findOneWithImages(id: string): Promise<JobOfferResponseDto> {
    const job = await this.findOne(id);
    const enriched = await this.enrichJobWithImages(job);
    return JobOfferResponseDto.fromEntity(enriched);
  }

  async findOnePublicWithImages(id: string): Promise<JobOfferResponseDto> {
    const job = await this.findOnePublic(id);
    if (!job) {
      throw new NotFoundException(`Offre avec l'ID ${id} non trouvée`);
    }
    const enriched = await this.enrichJobWithImages(job);
    return JobOfferResponseDto.fromEntity(enriched);
  }

  private async enrichJobsWithImages(jobs: JobOffer[]): Promise<any[]> {
    return Promise.all(jobs.map(job => this.enrichJobWithImages(job)));
  }

  private async enrichJobWithImages(job: JobOffer): Promise<any> {
    const baseUrl = process.env.API_URL || 'http://localhost:4001';
    let mainImageUrl = null;
    const images = [];

    if (job.main_image_id) {
      try {
        const file = await this.uploadService.getFileById(job.main_image_id);
        mainImageUrl = `${baseUrl}${this.uploadService.getImageUrl(file.id)}`;
        images.push({
          id: file.id,
          url: mainImageUrl,
          isMain: true,
          fileName: file.filename,
          originalName: file.originalName,
          fileSize: file.size,
          format: file.format,
        });
      } catch (error) {
        this.logger.warn(`Image principale non trouvée: ${job.main_image_id}`);
      }
    }

    try {
      const otherFiles = await this.uploadService.getFilesByEntity('job', job.id);
      for (const file of otherFiles) {
        if (file.id !== job.main_image_id) {
          images.push({
            id: file.id,
            url: `${baseUrl}${this.uploadService.getImageUrl(file.id)}`,
            isMain: false,
            fileName: file.filename,
            originalName: file.originalName,
            fileSize: file.size,
            format: file.format,
          });
        }
      }
    } catch (error) {
      this.logger.warn(`Erreur récupération images: ${error.message}`);
    }

    return {
      ...job,
      mainImageUrl,
      images,
    };
  }

  async update(id: string, updateDto: UpdateJobOfferDto): Promise<JobOfferResponseDto> {
    const job = await this.findOne(id);
    
    const allowedFields = [
      'title_fr', 'title_mg', 'description_fr', 'description_mg',
      'company', 'location', 'contract_type', 'deadline', 'image_url',
      'main_image_id'
    ];

    for (const field of allowedFields) {
      if (updateDto[field] !== undefined) {
        (job as any)[field] = updateDto[field];
      }
    }
    
    if (updateDto.is_published !== undefined) {
      job.is_published = updateDto.is_published;
      job.status = updateDto.is_published ? 'published' : 'draft';
    }
    
    const updatedJob = await this.jobRepository.save(job);
    this.logger.log(`Offre mise à jour: ${id}`);
    return JobOfferResponseDto.fromEntity(updatedJob);
  }

  async updateStatus(id: string, updateDto: UpdateJobStatusDto): Promise<JobOfferResponseDto> {
    const job = await this.findOne(id);
    const newStatus = updateDto.status;
    
    if (!JOB_STATUSES.includes(newStatus)) {
      throw new BadRequestException('Statut invalide');
    }

    job.status = newStatus;
    job.is_published = newStatus === 'published';
    const updatedJob = await this.jobRepository.save(job);
    this.logger.log(`Statut mis à jour: ${id} -> ${newStatus}`);
    return JobOfferResponseDto.fromEntity(updatedJob);
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const job = await this.findOne(id);
    await this.jobRepository.remove(job);
    this.logger.log(`Offre supprimée: ${id}`);
    return { success: true, message: 'Offre supprimée avec succès' };
  }

  async getStats(): Promise<JobOfferStatsDto> {
    const total = await this.jobRepository.count();
    const published = await this.jobRepository.count({ 
      where: { is_published: true, status: 'published' } 
    });
    const draft = await this.jobRepository.count({ 
      where: { is_published: false } 
    });
    const expired = await this.jobRepository.count({ 
      where: { deadline: LessThan(new Date()) } 
    });
    const closed = await this.jobRepository.count({ 
      where: { status: 'closed' } 
    });
    const archived = await this.jobRepository.count({ 
      where: { status: 'archived' } 
    });
    
    const viewsResult = await this.jobRepository
      .createQueryBuilder('job')
      .select('SUM(job.views_count)', 'total')
      .getRawOne();
    const totalViews = parseInt(viewsResult?.total) || 0;
    
    const totalApplications = await this.applicationRepository.count();

    const contractsByType: Record<string, number> = {};
    for (const type of CONTRACT_TYPES) {
      const count = await this.jobRepository.count({ 
        where: { contract_type: type as any } 
      });
      if (count > 0) {
        contractsByType[type] = count;
      }
    }

    return new JobOfferStatsDto({
      total,
      published,
      draft,
      expired,
      closed,
      archived,
      total_views: totalViews,
      total_applications: totalApplications,
      contracts_by_type: contractsByType,
    });
  }

  // ============================================================
  // GESTION DES CANDIDATURES (ADMIN)
  // ============================================================

  async getAllApplications(queryDto: ApplicationQueryDto): Promise<PaginatedResponseDto<ApplicationResponseDto>> {
    const page = Math.max(1, queryDto.page || 1);
    const limit = Math.min(100, queryDto.limit || 10);
    const skip = (page - 1) * limit;

    const queryBuilder = this.applicationRepository.createQueryBuilder('app')
      .leftJoinAndSelect('app.jobOffer', 'jobOffer')
      .where('1=1');

    if (queryDto.status) {
      queryBuilder.andWhere('app.status = :status', { status: queryDto.status });
    }
    if (queryDto.job_offer_id) {
      queryBuilder.andWhere('app.job_offer_id = :jobId', { jobId: queryDto.job_offer_id });
    }
    if (queryDto.search) {
      queryBuilder.andWhere(
        '(app.full_name ILIKE :search OR app.email ILIKE :search OR app.current_position ILIKE :search)', 
        { search: `%${queryDto.search}%` }
      );
    }

    queryBuilder.orderBy('app.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const responseData = data.map(app => ApplicationResponseDto.fromEntity(app));

    return new PaginatedResponseDto(responseData, total, page, limit);
  }

  async getApplicationsByJob(jobId: string, queryDto: ApplicationQueryDto): Promise<PaginatedResponseDto<ApplicationResponseDto>> {
    const page = Math.max(1, queryDto.page || 1);
    const limit = Math.min(100, queryDto.limit || 10);
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

    const responseData = data.map(app => ApplicationResponseDto.fromEntity(app));

    return new PaginatedResponseDto(responseData, total, page, limit);
  }

  async getApplicationStats(): Promise<ApplicationStatsResponseDto> {
    const total = await this.applicationRepository.count();
    const submitted = await this.applicationRepository.count({ 
      where: { status: ApplicationStatusEnum.SUBMITTED } 
    });
    const reviewing = await this.applicationRepository.count({ 
      where: { status: ApplicationStatusEnum.REVIEWING } 
    });
    const shortlisted = await this.applicationRepository.count({ 
      where: { status: ApplicationStatusEnum.SHORTLISTED } 
    });
    const accepted = await this.applicationRepository.count({ 
      where: { status: ApplicationStatusEnum.ACCEPTED } 
    });
    const rejected = await this.applicationRepository.count({ 
      where: { status: ApplicationStatusEnum.REJECTED } 
    });

    return new ApplicationStatsResponseDto({
      total,
      submitted,
      reviewing,
      shortlisted,
      accepted,
      rejected
    });
  }

  async updateApplicationStatus(id: string, updateDto: UpdateApplicationStatusDto): Promise<ApplicationResponseDto> {
    const application = await this.applicationRepository.findOne({ 
      where: { id },
      relations: ['jobOffer']
    });
    
    if (!application) {
      throw new NotFoundException("Candidature non trouvée");
    }
    
    application.status = updateDto.status;
    if (updateDto.notes) {
      application.notes = updateDto.notes;
    }
    
    const updatedApplication = await this.applicationRepository.save(application);
    this.logger.log(`Statut candidature mis à jour: ${id} -> ${updateDto.status}`);
    return ApplicationResponseDto.fromEntity(updatedApplication);
  }

  async deleteApplication(id: string): Promise<{ success: boolean; message: string }> {
    const application = await this.applicationRepository.findOne({ 
      where: { id } 
    });
    
    if (!application) {
      throw new NotFoundException("Candidature non trouvée");
    }
    
    await this.applicationRepository.remove(application);
    this.logger.log(`Candidature supprimée: ${id}`);
    return { success: true, message: 'Candidature supprimée avec succès' };
  }

  async exportApplicationsToCSV(jobId?: string): Promise<string> {
    const where: any = {};
    if (jobId) where.job_offer_id = jobId;

    const applications = await this.applicationRepository.find({
      where,
      relations: ['jobOffer'],
      order: { created_at: 'DESC' },
    });

    if (applications.length === 0) {
      return 'Aucune candidature à exporter';
    }

    const escapeCsv = (str: any): string => {
      if (str === null || str === undefined) return '';
      const stringValue = String(str);
      if (stringValue.includes(';') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const headers = [
      'ID', 'ID Offre', 'Titre du poste', 'Entreprise',
      'Nom complet', 'Email', 'Téléphone', 'Adresse',
      'Expérience (années)', 'Poste actuel', 'Entreprise actuelle',
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
      app.cover_letter ? 'Texte saisi' : (app.cover_letter_url ? 'Fichier uploadé' : ''),
      app.linkedin_url || '',
      app.portfolio_url || '',
      app.notes || ''
    ].map(escapeCsv).join(';'));

    const csvContent = [headers.map(escapeCsv).join(';'), ...rows].join('\n');
    this.logger.log(`Export CSV: ${applications.length} candidatures`);
    return csvContent;
  }
}