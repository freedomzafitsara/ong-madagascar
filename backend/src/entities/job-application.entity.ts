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

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  REVIEWING = 'reviewing',
  SHORTLISTED = 'shortlisted',
  INTERVIEW = 'interview',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

@Entity('job_applications')
@Index(['email', 'job_offer_id'], { unique: true })
@Index(['status'])
@Index(['created_at'])
@Index(['job_offer_id'])
@Index(['user_id'])
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ============================================================
  // RELATIONS
  // ============================================================
  @Column({ name: 'job_offer_id', type: 'uuid' })
  job_offer_id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  user_id: string;

  // ============================================================
  // INFORMATIONS PERSONNELLES (obligatoires)
  // ============================================================
  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  // ============================================================
  // EXPÉRIENCE ET CANDIDATURE
  // ============================================================
  @Column({ type: 'text', nullable: true })
  experience: string;

  @Column({ name: 'experience_years', type: 'int', nullable: true })
  experience_years: number;

  @Column({ name: 'cover_letter', type: 'text', nullable: true })
  cover_letter: string;

  // ============================================================
  // DOCUMENTS UPLOADÉS (Cloudinary)
  // ============================================================
  @Column({ name: 'cv_url', type: 'varchar', length: 500, nullable: true })
  cv_url: string;

  @Column({ name: 'diploma_url', type: 'varchar', length: 500, nullable: true })
  diploma_url: string;

  @Column({ name: 'attestation_url', type: 'varchar', length: 500, nullable: true })
  attestation_url: string;

  @Column({ name: 'photo_url', type: 'varchar', length: 500, nullable: true })
  photo_url: string;

  // ============================================================
  // STATUT ET SUIVI
  // ============================================================
  @Column({ 
    type: 'varchar',
    default: ApplicationStatus.SUBMITTED 
  })
  status: ApplicationStatus;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewed_by: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewed_at: Date;

  // ============================================================
  // DATES
  // ============================================================
  @Column({ name: 'applied_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  applied_at: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;

  // ============================================================
  // RELATIONS TYPEORM
  // ============================================================
  @ManyToOne(() => JobOffer, (offer) => offer.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_offer_id' })
  jobOffer: JobOffer;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;

  // ============================================================
  // MÉTHODES UTILITAIRES
  // ============================================================

  getStatusLabel(): string {
    const labels: Record<ApplicationStatus, string> = {
      [ApplicationStatus.SUBMITTED]: 'Soumise',
      [ApplicationStatus.REVIEWING]: 'En cours d\'examen',
      [ApplicationStatus.SHORTLISTED]: 'Présélectionnée',
      [ApplicationStatus.INTERVIEW]: 'Entretien',
      [ApplicationStatus.ACCEPTED]: 'Acceptée',
      [ApplicationStatus.REJECTED]: 'Refusée',
      [ApplicationStatus.WITHDRAWN]: 'Retirée',
    };
    return labels[this.status];
  }

  isSubmitted(): boolean {
    return this.status === ApplicationStatus.SUBMITTED;
  }

  isReviewed(): boolean {
    return this.status !== ApplicationStatus.SUBMITTED;
  }

  isAccepted(): boolean {
    return this.status === ApplicationStatus.ACCEPTED;
  }

  isRejected(): boolean {
    return this.status === ApplicationStatus.REJECTED;
  }

  isShortlisted(): boolean {
    return this.status === ApplicationStatus.SHORTLISTED;
  }

  isInterview(): boolean {
    return this.status === ApplicationStatus.INTERVIEW;
  }

  review(status: ApplicationStatus, notes?: string, reviewerId?: string): void {
    this.status = status;
    if (notes) this.notes = notes;
    if (reviewerId) this.reviewed_by = reviewerId;
    this.reviewed_at = new Date();
  }

  accept(notes?: string, reviewerId?: string): void {
    this.status = ApplicationStatus.ACCEPTED;
    if (notes) this.notes = notes;
    if (reviewerId) this.reviewed_by = reviewerId;
    this.reviewed_at = new Date();
  }

  reject(reason?: string, reviewerId?: string): void {
    this.status = ApplicationStatus.REJECTED;
    if (reason) this.notes = reason;
    if (reviewerId) this.reviewed_by = reviewerId;
    this.reviewed_at = new Date();
  }

  shortlist(reviewerId?: string): void {
    this.status = ApplicationStatus.SHORTLISTED;
    if (reviewerId) this.reviewed_by = reviewerId;
    this.reviewed_at = new Date();
  }

  scheduleInterview(date: Date, location?: string, notes?: string): void {
    this.status = ApplicationStatus.INTERVIEW;
    if (notes) this.notes = notes;
  }

  withdraw(): void {
    this.status = ApplicationStatus.WITHDRAWN;
  }

  hasDocuments(): boolean {
    return !!(this.cv_url || this.diploma_url || this.attestation_url);
  }

  hasPhoto(): boolean {
    return !!this.photo_url;
  }

  getFullName(): string {
    return this.full_name;
  }
}