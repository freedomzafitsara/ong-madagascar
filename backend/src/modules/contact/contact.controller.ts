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
import { UserRole } from '../auth/entities/user.entity';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateContactDto, @Req() req: any) {
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    return this.contactService.create(createDto, ipAddress);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findAll(@Query() query: ContactQueryDto) {
    return this.contactService.findAll(query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getStats() {
    return this.contactService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateContactStatusDto,
    @Req() req: any,
  ) {
    return this.contactService.updateStatus(id, updateDto.status, req.user?.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.contactService.remove(id);
    return { success: true, message: 'Message supprimé avec succès' };
  }
}