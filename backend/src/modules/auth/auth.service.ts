// backend/src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from './entities/user.entity';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto, UpdateProfileDto } from './dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // ========================================
  // 1. INSCRIPTION
  // ========================================
  async register(registerDto: RegisterDto): Promise<{ user: Partial<User>; token: string }> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }
    
    // Générer un token de vérification email
    const emailVerificationToken = randomBytes(32).toString('hex');
    
    // Créer le nouvel utilisateur (rôle VISITOR par défaut)
    const user = this.userRepository.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: registerDto.password,
      phone: registerDto.phone,
      role: UserRole.VISITOR,
      emailVerificationToken,
      isActive: true,
    });
    
    await this.userRepository.save(user);
    
    // Générer le token JWT
    const token = this.generateToken(user);
    
    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    
    // TODO: Envoyer email de vérification
    console.log(`📧 Email de vérification: ${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`);
    
    return { user: userWithoutPassword, token };
  }

  // ========================================
  // 2. CONNEXION
  // ========================================
  async login(loginDto: LoginDto, ipAddress?: string): Promise<{ user: Partial<User>; token: string }> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'isActive', 'emailVerified'],
    });
    
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    
    // Vérifier si le compte est actif
    if (!user.isActive) {
      throw new UnauthorizedException('Votre compte a été désactivé. Contactez l\'administrateur.');
    }
    
    // Mettre à jour la dernière connexion
    user.lastLoginAt = new Date();
    user.lastLoginIp = ipAddress;
    await this.userRepository.save(user);
    
    // Générer le token
    const token = this.generateToken(user);
    
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  // ========================================
  // 3. RÉINITIALISATION MOT DE PASSE
  // ========================================
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });
    
    if (!user) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe
      return { message: 'Si cet email existe, un lien de réinitialisation vous a été envoyé' };
    }
    
    // Générer un token unique
    const resetToken = randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Valable 1 heure
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await this.userRepository.save(user);
    
    // TODO: Envoyer email avec lien de réinitialisation
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log(`📧 Lien de réinitialisation: ${resetLink}`);
    
    return { message: 'Si cet email existe, un lien de réinitialisation vous a été envoyé' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { 
        resetPasswordToken: resetPasswordDto.token,
      },
    });
    
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Token invalide ou expiré');
    }
    
    // Mettre à jour le mot de passe
    user.password = resetPasswordDto.newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.userRepository.save(user);
    
    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  // ========================================
  // 4. CHANGEMENT DE MOT DE PASSE (Connecté)
  // ========================================
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });
    
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    
    const isPasswordValid = await user.comparePassword(changePasswordDto.currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }
    
    user.password = changePasswordDto.newPassword;
    await this.userRepository.save(user);
    
    return { message: 'Mot de passe modifié avec succès' };
  }

  // ========================================
  // 5. MODIFICATION DU PROFIL
  // ========================================
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    
    Object.assign(user, updateProfileDto);
    await this.userRepository.save(user);
    
    const { password, ...result } = user;
    return result;
  }

  // ========================================
  // 6. VÉRIFICATION EMAIL
  // ========================================
  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });
    
    if (!user) {
      throw new BadRequestException('Token invalide');
    }
    
    user.emailVerified = true;
    user.emailVerificationToken = null;
    await this.userRepository.save(user);
    
    return { message: 'Email vérifié avec succès' };
  }

  // ========================================
  // 7. GESTION DES RÔLES (Admin uniquement)
  // ========================================
  async updateUserRole(userId: string, newRole: UserRole, adminId: string): Promise<User> {
    // Vérifier que l'admin a les droits
    const admin = await this.userRepository.findOne({ where: { id: adminId } });
    if (!admin || admin.role !== UserRole.SUPER_ADMIN) {
      throw new UnauthorizedException('Seul un Super Admin peut modifier les rôles');
    }
    
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    
    user.role = newRole;
    await this.userRepository.save(user);
    
    return user;
  }

  // ========================================
  // 8. UTILITAIRES
  // ========================================
  private generateToken(user: User): string {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    
    const { password, ...result } = user;
    return result;
  }

  async getAllUsers(): Promise<Partial<User>[]> {
    const users = await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
    
    return users.map(({ password, ...user }) => user);
  }
}