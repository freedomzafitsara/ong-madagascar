// backend/src/modules/auth/auth.controller.ts

import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Body,
  UseGuards,
  Request,
  Param,
  Query,
  Delete,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Public } from './decorators/public.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: any) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req: any, @Body() updateDto: any) {
    return this.authService.updateProfile(req.user.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@Request() req: any, @Body() changePasswordDto: any) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('preferences')
  async getPreferences(@Request() req: any) {
    return this.authService.getPreferences(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('preferences')
  async updatePreferences(@Request() req: any, @Body() preferencesDto: any) {
    return this.authService.updatePreferences(req.user.id, preferencesDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('appearance')
  async updateAppearance(@Request() req: any, @Body() appearanceDto: any) {
    return this.authService.updateAppearancePreferences(req.user.id, appearanceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('avatar')
  async updateAvatar(@Request() req: any, @Body() body: { avatarUrl: string }) {
    return this.authService.updateAvatar(req.user.id, body.avatarUrl);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException('Email requis');
    }
    return this.authService.forgotPassword(body.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetDto: any) {
    return this.authService.resetPassword(resetDto);
  }

  // ============================================================
  // ROUTES ADMIN
  // ============================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('users')
  async getUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.authService.getUsersPaginated(
      parseInt(page, 10),
      parseInt(limit, 10),
      role,
      status,
      search,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('users/stats')
  async getUsersStats() {
    return this.authService.getUsersStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('users/export')
  async exportUsers(@Query('role') role?: string) {
    return this.authService.getUsersForExport(role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() updateDto: any) {
    return this.authService.updateUser(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body() body: { role: UserRole }) {
    return this.authService.updateUserRole(id, body.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('users/:id/toggle-status')
  async toggleUserStatus(@Param('id') id: string) {
    return this.authService.toggleUserStatus(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }
}