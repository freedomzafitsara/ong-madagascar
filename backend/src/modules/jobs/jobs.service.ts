import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { JobOffer, JobStatus } from '../../entities/job-offer.entity';
import { JobApplication, ApplicationStatus } from '../../entities/job-application.entity';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(JobOffer)
    private jobOfferRepository: Repository<JobOffer>,
    @InjectRepository(JobApplication)
    private jobApplicationRepository: Repository<JobApplication>,
  ) {}

  // ========== OFFRES D'EMPLOI ==========
  
  async createOffer(createDto: CreateJobOfferDto, userId: string): Promise<JobOffer> {
    const offer = this.jobOfferRepository.create({
      ...createDto,
      createdBy: userId,
    });
    return this.jobOfferRepository.save(offer);
  }

  async findAllOffers(
    page: number = 1,
    limit: number = 10,
    status?: string,
    jobType?: string,
    sector?: string,
    region?: string,
    search?: string,
  ): Promise<{ data: JobOffer[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (status && status !== 'all') query.status = status;
    if (jobType && jobType !== 'all') query.jobType = jobType;
    if (sector && sector !== 'all') query.sector = sector;
    if (region && region !== 'all') query.region = region;
    if (search) query.title = Like(`%${search}%`);

    const [data, total] = await this.jobOfferRepository.findAndCount({
      where: query,
      order: { createdAt: 'DESC' },  // ✅ Utiliser createdAt (camelCase)
      skip,
      take: limit,
    });

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOneOffer(id: string): Promise<JobOffer> {
    const offer = await this.jobOfferRepository.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Offre non trouvée');
    return offer;
  }

  async updateOffer(id: string, updateDto: UpdateJobOfferDto, userRole: string, userId: string): Promise<JobOffer> {
    const offer = await this.findOneOffer(id);

    if (userRole !== 'super_admin' && userRole !== 'admin' && offer.createdBy !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier cette offre');
    }

    await this.jobOfferRepository.update(id, updateDto);
    return this.findOneOffer(id);
  }

  async updateOfferStatus(id: string, status: JobStatus, userRole: string): Promise<JobOffer> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Seul un administrateur peut modifier le statut');
    }
    await this.jobOfferRepository.update(id, { status });
    return this.findOneOffer(id);
  }

  async deleteOffer(id: string, userRole: string): Promise<void> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Seul un administrateur peut supprimer une offre');
    }
    await this.jobOfferRepository.delete(id);
  }

  async getFeaturedOffers(): Promise<JobOffer[]> {
    return this.jobOfferRepository.find({
      where: { is_featured: true, status: JobStatus.PUBLISHED },
      order: { createdAt: 'DESC' },
      take: 3,
    });
  }

  async getStats(): Promise<{
    total: number;
    published: number;
    closed: number;
    expired: number;
    totalApplications: number;
    pendingApplications: number;
  }> {
    const total = await this.jobOfferRepository.count();
    const published = await this.jobOfferRepository.count({ where: { status: JobStatus.PUBLISHED } });
    const closed = await this.jobOfferRepository.count({ where: { status: JobStatus.CLOSED } });
    const expired = await this.jobOfferRepository.count({ where: { status: JobStatus.EXPIRED } });
    
    const totalApplications = await this.jobApplicationRepository.count();
    const pendingApplications = await this.jobApplicationRepository.count({ 
      where: { status: ApplicationStatus.SUBMITTED } 
    });

    return { total, published, closed, expired, totalApplications, pendingApplications };
  }

  // ========== CANDIDATURES ==========

  async apply(createDto: CreateJobApplicationDto, userId?: string): Promise<JobApplication> {
    // Vérifier si l'offre existe et est publiée
    const offer = await this.findOneOffer(createDto.jobOfferId);
    if (offer.status !== JobStatus.PUBLISHED) {
      throw new BadRequestException('Cette offre n\'est plus disponible');
    }

    // Vérifier la date limite
    if (new Date(offer.deadline) < new Date()) {
      throw new BadRequestException('La date limite de candidature est dépassée');
    }

    // Vérifier les doublons
    const existing = await this.jobApplicationRepository.findOne({
      where: { jobOfferId: createDto.jobOfferId, email: createDto.email },
    });
    if (existing) {
      throw new BadRequestException('Vous avez déjà postulé à cette offre');
    }

    const application = this.jobApplicationRepository.create({
      ...createDto,
      userId: userId || null,
    });

    const saved = await this.jobApplicationRepository.save(application);

    // Incrémenter le compteur de candidatures
    await this.jobOfferRepository.increment({ id: createDto.jobOfferId }, 'applications_count', 1);

    return saved;
  }

  async getApplicationsByOffer(offerId: string): Promise<JobApplication[]> {
    await this.findOneOffer(offerId);
    return this.jobApplicationRepository.find({
      where: { jobOfferId: offerId },
      order: { createdAt: 'DESC' },  // ✅ Utiliser createdAt
    });
  }

  async getApplicationById(id: string): Promise<JobApplication> {
    const application = await this.jobApplicationRepository.findOne({ where: { id } });
    if (!application) throw new NotFoundException('Candidature non trouvée');
    return application;
  }

  async updateApplicationStatus(id: string, status: ApplicationStatus, userRole: string): Promise<JobApplication> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Seul un administrateur peut modifier le statut');
    }
    await this.jobApplicationRepository.update(id, { status });
    return this.getApplicationById(id);
  }

  async getMyApplications(userId: string): Promise<JobApplication[]> {
    return this.jobApplicationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },  // ✅ Utiliser createdAt
      relations: ['jobOffer'],
    });
  }

  async getAllApplications(): Promise<JobApplication[]> {
    return this.jobApplicationRepository.find({
      order: { createdAt: 'DESC' },  // ✅ Utiliser createdAt
      relations: ['jobOffer'],
    });
  }

  async getApplicationsByStatus(status: ApplicationStatus): Promise<JobApplication[]> {
    return this.jobApplicationRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },  // ✅ Utiliser createdAt
      relations: ['jobOffer'],
    });
  }
}