import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Event } from '../../entities/event.entity';
import { CreateEventDto, UpdateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto, userId: string): Promise<Event> {
    try {
      const event = this.eventRepository.create({
        title: createEventDto.title,
        title_mg: createEventDto.title_mg,
        description: createEventDto.description,
        description_mg: createEventDto.description_mg,
        type: createEventDto.type,
        status: createEventDto.status || 'draft',
        location: createEventDto.location,
        region: createEventDto.region,
        startDate: createEventDto.startDate,
        endDate: createEventDto.endDate,
        maxCapacity: createEventDto.maxCapacity || null,
        currentRegistrations: 0,
        isFree: createEventDto.isFree !== undefined ? createEventDto.isFree : true,
        price: createEventDto.price || 0,
        imageUrl: createEventDto.imageUrl,
        createdBy: userId,
      });
      
      return await this.eventRepository.save(event);
    } catch (error) {
      console.error('Erreur creation evenement:', error);
      throw new BadRequestException(error.message);
    }
  }

  async findAll(page: number = 1, limit: number = 10, type?: string, status?: string, search?: string) {
    try {
      const skip = (page - 1) * limit;
      const query = this.eventRepository.createQueryBuilder('event');
      
      if (status && status !== 'all') {
        query.andWhere('event.status = :status', { status });
      }
      
      if (type && type !== 'all') {
        query.andWhere('event.type = :type', { type });
      }
      
      if (search) {
        query.andWhere('(event.title ILIKE :search OR event.description ILIKE :search)', { 
          search: `%${search}%` 
        });
      }
      
      const [data, total] = await query
        .orderBy('event.startDate', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();
      
      return { data, total, page, totalPages: Math.ceil(total / limit), limit };
    } catch (error) {
      return { data: [], total: 0, page: 1, totalPages: 0, limit };
    }
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Evenement avec l'id ${id} non trouve`);
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);
    Object.assign(event, updateEventDto);
    return await this.eventRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
  }

  async getStats() {
    const now = new Date();
    const total = await this.eventRepository.count();
    const published = await this.eventRepository.count({ where: { status: 'published' } });
    const draft = await this.eventRepository.count({ where: { status: 'draft' } });
    const upcoming = await this.eventRepository.count({ 
      where: { status: 'published', startDate: MoreThan(now) } 
    });
    return { total, published, draft, upcoming };
  }

  async getUpcomingEvents(limit: number = 5) {
    const now = new Date();
    return this.eventRepository.find({
      where: { status: 'published', startDate: MoreThan(now) },
      order: { startDate: 'ASC' },
      take: limit,
    });
  }

  async changeStatus(id: string, status: string): Promise<Event> {
    const event = await this.findOne(id);
    event.status = status;
    return await this.eventRepository.save(event);
  }
}