import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeaderSetting } from '../../entities/header.entity';
import { Navigation } from '../../entities/navigation.entity';

@Injectable()
export class HeaderService {
  constructor(
    @InjectRepository(HeaderSetting)
    private headerRepository: Repository<HeaderSetting>,
    @InjectRepository(Navigation)
    private navigationRepository: Repository<Navigation>,
  ) {}

  async getHeaderData() {
    const settings = await this.headerRepository.find({ where: { is_active: true } });
    const navLinks = await this.navigationRepository.find({
      where: { is_active: true, location: 'both' },
      order: { order: 'ASC' }
    });

    const headerData: any = {};
    settings.forEach(setting => {
      headerData[setting.key] = setting.value;
    });

    return {
      logo: headerData.logo ? JSON.parse(headerData.logo) : null,
      siteName: headerData.siteName || 'Y-Mad',
      siteNameMg: headerData.siteNameMg || 'Y-Mad',
      tagline: headerData.tagline || 'Jeunesse en Action',
      taglineMg: headerData.taglineMg || 'Tanora eo amin\'ny asa',
      navLinks,
      socialLinks: headerData.socialLinks ? JSON.parse(headerData.socialLinks) : [],
      contactInfo: headerData.contactInfo ? JSON.parse(headerData.contactInfo) : [],
    };
  }

  async updateHeaderSetting(key: string, value: any) {
    let setting = await this.headerRepository.findOne({ where: { key } });
    if (setting) {
      setting.value = typeof value === 'object' ? JSON.stringify(value) : value;
      await this.headerRepository.save(setting);
    } else {
      setting = this.headerRepository.create({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : value,
      });
      await this.headerRepository.save(setting);
    }
    return setting;
  }

  async updateNavLink(id: string, data: Partial<Navigation>) {
    await this.navigationRepository.update(id, data);
    return this.navigationRepository.findOne({ where: { id } });
  }
}