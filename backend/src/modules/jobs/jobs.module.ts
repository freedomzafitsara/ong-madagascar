/**
 * Module de gestion des offres d'emploi et des candidatures
 * @module JobsModule
 * @description Ce module gère toutes les fonctionnalités liées aux offres d'emploi
 * et aux candidatures pour la plateforme Y-MaD.
 * 
 * Fonctionnalités principales :
 * - CRUD des offres d'emploi
 * - Gestion des candidatures
 * - Statistiques des offres et candidatures
 * - Export des données
 * 
 * @author Y-MaD Team
 * @version 1.0.0
 */

import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobOffer } from '../../entities/job-offer.entity';
import { JobApplication } from '../../entities/job-application.entity';
import { User } from '../../entities/user.entity';

/**
 * Configuration du module Jobs
 * - Importe les entités nécessaires pour TypeORM
 * - Définit le contrôleur et le service
 * - Configure un logger dédié
 * - Exporte le service pour utilisation dans d'autres modules
 */
@Module({
  imports: [
    /**
     * Enregistrement des entités pour TypeORM
     * Ces entités seront disponibles pour injection dans le service
     */
    TypeOrmModule.forFeature([JobOffer, JobApplication, User]),
    
    // ============================================================
    // MODULES OPTIONNELS (commentés par défaut)
    // ============================================================
    // UploadModule - Pour la gestion des fichiers (CV, lettres, etc.)
    // Décommentez si vous avez besoin de l'upload de fichiers
    // Attention: Assurez-vous que le module UploadModule existe
    // UploadModule,
  ],
  
  /**
   * Contrôleur du module
   * Gère les routes HTTP pour les offres et candidatures
   */
  controllers: [JobsController],
  
  /**
   * Providers du module
   */
  providers: [
    /**
     * Service principal du module
     * Contient toute la logique métier
     */
    JobsService,
    
    /**
     * Logger personnalisé pour le module Jobs
     * Utilise une factory pour créer une instance isolée
     */
    {
      provide: 'JOBS_LOGGER',
      useFactory: () => new Logger('JobsModule'),
    },
  ],
  
  /**
   * Exports du module
   * Permet à d'autres modules d'utiliser ces services/entités
   */
  exports: [
    JobsService,      // Export du service pour réutilisation
    TypeOrmModule,    // Export des repositories TypeORM
  ],
})
export class JobsModule {
  /**
   * Constructeur avec logging optionnel
   * @param logger - Logger injecté (optionnel)
   */
  constructor(
    // Injection optionnelle du logger (si vous voulez logger l'initialisation)
    // @Inject('JOBS_LOGGER') private logger: Logger,
  ) {
    // Décommentez pour logger l'initialisation du module
    // this.logger?.log('✅ JobsModule initialisé avec succès');
  }
}