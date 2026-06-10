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
}