import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ConflictException, 
  UnauthorizedException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../../entities/user.entity';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // ============================================================
  // 1. INSCRIPTION
  // ============================================================

  async register(registerDto: RegisterDto, ip: string): Promise<{ success: boolean; message: string }> {
    const { email, password, firstName, lastName, phone } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = this.generateRandomToken();

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || null,
      role: UserRole.MEMBER,
      verificationToken,
      isActive: true,
      emailVerified: false,
      lastIp: ip,
    });

    await this.userRepository.save(user);
    this.logger.log(`Nouvel utilisateur inscrit: ${email}`);

    return {
      success: true,
      message: 'Compte créé avec succès.',
    };
  }

  // ============================================================
  // 2. CONNEXION
  // ============================================================

  async login(loginDto: LoginDto, ip: string): Promise<{ access_token: string; user: any }> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'firstName', 'lastName', 'avatar_url', 'isActive', 'emailVerified']
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Votre compte est désactivé');
    }

    if (!user.password) {
      throw new InternalServerErrorException('Configuration du compte invalide');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const access_token = this.jwtService.sign(payload);

    await this.userRepository.update(user.id, {
      lastLogin: new Date(),
      lastIp: ip,
    });

    this.logger.log(`Connexion réussie: ${email}`);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar_url: user.avatar_url || null,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLogin: new Date(),
      },
    };
  }

  // ============================================================
  // 3. PROFIL UTILISATEUR
  // ============================================================

  async getProfile(userId: string): Promise<any> {
    if (!userId) {
      throw new BadRequestException('Identifiant utilisateur requis');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar_url: user.avatar_url || null,
      phone: user.phone || '',
      region: user.region || '',
      bio: user.bio || '',
      position: user.position || '',
      department: user.department || '',
      skills: user.skills || '',
      socialLinkedin: user.socialLinkedin || '',
      socialTwitter: user.socialTwitter || '',
      socialGithub: user.socialGithub || '',
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(userId: string, updateData: any): Promise<any> {
    if (!userId) {
      throw new BadRequestException('Identifiant utilisateur requis');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return this.getProfile(userId);
    }

    const modifiableFields = [
      'firstName', 'lastName', 'phone', 'region', 'bio',
      'position', 'department', 'skills',
      'socialLinkedin', 'socialTwitter', 'socialGithub'
    ];

    const updateFields: any = {};
    for (const field of modifiableFields) {
      if (updateData[field] !== undefined && updateData[field] !== null) {
        updateFields[field] = updateData[field];
      }
    }

    if (updateData.avatar_url !== undefined) {
      updateFields.avatar_url = updateData.avatar_url;
    }

    if (Object.keys(updateFields).length > 0) {
      await this.userRepository.update(userId, updateFields);
      this.logger.log(`Profil mis à jour: ${user.email}`);
    }

    return this.getProfile(userId);
  }

  // ============================================================
  // 4. GESTION DE LA PHOTO
  // ============================================================

  async updateUserPhoto(userId: string, photoUrl: string | null): Promise<any> {
    if (!userId) {
      throw new BadRequestException('Identifiant utilisateur requis');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    await this.userRepository.update(userId, { avatar_url: photoUrl });
    this.logger.log(`Photo mise à jour: ${user.email}`);
    
    return this.getProfile(userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId }, select: ['id', 'password', 'email'] });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });
    this.logger.log(`Mot de passe modifié: ${user.email}`);

    return {
      success: true,
      message: 'Mot de passe modifié avec succès',
    };
  }

  // ============================================================
  // 5. MOT DE PASSE OUBLIÉ
  // ============================================================

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      this.logger.warn(`Demande de réinitialisation pour email inexistant: ${email}`);
      return {
        success: true,
        message: 'Si cet email existe, vous recevrez un lien de réinitialisation.',
      };
    }

    const resetToken = this.generateRandomToken();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    await this.userRepository.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    });

    this.logger.log(`Token de réinitialisation généré pour: ${email}`);

    return {
      success: true,
      message: 'Si cet email existe, vous recevrez un lien de réinitialisation.',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (!token) {
      throw new BadRequestException('Token requis');
    }

    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      throw new BadRequestException('Token invalide');
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Token expiré. Veuillez refaire une demande');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 6 caractères');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    this.logger.log(`Mot de passe réinitialisé: ${user.email}`);

    return {
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
    };
  }

  // ============================================================
  // 6. VÉRIFICATION D EMAIL
  // ============================================================

  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    if (!token) {
      throw new BadRequestException('Token requis');
    }

    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Token invalide');
    }

    await this.userRepository.update(user.id, {
      emailVerified: true,
      verificationToken: null,
    });

    this.logger.log(`Email vérifié: ${user.email}`);

    return {
      success: true,
      message: 'Email vérifié avec succès',
    };
  }

  // ============================================================
  // 7. ADMINISTRATION
  // ============================================================

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'avatar_url', 'lastLogin', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return user;
  }

  async updateUserRole(id: string, newRole: UserRole): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    await this.userRepository.update(id, { role: newRole });
    this.logger.log(`Rôle modifié: ${user.email} → ${newRole}`);

    return this.userRepository.findOne({ where: { id } });
  }

  async toggleUserStatus(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const newStatus = !user.isActive;
    await this.userRepository.update(id, { isActive: newStatus });
    this.logger.log(`Statut modifié: ${user.email} → ${newStatus ? 'Activé' : 'Désactivé'}`);

    return this.userRepository.findOne({ where: { id } });
  }

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    await this.userRepository.delete(id);
    this.logger.log(`Utilisateur supprimé: ${user.email}`);

    return {
      success: true,
      message: 'Utilisateur supprimé avec succès',
    };
  }

  // ============================================================
  // 8. MÉTHODES UTILITAIRES
  // ============================================================

  private generateRandomToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}