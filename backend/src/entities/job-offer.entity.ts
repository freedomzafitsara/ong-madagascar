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

@Entity('job_offers')
@Index(['status'])
@Index(['deadline'])
@Index(['is_published'])
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

  @Column({ length: 255, nullable: true, default: 'Y-Mad Madagascar' })
  company: string;

  @Column({ length: 255, nullable: true, default: 'Antananarivo' })
  location: string;

  @Column({ name: 'contract_type', length: 50, default: 'CDI' })
  contract_type: string;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column({ length: 50, default: 'draft' })
  status: string;

  @Column({ name: 'is_published', default: false })
  is_published: boolean;

  @Column({ name: 'image_url', nullable: true })
  image_url: string;

  // NOUVEAU: ID de l'image principale stockee dans database_images
  @Column({ name: 'main_image_id', type: 'uuid', nullable: true })
  main_image_id: string;

  @Column({ name: 'views_count', default: 0 })
  views_count: number;

  @Column({ name: 'applications_count', default: 0 })
  applications_count: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => JobApplication, (application) => application.jobOffer, { cascade: true })
  applications: JobApplication[];

  // Methodes utilitaires
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

  getDaysRemaining(): number | null {
    if (!this.deadline) return null;
    const today = new Date();
    const deadline = new Date(this.deadline);
    const diff = deadline.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getStatusLabel(): string {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      published: 'Publiee',
      expired: 'Expiree',
      closed: 'Fermee',
      archived: 'Archivee'
    };
    return labels[this.status] || this.status;
  }

  getContractTypeLabel(): string {
    const labels: Record<string, string> = {
      CDI: 'CDI',
      CDD: 'CDD',
      STAGE: 'Stage',
      FREELANCE: 'Freelance',
      ALTERNANCE: 'Alternance',
      TEMPORARY: 'Temporaire'
    };
    return labels[this.contract_type] || this.contract_type;
  }
}