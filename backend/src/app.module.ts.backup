// backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { BlogModule } from './modules/blog/blog.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { PagesModule } from './modules/pages/pages.module';

// Import des entites uniquement necessaires
import { User } from './entities/user.entity';
import { Project } from './entities/project.entity';
import { BlogPost } from './entities/blog-post.entity';
import { JobOffer } from './entities/job-offer.entity';
import { JobApplication } from './entities/job-application.entity';
import { PageContent } from './entities/page-content.entity';
import { PageBackground } from './entities/page-background.entity';
import { Contact } from './modules/contact/entities/contact.entity';
import { Translation } from './modules/language/entities/translation.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USER', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'ymad_db'),
        entities: [User, Project, BlogPost, JobOffer, JobApplication, PageContent, PageBackground, Contact, Translation],
        synchronize: false,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    BlogModule,
    JobsModule,
    ProjectsModule,
    PagesModule,
  ],
})
export class AppModule {}