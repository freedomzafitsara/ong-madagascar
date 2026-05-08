import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Req() req: RequestWithUser) {
    return this.projectsService.create(createProjectDto, req.user.sub);
  }

  @Public()
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('region') region?: string,
    @Query('search') search?: string,
  ) {
    return this.projectsService.findAll(parseInt(page), parseInt(limit), status, region, search);
  }

  @Public()
  @Get('featured')
  async getFeatured() {
    return this.projectsService.getFeatured();
  }

  @Public()
  @Get('stats')
  async getStats() {
    return this.projectsService.getStats();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req: RequestWithUser,
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.role, req.user.sub);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
  @Patch(':id/progress')
  async updateProgress(
    @Param('id') id: string,
    @Body('progress') progress: number,
    @Req() req: RequestWithUser,
  ) {
    return this.projectsService.updateProgress(id, progress, req.user.role, req.user.sub);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.projectsService.delete(id, req.user.role);
  }
}