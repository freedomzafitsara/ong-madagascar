// backend/src/modules/auth/auth.controller.ts

import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  UpdateRoleDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateProfileDto
} from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

// ✅ CORRECTION : Supprimer "api/" car le préfixe global est déjà défini dans main.ts
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ============================================================
  // ROUTES PUBLIQUES (sans authentification)
  // ============================================================

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto, @Request() req) {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    return this.authService.register(registerDto, ip);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Request() req) {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    return this.authService.login(loginDto, ip);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
  }

  @Get('verify-email/:token')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // ============================================================
  // ROUTES PROTÉGÉES (authentification requise)
  // ============================================================

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('Utilisateur non identifié');
    }
    return this.authService.getProfile(userId);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = this.extractUserId(req);
    return this.authService.updateProfile(userId, updateProfileDto);
  }

  @Post('upload-photo')
  @UseGuards(JwtAuthGuard)
  async uploadPhoto(@Request() req, @Body('photoUrl') photoUrl: string) {
    const userId = this.extractUserId(req);
    if (!photoUrl) {
      throw new BadRequestException('URL de photo requise');
    }
    return this.authService.updateUserPhoto(userId, photoUrl);
  }

  @Delete('photo')
  @UseGuards(JwtAuthGuard)
  async deletePhoto(@Request() req) {
    const userId = this.extractUserId(req);
    return this.authService.updateUserPhoto(userId, null);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    const userId = this.extractUserId(req);
    return this.authService.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword
    );
  }

  // ============================================================
  // ROUTES ADMINISTRATION (avec vérification des rôles)
  // ============================================================

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }

  @Put('users/:id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async updateUserRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.authService.updateUserRole(id, updateRoleDto.role);
  }

  @Put('users/:id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async toggleUserStatus(@Param('id') id: string) {
    return this.authService.toggleUserStatus(id);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  // ============================================================
  // MÉTHODE UTILITAIRE PRIVÉE
  // ============================================================

  private extractUserId(req: any): string {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('Utilisateur non identifié');
    }
    return userId;
  }
}