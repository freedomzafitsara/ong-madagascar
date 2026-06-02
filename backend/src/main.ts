// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
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

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuration CORS
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Prefixe global
  app.setGlobalPrefix('api');

  // Configuration Swagger
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
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  logger.log('Swagger UI disponible sur /api/docs');

  // Dossier uploads (pour les fichiers temporaires)
  const uploadsPath = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    logger.log('Dossier uploads cree: ' + uploadsPath);
  }

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  // Demarrage du serveur
  const port = process.env.PORT || 4001;
  await app.listen(port);

  console.log('');
  console.log('============================================================');
  console.log('Y-MaD API - Youthful Madagascar');
  console.log('Theme: Gestion des offres d emploi');
  console.log('============================================================');
  console.log('');
  console.log('Serveur      : http://localhost:' + port);
  console.log('API Prefixe  : http://localhost:' + port + '/api');
  console.log('Swagger UI   : http://localhost:' + port + '/api/docs');
  console.log('');
  console.log('Modules actifs:');
  console.log('   - Auth (authentification admin)');
  console.log('   - Projects (gestion des projets)');
  console.log('   - Blog (gestion des articles)');
  console.log('   - Jobs (offres d emploi et candidatures)');
  console.log('   - Pages (contenus et fonds d ecran)');
  console.log('');
  console.log('Charte graphique: Bleu (#1E3A8A) et Gris (#6B7280)');
  console.log('');
  console.log('============================================================');
  console.log('');
}

bootstrap();