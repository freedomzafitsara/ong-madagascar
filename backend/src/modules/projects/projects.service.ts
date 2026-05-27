// backend/src/modules/projects/projects.service.ts

import { Injectable, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Project, ProjectStatus } from '../../entities/project.entity';
import { CreateProjectDto, UpdateProjectDto } from './dto/create-project.dto';
import { User } from '../../entities/user.entity';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createDto: CreateProjectDto, userId: string): Promise<Project> {
    const project = this.projectRepository.create({
      ...createDto,
      manager_id: userId,
      status: createDto.status || ProjectStatus.PLANNING,
      progress: createDto.progress || 0,
      beneficiaries_count: createDto.beneficiaries_count || 0,
      youth_impact: createDto.youth_impact || 0,
      jobs_created: createDto.jobs_created || 0,
      is_featured: createDto.is_featured || false,
    });

    const saved = await this.projectRepository.save(project);
    this.logger.log(`Projet créé: ${saved.id} - ${saved.title}`);
    return saved;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: ProjectStatus;
      region?: string;
      category?: string;
      search?: string;
    }
  ): Promise<{ data: Project[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Project> = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.region) where.region = filters.region;
    if (filters?.category) where.category = filters.category;

    const queryBuilder = this.projectRepository.createQueryBuilder('p')
      .leftJoinAndSelect('p.manager', 'manager')
      .orderBy('p.created_at', 'DESC');

    if (filters?.search) {
      queryBuilder.andWhere(
        '(p.title ILIKE :search OR p.title_mg ILIKE :search OR p.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.status) {
      queryBuilder.andWhere('p.status = :status', { status: filters.status });
    }

    if (filters?.region) {
      queryBuilder.andWhere('p.region = :region', { region: filters.region });
    }

    if (filters?.category) {
      queryBuilder.andWhere('p.category = :category', { category: filters.category });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findFeatured(): Promise<Project[]> {
    return this.projectRepository.find({
      where: { is_featured: true, status: ProjectStatus.ACTIVE },
      order: { created_at: 'DESC' },
      take: 6,
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['manager'],
    });
    if (!project) {
      throw new NotFoundException(`Projet avec l'id ${id} non trouvé`);
    }
    return project;
  }

  async update(id: string, updateDto: UpdateProjectDto, userId: string, userRole: string): Promise<Project> {
    const project = await this.findOne(id);
    
    // Vérifier les droits
    if (userRole !== 'super_admin' && userRole !== 'admin' && project.manager_id !== userId) {
      throw new ForbiddenException('Vous n\'avez pas les droits pour modifier ce projet');
    }
    
    Object.assign(project, updateDto);
    const updated = await this.projectRepository.save(project);
    this.logger.log(`Projet modifié: ${id}`);
    return updated;
  }

  async updateProgress(id: string, progress: number, userId: string, userRole: string): Promise<Project> {
    const project = await this.findOne(id);
    
    if (userRole !== 'super_admin' && userRole !== 'admin' && project.manager_id !== userId) {
      throw new ForbiddenException('Vous n\'avez pas les droits pour modifier ce projet');
    }
    
    project.progress = progress;
    const updated = await this.projectRepository.save(project);
    this.logger.log(`Progression du projet ${id} mise à jour: ${progress}%`);
    return updated;
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const project = await this.findOne(id);
    
    if (userRole !== 'super_admin' && userRole !== 'admin' && project.manager_id !== userId) {
      throw new ForbiddenException('Vous n\'avez pas les droits pour supprimer ce projet');
    }
    
    await this.projectRepository.remove(project);
    this.logger.log(`Projet supprimé: ${id}`);
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    planning: number;
    draft: number;
    totalBudget: number;
    totalSpent: number;
    totalBeneficiaries: number;
    totalYouthImpact: number;
    totalJobsCreated: number;
  }> {
    const [total, active, completed, planning, draft, totalBudget, totalSpent, totalBeneficiaries, totalYouthImpact, totalJobsCreated] = await Promise.all([
      this.projectRepository.count(),
      this.projectRepository.count({ where: { status: ProjectStatus.ACTIVE } }),
      this.projectRepository.count({ where: { status: ProjectStatus.COMPLETED } }),
      this.projectRepository.count({ where: { status: ProjectStatus.PLANNING } }),
      this.projectRepository.count({ where: { status: ProjectStatus.DRAFT } }),
      this.projectRepository
        .createQueryBuilder('p')
        .select('SUM(p.budget)', 'total')
        .getRawOne(),
      this.projectRepository
        .createQueryBuilder('p')
        .select('SUM(p.spent)', 'total')
        .getRawOne(),
      this.projectRepository
        .createQueryBuilder('p')
        .select('SUM(p.beneficiaries_count)', 'total')
        .getRawOne(),
      this.projectRepository
        .createQueryBuilder('p')
        .select('SUM(p.youth_impact)', 'total')
        .getRawOne(),
      this.projectRepository
        .createQueryBuilder('p')
        .select('SUM(p.jobs_created)', 'total')
        .getRawOne(),
    ]);

    return {
      total,
      active,
      completed,
      planning,
      draft,
      totalBudget: parseFloat(totalBudget?.total || 0),
      totalSpent: parseFloat(totalSpent?.total || 0),
      totalBeneficiaries: parseInt(totalBeneficiaries?.total || 0),
      totalYouthImpact: parseInt(totalYouthImpact?.total || 0),
      totalJobsCreated: parseInt(totalJobsCreated?.total || 0),
    };
  }
}