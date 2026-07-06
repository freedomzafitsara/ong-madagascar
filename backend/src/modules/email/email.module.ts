// backend/src/modules/email/email.module.ts

import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Module({
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService], // ✅ EXPORTER EmailService pour qu'il soit disponible dans AuthModule
})
export class EmailModule {}