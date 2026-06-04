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

  // ============================================================
  // VALIDATION GLOBALE AVEC DETAILS DES ERREURS
  // ============================================================
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

  // ============================================================
  // CONFIGURATION CORS
  // ============================================================
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // ============================================================
  // PREFIXE GLOBAL
  // ============================================================
  app.setGlobalPrefix('api');

  // ============================================================
  // CONFIGURATION SWAGGER
  // ============================================================
  const config = new DocumentBuilder()
    .setTitle('Y-MaD API - Gestion des offres d emploi')
    .setDescription(`
      API complete pour la plateforme de gestion des offres d emploi de l ONG Y-MaD.

      Modules disponibles:
      - Auth: Authentification admin (JWT)
      - Projects: Gestion des projets (CRUD)
      - Blog: Gestion des articles (CRUD)
      - Jobs: Gestion des offres d emploi et candidatures
      - Pages: Gestion du contenu des pages et fonds d ecran
      - Upload: Gestion des fichiers (images, CV, documents)

      Charte graphique:
      - Bleu primaire: #1E3A8A
      - Gris secondaire: #6B7280
    `)
    .setVersion('1.0.0')
    .setContact('Y-MaD Association', 'https://y-mad.mg', 'contact@y-mad.mg')
    .addBearerAuth()
    .addTag('auth', 'Authentification admin')
    .addTag('projects', 'Gestion des projets')
    .addTag('blog', 'Gestion du blog')
    .addTag('jobs', 'Offres d emploi et candidatures')
    .addTag('pages', 'Contenu des pages et fonds d ecran')
    .addTag('upload', 'Upload de fichiers')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  logger.log('Swagger UI disponible sur /api/docs');

  // ============================================================
  // CREATION DES DOSSIERS UPLOADS
  // ============================================================
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
    }
  }
  logger.log('Sous-dossiers uploads crees avec succes');

  // ============================================================
  // SERVEUR DE FICHIERS STATIQUES
  // ============================================================
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });
  logger.log('Fichiers statiques disponibles sur /uploads/');

  // ============================================================
  // DEMARRAGE DU SERVEUR
  // ============================================================
  const port = process.env.PORT || 4001;
  await app.listen(port);

  // ============================================================
  // AFFICHAGE DES INFORMATIONS DE DEMARRAGE
  // ============================================================
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
  console.log('Modules actifs:');
  console.log('   - Auth (authentification admin)');
  console.log('   - Projects (gestion des projets)');
  console.log('   - Blog (gestion des articles)');
  console.log('   - Jobs (offres d emploi et candidatures)');
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