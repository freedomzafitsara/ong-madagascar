// backend/src/modules/footer/footer.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FooterSection } from '../../entities/footer-section.entity';
import { FooterLink } from '../../entities/footer-link.entity';
import { FooterContact } from '../../entities/footer-contact.entity';
import { FooterLegalLink } from '../../entities/footer-legal-link.entity';

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
      const sections = await this.sectionRepository.find({
        where: { is_active: true },
        order: { order: 'ASC' },
      });

      for (const section of sections) {
        section.links = await this.linkRepository.find({
          where: { section: { id: section.id }, is_active: true },
          order: { order: 'ASC' },
        });
      }

      const contactInfo = await this.contactRepository.find({
        where: { is_active: true },
        order: { order: 'ASC' },
      });

      const legalLinks = await this.legalLinkRepository.find({
        where: { is_active: true },
        order: { order: 'ASC' },
      });

      return {
        sections,
        contactInfo,
        legalLinks,
        copyright: `© ${new Date().getFullYear()} ONG Madagascar. Tous droits réservés.`,
      };
    } catch (error) {
      console.error('Erreur footer:', error);
      return {
        sections: [],
        contactInfo: [],
        legalLinks: [],
        copyright: `© ${new Date().getFullYear()} ONG Madagascar. Tous droits réservés.`,
      };
    }
  }
}