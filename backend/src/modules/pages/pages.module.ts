import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { PageContent } from '../../entities/page-content.entity';
import { PageBackground } from '../../entities/page-background.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PageContent, PageBackground])],
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}