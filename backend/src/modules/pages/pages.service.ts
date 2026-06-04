// backend/src/modules/pages/pages.service.ts

import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageContent, HeroSection } from '../../entities/page-content.entity';
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
      order: { page_key: 'ASC' },
    });
  }

  async getPageBySlug(pageKey: string): Promise<PageContent | null> {
    return this.pageContentRepository.findOne({
      where: { page_key: pageKey, is_published: true },
    });
  }

  async getPageForAdmin(pageKey: string, userRole: string): Promise<PageContent> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Accès non autorisé');
    }
    const content = await this.pageContentRepository.findOne({ 
      where: { page_key: pageKey } 
    });
    if (!content) {
      throw new NotFoundException(`Page ${pageKey} non trouvée`);
    }
    return content;
  }

  async createOrUpdatePageContent(
    pageKey: string,
    updateDto: UpdatePageContentDto,
    userId: string,
    userRole: string,
  ): Promise<PageContent> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Seul un administrateur peut modifier le contenu des pages');
    }

    let content = await this.pageContentRepository.findOne({ 
      where: { page_key: pageKey } 
    });
    
    const updateData = {
      ...updateDto,
      updated_by: userId,
    };

    if (content) {
      await this.pageContentRepository.update(content.id, updateData);
      this.logger.log(`Contenu mis à jour pour la page: ${pageKey} par ${userId}`);
      return this.getPageForAdmin(pageKey, userRole);
    } else {
      const newContent = this.pageContentRepository.create({ 
        page_key: pageKey, 
        ...updateData,
        is_published: updateDto.is_published !== undefined ? updateDto.is_published : false,
      });
      this.logger.log(`Nouveau contenu créé pour la page: ${pageKey} par ${userId}`);
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
      order: { page_key: 'ASC' },
    });
  }

  async getBackgroundByPage(pageKey: string): Promise<PageBackground | null> {
    return this.pageBackgroundRepository.findOne({
      where: { page_key: pageKey, is_active: true },
    });
  }

  async getBackgroundForAdmin(pageKey: string, userRole: string): Promise<PageBackground | null> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Accès non autorisé');
    }
    return this.pageBackgroundRepository.findOne({
      where: { page_key: pageKey },
    });
  }

  async createOrUpdateBackground(
    pageKey: string,
    updateDto: UpdatePageBackgroundDto,
    userId: string,
    userRole: string,
  ): Promise<PageBackground> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Seul un administrateur peut modifier les fonds d\'écran');
    }

    let background = await this.pageBackgroundRepository.findOne({ 
      where: { page_key: pageKey } 
    });
    
    const updateData = {
      ...updateDto,
      updated_by: userId,
    };

    if (background) {
      await this.pageBackgroundRepository.update(background.id, updateData);
      this.logger.log(`Fond d'écran mis à jour pour la page: ${pageKey} par ${userId}`);
      return this.pageBackgroundRepository.findOne({ where: { id: background.id } });
    } else {
      const newBackground = this.pageBackgroundRepository.create({ 
        page_key: pageKey, 
        ...updateData,
        is_active: updateDto.is_active !== undefined ? updateDto.is_active : true,
      });
      this.logger.log(`Nouveau fond d'écran créé pour la page: ${pageKey} par ${userId}`);
      return this.pageBackgroundRepository.save(newBackground);
    }
  }

  async updateBackgroundImage(
    pageKey: string,
    imageUrl: string,
    userId: string,
    userRole: string,
  ): Promise<PageBackground> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Seul un administrateur peut modifier les fonds d\'écran');
    }

    let background = await this.pageBackgroundRepository.findOne({ 
      where: { page_key: pageKey } 
    });

    if (background) {
      await this.pageBackgroundRepository.update(background.id, {
        image_url: imageUrl,
        updated_by: userId,
      });
      this.logger.log(`Image mise à jour pour la page: ${pageKey} par ${userId}`);
      return this.pageBackgroundRepository.findOne({ where: { id: background.id } });
    } else {
      const newBackground = this.pageBackgroundRepository.create({
        page_key: pageKey,
        image_url: imageUrl,
        updated_by: userId,
        is_active: true,
      });
      this.logger.log(`Nouvelle image créée pour la page: ${pageKey} par ${userId}`);
      return this.pageBackgroundRepository.save(newBackground);
    }
  }

  async deleteBackground(id: string, userRole: string): Promise<void> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Seul un administrateur peut supprimer des fonds d\'écran');
    }
    await this.pageBackgroundRepository.delete(id);
    this.logger.log(`Fond d'écran supprimé: ${id}`);
  }

  async toggleBackgroundActive(pageKey: string, userId: string, userRole: string): Promise<PageBackground> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Seul un administrateur peut modifier les fonds d\'écran');
    }

    const background = await this.pageBackgroundRepository.findOne({
      where: { page_key: pageKey }
    });

    if (!background) {
      throw new NotFoundException(`Fond d'écran non trouvé pour la page: ${pageKey}`);
    }

    background.is_active = !background.is_active;
    background.updated_by = userId;
    await this.pageBackgroundRepository.save(background);
    
    this.logger.log(`Fond d'écran ${background.is_active ? 'activé' : 'désactivé'} pour: ${pageKey}`);
    return background;
  }

  // ============================================================
  // INITIALISATION DES PAGES PAR DÉFAUT
  // ============================================================

  async initializeDefaultPages(userId: string, userRole: string): Promise<void> {
    if (userRole !== 'super_admin') {
      throw new ForbiddenException('Seul un super administrateur peut initialiser les pages');
    }

    const pages = ['home', 'projects', 'jobs', 'blog', 'contact', 'login'];
    
    for (const pageKey of pages) {
      // Initialiser le contenu
      const contentExists = await this.pageContentRepository.findOne({ 
        where: { page_key: pageKey } 
      });
      if (!contentExists) {
        const defaultContent = this.getDefaultContentForPage(pageKey);
        await this.pageContentRepository.save({
          ...defaultContent,
          updated_by: userId,
        });
        this.logger.log(`Contenu par défaut créé pour: ${pageKey}`);
      }

      // Initialiser le fond d'écran
      const backgroundExists = await this.pageBackgroundRepository.findOne({
        where: { page_key: pageKey }
      });
      if (!backgroundExists) {
        const defaultBackground = this.getDefaultBackgroundForPage(pageKey);
        await this.pageBackgroundRepository.save({
          ...defaultBackground,
          updated_by: userId,
        });
        this.logger.log(`Fond d'écran par défaut créé pour: ${pageKey}`);
      }
    }
  }

  private getDefaultContentForPage(pageKey: string): Partial<PageContent> {
    const contents: Record<string, { fr: string; mg: string }> = {
      home: { fr: 'Bienvenue sur Y-MaD', mg: 'Tonga soa ao Y-MaD' },
      projects: { fr: 'Nos Projets', mg: 'Ny Tetikasantsika' },
      jobs: { fr: 'Offres d\'emploi', mg: 'Toerana asa' },
      blog: { fr: 'Actualités', mg: 'Vaovao' },
      contact: { fr: 'Contactez-nous', mg: 'Mifandraisa aminay' },
      login: { fr: 'Connexion Admin', mg: 'Fidirana Admin' },
    };

    const heroSection: HeroSection = {
      title_fr: contents[pageKey]?.fr || `Page ${pageKey}`,
      title_mg: contents[pageKey]?.mg || `Pejy ${pageKey}`,
      subtitle_fr: this.getDefaultSubtitle(pageKey, 'fr'),
      subtitle_mg: this.getDefaultSubtitle(pageKey, 'mg'),
      button_text_fr: 'En savoir plus',
      button_text_mg: 'Hamaky bebe kokoa',
      button_link: `/${pageKey === 'home' ? 'jobs' : pageKey}`,
      image_url: '',
      is_active: true,
    };

    return {
      page_key: pageKey,
      content_fr: contents[pageKey]?.fr || `Contenu de la page ${pageKey}`,
      content_mg: contents[pageKey]?.mg || `Votoatin'ny pejy ${pageKey}`,
      hero: heroSection,
      is_published: true,
    };
  }

  private getDefaultSubtitle(pageKey: string, lang: 'fr' | 'mg'): string {
    const subtitles: Record<string, { fr: string; mg: string }> = {
      home: { fr: 'Plateforme de gestion des offres d\'emploi', mg: 'Sehatra fitantanana asa' },
      projects: { fr: 'Découvrez nos actions à Madagascar', mg: 'Hitanareo ny asantsika eto Madagasikara' },
      jobs: { fr: 'Trouvez votre prochain opportunité', mg: 'Mitadiava asa vaovao' },
      blog: { fr: 'Actualités et événements', mg: 'Vaovao sy hetsika' },
      contact: { fr: 'Nous sommes à votre écoute', mg: 'Mihainoa anay' },
      login: { fr: 'Accès réservé à l\'administration', mg: 'Fidirana ho an\'ny Admin' },
    };
    return subtitles[pageKey]?.[lang] || (lang === 'fr' ? 'Description de la page' : 'Famaritana pejy');
  }

  private getDefaultBackgroundForPage(pageKey: string): Partial<PageBackground> {
    const titles: Record<string, { fr: string; mg: string }> = {
      home: { fr: 'Image de fond - Accueil', mg: 'Sary fototra - Fandraisana' },
      projects: { fr: 'Image de fond - Projets', mg: 'Sary fototra - Tetikasa' },
      jobs: { fr: 'Image de fond - Offres', mg: 'Sary fototra - Asa' },
      blog: { fr: 'Image de fond - Blog', mg: 'Sary fototra - Blaogy' },
      contact: { fr: 'Image de fond - Contact', mg: 'Sary fototra - Fifandraisana' },
      login: { fr: 'Image de fond - Connexion', mg: 'Sary fototra - Fidirana' },
    };

    return {
      page_key: pageKey,
      image_url: `/images/default-bg-${pageKey}.jpg`,
      alt_fr: titles[pageKey]?.fr || `Image de fond ${pageKey}`,
      alt_mg: titles[pageKey]?.mg || `Sary fototra ${pageKey}`,
      is_active: true,
      overlay_opacity: 30,
      position: 'center',
      size: 'cover',
    };
  }
}