// backend/src/modules/contact/contact.service.ts

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto, UpdateContactStatusDto, ContactQueryDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async create(createDto: CreateContactDto, ipAddress: string): Promise<Contact> {
    try {
      const contact = this.contactRepository.create({
        name: createDto.name,  // Changé: full_name -> name
        email: createDto.email,
        phone: createDto.phone || null,
        subject: createDto.subject,
        message: createDto.message,
        ip_address: ipAddress,
        status: 'unread',
      });

      const saved = await this.contactRepository.save(contact);
      this.logger.log(`Nouveau message de contact: ${saved.email} - ${saved.subject}`);
      return saved;
    } catch (error) {
      this.logger.error(`Erreur lors de la creation: ${error.message}`);
      throw new BadRequestException(`Erreur lors de l'envoi: ${error.message}`);
    }
  }

  async findAll(queryDto: ContactQueryDto): Promise<{
    data: Contact[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  }> {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (queryDto.status && queryDto.status !== 'all') {
      where.status = queryDto.status;
    }

    if (queryDto.search) {
      const [data, total] = await this.contactRepository.findAndCount({
        where: [
          { name: Like(`%${queryDto.search}%`) },
          { email: Like(`%${queryDto.search}%`) },
          { subject: Like(`%${queryDto.search}%`) },
        ],
        order: { created_at: 'DESC' },
        skip,
        take: limit,
      });

      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      };
    }

    const [data, total] = await this.contactRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    };
  }

  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) {
      throw new NotFoundException(`Message ${id} non trouve`);
    }
    return contact;
  }

  async updateStatus(id: string, status: string, userId?: string): Promise<Contact> {
    const contact = await this.findOne(id);
    contact.status = status;
    
    if (status === 'replied' && userId) {
      contact.replied_at = new Date();
      contact.replied_by_id = userId;
    }
    
    const updated = await this.contactRepository.save(contact);
    this.logger.log(`Statut du message mis a jour: ${id} -> ${status}`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const contact = await this.findOne(id);
    await this.contactRepository.remove(contact);
    this.logger.log(`Message supprime: ${id}`);
  }

  async getStats(): Promise<{
    total: number;
    unread: number;
    read: number;
    replied: number;
    archived: number;
  }> {
    const total = await this.contactRepository.count();
    const unread = await this.contactRepository.count({ where: { status: 'unread' } });
    const read = await this.contactRepository.count({ where: { status: 'read' } });
    const replied = await this.contactRepository.count({ where: { status: 'replied' } });
    const archived = await this.contactRepository.count({ where: { status: 'archived' } });

    return { total, unread, read, replied, archived };
  }
}