import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { JobOffer } from './job-offer.entity';
import { User } from './user.entity';

export enum ApplicationStatus {
    SUBMITTED = 'submitted',
    REVIEWING = 'reviewing',
    SHORTLISTED = 'shortlisted',
    INTERVIEW = 'interview',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected'
}

@Entity('job_applications')
export class JobApplication {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => JobOffer, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'job_offer_id' })
    jobOffer: JobOffer;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ length: 255 })
    fullName: string;

    @Column({ length: 255 })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column('text', { nullable: true })
    address: string;

    @Column({ nullable: true })
    experienceYears: number;

    @Column('text', { nullable: true })
    coverLetter: string;

    @Column({ nullable: true })
    photoUrl: string;

    @Column()
    cvUrl: string;

    @Column({ nullable: true })
    diplomaUrl: string;

    @Column({ nullable: true })
    attestationUrl: string;

    @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.SUBMITTED })
    status: ApplicationStatus;

    @Column('text', { nullable: true })
    notes: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'reviewed_by' })
    reviewedBy: User;

    @Column({ nullable: true })
    reviewedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}