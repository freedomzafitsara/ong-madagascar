import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../../entities/user.entity';

// DTOs définis ici pour éviter les problèmes d'import
export class CreateEventDto {
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  type: string;
  location?: string;
  region?: string;
  startDate: Date;
  endDate: Date;
  maxCapacity?: number;
  isFree?: boolean;
  price?: number;
  imageUrl?: string;
  program?: string;
  speakers?: string;
}

export class RegisterToEventDto {
  eventId: string;
}

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async createEvent(@Body() createEventDto: CreateEventDto, @CurrentUser() user: any) {
    return this.eventsService.createEvent(createEventDto, user.id);
  }

  @Public()
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 9,
    @Query('type') type?: string,
    @Query('region') region?: string,
  ) {
    return this.eventsService.findAll(page, limit, type, region);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async register(@CurrentUser() user: any, @Body() registerDto: RegisterToEventDto) {
    return this.eventsService.register(user.id, registerDto.eventId);
  }

  @Get('my-registrations')
  @UseGuards(JwtAuthGuard)
  async getMyRegistrations(@CurrentUser() user: any) {
    return this.eventsService.getUserRegistrations(user.id);
  }

  @Get(':id/registrations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getEventRegistrations(@Param('id') id: string) {
    return this.eventsService.getEventRegistrations(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateEvent(@Param('id') id: string, @Body() updateData: Partial<CreateEventDto>) {
    return this.eventsService.updateEvent(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async deleteEvent(@Param('id') id: string) {
    return this.eventsService.deleteEvent(id);
  }
}