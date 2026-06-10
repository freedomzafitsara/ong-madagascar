// backend/src/modules/blog/blog.service.ts

import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from '../../entities/blog-post.entity';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/create-blog-post.dto';
import { User } from '../../entities/user.entity';

@Injectable()
export class BlogService {  // ← Bien exporter la classe
  private readonly logger = new Logger(BlogService.name);

  constructor(
    @InjectRepository(BlogPost)
    private blogRepository: Repository<BlogPost>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createDto: CreateBlogPostDto, userId: string): Promise<BlogPost> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      const authorName = user ? `${user.first_name} ${user.last_name}`.trim() : 'Admin';

      const blogPost = this.blogRepository.create({
        title_fr: createDto.title_fr,
        title_mg: createDto.title_mg || null,
        content_fr: createDto.content_fr,
        content_mg: createDto.content_mg || null,
        summary_fr: createDto.summary_fr || null,
        summary_mg: createDto.summary_mg || null,
        image_url: createDto.image_url || null,
        slug: createDto.slug || this.generateSlug(createDto.title_fr),
        status: createDto.status || 'draft',
        type: createDto.type || 'news',
        tags: createDto.tags || [],
        author: createDto.author || authorName,
        author_id: userId,
        category_id: createDto.category_id || null,
        views: 0,
      });

      const saved = await this.blogRepository.save(blogPost);
      this.logger.log(`Article créé: ${saved.id} - ${saved.title_fr}`);
      return saved;
    } catch (error) {
      this.logger.error(`Erreur lors de la création: ${error.message}`);
      throw new BadRequestException(`Erreur lors de la création: ${error.message}`);
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: string;
      type?: string;
      category_id?: string;
      search?: string;
    }
  ): Promise<{ data: BlogPost[]; total: number; page: number; totalPages: number; limit: number }> {
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.blogRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.authorUser', 'user')
      .leftJoinAndSelect('post.category', 'category')
      .orderBy('post.created_at', 'DESC');

    if (filters?.status) {
      queryBuilder.andWhere('post.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      queryBuilder.andWhere('post.type = :type', { type: filters.type });
    }

    if (filters?.category_id) {
      queryBuilder.andWhere('post.category_id = :category_id', { category_id: filters.category_id });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(post.title_fr ILIKE :search OR post.title_mg ILIKE :search OR post.content_fr ILIKE :search OR post.content_mg ILIKE :search OR post.summary_fr ILIKE :search OR post.summary_mg ILIKE :search)',
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
      limit,
    };
  }

  async findPublic(
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: BlogPost[]; total: number; page: number; totalPages: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.blogRepository.findAndCount({
      where: { status: 'published' },
      relations: ['authorUser', 'category'],
      order: { published_at: 'DESC', created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    };
  }

  async findOne(id: string): Promise<BlogPost> {
    const post = await this.blogRepository.findOne({
      where: { id },
      relations: ['authorUser', 'category'],
    });

    if (!post) {
      throw new NotFoundException(`Article avec l'id ${id} non trouvé`);
    }

    post.views = (post.views || 0) + 1;
    await this.blogRepository.save(post);

    return post;
  }

  async findBySlug(slug: string): Promise<BlogPost> {
    const post = await this.blogRepository.findOne({
      where: { slug, status: 'published' },
      relations: ['authorUser', 'category'],
    });

    if (!post) {
      throw new NotFoundException(`Article avec le slug ${slug} non trouvé`);
    }

    return post;
  }

  async update(id: string, updateDto: UpdateBlogPostDto, userId: string): Promise<BlogPost> {
    try {
      const post = await this.findOne(id);

      if (updateDto.title_fr !== undefined) post.title_fr = updateDto.title_fr;
      if (updateDto.title_mg !== undefined) post.title_mg = updateDto.title_mg;
      if (updateDto.content_fr !== undefined) post.content_fr = updateDto.content_fr;
      if (updateDto.content_mg !== undefined) post.content_mg = updateDto.content_mg;
      if (updateDto.summary_fr !== undefined) post.summary_fr = updateDto.summary_fr;
      if (updateDto.summary_mg !== undefined) post.summary_mg = updateDto.summary_mg;
      if (updateDto.image_url !== undefined) post.image_url = updateDto.image_url;
      if (updateDto.slug !== undefined) post.slug = updateDto.slug;
      if (updateDto.status !== undefined) post.status = updateDto.status;
      if (updateDto.type !== undefined) post.type = updateDto.type;
      if (updateDto.tags !== undefined) post.tags = updateDto.tags;
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

  async updateStatus(id: string, status: string): Promise<BlogPost> {
    try {
      const post = await this.findOne(id);
      post.status = status;
      
      if (status === 'published' && !post.published_at) {
        post.published_at = new Date();
      }
      
      const updated = await this.blogRepository.save(post);
      this.logger.log(`Statut de l'article modifié: ${id} -> ${status}`);
      return updated;
    } catch (error) {
      this.logger.error(`Erreur lors du changement de statut: ${error.message}`);
      throw new BadRequestException(`Erreur lors du changement de statut: ${error.message}`);
    }
  }

  async publish(id: string): Promise<BlogPost> {
    return this.updateStatus(id, 'published');
  }

  async unpublish(id: string): Promise<BlogPost> {
    return this.updateStatus(id, 'draft');
  }

  async remove(id: string): Promise<void> {
    const post = await this.findOne(id);
    await this.blogRepository.remove(post);
    this.logger.log(`Article supprimé: ${id}`);
  }

  async getStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    archived: number;
    totalViews: number;
  }> {
    const total = await this.blogRepository.count();
    const published = await this.blogRepository.count({ where: { status: 'published' } });
    const draft = await this.blogRepository.count({ where: { status: 'draft' } });
    const archived = await this.blogRepository.count({ where: { status: 'archived' } });
    
    const totalViewsResult = await this.blogRepository
      .createQueryBuilder('post')
      .select('SUM(post.views)', 'total')
      .getRawOne();
    const totalViews = totalViewsResult?.total || 0;

    return { total, published, draft, archived, totalViews };
  }

  private generateSlug(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    return `${baseSlug}-${Date.now()}`;
  }
}