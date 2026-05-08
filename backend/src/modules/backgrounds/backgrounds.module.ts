import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackgroundsService } from './backgrounds.service';
import { BackgroundsController } from './backgrounds.controller';
import { Background } from '../../entities/background.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Background])],
  controllers: [BackgroundsController],
  providers: [BackgroundsService],
  exports: [BackgroundsService],
})
export class BackgroundsModule {}