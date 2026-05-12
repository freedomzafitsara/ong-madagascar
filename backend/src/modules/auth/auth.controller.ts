// backend/src/modules/auth/auth.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Put, 
  Delete, 
  Param, 
  UseGuards, 
  Req, 
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, UpdateRoleDto } from './dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==================== ROUTES PUBLIQUES ====================
  
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Req() req: any) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.authService.register(registerDto, ip);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
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

  // ==================== ROUTES PROTÉGÉES ====================

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Req() req: any, @Body() updateData: any) {
    return this.authService.updateProfile(req.user.sub, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(
    @Req() req: any,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string
  ) {
    return this.authService.changePassword(req.user.sub, currentPassword, newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-photo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'profiles');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueName = `profile_${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new BadRequestException('Format non supporté'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadProfilePhoto(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    const baseUrl = process.env.API_URL || 'http://localhost:4001';
    const fileUrl = `${baseUrl}/uploads/profiles/${file.filename}`;
    return this.authService.updateUserPhoto(req.user.sub, fileUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('photo')
  async deleteProfilePhoto(@Req() req: any) {
    return this.authService.deleteUserPhoto(req.user.sub);
  }

  // ==================== ROUTES ADMIN ====================

  @Roles(UserRole.SUPER_ADMIN)
  @Get('users')
  async getAllUsers(@Req() req: any) {
    return this.authService.getAllUsers(req.user.role);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get('users/:id')
  async getUserById(@Param('id') id: string, @Req() req: any) {
    return this.authService.getUserById(id, req.user.role, req.user.sub);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Req() req: any
  ) {
    if (id === req.user.sub) {
      throw new ForbiddenException('Vous ne pouvez pas modifier votre propre rôle');
    }
    return this.authService.updateUserRole(id, updateRoleDto.role, req.user.role, req.user.sub);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Put('users/:id/toggle-status')
  async toggleUserStatus(@Param('id') id: string, @Req() req: any) {
    return this.authService.toggleUserStatus(id, req.user.role, req.user.sub);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    if (id === req.user.sub) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer votre propre compte');
    }
    return this.authService.deleteUser(id, req.user.role, req.user.sub);
  }
}