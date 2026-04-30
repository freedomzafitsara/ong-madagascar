// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Modules imports
import { AuthModule } from './modules/auth/auth.module';
import { MembersModule } from './modules/members/members.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { BeneficiariesModule } from './modules/beneficiaries/beneficiaries.module';
import { VolunteersModule } from './modules/volunteers/volunteers.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { EventsModule } from './modules/events/events.module';
import { DonationsModule } from './modules/donations/donations.module';
import { BlogModule } from './modules/blog/blog.module';
import { PartnersModule } from './modules/partners/partners.module';
import { BackgroundsModule } from './modules/backgrounds/backgrounds.module';
import { ReportsModule } from './modules/reports/reports.module';
import { UploadModule } from './modules/upload/upload.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { FooterModule } from './modules/footer/footer.module';  // ← AJOUTER CETTE LIGNE

// Controllers and services
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'ymad_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    
    // Fichiers statiques (uploads)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    
    // Modules fonctionnels
    AuthModule,
    MembersModule,
    ProjectsModule,
    BeneficiariesModule,
    VolunteersModule,
    JobsModule,
    EventsModule,
    DonationsModule,
    BlogModule,
    PartnersModule,
    BackgroundsModule,
    ReportsModule,
    UploadModule,
    NewsletterModule,
    PaymentsModule,
    FooterModule,  // ← AJOUTER CETTE LIGNE
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}