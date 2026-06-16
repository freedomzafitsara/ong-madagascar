// backend/src/entities/job-application.entity.ts

import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index 
} from 'typeorm';
import { JobOffer } from './job-offer.entity';
import { User } from './user.entity';

export type ApplicationStatus = 'submitted' | 'reviewing' | 'shortlisted' | 'accepted' | 'rejected';

@Entity('job_applications')
@Index(['job_offer_id', 'email'])
@Index(['status'])
@Index(['created_at'])
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'job_offer_id', type: 'uuid' })
  job_offer_id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  user_id: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'phone', type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  experience: string;

  @Column({ name: 'experience_years', type: 'int', nullable: true, default: 0 })
  experience_years: number;

  @Column({ name: 'current_position', type: 'varchar', length: 255, nullable: true })
  current_position: string;

  @Column({ name: 'current_company', type: 'varchar', length: 255, nullable: true })
  current_company: string;

  @Column({ name: 'cover_letter', type: 'text', nullable: true })
  cover_letter: string;

  @Column({ name: 'cover_letter_url', type: 'varchar', length: 500, nullable: true })
  cover_letter_url: string;

  @Column({ name: 'cv_url', type: 'varchar', length: 500, nullable: true })
  cv_url: string;

  @Column({ name: 'diploma_url', type: 'varchar', length: 500, nullable: true })
  diploma_url: string;

  @Column({ name: 'attestation_url', type: 'varchar', length: 500, nullable: true })
  attestation_url: string;

  @Column({ name: 'photo_url', type: 'varchar', length: 500, nullable: true })
  photo_url: string;

  @Column({ name: 'linkedin_url', type: 'varchar', length: 500, nullable: true })
  linkedin_url: string;

  @Column({ name: 'portfolio_url', type: 'varchar', length: 500, nullable: true })
  portfolio_url: string;

  @Column({ type: 'varchar', length: 50, nullable: true, default: 'submitted' })
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewed_by: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewed_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ name: 'applied_at', type: 'timestamp', nullable: true })
  applied_at: Date;

  @ManyToOne(() => JobOffer)
  @JoinColumn({ name: 'job_offer_id' })
  jobOffer: JobOffer;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;

  /**
   * Verifie si la candidature est en attente de traitement
   */
  isPending(): boolean {
    return this.status === 'submitted' || this.status === 'reviewing';
  }

  /**
   * Verifie si la candidature a ete acceptee
   */
  isAccepted(): boolean {
    return this.status === 'accepted';
  }

  /**
   * Verifie si la candidature a ete rejetee
   */
  isRejected(): boolean {
    return this.status === 'rejected';
  }

  /**
   * Verifie si la candidature a ete examinee
   */
  isReviewed(): boolean {
    return this.reviewed_at !== null && this.reviewed_by !== null;
  }

  /**
   * Retourne le statut en francais
   */
  getStatusLabel(): string {
    const labels: Record<ApplicationStatus, string> = {
      submitted: 'Soumise',
      reviewing: 'En cours d\'examen',
      shortlisted: 'Préselectionnee',
      accepted: 'Acceptee',
      rejected: 'Rejetee'
    };
    return labels[this.status] || this.status;
  }

  /**
   * Retourne la classe CSS associee au statut
   */
  getStatusClass(): string {
    const classes: Record<ApplicationStatus, string> = {
      submitted: 'bg-gray-100 text-gray-700',
      reviewing: 'bg-blue-100 text-blue-700',
      shortlisted: 'bg-purple-100 text-purple-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return classes[this.status] || 'bg-gray-100 text-gray-700';
  }

  /**
   * Retourne la couleur associee au statut
   */
  getStatusColor(): string {
    const colors: Record<ApplicationStatus, string> = {
      submitted: '#6B7280',
      reviewing: '#F59E0B',
      shortlisted: '#10B981',
      accepted: '#059669',
      rejected: '#EF4444'
    };
    return colors[this.status] || '#6B7280';
  }

  /**
   * Marque la candidature comme examinee
   */
  markAsReviewed(userId: string): void {
    this.reviewed_by = userId;
    this.reviewed_at = new Date();
  }

  /**
   * Change le statut de la candidature
   */
  setStatus(status: ApplicationStatus, userId?: string): void {
    this.status = status;
    if (userId && (status === 'accepted' || status === 'rejected')) {
      this.markAsReviewed(userId);
    }
  }

  /**
   * Verifie si la candidature a des documents
   */
  hasDocuments(): boolean {
    return !!(this.cv_url || this.diploma_url || this.attestation_url || this.cover_letter_url);
  }

  /**
   * Obtient le nombre de documents associes
   */
  getDocumentCount(): number {
    let count = 0;
    if (this.cv_url) count++;
    if (this.diploma_url) count++;
    if (this.attestation_url) count++;
    if (this.cover_letter_url) count++;
    if (this.photo_url) count++;
    return count;
  }

  /**
   * Obtient le resume de la candidature
   */
  getSummary(): string {
    return `${this.full_name} - ${this.email}`;
  }

  /**
   * Obtient les informations pour l'export CSV
   */
  toCsvRow(): Record<string, any> {
    return {
      id: this.id,
      nom_complet: this.full_name,
      email: this.email,
      telephone: this.phone || '',
      adresse: this.address || '',
      poste_actuel: this.current_position || '',
      entreprise_actuelle: this.current_company || '',
      annees_experience: this.experience_years || 0,
      statut: this.getStatusLabel(),
      date_candidature: this.applied_at ? new Date(this.applied_at).toLocaleDateString('fr-FR') : 
                        this.created_at ? new Date(this.created_at).toLocaleDateString('fr-FR') : '',
      a_cv: this.cv_url ? 'Oui' : 'Non',
      a_lettre_motivation: this.cover_letter_url ? 'Oui' : 'Non',
      a_diplome: this.diploma_url ? 'Oui' : 'Non',
      notes: this.notes || ''
    };
  }

  /**
   * Convertit l'objet en objet JSON simplifie
   */
  toJSON(): Partial<JobApplication> {
    return {
      id: this.id,
      job_offer_id: this.job_offer_id,
      full_name: this.full_name,
      email: this.email,
      phone: this.phone,
      address: this.address,
      experience_years: this.experience_years,
      current_position: this.current_position,
      current_company: this.current_company,
      cv_url: this.cv_url,
      cover_letter: this.cover_letter,
      cover_letter_url: this.cover_letter_url,
      diploma_url: this.diploma_url,
      attestation_url: this.attestation_url,
      photo_url: this.photo_url,
      linkedin_url: this.linkedin_url,
      portfolio_url: this.portfolio_url,
      status: this.status,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at,
      applied_at: this.applied_at,
      jobOffer: this.jobOffer
    };
  }
}