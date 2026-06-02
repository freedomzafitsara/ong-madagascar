// backend/src/modules/projects/projects.service.ts

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  // ============================================================
  // CRÉER UN PROJET
  // ============================================================
  async create(createDto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create({
      title_fr: createDto.title_fr,
      title_mg: createDto.title_mg,
      description_fr: createDto.description_fr,
      description_mg: createDto.description_mg,
      location: createDto.location,
      start_date: createDto.start_date ? new Date(createDto.start_date) : null,
      image_url: createDto.image_url,
      status: createDto.status || 'planning',
    });

    const saved = await this.projectRepository.save(project);
    this.logger.log(`Projet créé: ${saved.id} - ${saved.title_fr}`);
    return saved;
  }

  // ============================================================
  // LISTER TOUS LES PROJETS (ADMIN)
  // ============================================================
  async findAll(queryDto: ProjectQueryDto): Promise<{
    data: Project[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (queryDto.status) where.status = queryDto.status;

    let data: Project[];
    let total: number;

    if (queryDto.search) {
      // Recherche textuelle
      [data, total] = await this.projectRepository.findAndCount({
        where: [
          { title_fr: Like(`%${queryDto.search}%`) },
          { title_mg: Like(`%${queryDto.search}%`) },
          { description_fr: Like(`%${queryDto.search}%`) },
          { description_mg: Like(`%${queryDto.search}%`) },
        ],
        order: { created_at: 'DESC' },
        skip,
        take: limit,
      });
    } else {
      [data, total] = await this.projectRepository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        skip,
        take: limit,
      });
    }

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ============================================================
  // LISTER LES PROJETS PUBLIÉS (PUBLIC)
  // ============================================================
  async findPublic(queryDto: ProjectQueryDto): Promise<{
    data: Project[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 9;
    const skip = (page - 1) * limit;

    const where: any = { status: 'active' };

    const [data, total] = await this.projectRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
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

  // ============================================================
  // PROJETS À LA UNE (PUBLIC)
  // ============================================================
  async findFeatured(): Promise<Project[]> {
    return this.projectRepository.find({
      where: { status: 'active' },
      order: { created_at: 'DESC' },
      take: 3,
    });
  }

  // ============================================================
  // TROUVER UN PROJET PAR ID
  // ============================================================
  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Projet avec l'id ${id} non trouvé`);
    }
    return project;
  }

  // ============================================================
  // METTRE À JOUR UN PROJET
  // ============================================================
  async update(id: string, updateDto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);

    if (updateDto.title_fr !== undefined) project.title_fr = updateDto.title_fr;
    if (updateDto.title_mg !== undefined) project.title_mg = updateDto.title_mg;
    if (updateDto.description_fr !== undefined) project.description_fr = updateDto.description_fr;
    if (updateDto.description_mg !== undefined) project.description_mg = updateDto.description_mg;
    if (updateDto.location !== undefined) project.location = updateDto.location;
    if (updateDto.start_date !== undefined) project.start_date = updateDto.start_date ? new Date(updateDto.start_date) : null;
    if (updateDto.image_url !== undefined) project.image_url = updateDto.image_url;
    if (updateDto.status !== undefined) project.status = updateDto.status;

    const updated = await this.projectRepository.save(project);
    this.logger.log(`Projet modifié: ${id}`);
    return updated;
  }

  // ============================================================
  // CHANGER LE STATUT D'UN PROJET
  // ============================================================
  async updateStatus(id: string, status: string): Promise<Project> {
    const project = await this.findOne(id);
    project.status = status;
    return this.projectRepository.save(project);
  }

  // ============================================================
  // SUPPRIMER UN PROJET
  // ============================================================
  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    await this.projectRepository.remove(project);
    this.logger.log(`Projet supprimé: ${id}`);
  }

  // ============================================================
  // STATISTIQUES
  // ============================================================
  async getStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    planning: number;
    draft: number;
  }> {
    const total = await this.projectRepository.count();
    const active = await this.projectRepository.count({ where: { status: 'active' } });
    const completed = await this.projectRepository.count({ where: { status: 'completed' } });
    const planning = await this.projectRepository.count({ where: { status: 'planning' } });
    const draft = await this.projectRepository.count({ where: { status: 'draft' } });

    return {
      total,
      active,
      completed,
      planning,
      draft,
    };
  }
}