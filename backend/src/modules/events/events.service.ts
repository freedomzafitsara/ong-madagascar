import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Event, EventStatus } from '../../entities/event.entity';
import { EventRegistration, RegistrationStatus, PaymentStatus } from '../../entities/event-registration.entity';
import { User } from '../../entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import * as crypto from 'crypto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(EventRegistration)
    private registrationRepository: Repository<EventRegistration>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ============================================================
  // SECTION 1 : GESTION DES EVENEMENTS (CRUD)
  // ============================================================

  async create(createDto: CreateEventDto, userId: string): Promise<Event> {
    const event = this.eventRepository.create({
      ...createDto,
      createdBy: userId,
      currentRegistrations: 0,
    });
    return this.eventRepository.save(event);
  }

  async update(id: string, updateDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);
    Object.assign(event, updateDto);
    return this.eventRepository.save(event);
  }

  async updateStatus(id: string, status: string): Promise<Event> {
    const event = await this.findOne(id);
    event.status = status;
    return this.eventRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
  }

  // ============================================================
  // SECTION 2 : GESTION DES INSCRIPTIONS
  // ============================================================

  async registerToEvent(
    eventId: string,
    registrationDto: CreateRegistrationDto,
    userId?: string,
  ): Promise<{ registration: EventRegistration; qrCodeData: string }> {
    this.logger.log(`Tentative d inscription pour l evenement ${eventId}`);

    const event = await this.findOne(eventId);

    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException("Cet evenement n est pas encore publie");
    }

    const registrationsCount = await this.registrationRepository.count({
      where: { eventId, status: RegistrationStatus.CONFIRMED },
    });

    if (event.maxCapacity > 0 && registrationsCount >= event.maxCapacity) {
      throw new BadRequestException("L evenement est complet");
    }

    const existingRegistration = await this.registrationRepository.findOne({
      where: { eventId, email: registrationDto.email, status: RegistrationStatus.CONFIRMED },
    });

    if (existingRegistration) {
      throw new BadRequestException("Cet email est deja inscrit a cet evenement");
    }

    const amountPaid = event.isFree ? 0 : (event.price || 0);

    const registration = this.registrationRepository.create({
      eventId,
      userId: userId || null,
      fullName: registrationDto.fullName,
      email: registrationDto.email,
      phone: registrationDto.phone || null,
      paymentMethod: registrationDto.paymentMethod || null,
      amountPaid: amountPaid,
      status: RegistrationStatus.CONFIRMED,
      paymentStatus: event.isFree ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
    });

    const qrCodeData = JSON.stringify({
      id: crypto.randomUUID(),
      eventId: event.id,
      eventTitle: event.title,
      registrationId: registration.id,
      fullName: registration.fullName,
      email: registration.email,
      date: new Date().toISOString(),
    });
    registration.qrCodeData = qrCodeData;

    const savedRegistration = await this.registrationRepository.save(registration);
    this.logger.log(`Inscription creee avec l id ${savedRegistration.id}`);

    event.currentRegistrations = registrationsCount + 1;
    await this.eventRepository.save(event);

    return {
      registration: savedRegistration,
      qrCodeData: qrCodeData,
    };
  }

  async getRegistrationsByEvent(
    eventId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: EventRegistration[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await this.registrationRepository.findAndCount({
      where: { eventId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getRegistrationById(id: string): Promise<EventRegistration> {
    const registration = await this.registrationRepository.findOne({
      where: { id },
      relations: ['event', 'user'],
    });
    
    if (!registration) {
      throw new NotFoundException('Inscription non trouvee');
    }
    
    return registration;
  }

  async confirmPayment(registrationId: string): Promise<EventRegistration> {
    const registration = await this.getRegistrationById(registrationId);
    
    registration.paymentStatus = PaymentStatus.COMPLETED;
    registration.status = RegistrationStatus.CONFIRMED;
    
    await this.registrationRepository.save(registration);
    this.logger.log(`Paiement confirme pour l inscription ${registrationId}`);
    
    return registration;
  }

  async cancelRegistration(registrationId: string): Promise<EventRegistration> {
    const registration = await this.getRegistrationById(registrationId);
    
    registration.status = RegistrationStatus.CANCELLED;
    registration.cancelledAt = new Date();
    
    await this.registrationRepository.save(registration);
    this.logger.log(`Inscription annulee ${registrationId}`);
    
    const event = registration.event;
    if (event) {
      event.currentRegistrations = Math.max(0, (event.currentRegistrations || 0) - 1);
      await this.eventRepository.save(event);
    }
    
    return registration;
  }

  async checkIn(registrationId: string): Promise<EventRegistration> {
    const registration = await this.getRegistrationById(registrationId);
    
    if (registration.status !== RegistrationStatus.CONFIRMED) {
      throw new BadRequestException("Seule une inscription confirmee peut etre validee");
    }
    
    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    registration.status = RegistrationStatus.ATTENDED;
    
    await this.registrationRepository.save(registration);
    this.logger.log(`Check-in effectue pour l inscription ${registrationId}`);
    
    return registration;
  }

  async getRegistrationStats(eventId: string): Promise<{
    total: number;
    confirmed: number;
    cancelled: number;
    attended: number;
    pending: number;
  }> {
    const total = await this.registrationRepository.count({ where: { eventId } });
    const confirmed = await this.registrationRepository.count({ 
      where: { eventId, status: RegistrationStatus.CONFIRMED } 
    });
    const cancelled = await this.registrationRepository.count({ 
      where: { eventId, status: RegistrationStatus.CANCELLED } 
    });
    const attended = await this.registrationRepository.count({ 
      where: { eventId, status: RegistrationStatus.ATTENDED } 
    });
    const pending = await this.registrationRepository.count({ 
      where: { eventId, status: RegistrationStatus.PENDING } 
    });

    return { total, confirmed, cancelled, attended, pending };
  }

  // ============================================================
  // SECTION 3 : METHODES DE RECHERCHE PUBLIQUE
  // ============================================================

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: string,
    type?: string,
    search?: string
  ): Promise<{ data: Event[]; total: number; page: number; totalPages: number }> {
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
        query.andWhere(
          '(event.title ILIKE :search OR event.title_mg ILIKE :search OR event.location ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      const [data, total] = await query
        .orderBy('event.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return { data, total, page, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      this.logger.error(`Erreur findAll: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  // METHODE PRINCIPALE POUR LE FRONTEND PUBLIC
  async findPublic(
    page: number = 1,
    limit: number = 9,
    type?: string
  ): Promise<{ data: Event[]; total: number; page: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;

      // Construction de la requête
      const query = this.eventRepository.createQueryBuilder('event')
        .where('event.status = :status', { status: EventStatus.PUBLISHED });

      // Filtre par type si fourni
      if (type && type !== 'all') {
        query.andWhere('event.type = :type', { type });
      }

      // Exécution de la requête
      const [data, total] = await query
        .orderBy('event.startDate', 'ASC')  // Tri par date de début croissante
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      this.logger.log(`findPublic: ${data.length} evenements publies trouves (total: ${total})`);
      
      return { data, total, page, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      this.logger.error(`Erreur findPublic: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  async findUpcoming(limit: number = 6): Promise<Event[]> {
    try {
      const now = new Date();
      return await this.eventRepository.find({
        where: { status: EventStatus.PUBLISHED },
        order: { startDate: 'ASC' },
        take: limit,
      });
    } catch (error) {
      this.logger.error(`Erreur findUpcoming: ${error.message}`);
      return [];
    }
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('Evenement non trouve');
    }
    return event;
  }

  async getStats(): Promise<{ total: number; published: number; draft: number; upcoming: number }> {
    try {
      const now = new Date();
      const total = await this.eventRepository.count();
      const published = await this.eventRepository.count({ where: { status: EventStatus.PUBLISHED } });
      const draft = await this.eventRepository.count({ where: { status: EventStatus.DRAFT } });
      const upcoming = await this.eventRepository.count({
        where: { status: EventStatus.PUBLISHED, startDate: MoreThan(now) },
      });

      this.logger.log(`Stats: total=${total}, published=${published}, draft=${draft}, upcoming=${upcoming}`);
      
      return { total, published, draft, upcoming };
    } catch (error) {
      this.logger.error(`Erreur getStats: ${error.message}`);
      return { total: 0, published: 0, draft: 0, upcoming: 0 };
    }
  }
}