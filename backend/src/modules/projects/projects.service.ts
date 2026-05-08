import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Project, ProjectStatus } from '../../entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    const project = this.projectRepository.create({
      ...createProjectDto,
      managerId: userId, // ✅ Utilise managerId (string) pas manager
    });
    return this.projectRepository.save(project);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: string,
    region?: string,
    search?: string,
  ): Promise<{ data: Project[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (status && status !== 'all') query.status = status;
    if (region && region !== 'all') query.region = region;
    if (search) query.title = Like(`%${search}%`);

    // ✅ Simplifier la requête sans jointure problématique
    const [data, total] = await this.projectRepository.findAndCount({
      where: query,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
    });
    if (!project) throw new NotFoundException('Projet non trouvé');
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userRole: string, userId: string): Promise<Project> {
    const project = await this.findOne(id);

    if (userRole !== 'super_admin' && userRole !== 'admin' && project.managerId !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier ce projet');
    }

    await this.projectRepository.update(id, updateProjectDto);
    return this.findOne(id);
  }

  async updateProgress(id: string, progress: number, userRole: string, userId: string): Promise<Project> {
    const project = await this.findOne(id);

    if (userRole !== 'super_admin' && userRole !== 'admin' && project.managerId !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier ce projet');
    }

    await this.projectRepository.update(id, { progress });
    return this.findOne(id);
  }

  async delete(id: string, userRole: string): Promise<void> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Seul un administrateur peut supprimer un projet');
    }
    await this.projectRepository.delete(id);
  }

  async getFeatured(): Promise<Project[]> {
    return this.projectRepository.find({
      where: { is_featured: true, status: ProjectStatus.ACTIVE },
      order: { createdAt: 'DESC' },
      take: 3,
    });
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    totalBudget: number;
    totalBeneficiaries: number;
    totalJobsCreated: number;
  }> {
    const total = await this.projectRepository.count();
    const active = await this.projectRepository.count({ where: { status: ProjectStatus.ACTIVE } });
    const completed = await this.projectRepository.count({ where: { status: ProjectStatus.COMPLETED } });
    
    const budgetResult = await this.projectRepository
      .createQueryBuilder('project')
      .select('SUM(project.budget)', 'total')
      .getRawOne();
    
    const beneficiariesResult = await this.projectRepository
      .createQueryBuilder('project')
      .select('SUM(project.beneficiaries_count)', 'total')
      .getRawOne();
    
    const jobsResult = await this.projectRepository
      .createQueryBuilder('project')
      .select('SUM(project.jobs_created)', 'total')
      .getRawOne();

    return {
      total,
      active,
      completed,
      totalBudget: Number(budgetResult?.total) || 0,
      totalBeneficiaries: Number(beneficiariesResult?.total) || 0,
      totalJobsCreated: Number(jobsResult?.total) || 0,
    };
  }
}