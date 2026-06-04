import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from './modules/auth/decorators/public.decorator';

@Controller()
export class AppController {
  
  @Public()
  @Get()
  getHello() {
    const baseUrl = process.env.API_URL || 'http://localhost:4001';
    
    return {
      message: 'Bienvenue sur la plateforme Y-MaD',
      association: 'Young for Madagascar Development',
      acronym: 'Y-MaD',
      slogan: 'Developpement economique, social et educatif des jeunes malgaches',
      version: '1.0.0',
      status: 'online',
      timestamp: new Date().toISOString(),
      contact: {
        address: 'Carion, Antananarivo, Madagascar',
        phone: '+261 32 04 856 97',
        email: 'ymad.mg@gmail.com',
        hours: 'Lun-Ven: 8h-17h',
        website: 'https://y-mad.mg'
      },
      documentation: baseUrl + '/api/docs',
      health: baseUrl + '/health',
      endpoints: {
        auth: {
          login: 'POST /api/auth/login',
          register: 'POST /api/auth/register',
          profile: 'GET /api/auth/profile',
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
          applications: 'GET /api/jobs/offers/:id/applications',
          applicationDetail: 'GET /api/jobs/applications/:id',
          updateApplicationStatus: 'PATCH /api/jobs/applications/:id/status',
          allApplications: 'GET /api/jobs/applications',
        },
        blog: {
          list: 'GET /api/blog',
          stats: 'GET /api/blog/stats',
          detail: 'GET /api/blog/:id',
          create: 'POST /api/blog',
          update: 'PATCH /api/blog/:id',
          publish: 'PATCH /api/blog/:id/publish',
          delete: 'DELETE /api/blog/:id',
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
        upload: {
          single: 'POST /api/upload/single',
          getImages: 'GET /api/upload',
          delete: 'DELETE /api/upload',
        },
        docs: {
          swagger: '/api/docs',
          json: '/api/docs-json',
        },
      },
    };
  }

  @Public()
  @Get('health')
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
      service: 'Y-MaD Platform',
      association: 'Young for Madagascar Development',
      acronym: 'Y-MaD',
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
      },
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
      },
    };
  }

  @Public()
  @Get('info')
  getInfo() {
    return {
      association: {
        name: 'Young for Madagascar Development',
        acronym: 'Y-MaD',
        slogan: 'Developpement economique, social et educatif des jeunes malgaches',
        mission: 'Accompagner les jeunes de 18-35 ans vers l emploi et la formation',
        description: 'ONG basee a Antananarivo dediee au developpement des jeunes malgaches',
        location: 'Carion, Antananarivo, Madagascar',
        hours: 'Lundi au Vendredi: 8h00 - 17h00',
        contact: {
          phone: '+261 32 04 856 97',
          email: 'ymad.mg@gmail.com',
          website: 'https://y-mad.mg',
        },
      },
      api: {
        name: 'Y-MaD Platform API',
        description: 'Plateforme Web de Gestion des Offres d Emploi',
        version: '1.0.0',
        stack: 'Next.js + NestJS + PostgreSQL + TypeORM',
        documentation: '/api/docs',
      },
      technologies: {
        backend: 'NestJS',
        frontend: 'Next.js',
        database: 'PostgreSQL',
        orm: 'TypeORM',
        documentation: 'Swagger',
        storage: 'Cloudinary',
      },
      features: [
        'Gestion des offres d emploi',
        'Gestion des candidatures',
        'Blog et actualites',
        'Gestion de projets',
        'Contenu de pages personnalisable',
        'Upload de fichiers',
        'Authentification JWT',
      ],
      modules: [
        'auth', 'jobs', 'blog', 'projects', 'pages', 'upload'
      ],
    };
  }
}