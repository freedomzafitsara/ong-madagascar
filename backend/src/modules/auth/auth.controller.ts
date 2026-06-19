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
  UseInterceptors,
  Param,
  Patch,
  Delete,
  BadRequestException,
  Query,
  Res,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Public } from './decorators/public.decorator';
import { UserRole } from '../../entities/user.entity';
import { memoryStorage } from 'multer';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

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
    fileFilter: (req, file, callback) => {
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new BadRequestException('Format d\'image non supporte'), false);
      }
    },
  }))
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier uploade');
    }
    return this.authService.uploadAvatar(req.user.id, file);
  }

  // ============================================================
  // ✅ ROUTES - GESTION DES PREFERENCES
  // ============================================================

  @UseGuards(JwtAuthGuard)
  @Get('preferences')
  async getPreferences(@Req() req: any) {
    return this.authService.getPreferences(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('preferences')
  async updatePreferences(
    @Req() req: any,
    @Body() preferencesDto: any,
  ) {
    return this.authService.updatePreferences(req.user.id, preferencesDto);
  }

  // ============================================================
  // ROUTES ADMIN - GESTION DES UTILISATEURS
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
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    
    return this.authService.getUsersPaginated(pageNum, limitNum, role, status, search);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('users/stats')
  async getUsersStats() {
    return this.authService.getUsersStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('users/export')
  async exportUsers(
    @Query('role') role: string,
    @Res() res: Response,
  ) {
    const users = await this.authService.getUsersForExport(role);
    
    if (users.length === 0) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Aucun utilisateur a exporter',
      });
    }

    const headers = ['ID', 'Nom', 'Prenom', 'Email', 'Telephone', 'Role', 'Statut', 'Date creation', 'Derniere connexion'];
    const rows = users.map((u: any) => [
      u.id,
      u.last_name || '',
      u.first_name || '',
      u.email,
      u.phone || '',
      u.role,
      u.is_active ? 'Actif' : 'Inactif',
      u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '',
      u.last_login ? new Date(u.last_login).toLocaleDateString('fr-FR') : '',
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const buffer = Buffer.from('\uFEFF' + csvContent, 'utf-8');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=utilisateurs_${new Date().toISOString().split('T')[0]}.csv`);
    res.setHeader('Content-Length', buffer.length);
    
    return res.send(buffer);
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
  async updateUser(
    @Param('id') id: string,
    @Body() updateDto: any,
  ) {
    return this.authService.updateUser(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.authService.updateUserRole(id, role);
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