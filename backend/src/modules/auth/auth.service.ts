import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole } from '../../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    console.log('📝 REGISTER - Début inscription:', registerDto.email);
    
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const user = this.userRepository.create({
      ...registerDto,
      role: registerDto.role || UserRole.VISITOR,
    });

    await this.userRepository.save(user);
    const token = this.generateToken(user);

    console.log('✅ REGISTER - Succès:', user.email);

    return {
      success: true,
      message: 'Inscription réussie',
      user: this.sanitizeUser(user),
      token,
    };
  }

  async login(loginDto: LoginDto) {
    console.log('🔐 LOGIN - Tentative pour:', loginDto.email);
    
    // 1. Rechercher l'utilisateur
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      console.log('❌ LOGIN - Utilisateur non trouvé:', loginDto.email);
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    console.log('✅ LOGIN - Utilisateur trouvé:', user.email);
    console.log('   - ID:', user.id);
    console.log('   - Rôle:', user.role);
    console.log('   - Hash stocké (début):', user.password.substring(0, 30) + '...');

    // 2. Vérifier le mot de passe avec bcrypt
    console.log('🔐 LOGIN - Vérification du mot de passe...');
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    console.log('   - Résultat bcrypt.compare:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ LOGIN - Mot de passe invalide pour:', loginDto.email);
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // 3. Vérifier si le compte est actif
    if (!user.isActive) {
      console.log('❌ LOGIN - Compte désactivé:', loginDto.email);
      throw new UnauthorizedException('Votre compte est désactivé');
    }

    // 4. Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await this.userRepository.save(user);
    console.log('✅ LOGIN - Dernière connexion mise à jour');

    // 5. Générer le token
    const token = this.generateToken(user);
    console.log('✅ LOGIN - Token JWT généré');

    return {
      success: true,
      message: 'Connexion réussie',
      user: this.sanitizeUser(user),
      token,
    };
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return {
        success: true,
        message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await this.userRepository.save(user);

    const emailSent = await this.emailService.sendResetPasswordEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      resetToken
    );

    if (!emailSent) {
      console.error(`Échec envoi email pour ${email}`);
    }

    return {
      success: true,
      message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
    };
  }

  async verifyResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      return { valid: false };
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return { valid: false };
    }

    return { 
      valid: true, 
      email: user.email 
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      throw new BadRequestException('Token invalide');
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Ce lien a expiré. Veuillez refaire une demande.');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Votre mot de passe a été réinitialisé avec succès.',
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, updateData: any) {
    await this.userRepository.update(userId, updateData);
    return this.getProfile(userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return { success: true, message: 'Mot de passe changé avec succès' };
  }

  async resetSuperAdminPassword(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ 
      where: { email, role: UserRole.SUPER_ADMIN }
    });

    if (!user) {
      throw new NotFoundException('Super admin non trouvé');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return {
      success: true,
      message: `Mot de passe réinitialisé avec succès pour ${email}`,
    };
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

  private sanitizeUser(user: User) {
    const { password, resetPasswordToken, resetPasswordExpires, ...sanitized } = user;
    return sanitized;
  }
}