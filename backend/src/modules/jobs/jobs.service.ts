import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { JobOffer } from './entities/job-offer.entity';
import { JobApplication } from './entities/job-application.entity';
import { CreateJobOfferDto, UpdateJobOfferDto, CreateJobApplicationDto } from './dto/job.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(JobOffer)
    private jobOfferRepository: Repository<JobOffer>,
    @InjectRepository(JobApplication)
    private jobApplicationRepository: Repository<JobApplication>,
  ) {}

  async findAllOffers(query: any) {
    const { page = 1, limit = 10, status = 'published', jobType, region, sector, search } = query;
    const skip = (page - 1) * limit;
    
    const where: any = { status };
    if (jobType) where.jobType = jobType;
    if (region) where.region = region;
    if (sector) where.sector = sector;
    if (search) where.title = Like(`%${search}%`);
    
    // Sélectionner uniquement les colonnes qui existent dans la base
    const [data, total] = await this.jobOfferRepository.findAndCount({
      select: ['id', 'title', 'description', 'companyName', 'location', 'region', 'jobType', 'status', 'applicationsCount', 'isFeatured', 'createdAt', 'deadline'],
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    
    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOfferById(id: string): Promise<JobOffer> {
    const offer = await this.jobOfferRepository.findOne({
      where: { id },
    });
    
    if (!offer) {
      throw new NotFoundException(`Offre d'emploi avec l'ID ${id} non trouvée`);
    }
    
    return offer;
  }

  async createOffer(createDto: CreateJobOfferDto): Promise<JobOffer> {
    const offer = this.jobOfferRepository.create({
      title: createDto.title,
      description: createDto.description,
      companyName: createDto.companyName,
      location: createDto.location,
      region: createDto.region,
      jobType: createDto.jobType || 'cdi',
      deadline: createDto.deadline,
      isFeatured: createDto.isFeatured || false,
      status: 'published',
    });
    
    return await this.jobOfferRepository.save(offer);
  }

  async updateOffer(id: string, updateDto: UpdateJobOfferDto): Promise<JobOffer> {
    await this.findOfferById(id);
    await this.jobOfferRepository.update(id, updateDto);
    return this.findOfferById(id);
  }

  async deleteOffer(id: string): Promise<void> {
    const offer = await this.findOfferById(id);
    await this.jobOfferRepository.remove(offer);
  }

  async updateOfferStatus(id: string, status: string): Promise<JobOffer> {
    await this.findOfferById(id);
    await this.jobOfferRepository.update(id, { status });
    return this.findOfferById(id);
  }

  async findApplicationsByOffer(offerId: string, query: any) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;
    
    await this.findOfferById(offerId);
    
    const where: any = { jobOffer: { id: offerId } };
    if (status) where.status = status;
    
    const [data, total] = await this.jobApplicationRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    
    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  async createApplication(offerId: string, createDto: CreateJobApplicationDto): Promise<JobApplication> {
    const offer = await this.findOfferById(offerId);
    
    if (offer.status !== 'published') {
      throw new BadRequestException('Cette offre n\'est plus disponible');
    }
    
    const existing = await this.jobApplicationRepository.findOne({
      where: {
        jobOffer: { id: offerId },
        email: createDto.email,
      },
    });
    
    if (existing) {
      throw new BadRequestException('Vous avez déjà postulé à cette offre');
    }
    
    const application = this.jobApplicationRepository.create({
      fullName: createDto.fullName,
      email: createDto.email,
      phone: createDto.phone,
      address: createDto.address,
      experienceYears: createDto.experienceYears,
      coverLetter: createDto.coverLetter,
      photoUrl: createDto.photoUrl,
      cvUrl: createDto.cvUrl,
      diplomaUrl: createDto.diplomaUrl,
      attestationUrl: createDto.attestationUrl,
      jobOffer: { id: offerId },
      status: 'submitted',
    });
    
    const saved = await this.jobApplicationRepository.save(application);
    
    await this.jobOfferRepository.update(offerId, {
      applicationsCount: () => 'applications_count + 1',
    });
    
    return saved;
  }

  async updateApplicationStatus(id: string, status: string, notes?: string): Promise<JobApplication> {
    const application = await this.jobApplicationRepository.findOne({
      where: { id },
    });
    
    if (!application) {
      throw new NotFoundException('Candidature non trouvée');
    }
    
    application.status = status;
    if (notes) application.notes = notes;
    application.reviewedAt = new Date();
    
    return await this.jobApplicationRepository.save(application);
  }
}