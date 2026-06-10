// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('YMadAPI');

  logger.log('============================================================');
  logger.log('Demarrage de l API Y-Mad');
  logger.log('Version 1.0.0 - Conforme au Cahier des Charges');
  logger.log('Theme: Gestion des offres d emploi - ONG Y-MaD');
  logger.log('============================================================');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Validation globale avec details des erreurs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map(error => ({
          property: error.property,
          constraints: error.constraints,
          value: error.value,
        }));
        
        logger.error('Echec de validation des donnees recues');
        formattedErrors.forEach(err => {
          logger.error(`Champ: ${err.property} - Erreur: ${JSON.stringify(err.constraints)}`);
        });
        
        return new BadRequestException({
          statusCode: 400,
          message: 'Erreur de validation des donnees',
          errors: formattedErrors,
          timestamp: new Date().toISOString(),
        });
      },
    }),
  );

  // Configuration CORS pour permettre au frontend Next.js d'acceder a l'API
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:4001', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Disposition'],
  });

  // Prefixe global - TOUTES les routes commencent par /api
  app.setGlobalPrefix('api');

  // Configuration Swagger avec informations reelles Y-MaD
  const config = new DocumentBuilder()
    .setTitle('Y-MaD API - Plateforme de Gestion des Offres d\'Emploi')
    .setDescription(`
      Y-MaD - Young for Madagascar Development

      API complete pour la plateforme de gestion des offres d'emploi, de stages et de benevolat de l'ONG Y-MaD.

      Informations de contact
      - Organisation: Y-MaD (Young for Madagascar Development)
      - Adresse: Carion, Antananarivo, Madagascar
      - Telephone: +261 32 04 856 97
      - Email: ymad.mg@gmail.com
      - Horaires: Lundi au Vendredi, 8h - 17h

      Mission
      Developpement economique, social et educatif des jeunes malgaches de 18 a 35 ans a travers une plateforme centralisee d'offres d'emploi.

      Modules disponibles
      - Auth: Authentification admin avec JWT
      - Jobs: Gestion des offres d'emploi et candidatures
      - Projects: Gestion des projets Y-MaD
      - Blog: Gestion des articles
      - Pages: Gestion du contenu des pages et fonds d'ecran
      - Upload: Gestion des fichiers (images, CV, documents)

      Charte graphique
      - Bleu primaire: #1E3A8A
      - Gris secondaire: #6B7280
    `)
    .setVersion('1.0.0')
    .setContact('Y-MaD Association', 'https://y-mad.mg', 'ymad.mg@gmail.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth()
    .addTag('auth', 'Authentification admin')
    .addTag('jobs', 'Offres d emploi et candidatures')
    .addTag('projects', 'Projets Y-MaD')
    .addTag('blog', 'Articles du blog')
    .addTag('pages', 'Contenu des pages et fonds d ecran')
    .addTag('upload', 'Upload de fichiers')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  logger.log('Swagger UI disponible sur /api/docs');

  // Creation des dossiers uploads
  const uploadsPath = path.join(process.cwd(), 'uploads');
  const subDirs = ['banner', 'project', 'blog', 'profile', 'logo', 'background', 'job', 'cv', 'diploma', 'attestation'];
  
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    logger.log('Dossier uploads cree');
  }
  
  for (const dir of subDirs) {
    const subPath = path.join(uploadsPath, dir);
    if (!fs.existsSync(subPath)) {
      fs.mkdirSync(subPath, { recursive: true });
      logger.log(`Dossier cree: uploads/${dir}/`);
    }
  }
  logger.log('Sous-dossiers uploads crees avec succes');

  // Serveur de fichiers statiques
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  });
  logger.log('Fichiers statiques disponibles sur /uploads/');

  // Demarrage du serveur
  const port = process.env.PORT || 4001;
  await app.listen(port, '0.0.0.0');

  // Affichage des informations de demarrage
  console.log('');
  console.log('============================================================');
  console.log('Y-MaD API - Youthful Madagascar');
  console.log('Theme: Gestion des offres d emploi');
  console.log('============================================================');
  console.log('');
  console.log(`Serveur      : http://localhost:${port}`);
  console.log(`API Prefixe  : http://localhost:${port}/api`);
  console.log(`Swagger UI   : http://localhost:${port}/api/docs`);
  console.log(`Uploads      : http://localhost:${port}/uploads/`);
  console.log('');
  console.log('Informations de contact:');
  console.log('   Adresse: Carion, Antananarivo, Madagascar');
  console.log('   Telephone: +261 32 04 856 97');
  console.log('   Email: ymad.mg@gmail.com');
  console.log('   Horaires: Lundi au Vendredi, 8h - 17h');
  console.log('');
  console.log('Modules actifs:');
  console.log('   - Auth (authentification admin)');
  console.log('   - Jobs (offres d emploi et candidatures)');
  console.log('   - Projects (gestion des projets)');
  console.log('   - Blog (gestion des articles)');
  console.log('   - Pages (contenus et fonds d ecran)');
  console.log('   - Upload (gestion des fichiers)');
  console.log('');
  console.log('Sous-dossiers uploads crees:');
  for (const dir of subDirs) {
    console.log(`   - /uploads/${dir}/`);
  }
  console.log('');
  console.log('Charte graphique: Bleu (#1E3A8A) et Gris (#6B7280)');
  console.log('');
  console.log('============================================================');
  console.log('');
}

bootstrap();