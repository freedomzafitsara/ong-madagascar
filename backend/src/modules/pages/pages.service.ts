import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageContent, PageType, HeroSection, PageSection, PageStat, CtaSection } from '../../entities/page-content.entity';
import { PageBackground } from '../../entities/page-background.entity';
import { CreatePageContentDto, UpdatePageContentDto } from './dto/create-page-content.dto';
import { CreatePageBackgroundDto, UpdatePageBackgroundDto } from './dto/create-page-background.dto';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(PageContent)
    private pageContentRepository: Repository<PageContent>,
    @InjectRepository(PageBackground)
    private pageBackgroundRepository: Repository<PageBackground>,
  ) {}

  async getAllPages(userRole: string): Promise<PageContent[]> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Accès non autorisé');
    }
    return this.pageContentRepository.find({
      order: { page: 'ASC' },
    });
  }

  async getPageBySlug(page: string): Promise<PageContent | null> {
    return this.pageContentRepository.findOne({
      where: { page, is_published: true },
    });
  }

  async getPageForAdmin(page: string, userRole: string): Promise<PageContent> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Accès non autorisé');
    }
    const content = await this.pageContentRepository.findOne({ where: { page } });
    if (!content) {
      throw new NotFoundException(`Page ${page} non trouvée`);
    }
    return content;
  }

  async createOrUpdatePageContent(
    page: string,
    updateDto: UpdatePageContentDto,
    userRole: string,
  ): Promise<PageContent> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Seul un administrateur peut modifier le contenu des pages');
    }

    let content = await this.pageContentRepository.findOne({ where: { page } });
    
    if (content) {
      await this.pageContentRepository.update(content.id, updateDto);
      return this.getPageForAdmin(page, userRole);
    } else {
      const newContent = this.pageContentRepository.create({ page, ...updateDto });
      return this.pageContentRepository.save(newContent);
    }
  }

  async getAllBackgrounds(userRole: string): Promise<PageBackground[]> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Accès non autorisé');
    }
    return this.pageBackgroundRepository.find({
      order: { page: 'ASC' },
    });
  }

  async getBackgroundByPage(page: string): Promise<PageBackground | null> {
    return this.pageBackgroundRepository.findOne({
      where: { page, is_active: true },
    });
  }

  async createOrUpdateBackground(
    page: string,
    updateDto: UpdatePageBackgroundDto,
    userRole: string,
  ): Promise<PageBackground> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Seul un administrateur peut modifier les fonds d\'écran');
    }

    let background = await this.pageBackgroundRepository.findOne({ where: { page } });
    
    if (background) {
      await this.pageBackgroundRepository.update(background.id, updateDto);
      return this.pageBackgroundRepository.findOne({ where: { id: background.id } });
    } else {
      const newBackground = this.pageBackgroundRepository.create({ page, ...updateDto });
      return this.pageBackgroundRepository.save(newBackground);
    }
  }

  async deleteBackground(id: string, userRole: string): Promise<void> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Seul un administrateur peut supprimer des fonds d\'écran');
    }
    await this.pageBackgroundRepository.delete(id);
  }

  async initializeDefaultPages(): Promise<void> {
    const pages = ['home', 'projects', 'jobs', 'about', 'events', 'blog', 'contact', 'donate', 'join', 'volunteers', 'partners'];
    
    for (const page of pages) {
      const exists = await this.pageContentRepository.findOne({ where: { page } });
      if (!exists) {
        const defaultContent = this.getDefaultContentForPage(page);
        await this.pageContentRepository.save(defaultContent);
      }
    }
  }

  private getDefaultContentForPage(page: string): Partial<PageContent> {
    const defaultHero = {
      title: page === 'home' ? 'Y-Mad Madagascar' : `Page ${page}`,
      title_mg: page === 'home' ? 'Y-Mad Madagasikara' : `Pejy ${page}`,
      subtitle: 'Bienvenue sur Y-Mad',
      subtitle_mg: 'Tonga soa eto Y-Mad',
      badge: 'Association reconnue',
      badge_mg: 'Fikambanana ekena',
      buttonText: 'En savoir plus',
      buttonText_mg: 'Hamaky bebe kokoa',
      buttonLink: `/${page}`,
      imageUrl: '',
      videoUrl: '',
    };

    return {
      page,
      hero: defaultHero,
      is_published: true,
    };
  }
}