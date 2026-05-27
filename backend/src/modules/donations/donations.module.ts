// backend/src/modules/donations/donations.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { Donation } from '../../entities/donation.entity';
import { User } from '../../entities/user.entity';
import { Project } from '../../entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Donation,
      User,
      Project,
    ]),
  ],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class DonationsModule {}