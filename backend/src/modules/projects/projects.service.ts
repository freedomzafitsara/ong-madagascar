// backend/src/modules/projects/projects.service.ts

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  /**
   * Crée un nouveau projet
   */
  async create(createDto: CreateProjectDto): Promise<Project> {
    try {
      const project = this.projectRepository.create({
        title_fr: createDto.title_fr,
        title_mg: createDto.title_mg || null,
        description_fr: createDto.description_fr,
        description_mg: createDto.description_mg || null,
        location: createDto.location || null,
        status: createDto.status || 'planning',
        start_date: createDto.start_date ? new Date(createDto.start_date) : null,
        image_url: createDto.image_url || null,
      });
      
      const saved = await this.projectRepository.save(project);
      this.logger.log(`Projet créé: ${saved.id} - ${saved.title_fr}`);
      return saved;
    } catch (error) {
      this.logger.error(`Erreur lors de la création: ${error.message}`);
      throw new BadRequestException(`Erreur lors de la création: ${error.message}`);
    }
  }

  /**
   * Récupère tous les projets (admin) avec pagination et recherche
   */
  async findAll(queryDto: ProjectQueryDto): Promise<{
    data: Project[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  }> {
    try {
      const page = queryDto.page || 1;
      const limit = queryDto.limit || 10;
      const skip = (page - 1) * limit;

      const where: FindOptionsWhere<Project> = {};

      if (queryDto.status) where.status = queryDto.status;
      
      if (queryDto.search) {
        return this.searchProjects(queryDto.search, page, limit);
      }

      const [data, total] = await this.projectRepository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip,
        take: limit,
      });

      return { data, total, page, totalPages: Math.ceil(total / limit), limit };
    } catch (error) {
      this.logger.error(`Erreur findAll: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0, limit: 10 };
    }
  }

  /**
   * Recherche textuelle dans les projets
   */
  async searchProjects(search: string, page: number, limit: number): Promise<{
    data: Project[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.projectRepository.createQueryBuilder('project');
    
    queryBuilder.where(
      'project.title_fr LIKE :search OR project.title_mg LIKE :search OR project.description_fr LIKE :search OR project.description_mg LIKE :search',
      { search: `%${search}%` }
    );
    
    const [data, total] = await queryBuilder
      .orderBy('project.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    
    return { data, total, page, totalPages: Math.ceil(total / limit), limit };
  }

  /**
   * Récupère les projets publics (uniquement actifs)
   */
  async findPublic(queryDto: ProjectQueryDto): Promise<{
    data: Project[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  }> {
    try {
      const page = queryDto.page || 1;
      const limit = queryDto.limit || 9;
      const skip = (page - 1) * limit;

      const where: FindOptionsWhere<Project> = {
        status: 'active',
      };

      const [data, total] = await this.projectRepository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip,
        take: limit,
      });

      return { data, total, page, totalPages: Math.ceil(total / limit), limit };
    } catch (error) {
      this.logger.error(`Erreur findPublic: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0, limit: 9 };
    }
  }

  /**
   * Récupère les projets à la une (featured)
   */
  async findFeatured(): Promise<Project[]> {
    try {
      return await this.projectRepository.find({
        where: { status: 'active' },
        order: { created_at: 'DESC' },
        take: 3,
      });
    } catch (error) {
      this.logger.error(`Erreur findFeatured: ${error.message}`);
      return [];
    }
  }

  /**
   * Récupère un projet par son ID
   */
  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Projet ${id} non trouvé`);
    }
    return project;
  }

  /**
   * Met à jour un projet
   */
  async update(id: string, updateDto: UpdateProjectDto): Promise<Project> {
    try {
      const project = await this.findOne(id);
      
      if (updateDto.title_fr !== undefined) project.title_fr = updateDto.title_fr;
      if (updateDto.title_mg !== undefined) project.title_mg = updateDto.title_mg;
      if (updateDto.description_fr !== undefined) project.description_fr = updateDto.description_fr;
      if (updateDto.description_mg !== undefined) project.description_mg = updateDto.description_mg;
      if (updateDto.location !== undefined) project.location = updateDto.location;
      if (updateDto.status !== undefined) project.status = updateDto.status;
      if (updateDto.start_date !== undefined) project.start_date = new Date(updateDto.start_date);
      if (updateDto.image_url !== undefined) project.image_url = updateDto.image_url;
      
      const updated = await this.projectRepository.save(project);
      this.logger.log(`Projet mis à jour: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Erreur update: ${error.message}`);
      throw new BadRequestException(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  /**
   * Met à jour le statut d'un projet
   */
  async updateStatus(id: string, status: string): Promise<Project> {
    try {
      const project = await this.findOne(id);
      project.status = status;
      const updated = await this.projectRepository.save(project);
      this.logger.log(`Statut du projet mis à jour: ${id} -> ${status}`);
      return updated;
    } catch (error) {
      this.logger.error(`Erreur updateStatus: ${error.message}`);
      throw new BadRequestException(`Erreur lors du changement de statut: ${error.message}`);
    }
  }

  /**
   * Supprime un projet
   */
  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const project = await this.findOne(id);
    await this.projectRepository.remove(project);
    this.logger.log(`Projet supprimé: ${id}`);
    return { success: true, message: 'Projet supprimé avec succès' };
  }

  /**
   * Récupère les statistiques des projets
   */
  async getStats() {
    try {
      const total = await this.projectRepository.count();
      const active = await this.projectRepository.count({ where: { status: 'active' } });
      const completed = await this.projectRepository.count({ where: { status: 'completed' } });
      const planning = await this.projectRepository.count({ where: { status: 'planning' } });
      const draft = await this.projectRepository.count({ where: { status: 'draft' } });

      return { total, active, completed, planning, draft };
    } catch (error) {
      this.logger.error(`Erreur getStats: ${error.message}`);
      return { total: 0, active: 0, completed: 0, planning: 0, draft: 0 };
    }
  }
}