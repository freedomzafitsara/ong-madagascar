// backend/src/modules/blog/blog.service.ts

import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { BlogPost, ArticleType, PostStatus } from '../../entities/blog-post.entity';
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

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(createDto: CreateBlogPostDto, userId: string): Promise<BlogPost> {
    let slug = this.generateSlug(createDto.title);
    
    let existing = await this.blogRepository.findOne({ where: { slug } });
    let counter = 1;
    while (existing) {
      slug = `${this.generateSlug(createDto.title)}-${counter}`;
      existing = await this.blogRepository.findOne({ where: { slug } });
      counter++;
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    const authorName = createDto.author || (user ? `${user.firstName} ${user.lastName}` : 'Admin Y-Mad');

    const blogPost = this.blogRepository.create({
      title: createDto.title,
      title_mg: createDto.title_mg || null,
      slug,
      summary: createDto.summary,
      summary_mg: createDto.summary_mg || null,
      content: createDto.content || '',
      content_mg: createDto.content_mg || null,
      type: createDto.type,
      image_url: createDto.image_url || null,
      author_id: userId,
      author: authorName,
      tags: createDto.tags || [],
      status: createDto.status || 'draft',
      published_at: createDto.status === 'published' ? new Date() : null,
      views: 0,
    });

    const saved = await this.blogRepository.save(blogPost);
    this.logger.log(`Article créé: ${saved.id} - ${saved.title}`);
    return saved;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: PostStatus;
      type?: ArticleType;
      search?: string;
    }
  ): Promise<{ data: BlogPost[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.blogRepository.createQueryBuilder('b')
      .leftJoinAndSelect('b.user', 'user')
      .orderBy('b.created_at', 'DESC');

    if (filters?.status) {
      queryBuilder.andWhere('b.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      queryBuilder.andWhere('b.type = :type', { type: filters.type });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(b.title ILIKE :search OR b.title_mg ILIKE :search OR b.summary ILIKE :search OR b.summary_mg ILIKE :search)',
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

  async findPublic(
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: BlogPost[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.blogRepository.findAndCount({
      where: { status: 'published' },
      relations: ['user'],
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

  async findOne(id: string): Promise<BlogPost> {
    const post = await this.blogRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException(`Article avec l'id ${id} non trouvé`);
    }

    return post;
  }

  async findBySlug(slug: string): Promise<BlogPost> {
    const post = await this.blogRepository.findOne({
      where: { slug, status: 'published' },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException(`Article avec le slug ${slug} non trouvé`);
    }

    await this.blogRepository.increment({ id: post.id }, 'views', 1);
    post.views += 1;

    return post;
  }

  async update(id: string, updateDto: UpdateBlogPostDto, userId: string): Promise<BlogPost> {
    const post = await this.findOne(id);

    if (updateDto.title !== undefined) post.title = updateDto.title;
    if (updateDto.title_mg !== undefined) post.title_mg = updateDto.title_mg;
    if (updateDto.summary !== undefined) post.summary = updateDto.summary;
    if (updateDto.summary_mg !== undefined) post.summary_mg = updateDto.summary_mg;
    if (updateDto.content !== undefined) post.content = updateDto.content;
    if (updateDto.content_mg !== undefined) post.content_mg = updateDto.content_mg;
    if (updateDto.type !== undefined) post.type = updateDto.type;
    if (updateDto.image_url !== undefined) post.image_url = updateDto.image_url;
    if (updateDto.tags !== undefined) post.tags = updateDto.tags;
    
    if (updateDto.status === 'published' && post.status !== 'published') {
      post.published_at = new Date();
    }
    
    if (updateDto.status !== undefined) {
      post.status = updateDto.status;
    }

    post.updated_at = new Date();

    const updated = await this.blogRepository.save(post);
    this.logger.log(`Article modifié: ${id}`);
    return updated;
  }

  async updateStatus(id: string, status: PostStatus): Promise<BlogPost> {
    const post = await this.findOne(id);
    post.status = status;
    
    if (status === 'published' && !post.published_at) {
      post.published_at = new Date();
    }
    
    return this.blogRepository.save(post);
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
    const [total, published, draft, archived] = await Promise.all([
      this.blogRepository.count(),
      this.blogRepository.count({ where: { status: 'published' } }),
      this.blogRepository.count({ where: { status: 'draft' } }),
      this.blogRepository.count({ where: { status: 'archived' } }),
    ]);

    const totalViewsResult = await this.blogRepository
      .createQueryBuilder('b')
      .select('SUM(b.views)', 'total')
      .getRawOne();

    const totalViews = parseInt(totalViewsResult?.total || 0, 10);

    return { total, published, draft, archived, totalViews };
  }
}