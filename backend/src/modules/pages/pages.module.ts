// backend/src/modules/pages/pages.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { PageContent } from '../../entities/page-content.entity';
import { PageBackground } from '../../entities/page-background.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PageContent, PageBackground]),
    forwardRef(() => AuthModule),
  ],
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService, TypeOrmModule],
})
export class PagesModule {}