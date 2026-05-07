import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Project } from '../../entities/project.entity';

// Interface DTO définie directement dans le fichier
export interface CreateProjectDto {
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  location?: string;
  category?: string;
  region?: string;
  status?: string;
  budget?: number;
  beneficiaries_count?: number;
  youth_impact?: number;
  jobs_created?: number;
  progress?: number;
  start_date?: Date;
  end_date?: Date;
  image_url?: string;
  gallery_images?: string[];
  is_featured?: boolean;
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async findAll(page: number = 1, limit: number = 9, search?: string, category?: string, region?: string) {
    const skip = (page - 1) * limit;
    
    const query: any = { status: 'active' };
    
    if (search) {
      query.title = Like(`%${search}%`);
    }
    
    if (category) {
      query.category = category;
    }
    
    if (region) {
      query.region = region;
    }

    const [data, total] = await this.projectRepository.findAndCount({
      where: query,
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total };
  }

  async findFeatured() {
    return this.projectRepository.find({
      where: { is_featured: true, status: 'active' },
      order: { created_at: 'DESC' },
      take: 3,
    });
  }

  async findOne(id: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
    });
    
    if (!project) {
      throw new NotFoundException(`Projet avec l'ID ${id} non trouvé`);
    }
    
    return project;
  }

  async create(createProjectDto: CreateProjectDto, managerId: string) {
    const project = this.projectRepository.create({
      ...createProjectDto,
      manager_id: managerId,
    });
    return this.projectRepository.save(project);
  }

  async update(id: string, updateProjectDto: Partial<CreateProjectDto>) {
    await this.projectRepository.update(id, updateProjectDto);
    return this.findOne(id);
  }

  async updateProgress(id: string, progress: number) {
    await this.projectRepository.update(id, { progress });
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.projectRepository.update(id, { status: 'archived' });
    return { message: 'Projet archivé avec succès' };
  }

  async getStats() {
    const total = await this.projectRepository.count({ where: { status: 'active' } });
    const completed = await this.projectRepository.count({ where: { status: 'completed' } });
    
    const beneficiariesResult = await this.projectRepository
      .createQueryBuilder('project')
      .select('SUM(project.beneficiaries_count)', 'total')
      .getRawOne();
    
    const budgetResult = await this.projectRepository
      .createQueryBuilder('project')
      .select('SUM(project.budget)', 'total')
      .getRawOne();
    
    return { 
      total, 
      completed, 
      totalBeneficiaries: Number(beneficiariesResult?.total) || 0, 
      totalBudget: Number(budgetResult?.total) || 0 
    };
  }
}