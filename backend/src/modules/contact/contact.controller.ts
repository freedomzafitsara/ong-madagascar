// backend/src/modules/contact/contact.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactStatusDto, ContactQueryDto } from './dto/create-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // ============================================================
  // ENVOYER UN MESSAGE (Public)
  // ============================================================
  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateContactDto, @Req() req: any) {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    return this.contactService.create(createDto, ipAddress);
  }

  // ============================================================
  // LISTER TOUS LES MESSAGES (Admin)
  // ============================================================
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async findAll(@Query() query: ContactQueryDto) {
    return this.contactService.findAll(query);
  }

  // ============================================================
  // STATISTIQUES (Admin)
  // ============================================================
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async getStats() {
    return this.contactService.getStats();
  }

  // ============================================================
  // TROUVER UN MESSAGE PAR ID (Admin)
  // ============================================================
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  // ============================================================
  // METTRE À JOUR LE STATUT (Admin)
  // ============================================================
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateContactStatusDto,
    @Req() req: RequestWithUser,
  ) {
    return this.contactService.updateStatus(id, updateDto, req.user.id);
  }

  // ============================================================
  // MARQUER COMME LU (Admin)
  // ============================================================
  @Patch(':id/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async markAsRead(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.contactService.markAsRead(id, req.user.id);
  }

  // ============================================================
  // MARQUER COMME RÉPONDU (Admin)
  // ============================================================
  @Patch(':id/replied')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async markAsReplied(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.contactService.markAsReplied(id, req.user.id);
  }

  // ============================================================
  // ARCHIVER UN MESSAGE (Admin)
  // ============================================================
  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async archive(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.contactService.archive(id, req.user.id);
  }

  // ============================================================
  // SUPPRIMER UN MESSAGE (Super Admin)
  // ============================================================
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.contactService.remove(id);
    return { success: true, message: 'Message supprimé avec succès' };
  }
}