// backend/src/entities/project.entity.ts

import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index 
} from 'typeorm';

export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PLANNING = 'planning',
  DRAFT = 'draft'
}

@Entity('projects')
@Index(['status'])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ============================================================
  // TITRES ET DESCRIPTIONS (FR/MG)
  // ============================================================
  @Column({ name: 'title_fr', length: 255 })
  title_fr: string;

  @Column({ name: 'title_mg', length: 255, nullable: true })
  title_mg: string;

  @Column({ name: 'description_fr', type: 'text' })
  description_fr: string;

  @Column({ name: 'description_mg', type: 'text', nullable: true })
  description_mg: string;

  // ============================================================
  // INFORMATIONS DE BASE
  // ============================================================
  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ 
    type: 'varchar', 
    default: 'planning'
  })
  status: string;

  // ============================================================
  // DATES
  // ============================================================
  @Column({ name: 'start_date', type: 'date', nullable: true })
  start_date: Date;

  // ============================================================
  // MÉDIAS
  // ============================================================
  @Column({ name: 'image_url', type: 'text', nullable: true })
  image_url: string;

  // ============================================================
  // ANCIENNES COLONNES (pour compatibilité descendante)
  // Ne pas utiliser directement, préférer les nouvelles colonnes
  // ============================================================
  @Column({ length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // ============================================================
  // DATES SYSTÈME
  // ============================================================
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // ============================================================
  // MÉTHODES UTILITAIRES
  // ============================================================

  // Obtenir le titre (avec fallback)
  getTitle(): string {
    return this.title_fr || this.title || 'Sans titre';
  }

  // Obtenir la description (avec fallback)
  getDescription(): string {
    return this.description_fr || this.description || '';
  }

  // Vérifier si le projet est actif
  isActive(): boolean {
    return this.status === 'active';
  }

  // Vérifier si le projet est terminé
  isCompleted(): boolean {
    return this.status === 'completed';
  }

  // Obtenir le libellé du statut
  getStatusLabel(): string {
    const labels: Record<string, string> = {
      active: 'Actif',
      completed: 'Terminé',
      planning: 'En planification',
      draft: 'Brouillon',
    };
    return labels[this.status] || this.status;
  }
}