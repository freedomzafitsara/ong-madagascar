// backend/src/modules/contact/contact.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, MoreThanOrEqual, Between, In } from 'typeorm';
import { Contact, ContactStatus } from './entities/contact.entity';
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
  // CRÉATION D'UN MESSAGE
  // ============================================================

  async createMessage(createDto: CreateContactDto, ipAddress?: string): Promise<Contact> {
    try {
      // ✅ Utiliser full_name directement
      const name = createDto.full_name || 'Client';
      
      this.logger.log(`📩 Nouveau message de ${name} (${createDto.email})`);

      const message = this.contactRepository.create({
        name: name,
        email: createDto.email,
        phone: createDto.phone || null,
        subject: createDto.subject || 'Sans sujet',
        message: createDto.message,
        status: 'unread',
        ip_address: ipAddress || null,
      });

      const saved = await this.contactRepository.save(message);
      this.logger.log(`✅ Message enregistré avec l'ID: ${saved.id}`);
      
      return saved;
    } catch (error) {
      this.logger.error(`❌ Erreur création message: ${error.message}`);
      throw new BadRequestException(`Erreur lors de la création du message: ${error.message}`);
    }
  }

  // ============================================================
  // RÉCUPÉRATION DES MESSAGES
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
      const validStatuses: ContactStatus[] = ['unread', 'read', 'replied', 'archived'];
      if (validStatuses.includes(status as ContactStatus)) {
        where.status = status as ContactStatus;
      }
    }

    if (search && search.trim().length >= 2) {
      const searchTerm = `%${search.trim()}%`;
      return this.contactRepository
        .createQueryBuilder('contact')
        .where('contact.name ILIKE :search', { search: searchTerm })
        .orWhere('contact.email ILIKE :search', { search: searchTerm })
        .orWhere('contact.subject ILIKE :search', { search: searchTerm })
        .orWhere('contact.message ILIKE :search', { search: searchTerm })
        .andWhere(status && status !== 'all' ? 'contact.status = :status' : '1=1', { status })
        .orderBy('contact.created_at', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount()
        .then(([data, total]) => ({
          data,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        }));
    }

    const [data, total] = await this.contactRepository.findAndCount({
      where: Object.keys(where).length > 0 ? where : undefined,
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
    thisWeek: number;
    thisMonth: number;
    pending: number;
  }> {
    const total = await this.contactRepository.count();
    const unread = await this.contactRepository.count({ where: { status: 'unread' } });
    const read = await this.contactRepository.count({ where: { status: 'read' } });
    const replied = await this.contactRepository.count({ where: { status: 'replied' } });
    const archived = await this.contactRepository.count({ where: { status: 'archived' } });

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const thisWeek = await this.contactRepository.count({
      where: { created_at: MoreThanOrEqual(startOfWeek) },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const thisMonth = await this.contactRepository.count({
      where: { created_at: MoreThanOrEqual(startOfMonth) },
    });

    const pending = unread + read;

    return { 
      total, 
      unread, 
      read, 
      replied, 
      archived,
      thisWeek,
      thisMonth,
      pending,
    };
  }

  // ============================================================
  // MISE À JOUR DU STATUT
  // ============================================================

  async updateStatus(id: string, updateDto: UpdateContactStatusDto): Promise<Contact> {
    const message = await this.findOne(id);
    
    message.status = updateDto.status;
    
    if (updateDto.status === 'replied') {
      message.replied_at = new Date();
    }
    
    if (updateDto.status === 'read' && message.status === 'unread') {
      message.read_at = new Date();
    }
    
    if (updateDto.admin_notes !== undefined) {
      message.admin_notes = updateDto.admin_notes;
    }

    await this.contactRepository.save(message);
    this.logger.log(`✅ Statut du message ${id} mis à jour: ${updateDto.status}`);
    
    return message;
  }

  // ============================================================
  // EXPORT
  // ============================================================

  async exportMessages(status?: string): Promise<any[]> {
    const where: FindOptionsWhere<Contact> = {};
    
    if (status && status !== 'all') {
      const validStatuses: ContactStatus[] = ['unread', 'read', 'replied', 'archived'];
      if (validStatuses.includes(status as ContactStatus)) {
        where.status = status as ContactStatus;
      }
    }

    const messages = await this.contactRepository.find({
      where: Object.keys(where).length > 0 ? where : undefined,
      order: { created_at: 'DESC' },
    });

    return messages.map(msg => ({
      'ID': msg.id,
      'Nom': msg.name,
      'Email': msg.email,
      'Téléphone': msg.phone || '',
      'Sujet': msg.subject,
      'Message': msg.message.replace(/<[^>]*>/g, '').substring(0, 1000),
      'Statut': msg.getStatusLabel('fr'),
      'Date': new Date(msg.created_at).toLocaleDateString('fr-FR'),
      'Heure': new Date(msg.created_at).toLocaleTimeString('fr-FR'),
      'IP': msg.ip_address || '',
      'Notes': msg.admin_notes || '',
    }));
  }

  // ============================================================
  // SUPPRESSION
  // ============================================================

  async findOne(id: string): Promise<Contact> {
    const message = await this.contactRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message avec ID ${id} non trouvé`);
    }
    return message;
  }

  async deleteMessage(id: string): Promise<void> {
    const message = await this.findOne(id);
    await this.contactRepository.remove(message);
    this.logger.log(`🗑️ Message ${id} supprimé`);
  }

  // ============================================================
  // SUPPRESSION MULTIPLE
  // ============================================================

  async deleteMultiple(ids: string[]): Promise<{ deleted: number }> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Aucun ID fourni');
    }

    const result = await this.contactRepository.delete({ id: In(ids) });
    this.logger.log(`🗑️ ${result.affected} messages supprimés`);
    return { deleted: result.affected || 0 };
  }

  // ============================================================
  // ARCHIVER MULTIPLE
  // ============================================================

  async archiveMultiple(ids: string[]): Promise<{ archived: number }> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Aucun ID fourni');
    }

    const result = await this.contactRepository.update(
      { id: In(ids) },
      { status: 'archived' }
    );
    
    this.logger.log(`📦 ${result.affected} messages archivés`);
    return { archived: result.affected || 0 };
  }

  // ============================================================
  // RECHERCHE
  // ============================================================

  async searchMessages(query: string): Promise<Contact[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = `%${query.trim()}%`;
    return this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.name ILIKE :search', { search: searchTerm })
      .orWhere('contact.email ILIKE :search', { search: searchTerm })
      .orWhere('contact.subject ILIKE :search', { search: searchTerm })
      .orWhere('contact.message ILIKE :search', { search: searchTerm })
      .orderBy('contact.created_at', 'DESC')
      .take(20)
      .getMany();
  }

  // ============================================================
  // STATISTIQUES DE PERFORMANCE
  // ============================================================

  async getPerformanceStats(): Promise<{
    averageResponseTime: number;
    responseRate: number;
    messagesPerDay: number;
  }> {
    const repliedMessages = await this.contactRepository.find({
      where: { status: 'replied' },
      select: ['created_at', 'replied_at'],
    });

    let totalResponseTime = 0;
    let responseCount = 0;

    repliedMessages.forEach(msg => {
      if (msg.replied_at) {
        const diff = msg.replied_at.getTime() - msg.created_at.getTime();
        totalResponseTime += diff;
        responseCount++;
      }
    });

    const averageResponseTime = responseCount > 0 
      ? Math.round(totalResponseTime / responseCount / (1000 * 60 * 60))
      : 0;

    const total = await this.contactRepository.count();
    const replied = await this.contactRepository.count({ where: { status: 'replied' } });
    const responseRate = total > 0 ? Math.round((replied / total) * 100) : 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentMessages = await this.contactRepository.count({
      where: { created_at: MoreThanOrEqual(thirtyDaysAgo) },
    });

    return {
      averageResponseTime,
      responseRate,
      messagesPerDay: Math.round(recentMessages / 30),
    };
  }
}