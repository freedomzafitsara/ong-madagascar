import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Background, BackgroundPage } from '../../entities/background.entity';
import { CreateBackgroundDto, UpdateBackgroundDto } from './dto/create-background.dto';

@Injectable()
export class BackgroundsService {
  constructor(
    @InjectRepository(Background)
    private backgroundRepository: Repository<Background>,
  ) {}

  async create(createDto: CreateBackgroundDto, userRole: string): Promise<Background> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Seul un administrateur peut gérer les fonds d\'écran');
    }

    const background = this.backgroundRepository.create(createDto);
    return this.backgroundRepository.save(background);
  }

  async findAll(userRole: string): Promise<Background[]> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Accès non autorisé');
    }
    return this.backgroundRepository.find({
      order: { page: 'ASC' },
    });
  }

  async findOne(id: string, userRole: string): Promise<Background> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Accès non autorisé');
    }
    const background = await this.backgroundRepository.findOne({ where: { id } });
    if (!background) throw new NotFoundException('Fond d\'écran non trouvé');
    return background;
  }

  async findByPage(page: string): Promise<Background | null> {
    return this.backgroundRepository.findOne({
      where: { page, is_active: true },
    });
  }

  async update(id: string, updateDto: UpdateBackgroundDto, userRole: string): Promise<Background> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Seul un administrateur peut modifier les fonds d\'écran');
    }
    await this.backgroundRepository.update(id, updateDto);
    return this.findOne(id, userRole);
  }

  async delete(id: string, userRole: string): Promise<void> {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      throw new ForbiddenException('Seul un administrateur peut supprimer les fonds d\'écran');
    }
    await this.backgroundRepository.delete(id);
  }

  async getActiveBackgrounds(): Promise<Background[]> {
    return this.backgroundRepository.find({
      where: { is_active: true },
    });
  }
}