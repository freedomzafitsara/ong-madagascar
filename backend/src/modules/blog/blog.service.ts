import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { BlogPost, PostStatus } from '../../entities/blog-post.entity';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog-post.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost)
    private blogRepository: Repository<BlogPost>,
  ) {}

  async createPost(createBlogPostDto: CreateBlogPostDto, authorId: string, authorName: string) {
    const post = this.blogRepository.create({
      ...createBlogPostDto,
      authorId,
      author: authorName,
      status: PostStatus.DRAFT,
    });
    return this.blogRepository.save(post);
  }

  async findAllPublished(page: number = 1, limit: number = 9, type?: string, search?: string) {
    const skip = (page - 1) * limit;
    const query: any = { status: PostStatus.PUBLISHED };
    if (type) query.type = type;
    if (search) query.title = Like(`%${search}%`);

    const [data, total] = await this.blogRepository.findAndCount({
      where: query,
      order: { publishedAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const post = await this.blogRepository.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Article non trouvé');
    post.views += 1;
    await this.blogRepository.save(post);
    return post;
  }

  async updatePost(id: string, updateBlogPostDto: UpdateBlogPostDto) {
    await this.blogRepository.update(id, updateBlogPostDto);
    return this.findOne(id);
  }

  async publishPost(id: string) {
    await this.blogRepository.update(id, { 
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
    });
    return this.findOne(id);
  }

  async deletePost(id: string) {
    await this.blogRepository.delete(id);
    return { success: true, message: 'Article supprimé' };
  }

  async getStats() {
    const total = await this.blogRepository.count();
    const published = await this.blogRepository.count({ where: { status: PostStatus.PUBLISHED } });
    const totalViews = await this.blogRepository.sum('views') || 0;
    return { total, published, totalViews };
  }
}