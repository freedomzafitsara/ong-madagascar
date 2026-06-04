// backend/src/entities/job-offer.entity.ts

import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  OneToMany,
  Index
} from 'typeorm';
import { JobApplication } from './job-application.entity';

// Types simples (pas d'enums PostgreSQL pour éviter les erreurs)
export type ContractType = 'CDI' | 'CDD' | 'STAGE' | 'BENEVOLE' | 'FREELANCE';
export type JobStatusType = 'draft' | 'published' | 'expired' | 'closed' | 'archived';

@Entity('job_offers')
@Index(['status'])
@Index(['deadline'])
@Index(['contract_type'])
export class JobOffer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'title_fr', length: 255 })
  title_fr: string;

  @Column({ name: 'title_mg', length: 255, nullable: true })
  title_mg: string;

  @Column({ name: 'description_fr', type: 'text' })
  description_fr: string;

  @Column({ name: 'description_mg', type: 'text', nullable: true })
  description_mg: string;

  @Column({ length: 255, nullable: true })
  company: string;

  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ name: 'contract_type', length: 50, default: 'CDI' })
  contract_type: string;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column({ default: 'draft' })
  status: string;

  @Column({ name: 'is_published', default: false })
  is_published: boolean;

  @Column({ name: 'image_url', nullable: true })
  image_url: string;

  @Column({ name: 'views_count', default: 0 })
  views_count: number;

  @Column({ name: 'applications_count', default: 0 })
  applications_count: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => JobApplication, (application) => application.jobOffer)
  applications: JobApplication[];

  // ============================================================
  // MÉTHODES UTILITAIRES
  // ============================================================

  isPublished(): boolean {
    return this.is_published === true && this.status === 'published';
  }

  isExpired(): boolean {
    if (!this.deadline) return false;
    return new Date(this.deadline) < new Date();
  }

  isDraft(): boolean {
    return this.status === 'draft';
  }

  getStatusLabel(): string {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      published: 'Publiée',
      expired: 'Expirée',
      closed: 'Fermée',
      archived: 'Archivée'
    };
    return labels[this.status] || this.status;
  }

  getContractTypeLabel(): string {
    const labels: Record<string, string> = {
      CDI: 'CDI',
      CDD: 'CDD',
      STAGE: 'Stage',
      FREELANCE: 'Freelance',
      BENEVOLE: 'Bénévolat'
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
    if (this.deadline && new Date(this.deadline) > new Date()) {
      this.is_published = true;
      this.status = 'published';
    }
  }

  unpublish(): void {
    this.is_published = false;
    this.status = 'draft';
  }

  close(): void {
    this.is_published = false;
    this.status = 'closed';
  }
}