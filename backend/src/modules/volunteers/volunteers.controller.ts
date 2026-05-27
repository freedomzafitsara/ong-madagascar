// backend/src/modules/volunteers/volunteers.controller.ts

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
  Res,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';
import { VolunteersService } from './volunteers.service';
import { CreateVolunteerDto, UpdateVolunteerDto, VolunteerQueryDto } from './dto/create-volunteer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async create(@Body() createDto: CreateVolunteerDto, @CurrentUser() user: any) {
    return this.volunteersService.create(createDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async findAll(@Query() query: VolunteerQueryDto) {
    return this.volunteersService.findAll(query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async getStats() {
    return this.volunteersService.getStats();
  }

  @Get('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async exportToCSV(
    @Res() res: Response,
    @Query('region') region?: string,
    @Query('status') status?: string
  ) {
    const csv = await this.volunteersService.exportToCSV({ region, status: status as any });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=benevoles_${new Date().toISOString().split('T')[0]}.csv`);
    res.status(HttpStatus.OK).send(csv);
  }

  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  async getMyVolunteerProfile(@CurrentUser() user: any) {
    return this.volunteersService.findByUser(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async findOne(@Param('id') id: string) {
    return this.volunteersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async update(@Param('id') id: string, @Body() updateDto: UpdateVolunteerDto) {
    return this.volunteersService.update(id, updateDto);
  }

  @Patch(':id/hours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async updateHours(@Param('id') id: string, @Body('hours') hours: number) {
    return this.volunteersService.updateHours(id, hours);
  }

  @Patch(':id/hours/add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  async addHours(@Param('id') id: string, @Body('hours') hours: number) {
    return this.volunteersService.addHours(id, hours);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.volunteersService.remove(id);
    return { success: true, message: 'Benevole supprime avec succes' };
  }
}