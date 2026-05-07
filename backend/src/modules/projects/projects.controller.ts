import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';

// Interface définie directement dans le fichier
interface CreateProjectDto {
  title: string;
  title_mg?: string;
  description: string;
  description_mg?: string;
  location?: string;
  category?: string;
  region?: string;
  status?: string;
  budget?: number;
  beneficiaries_count?: number;
  youth_impact?: number;
  jobs_created?: number;
  progress?: number;
  start_date?: Date;
  end_date?: Date;
  image_url?: string;
  gallery_images?: string[];
  is_featured?: boolean;
}

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '9',
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('region') region?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    return this.projectsService.findAll(pageNum, limitNum, search, category, region);
  }

  @Get('featured')
  async findFeatured() {
    return this.projectsService.findFeatured();
  }

  @Get('stats')
  async getStats() {
    return this.projectsService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto) {
    const tempUserId = '00000000-0000-0000-0000-000000000000';
    return this.projectsService.create(createProjectDto, tempUserId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProjectDto: Partial<CreateProjectDto>) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Patch(':id/progress')
  async updateProgress(@Param('id') id: string, @Body('progress') progress: number) {
    return this.projectsService.updateProgress(id, progress);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}