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

  /**
   * Verifie si l'offre est publiee
   */
  isPublished(): boolean {
    return this.is_published === true && this.status === 'published';
  }

  /**
   * Verifie si l'offre est expiree
   */
  isExpired(): boolean {
    if (!this.deadline) return false;
    return new Date(this.deadline) < new Date();
  }

  /**
   * Verifie si l'offre est un brouillon
   */
  isDraft(): boolean {
    return this.status === 'draft';
  }

  /**
   * Calcule le nombre de jours restants avant expiration
   */
  getDaysRemaining(): number | null {
    if (!this.deadline) return null;
    const today = new Date();
    const deadline = new Date(this.deadline);
    const diff = deadline.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtient le libelle du statut en francais
   */
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

  /**
   * Obtient le libelle du type de contrat en francais
   */
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

  /**
   * Obtient le statut de l'offre pour l'affichage public
   */
  getPublicStatus(): string {
    if (this.isPublished() && !this.isExpired()) {
      return 'active';
    }
    if (this.isExpired()) {
      return 'expired';
    }
    if (this.status === 'closed') {
      return 'closed';
    }
    return 'inactive';
  }

  /**
   * Verifie si l'offre est disponible pour les candidats
   */
  isAvailable(): boolean {
    return this.isPublished() && !this.isExpired() && this.status !== 'closed';
  }

  /**
   * Incremente le compteur de vues
   */
  incrementViews(): void {
    this.views_count += 1;
  }

  /**
   * Incremente le compteur de candidatures
   */
  incrementApplications(): void {
    this.applications_count += 1;
  }

  /**
   * Decremente le compteur de candidatures
   */
  decrementApplications(): void {
    if (this.applications_count > 0) {
      this.applications_count -= 1;
    }
  }

  /**
   * Publie l'offre
   */
  publish(): void {
    this.status = 'published';
    this.is_published = true;
  }

  /**
   * Depublie l'offre
   */
  unpublish(): void {
    this.status = 'draft';
    this.is_published = false;
  }

  /**
   * Ferme l'offre
   */
  close(): void {
    this.status = 'closed';
    this.is_published = false;
  }

  /**
   * Archive l'offre
   */
  archive(): void {
    this.status = 'archived';
    this.is_published = false;
  }

  /**
   * Obtient les informations resumees pour l'affichage
   */
  getSummary(language: 'fr' | 'mg' = 'fr'): string {
    const title = language === 'fr' ? this.title_fr : (this.title_mg || this.title_fr);
    const description = language === 'fr' ? this.description_fr : (this.description_mg || this.description_fr);
    return `${title} - ${description.substring(0, 100)}...`;
  }

  /**
   * Obtient les informations pour l'export CSV
   */
  toCsvRow(): Record<string, any> {
    return {
      id: this.id,
      title_fr: this.title_fr,
      title_mg: this.title_mg || '',
      company: this.company || '',
      location: this.location || '',
      contract_type: this.getContractTypeLabel(),
      deadline: this.deadline ? new Date(this.deadline).toLocaleDateString('fr-FR') : '',
      status: this.getStatusLabel(),
      is_published: this.is_published ? 'Oui' : 'Non',
      views_count: this.views_count,
      applications_count: this.applications_count,
      created_at: this.created_at ? new Date(this.created_at).toLocaleDateString('fr-FR') : '',
      days_remaining: this.getDaysRemaining() ?? '',
      is_expired: this.isExpired() ? 'Oui' : 'Non'
    };
  }

  /**
   * Convertit l'objet en objet JSON simplifie pour l'API
   */
  toJSON(): Partial<JobOffer> {
    return {
      id: this.id,
      title_fr: this.title_fr,
      title_mg: this.title_mg,
      description_fr: this.description_fr,
      description_mg: this.description_mg,
      company: this.company,
      location: this.location,
      contract_type: this.contract_type,
      deadline: this.deadline,
      status: this.status,
      is_published: this.is_published,
      image_url: this.image_url,
      views_count: this.views_count,
      applications_count: this.applications_count,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}