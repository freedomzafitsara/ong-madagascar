// backend/src/modules/members/members.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { MemberPDFService } from './member-pdf.service';
import { Member } from '../../entities/member.entity';
import { User } from '../../entities/user.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, User]),
    UploadModule, 
  ],
  controllers: [MembersController],
  providers: [MembersService, MemberPDFService],
  exports: [MembersService],
})
export class MembersModule {}