import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // ⚠️ TRÈS IMPORTANT: Servir les fichiers statiques
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.useGlobalPipes(new ValidationPipe());
  
  const port = 4001;
  await app.listen(port);
  
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📁 Static files served from /uploads`);
  console.log(`🖼️ Test photo: http://localhost:4001/uploads/profiles/33aadd9f-d4f2-400f-a7a7-db905e2ddbed/1777716918335-v6uktty3.jpg`);
}

bootstrap();