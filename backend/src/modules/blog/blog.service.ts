// backend/src/modules/blog/blog.service.ts

import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
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
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const authorName = user ? `${user.first_name} ${user.last_name}` : 'Admin Y-MaD';

    const blogPost = this.blogRepository.create({
      title_fr: createDto.title_fr,
      title_mg: createDto.title_mg || null,
      content_fr: createDto.content_fr,
      content_mg: createDto.content_mg || null,
      summary_fr: createDto.summary_fr || null,
      summary_mg: createDto.summary_mg || null,
      type: createDto.type || 'news',
      image_url: createDto.image_url || null,
      author_id: userId,
      is_published: createDto.is_published || false,
      status: createDto.is_published ? 'published' : 'draft',
      published_at: createDto.is_published ? new Date() : null,
    });

    const saved = await this.blogRepository.save(blogPost);
    this.logger.log(`Article créé: ${saved.id} - ${saved.title_fr}`);
    return saved;
  }

  // ============================================================
  // LISTER TOUS LES ARTICLES (ADMIN)
  // ============================================================
  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: string;
      type?: string;
      search?: string;
      is_published?: boolean;
    }
  ): Promise<{ data: BlogPost[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    const where: FindOptionsWhere<BlogPost> = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.is_published !== undefined) where.is_published = filters.is_published;

    const queryBuilder = this.blogRepository.createQueryBuilder('b')
      .leftJoinAndSelect('b.author', 'user')
      .orderBy('b.created_at', 'DESC');

    if (filters?.status) {
      queryBuilder.andWhere('b.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      queryBuilder.andWhere('b.type = :type', { type: filters.type });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(b.title_fr ILIKE :search OR b.title_mg ILIKE :search OR b.summary_fr ILIKE :search OR b.summary_mg ILIKE :search)',
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
      where: { is_published: true, status: 'published' },
      relations: ['author'],
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
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException(`Article avec l'id ${id} non trouvé`);
    }

    return post;
  }

  // ============================================================
  // METTRE À JOUR UN ARTICLE
  // ============================================================
  async update(id: string, updateDto: UpdateBlogPostDto, userId: string): Promise<BlogPost> {
    const post = await this.findOne(id);

    if (updateDto.title_fr !== undefined) post.title_fr = updateDto.title_fr;
    if (updateDto.title_mg !== undefined) post.title_mg = updateDto.title_mg;
    if (updateDto.content_fr !== undefined) post.content_fr = updateDto.content_fr;
    if (updateDto.content_mg !== undefined) post.content_mg = updateDto.content_mg;
    if (updateDto.summary_fr !== undefined) post.summary_fr = updateDto.summary_fr;
    if (updateDto.summary_mg !== undefined) post.summary_mg = updateDto.summary_mg;
    if (updateDto.type !== undefined) post.type = updateDto.type;
    if (updateDto.image_url !== undefined) post.image_url = updateDto.image_url;
    
    if (updateDto.is_published !== undefined) {
      post.is_published = updateDto.is_published;
      post.status = updateDto.is_published ? 'published' : 'draft';
      if (updateDto.is_published && !post.published_at) {
        post.published_at = new Date();
      }
    }

    const updated = await this.blogRepository.save(post);
    this.logger.log(`Article modifié: ${id}`);
    return updated;
  }

  // ============================================================
  // CHANGER LE STATUT DE PUBLICATION
  // ============================================================
  async updatePublishStatus(id: string, isPublished: boolean): Promise<BlogPost> {
    const post = await this.findOne(id);
    post.is_published = isPublished;
    post.status = isPublished ? 'published' : 'draft';
    
    if (isPublished && !post.published_at) {
      post.published_at = new Date();
    }
    
    return this.blogRepository.save(post);
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
  }> {
    const total = await this.blogRepository.count();
    const published = await this.blogRepository.count({ where: { is_published: true, status: 'published' } });
    const draft = await this.blogRepository.count({ where: { is_published: false, status: 'draft' } });

    return { total, published, draft };
  }
}