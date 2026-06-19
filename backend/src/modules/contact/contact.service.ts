// backend/src/modules/contact/contact.service.ts

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  // ============================================================
  // CREATION D'UN MESSAGE
  // ============================================================

  async createMessage(createDto: CreateContactDto, ipAddress?: string): Promise<Contact> {
    // ✅ Utiliser full_name ou name
    const name = createDto.full_name || createDto.name || '';
    
    if (!name) {
      throw new BadRequestException('Le nom est requis');
    }

    this.logger.log(`Nouveau message de ${name} (${createDto.email})`);

    const message = this.contactRepository.create({
      name: name,
      email: createDto.email,
      phone: createDto.phone || null,
      subject: createDto.subject,
      message: createDto.message,
      status: 'unread', // ✅ Utiliser 'unread' au lieu de 'new'
      ip_address: ipAddress || null,
    });

    const saved = await this.contactRepository.save(message);
    this.logger.log(`Message enregistre avec l'ID: ${saved.id}`);
    
    return saved;
  }

  // ============================================================
  // RECUPERATION DES MESSAGES
  // ============================================================

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string,
  ): Promise<{ data: Contact[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Contact> = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      // Recherche par nom, email ou sujet
      where.name = Like(`%${search}%`);
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
    };
  }

  // ============================================================
  // STATISTIQUES
  // ============================================================

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

  // ============================================================
  // MISE A JOUR DU STATUT
  // ============================================================

  async updateStatus(id: string, updateDto: UpdateContactStatusDto): Promise<Contact> {
    const message = await this.findOne(id);
    
    if (updateDto.status === 'replied' && message.status !== 'replied') {
      message.replied_at = new Date();
    }

    message.status = updateDto.status;
    
    if (updateDto.admin_notes !== undefined) {
      message.admin_notes = updateDto.admin_notes;
    }

    await this.contactRepository.save(message);
    this.logger.log(`Statut du message ${id} mis a jour: ${updateDto.status}`);
    
    return message;
  }

  // ============================================================
  // EXPORT
  // ============================================================

  async exportMessages(status?: string): Promise<any[]> {
    const where: FindOptionsWhere<Contact> = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const messages = await this.contactRepository.find({
      where,
      order: { created_at: 'DESC' },
    });

    return messages.map(msg => ({
      'ID': msg.id,
      'Nom': msg.name,
      'Email': msg.email,
      'Telephone': msg.phone || '',
      'Sujet': msg.subject,
      'Message': msg.message,
      'Statut': msg.status,
      'Date': msg.created_at,
    }));
  }

  async findOne(id: string): Promise<Contact> {
    const message = await this.contactRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message avec ID ${id} non trouve`);
    }
    return message;
  }

  async deleteMessage(id: string): Promise<void> {
    const message = await this.findOne(id);
    await this.contactRepository.remove(message);
    this.logger.log(`Message ${id} supprime`);
  }
}