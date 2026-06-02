// backend/src/app.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

  getHello() {
    return {
      message: 'Bienvenue sur l API Y-MaD',
      version: '1.0.0',
      status: 'online',
      documentation: 'http://localhost:4001/api/docs',
      endpoints: {
        auth: {
          login: 'POST /api/auth/login',
          register: 'POST /api/auth/register',
          profile: 'GET /api/auth/profile',
        },
        projects: {
          list: 'GET /api/projects',
          detail: 'GET /api/projects/:id',
          create: 'POST /api/projects',
          update: 'PATCH /api/projects/:id',
          delete: 'DELETE /api/projects/:id',
        },
        blog: {
          list: 'GET /api/blog',
          detail: 'GET /api/blog/:id',
          create: 'POST /api/blog',
          update: 'PATCH /api/blog/:id',
          delete: 'DELETE /api/blog/:id',
        },
        jobs: {
          offers: 'GET /api/jobs/offers',
          offerDetail: 'GET /api/jobs/offers/:id',
          apply: 'POST /api/jobs/apply',
          applications: 'GET /api/jobs/applications',
          myApplications: 'GET /api/jobs/applications/my',
        },
        pages: {
          public: 'GET /api/pages/public/:page',
          backgrounds: 'GET /api/pages/backgrounds/:page',
        },
      },
    };
  }

  getHealth() {
    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    
    let uptimeHuman = '';
    if (days > 0) uptimeHuman += days + 'j ';
    if (hours > 0) uptimeHuman += hours + 'h ';
    if (minutes > 0) uptimeHuman += minutes + 'm ';
    uptimeHuman += seconds + 's';
    
    return {
      status: 'ok',
      service: 'Y-MaD API - Gestion des offres d emploi',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptimeSeconds,
        human: uptimeHuman,
      },
      database: {
        status: 'connected',
        type: 'PostgreSQL',
      },
      environment: process.env.NODE_ENV || 'development',
    };
  }

  getInfo() {
    return {
      name: 'Y-MaD API',
      version: '1.0.0',
      author: 'Y-MaD Association',
      description: 'API REST pour la plateforme de gestion des offres d emploi',
      documentation: '/api/docs',
      features: [
        'Authentification JWT',
        'Gestion des projets',
        'Gestion du blog',
        'Gestion des offres d emploi',
        'Gestion des candidatures',
        'Contenu des pages dynamiques',
        'Fonds d ecran par page',
        'Multilingue FR/MG',
      ],
    };
  }

  getApiInfo() {
    return {
      association: {
        name: 'Y-MaD',
        fullName: 'Young for Madagascar Development',
        slogan: 'Jeunesse pour le developpement de Madagascar',
        description: 'Association de jeunesse et developpement basee a Madagascar',
        status: 'Association Enregistree',
        address: 'Antananarivo, Madagascar',
        email: 'contact@y-mad.mg',
      },
      api: {
        name: 'Y-MaD API',
        version: '1.0.0',
        description: 'API RESTful pour la plateforme de gestion des offres d emploi',
        documentation: '/api/docs',
      },
      features: [
        'Authentification admin avec JWT',
        'CRUD complet des projets',
        'CRUD complet du blog',
        'CRUD complet des offres d emploi',
        'Gestion des candidatures',
        'Contenu multilingue (FR/MG)',
        'Images de fond personnalisables par page',
      ],
    };
  }

  getEndpointsList() {
    const baseUrl = process.env.API_URL || 'http://localhost:4001';
    
    return {
      info: {
        base: baseUrl,
        health: baseUrl + '/health',
        info: baseUrl + '/info',
        docs: baseUrl + '/api/docs',
      },
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        profile: 'GET /api/auth/profile',
      },
      projects: {
        list: 'GET /api/projects',
        public: 'GET /api/projects/public',
        featured: 'GET /api/projects/featured',
        detail: 'GET /api/projects/:id',
        create: 'POST /api/projects',
        update: 'PATCH /api/projects/:id',
        delete: 'DELETE /api/projects/:id',
        stats: 'GET /api/projects/stats',
      },
      blog: {
        list: 'GET /api/blog',
        public: 'GET /api/blog/public',
        detail: 'GET /api/blog/:id',
        create: 'POST /api/blog',
        update: 'PATCH /api/blog/:id',
        delete: 'DELETE /api/blog/:id',
        stats: 'GET /api/blog/stats',
      },
      jobs: {
        offers: 'GET /api/jobs/offers',
        offersPublic: 'GET /api/jobs/offers/public',
        offerDetail: 'GET /api/jobs/offers/:id',
        createOffer: 'POST /api/jobs/offers',
        updateOffer: 'PATCH /api/jobs/offers/:id',
        deleteOffer: 'DELETE /api/jobs/offers/:id',
        apply: 'POST /api/jobs/apply',
        applications: 'GET /api/jobs/applications',
        myApplications: 'GET /api/jobs/applications/my',
        updateApplicationStatus: 'PATCH /api/jobs/applications/:id/status',
        stats: 'GET /api/jobs/offers/stats',
      },
      pages: {
        public: 'GET /api/pages/public/:page',
        admin: 'GET /api/pages/:page',
        update: 'PUT /api/pages/:page',
        backgrounds: 'GET /api/pages/backgrounds/:page',
        updateBackground: 'PUT /api/pages/backgrounds/:page',
      },
    };
  }

  getContactInfo() {
    return {
      association: 'Y-MaD',
      slogan: 'Jeunesse pour le developpement de Madagascar',
      address: {
        city: 'Antananarivo',
        country: 'Madagascar',
      },
      email: {
        general: 'contact@y-mad.mg',
        support: 'support@y-mad.mg',
      },
    };
  }
}