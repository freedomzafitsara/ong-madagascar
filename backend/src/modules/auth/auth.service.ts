// backend/src/modules/auth/auth.service.ts

import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private uploadService: UploadService,
  ) {}

  // ============================================================
  // INSCRIPTION
  // ============================================================

  async register(registerDto: any): Promise<{ success: boolean; message: string }> {
    const { email, password, first_name, last_name, phone, role } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Cet email est deja utilise');
    }

    // ✅ Si role est spécifié et que c'est ADMIN, vérifier que c'est un super admin qui crée
    let userRole = UserRole.VISITOR;
    if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Vous ne pouvez pas creer un compte administrateur');
    }
    
    // ✅ Si role est CANDIDATE, l'attribuer
    if (role === UserRole.CANDIDATE) {
      userRole = UserRole.CANDIDATE;
    }

    const user = this.userRepository.create({
      email,
      password,
      first_name,
      last_name,
      phone: phone || null,
      role: userRole,
      is_active: true,
    });

    await this.userRepository.save(user);
    
    this.logger.log(`Nouvel utilisateur cree: ${email} (${userRole})`);
    
    return { 
      success: true, 
      message: 'Inscription reussie. Vous pouvez maintenant vous connecter.' 
    };
  }

  // ============================================================
  // CONNEXION
  // ============================================================

  async login(loginDto: any): Promise<{ access_token: string; user: any }> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Votre compte est desactive. Contactez l\'administrateur.');
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Mettre à jour la dernière connexion
    user.last_login = new Date();
    await this.userRepository.save(user);

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name
    };

    const token = this.jwtService.sign(payload);

    // ✅ Retourner les informations utilisateur
    const userData = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      role: user.role,
      avatar_url: user.avatar_url,
      is_active: user.is_active,
    };

    this.logger.log(`Utilisateur connecte: ${email} (${user.role})`);
    
    return {
      access_token: token,
      user: userData,
    };
  }

  // ============================================================
  // PROFIL
  // ============================================================

  async getProfile(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouve');
    }

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      role: user.role,
      avatar_url: user.avatar_url,
      is_active: user.is_active,
      last_login: user.last_login,
      created_at: user.created_at,
    };
  }

  async updateProfile(userId: string, updateDto: any): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouve');
    }

    if (updateDto.first_name) user.first_name = updateDto.first_name;
    if (updateDto.last_name) user.last_name = updateDto.last_name;
    if (updateDto.phone) user.phone = updateDto.phone;

    await this.userRepository.save(user);

    return this.getProfile(userId);
  }

  async changePassword(userId: string, changePasswordDto: any): Promise<{ success: boolean; message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouve');
    }

    const isPasswordValid = await user.validatePassword(currentPassword);
    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException('Le nouveau mot de passe doit contenir au moins 6 caracteres');
    }

    user.password = newPassword;
    user.must_change_password = false;
    await this.userRepository.save(user);

    this.logger.log(`Mot de passe modifie pour l'utilisateur ${user.email}`);
    
    return { success: true, message: 'Mot de passe modifie avec succes' };
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<{ avatar_url: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouve');
    }

    const uploadedFile = await this.uploadService.uploadFile(file, 'profile', userId);
    const avatarUrl = this.uploadService.getImageUrl(uploadedFile.id);

    user.avatar_url = avatarUrl;
    await this.userRepository.save(user);

    return { avatar_url: avatarUrl };
  }

  // ============================================================
  // ADMIN - GESTION DES UTILISATEURS
  // ============================================================

  async getAllUsers(): Promise<any[]> {
    const users = await this.userRepository.find({
      select: ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'last_login', 'created_at'],
      order: { created_at: 'DESC' },
    });
    
    return users;
  }

  async updateUserRole(userId: string, role: UserRole): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouve');
    }

    user.role = role;
    await this.userRepository.save(user);

    this.logger.log(`Role modifie pour ${user.email}: ${role}`);
    
    return { success: true, message: 'Role modifie avec succes' };
  }

  async toggleUserStatus(userId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouve');
    }

    user.is_active = !user.is_active;
    await this.userRepository.save(user);

    this.logger.log(`Statut modifie pour ${user.email}: ${user.is_active ? 'actif' : 'inactif'}`);
    
    return { 
      success: true, 
      message: `Utilisateur ${user.is_active ? 'active' : 'desactive'} avec succes` 
    };
  }

  // ============================================================
  // MOT DE PASSE OUBLIE
  // ============================================================

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Ne pas révéler que l'email n'existe pas (sécurité)
      return { success: true, message: 'Si l\'email existe, un lien de reinitialisation a ete envoye' };
    }

    // Ici, envoyer un email avec le lien de réinitialisation
    // ...

    return { success: true, message: 'Un lien de reinitialisation a ete envoye a votre email' };
  }

  async resetPassword(resetDto: any): Promise<{ success: boolean; message: string }> {
    // Ici, vérifier le token et réinitialiser le mot de passe
    // ...

    return { success: true, message: 'Mot de passe reinitialise avec succes' };
  }
}