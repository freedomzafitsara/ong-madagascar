// backend/src/modules/volunteers/volunteers.service.ts

import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Volunteer, VolunteerStatus, AvailabilityType } from '../../entities/volunteer.entity';
import { CreateVolunteerDto, UpdateVolunteerDto, VolunteerQueryDto } from './dto/create-volunteer.dto';

@Injectable()
export class VolunteersService {
  private readonly logger = new Logger(VolunteersService.name);

  constructor(
    @InjectRepository(Volunteer)
    private volunteerRepository: Repository<Volunteer>,
  ) {}

  async create(createDto: CreateVolunteerDto, userId?: string): Promise<Volunteer> {
    // Vérifier si l'email existe déjà
    const existingVolunteer = await this.volunteerRepository.findOne({
      where: { email: createDto.email }
    });

    if (existingVolunteer) {
      throw new BadRequestException('Un benevole avec cet email existe deja');
    }

    // Vérifier si un ID personnalisé a été fourni
    let customId = createDto.id;
    if (customId) {
      // Vérifier si l'ID existe déjà
      const existingWithId = await this.volunteerRepository.findOne({
        where: { id: customId }
      });
      if (existingWithId) {
        // Si l'ID existe, retourner le bénévole existant au lieu d'en créer un nouveau
        this.logger.log(`Benevole avec ID ${customId} existe deja, retourne existant`);
        return existingWithId;
      }
    }

    // Créer le bénévole
    const volunteer = this.volunteerRepository.create({
      id: customId, // Utiliser l'ID personnalisé s'il est fourni
      first_name: createDto.first_name,
      last_name: createDto.last_name,
      email: createDto.email,
      phone: createDto.phone || null,
      skills: createDto.skills || [],
      region: createDto.region,
      availability: createDto.availability || null,
      availability_type: createDto.availability_type || AvailabilityType.BOTH,
      user_id: userId || null,
      hours: createDto.hours || 0,
      status: createDto.status || VolunteerStatus.ACTIVE,
    });

    const savedVolunteer = await this.volunteerRepository.save(volunteer);
    this.logger.log(`Benevole cree: ${savedVolunteer.id} - ${savedVolunteer.first_name} ${savedVolunteer.last_name}`);
    return savedVolunteer;
  }

  async findAll(query: VolunteerQueryDto): Promise<{ data: Volunteer[]; total: number; page: number; totalPages: number; limit: number }> {
    const { page = 1, limit = 10, region, status, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.volunteerRepository.createQueryBuilder('v');

    if (region) {
      queryBuilder.andWhere('v.region = :region', { region });
    }

    if (status) {
      queryBuilder.andWhere('v.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(v.first_name ILIKE :search OR v.last_name ILIKE :search OR v.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await queryBuilder
      .orderBy('v.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit
    };
  }

  async findOne(id: string): Promise<Volunteer> {
    const volunteer = await this.volunteerRepository.findOne({
      where: { id },
      relations: ['user']
    });

    if (!volunteer) {
      throw new NotFoundException(`Benevole avec l'id ${id} non trouve`);
    }

    return volunteer;
  }

  async findByUser(userId: string): Promise<Volunteer | null> {
    return this.volunteerRepository.findOne({
      where: { user_id: userId }
    });
  }

  async update(id: string, updateDto: UpdateVolunteerDto): Promise<Volunteer> {
    const volunteer = await this.findOne(id);

    if (updateDto.first_name !== undefined) volunteer.first_name = updateDto.first_name;
    if (updateDto.last_name !== undefined) volunteer.last_name = updateDto.last_name;
    if (updateDto.email !== undefined) volunteer.email = updateDto.email;
    if (updateDto.phone !== undefined) volunteer.phone = updateDto.phone;
    if (updateDto.skills !== undefined) volunteer.skills = updateDto.skills;
    if (updateDto.region !== undefined) volunteer.region = updateDto.region;
    if (updateDto.availability !== undefined) volunteer.availability = updateDto.availability;
    if (updateDto.availability_type !== undefined) volunteer.availability_type = updateDto.availability_type;
    if (updateDto.hours !== undefined) volunteer.hours = updateDto.hours;
    if (updateDto.status !== undefined) volunteer.status = updateDto.status;

    const updatedVolunteer = await this.volunteerRepository.save(volunteer);
    this.logger.log(`Benevole modifie: ${id}`);
    return updatedVolunteer;
  }

  async updateHours(id: string, hours: number): Promise<Volunteer> {
    const volunteer = await this.findOne(id);
    volunteer.hours = hours;
    return this.volunteerRepository.save(volunteer);
  }

  async addHours(id: string, hoursToAdd: number): Promise<Volunteer> {
    const volunteer = await this.findOne(id);
    volunteer.hours += hoursToAdd;
    return this.volunteerRepository.save(volunteer);
  }

  async remove(id: string): Promise<void> {
    const volunteer = await this.findOne(id);
    await this.volunteerRepository.remove(volunteer);
    this.logger.log(`Benevole supprime: ${id}`);
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    totalHours: number;
    uniqueRegions: number;
    byRegion: Record<string, number>;
  }> {
    const [total, active, inactive, volunteers, byRegionRaw] = await Promise.all([
      this.volunteerRepository.count(),
      this.volunteerRepository.count({ where: { status: VolunteerStatus.ACTIVE } }),
      this.volunteerRepository.count({ where: { status: VolunteerStatus.INACTIVE } }),
      this.volunteerRepository.find(),
      this.volunteerRepository
        .createQueryBuilder('v')
        .select('v.region', 'region')
        .addSelect('COUNT(*)', 'count')
        .groupBy('v.region')
        .getRawMany()
    ]);

    const totalHours = volunteers.reduce((sum, v) => sum + v.hours, 0);
    const uniqueRegions = new Set(volunteers.map(v => v.region)).size;

    const byRegion: Record<string, number> = {};
    byRegionRaw.forEach(item => {
      byRegion[item.region] = parseInt(item.count, 10);
    });

    return {
      total,
      active,
      inactive,
      totalHours,
      uniqueRegions,
      byRegion
    };
  }

  async exportToCSV(filters?: { region?: string; status?: VolunteerStatus }): Promise<string> {
    const where: FindOptionsWhere<Volunteer> = {};
    if (filters?.region) where.region = filters.region;
    if (filters?.status) where.status = filters.status;

    const volunteers = await this.volunteerRepository.find({
      where,
      order: { created_at: 'DESC' }
    });

    const headers = ['ID', 'Prenom', 'Nom', 'Email', 'Telephone', 'Competences', 'Region', 'Disponibilite', 'Heures', 'Statut'];
    const rows = volunteers.map(v => [
      v.id,
      v.first_name,
      v.last_name,
      v.email,
      v.phone || '',
      v.skills.join(', '),
      v.region,
      v.availability_type === 'weekend' ? 'Week-end' : v.availability_type === 'weekday' ? 'Semaine' : 'Les deux',
      v.hours,
      v.status === 'active' ? 'Actif' : 'Inactif'
    ]);

    return [headers, ...rows].map(row => row.join(';')).join('\n');
  }
}