import { Controller, Post, Body, Get, UseGuards, Req, Param, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from './dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // 🔐 NOUVEAU : Mot de passe oublié
  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  // 🔐 NOUVEAU : Vérifier token
  @Public()
  @Get('reset-password/:token')
  async verifyResetToken(@Param('token') token: string) {
    return this.authService.verifyResetToken(token);
  }

  // 🔐 NOUVEAU : Réinitialiser mot de passe
  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
  }

  // 🆕 ROUTE D'URGENCE : Réinitialiser super admin (à supprimer après utilisation)
  @Public()
  @Post('reset-super-admin')
  async resetSuperAdmin(@Body() body: { email: string; password: string }) {
    return this.authService.resetSuperAdminPassword(body.email, body.password);
  }
}