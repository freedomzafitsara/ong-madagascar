import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreateDonationDto, ConfirmPaymentDto } from './dto/create-donation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Public()
  @Post()
  async createDonation(@Body() createDonationDto: CreateDonationDto) {
    return this.donationsService.createDonation(null, createDonationDto);
  }

  @Post('auth')
  @UseGuards(JwtAuthGuard)
  async createAuthenticatedDonation(@CurrentUser() user: any, @Body() createDonationDto: CreateDonationDto) {
    return this.donationsService.createDonation(user.id, createDonationDto);
  }

  @Public()
  @Post('confirm')
  async confirmPayment(@Body() confirmPaymentDto: ConfirmPaymentDto) {
    return this.donationsService.confirmPayment(confirmPaymentDto);
  }

  @Get('my-donations')
  @UseGuards(JwtAuthGuard)
  async getMyDonations(@CurrentUser() user: any) {
    return this.donationsService.getUserDonations(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getDonation(@Param('id') id: string) {
    return this.donationsService.getDonationById(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getAllDonations() {
    return this.donationsService.getAllDonations();
  }

  @Get('stats/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getStats() {
    return this.donationsService.getStats();
  }
}