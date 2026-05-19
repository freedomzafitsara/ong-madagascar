// backend/src/modules/members/members.module.ts
// VERSION CORRIGEE - AJOUTER MemberPDFService

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { MemberPDFService } from './member-pdf.service';
import { Member } from '../../entities/member.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Member, User])],
  controllers: [MembersController],
  providers: [MembersService, MemberPDFService],  // ← AJOUTER MemberPDFService
  exports: [MembersService],
})
export class MembersModule {}