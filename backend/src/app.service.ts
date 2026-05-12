// backend/src/app.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Bienvenue sur l\'API Y-Mad - Youthful Madagascar';
  }

  getHealthStatus() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  getApiInfo() {
    return {
      name: 'Y-Mad API',
      version: '1.0.0',
      description: 'API RESTful pour le site de l\'association Youthful Madagascar',
      author: 'Y-Mad Association',
      website: 'https://y-mad.mg',
      email: 'contact@y-mad.mg',
      documentation: '/api/docs',
      features: [
        'Authentification multi-rôles (7 rôles)',
        'Gestion des membres avec cartes QR',
        'Module emploi (offres + candidatures)',
        'Événements avec inscriptions',
        'Dons Mobile Money (MVola/Orange)',
        'Blog bilingue (Français/Malagasy)',
        'Gestion dynamique des pages',
        'Journal d\'audit complet',
      ],
    };
  }

  getEndpointsList() {
    return {
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
      jobs: {
        list: 'GET /jobs/offers',
        detail: 'GET /jobs/offers/:id',
        apply: 'POST /jobs/apply',
        applications: 'GET /jobs/offers/:id/applications',
      },
      events: {
        list: 'GET /events',
        detail: 'GET /events/:id',
        register: 'POST /events/register',
      },
      donations: {
        list: 'GET /donations',
        create: 'POST /donations',
      },
      members: {
        list: 'GET /members',
        myMember: 'GET /members/me',
        generateCard: 'GET /members/card/:memberNumber',
      },
      blog: {
        list: 'GET /blog',
        detail: 'GET /blog/:id',
      },
      pages: {
        list: 'GET /pages',
        public: 'GET /pages/public/:page',
        backgrounds: 'GET /pages/backgrounds/:page',
      },
      docs: 'GET /api/docs',
    };
  }

  getApiStats() {
    return {
      uptime: process.uptime(),
      memoryUsage: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(process.memoryUsage().external / 1024 / 1024)} MB`,
      },
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
      title: process.title,
    };
  }
}