import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreateDonationDto, ConfirmDonationDto } from './dto/create-donation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Public()
  @Post()
  async create(@Body() createDonationDto: CreateDonationDto) {
    return this.donationsService.create(createDonationDto);
  }

  @Post('auth')
  @UseGuards(JwtAuthGuard)
  async createAuth(@Body() createDonationDto: CreateDonationDto, @CurrentUser() user: any) {
    return this.donationsService.create(createDonationDto, user.id);
  }

  @Post('confirm')
  @Public()
  async confirm(@Body() confirmDto: ConfirmDonationDto) {
    return this.donationsService.confirm(confirmDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    return this.donationsService.findAll(parseInt(page), parseInt(limit));
  }

  @Get('stats/all')
  @Public()
  async getStats() {
    return this.donationsService.getStats();
  }

  @Get('my-donations')
  @UseGuards(JwtAuthGuard)
  async getMyDonations(@CurrentUser() user: any) {
    return this.donationsService.getUserDonations(user.id);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return this.donationsService.findOne(id);
  }
}