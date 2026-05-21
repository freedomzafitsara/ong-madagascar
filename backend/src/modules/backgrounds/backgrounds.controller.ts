import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BackgroundsService } from './backgrounds.service';
import { CreateBackgroundDto, UpdateBackgroundDto } from './dto/create-background.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('backgrounds')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BackgroundsController {
  constructor(private readonly backgroundsService: BackgroundsService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post()
  async create(@Body() createDto: CreateBackgroundDto) {
    return this.backgroundsService.create(createDto);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get()
  async findAll() {
    return this.backgroundsService.findAll();
  }

  @Public()
  @Get('active')
  async getActiveBackgrounds() {
    return this.backgroundsService.getActiveBackgrounds();
  }

  @Public()
  @Get('page/:page')
  async findByPage(@Param('page') page: string) {
    return this.backgroundsService.findByPage(page);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.backgroundsService.findOne(id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateBackgroundDto) {
    return this.backgroundsService.update(id, updateDto);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.backgroundsService.delete(id);
  }
}