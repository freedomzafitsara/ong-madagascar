import { 
  Injectable, 
  BadRequestException, 
  NotFoundException, 
  UnauthorizedException, 
  ForbiddenException, 
  Logger 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UploadService } from '../upload/upload.service';
import { EmailService } from '../email/email.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Durée de validité du token en minutes
  private readonly TOKEN_EXPIRY_MINUTES = 1;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private uploadService: UploadService,
    private emailService: EmailService,
  ) {}

  // ============================================================
  // INSCRIPTION
  // ============================================================

  async register(registerDto: any): Promise<{ success: boolean; message: string; user?: any }> {
    const { email, password, first_name, last_name, phone, role } = registerDto;

    // Vérifier si l'email existe déjà
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Cet email est deja utilise');
    }

    // Déterminer le rôle
    let userRole = UserRole.VISITOR;
    
    // Empêcher la création de comptes admin via l'inscription
    if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Vous ne pouvez pas creer un compte administrateur');
    }
    
    if (role === UserRole.CANDIDATE) {
      userRole = UserRole.CANDIDATE;
    }

    // Créer l'utilisateur
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

    // Envoyer l'email de bienvenue
    try {
      await this.emailService.sendWelcomeEmail(email, first_name);
      this.logger.log(`Email de bienvenue envoye a ${email}`);
    } catch (error) {
      this.logger.error(`Erreur envoi email de bienvenue: ${error.message}`);
    }
    
    return { 
      success: true, 
      message: 'Inscription reussie. Un email de confirmation vous a ete envoye.',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        avatar_url: user.avatar_url,
      }
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

    // Générer le token JWT
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name
    };

    const token = this.jwtService.sign(payload);

    // Données utilisateur retournées
    const userData = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      role: user.role,
      avatar_url: user.avatar_url,
      is_active: user.is_active,
      isAdmin: user.isAdmin(),
      isCandidate: user.isCandidate(),
      canPostulate: user.canPostulate(),
      canAccessDashboard: user.canAccessDashboard(),
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
      isAdmin: user.isAdmin(),
      isCandidate: user.isCandidate(),
      canPostulate: user.canPostulate(),
      canAccessDashboard: user.canAccessDashboard(),
    };
  }

  // ============================================================
  // MISE A JOUR DU PROFIL
  // ============================================================

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

  // ============================================================
  // CHANGEMENT DE MOT DE PASSE
  // ============================================================

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

    // Validation de la force du mot de passe
    if (newPassword.length < 6) {
      throw new BadRequestException('Le nouveau mot de passe doit contenir au moins 6 caracteres');
    }

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      throw new BadRequestException(
        'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      );
    }

    user.password = newPassword;
    user.must_change_password = false;
    await this.userRepository.save(user);

    this.logger.log(`Mot de passe modifie pour l'utilisateur ${user.email}`);
    
    return { success: true, message: 'Mot de passe modifie avec succes' };
  }

  // ============================================================
  // UPLOAD AVATAR
  // ============================================================

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
  // MOT DE PASSE OUBLIE - AVEC ENVOI D'EMAIL ET TOKEN 1 MINUTE
  // ============================================================

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    // Vérifier si l'utilisateur existe
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      // Ne pas révéler que l'email n'existe pas (sécurité)
      return { 
        success: true, 
        message: 'Si l\'email existe, un lien de reinitialisation a ete envoye' 
      };
    }

    // Générer un token de réinitialisation
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpires = new Date();
    
    // ✅ TOKEN VALABLE 1 MINUTE
    resetTokenExpires.setMinutes(resetTokenExpires.getMinutes() + this.TOKEN_EXPIRY_MINUTES);

    // Sauvegarder le token dans la base de données
    user.reset_token = resetToken;
    user.reset_token_expires = resetTokenExpires;
    await this.userRepository.save(user);

    this.logger.log(`Token genere pour ${email}, expire dans ${this.TOKEN_EXPIRY_MINUTES} minute(s)`);

    // Envoyer l'email avec le lien de réinitialisation
    try {
      await this.emailService.sendResetPasswordEmail(
        email,
        resetToken,
        user.first_name
      );

      this.logger.log(`Email de reinitialisation envoye a ${email}`);

      return { 
        success: true, 
        message: 'Un lien de reinitialisation a ete envoye a votre email' 
      };

    } catch (error) {
      this.logger.error(`Erreur envoi email a ${email}:`, error.message);
      
      // Si l'email ne peut pas être envoyé, on retourne quand même un succès
      // pour ne pas révéler l'existence de l'email (sécurité)
      return { 
        success: true, 
        message: 'Un lien de reinitialisation a ete envoye a votre email' 
      };
    }
  }

  // ============================================================
  // REINITIALISATION DU MOT DE PASSE
  // ============================================================

  async resetPassword(resetDto: any): Promise<{ success: boolean; message: string }> {
    const { token, newPassword } = resetDto;

    // Vérifier la présence du token
    if (!token) {
      throw new BadRequestException('Token requis');
    }

    if (!newPassword) {
      throw new BadRequestException('Nouveau mot de passe requis');
    }

    // Rechercher l'utilisateur avec le token valide
    const user = await this.userRepository.findOne({
      where: {
        reset_token: token,
      },
    });

    if (!user) {
      throw new BadRequestException('Token invalide ou expire');
    }

    // Vérifier si le token n'a pas expiré (1 minute)
    if (user.reset_token_expires && new Date() > user.reset_token_expires) {
      throw new BadRequestException(
        `Le token a expire. Veuillez refaire une demande. (Duree de validite: ${this.TOKEN_EXPIRY_MINUTES} minute(s))`
      );
    }

    // Valider la force du nouveau mot de passe
    if (newPassword.length < 6) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 6 caracteres');
    }

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      throw new BadRequestException(
        'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      );
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    user.reset_token = null;
    user.reset_token_expires = null;
    user.must_change_password = false;
    await this.userRepository.save(user);

    this.logger.log(`Mot de passe reinitialise pour ${user.email}`);

    // Envoyer un email de confirmation
    try {
      await this.emailService.sendResetConfirmationEmail(user.email, user.first_name);
      this.logger.log(`Email de confirmation envoye a ${user.email}`);
    } catch (error) {
      this.logger.error(`Erreur envoi email de confirmation: ${error.message}`);
    }

    return { 
      success: true, 
      message: 'Mot de passe reinitialise avec succes' 
    };
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

    // Empêcher la modification du rôle SUPER_ADMIN
    if (user.role === UserRole.SUPER_ADMIN && role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Impossible de modifier le role du Super Admin');
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

    // Empêcher la désactivation du SUPER_ADMIN
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Impossible de desactiver le Super Admin');
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
  // CREATION DU SUPER ADMIN UNIQUE
  // ============================================================

  async seedSuperAdmin(): Promise<void> {
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@ymad.mg';
    const existingAdmin = await this.userRepository.findOne({ 
      where: { email: adminEmail } 
    });

    if (!existingAdmin) {
      const admin = this.userRepository.create({
        email: adminEmail,
        password: process.env.SUPER_ADMIN_PASSWORD || 'Admin123!',
        first_name: process.env.SUPER_ADMIN_FIRST_NAME || 'Admin',
        last_name: process.env.SUPER_ADMIN_LAST_NAME || 'Y-MaD',
        role: UserRole.SUPER_ADMIN,
        is_active: true,
      });

      await this.userRepository.save(admin);
      this.logger.log(`Super Admin cree: ${adminEmail}`);
    }
  }
}