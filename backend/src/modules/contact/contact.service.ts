// backend/src/modules/contact/contact.service.ts

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto, UpdateContactStatusDto, ReplyContactDto, ContactQueryDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  // ============================================================
  // ENVOYER UN MESSAGE (Public)
  // ============================================================
  async create(createDto: CreateContactDto, ipAddress: string): Promise<Contact> {
    try {
      // Vérifier le rate limiting (max 3 messages par IP par heure)
      const recentMessages = await this.contactRepository.count({
        where: { ip_address: ipAddress },
      });

      if (recentMessages >= 3) {
        throw new BadRequestException('Vous avez atteint la limite de 3 messages par heure');
      }

      const contact = this.contactRepository.create({
        full_name: createDto.full_name,
        email: createDto.email,
        subject: createDto.subject,
        message: createDto.message,
        ip_address: ipAddress,
        status: 'unread',
      });

      const saved = await this.contactRepository.save(contact);
      this.logger.log(`Nouveau message de contact: ${saved.email} - ${saved.subject}`);
      return saved;
    } catch (error) {
      this.logger.error(`Erreur lors de la création: ${error.message}`);
      throw new BadRequestException(`Erreur lors de l'envoi: ${error.message}`);
    }
  }

  // ============================================================
  // LISTER TOUS LES MESSAGES (Admin)
  // ============================================================
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

    const where: FindOptionsWhere<Contact> = {};

    if (queryDto.status) where.status = queryDto.status;

    const queryBuilder = this.contactRepository.createQueryBuilder('c');

    if (queryDto.status) {
      queryBuilder.andWhere('c.status = :status', { status: queryDto.status });
    }

    if (queryDto.search) {
      queryBuilder.andWhere(
        '(c.full_name ILIKE :search OR c.email ILIKE :search OR c.subject ILIKE :search OR c.message ILIKE :search)',
        { search: `%${queryDto.search}%` }
      );
    }

    const [data, total] = await queryBuilder
      .orderBy('c.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, totalPages: Math.ceil(total / limit), limit };
  }

  // ============================================================
  // TROUVER UN MESSAGE PAR ID (Admin)
  // ============================================================
  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({ where: { id } });
    
    if (!contact) {
      throw new NotFoundException(`Message ${id} non trouvé`);
    }
    
    return contact;
  }

  // ============================================================
  // METTRE À JOUR LE STATUT (Admin)
  // ============================================================
  async updateStatus(id: string, updateDto: UpdateContactStatusDto, userId: string): Promise<Contact> {
    const contact = await this.findOne(id);
    
    contact.status = updateDto.status;
    if (updateDto.admin_notes) {
      contact.admin_notes = updateDto.admin_notes;
    }
    
    const updated = await this.contactRepository.save(contact);
    this.logger.log(`Statut du message mis à jour: ${id} -> ${updateDto.status}`);
    
    return updated;
  }

  // ============================================================
  // MARQUER COMME LU (Admin)
  // ============================================================
  async markAsRead(id: string, userId: string): Promise<Contact> {
    return this.updateStatus(id, { status: 'read' }, userId);
  }

  // ============================================================
  // MARQUER COMME RÉPONDU (Admin)
  // ============================================================
  async markAsReplied(id: string, userId: string): Promise<Contact> {
    const contact = await this.findOne(id);
    
    contact.status = 'replied';
    contact.replied_at = new Date();
    contact.replied_by = userId;
    
    const updated = await this.contactRepository.save(contact);
    this.logger.log(`Message marqué comme répondu: ${id}`);
    
    return updated;
  }

  // ============================================================
  // ARCHIVER UN MESSAGE (Admin)
  // ============================================================
  async archive(id: string, userId: string): Promise<Contact> {
    return this.updateStatus(id, { status: 'archived' }, userId);
  }

  // ============================================================
  // SUPPRIMER UN MESSAGE (Super Admin)
  // ============================================================
  async remove(id: string): Promise<void> {
    const contact = await this.findOne(id);
    await this.contactRepository.remove(contact);
    this.logger.log(`Message supprimé: ${id}`);
  }

  // ============================================================
  // STATISTIQUES (Admin)
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
}