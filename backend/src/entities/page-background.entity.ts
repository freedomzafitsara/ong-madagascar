// backend/src/entities/page-background.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User } from './user.entity';

// ============================================================
// TYPES
// ============================================================

export type PageKey = 
  | 'home'
  | 'projects'
  | 'jobs'
  | 'blog'
  | 'contact'
  | 'login'
  | 'all'
  | 'register'
  | 'dashboard'
  | 'profile'
  | 'about'
  | 'faq';

export type PositionType = 
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export type SizeType = 
  | 'cover'
  | 'contain'
  | 'fill'
  | 'none'
  | 'scale-down';

// ============================================================
// ENTITE
// ============================================================

@Entity('page_backgrounds')
@Index(['page_key'], { unique: true })
@Index(['is_active'])
@Index(['updated_by'])
export class PageBackground {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ============================================================
  // IDENTIFICATION DE LA PAGE
  // ============================================================

  @Column({ 
    name: 'page_key', 
    type: 'varchar', 
    length: 50, 
    unique: true,
    nullable: false,
  })
  page_key: string;

  // ============================================================
  // IMAGE
  // ============================================================

  @Column({ 
    name: 'image_url', 
    type: 'text',
    nullable: false,
  })
  image_url: string;

  @Column({ 
    name: 'alt_fr', 
    type: 'text', 
    nullable: true,
  })
  alt_fr: string;

  @Column({ 
    name: 'alt_mg', 
    type: 'text', 
    nullable: true,
  })
  alt_mg: string;

  // ============================================================
  // AFFICHAGE
  // ============================================================

  @Column({ 
    name: 'is_active', 
    type: 'boolean', 
    default: true,
  })
  is_active: boolean;

  @Column({ 
    name: 'overlay_opacity', 
    type: 'int', 
    default: 35,
  })
  overlay_opacity: number;

  @Column({ 
    name: 'position', 
    type: 'varchar', 
    length: 50, 
    default: 'center',
  })
  position: PositionType;

  @Column({ 
    name: 'size', 
    type: 'varchar', 
    length: 50, 
    default: 'cover',
  })
  size: SizeType;

  // ============================================================
  // EFFETS VISUELS
  // ============================================================

  @Column({ 
    name: 'blur', 
    type: 'int', 
    default: 0,
  })
  blur: number;

  @Column({ 
    name: 'brightness', 
    type: 'int', 
    default: 100,
  })
  brightness: number;

  // ============================================================
  // AUDIT
  // ============================================================

  @Column({ 
    name: 'updated_by', 
    type: 'uuid', 
    nullable: true,
  })
  updated_by: string;

  @CreateDateColumn({ 
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({ 
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  // ============================================================
  // RELATIONS
  // ============================================================

  @ManyToOne(() => User, { 
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ 
    name: 'updated_by',
    referencedColumnName: 'id',
  })
  updatedBy: User;

  // ============================================================
  // HOOKS DE CYCLE DE VIE
  // ============================================================

  @BeforeInsert()
  @BeforeUpdate()
  validateAndSanitize() {
    // Valider la position
    const validPositions: PositionType[] = [
      'center', 'top', 'bottom', 'left', 'right',
      'top-left', 'top-right', 'bottom-left', 'bottom-right'
    ];
    if (this.position && !validPositions.includes(this.position as PositionType)) {
      this.position = 'center';
    }

    // Valider la taille
    const validSizes: SizeType[] = ['cover', 'contain', 'fill', 'none', 'scale-down'];
    if (this.size && !validSizes.includes(this.size as SizeType)) {
      this.size = 'cover';
    }

    // Valider l'opacite
    if (this.overlay_opacity !== undefined) {
      if (this.overlay_opacity < 0) this.overlay_opacity = 0;
      if (this.overlay_opacity > 100) this.overlay_opacity = 100;
    }

    // Valider le flou
    if (this.blur !== undefined) {
      if (this.blur < 0) this.blur = 0;
      if (this.blur > 20) this.blur = 20;
    }

    // Valider la luminosite
    if (this.brightness !== undefined) {
      if (this.brightness < 0) this.brightness = 0;
      if (this.brightness > 200) this.brightness = 200;
    }

    // Nettoyer les textes alternatifs
    if (this.alt_fr) {
      this.alt_fr = this.alt_fr.trim().slice(0, 500);
    }
    if (this.alt_mg) {
      this.alt_mg = this.alt_mg.trim().slice(0, 500);
    }
  }

  // ============================================================
  // METHODES UTILITAIRES
  // ============================================================

  /**
   * Verifie si le fond d'ecran est actif et visible
   */
  isVisible(): boolean {
    return this.is_active && !!this.image_url;
  }

  /**
   * Obtient le texte alternatif en fonction de la langue
   */
  getAltText(language: 'fr' | 'mg'): string | undefined {
    return language === 'fr' ? this.alt_fr : this.alt_mg;
  }

  /**
   * Obtient l'URL de l'image avec des parametres d'optimisation
   */
  getOptimizedUrl(width?: number, height?: number): string {
    let url = this.image_url;
    
    if (url.includes('unsplash.com')) {
      const params = [];
      if (width) params.push(`w=${width}`);
      if (height) params.push(`h=${height}`);
      if (params.length > 0) {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}${params.join('&')}`;
      }
    }
    
    return url;
  }

  /**
   * Convertit l'entite en objet reponse API
   */
  toResponse(): Partial<PageBackground> {
    return {
      id: this.id,
      page_key: this.page_key,
      image_url: this.image_url,
      alt_fr: this.alt_fr,
      alt_mg: this.alt_mg,
      is_active: this.is_active,
      overlay_opacity: this.overlay_opacity,
      position: this.position,
      size: this.size,
      blur: this.blur,
      brightness: this.brightness,
      updated_by: this.updated_by,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}