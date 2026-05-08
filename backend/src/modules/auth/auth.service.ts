import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole } from '../../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface SanitizedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  region?: string;
  photo?: string;
  bio?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto, ip?: string): Promise<{ success: boolean; message: string; user: SanitizedUser; token: string }> {
    console.log('📝 Tentative d\'inscription:', registerDto.email);
    
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = this.userRepository.create({
      ...registerDto,
      role: registerDto.role || UserRole.VISITOR,
      verificationToken,
      lastIp: ip,
    });

    await this.userRepository.save(user);
    
    const token = this.generateToken(user);

    console.log('✅ Inscription réussie:', registerDto.email);

    return {
      success: true,
      message: 'Inscription réussie',
      user: this.sanitizeUser(user),
      token,
    };
  }

  async login(loginDto: LoginDto, ip?: string): Promise<{ success: boolean; message: string; user: SanitizedUser; token: string }> {
    console.log('🔐 Tentative de connexion pour:', loginDto.email);
    
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      select: ['id', 'email', 'password', 'role', 'firstName', 'lastName', 'isActive', 'loginAttempts', 'lockedUntil'],
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (user.isLocked && user.isLocked()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      console.log(`🔒 Compte verrouillé pour ${remainingMinutes} minutes`);
      throw new UnauthorizedException(`Compte temporairement verrouillé. Réessayez dans ${remainingMinutes} minutes.`);
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      user.incrementLoginAttempts();
      await this.userRepository.save(user);
      
      const remainingAttempts = (user.role === UserRole.SUPER_ADMIN ? 3 : 5) - user.loginAttempts;
      console.log(`❌ Mot de passe incorrect - ${remainingAttempts} tentatives restantes`);
      throw new UnauthorizedException(`Email ou mot de passe incorrect. Il vous reste ${remainingAttempts} tentative(s).`);
    }

    if (!user.isActive) {
      console.log('❌ Compte désactivé');
      throw new UnauthorizedException('Votre compte est désactivé');
    }

    user.resetLoginAttempts();
    user.lastLogin = new Date();
    user.lastIp = ip;
    await this.userRepository.save(user);

    const token = this.generateToken(user);
    
    console.log('✅ Connexion réussie pour:', loginDto.email);

    return {
      success: true,
      message: 'Connexion réussie',
      user: this.sanitizeUser(user),
      token,
    };
  }

  // ✅ AJOUT DE LA MÉTHODE verifyEmail
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    console.log('🔐 Vérification d\'email avec token:', token.substring(0, 20) + '...');
    
    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Token de vérification invalide');
    }

    if (user.emailVerified) {
      return { success: true, message: 'Email déjà vérifié' };
    }

    await this.userRepository.update(user.id, {
      emailVerified: true,
      verificationToken: null
    });

    console.log('✅ Email vérifié avec succès pour:', user.email);
    
    return { success: true, message: 'Email vérifié avec succès' };
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    console.log('🔐 DEMANDE DE RÉINITIALISATION pour:', email);
    
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return { success: true, message: 'Si un compte existe, un email a été envoyé' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000);
    
    await this.userRepository.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    });
    
    console.log('\n╔══════════════════════════════════════════════════════════════════╗');
    console.log('║              🔐 LIEN DE RÉINITIALISATION DE MOT DE PASSE          ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log(`║ 📧 Email: ${email}`);
    console.log(`║ 🔗 Lien: http://localhost:3000/reset-password?token=${resetToken}`);
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');
    
    return { success: true, message: 'Email de réinitialisation envoyé' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    console.log('🔐 Tentative de réinitialisation...');
    
    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      throw new BadRequestException('Token invalide');
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Ce lien a expiré. Veuillez refaire une demande.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      loginAttempts: 0,
      lockedUntil: null
    });

    console.log('✅ Mot de passe réinitialisé pour:', user.email);
    
    return { success: true, message: 'Mot de passe réinitialisé avec succès' };
  }

  async getProfile(userId: string): Promise<SanitizedUser> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, updateData: any): Promise<SanitizedUser> {
    const { password, ...safeUpdateData } = updateData;
    await this.userRepository.update(userId, safeUpdateData);
    return this.getProfile(userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await this.userRepository.update(user.id, {
      password: hashedPassword
    });

    return { success: true, message: 'Mot de passe changé avec succès' };
  }

  async getAllUsers(currentUserRole: string): Promise<SanitizedUser[]> {
    if (currentUserRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Accès non autorisé');
    }
    const users = await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
    return users.map(user => this.sanitizeUser(user));
  }

  async getUserById(id: string, currentUserRole: string, currentUserId: string): Promise<SanitizedUser> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (currentUserRole !== UserRole.SUPER_ADMIN && currentUserId !== id) {
      throw new ForbiddenException('Accès non autorisé');
    }

    return this.sanitizeUser(user);
  }

  async updateUserRole(id: string, newRole: UserRole, currentUserRole: string, currentUserId: string): Promise<SanitizedUser> {
    if (currentUserRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Seul un Super Admin peut modifier les rôles');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Le rôle du Super Administrateur ne peut pas être modifié');
    }

    if (id === currentUserId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier votre propre rôle');
    }

    await this.userRepository.update(id, { role: newRole });
    
    console.log(`🔐 [AUDIT] ${currentUserId} a changé le rôle de ${user.email} vers ${newRole}`);
    
    const updatedUser = await this.userRepository.findOne({ where: { id } });
    if (!updatedUser) {
      throw new NotFoundException('Utilisateur non trouvé après mise à jour');
    }
    return this.sanitizeUser(updatedUser);
  }

  async toggleUserStatus(id: string, currentUserRole: string, currentUserId: string): Promise<SanitizedUser> {
    if (currentUserRole !== UserRole.SUPER_ADMIN && currentUserRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Droits insuffisants');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Impossible de modifier le statut du Super Administrateur');
    }

    const newStatus = !user.isActive;
    await this.userRepository.update(id, { isActive: newStatus });
    
    console.log(`🔐 [AUDIT] ${currentUserId} a ${newStatus ? 'activé' : 'désactivé'} le compte de ${user.email}`);
    
    const updatedUser = await this.userRepository.findOne({ where: { id } });
    if (!updatedUser) {
      throw new NotFoundException('Utilisateur non trouvé après mise à jour');
    }
    return this.sanitizeUser(updatedUser);
  }

  async deleteUser(id: string, currentUserRole: string, currentUserId: string): Promise<{ success: boolean }> {
    if (currentUserRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Seul un Super Admin peut supprimer des utilisateurs');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (id === currentUserId) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer votre propre compte');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Impossible de supprimer le Super Administrateur');
    }

    const superAdminCount = await this.userRepository.count({ where: { role: UserRole.SUPER_ADMIN } });
    if (superAdminCount <= 1 && user.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Impossible de supprimer le dernier Super Administrateur');
    }

    await this.userRepository.delete(id);
    
    console.log(`🔐 [AUDIT] ${currentUserId} a supprimé l'utilisateur ${user.email}`);
    
    return { success: true };
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: User): SanitizedUser {
    const { 
      password, 
      resetPasswordToken, 
      resetPasswordExpires, 
      verificationToken,
      loginAttempts,
      lockedUntil,
      lastIp,
      ...sanitized 
    } = user;
    return sanitized as SanitizedUser;
  }
}