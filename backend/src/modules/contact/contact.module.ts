// backend/src/modules/contact/contact.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { Contact } from './entities/contact.entity';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';

/**
 * Module de gestion des messages de contact
 * 
 * Ce module gère :
 * - L'envoi de messages depuis le formulaire public
 * - La récupération et la gestion des messages par l'administrateur
 * - La réponse aux messages par email
 * - L'export des messages en CSV
 * 
 * Plateforme Y-MaD - Young for Madagascar Development
 */
@Module({
  imports: [
    // Enregistrement de l'entité Contact pour TypeORM
    TypeOrmModule.forFeature([Contact]),
    
    // Module d'envoi d'emails pour les réponses
    EmailModule,
    
    // Module d'authentification pour les guards
    AuthModule,
  ],
  controllers: [
    // Contrôleur des routes API
    ContactController,
  ],
  providers: [
    // Service de gestion des contacts
    ContactService,
  ],
  exports: [
    // Export du service pour d'autres modules
    ContactService,
  ],
})
export class ContactModule {}