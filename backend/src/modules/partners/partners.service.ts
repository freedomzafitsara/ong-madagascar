import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner, PartnerType } from '../../entities/partner.entity';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/create-partner.dto';

@Injectable()
export class PartnersService {
  private readonly logger = new Logger(PartnersService.name);

  constructor(
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
  ) {}

  async create(createDto: CreatePartnerDto): Promise<Partner> {
    const partner = this.partnerRepository.create(createDto);
    const saved = await this.partnerRepository.save(partner);
    this.logger.log(`Partenaire créé: ${saved.id} - ${saved.name}`);
    return saved;
  }

  async findAll(): Promise<Partner[]> {
    return this.partnerRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Partner> {
    const partner = await this.partnerRepository.findOne({ where: { id } });
    if (!partner) {
      throw new NotFoundException(`Partenaire avec l'id ${id} non trouvé`);
    }
    return partner;
  }

  async update(id: string, updateDto: UpdatePartnerDto): Promise<Partner> {
    const partner = await this.findOne(id);
    Object.assign(partner, updateDto);
    const updated = await this.partnerRepository.save(partner);
    this.logger.log(`Partenaire modifié: ${id}`);
    return updated;
  }

  async toggleFeatured(id: string): Promise<Partner> {
    const partner = await this.findOne(id);
    partner.is_featured = !partner.is_featured;
    return this.partnerRepository.save(partner);
  }

  async remove(id: string): Promise<void> {
    const partner = await this.findOne(id);
    await this.partnerRepository.remove(partner);
    this.logger.log(`Partenaire supprimé: ${id}`);
  }

  async getStats(): Promise<{
    total: number;
    featured: number;
    byType: Record<PartnerType, number>;
  }> {
    const [total, featured, byTypeRaw] = await Promise.all([
      this.partnerRepository.count(),
      this.partnerRepository.count({ where: { is_featured: true } }),
      this.partnerRepository
        .createQueryBuilder('p')
        .select('p.partner_type', 'type')
        .addSelect('COUNT(*)', 'count')
        .groupBy('p.partner_type')
        .getRawMany(),
    ]);

    const byType: Record<PartnerType, number> = {
      company: 0,
      ngo: 0,
      embassy: 0,
      institution: 0,
    };

    byTypeRaw.forEach((item) => {
      byType[item.type as PartnerType] = parseInt(item.count, 10);
    });

    return { total, featured, byType };
  }
}