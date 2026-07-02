// backend/src/modules/preferences/preferences.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreference } from './entities/user-preference.entity';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectRepository(UserPreference)
    private preferenceRepository: Repository<UserPreference>,
  ) {}

  async getPreferences(userId: string): Promise<UserPreference> {
    let preferences = await this.preferenceRepository.findOne({
      where: { user_id: userId },
    });

    if (!preferences) {
      preferences = await this.createDefaultPreferences(userId);
    }

    return preferences;
  }

  async updatePreferences(
    userId: string,
    dto: UpdatePreferencesDto,
  ): Promise<UserPreference> {
    let preferences = await this.preferenceRepository.findOne({
      where: { user_id: userId },
    });

    if (!preferences) {
      preferences = await this.createDefaultPreferences(userId);
    }

    Object.assign(preferences, dto);
    return await this.preferenceRepository.save(preferences);
  }

  private async createDefaultPreferences(userId: string): Promise<UserPreference> {
    const defaults = this.preferenceRepository.create({
      user_id: userId,
      language: 'fr',
      timezone: 'Indian/Antananarivo',
      theme: 'light',
      font_size: 'medium',
      sidebar_collapsed: false,
      animations_enabled: true,
      density: 'comfortable',
      email_notifications: true,
      push_notifications: true,
      job_alerts: true,
      project_updates: true,
      blog_updates: false,
      system_updates: true,
    });

    return await this.preferenceRepository.save(defaults);
  }
}