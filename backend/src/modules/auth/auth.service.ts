// backend/src/modules/auth/auth.service.ts

import { 
  Injectable, 
  BadRequestException, 
  NotFoundException, 
  UnauthorizedException, 
  ForbiddenException, 
  Logger,
  ConflictException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  // ============================================================
  // INSCRIPTION
  // ============================================================

  async register(registerDto: any): Promise<any> {
    const { email, password, first_name, last_name, phone, role } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Cet email est deja utilise');
    }

    let userRole = UserRole.USER;
    if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Vous ne pouvez pas creer un compte administrateur');
    }

    const user = this.userRepository.create({
      email,
      password,
      first_name,
      last_name,
      phone: phone || null,
      role: userRole,
      is_active: true,
      preferred_language: 'fr',
      theme: 'light',
      font_size: 'medium',
      density: 'comfortable',
      sidebar_collapsed: false,
      animations_enabled: true,
      timezone: 'Indian/Antananarivo',
      email_notifications: true,
      push_notifications: true,
      job_alerts: true,
      project_updates: true,
      blog_updates: false,
      system_updates: true,
    });

    await this.userRepository.save(user);
    this.logger.log(`Nouvel utilisateur cree: ${email}`);

    try {
      await this.emailService.sendWelcomeEmail(email, first_name);
      this.logger.log(`Email de bienvenue envoye a ${email}`);
    } catch (error) {
      this.logger.error(`Erreur envoi email de bienvenue a ${email}:`, error.message);
    }

    return {
      success: true,
      message: 'Inscription reussie',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      }
    };
  }

  // ============================================================
  // CONNEXION
  // ============================================================

  async login(loginDto: any): Promise<any> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Votre compte est desactive');
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    user.last_login = new Date();
    await this.userRepository.save(user);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    const token = this.jwtService.sign(payload);

    this.logger.log(`Utilisateur connecte: ${email}`);

    return {
      access_token: token,
      user: {
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
        preferences: {
          theme: user.theme,
          font_size: user.font_size,
          preferred_language: user.preferred_language,
          sidebar_collapsed: user.sidebar_collapsed,
          animations_enabled: user.animations_enabled,
          density: user.density,
          timezone: user.timezone,
          email_notifications: user.email_notifications,
          push_notifications: user.push_notifications,
          job_alerts: user.job_alerts,
          project_updates: user.project_updates,
          blog_updates: user.blog_updates,
          system_updates: user.system_updates,
        }
      },
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
      preferences: {
        theme: user.theme,
        font_size: user.font_size,
        preferred_language: user.preferred_language,
        sidebar_collapsed: user.sidebar_collapsed,
        animations_enabled: user.animations_enabled,
        density: user.density,
        timezone: user.timezone,
        email_notifications: user.email_notifications,
        push_notifications: user.push_notifications,
        job_alerts: user.job_alerts,
        project_updates: user.project_updates,
        blog_updates: user.blog_updates,
        system_updates: user.system_updates,
      }
    };
  }

  async updateProfile(userId: string, updateDto: any): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouve');
    }

    const allowedFields = ['first_name', 'last_name', 'phone', 'preferred_language', 'timezone'];
    for (const field of allowedFields) {
      if (updateDto[field] !== undefined) {
        user[field] = updateDto[field];
      }
    }

    await this.userRepository.save(user);
    return this.getProfile(userId);
  }

  async changePassword(userId: string, changePasswordDto: any): Promise<any> {
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
      throw new BadRequestException('Le mot de passe doit contenir au moins 6 caracteres');
    }

    user.password = newPassword;
    await this.userRepository.save(user);

    this.logger.log(`Mot de passe modifie pour ${user.email}`);

    return { success: true, message: 'Mot de passe modifie avec succes' };
  }

  // ============================================================
  // GESTION DES PREFERENCES
  // ============================================================

  async getPreferences(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouve');
    }

    return {
      theme: user.theme || 'light',
      font_size: user.font_size || 'medium',
      density: user.density || 'comfortable',
      sidebar_collapsed: user.sidebar_collapsed || false,
      animations_enabled: user.animations_enabled !== false,
      preferred_language: user.preferred_language || 'fr',
      timezone: user.timezone || 'Indian/Antananarivo',
      email_notifications: user.email_notifications !== false,
      push_notifications: user.push_notifications !== false,
      job_alerts: user.job_alerts !== false,
      project_updates: user.project_updates !== false,
      blog_updates: user.blog_updates || false,
      system_updates: user.system_updates !== false,
    };
  }

  async updatePreferences(userId: string, preferencesDto: any): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouve');
    }

    const appearanceFields = ['theme', 'font_size', 'density', 'sidebar_collapsed', 'animations_enabled'];
    for (const field of appearanceFields) {
      if (preferencesDto[field] !== undefined) {
        user[field] = preferencesDto[field];
      }
    }

    const localeFields = ['preferred_language', 'timezone'];
    for (const field of localeFields) {
      if (preferencesDto[field] !== undefined) {
        user[field] = preferencesDto[field];
      }
    }

    const notificationFields = [
      'email_notifications', 'push_notifications', 'job_alerts',
      'project_updates', 'blog_updates', 'system_updates'
    ];
    for (const field of notificationFields) {
      if (preferencesDto[field] !== undefined) {
        user[field] = preferencesDto[field];
      }
    }

    await this.userRepository.save(user);
    this.logger.log(`Preferences mises a jour pour l'utilisateur ${user.email}`);

    return {
      success: true,
      message: 'Preferences mises a jour avec succes',
      preferences: {
        theme: user.theme,
        font_size: user.font_size,
        density: user.density,
        sidebar_collapsed: user.sidebar_collapsed,
        animations_enabled: user.animations_enabled,
        preferred_language: user.preferred_language,
        timezone: user.timezone,
        email_notifications: user.email_notifications,
        push_notifications: user.push_notifications,
        job_alerts: user.job_alerts,
        project_updates: user.project_updates,
        blog_updates: user.blog_updates,
        system_updates: user.system_updates,
      }
    };
  }

  async updateAppearancePreferences(userId: string, appearanceDto: any): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouve');
    }

    const fields = ['theme', 'font_size', 'density', 'sidebar_collapsed', 'animations_enabled'];
    for (const field of fields) {
      if (appearanceDto[field] !== undefined) {
        user[field] = appearanceDto[field];
      }
    }

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Preferences d\'apparence mises a jour',
      preferences: {
        theme: user.theme,
        font_size: user.font_size,
        density: user.density,
        sidebar_collapsed: user.sidebar_collapsed,
        animations_enabled: user.animations_enabled,
      }
    };
  }

  // ============================================================
  // MISE A JOUR DE L'AVATAR
  // ============================================================

  async updateAvatar(userId: string, avatarUrl: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouve');
    }

    user.avatar_url = avatarUrl;
    await this.userRepository.save(user);

    this.logger.log(`Avatar mis a jour pour ${user.email}: ${avatarUrl}`);

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar_url: user.avatar_url,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
    };
  }

  // ============================================================
  // MOT DE PASSE OUBLIE
  // ============================================================

  async forgotPassword(email: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return {
        success: true,
        message: 'Si l\'email existe, un lien de reinitialisation a ete envoye'
      };
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpires = new Date();
    resetTokenExpires.setMinutes(resetTokenExpires.getMinutes() + 15);

    user.reset_token = resetToken;
    user.reset_token_expires = resetTokenExpires;
    await this.userRepository.save(user);

    try {
      await this.emailService.sendResetPasswordEmail(email, resetToken, user.first_name);
      this.logger.log(`Email de reinitialisation envoye a ${email}`);
    } catch (error) {
      this.logger.error(`Erreur envoi email a ${email}:`, error.message);
    }

    return {
      success: true,
      message: 'Un lien de reinitialisation a ete envoye a votre email'
    };
  }

  async resetPassword(resetDto: any): Promise<any> {
    const { token, newPassword } = resetDto;

    if (!token) {
      throw new BadRequestException('Token requis');
    }

    if (!newPassword) {
      throw new BadRequestException('Nouveau mot de passe requis');
    }

    const user = await this.userRepository.findOne({
      where: { reset_token: token },
    });

    if (!user) {
      throw new BadRequestException('Token invalide ou expire');
    }

    if (user.reset_token_expires && new Date() > user.reset_token_expires) {
      throw new BadRequestException('Le token a expire. Veuillez refaire une demande.');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 6 caracteres');
    }

    user.password = newPassword;
    user.reset_token = null;
    user.reset_token_expires = null;
    await this.userRepository.save(user);

    this.logger.log(`Mot de passe reinitialise pour ${user.email}`);

    return {
      success: true,
      message: 'Mot de passe reinitialise avec succes'
    };
  }

  // ============================================================
  // GESTION DES UTILISATEURS - ADMIN
  // ============================================================

  async getUsersPaginated(
    page: number = 1,
    limit: number = 10,
    role?: string,
    status?: string,
    search?: string,
  ): Promise<{ data: any[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (role && role !== 'all') {
      where.role = role;
    }

    if (status === 'active') {
      where.is_active = true;
    } else if (status === 'inactive') {
      where.is_active = false;
    }

    if (search) {
      where.email = Like(`%${search}%`);
    }

    const [data, total] = await this.userRepository.findAndCount({
      where,
      select: ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'avatar_url', 'is_active', 'last_login', 'created_at', 'updated_at'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUsersStats(): Promise<any> {
    const total = await this.userRepository.count();
    const active = await this.userRepository.count({ where: { is_active: true } });
    const inactive = await this.userRepository.count({ where: { is_active: false } });
    const super_admin = await this.userRepository.count({ where: { role: UserRole.SUPER_ADMIN } });
    const admin = await this.userRepository.count({ where: { role: UserRole.ADMIN } });
    const user = await this.userRepository.count({ where: { role: UserRole.USER } });
    const candidate = await this.userRepository.count({ where: { role: UserRole.CANDIDATE } });
    const visitor = await this.userRepository.count({ where: { role: UserRole.VISITOR } });

    return { 
      total, 
      active, 
      inactive, 
      super_admin, 
      admin, 
      user, 
      candidate, 
      visitor 
    };
  }

  async getUserById(id: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'avatar_url', 'is_active', 'last_login', 'created_at', 'updated_at'],
    });
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouve');
    }
    
    return user;
  }

  async updateUser(id: string, updateDto: any): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouve');
    }

    const fields = ['first_name', 'last_name', 'phone', 'role'];
    for (const field of fields) {
      if (updateDto[field] !== undefined) {
        if (field === 'role' && user.role === UserRole.SUPER_ADMIN) {
          throw new ForbiddenException('Impossible de modifier le role du Super Admin');
        }
        user[field] = updateDto[field];
      }
    }

    await this.userRepository.save(user);
    
    return this.getUserById(id);
  }

  async getUsersForExport(role?: string): Promise<any[]> {
    const where: any = {};
    if (role && role !== 'all') {
      where.role = role;
    }

    return this.userRepository.find({
      where,
      select: ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'created_at', 'last_login'],
      order: { created_at: 'DESC' },
    });
  }

  async updateUserRole(userId: string, role: UserRole): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouve');
    }

    if (user.role === UserRole.SUPER_ADMIN && role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Impossible de modifier le role du Super Admin');
    }

    user.role = role;
    await this.userRepository.save(user);

    this.logger.log(`Role modifie pour ${user.email}: ${role}`);

    return { 
      success: true, 
      message: 'Role modifie avec succes',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    };
  }

  async toggleUserStatus(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouve');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Impossible de desactiver le Super Admin');
    }

    user.is_active = !user.is_active;
    await this.userRepository.save(user);

    this.logger.log(`Statut modifie pour ${user.email}: ${user.is_active ? 'actif' : 'inactif'}`);

    return {
      success: true,
      message: `Utilisateur ${user.is_active ? 'active' : 'desactive'} avec succes`,
      is_active: user.is_active,
    };
  }

  async deleteUser(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouve');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Impossible de supprimer le Super Admin');
    }

    await this.userRepository.delete(userId);
    this.logger.log(`Utilisateur supprime: ${user.email}`);

    return { 
      success: true, 
      message: 'Utilisateur supprime avec succes' 
    };
  }

  // ============================================================
  // CREATION DU SUPER ADMIN
  // ============================================================

  async seedSuperAdmin(): Promise<void> {
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@ymad.mg';
    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      const admin = this.userRepository.create({
        email: adminEmail,
        password: process.env.SUPER_ADMIN_PASSWORD || 'Admin2026',
        first_name: process.env.SUPER_ADMIN_FIRST_NAME || 'Admin',
        last_name: process.env.SUPER_ADMIN_LAST_NAME || 'Y-MaD',
        role: UserRole.SUPER_ADMIN,
        is_active: true,
        preferred_language: 'fr',
        theme: 'light',
        font_size: 'medium',
        density: 'comfortable',
        sidebar_collapsed: false,
        animations_enabled: true,
        timezone: 'Indian/Antananarivo',
        email_notifications: true,
        push_notifications: true,
        job_alerts: true,
        project_updates: true,
        blog_updates: false,
        system_updates: true,
      });

      await this.userRepository.save(admin);
      this.logger.log(`Super Admin cree: ${adminEmail}`);
    }
  }
}