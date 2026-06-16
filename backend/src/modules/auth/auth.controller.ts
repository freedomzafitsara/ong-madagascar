// backend/src/modules/auth/auth.controller.ts

import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Req, 
  Put,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { JwtAuthGuard, RolesGuard } from './guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { Public } from './decorators/public.decorator';
import { UserRole } from '../../entities/user.entity';
import { memoryStorage } from 'multer';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ============================================================
  // ROUTES PUBLIQUES
  // ============================================================

  @Public()
  @Post('register')
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: any) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetDto: any) {
    return this.authService.resetPassword(resetDto);
  }

  // ============================================================
  // ROUTES PROTEGEES
  // ============================================================

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Req() req: any, @Body() updateDto: any) {
    return this.authService.updateProfile(req.user.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(@Req() req: any, @Body() changePasswordDto: any) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    return this.authService.uploadAvatar(req.user.id, file);
  }

  // ============================================================
  // ROUTES ADMIN UNIQUEMENT
  // ============================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('users')
  async getUsers() {
    return this.authService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('users/:id/role')
  async updateUserRole(@Req() req: any, @Body('role') role: UserRole) {
    return this.authService.updateUserRole(req.params.id, role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('users/:id/toggle-status')
  async toggleUserStatus(@Req() req: any) {
    return this.authService.toggleUserStatus(req.params.id);
  }
}