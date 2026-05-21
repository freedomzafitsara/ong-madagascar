import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Background } from '../../entities/background.entity';
import { CreateBackgroundDto, UpdateBackgroundDto } from './dto/create-background.dto';

@Injectable()
export class BackgroundsService {
  constructor(
    @InjectRepository(Background)
    private backgroundRepository: Repository<Background>,
  ) {}

  async create(createDto: CreateBackgroundDto): Promise<Background> {
    const background = this.backgroundRepository.create(createDto);
    return this.backgroundRepository.save(background);
  }

  async findAll(): Promise<Background[]> {
    return this.backgroundRepository.find({
      order: { page: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Background> {
    const background = await this.backgroundRepository.findOne({ where: { id } });
    if (!background) {
      throw new NotFoundException('Fond d ecran non trouve');
    }
    return background;
  }

  async findByPage(page: string): Promise<Background | null> {
    return this.backgroundRepository.findOne({
      where: { page, is_active: true },
    });
  }

  async update(id: string, updateDto: UpdateBackgroundDto): Promise<Background> {
    await this.backgroundRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.backgroundRepository.delete(id);
  }

  async getActiveBackgrounds(): Promise<Background[]> {
    return this.backgroundRepository.find({
      where: { is_active: true },
    });
  }
}