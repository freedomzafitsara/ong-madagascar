import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { JobOffer, JobStatus, JobType } from '../../entities/job-offer.entity';
import { JobApplication, ApplicationStatus } from '../../entities/job-application.entity';
import { CreateJobOfferDto, UpdateJobOfferDto } from './dto/job-offer.dto';
import { CreateJobApplicationDto } from './dto/job-application.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(JobOffer)
    private jobOfferRepository: Repository<JobOffer>,
    @InjectRepository(JobApplication)
    private applicationRepository: Repository<JobApplication>,
  ) {}

  // ==================== OFFRE D'EMPLOI ====================

  async createJobOffer(createJobOfferDto: CreateJobOfferDto, userId: string) {
    const jobOffer = this.jobOfferRepository.create({
      ...createJobOfferDto,
      createdBy: userId,
      status: JobStatus.DRAFT,
    });
    return this.jobOfferRepository.save(jobOffer);
  }

  async findAllJobOffers(page: number = 1, limit: number = 10, jobType?: string, sector?: string, region?: string, search?: string) {
    const skip = (page - 1) * limit;
    const query: any = { status: JobStatus.PUBLISHED };
    
    if (jobType && jobType !== 'all') query.jobType = jobType;
    if (sector && sector !== 'all') query.sector = sector;
    if (region && region !== 'all') query.region = region;
    if (search) query.title = Like(`%${search}%`);

    const [data, total] = await this.jobOfferRepository.findAndCount({
      where: query,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findJobOfferById(id: string) {
    const jobOffer = await this.jobOfferRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!jobOffer) throw new NotFoundException('Offre d\'emploi non trouvée');
    return jobOffer;
  }

  async findFeaturedJobOffers() {
    return this.jobOfferRepository.find({
      where: { isFeatured: true, status: JobStatus.PUBLISHED },
      order: { createdAt: 'DESC' },
      take: 3,
    });
  }

  async updateJobOffer(id: string, updateJobOfferDto: UpdateJobOfferDto) {
    await this.jobOfferRepository.update(id, updateJobOfferDto);
    return this.findJobOfferById(id);
  }

  async updateJobOfferStatus(id: string, status: string) {
    await this.jobOfferRepository.update(id, { status });
    return this.findJobOfferById(id);
  }

  async deleteJobOffer(id: string) {
    await this.jobOfferRepository.delete(id);
    return { success: true, message: 'Offre supprimée avec succès' };
  }

  async getJobOffersStats() {
    const total = await this.jobOfferRepository.count();
    const published = await this.jobOfferRepository.count({ where: { status: JobStatus.PUBLISHED } });
    const closed = await this.jobOfferRepository.count({ where: { status: JobStatus.CLOSED } });
    const totalApplications = await this.applicationRepository.count();
    
    return { total, published, closed, totalApplications };
  }

  // ==================== CANDIDATURES ====================

  async applyToJob(createApplicationDto: CreateJobApplicationDto, userId: string | null, cvFile?: Express.Multer.File, photoFile?: Express.Multer.File, diplomaFile?: Express.Multer.File) {
    const jobOffer = await this.findJobOfferById(createApplicationDto.jobOfferId);
    
    if (jobOffer.status !== JobStatus.PUBLISHED) {
      throw new BadRequestException('Cette offre n\'est plus disponible');
    }
    
    if (jobOffer.deadline && new Date(jobOffer.deadline) < new Date()) {
      throw new BadRequestException('La date limite de candidature est dépassée');
    }

    const existing = await this.applicationRepository.findOne({
      where: { jobOfferId: createApplicationDto.jobOfferId, email: createApplicationDto.email },
    });
    if (existing) {
      throw new BadRequestException('Vous avez déjà postulé à cette offre');
    }

    let cvUrl = null;
    let photoUrl = null;
    let diplomaUrl = null;

    // Ici vous pouvez ajouter l'upload vers Cloudinary ou autre service
    // Pour l'instant, on simule l'upload

    const application = this.applicationRepository.create({
      ...createApplicationDto,
      userId: userId || null,
      cvUrl: cvUrl || '/uploads/cv/demo.pdf',
      photoUrl: photoUrl || null,
      diplomaUrl: diplomaUrl || null,
      status: ApplicationStatus.SUBMITTED,
    });

    await this.applicationRepository.save(application);
    
    // Incrémenter le compteur de candidatures
    jobOffer.applicationsCount += 1;
    await this.jobOfferRepository.save(jobOffer);

    return { success: true, message: 'Candidature envoyée avec succès', application };
  }

  async getApplicationsByJob(jobOfferId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.applicationRepository.findAndCount({
      where: { jobOfferId },
      relations: ['user'],
      order: { appliedAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getUserApplications(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.applicationRepository.findAndCount({
      where: { userId },
      relations: ['jobOffer'],
      order: { appliedAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getApplicationById(id: string) {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['jobOffer', 'user'],
    });
    if (!application) throw new NotFoundException('Candidature non trouvée');
    return application;
  }

  async updateApplicationStatus(id: string, status: string) {
    await this.applicationRepository.update(id, { status });
    return this.getApplicationById(id);
  }

  async getAllApplications(page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;
    const query: any = {};
    if (status) query.status = status;

    const [data, total] = await this.applicationRepository.findAndCount({
      where: query,
      relations: ['jobOffer', 'user'],
      order: { appliedAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }
}