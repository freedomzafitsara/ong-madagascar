import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Logger,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsService: EventsService) {}

  // ============================================================
  // SECTION 1 : ROUTES PUBLIQUES
  // ============================================================

  @Public()
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    try {
      return await this.eventsService.findAll(
        parseInt(page, 10),
        parseInt(limit, 10),
        status,
        type,
        search,
      );
    } catch (error) {
      this.logger.error(`Erreur findAll: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  @Public()
  @Get('public')
  async findPublic(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '9',
    @Query('type') type?: string,
  ) {
    this.logger.log('Appel de la route /events/public');
    try {
      const result = await this.eventsService.findPublic(
        parseInt(page, 10),
        parseInt(limit, 10),
        type,
      );
      this.logger.log(`Nombre d evenements publies trouves: ${result.data.length}`);
      return result;
    } catch (error) {
      this.logger.error(`Erreur findPublic: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  @Public()
  @Get('upcoming')
  async findUpcoming(@Query('limit') limit: string = '6') {
    try {
      return await this.eventsService.findUpcoming(parseInt(limit, 10));
    } catch (error) {
      this.logger.error(`Erreur findUpcoming: ${error.message}`);
      return [];
    }
  }

  @Public()
  @Get('stats')
  async getStats() {
    try {
      return await this.eventsService.getStats();
    } catch (error) {
      this.logger.error(`Erreur getStats: ${error.message}`);
      return { total: 0, published: 0, draft: 0, upcoming: 0 };
    }
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  // ============================================================
  // SECTION 2 : ROUTES ADMINISTRATION
  // ============================================================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async create(@Body() createDto: CreateEventDto, @CurrentUser() user: any) {
    return this.eventsService.create(createDto, user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async update(@Param('id') id: string, @Body() updateDto: UpdateEventDto) {
    return this.eventsService.update(id, updateDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.eventsService.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.eventsService.remove(id);
    return { success: true, message: 'Evenement supprime avec succes' };
  }

  // ============================================================
  // SECTION 3 : ROUTES D INSCRIPTION
  // ============================================================

  @Public()
  @Post(':id/register')
  async registerToEvent(
    @Param('id') id: string,
    @Body() registrationDto: CreateRegistrationDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.eventsService.registerToEvent(id, registrationDto, userId);
  }

  @Get(':id/registrations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getRegistrations(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.eventsService.getRegistrationsByEvent(
      id,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get('registrations/:registrationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getRegistrationById(@Param('registrationId') registrationId: string) {
    return this.eventsService.getRegistrationById(registrationId);
  }

  @Post('registrations/:registrationId/confirm-payment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async confirmPayment(@Param('registrationId') registrationId: string) {
    return this.eventsService.confirmPayment(registrationId);
  }

  @Post('registrations/:registrationId/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelRegistration(@Param('registrationId') registrationId: string) {
    return this.eventsService.cancelRegistration(registrationId);
  }

  @Post('registrations/:registrationId/checkin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async checkIn(@Param('registrationId') registrationId: string) {
    return this.eventsService.checkIn(registrationId);
  }

  @Get(':id/registrations/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getRegistrationStats(@Param('id') id: string) {
    return this.eventsService.getRegistrationStats(id);
  }
}