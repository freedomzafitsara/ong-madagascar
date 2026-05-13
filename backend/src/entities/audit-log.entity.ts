// backend/src/entities/audit-log.entity.ts
// Version finale - Soutenance DTS 2025

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

/**
 * TABLE AUDIT_LOGS - Journal d'audit de l'application Y-Mad
 * 
 * Cette table enregistre TOUTES les actions importantes effectuées sur le site.
 * Le journal est IMMUABLE : aucune suppression n'est autorisée, même par le super admin.
 * 
 * Utilité :
 * - Traçabilité complète des actions
 * - Conformité avec la loi malgache 2014-038 sur la protection des données
 * - Détection des comportements suspects
 * - Audit de sécurité
 */
@Entity('audit_logs')
@Index(['userId', 'createdAt'])  // Index composite pour les recherches par utilisateur et date
@Index(['action', 'createdAt'])  // Index pour filtrer les actions par type et date
@Index(['entityType', 'entityId']) // Index pour retrouver tous les logs d'un enregistrement
export class AuditLog {
  
  // ============================================================
  // IDENTIFIANT UNIQUE
  // ============================================================
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ============================================================
  // UTILISATEUR CONCERNÉ
  // ============================================================
  
  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // ============================================================
  // TYPE D'ACTION
  // ============================================================
  // Valeurs possibles: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT, UPLOAD
  @Column()
  action: string;

  // ============================================================
  // ENTITÉ CONCERNÉE
  // ============================================================
  
  @Column({ name: 'entity_type', nullable: true })
  entityType: string;  // Nom de la table concernée (users, members, projects, etc.)

  @Column({ name: 'entity_id', nullable: true })
  entityId: string;    // ID de l'enregistrement concerné

  // ============================================================
  // DONNÉES AVANT/APRÈS MODIFICATION (EN JSON)
  // ============================================================
  
  @Column({ name: 'old_data', type: 'jsonb', nullable: true })
  oldData: any;  // Snapshot des données AVANT modification

  @Column({ name: 'new_data', type: 'jsonb', nullable: true })
  newData: any;  // Snapshot des données APRÈS modification

  // ============================================================
  // INFORMATIONS TECHNIQUES
  // ============================================================
  
  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;   // Adresse IP de l'utilisateur

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;   // Navigateur et système d'exploitation

  // ============================================================
  // DATE DE L'ACTION
  // ============================================================
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}