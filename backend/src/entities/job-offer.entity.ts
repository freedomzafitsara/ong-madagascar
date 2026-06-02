// backend/src/entities/job-offer.entity.ts

import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  OneToMany,
  Index,
  BeforeUpdate
} from 'typeorm';
import { JobApplication } from './job-application.entity';

export enum JobType {
  CDI = 'cdi',
  CDD = 'cdd',
  STAGE = 'stage',
  FREELANCE = 'freelance',
  BENEVOLAT = 'benevolat',
  ALTERNANCE = 'alternance',
  TEMPORARY = 'temporary',
}

export enum JobStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
  EXPIRED = 'expired',
  ARCHIVED = 'archived',
}

export enum ContractType {
  CDI = 'CDI',
  CDD = 'CDD',
  STAGE = 'STAGE',
  FREELANCE = 'FREELANCE',
}

@Entity('job_offers')
@Index(['status', 'deadline'])
@Index(['is_published'])
@Index(['contract_type'])
@Index(['company'])
export class JobOffer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ============================================================
  // INFORMATIONS DE BASE (FR/MG)
  // ============================================================
  @Column({ name: 'title_fr', type: 'varchar', length: 255 })
  title_fr: string;

  @Column({ name: 'title_mg', type: 'varchar', length: 255, nullable: true })
  title_mg: string;

  @Column({ name: 'description_fr', type: 'text' })
  description_fr: string;

  @Column({ name: 'description_mg', type: 'text', nullable: true })
  description_mg: string;

  // ============================================================
  // ENTREPRISE ET LOCALISATION
  // ============================================================
  @Column({ type: 'varchar', length: 255, nullable: true })
  company: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ name: 'contract_type', type: 'varchar', length: 50, default: 'CDI' })
  contract_type: string;

  // ============================================================
  // DATES ET STATUT
  // ============================================================
  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column({ type: 'varchar', default: 'draft' })
  status: string;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  is_published: boolean;

  // ============================================================
  // MÉDIAS
  // ============================================================
  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  image_url: string;

  // ============================================================
  // ANCIENNES COLONNES (pour compatibilité descendante)
  // Ne pas utiliser directement, préférer les nouvelles colonnes
  // ============================================================
  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'company_name', type: 'varchar', length: 255, nullable: true })
  company_name: string;

  // ============================================================
  // MÉTRIQUES
  // ============================================================
  @Column({ name: 'views_count', type: 'int', default: 0 })
  views_count: number;

  @Column({ name: 'applications_count', type: 'int', default: 0 })
  applications_count: number;

  // ============================================================
  // DATES SYSTÈME
  // ============================================================
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;

  // ============================================================
  // RELATIONS
  // ============================================================
  @OneToMany(() => JobApplication, (application) => application.jobOffer)
  applications: JobApplication[];

  // ============================================================
  // MÉTHODES UTILITAIRES (adaptées)
  // ============================================================

  isPublished(): boolean {
    return this.is_published === true;
  }

  isExpired(): boolean {
    if (!this.deadline) return false;
    return new Date(this.deadline) < new Date();
  }

  isDraft(): boolean {
    return !this.is_published && this.status === 'draft';
  }

  getDaysUntilDeadline(): number | null {
    if (!this.deadline) return null;
    const today = new Date();
    const deadline = new Date(this.deadline);
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getStatusLabel(): string {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      published: 'Publiée',
      closed: 'Fermée',
      expired: 'Expirée',
      archived: 'Archivée',
    };
    return labels[this.status] || this.status;
  }

  getContractTypeLabel(): string {
    const labels: Record<string, string> = {
      CDI: 'CDI',
      CDD: 'CDD',
      STAGE: 'Stage',
      FREELANCE: 'Freelance',
      benevolat: 'Bénévolat',
      alternance: 'Alternance',
      temporary: 'Temporaire',
    };
    return labels[this.contract_type] || this.contract_type;
  }

  incrementViews(): void {
    this.views_count += 1;
  }

  incrementApplications(): void {
    this.applications_count += 1;
  }

  publish(): void {
    this.is_published = true;
    this.status = 'published';
  }

  unpublish(): void {
    this.is_published = false;
    this.status = 'draft';
  }

  close(): void {
    this.is_published = false;
    this.status = 'closed';
  }

  @BeforeUpdate()
  checkExpiration(): void {
    if (this.isPublished() && this.isExpired()) {
      this.status = 'expired';
      this.is_published = false;
    }
  }

  // Méthode pour obtenir le titre (avec fallback)
  getTitle(): string {
    return this.title_fr || this.title || 'Sans titre';
  }

  // Méthode pour obtenir la description (avec fallback)
  getDescription(): string {
    return this.description_fr || this.description || '';
  }

  // Méthode pour obtenir le nom de l'entreprise (avec fallback)
  getCompanyName(): string {
    return this.company || this.company_name || 'Entreprise non spécifiée';
  }
}