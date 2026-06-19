// backend/src/modules/pages/pages.service.ts

import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageContent, HeroSection } from '../../entities/page-content.entity';
import { PageBackground } from '../../entities/page-background.entity';
import { UpdatePageContentDto } from './dto/update-page-content.dto';
import { UpdatePageBackgroundDto } from './dto/update-page-background.dto';

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
      throw new ForbiddenException('Acces non autorise');
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
      throw new ForbiddenException('Acces non autorise');
    }
    const content = await this.pageContentRepository.findOne({ 
      where: { page_key: pageKey } 
    });
    if (!content) {
      throw new NotFoundException(`Page ${pageKey} non trouvee`);
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
    
    const updateData: any = {
      updated_by: userId,
    };

    if (updateDto.content_fr !== undefined) updateData.content_fr = updateDto.content_fr;
    if (updateDto.content_mg !== undefined) updateData.content_mg = updateDto.content_mg;
    if (updateDto.hero !== undefined) updateData.hero = updateDto.hero;
    if (updateDto.sections !== undefined) updateData.sections = updateDto.sections;
    if (updateDto.stats !== undefined) updateData.stats = updateDto.stats;
    if (updateDto.cta !== undefined) updateData.cta = updateDto.cta;
    if (updateDto.seo_title_fr !== undefined) updateData.seo_title_fr = updateDto.seo_title_fr;
    if (updateDto.seo_title_mg !== undefined) updateData.seo_title_mg = updateDto.seo_title_mg;
    if (updateDto.seo_description_fr !== undefined) updateData.seo_description_fr = updateDto.seo_description_fr;
    if (updateDto.seo_description_mg !== undefined) updateData.seo_description_mg = updateDto.seo_description_mg;
    if (updateDto.seo_keywords !== undefined) updateData.seo_keywords = updateDto.seo_keywords;
    if (updateDto.custom_fields !== undefined) updateData.custom_fields = updateDto.custom_fields;
    if (updateDto.is_published !== undefined) updateData.is_published = updateDto.is_published;

    if (content) {
      await this.pageContentRepository.update(content.id, updateData);
      this.logger.log(`Contenu mis a jour pour la page: ${pageKey}`);
      return this.getPageForAdmin(pageKey, userRole);
    } else {
      const newContent = this.pageContentRepository.create({
        page_key: pageKey,
        content_fr: updateData.content_fr || '',
        content_mg: updateData.content_mg || '',
        hero: updateData.hero || null,
        sections: updateData.sections || null,
        stats: updateData.stats || null,
        cta: updateData.cta || null,
        seo_title_fr: updateData.seo_title_fr || null,
        seo_title_mg: updateData.seo_title_mg || null,
        seo_description_fr: updateData.seo_description_fr || null,
        seo_description_mg: updateData.seo_description_mg || null,
        seo_keywords: updateData.seo_keywords || null,
        custom_fields: updateData.custom_fields || null,
        is_published: updateData.is_published !== undefined ? updateData.is_published : true,
        updated_by: userId,
      });
      
      this.logger.log(`Nouveau contenu cree pour la page: ${pageKey}`);
      return this.pageContentRepository.save(newContent);
    }
  }

  // ============================================================
  // GESTION DES FONDS D'ECRAN
  // ============================================================

  async getAllBackgrounds(userRole: string): Promise<PageBackground[]> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Acces non autorise');
    }
    
    const result = await this.pageBackgroundRepository.find({
      order: { page_key: 'ASC' },
    });
    
    this.logger.log(`getAllBackgrounds: ${result.length} backgrounds found`);
    return result;
  }

  async getBackgroundByPage(pageKey: string): Promise<PageBackground | null> {
    let background = await this.pageBackgroundRepository.findOne({
      where: { page_key: pageKey, is_active: true },
    });
    
    if (!background) {
      this.logger.log(`Background not found for ${pageKey}, creating default`);
      
      const defaultImages: Record<string, string> = {
        home: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=600&fit=crop',
        projects: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop',
        jobs: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=600&fit=crop',
        blog: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=600&fit=crop',
        contact: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200&h=600&fit=crop',
        login: 'https://images.unsplash.com/photo-1507208773393-40d9fc670acf?w=1200&h=600&fit=crop',
      };
      
      const newBackground = this.pageBackgroundRepository.create({
        page_key: pageKey,
        image_url: defaultImages[pageKey] || defaultImages.home,
        is_active: true,
        overlay_opacity: 45,
        position: 'center',
        alt_fr: `Image de fond ${pageKey}`,
        alt_mg: `Sary fototra ${pageKey}`,
        size: 'cover',
        blur: 0,
        brightness: 100,
      });
      
      background = await this.pageBackgroundRepository.save(newBackground);
      this.logger.log(`Background created for ${pageKey}`);
    }
    
    return background;
  }

  async getBackgroundForAdmin(pageKey: string, userRole: string): Promise<PageBackground | null> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Acces non autorise');
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
      throw new ForbiddenException('Seul un administrateur peut modifier les fonds d\'ecran');
    }

    let background = await this.pageBackgroundRepository.findOne({ 
      where: { page_key: pageKey } 
    });
    
    const updateData: any = {
      updated_by: userId,
    };

    if (updateDto.image_url !== undefined) updateData.image_url = updateDto.image_url;
    if (updateDto.is_active !== undefined) updateData.is_active = updateDto.is_active;
    if (updateDto.overlay_opacity !== undefined) updateData.overlay_opacity = updateDto.overlay_opacity;
    if (updateDto.position !== undefined) updateData.position = updateDto.position;
    if (updateDto.size !== undefined) updateData.size = updateDto.size;
    if (updateDto.blur !== undefined) updateData.blur = updateDto.blur;
    if (updateDto.brightness !== undefined) updateData.brightness = updateDto.brightness;
    if (updateDto.alt_fr !== undefined) updateData.alt_fr = updateDto.alt_fr;
    if (updateDto.alt_mg !== undefined) updateData.alt_mg = updateDto.alt_mg;

    if (background) {
      await this.pageBackgroundRepository.update(background.id, updateData);
      this.logger.log(`Background updated for page: ${pageKey}`);
      return this.pageBackgroundRepository.findOne({ where: { id: background.id } });
    } else {
      const newBackground = this.pageBackgroundRepository.create({
        page_key: pageKey,
        image_url: updateData.image_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=600&fit=crop',
        is_active: updateData.is_active !== undefined ? updateData.is_active : true,
        overlay_opacity: updateData.overlay_opacity !== undefined ? updateData.overlay_opacity : 40,
        position: updateData.position !== undefined ? updateData.position : 'center',
        size: updateData.size || 'cover',
        blur: updateData.blur || 0,
        brightness: updateData.brightness || 100,
        alt_fr: updateData.alt_fr || null,
        alt_mg: updateData.alt_mg || null,
        updated_by: userId,
      });
      
      this.logger.log(`New background created for page: ${pageKey}`);
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
      throw new ForbiddenException('Seul un administrateur peut modifier les fonds d\'ecran');
    }

    let background = await this.pageBackgroundRepository.findOne({ 
      where: { page_key: pageKey } 
    });

    if (background) {
      await this.pageBackgroundRepository.update(background.id, {
        image_url: imageUrl,
        updated_by: userId,
      });
      this.logger.log(`Image updated for page: ${pageKey}`);
      return this.pageBackgroundRepository.findOne({ where: { id: background.id } });
    } else {
      const newBackground = this.pageBackgroundRepository.create({
        page_key: pageKey,
        image_url: imageUrl,
        updated_by: userId,
        is_active: true,
        overlay_opacity: 40,
        position: 'center',
        size: 'cover',
        blur: 0,
        brightness: 100,
        alt_fr: '',
        alt_mg: '',
      });
      this.logger.log(`New image created for page: ${pageKey}`);
      return this.pageBackgroundRepository.save(newBackground);
    }
  }

  async toggleBackgroundActive(
    pageKey: string, 
    userId: string, 
    userRole: string
  ): Promise<PageBackground> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Seul un administrateur peut modifier les fonds d\'ecran');
    }

    const background = await this.pageBackgroundRepository.findOne({
      where: { page_key: pageKey }
    });

    if (!background) {
      throw new NotFoundException(`Background not found for page: ${pageKey}`);
    }

    background.is_active = !background.is_active;
    background.updated_by = userId;
    await this.pageBackgroundRepository.save(background);
    
    this.logger.log(`Background ${background.is_active ? 'activated' : 'deactivated'} for: ${pageKey}`);
    return background;
  }

  async deleteBackground(id: string, userRole: string): Promise<void> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Seul un administrateur peut supprimer des fonds d\'ecran');
    }
    
    const background = await this.pageBackgroundRepository.findOne({ where: { id } });
    if (!background) {
      throw new NotFoundException(`Background with ID ${id} not found`);
    }
    
    await this.pageBackgroundRepository.delete(id);
    this.logger.log(`Background deleted: ${id} (page: ${background.page_key})`);
  }

  // ============================================================
  // INITIALISATION DES PAGES PAR DEFAUT
  // ============================================================

  async initializeDefaultPages(userId: string, userRole: string): Promise<{ success: boolean; message: string; data?: any }> {
    if (userRole !== 'super_admin') {
      throw new ForbiddenException('Seul un super administrateur peut initialiser les pages');
    }

    const pages = ['home', 'projects', 'jobs', 'blog', 'contact', 'login', 'all', 'register'];
    const results = {
      contents: [] as string[],
      backgrounds: [] as string[],
    };
    
    for (const pageKey of pages) {
      const contentExists = await this.pageContentRepository.findOne({ 
        where: { page_key: pageKey } 
      });
      if (!contentExists) {
        const defaultContent = this.getDefaultContentForPage(pageKey);
        await this.pageContentRepository.save({
          ...defaultContent,
          updated_by: userId,
        });
        results.contents.push(pageKey);
        this.logger.log(`Default content created for: ${pageKey}`);
      }

      const backgroundExists = await this.pageBackgroundRepository.findOne({
        where: { page_key: pageKey }
      });
      if (!backgroundExists) {
        const defaultBackground = this.getDefaultBackgroundForPage(pageKey);
        await this.pageBackgroundRepository.save({
          ...defaultBackground,
          updated_by: userId,
        });
        results.backgrounds.push(pageKey);
        this.logger.log(`Default background created for: ${pageKey}`);
      }
    }

    return { 
      success: true, 
      message: `Pages initialisees. ${results.contents.length} contenus et ${results.backgrounds.length} fonds d'ecran.`,
      data: results
    };
  }

  // ============================================================
  // METHODES PRIVEES
  // ============================================================

  private getDefaultContentForPage(pageKey: string): Partial<PageContent> {
    const contents: Record<string, { fr: string; mg: string }> = {
      home: { fr: 'Bienvenue sur Y-MaD', mg: 'Tonga soa ao Y-MaD' },
      projects: { fr: 'Nos Projets', mg: 'Ny Tetikasantsika' },
      jobs: { fr: 'Offres d\'emploi', mg: 'Toerana asa' },
      blog: { fr: 'Actualites', mg: 'Vaovao' },
      contact: { fr: 'Contactez-nous', mg: 'Mifandraisa aminay' },
      login: { fr: 'Connexion Admin', mg: 'Fidirana Admin' },
      all: { fr: 'Toutes les pages', mg: 'Pejy rehetra' },
      register: { fr: 'Inscription', mg: 'Fisoratana' },
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
      projects: { fr: 'Decouvrez nos actions a Madagascar', mg: 'Hitanareo ny asantsika eto Madagasikara' },
      jobs: { fr: 'Trouvez votre prochain opportunite', mg: 'Mitadiava asa vaovao' },
      blog: { fr: 'Actualites et evenements', mg: 'Vaovao sy hetsika' },
      contact: { fr: 'Nous sommes a votre ecoute', mg: 'Mihainoa anay' },
      login: { fr: 'Acces reserve a l\'administration', mg: 'Fidirana ho an\'ny Admin' },
      all: { fr: 'Voir toutes les pages', mg: 'Hijery ny pejy rehetra' },
      register: { fr: 'Creer un compte', mg: 'Mamorona kaonty' },
    };
    return subtitles[pageKey]?.[lang] || (lang === 'fr' ? 'Description de la page' : 'Famaritana pejy');
  }

  private getDefaultBackgroundForPage(pageKey: string): Partial<PageBackground> {
    const defaultImages: Record<string, string> = {
      home: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=600&fit=crop',
      projects: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop',
      jobs: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=600&fit=crop',
      blog: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=600&fit=crop',
      contact: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200&h=600&fit=crop',
      login: 'https://images.unsplash.com/photo-1507208773393-40d9fc670acf?w=1200&h=600&fit=crop',
      all: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=600&fit=crop',
      register: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=600&fit=crop',
    };

    const titles: Record<string, { fr: string; mg: string }> = {
      home: { fr: 'Image de fond - Accueil', mg: 'Sary fototra - Fandraisana' },
      projects: { fr: 'Image de fond - Projets', mg: 'Sary fototra - Tetikasa' },
      jobs: { fr: 'Image de fond - Offres', mg: 'Sary fototra - Asa' },
      blog: { fr: 'Image de fond - Blog', mg: 'Sary fototra - Blaogy' },
      contact: { fr: 'Image de fond - Contact', mg: 'Sary fototra - Fifandraisana' },
      login: { fr: 'Image de fond - Connexion', mg: 'Sary fototra - Fidirana' },
      all: { fr: 'Image de fond - Toutes les pages', mg: 'Sary fototra - Pejy rehetra' },
      register: { fr: 'Image de fond - Inscription', mg: 'Sary fototra - Fisoratana' },
    };

    return {
      page_key: pageKey,
      image_url: defaultImages[pageKey] || defaultImages.home,
      alt_fr: titles[pageKey]?.fr || `Image de fond ${pageKey}`,
      alt_mg: titles[pageKey]?.mg || `Sary fototra ${pageKey}`,
      is_active: true,
      overlay_opacity: 30,
      position: 'center',
      size: 'cover',
      blur: 0,
      brightness: 100,
    };
  }
}