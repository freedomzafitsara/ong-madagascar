import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { FooterModule } from './modules/footer/footer.module';
import { MembersModule } from './modules/members/members.module';
import { DonationsModule } from './modules/donations/donations.module';
import { EventsModule } from './modules/events/events.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { BlogModule } from './modules/blog/blog.module';
import { UploadModule } from './modules/upload/upload.module';

// Guards
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

// Entities
import { User } from './entities/user.entity';
import { Project } from './entities/project.entity';
import { Member } from './entities/member.entity';
import { Donation } from './entities/donation.entity';
import { Event } from './entities/event.entity';
import { EventRegistration } from './entities/event-registration.entity';
import { JobOffer } from './entities/job-offer.entity';
import { JobApplication } from './entities/job-application.entity';
import { BlogPost } from './entities/blog-post.entity';
import { FooterSection } from './modules/footer/entities/footer-section.entity';
import { FooterLink } from './modules/footer/entities/footer-link.entity';
import { FooterContact } from './modules/footer/entities/footer-contact.entity';
import { FooterLegalLink } from './modules/footer/entities/footer-legal-link.entity';

@Module({
  imports: [
    // Configuration des variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Base de données PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: parseInt(configService.get('DB_PORT', '5432')),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'ymad_db'),
        entities: [
          User,
          Project,
          Member,
          Donation,
          Event,
          EventRegistration,
          JobOffer,
          JobApplication,
          BlogPost,
          FooterSection,
          FooterLink,
          FooterContact,
          FooterLegalLink,
        ],
        synchronize: false,
        logging: true,
      }),
      inject: [ConfigService],
    }),

    // Modules fonctionnels
    AuthModule,
    ProjectsModule,
    FooterModule,
    MembersModule,
    DonationsModule,
    EventsModule,
    JobsModule,
    BlogModule,
    UploadModule,  // ← Module pour l'upload de fichiers
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}