import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController - Tests unitaires', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  describe('Test de la page d accueil', () => {
    it('doit retourner un message de bienvenue', () => {
      const result = appController.getHello();
      
      expect(result).toBeDefined();
      expect(result.message).toBe('Bienvenue sur l\'API Y-Mad');
      expect(result.version).toBe('1.0.0');
      expect(result.status).toBe('online');
    });

    it('doit contenir les endpoints authentification', () => {
      const result = appController.getHello();
      
      expect(result.endpoints.auth).toBeDefined();
      expect(result.endpoints.auth.login).toBe('POST /auth/login');
      expect(result.endpoints.auth.register).toBe('POST /auth/register');
    });

    it('doit contenir les endpoints projets', () => {
      const result = appController.getHello();
      
      expect(result.endpoints.projects).toBeDefined();
      expect(result.endpoints.projects.list).toBe('GET /projects');
      expect(result.endpoints.projects.detail).toBe('GET /projects/:id');
    });

    it('doit contenir les endpoints emploi', () => {
      const result = appController.getHello();
      
      expect(result.endpoints.jobs).toBeDefined();
      expect(result.endpoints.jobs.list).toBe('GET /jobs/offers');
      expect(result.endpoints.jobs.detail).toBe('GET /jobs/offers/:id');
      expect(result.endpoints.jobs.apply).toBe('POST /jobs/apply');
      expect(result.endpoints.jobs.applications).toBe('GET /jobs/offers/:id/applications');
    });

    it('doit contenir les endpoints evenements', () => {
      const result = appController.getHello();
      
      expect(result.endpoints.events).toBeDefined();
      expect(result.endpoints.events.list).toBe('GET /events');
      expect(result.endpoints.events.register).toBe('POST /events/register');
    });

    it('doit contenir les endpoints dons', () => {
      const result = appController.getHello();
      
      expect(result.endpoints.donations).toBeDefined();
      expect(result.endpoints.donations.create).toBe('POST /donations');
      expect(result.endpoints.donations.myDonations).toBe('GET /donations/my-donations');
    });

    it('doit contenir les endpoints membres', () => {
      const result = appController.getHello();
      
      expect(result.endpoints.members).toBeDefined();
      expect(result.endpoints.members.list).toBe('GET /members');
      expect(result.endpoints.members.card).toBe('GET /members/card/:memberNumber');
    });

    it('doit contenir les endpoints blog', () => {
      const result = appController.getHello();
      
      expect(result.endpoints.blog).toBeDefined();
      expect(result.endpoints.blog.list).toBe('GET /blog');
    });

    it('doit contenir le chemin vers la documentation', () => {
      const result = appController.getHello();
      
      expect(result.documentation).toBe('http://localhost:4001/api/docs');
      expect(typeof result.documentation).toBe('string');
    });
  });

  describe('Test du point de terminaison sante', () => {
    it('doit retourner le statut ok', () => {
      const result = appController.getHealth();
      
      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
    });

    it('doit retourner un timestamp valide', () => {
      const result = appController.getHealth();
      const date = new Date(result.timestamp);
      
      expect(date instanceof Date).toBeTruthy();
      expect(isNaN(date.getTime())).toBe(false);
    });

    it('doit indiquer que la base de donnees est connectee', () => {
      const result = appController.getHealth();
      
      expect(result.database).toBeDefined();
      expect(result.database).toBe('connected');
    });
  });

  describe('Test des informations de l API', () => {
    it('doit retourner les metadonnees du projet', () => {
      const result = appController.getInfo();
      
      expect(result.name).toBe('Y-Mad API');
      expect(result.version).toBe('1.0.0');
      expect(result.author).toBe('Y-Mad Association');
    });

    it('doit lister les fonctionnalites principales', () => {
      const result = appController.getInfo();
      
      expect(Array.isArray(result.features)).toBe(true);
      expect(result.features.length).toBeGreaterThan(0);
    });

    it('doit contenir le lien vers la documentation', () => {
      const result = appController.getInfo();
      
      expect(result.documentation).toBe('/api/docs');
    });
  });
});