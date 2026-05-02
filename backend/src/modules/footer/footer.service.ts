import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FooterSection } from './entities/footer-section.entity';
import { FooterLink } from './entities/footer-link.entity';
import { FooterContact } from './entities/footer-contact.entity';
import { FooterLegalLink } from './entities/footer-legal-link.entity';

@Injectable()
export class FooterService {
  constructor(
    @InjectRepository(FooterSection)
    private sectionRepository: Repository<FooterSection>,
    @InjectRepository(FooterLink)
    private linkRepository: Repository<FooterLink>,
    @InjectRepository(FooterContact)
    private contactRepository: Repository<FooterContact>,
    @InjectRepository(FooterLegalLink)
    private legalLinkRepository: Repository<FooterLegalLink>,
  ) {}

  async getFooterData() {
    try {
      // Récupérer les sections
      const sections = await this.sectionRepository.find({
        order: { orderNum: 'ASC' },
      });

      // Récupérer les liens pour chaque section
      const sectionsWithLinks = await Promise.all(
        sections.map(async (section) => {
          const links = await this.linkRepository.find({
            where: { sectionId: section.id },
            order: { orderNum: 'ASC' },
          });
          return {
            id: section.id,
            title: section.title,
            title_mg: section.title_mg || '',
            order: section.orderNum,
            links: links.map(link => ({
              id: link.id,
              title: link.title,
              title_mg: link.title_mg || '',
              url: link.url,
              order: link.orderNum,
            })),
          };
        }),
      );

      // Récupérer les contacts
      const contactInfo = await this.contactRepository.find({
        order: { orderNum: 'ASC' },
      });

      // Récupérer les liens légaux
      const legalLinks = await this.legalLinkRepository.find({
        order: { orderNum: 'ASC' },
      });

      return {
        sections: sectionsWithLinks,
        contactInfo: contactInfo.map(c => ({
          id: c.id,
          type: c.type,
          value: c.value,
          icon: c.icon,
          order: c.orderNum,
        })),
        legalLinks: legalLinks.map(l => ({
          id: l.id,
          title: l.title,
          url: l.url,
          order: l.orderNum,
        })),
        copyright: `© ${new Date().getFullYear()} Y-Mad. Tous droits réservés.`,
      };
    } catch (error) {
      console.error('Erreur footer:', error);
      // Retourner des données par défaut en cas d'erreur
      return {
        sections: [],
        contactInfo: [],
        legalLinks: [],
        copyright: `© ${new Date().getFullYear()} Y-Mad. Tous droits réservés.`,
      };
    }
  }
}