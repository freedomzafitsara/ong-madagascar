// backend/src/modules/pages/pages.service.ts

import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageContent, HeroSection, PageSection, PageStat, CtaSection } from '../../entities/page-content.entity';
import { PageBackground } from '../../entities/page-background.entity';
import { UpdatePageContentDto } from './dto/create-page-content.dto';
import { UpdatePageBackgroundDto } from './dto/create-page-background.dto';

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name);

  constructor(
    @InjectRepository(PageContent)
    private pageContentRepository: Repository<PageContent>,
    @InjectRepository(PageBackground)
    private pageBackgroundRepository: Repository<PageBackground>,
  ) {}

  // ============================================================
  // GESTION DU CONTENU DES PAGES
  // ============================================================

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

  // ============================================================
  // GESTION DES FONDS D'ÉCRAN
  // ============================================================

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

  // ============================================================
  // INITIALISATION DES PAGES PAR DÉFAUT
  // ============================================================

  async initializeDefaultPages(): Promise<void> {
    // Seulement les pages de votre thème
    const pages = ['home', 'projects', 'jobs', 'contact', 'login'];
    
    for (const page of pages) {
      const exists = await this.pageContentRepository.findOne({ where: { page } });
      if (!exists) {
        const defaultContent = this.getDefaultContentForPage(page);
        await this.pageContentRepository.save(defaultContent);
        this.logger.log(`Page par défaut créée: ${page}`);
      }
    }
  }

  private getDefaultContentForPage(page: string): Partial<PageContent> {
    // Structure HeroSection avec les nouveaux champs
    const defaultHero: HeroSection = {
      title_fr: page === 'home' ? 'Bienvenue sur Y-MaD' : this.getDefaultTitle(page, 'fr'),
      title_mg: page === 'home' ? 'Tonga soa ao Y-MaD' : this.getDefaultTitle(page, 'mg'),
      subtitle_fr: this.getDefaultSubtitle(page, 'fr'),
      subtitle_mg: this.getDefaultSubtitle(page, 'mg'),
      button_text_fr: 'En savoir plus',
      button_text_mg: 'Hamaky bebe kokoa',
      button_link: `/${page === 'home' ? 'jobs' : page}`,
      image_url: '',
    };

    return {
      page,
      hero: defaultHero,
      is_published: true,
    };
  }

  private getDefaultTitle(page: string, lang: 'fr' | 'mg'): string {
    const titles: Record<string, { fr: string; mg: string }> = {
      projects: { fr: 'Nos Projets', mg: 'Ny Tetikasantsika' },
      jobs: { fr: 'Offres d\'emploi', mg: 'Toerana asa' },
      contact: { fr: 'Contactez-nous', mg: 'Mifandraisa aminay' },
      login: { fr: 'Connexion Admin', mg: 'Fidirana Admin' },
    };
    return titles[page]?.[lang] || (lang === 'fr' ? `Page ${page}` : `Pejy ${page}`);
  }

  private getDefaultSubtitle(page: string, lang: 'fr' | 'mg'): string {
    const subtitles: Record<string, { fr: string; mg: string }> = {
      home: { fr: 'Plateforme de gestion des offres d\'emploi', mg: 'Sehatra fitantanana asa' },
      projects: { fr: 'Découvrez nos actions à Madagascar', mg: 'Hitanareo ny asantsika eto Madagasikara' },
      jobs: { fr: 'Trouvez votre prochain opportunité', mg: 'Mitadiava asa vaovao' },
      contact: { fr: 'Nous sommes à votre écoute', mg: 'Mihainoa anay' },
      login: { fr: 'Accès réservé à l\'administration', mg: 'Fidirana ho an\'ny Admin' },
    };
    return subtitles[page]?.[lang] || (lang === 'fr' ? 'Page description' : 'Famaritana pejy');
  }
}