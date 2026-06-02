import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Translation } from './entities/translation.entity';

@Injectable()
export class LanguageService {
  constructor(
    @InjectRepository(Translation)
    private translationRepository: Repository<Translation>,
  ) {}

  async getAllTranslations(): Promise<Translation[]> {
    return this.translationRepository.find();
  }

  async getTranslation(key: string): Promise<Translation> {
    return this.translationRepository.findOne({ where: { key } });
  }

  async createOrUpdate(key: string, value_fr: string, value_mg: string): Promise<Translation> {
    let translation = await this.translationRepository.findOne({ where: { key } });
    if (translation) {
      translation.value_fr = value_fr;
      translation.value_mg = value_mg;
    } else {
      translation = this.translationRepository.create({ key, value_fr, value_mg });
    }
    return this.translationRepository.save(translation);
  }

  async deleteTranslation(key: string): Promise<void> {
    await this.translationRepository.delete({ key });
  }
}
