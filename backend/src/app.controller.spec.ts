// backend/src/app.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: 'Bienvenue sur l API Y-Mad',
      version: '1.0.0',
      status: 'online',
      documentation: 'http://localhost:4001/api/docs',
      endpoints: {
        auth: {
          login: 'POST /auth/login',
          register: 'POST /auth/register',
        },
        projects: {
          list: 'GET /projects',
          detail: 'GET /projects/:id',
        },
        jobs: {
          list: 'GET /jobs/offers',
          detail: 'GET /jobs/offers/:id',
          apply: 'POST /jobs/apply',
          applications: 'GET /jobs/offers/:id/applications',
        },
        events: {
          list: 'GET /events',
          register: 'POST /events/register',
        },
        donations: {
          create: 'POST /donations',
          myDonations: 'GET /donations/my-donations',
        },
        members: {
          list: 'GET /members',
          card: 'GET /members/card/:memberNumber',
        },
        blog: {
          list: 'GET /blog',
        },
      },
    };
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
    };
  }

  getInfo() {
    return {
      name: 'Y-Mad API',
      version: '1.0.0',
      author: 'Y-Mad Association',
      description: 'API REST pour l association Y-Mad',
      documentation: '/api/docs',
      features: [
        'Authentification JWT',
        'Gestion des membres',
        'Module emploi',
        'Gestion des evenements',
        'Dons Mobile Money',
        'Blog bilingue',
        'Dashboard administrateur',
        'Generation de rapports PDF',
      ],
      environment: process.env.NODE_ENV || 'development',
    };
  }
}