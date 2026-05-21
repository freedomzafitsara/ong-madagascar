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
      service: 'Y-Mad API',
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
    };
  }

  getApiInfo() {
    return {
      association: {
        name: 'Y-Mad',
        fullName: 'Youthful Madagascar',
        slogan: 'Ensemble, construisons le Madagascar de demain',
        description: "Association de jeunesse et developpement basee a Madagascar",
        founded: '2020',
        status: 'Association Enregistree MG',
        address: 'Carion, Antananarivo, Madagascar',
        phone: '+261 32 04 856 97',
        email: 'ymad.mg@gmail.com',
        website: 'https://y-mad.mg',
        socialMedia: {
          facebook: 'https://facebook.com/ymad.mg',
          instagram: 'https://instagram.com/ymad.mg',
          linkedin: 'https://linkedin.com/company/ymad-mg',
        },
      },
      api: {
        name: 'Y-Mad API',
        version: '1.0.0',
        description: 'API RESTful pour le site web de l association Y-Mad',
        documentation: '/api/docs',
      },
      features: [
        'Authentification multi-roles avec JWT',
        'Gestion des membres avec cartes QR code',
        'Module emploi complet',
        'Gestion d evenements',
        'Dons Mobile Money',
        'Blog bilingue',
        'Projets avec indicateurs d impact',
        'Generation de rapports PDF',
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
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password',
      },
      projects: {
        list: 'GET /api/projects',
        detail: 'GET /api/projects/:id',
        create: 'POST /api/projects',
      },
      jobs: {
        list: 'GET /api/jobs/offers',
        detail: 'GET /api/jobs/offers/:id',
        apply: 'POST /api/jobs/apply',
        myApplications: 'GET /api/jobs/applications/my',
      },
      events: {
        list: 'GET /api/events',
        detail: 'GET /api/events/:id',
        register: 'POST /api/events/:id/register',
      },
      donations: {
        create: 'POST /api/donations',
        myDonations: 'GET /api/donations/my-donations',
      },
      members: {
        create: 'POST /api/members',
        myMember: 'GET /api/members/me',
        card: 'GET /api/members/card/:memberNumber',
      },
      blog: {
        list: 'GET /api/blog',
        detail: 'GET /api/blog/:id',
      },
    };
  }

  getContactInfo() {
    return {
      association: 'Y-Mad',
      slogan: 'Ensemble, construisons le Madagascar de demain',
      address: {
        street: 'Carion',
        city: 'Antananarivo',
        country: 'Madagascar',
        full: 'Carion, Antananarivo, Madagascar',
      },
      phone: {
        primary: '+261 32 04 856 97',
        secondary: '+261 34 00 000 00',
      },
      email: {
        general: 'ymad.mg@gmail.com',
        support: 'contact@y-mad.mg',
      },
      website: 'https://y-mad.mg',
      socialMedia: {
        facebook: 'https://facebook.com/ymad.mg',
        instagram: 'https://instagram.com/ymad.mg',
        linkedin: 'https://linkedin.com/company/ymad-mg',
      },
    };
  }
}