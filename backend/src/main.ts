// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  // Créer l'application avec le type NestExpressApplication pour les fichiers statiques
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ============================================================
  // VALIDATION DES DONNEES
  // ============================================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ============================================================
  // CONFIGURATION CORS
  // ============================================================
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ============================================================
  // PREFIXE GLOBAL
  // ============================================================
  app.setGlobalPrefix('api');

  // ============================================================
  // FICHIERS STATIQUES (UPLOADS)
  // ============================================================
  // Créer le dossier uploads s'il n'existe pas
  const uploadsPath = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('Dossier uploads cree: ' + uploadsPath);
  }

  // Servir les fichiers statiques du dossier uploads
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  // ============================================================
  // CONFIGURATION SWAGGER
  // ============================================================
  const config = new DocumentBuilder()
    .setTitle('Y-Mad API')
    .setDescription(`
      API complete du site Y-Mad (Youthful Madagascar)

      Fonctionnalites principales :
      - Authentification (7 roles: super_admin, admin, staff, member, volunteer, partner, visitor)
      - Gestion des membres avec cartes QR
      - Projets et indicateurs d'impact
      - Evenements avec inscriptions et QR codes
      - Module emploi (offres et candidatures)
      - Dons Mobile Money (MVola, Orange Money)
      - Blog bilingue (Francais/Malagasy)
      - Gestion dynamique des pages
      - Journal d'audit complet
    `)
    .setVersion('1.0.0')
    .setContact('Y-Mad Association', 'https://y-mad.mg', 'contact@y-mad.mg')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Entrez votre token JWT obtenu via /api/auth/login',
      },
      'access-token',
    )
    .addTag('Auth', 'Authentification et gestion des utilisateurs')
    .addTag('Members', 'Gestion des adhesions et cartes membres')
    .addTag('Projects', 'Gestion des projets Y-Mad')
    .addTag('Jobs', 'Module emploi - Offres et candidatures')
    .addTag('Events', 'Gestion des evenements et inscriptions')
    .addTag('Donations', 'Gestion des dons et paiements')
    .addTag('Blog', 'Articles et actualites')
    .addTag('Pages', 'Gestion dynamique du contenu')
    .addTag('Upload', 'Upload de fichiers')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Sauvegarder la documentation en JSON
  const swaggerPath = path.join(process.cwd(), 'swagger.json');
  fs.writeFileSync(swaggerPath, JSON.stringify(document, null, 2));
  console.log('Documentation Swagger sauvegardee: ' + swaggerPath);

  // Configurer l'interface Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Y-Mad API Documentation',
  });

  // ============================================================
  // DEMARRAGE DU SERVEUR
  // ============================================================
  const port = process.env.PORT || 4001;
  await app.listen(port);
  
  console.log('');
  console.log('============================================================');
  console.log('Y-Mad API - Demarree avec succes');
  console.log('============================================================');
  console.log('');
  console.log('Serveur      : http://localhost:' + port);
  console.log('API Prefixe  : http://localhost:' + port + '/api');
  console.log('Swagger UI   : http://localhost:' + port + '/api/docs');
  console.log('Swagger JSON : http://localhost:' + port + '/api/docs-json');
  console.log('Fichiers     : http://localhost:' + port + '/uploads/');
  console.log('');
  console.log('============================================================');
  console.log('');
}

bootstrap();