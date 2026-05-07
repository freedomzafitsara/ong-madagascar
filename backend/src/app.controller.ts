// backend/src/app.controller.ts
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('API')
@Controller()
export class AppController {
  
  @Get()
  @ApiOperation({ summary: 'Page d\'accueil de l\'API' })
  @ApiResponse({ status: 200, description: 'API opérationnelle' })
  getHello() {
    return {
      message: 'Bienvenue sur l\'API Y-Mad',
      version: '1.0.0',
      status: 'online',
      endpoints: {
        auth: {
          register: 'POST /auth/register',
          login: 'POST /auth/login',
          profile: 'GET /auth/profile',
          forgotPassword: 'POST /auth/forgot-password',
          resetPassword: 'POST /auth/reset-password',
        },
        projects: {
          list: 'GET /projects',
          detail: 'GET /projects/:id',
          create: 'POST /projects',
          update: 'PATCH /projects/:id',
          delete: 'DELETE /projects/:id',
        },
        beneficiaries: {
          list: 'GET /beneficiaries',
          detail: 'GET /beneficiaries/:id',
          stats: 'GET /beneficiaries/stats',
        },
        jobs: {
          list: 'GET /jobs',
          detail: 'GET /jobs/:id',
          apply: 'POST /jobs/:id/apply',
        },
        events: {
          list: 'GET /events',
          detail: 'GET /events/:id',
          register: 'POST /events/:id/register',
        },
        donations: {
          list: 'GET /donations',
          create: 'POST /donations',
        },
        members: {
          list: 'GET /members',
          generateCard: 'POST /members/generate/:userId',
          renew: 'POST /members/renew/:id',
        },
        newsletter: {
          subscribe: 'POST /newsletter/subscribe',
          unsubscribe: 'DELETE /newsletter/unsubscribe',
          subscribers: 'GET /newsletter/subscribers',
        },
        docs: 'GET /api/docs',
      },
      documentation: 'http://localhost:4001/api/docs',
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Vérification de l\'état du serveur' })
  @ApiResponse({ status: 200, description: 'Serveur opérationnel' })
  @HttpCode(HttpStatus.OK)
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
    };
  }
}