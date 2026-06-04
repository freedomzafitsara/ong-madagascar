// backend/src/modules/blog/blog.service.ts

import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { BlogPost } from '../../entities/blog-post.entity';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/create-blog-post.dto';
import { User } from '../../entities/user.entity';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    @InjectRepository(BlogPost)
    private blogRepository: Repository<BlogPost>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ============================================================
  // CRÉER UN ARTICLE
  // ============================================================
  async create(createDto: CreateBlogPostDto, userId: string): Promise<BlogPost> {
    try {
      const blogPost = this.blogRepository.create({
        title_fr: createDto.title_fr,
        title_mg: createDto.title_mg || null,
        content_fr: createDto.content_fr,
        content_mg: createDto.content_mg || null,
        cover_image: createDto.cover_image || null,
        slug: createDto.slug || this.generateSlug(createDto.title_fr),
        author_id: userId,
        category_id: createDto.category_id || null,
        status: createDto.status || 'draft',
      });

      const saved = await this.blogRepository.save(blogPost);
      this.logger.log(`Article créé: ${saved.id} - ${saved.title_fr}`);
      return saved;
    } catch (error) {
      this.logger.error(`Erreur lors de la création: ${error.message}`);
      throw new BadRequestException(`Erreur lors de la création: ${error.message}`);
    }
  }

  // ============================================================
  // LISTER TOUS LES ARTICLES (ADMIN)
  // ============================================================
  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: string;
      category_id?: string;
      search?: string;
    }
  ): Promise<{ data: BlogPost[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    const where: FindOptionsWhere<BlogPost> = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.category_id) where.category_id = filters.category_id;

    const queryBuilder = this.blogRepository.createQueryBuilder('b')
      .leftJoinAndSelect('b.author', 'user')
      .leftJoinAndSelect('b.category', 'category')
      .orderBy('b.created_at', 'DESC');

    if (filters?.status) {
      queryBuilder.andWhere('b.status = :status', { status: filters.status });
    }

    if (filters?.category_id) {
      queryBuilder.andWhere('b.category_id = :category_id', { category_id: filters.category_id });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(b.title_fr ILIKE :search OR b.title_mg ILIKE :search OR b.content_fr ILIKE :search OR b.content_mg ILIKE :search)',
        { search: `%${filters.search}%` }
      );
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

  // ============================================================
  // LISTER LES ARTICLES PUBLIÉS (PUBLIC)
  // ============================================================
  async findPublic(
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: BlogPost[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.blogRepository.findAndCount({
      where: { status: 'published' },
      relations: ['author', 'category'],
      order: { published_at: 'DESC' },
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
  // TROUVER UN ARTICLE PAR ID
  // ============================================================
  async findOne(id: string): Promise<BlogPost> {
    const post = await this.blogRepository.findOne({
      where: { id },
      relations: ['author', 'category'],
    });

    if (!post) {
      throw new NotFoundException(`Article avec l'id ${id} non trouvé`);
    }

    return post;
  }

  // ============================================================
  // TROUVER UN ARTICLE PAR SLUG
  // ============================================================
  async findBySlug(slug: string): Promise<BlogPost> {
    const post = await this.blogRepository.findOne({
      where: { slug, status: 'published' },
      relations: ['author', 'category'],
    });

    if (!post) {
      throw new NotFoundException(`Article avec le slug ${slug} non trouvé`);
    }

    return post;
  }

  // ============================================================
  // METTRE À JOUR UN ARTICLE
  // ============================================================
  async update(id: string, updateDto: UpdateBlogPostDto, userId: string): Promise<BlogPost> {
    try {
      const post = await this.findOne(id);

      if (updateDto.title_fr !== undefined) post.title_fr = updateDto.title_fr;
      if (updateDto.title_mg !== undefined) post.title_mg = updateDto.title_mg;
      if (updateDto.content_fr !== undefined) post.content_fr = updateDto.content_fr;
      if (updateDto.content_mg !== undefined) post.content_mg = updateDto.content_mg;
      if (updateDto.cover_image !== undefined) post.cover_image = updateDto.cover_image;
      if (updateDto.slug !== undefined) post.slug = updateDto.slug;
      if (updateDto.status !== undefined) post.status = updateDto.status;
      if (updateDto.category_id !== undefined) post.category_id = updateDto.category_id;

      if (updateDto.status === 'published' && post.status !== 'published') {
        post.published_at = new Date();
      }

      const updated = await this.blogRepository.save(post);
      this.logger.log(`Article modifié: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour: ${error.message}`);
      throw new BadRequestException(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  // ============================================================
  // CHANGER LE STATUT DE PUBLICATION
  // ============================================================
  async updatePublishStatus(id: string, status: string): Promise<BlogPost> {
    const post = await this.findOne(id);
    post.status = status;
    
    if (status === 'published' && !post.published_at) {
      post.published_at = new Date();
    }
    
    const updated = await this.blogRepository.save(post);
    this.logger.log(`Statut de l'article modifié: ${id} -> ${status}`);
    return updated;
  }

  // ============================================================
  // PUBLIER UN ARTICLE
  // ============================================================
  async publish(id: string): Promise<BlogPost> {
    return this.updatePublishStatus(id, 'published');
  }

  // ============================================================
  // DÉPUBLIER UN ARTICLE
  // ============================================================
  async unpublish(id: string): Promise<BlogPost> {
    return this.updatePublishStatus(id, 'draft');
  }

  // ============================================================
  // SUPPRIMER UN ARTICLE
  // ============================================================
  async remove(id: string): Promise<void> {
    const post = await this.findOne(id);
    await this.blogRepository.remove(post);
    this.logger.log(`Article supprimé: ${id}`);
  }

  // ============================================================
  // STATISTIQUES
  // ============================================================
  async getStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    archived: number;
  }> {
    const total = await this.blogRepository.count();
    const published = await this.blogRepository.count({ where: { status: 'published' } });
    const draft = await this.blogRepository.count({ where: { status: 'draft' } });
    const archived = await this.blogRepository.count({ where: { status: 'archived' } });

    return { total, published, draft, archived };
  }

  // ============================================================
  // GÉNÉRER UN SLUG UNIQUE
  // ============================================================
  private generateSlug(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    return baseSlug;
  }
}