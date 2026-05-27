// backend/src/modules/beneficiaries/beneficiaries.service.ts

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beneficiary } from '../../entities/beneficiary.entity';
import { CreateBeneficiaryDto, UpdateBeneficiaryDto } from './dto/create-beneficiary.dto';

@Injectable()
export class BeneficiariesService {
  private readonly logger = new Logger(BeneficiariesService.name);

  constructor(
    @InjectRepository(Beneficiary)
    private beneficiaryRepository: Repository<Beneficiary>,
  ) {}

  async create(createDto: CreateBeneficiaryDto): Promise<Beneficiary> {
    const beneficiary = this.beneficiaryRepository.create(createDto);
    const saved = await this.beneficiaryRepository.save(beneficiary);
    this.logger.log(`Bénéficiaire créé: ${saved.id} - ${saved.first_name} ${saved.last_name}`);
    return saved;
  }

  async findAll(): Promise<Beneficiary[]> {
    return this.beneficiaryRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Beneficiary> {
    const beneficiary = await this.beneficiaryRepository.findOne({ where: { id } });
    if (!beneficiary) {
      throw new NotFoundException(`Bénéficiaire avec l'id ${id} non trouvé`);
    }
    return beneficiary;
  }

  async update(id: string, updateDto: UpdateBeneficiaryDto): Promise<Beneficiary> {
    const beneficiary = await this.findOne(id);
    Object.assign(beneficiary, updateDto);
    const updated = await this.beneficiaryRepository.save(beneficiary);
    this.logger.log(`Bénéficiaire modifié: ${id}`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const beneficiary = await this.findOne(id);
    await this.beneficiaryRepository.remove(beneficiary);
    this.logger.log(`Bénéficiaire supprimé: ${id}`);
  }
}