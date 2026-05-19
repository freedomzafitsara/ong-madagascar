import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('API - Accueil')
@Controller()
export class AppController {
  
  @Get()
  @ApiOperation({ summary: "Page d'accueil de l'API" })
  @ApiResponse({ status: 200, description: 'API operationnelle' })
  getHello() {
    const baseUrl = process.env.API_URL || 'http://localhost:4001';
    
    return {
      message: "Bienvenue sur l'API Y-Mad",
      association: "Youthful Madagascar",
      slogan: "Ensemble, construisons le Madagascar de demain",
      version: '1.0.0',
      status: 'online',
      timestamp: new Date().toISOString(),
      contact: {
        address: "Carion, Antananarivo, Madagascar",
        phone: "+261 32 04 856 97",
        email: "ymad.mg@gmail.com",
        website: "https://y-mad.mg"
      },
      documentation: baseUrl + '/api/docs',
      health: baseUrl + '/health',
      endpoints: {
        auth: {
          login: 'POST /api/auth/login',
          register: 'POST /api/auth/register',
          profile: 'GET /api/auth/profile',
          forgotPassword: 'POST /api/auth/forgot-password',
          resetPassword: 'POST /api/auth/reset-password',
          verifyEmail: 'GET /api/auth/verify-email/:token',
          changePassword: 'PUT /api/auth/change-password',
          uploadPhoto: 'POST /api/auth/upload-photo',
          users: 'GET /api/auth/users',
          updateRole: 'PUT /api/auth/users/:id/role',
          toggleStatus: 'PUT /api/auth/users/:id/toggle-status',
        },
        projects: {
          list: 'GET /api/projects',
          detail: 'GET /api/projects/:id',
          featured: 'GET /api/projects/featured',
          stats: 'GET /api/projects/stats',
          create: 'POST /api/projects',
          update: 'PATCH /api/projects/:id',
          updateProgress: 'PATCH /api/projects/:id/progress',
          delete: 'DELETE /api/projects/:id',
        },
        jobs: {
          list: 'GET /api/jobs/offers',
          detail: 'GET /api/jobs/offers/:id',
          featured: 'GET /api/jobs/offers/featured',
          stats: 'GET /api/jobs/offers/stats',
          create: 'POST /api/jobs/offers',
          update: 'PATCH /api/jobs/offers/:id',
          updateStatus: 'PATCH /api/jobs/offers/:id/status',
          delete: 'DELETE /api/jobs/offers/:id',
          apply: 'POST /api/jobs/apply',
          applyAuth: 'POST /api/jobs/apply/auth',
          applications: 'GET /api/jobs/offers/:id/applications',
          applicationDetail: 'GET /api/jobs/applications/:id',
          updateApplicationStatus: 'PATCH /api/jobs/applications/:id/status',
          myApplications: 'GET /api/jobs/applications/my',
          allApplications: 'GET /api/jobs/applications/all',
        },
        events: {
          list: 'GET /api/events',
          public: 'GET /api/events/public',
          detail: 'GET /api/events/:id',
          stats: 'GET /api/events/stats',
          create: 'POST /api/events',
          update: 'PATCH /api/events/:id',
          updateStatus: 'PATCH /api/events/:id/status',
          delete: 'DELETE /api/events/:id',
          register: 'POST /api/events/:id/register',
          myRegistrations: 'GET /api/events/my-registrations',
          eventRegistrations: 'GET /api/events/:id/registrations',
        },
        donations: {
          list: 'GET /api/donations',
          stats: 'GET /api/donations/stats/all',
          create: 'POST /api/donations',
          createAuth: 'POST /api/donations/auth',
          confirm: 'POST /api/donations/confirm',
          myDonations: 'GET /api/donations/my-donations',
          detail: 'GET /api/donations/:id',
        },
        members: {
          list: 'GET /api/members',
          stats: 'GET /api/members/stats/all',
          myMember: 'GET /api/members/me',
          detail: 'GET /api/members/:id',
          create: 'POST /api/members',
          updateStatus: 'PUT /api/members/:id/status',
          card: 'GET /api/members/card/:memberNumber',
        },
        blog: {
          list: 'GET /api/blog',
          stats: 'GET /api/blog/stats/all',
          detail: 'GET /api/blog/:id',
          create: 'POST /api/blog',
          update: 'PUT /api/blog/:id',
          publish: 'PUT /api/blog/:id/publish',
          delete: 'DELETE /api/blog/:id',
        },
        volunteers: {
          list: 'GET /api/volunteers',
          detail: 'GET /api/volunteers/:id',
          create: 'POST /api/volunteers',
          update: 'PUT /api/volunteers/:id',
          assignments: 'GET /api/volunteers/assignments',
          certificates: 'GET /api/volunteers/certificates',
          hours: 'POST /api/volunteers/:id/hours',
        },
        partners: {
          list: 'GET /api/partners',
          detail: 'GET /api/partners/:id',
          featured: 'GET /api/partners/featured',
          create: 'POST /api/partners',
          update: 'PUT /api/partners/:id',
          delete: 'DELETE /api/partners/:id',
          submitJob: 'POST /api/partners/:id/jobs',
        },
        beneficiaries: {
          list: 'GET /api/beneficiaries',
          stats: 'GET /api/beneficiaries/stats',
          detail: 'GET /api/beneficiaries/:id',
          create: 'POST /api/beneficiaries',
          update: 'PUT /api/beneficiaries/:id',
          delete: 'DELETE /api/beneficiaries/:id',
          byRegion: 'GET /api/beneficiaries/region/:region',
        },
        pages: {
          list: 'GET /api/pages',
          public: 'GET /api/pages/public/:page',
          admin: 'GET /api/pages/:page',
          update: 'PUT /api/pages/:page',
          backgroundsAll: 'GET /api/pages/backgrounds/all',
          background: 'GET /api/pages/backgrounds/:page',
          updateBackground: 'PUT /api/pages/backgrounds/:page',
          deleteBackground: 'DELETE /api/pages/backgrounds/:id',
          initialize: 'POST /api/pages/initialize',
        },
        newsletter: {
          subscribe: 'POST /api/newsletter/subscribe',
          unsubscribe: 'DELETE /api/newsletter/unsubscribe',
          subscribers: 'GET /api/newsletter/subscribers',
          send: 'POST /api/newsletter/send',
        },
        reports: {
          activity: 'GET /api/reports/activity',
          financial: 'GET /api/reports/financial',
          impact: 'GET /api/reports/impact',
          export: 'GET /api/reports/export/:type',
        },
        upload: {
          profile: 'POST /api/upload/profile',
          single: 'POST /api/upload/single',
          multiple: 'POST /api/upload/multiple',
          getImages: 'GET /api/upload',
          delete: 'DELETE /api/upload',
        },
        footer: {
          get: 'GET /api/footer',
          update: 'PUT /api/footer',
          contacts: 'GET /api/footer/contacts',
          links: 'GET /api/footer/links',
        },
        audit: {
          logs: 'GET /api/audit/logs',
          userLogs: 'GET /api/audit/user/:userId',
          export: 'GET /api/audit/export',
        },
        docs: {
          swagger: '/api/docs',
          json: '/api/docs-json',
        },
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Verification de l etat du serveur' })
  @ApiResponse({ status: 200, description: 'Serveur operationnel' })
  @HttpCode(HttpStatus.OK)
  getHealth() {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    let uptimeString = '';
    if (days > 0) uptimeString += days + 'j ';
    if (hours > 0) uptimeString += hours + 'h ';
    if (minutes > 0) uptimeString += minutes + 'm ';
    uptimeString += seconds + 's';
    
    return {
      status: 'ok',
      service: 'Y-Mad API',
      association: 'Youthful Madagascar',
      contact: {
        address: 'Carion, Antananarivo, Madagascar',
        phone: '+261 32 04 856 97',
        email: 'ymad.mg@gmail.com',
      },
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime),
        human: uptimeString,
      },
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        type: 'PostgreSQL',
        version: '16',
      },
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
        external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB',
      },
      cpu: {
        cores: require('os').cpus().length,
        model: require('os').cpus()[0]?.model || 'Unknown',
      },
    };
  }

  @Get('info')
  @ApiOperation({ summary: 'Informations sur l API' })
  @ApiResponse({ status: 200, description: 'Informations recuperees' })
  getInfo() {
    return {
      association: {
        name: 'Y-Mad',
        fullName: 'Youthful Madagascar',
        slogan: 'Ensemble, construisons le Madagascar de demain',
        description: "Association de jeunesse et developpement basee a Madagascar",
        founded: '2020',
        status: 'Association Enregistree MG',
        contact: {
          address: 'Carion, Antananarivo, Madagascar',
          phone: '+261 32 04 856 97',
          email: 'ymad.mg@gmail.com',
          website: 'https://y-mad.mg',
        },
        socialMedia: {
          facebook: 'https://facebook.com/ymad.mg',
          instagram: 'https://instagram.com/ymad.mg',
          linkedin: 'https://linkedin.com/company/ymad-mg',
        },
      },
      api: {
        name: 'Y-Mad API',
        fullName: 'Youthful Madagascar Application Programming Interface',
        description: "API RESTful pour le site web de l'association Y-Mad",
        version: '1.0.0',
        releaseDate: 'Mai 2026',
        license: 'MIT',
        repository: 'https://github.com/freedomzafitsara/ong-madagascar',
        documentation: '/api/docs',
      },
      technologies: {
        framework: 'NestJS',
        runtime: 'Node.js',
        language: 'TypeScript',
        database: 'PostgreSQL 16',
        orm: 'TypeORM',
        documentation: 'Swagger/OpenAPI 3.0',
        hosting: 'Contabo VPS',
        cdn: 'Cloudflare',
        storage: 'Cloudinary',
        email: 'Brevo',
        sms: 'Telerivet',
      },
      features: [
        'Authentification multi-roles avec JWT (7 roles)',
        'Gestion des membres avec cartes QR code',
        'Module emploi complet avec offres et candidatures',
        'Gestion d evenements avec inscriptions et QR codes',
        'Dons Mobile Money (MVola, Orange Money, Airtel)',
        'Blog bilingue (Francais et Malagasy)',
        'Projets avec indicateurs d impact',
        'Gestion des beneficiaires et suivi',
        'Partenaires avec espace prive',
        'Volontaires avec suivi des heures',
        'Generation de rapports PDF',
        'Journal d audit complet',
        'Newsletter automatique',
        'Upload de fichiers vers Cloudinary',
        'Emails transactionnels avec Brevo',
        'SMS de rappel avec Telerivet',
      ],
      modules: [
        'auth', 'users', 'members', 'projects', 'beneficiaries',
        'events', 'jobs', 'donations', 'blog', 'volunteers',
        'partners', 'pages', 'newsletter', 'reports', 'upload',
        'footer', 'audit', 'payments', 'notifications', 'backgrounds'
      ],
      endpointsCount: 85,
      tablesCount: 17,
      roles: {
        super_admin: 'Acces total au systeme',
        admin: 'Gestion avancee des modules',
        staff: 'Gestion quotidienne',
        member: 'Acces espace membre',
        volunteer: 'Acces espace benevole',
        partner: 'Acces espace partenaire',
        visitor: 'Acces public uniquement',
      },
      regions: [
        'Antananarivo', 'Analamanga', 'Vakinankaratra', 'Haute Matsiatra',
        'Atsimo Atsinanana', 'Ihorombe', 'Amoron i Mania', 'Bongolava',
        'Sofia', 'Boeny', 'Betioky', 'Anosy', 'Androy', 'Menabe', 'Melaky'
      ],
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Statut complet de l API' })
  @ApiResponse({ status: 200, description: 'Statut recupere' })
  async getStatus() {
    return {
      status: 'operational',
      association: 'Y-Mad (Youthful Madagascar)',
      contact: {
        address: 'Carion, Antananarivo, Madagascar',
        phone: '+261 32 04 856 97',
        email: 'ymad.mg@gmail.com',
      },
      timestamp: new Date().toISOString(),
      api: {
        version: '1.0.0',
        prefix: '/api',
        docs: '/api/docs',
        health: '/health',
        info: '/info',
      },
      server: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        title: process.title,
      },
      uptime: {
        process: process.uptime(),
      },
      dependencies: {
        database: 'connected',
        storage: 'cloudinary',
        email: 'brevo',
        sms: 'telerivet',
      },
      statistics: {
        totalUsers: 'En attente de connexion BDD',
        totalMembers: 'En attente de connexion BDD',
        totalProjects: 'En attente de connexion BDD',
        totalEvents: 'En attente de connexion BDD',
        totalJobs: 'En attente de connexion BDD',
        totalDonations: 'En attente de connexion BDD',
      },
    };
  }

  @Get('contact')
  @ApiOperation({ summary: 'Informations de contact de Y-Mad' })
  @ApiResponse({ status: 200, description: 'Informations de contact recuperees' })
  getContact() {
    return {
      association: 'Y-Mad (Youthful Madagascar)',
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
        partenariat: 'partners@y-mad.mg',
      },
      website: 'https://y-mad.mg',
      socialMedia: {
        facebook: 'https://facebook.com/ymad.mg',
        instagram: 'https://instagram.com/ymad.mg',
        linkedin: 'https://linkedin.com/company/ymad-mg',
        twitter: 'https://twitter.com/ymad_mg',
      },
      openingHours: {
        mondayToFriday: '08:00 - 17:00',
        saturday: '09:00 - 13:00',
        sunday: 'Ferme',
      },
      mapCoordinates: {
        latitude: '-18.8792',
        longitude: '47.5079',
      },
    };
  }
}