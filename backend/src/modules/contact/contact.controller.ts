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
  HttpCode,
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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Contact')
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
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true 
  }))
  @ApiOperation({ 
    summary: 'Envoyer un message de contact', 
    description: 'Permet aux visiteurs d\'envoyer un message à l\'administration'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Message envoyé avec succès' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Données invalides' 
  })
  async createMessage(@Body() createDto: CreateContactDto, @Req() req: any) {
    try {
      const name = createDto.full_name || 'Client';
      this.logger.log(`Nouveau message reçu de ${name} (${createDto.email})`);
      
      // Récupération de l'adresse IP
      const ipAddress = req.ip || 
                       req.connection?.remoteAddress || 
                       req.headers['x-forwarded-for'] || 
                       req.socket?.remoteAddress;
      
      const message = await this.contactService.createMessage(createDto, ipAddress);
      
      this.logger.log(`Message enregistré avec l'identifiant: ${message.id}`);
      
      return {
        success: true,
        message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
        data: {
          id: message.id,
          name: message.name,
          email: message.email,
          subject: message.subject,
          created_at: message.created_at,
        },
      };
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi du message: ${error.message}`);
      throw error;
    }
  }

  // ============================================================
  // ROUTES ADMIN - RÉCUPÉRATION
  // ============================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Récupérer tous les messages', 
    description: 'Liste paginée des messages avec filtres (administrateur uniquement)'
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    
    if (pageNum < 1) {
      throw new BadRequestException('Le numéro de page doit être supérieur à 0');
    }
    if (limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('La limite doit être comprise entre 1 et 100');
    }
    
    this.logger.log(`Récupération des messages - Page ${pageNum}, Limite ${limitNum}`);
    
    return this.contactService.findAll(pageNum, limitNum, status, search);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Statistiques des messages', 
    description: 'Nombre total, non lus, lus, répondus et archivés'
  })
  async getStats() {
    this.logger.log('Récupération des statistiques');
    return this.contactService.getStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Récupérer un message par son identifiant', 
    description: 'Détails complets d\'un message'
  })
  async findOne(@Param('id') id: string) {
    this.logger.log(`Récupération du message ${id}`);
    return this.contactService.findOne(id);
  }

  // ============================================================
  // ROUTES ADMIN - MISE À JOUR
  // ============================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Mettre à jour le statut d\'un message', 
    description: 'Changer le statut: non lu, lu, répondu, archivé'
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateContactStatusDto,
  ) {
    this.logger.log(`Mise à jour du statut du message ${id} vers ${updateDto.status}`);
    return this.contactService.updateStatus(id, updateDto);
  }

  // ============================================================
  // ROUTE ADMIN - RÉPONSE PAR EMAIL
  // ============================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post(':id/reply')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Répondre à un message par email', 
    description: 'Envoie une réponse au client et met à jour le statut du message'
  })
  async replyToMessage(
    @Param('id') id: string,
    @Body() replyDto: ReplyContactDto,
    @Req() req: any,
  ) {
    this.logger.log(`Réponse au message ${id} par ${req.user.email}`);
    
    try {
      // 1. Récupérer le message original
      const message = await this.contactService.findOne(id);
      
      // 2. Envoyer l'email au client
      await this.emailService.sendEmail({
        to: message.email,
        subject: `RE: ${message.subject} - Y-MaD Association`,
        html: this.getReplyEmailHtml(message.name, message.message, replyDto.reply),
      });
      
      // 3. Mettre à jour le statut
      const updated = await this.contactService.updateStatus(id, {
        status: 'replied',
        admin_notes: replyDto.admin_notes || message.admin_notes,
      });
      
      // 4. Si une copie est demandée, envoyer à l'administrateur
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
        this.logger.log(`Copie de la réponse envoyée à ${replyDto.cc}`);
      }
      
      this.logger.log(`Réponse envoyée à ${message.email} pour le message ${id}`);
      
      return {
        success: true,
        message: 'Réponse envoyée avec succès au client',
        data: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          status: updated.status,
          replied_at: updated.replied_at,
        },
      };
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de la réponse: ${error.message}`);
      throw error;
    }
  }

  // ============================================================
  // TEMPLATE DE RÉPONSE
  // ============================================================

  private getReplyEmailHtml(clientName: string, originalMessage: string, adminReply: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Réponse Y-MaD</title>
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background: linear-gradient(135deg, #1E3A8A, #3B82F6); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 700; 
          }
          .header p { 
            margin: 5px 0 0; 
            opacity: 0.9; 
            font-size: 16px; 
          }
          .content { 
            background: #f8fafc; 
            padding: 30px; 
            border: 1px solid #e2e8f0; 
            border-top: none; 
            border-radius: 0 0 10px 10px; 
          }
          .reply-box { 
            background: #dbeafe; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border-left: 4px solid #3B82F6; 
          }
          .reply-box .label { 
            font-weight: bold; 
            color: #1E3A8A; 
            margin-bottom: 8px; 
          }
          .original-box { 
            background: #f1f5f9; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border-left: 4px solid #1E3A8A; 
          }
          .original-box .label { 
            font-weight: bold; 
            color: #64748b; 
            margin-bottom: 8px; 
          }
          .footer { 
            text-align: center; 
            font-size: 12px; 
            color: #94a3b8; 
            padding-top: 20px; 
            border-top: 1px solid #e2e8f0; 
            margin-top: 20px; 
          }
          .signature { 
            color: #64748b; 
            margin-top: 20px; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Y-MaD</h1>
          <p>Young for Madagascar Development</p>
        </div>
        <div class="content">
          <p style="font-size: 18px;">Bonjour ${clientName},</p>
          
          <p>Nous vous remercions pour votre message. Voici la réponse de notre équipe :</p>
          
          <div class="reply-box">
            <div class="label">Réponse de l'équipe Y-MaD</div>
            <p>${adminReply}</p>
          </div>
          
          <div class="original-box">
            <div class="label">Votre message original</div>
            <p>${originalMessage}</p>
          </div>
          
          <p class="signature">
            L'équipe Y-MaD reste à votre disposition pour toute question supplémentaire.
          </p>
          <p style="color: #64748b;">L'équipe Y-MaD</p>
        </div>
        <div class="footer">
          <p>© 2025 Y-MaD Association - Young for Madagascar Development</p>
          <p>Carion, Antananarivo, Madagascar • +261 32 04 856 97</p>
          <p style="font-size: 11px; color: #94a3b8;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
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
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Supprimer un message', 
    description: 'Supprime définitivement un message de la base de données'
  })
  async deleteMessage(@Param('id') id: string) {
    await this.contactService.deleteMessage(id);
    this.logger.log(`Message ${id} supprimé`);
    return { 
      success: true, 
      message: 'Message supprimé avec succès' 
    };
  }

  // ============================================================
  // ROUTE ADMIN - EXPORT CSV
  // ============================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('export')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Exporter les messages en CSV', 
    description: 'Exporte la liste des messages au format CSV'
  })
  async exportMessages(@Query('status') status: string, @Res() res: Response) {
    try {
      const messages = await this.contactService.exportMessages(status);
      
      if (messages.length === 0) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Aucun message à exporter',
        });
      }

      const headers = [
        'Identifiant', 
        'Nom', 
        'Email', 
        'Téléphone', 
        'Sujet', 
        'Message', 
        'Statut', 
        'Date', 
        'Heure', 
        'Adresse IP', 
        'Notes'
      ];
      
      const rows = messages.map(msg => [
        msg.ID,
        msg.Nom,
        msg.Email,
        msg.Téléphone,
        msg.Sujet,
        `"${msg.Message.replace(/"/g, '""')}"`,
        msg.Statut,
        msg.Date,
        msg.Heure,
        msg.IP,
        msg.Notes || '',
      ]);

      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const buffer = Buffer.from('\uFEFF' + csvContent, 'utf-8');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=messages_contact_${new Date().toISOString().split('T')[0]}.csv`);
      res.setHeader('Content-Length', buffer.length);
      
      this.logger.log(`Export CSV réalisé avec ${messages.length} messages`);
      
      return res.send(buffer);
    } catch (error) {
      this.logger.error(`Erreur lors de l'export: ${error.message}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Erreur lors de l\'export des messages',
      });
    }
  }

  // ============================================================
  // ROUTES ADMIN - SUPPRESSION MULTIPLE
  // ============================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('delete-multiple')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Supprimer plusieurs messages', 
    description: 'Supprime une liste de messages sélectionnés'
  })
  async deleteMultiple(@Body('ids') ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Aucun identifiant fourni');
    }
    
    this.logger.log(`Suppression de ${ids.length} messages`);
    return this.contactService.deleteMultiple(ids);
  }

  // ============================================================
  // ROUTE ADMIN - ARCHIVER MULTIPLE
  // ============================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('archive-multiple')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Archiver plusieurs messages', 
    description: 'Archive une liste de messages sélectionnés'
  })
  async archiveMultiple(@Body('ids') ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Aucun identifiant fourni');
    }
    
    this.logger.log(`Archivage de ${ids.length} messages`);
    return this.contactService.archiveMultiple(ids);
  }

  // ============================================================
  // ROUTE ADMIN - STATISTIQUES DE PERFORMANCE
  // ============================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('performance/stats')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Statistiques de performance', 
    description: 'Temps de réponse moyen, taux de réponse, messages par jour'
  })
  async getPerformanceStats() {
    this.logger.log('Récupération des statistiques de performance');
    return this.contactService.getPerformanceStats();
  }
}