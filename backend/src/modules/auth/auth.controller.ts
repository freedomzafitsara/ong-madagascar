import { Controller, Post, Body, Get, Put, UseGuards, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly uploadService: UploadService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Public()
  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req: any, @Body() body: any) {
    return this.authService.updateProfile(req.user.id, body);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Request() req: any, @Body() body: any) {
    return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword);
  }

  @Post('upload-photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async uploadPhoto(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { success: false, message: 'Aucun fichier téléchargé' };
    }
    
    const photoUrl = await this.uploadService.saveProfilePhoto(file, req.user.id);
    const updatedUser = await this.authService.updateProfile(req.user.id, { photo: photoUrl });
    
    return { 
      success: true, 
      photoUrl, 
      user: updatedUser,
      message: 'Photo de profil mise à jour' 
    };
  }
}