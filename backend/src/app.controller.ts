import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('API - Accueil')
@Controller()
export class AppController {
  
  @Get()
  @ApiOperation({ summary: 'Page d\'accueil de l\'API' })
  @ApiResponse({ status: 200, description: 'API operationnelle' })
  getHello() {
    return {
      message: 'Bienvenue sur l\'API Y-Mad',
      version: '1.0.0',
      status: 'online',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: {
          login: 'POST /auth/login',
          register: 'POST /auth/register',
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
        jobs: {
          list: 'GET /jobs/offers',
          detail: 'GET /jobs/offers/:id',
          featured: 'GET /jobs/offers/featured',
          stats: 'GET /jobs/offers/stats',
          create: 'POST /jobs/offers',
          update: 'PATCH /jobs/offers/:id',
          updateStatus: 'PATCH /jobs/offers/:id/status',
          delete: 'DELETE /jobs/offers/:id',
          apply: 'POST /jobs/apply',
          applyAuth: 'POST /jobs/apply/auth',
          applications: 'GET /jobs/offers/:id/applications',
          applicationDetail: 'GET /jobs/applications/:id',
          updateApplicationStatus: 'PATCH /jobs/applications/:id/status',
          myApplications: 'GET /jobs/applications/my',
          allApplications: 'GET /jobs/applications/all',
        },
        events: {
          list: 'GET /events',
          detail: 'GET /events/:id',
          create: 'POST /events',
          update: 'PUT /events/:id',
          delete: 'DELETE /events/:id',
          register: 'POST /events/register',
          myRegistrations: 'GET /events/my-registrations',
          eventRegistrations: 'GET /events/:id/registrations',
        },
        donations: {
          list: 'GET /donations',
          stats: 'GET /donations/stats/all',
          create: 'POST /donations',
          createAuth: 'POST /donations/auth',
          confirm: 'POST /donations/confirm',
          myDonations: 'GET /donations/my-donations',
          detail: 'GET /donations/:id',
        },
        members: {
          list: 'GET /members',
          stats: 'GET /members/stats/all',
          myMember: 'GET /members/me',
          detail: 'GET /members/:id',
          create: 'POST /members',
          updateStatus: 'PUT /members/:id/status',
          card: 'GET /members/card/:memberNumber',
        },
        blog: {
          list: 'GET /blog',
          stats: 'GET /blog/stats/all',
          detail: 'GET /blog/:id',
          create: 'POST /blog',
          update: 'PUT /blog/:id',
          publish: 'PUT /blog/:id/publish',
          delete: 'DELETE /blog/:id',
        },
        volunteers: {
          list: 'GET /volunteers',
          detail: 'GET /volunteers/:id',
          create: 'POST /volunteers',
          assignments: 'GET /volunteers/assignments',
          certificates: 'GET /volunteers/certificates',
        },
        partners: {
          list: 'GET /partners',
          detail: 'GET /partners/:id',
          create: 'POST /partners',
          update: 'PUT /partners/:id',
          delete: 'DELETE /partners/:id',
        },
        pages: {
          list: 'GET /pages',
          public: 'GET /pages/public/:page',
          admin: 'GET /pages/:page',
          update: 'PUT /pages/:page',
          backgroundsAll: 'GET /pages/backgrounds/all',
          background: 'GET /pages/backgrounds/:page',
          updateBackground: 'PUT /pages/backgrounds/:page',
          deleteBackground: 'DELETE /pages/backgrounds/:id',
          initialize: 'POST /pages/initialize',
        },
        newsletter: {
          subscribe: 'POST /newsletter/subscribe',
          unsubscribe: 'DELETE /newsletter/unsubscribe',
          subscribers: 'GET /newsletter/subscribers',
        },
        upload: {
          single: 'POST /upload/single',
          multiple: 'POST /upload/multiple',
          getImages: 'GET /upload',
          delete: 'DELETE /upload',
        },
        footer: {
          get: 'GET /footer',
          update: 'PUT /footer',
        },
        docs: 'GET /api/docs',
      },
      documentation: 'http://localhost:4001/api/docs',
      health: 'http://localhost:4001/health',
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Verification de l etat du serveur' })
  @ApiResponse({ status: 200, description: 'Serveur operationnel' })
  @HttpCode(HttpStatus.OK)
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      memory: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
    };
  }

  @Get('info')
  @ApiOperation({ summary: 'Informations sur l API' })
  @ApiResponse({ status: 200, description: 'Informations recuperees' })
  getInfo() {
    return {
      name: 'Y-Mad API',
      description: 'API pour le site de l association Youthful Madagascar',
      version: '1.0.0',
      author: 'Y-Mad Association',
      license: 'MIT',
      documentation: '/api/docs',
      features: [
        'Authentification multi-roles (7 roles)',
        'Gestion des membres avec cartes QR',
        'Module emploi (offres + candidatures)',
        'Evenements avec inscriptions',
        'Dons Mobile Money (MVola/Orange)',
        'Blog bilingue (Francais/Malagasy)',
        'Gestion dynamique des pages',
        'Journal d audit complet',
      ],
    };
  }
}