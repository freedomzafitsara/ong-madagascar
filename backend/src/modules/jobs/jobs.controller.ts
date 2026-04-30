import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { 
  CreateJobOfferDto, 
  UpdateJobOfferDto, 
  CreateJobApplicationDto 
} from './dto/job.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // ========== ROUTES PUBLIQUES - OFFRES ==========
  
  @Get('offers')
  async findAllOffers(@Query() query: any) {
    return this.jobsService.findAllOffers(query);
  }

  @Get('offers/:id')
  async findOfferById(@Param('id') id: string) {
    return this.jobsService.findOfferById(id);
  }

  // ========== ROUTES PUBLIQUES - CANDIDATURES ==========
  
  @Post('offers/:id/apply')
  @HttpCode(HttpStatus.CREATED)
  async createApplication(
    @Param('id') id: string,
    @Body() createDto: CreateJobApplicationDto
  ) {
    return this.jobsService.createApplication(id, createDto);
  }

  @Get('offers/:id/applications')
  async findApplicationsByOffer(@Param('id') id: string, @Query() query: any) {
    return this.jobsService.findApplicationsByOffer(id, query);
  }

  // ========== ROUTES ADMIN ==========
  
  @Post('offers')
  @HttpCode(HttpStatus.CREATED)
  async createOffer(@Body() createDto: CreateJobOfferDto) {
    return this.jobsService.createOffer(createDto);
  }

  @Put('offers/:id')
  async updateOffer(@Param('id') id: string, @Body() updateDto: UpdateJobOfferDto) {
    return this.jobsService.updateOffer(id, updateDto);
  }

  @Delete('offers/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOffer(@Param('id') id: string) {
    return this.jobsService.deleteOffer(id);
  }

  @Put('offers/:id/status')
  async updateOfferStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.jobsService.updateOfferStatus(id, status);
  }

  @Put('applications/:id/status')
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('notes') notes: string
  ) {
    return this.jobsService.updateApplicationStatus(id, status, notes);
  }
}
