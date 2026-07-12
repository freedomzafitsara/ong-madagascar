// backend/src/modules/contact/entities/contact.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type ContactStatus = 'unread' | 'read' | 'replied' | 'archived';

/**
 * Entite Contact - Gestion des messages du formulaire de contact
 * Plateforme Y-MaD - Young for Madagascar Development
 */
@Entity('contacts')
@Index(['email', 'created_at'])
@Index(['status'])
@Index(['created_at'])
export class Contact {
  /**
   * Identifiant unique UUID v4
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Nom complet de l'expediteur
   */
  @Column({ length: 255 })
  name: string;

  /**
   * Adresse email de l'expediteur
   */
  @Column({ length: 255 })
  email: string;

  /**
   * Numero de telephone de l'expediteur (optionnel)
   */
  @Column({ length: 50, nullable: true })
  phone: string | null;

  /**
   * Sujet du message
   */
  @Column({ length: 255 })
  subject: string;

  /**
   * Contenu du message
   */
  @Column({ type: 'text' })
  message: string;

  /**
   * Statut du message
   * - unread: Non lu
   * - read: Lu
   * - replied: Repondu
   * - archived: Archive
   */
  @Column({
    type: 'enum',
    enum: ['unread', 'read', 'replied', 'archived'],
    default: 'unread',
  })
  status: ContactStatus;

  /**
   * Notes internes de l'administrateur
   */
  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  admin_notes: string | null;

  /**
   * Adresse IP de l'expediteur
   */
  @Column({ name: 'ip_address', length: 45, nullable: true })
  ip_address: string | null;

  /**
   * Date de lecture du message
   */
  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  read_at: Date | null;

  /**
   * Date de reponse au message
   */
  @Column({ name: 'replied_at', type: 'timestamp', nullable: true })
  replied_at: Date | null;

  /**
   * Date de creation du message
   */
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  /**
   * Date de derniere modification
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // ============================================================
  // METHODES METIER
  // ============================================================

  /**
   * Verifie si le message est non lu
   */
  isUnread(): boolean {
    return this.status === 'unread';
  }

  /**
   * Verifie si le message a ete lu
   */
  isRead(): boolean {
    return this.status === 'read' || this.read_at !== null;
  }

  /**
   * Verifie si le message a recu une reponse
   */
  isReplied(): boolean {
    return this.status === 'replied' || this.replied_at !== null;
  }

  /**
   * Verifie si le message est archive
   */
  isArchived(): boolean {
    return this.status === 'archived';
  }

  /**
   * Marque le message comme lu
   */
  markAsRead(): void {
    if (this.status === 'unread') {
      this.status = 'read';
      this.read_at = new Date();
    }
  }

  /**
   * Marque le message comme repondu
   */
  markAsReplied(): void {
    this.status = 'replied';
    this.replied_at = new Date();
  }

  /**
   * Archive le message
   */
  archive(): void {
    this.status = 'archived';
  }

  /**
   * Restaure un message archive
   */
  restore(): void {
    if (this.status === 'archived') {
      this.status = 'unread';
      this.read_at = null;
      this.replied_at = null;
    }
  }

  /**
   * Obtient le libelle du statut en francais
   */
  getStatusLabel(language: 'fr' | 'mg' = 'fr'): string {
    const labels = {
      fr: {
        unread: 'Non lu',
        read: 'Lu',
        replied: 'Répondu',
        archived: 'Archivé'
      },
      mg: {
        unread: 'Tsy mbola vakina',
        read: 'Vakina',
        replied: 'Valiny',
        archived: 'Voatahiry'
      }
    };
    return labels[language]?.[this.status] || this.status;
  }

  /**
   * Obtient la couleur du statut pour l'affichage
   */
  getStatusColor(): string {
    const colors = {
      unread: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      read: 'bg-blue-100 text-blue-800 border-blue-200',
      replied: 'bg-green-100 text-green-800 border-green-200',
      archived: 'bg-gray-100 text-gray-600 border-gray-200'
    };
    return colors[this.status] || 'bg-gray-100 text-gray-600';
  }

  /**
   * Obtient un resume du message
   */
  getSummary(maxLength: number = 100): string {
    if (!this.message) return '';
    return this.message.length > maxLength 
      ? this.message.substring(0, maxLength) + '...' 
      : this.message;
  }

  /**
   * Verifie si le message est valide
   */
  isValid(): boolean {
    return !!(this.name && this.email && this.subject && this.message);
  }

  /**
   * Nettoie les donnees du contact
   */
  sanitize(): void {
    this.name = this.name?.trim() || '';
    this.email = this.email?.trim().toLowerCase() || '';
    this.phone = this.phone?.trim() || null;
    this.subject = this.subject?.trim() || '';
    this.message = this.message?.trim() || '';
    this.admin_notes = this.admin_notes?.trim() || null;
    this.ip_address = this.ip_address?.trim() || null;
  }

  // ============================================================
  // METHODES DE FORMATAGE
  // ============================================================

  /**
   * Convertit en objet reponse API
   */
  toResponse(): Partial<Contact> & { status_label: string; status_color: string } {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      subject: this.subject,
      message: this.message,
      status: this.status,
      status_label: this.getStatusLabel('fr'),
      status_color: this.getStatusColor(),
      admin_notes: this.admin_notes,
      read_at: this.read_at,
      replied_at: this.replied_at,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  /**
   * Convertit en ligne CSV pour l'export
   */
  toCsvRow(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone || '',
      subject: this.subject,
      message: this.message.replace(/<[^>]*>/g, '').replace(/,/g, ' '),
      status: this.getStatusLabel('fr'),
      created_at: this.created_at ? new Date(this.created_at).toLocaleDateString('fr-FR') : '',
      read_at: this.read_at ? new Date(this.read_at).toLocaleDateString('fr-FR') : '',
      replied_at: this.replied_at ? new Date(this.replied_at).toLocaleDateString('fr-FR') : '',
    };
  }

  /**
   * Convertit en objet JSON simplifie
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      subject: this.subject,
      message: this.getSummary(50),
      status: this.status,
      status_label: this.getStatusLabel('fr'),
      created_at: this.created_at,
      read_at: this.read_at,
      replied_at: this.replied_at,
    };
  }
}