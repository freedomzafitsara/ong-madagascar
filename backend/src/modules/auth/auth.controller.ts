import { Controller, Post, Body, Get, Put, Delete, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { AuthService, SanitizedUser } from './auth.service';
import { LoginDto, RegisterDto, UpdateRoleDto } from './dto';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.authService.register(registerDto, ip);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.authService.login(loginDto, ip);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body('token') token: string, @Body('password') password: string) {
    return this.authService.resetPassword(token, password);
  }

  @Public()
  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Get('profile')
  async getProfile(@Req() req: RequestWithUser) {
    return this.authService.getProfile(req.user.sub);
  }

  @Put('profile')
  async updateProfile(@Req() req: RequestWithUser, @Body() updateData: any) {
    return this.authService.updateProfile(req.user.sub, updateData);
  }

  @Put('change-password')
  async changePassword(
    @Req() req: RequestWithUser,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string
  ) {
    return this.authService.changePassword(req.user.sub, currentPassword, newPassword);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get('users')
  async getAllUsers(@Req() req: RequestWithUser) {
    return this.authService.getAllUsers(req.user.role);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get('users/:id')
  async getUserById(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.authService.getUserById(id, req.user.role, req.user.sub);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') id: string, 
    @Body() updateRoleDto: UpdateRoleDto, 
    @Req() req: RequestWithUser
  ) {
    if (id === req.user.sub) {
      throw new ForbiddenException('Vous ne pouvez pas modifier votre propre rôle');
    }
    return this.authService.updateUserRole(id, updateRoleDto.role, req.user.role, req.user.sub);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Put('users/:id/toggle-status')
  async toggleUserStatus(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.authService.toggleUserStatus(id, req.user.role, req.user.sub);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Req() req: RequestWithUser) {
    if (id === req.user.sub) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer votre propre compte');
    }
    return this.authService.deleteUser(id, req.user.role, req.user.sub);
  }
}