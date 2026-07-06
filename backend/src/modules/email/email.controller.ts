// backend/src/modules/email/email.controller.ts

import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @UseGuards(JwtAuthGuard)
  async sendEmail(@Body() data: { to: string; subject: string; html: string }) {
    return this.emailService.sendEmail(data);
  }
}