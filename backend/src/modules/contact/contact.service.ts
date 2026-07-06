// backend/src/modules/contact/contact.service.ts

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, MoreThanOrEqual, Between, In } from 'typeorm';
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
    const name = createDto.full_name || '';
    
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
      status: 'unread',
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

    // ✅ CORRECTION: Utiliser un type guard pour s'assurer que status est valide
    if (status && status !== 'all') {
      const validStatuses: ('unread' | 'read' | 'replied' | 'archived')[] = ['unread', 'read', 'replied', 'archived'];
      if (validStatuses.includes(status as any)) {
        where.status = status as 'unread' | 'read' | 'replied' | 'archived';
      }
    }

    if (search) {
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
  // STATISTIQUES AVANCÉES
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
      where: {
        created_at: MoreThanOrEqual(startOfWeek),
      },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const thisMonth = await this.contactRepository.count({
      where: {
        created_at: MoreThanOrEqual(startOfMonth),
      },
    });

    const pending = await this.contactRepository.count({
      where: [
        { status: 'unread' },
        { status: 'read' },
      ],
    });

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
  // STATISTIQUES PAR PERIODE
  // ============================================================

  async getStatsByPeriod(startDate: Date, endDate: Date): Promise<{
    total: number;
    byStatus: Record<string, number>;
    daily: { date: string; count: number }[];
  }> {
    const messages = await this.contactRepository.find({
      where: {
        created_at: Between(startDate, endDate),
      },
      order: { created_at: 'ASC' },
    });

    const total = messages.length;
    
    const byStatus: Record<string, number> = {};
    messages.forEach(msg => {
      byStatus[msg.status] = (byStatus[msg.status] || 0) + 1;
    });

    const dailyMap: Record<string, number> = {};
    messages.forEach(msg => {
      const date = msg.created_at.toISOString().split('T')[0];
      dailyMap[date] = (dailyMap[date] || 0) + 1;
    });

    const daily = Object.entries(dailyMap).map(([date, count]) => ({
      date,
      count,
    }));

    return { total, byStatus, daily };
  }

  // ============================================================
  // MISE A JOUR DU STATUT
  // ============================================================

  async updateStatus(id: string, updateDto: UpdateContactStatusDto): Promise<Contact> {
    const message = await this.findOne(id);
    
    if (!message) {
      throw new NotFoundException(`Message avec ID ${id} non trouve`);
    }

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
    this.logger.log(`Statut du message ${id} mis a jour: ${updateDto.status}`);
    
    return message;
  }

  // ============================================================
  // MARQUER COMME LU
  // ============================================================

  async markAsRead(id: string): Promise<Contact> {
    const message = await this.findOne(id);
    
    if (message.status === 'unread') {
      message.status = 'read';
      message.read_at = new Date();
      await this.contactRepository.save(message);
      this.logger.log(`Message ${id} marque comme lu`);
    }
    
    return message;
  }

  // ============================================================
  // MARQUER COMME REPONDU
  // ============================================================

  async markAsReplied(id: string): Promise<Contact> {
    const message = await this.findOne(id);
    
    message.status = 'replied';
    message.replied_at = new Date();
    await this.contactRepository.save(message);
    this.logger.log(`Message ${id} marque comme repondu`);
    
    return message;
  }

  // ============================================================
  // EXPORT
  // ============================================================

  async exportMessages(status?: string): Promise<any[]> {
    const where: FindOptionsWhere<Contact> = {};
    
    // ✅ CORRECTION: Utiliser un type guard pour s'assurer que status est valide
    if (status && status !== 'all') {
      const validStatuses: ('unread' | 'read' | 'replied' | 'archived')[] = ['unread', 'read', 'replied', 'archived'];
      if (validStatuses.includes(status as any)) {
        where.status = status as 'unread' | 'read' | 'replied' | 'archived';
      }
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
      'Message': msg.message.replace(/<[^>]*>/g, '').substring(0, 1000),
      'Statut': msg.status,
      'Date': msg.created_at.toISOString(),
      'IP': msg.ip_address || '',
    }));
  }

  // ============================================================
  // RECHERCHE
  // ============================================================

  async searchMessages(query: string): Promise<Contact[]> {
    if (!query || query.length < 2) {
      return [];
    }

    return this.contactRepository.find({
      where: [
        { name: Like(`%${query}%`) },
        { email: Like(`%${query}%`) },
        { subject: Like(`%${query}%`) },
        { message: Like(`%${query}%`) },
      ],
      order: { created_at: 'DESC' },
      take: 20,
    });
  }

  // ============================================================
  // SUPPRESSION
  // ============================================================

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

  // ============================================================
  // SUPPRESSION MULTIPLE
  // ============================================================

  async deleteMultiple(ids: string[]): Promise<{ deleted: number }> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Aucun ID fourni');
    }

    const result = await this.contactRepository.delete({ id: In(ids) });
    this.logger.log(`${result.affected} messages supprimes`);
    
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
    
    this.logger.log(`${result.affected} messages archives`);
    return { archived: result.affected || 0 };
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
      where: {
        created_at: MoreThanOrEqual(thirtyDaysAgo),
      },
    });

    const messagesPerDay = Math.round(recentMessages / 30);

    return {
      averageResponseTime,
      responseRate,
      messagesPerDay,
    };
  }
}