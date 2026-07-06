// backend/src/modules/contact/contact.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  Query,
  Res,
  HttpStatus,
  BadRequestException,
  Logger,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';
import { ReplyContactDto } from './dto/reply-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../../entities/user.entity';
import { EmailService } from '../email/email.service';

@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(
    private readonly contactService: ContactService,
    private readonly emailService: EmailService,
  ) {}

  // ============================================================
  // ROUTE PUBLIQUE - ENVOI DE MESSAGE
  // ============================================================

  @Public()
  @Post()
  @UsePipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  }))
  async createMessage(@Body() createDto: CreateContactDto, @Req() req: any) {
    // ✅ CORRECTION: Utiliser full_name uniquement
    const name = createDto.full_name || 'Anonyme';
    this.logger.log(`Reception d'un message de ${name}`);
    
    const ipAddress = req.ip || req.connection?.remoteAddress || 
                     req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    
    try {
      const message = await this.contactService.createMessage(createDto, ipAddress);
      
      return {
        success: true,
        message: 'Message envoye avec succes',
        data: {
          id: message.id,
          name: message.name,
          email: message.email,
          subject: message.subject,
          created_at: message.created_at,
        },
      };
    } catch (error) {
      this.logger.error(`Erreur creation message: ${error.message}`);
      throw error;
    }
  }

  // ============================================================
  // ROUTES ADMIN - RECUPERATION
  // ============================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    
    if (pageNum < 1) throw new BadRequestException('Le numero de page doit etre superieur a 0');
    if (limitNum < 1 || limitNum > 100) throw new BadRequestException('La limite doit etre entre 1 et 100');
    
    return this.contactService.findAll(pageNum, limitNum, status, search);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('stats')
  async getStats() {
    return this.contactService.getStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  // ============================================================
  // ROUTES ADMIN - MISE A JOUR
  // ============================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateContactStatusDto,
  ) {
    return this.contactService.updateStatus(id, updateDto);
  }

  // ============================================================
  // ROUTE ADMIN - REPONSE PAR EMAIL (CORRIGEE)
  // ============================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post(':id/reply')
  async replyToMessage(
    @Param('id') id: string,
    @Body() replyDto: ReplyContactDto,
    @Req() req: any,
  ) {
    this.logger.log(`Reponse au message ${id} par ${req.user.email}`);
    
    try {
      // 1. Recuperer le message original
      const message = await this.contactService.findOne(id);
      
      // 2. Envoyer l'email au client (utiliser sendEmail)
      await this.emailService.sendEmail({
        to: message.email,
        subject: `RE: ${message.subject} - Y-MaD Association`,
        html: this.getReplyEmailHtml(message.name, message.message, replyDto.reply),
      });
      
      // 3. Mettre a jour le statut
      const updated = await this.contactService.updateStatus(id, {
        status: 'replied',
        admin_notes: replyDto.admin_notes || message.admin_notes,
      });
      
      // 4. Si une copie est demandee, envoyer a l'admin
      if (replyDto.cc) {
        await this.emailService.sendEmail({
          to: replyDto.cc,
          subject: `Copie: RE: ${message.subject} - Y-MaD Association`,
          html: this.getReplyEmailHtml(
            'Administrateur Y-MaD',
            message.message,
            replyDto.reply
          ),
        });
        this.logger.log(`Copie de la reponse envoyee a ${replyDto.cc}`);
      }
      
      this.logger.log(`Reponse envoyee a ${message.email} pour le message ${id}`);
      
      return {
        success: true,
        message: 'Reponse envoyee avec succes au client',
        data: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          status: updated.status,
          replied_at: updated.replied_at,
        },
      };
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de la reponse: ${error.message}`);
      throw error;
    }
  }

  // ============================================================
  // TEMPLATE DE REPONSE
  // ============================================================

  private getReplyEmailHtml(clientName: string, originalMessage: string, adminReply: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reponse Y-MaD</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1E3A8A, #3B82F6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .header p { margin: 5px 0 0; opacity: 0.9; font-size: 16px; }
          .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px; }
          .reply-box { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6; }
          .reply-box .label { font-weight: bold; color: #1E3A8A; margin-bottom: 8px; }
          .original-box { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1E3A8A; }
          .original-box .label { font-weight: bold; color: #64748b; margin-bottom: 8px; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; padding-top: 20px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
          .signature { color: #64748b; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Y-MaD</h1>
          <p>Young for Madagascar Development</p>
        </div>
        <div class="content">
          <p style="font-size: 18px;">Bonjour ${clientName},</p>
          
          <p>Nous vous remercions pour votre message. Voici la reponse de notre equipe :</p>
          
          <div class="reply-box">
            <div class="label">Reponse de l'equipe Y-MaD</div>
            <p>${adminReply}</p>
          </div>
          
          <div class="original-box">
            <div class="label">Votre message original</div>
            <p>${originalMessage}</p>
          </div>
          
          <p class="signature">
            L'equipe Y-MaD reste a votre disposition pour toute question supplementaire.
          </p>
          <p style="color: #64748b;">L'equipe Y-MaD</p>
        </div>
        <div class="footer">
          <p>© 2025 Y-MaD Association - Young for Madagascar Development</p>
          <p>Carion, Antananarivo, Madagascar • +261 32 04 856 97</p>
          <p style="font-size: 11px; color: #94a3b8;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
        </div>
      </body>
      </html>
    `;
  }

  // ============================================================
  // ROUTES ADMIN - SUPPRESSION
  // ============================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':id')
  async deleteMessage(@Param('id') id: string) {
    await this.contactService.deleteMessage(id);
    return { success: true, message: 'Message supprime avec succes' };
  }

  // ============================================================
  // ROUTE ADMIN - EXPORT CSV
  // ============================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('export')
  async exportMessages(@Query('status') status: string, @Res() res: Response) {
    const messages = await this.contactService.exportMessages(status);
    
    if (messages.length === 0) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Aucun message a exporter',
      });
    }

    const headers = ['ID', 'Nom', 'Email', 'Telephone', 'Sujet', 'Message', 'Statut', 'Date'];
    const rows = messages.map(msg => [
      msg.ID,
      msg.Nom,
      msg.Email,
      msg.Telephone,
      msg.Sujet,
      msg.Message.replace(/<[^>]*>/g, '').replace(/,/g, ' '),
      msg.Statut,
      new Date(msg.Date).toLocaleString('fr-FR'),
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const buffer = Buffer.from('\uFEFF' + csvContent, 'utf-8');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=messages_contact_${new Date().toISOString().split('T')[0]}.csv`);
    res.setHeader('Content-Length', buffer.length);
    
    return res.send(buffer);
  }
}