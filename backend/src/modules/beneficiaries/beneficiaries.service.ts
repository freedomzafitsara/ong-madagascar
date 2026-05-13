// backend/src/modules/beneficiaries/beneficiaries.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beneficiary } from '../../entities/beneficiary.entity';

@Injectable()
export class BeneficiariesService {
  constructor(
    @InjectRepository(Beneficiary)
    private beneficiaryRepository: Repository<Beneficiary>,
  ) {}

  // Récupérer tous les bénéficiaires
  async findAll(): Promise<Beneficiary[]> {
    return this.beneficiaryRepository.find({
      relations: ['user', 'projects'],
    });
  }

  // Récupérer un bénéficiaire par son ID
  async findOne(id: string): Promise<Beneficiary> {
    const beneficiary = await this.beneficiaryRepository.findOne({
      where: { id },
      relations: ['user', 'projects'],
    });
    if (!beneficiary) {
      throw new NotFoundException(`Bénéficiaire avec l'id ${id} non trouvé`);
    }
    return beneficiary;
  }

  // Créer un bénéficiaire
  async create(data: Partial<Beneficiary>): Promise<Beneficiary> {
    const beneficiary = this.beneficiaryRepository.create(data);
    return this.beneficiaryRepository.save(beneficiary);
  }

  // Mettre à jour un bénéficiaire
  async update(id: string, data: Partial<Beneficiary>): Promise<Beneficiary> {
    await this.findOne(id); // Vérifie que le bénéficiaire existe
    await this.beneficiaryRepository.update(id, data);
    return this.findOne(id);
  }

  // Supprimer un bénéficiaire
  async delete(id: string): Promise<void> {
    const beneficiary = await this.findOne(id);
    await this.beneficiaryRepository.remove(beneficiary);
  }

  // ⭐ Statistiques d'impact (pour briller en soutenance !)
  async getImpactStats() {
    const beneficiaries = await this.beneficiaryRepository.find();
    
    const total = beneficiaries.length;
    const withBeforeAfter = beneficiaries.filter(b => b.beforeYmAd && b.afterYmAd).length;
    
    // Compte ceux qui ont amélioré leur situation
    const improved = beneficiaries.filter(b => {
      if (!b.beforeYmAd || !b.afterYmAd) return false;
      // Exemple simple : si after contient "employé" et before contient "chômeur" ou "sans emploi"
      const hadJobBefore = b.beforeYmAd.toLowerCase().includes('emploi') || 
                           b.beforeYmAd.toLowerCase().includes('travail');
      const hasJobAfter = b.afterYmAd.toLowerCase().includes('emploi') || 
                          b.afterYmAd.toLowerCase().includes('travail');
      return !hadJobBefore && hasJobAfter;
    }).length;

    return {
      total,
      withBeforeAfter,
      improved,
      impactRate: total > 0 ? Math.round((improved / total) * 100) : 0,
    };
  }

  // Statistiques par région
  async getStatsByRegion() {
    return this.beneficiaryRepository
      .createQueryBuilder('b')
      .select('b.region', 'region')
      .addSelect('COUNT(b.id)', 'count')
      .groupBy('b.region')
      .getRawMany();
  }
}