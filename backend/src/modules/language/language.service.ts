// backend/src/modules/language/language.service.ts

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Translation } from './entities/translation.entity';

@Injectable()
export class LanguageService {
  private readonly logger = new Logger(LanguageService.name);

  constructor(
    @InjectRepository(Translation)
    private translationRepository: Repository<Translation>,
  ) {}

  /**
   * Récupère toutes les traductions
   */
  async getAllTranslations(): Promise<Translation[]> {
    return this.translationRepository.find({
      order: { key: 'ASC' },
    });
  }

  /**
   * Récupère une traduction par sa clé
   */
  async getTranslation(key: string): Promise<Translation> {
    const translation = await this.translationRepository.findOne({ 
      where: { key } 
    });
    
    if (!translation) {
      throw new NotFoundException(`Traduction avec la clé "${key}" non trouvée`);
    }
    
    return translation;
  }

  /**
   * Récupère toutes les traductions pour une langue spécifique
   */
  async getTranslationsByLocale(locale: string): Promise<{ key: string; value: string }[]> {
    const translations = await this.translationRepository.find({
      order: { key: 'ASC' },
    });

    if (locale === 'fr') {
      return translations.map(t => ({ key: t.key, value: t.value_fr }));
    } else if (locale === 'mg') {
      return translations.map(t => ({ key: t.key, value: t.value_mg }));
    }
    
    return [];
  }

  /**
   * Crée ou met à jour une traduction
   */
  async createOrUpdate(
    key: string, 
    value_fr: string, 
    value_mg: string
  ): Promise<Translation> {
    let translation = await this.translationRepository.findOne({ 
      where: { key } 
    });
    
    if (translation) {
      translation.value_fr = value_fr;
      translation.value_mg = value_mg;
      this.logger.log(`Traduction mise à jour: ${key}`);
    } else {
      translation = this.translationRepository.create({ 
        key, 
        value_fr, 
        value_mg 
      });
      this.logger.log(`Nouvelle traduction créée: ${key}`);
    }
    
    return this.translationRepository.save(translation);
  }

  /**
   * Met à jour uniquement la version française
   */
  async updateFrench(key: string, value_fr: string): Promise<Translation> {
    let translation = await this.translationRepository.findOne({ 
      where: { key } 
    });
    
    if (!translation) {
      translation = this.translationRepository.create({ 
        key, 
        value_fr,
        value_mg: ''
      });
    } else {
      translation.value_fr = value_fr;
    }
    
    this.logger.log(`Traduction FR mise à jour: ${key}`);
    return this.translationRepository.save(translation);
  }

  /**
   * Met à jour uniquement la version malgache
   */
  async updateMalagasy(key: string, value_mg: string): Promise<Translation> {
    let translation = await this.translationRepository.findOne({ 
      where: { key } 
    });
    
    if (!translation) {
      translation = this.translationRepository.create({ 
        key, 
        value_fr: '',
        value_mg
      });
    } else {
      translation.value_mg = value_mg;
    }
    
    this.logger.log(`Traduction MG mise à jour: ${key}`);
    return this.translationRepository.save(translation);
  }

  /**
   * Supprime une traduction par sa clé
   */
  async deleteTranslation(key: string): Promise<{ success: boolean; message: string }> {
    const translation = await this.translationRepository.findOne({ 
      where: { key } 
    });
    
    if (!translation) {
      throw new NotFoundException(`Traduction avec la clé "${key}" non trouvée`);
    }
    
    await this.translationRepository.delete({ key });
    this.logger.log(`Traduction supprimée: ${key}`);
    
    return { success: true, message: `Traduction "${key}" supprimée avec succès` };
  }

  /**
   * Supprime toutes les traductions (attention!)
   */
  async deleteAllTranslations(): Promise<{ success: boolean; message: string }> {
    const count = await this.translationRepository.count();
    await this.translationRepository.clear();
    this.logger.warn(`Toutes les traductions ont été supprimées (${count} entrées)`);
    
    return { success: true, message: `${count} traductions supprimées` };
  }

  /**
   * Compte le nombre total de traductions
   */
  async countTranslations(): Promise<number> {
    return this.translationRepository.count();
  }

  /**
   * Exporte toutes les traductions en JSON
   */
  async exportTranslations(): Promise<{
    fr: Record<string, string>;
    mg: Record<string, string>;
  }> {
    const translations = await this.translationRepository.find();
    
    const fr: Record<string, string> = {};
    const mg: Record<string, string> = {};
    
    for (const t of translations) {
      fr[t.key] = t.value_fr;
      mg[t.key] = t.value_mg;
    }
    
    return { fr, mg };
  }

  /**
   * Importe des traductions depuis un objet JSON
   */
  async importTranslations(
    data: { fr: Record<string, string>; mg: Record<string, string> }
  ): Promise<{ success: boolean; imported: number }> {
    let imported = 0;
    
    const allKeys = new Set([
      ...Object.keys(data.fr || {}),
      ...Object.keys(data.mg || {})
    ]);
    
    for (const key of allKeys) {
      const value_fr = data.fr?.[key] || '';
      const value_mg = data.mg?.[key] || '';
      
      await this.createOrUpdate(key, value_fr, value_mg);
      imported++;
    }
    
    this.logger.log(`${imported} traductions importées`);
    return { success: true, imported };
  }
}