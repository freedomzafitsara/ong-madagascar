import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../entities/event.entity';
import { EventRegistration } from '../../entities/event-registration.entity';

export class CreateEventDto {
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  type: string;
  location?: string;
  region?: string;
  startDate: Date;
  endDate: Date;
  maxCapacity?: number;
  isFree?: boolean;
  price?: number;
  imageUrl?: string;
  program?: string;
  speakers?: string;
}

export class RegisterToEventDto {
  eventId: string;
}

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(EventRegistration)
    private registrationRepository: Repository<EventRegistration>,
  ) {}

  async createEvent(createEventDto: CreateEventDto, userId: string) {
    const event = this.eventRepository.create({
      ...createEventDto,
      createdBy: userId,
      status: 'published',
    });
    return this.eventRepository.save(event);
  }

  async findAll(page: number = 1, limit: number = 9, type?: string, region?: string) {
    const skip = (page - 1) * limit;
    const query: any = { status: 'published' };
    if (type) query.type = type;
    if (region) query.region = region;

    const [data, total] = await this.eventRepository.findAndCount({
      where: query,
      order: { startDate: 'ASC' },
      skip,
      take: limit,
    });

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Événement non trouvé');
    return event;
  }

  async register(userId: string, eventId: string) {
    const existing = await this.registrationRepository.findOne({
      where: { userId, eventId },
    });

    if (existing) {
      return { success: false, message: 'Vous êtes déjà inscrit à cet événement' };
    }

    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    const registration = this.registrationRepository.create({
      userId,
      eventId,
      ticketNumber,
      status: 'confirmed',
    });

    await this.registrationRepository.save(registration);
    
    return { success: true, message: 'Inscription réussie', registration };
  }

  async getUserRegistrations(userId: string) {
    return this.registrationRepository.find({
      where: { userId },
      relations: ['event'],
      order: { registeredAt: 'DESC' },
    });
  }

  async getEventRegistrations(eventId: string) {
    return this.registrationRepository.find({
      where: { eventId },
      relations: ['user'],
    });
  }

  async updateEvent(id: string, updateData: Partial<CreateEventDto>) {
    await this.eventRepository.update(id, updateData);
    return this.findOne(id);
  }

  async deleteEvent(id: string) {
    await this.eventRepository.delete(id);
    return { success: true };
  }
}