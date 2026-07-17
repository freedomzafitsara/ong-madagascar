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

  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║           Y-MaD - Young for Madagascar Development                ║');
  console.log('║           Plateforme de Gestion des Offres d\'Emploi              ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log('');

  logger.log('============================================================');
  logger.log('Y-MaD - Plateforme de Gestion des Offres d\'Emploi');
  logger.log('Version 1.0.0');
  logger.log('============================================================');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // ✅ Modification : forbidNonWhitelisted à false pour permettre les champs additionnels
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,  // ← Changé de true à false
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

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:4001', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Disposition'],
  });

  app.setGlobalPrefix('api');

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Y-MaD API - Plateforme de Gestion des Offres d\'Emploi')
    .setDescription('API complete pour la plateforme de gestion des offres d\'emploi de l\'ONG Y-MaD.')
    .setVersion('1.0.0')
    .setContact('Y-MaD Association', 'https://y-mad.mg', 'ymad.mg@gmail.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth()
    .addTag('auth', 'Authentification')
    .addTag('jobs', 'Offres d\'emploi')
    .addTag('projects', 'Projets')
    .addTag('blog', 'Articles')
    .addTag('pages', 'Contenus')
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
      logger.log(`Dossier cree: uploads/${dir}/`);
    }
  }
  logger.log('Sous-dossiers uploads crees avec succes');

  // ============================================================
  // SERVEUR DE FICHIERS STATIQUES
  // ============================================================

  const absoluteUploadsPath = path.resolve(uploadsPath);
  logger.log(`Chemin absolu des uploads: ${absoluteUploadsPath}`);

  app.useStaticAssets(absoluteUploadsPath, {
    prefix: '/uploads/',
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.pdf') contentType = 'application/pdf';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    },
  });

  app.use('/uploads', (req, res, next) => {
    logger.debug(`Fichier statique demande: ${req.url}`);
    next();
  });

  const profileDir = path.join(uploadsPath, 'profile');
  if (fs.existsSync(profileDir)) {
    const files = fs.readdirSync(profileDir);
    logger.log(`Fichiers dans uploads/profile: ${files.length}`);
    files.forEach(file => {
      logger.log(`  - ${file}`);
      const filePath = path.join(profileDir, file);
      const stats = fs.statSync(filePath);
      logger.log(`    Taille: ${stats.size} octets`);
    });
  } else {
    logger.warn('Le dossier uploads/profile n\'existe pas encore');
  }

  logger.log('Fichiers statiques disponibles sur /uploads/');

  // ============================================================
  // DEMARRAGE DU SERVEUR
  // ============================================================

  const port = process.env.PORT || 4001;
  await app.listen(port, '0.0.0.0');

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('                 Y-MaD PLATEFORME DE GESTION                     ');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`  Serveur        : http://localhost:${port}`);
  console.log(`  API Prefixe    : http://localhost:${port}/api`);
  console.log(`  Swagger UI     : http://localhost:${port}/api/docs`);
  console.log(`  Uploads        : http://localhost:${port}/uploads/`);
  console.log('');
  console.log(`  Chemin uploads : ${absoluteUploadsPath}`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('  API Y-MaD demarree avec succes');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
}

bootstrap();