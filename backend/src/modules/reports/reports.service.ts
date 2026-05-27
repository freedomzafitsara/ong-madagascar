// backend/src/modules/reports/reports.service.ts

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportType } from '../../entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  async create(createDto: CreateReportDto, userId: string): Promise<Report> {
    const report = this.reportRepository.create({
      ...createDto,
      created_by: userId,
    });
    const saved = await this.reportRepository.save(report);
    this.logger.log(`Rapport créé: ${saved.id} - ${saved.title}`);
    return saved;
  }

  async findAll(): Promise<Report[]> {
    return this.reportRepository.find({
      relations: ['creator'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!report) {
      throw new NotFoundException(`Rapport avec l'id ${id} non trouvé`);
    }
    return report;
  }

  async findByType(type: ReportType): Promise<Report[]> {
    return this.reportRepository.find({
      where: { type },
      order: { created_at: 'DESC' },
    });
  }

  async remove(id: string): Promise<void> {
    const report = await this.findOne(id);
    await this.reportRepository.remove(report);
    this.logger.log(`Rapport supprimé: ${id}`);
  }
}