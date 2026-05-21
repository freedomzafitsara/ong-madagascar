import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('YMadAPI');
  
  logger.log('Demarrage de l API Y-Mad');
  logger.log('Version 1.0.0 - Conforme au Cahier des Charges');
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

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

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  app.setGlobalPrefix('api');

  const uploadsPath = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    logger.log('Dossier uploads cree: ' + uploadsPath);
  }

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  const port = process.env.PORT || 4001;
  await app.listen(port);
  
  console.log('');
  console.log('============================================================');
  console.log('Y-Mad API - Youthful Madagascar');
  console.log('============================================================');
  console.log('');
  console.log('Serveur      : http://localhost:' + port);
  console.log('API Prefixe  : http://localhost:' + port + '/api');
  console.log('');
  console.log('============================================================');
  console.log('');
}

bootstrap();