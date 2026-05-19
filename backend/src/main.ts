import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('YMadAPI');
  
  logger.log('Demarrage de l API Y-Mad');
  logger.log('Version 1.0.0 - Conforme au Cahier des Charges');
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Validation des donnees - DESACTIVEE pour les tests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: false,
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

  // Gestion des fichiers statiques
  const uploadsPath = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    logger.log('Dossier uploads cree: ' + uploadsPath);
  }

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Y-Mad API')
    .setDescription('API complete du site Y-Mad (Youthful Madagascar)')
    .setVersion('1.0.0')
    .setContact('Y-Mad Association', 'https://y-mad.mg', 'ymad.mg@gmail.com')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4001;
  await app.listen(port);
  
  console.log('');
  console.log('============================================================');
  console.log('Y-Mad API - Youthful Madagascar');
  console.log('============================================================');
  console.log('');
  console.log('Serveur      : http://localhost:' + port);
  console.log('API Prefixe  : http://localhost:' + port + '/api');
  console.log('Swagger UI   : http://localhost:' + port + '/api/docs');
  console.log('');
  console.log('============================================================');
  console.log('');
}

bootstrap();