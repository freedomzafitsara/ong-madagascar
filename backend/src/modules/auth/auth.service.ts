// backend/src/modules/auth/auth.service.ts
import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ConflictException, 
  UnauthorizedException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../../entities/user.entity';
import { LoginDto, RegisterDto } from './dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(registerDto: RegisterDto, ip: string): Promise<{ success: boolean; message: string }> {
    const { email, password, firstName, lastName, phone } = registerDto;

    // Vérifier si l'email existe déjà
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.random().toString(36).substring(2, 15);

    // Créer l'utilisateur
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: UserRole.MEMBER,
      verificationToken,
      isActive: true,
      emailVerified: false,
    });

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Compte créé avec succès. Veuillez vérifier votre email.',
    };
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(loginDto: LoginDto, ip: string): Promise<{ access_token: string; user: any }> {
    const { email, password } = loginDto;

    // Rechercher l'utilisateur
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      throw new UnauthorizedException('Votre compte est désactivé. Contactez l\'administrateur.');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Générer le token JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const access_token = this.jwtService.sign(payload);

    // Mettre à jour la dernière connexion
    await this.userRepository.update(user.id, {
      lastLogin: new Date(),
      lastIp: ip,
    });

    // Retourner le token et les informations utilisateur
    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar_url: user.avatar_url,
        isActive: user.isActive,
      },
    };
  }

  /**
   * Récupérer le profil d'un utilisateur
   */
  async getProfile(userId: string): Promise<any> {
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
      avatar_url: user.avatar_url,
      phone: user.phone,
      region: user.region,
      bio: user.bio,
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
    };
  }

  /**
   * Mettre à jour le profil d'un utilisateur (CORRIGÉ)
   */
  async updateProfile(userId: string, updateData: any): Promise<any> {
    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier que updateData est un objet et non vide
    if (!updateData || typeof updateData !== 'object') {
      return this.getProfile(userId);
    }

    // Construire l'objet de mise à jour avec les champs fournis uniquement
    const updateFields: any = {};

    // Liste des champs modifiables
    const modifiableFields = [
      'firstName', 'lastName', 'phone', 'region', 'bio',
      'position', 'department', 'skills',
      'socialLinkedin', 'socialTwitter', 'socialGithub'
    ];

    // Parcourir les champs modifiables
    for (const field of modifiableFields) {
      if (updateData[field] !== undefined && updateData[field] !== null) {
        updateFields[field] = updateData[field];
      }
    }

    // Gérer spécifiquement avatar_url (nom différent dans la base)
    if (updateData.avatar_url !== undefined && updateData.avatar_url !== null) {
      updateFields.avatar_url = updateData.avatar_url;
    }

    // 🔴 IMPORTANT: Si aucun champ à mettre à jour, on ne fait rien
    if (Object.keys(updateFields).length === 0) {
      console.log('Aucun champ à mettre à jour pour userId:', userId);
      return this.getProfile(userId);
    }

    // Appliquer les modifications
    await this.userRepository.update(userId, updateFields);
    
    // Retourner le profil mis à jour
    return this.getProfile(userId);
  }

  /**
   * Mettre à jour la photo de profil
   */
  async updateUserPhoto(userId: string, photoUrl: string): Promise<any> {
    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier que photoUrl est valide
    if (!photoUrl) {
      throw new BadRequestException('URL de photo invalide');
    }

    // Supprimer l'ancienne photo du disque (si elle existe)
    if (user.avatar_url) {
      try {
        const oldFilePath = path.join(process.cwd(), 'uploads', 'profiles', path.basename(user.avatar_url));
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log(`Ancienne photo supprimée: ${oldFilePath}`);
        }
      } catch (error) {
        console.error(`Erreur lors de la suppression: ${error.message}`);
      }
    }

    // Mettre à jour la nouvelle photo
    await this.userRepository.update(userId, { avatar_url: photoUrl });
    
    return this.getProfile(userId);
  }

  /**
   * Supprimer la photo de profil
   */
  async deleteUserPhoto(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Supprimer le fichier du disque
    if (user.avatar_url) {
      try {
        const oldFilePath = path.join(process.cwd(), 'uploads', 'profiles', path.basename(user.avatar_url));
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch (error) {
        console.error(`Erreur lors de la suppression: ${error.message}`);
      }
    }

    // Supprimer la référence en base
    await this.userRepository.update(userId, { avatar_url: null });
    
    return this.getProfile(userId);
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier l'ancien mot de passe
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });

    return {
      success: true,
      message: 'Mot de passe modifié avec succès',
    };
  }

  /**
   * Mot de passe oublié - Envoi d'un email de réinitialisation
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Pour des raisons de sécurité, on ne confirme pas si l'email existe
      return {
        success: true,
        message: 'Si cet email existe, vous recevrez un lien de réinitialisation.',
      };
    }

    // Générer un token unique
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    await this.userRepository.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    });

    return {
      success: true,
      message: 'Email de réinitialisation envoyé',
    };
  }

  /**
   * Réinitialiser le mot de passe avec un token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });

    // Vérifier que le token est valide et non expiré
    if (!user || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return {
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
    };
  }

  /**
   * Vérifier l'email avec un token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
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

    return {
      success: true,
      message: 'Email vérifié avec succès',
    };
  }

  /**
   * Récupérer tous les utilisateurs (admin seulement)
   */
  async getAllUsers(currentUserRole: UserRole): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'avatar_url', 'lastLogin', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Récupérer un utilisateur par son ID (admin seulement)
   */
  async getUserById(id: string, currentUserRole: UserRole, currentUserId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return user;
  }

  /**
   * Mettre à jour le rôle d'un utilisateur (super admin seulement)
   */
  async updateUserRole(id: string, newRole: UserRole, currentUserRole: UserRole, currentUserId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Un simple admin ne peut pas modifier un super admin
    if (user.role === UserRole.SUPER_ADMIN && currentUserRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Vous ne pouvez pas modifier le rôle d\'un super administrateur');
    }

    await this.userRepository.update(id, { role: newRole });
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * Activer/Désactiver un utilisateur (admin+)
   */
  async toggleUserStatus(id: string, currentUserRole: UserRole, currentUserId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Un simple admin ne peut pas désactiver un super admin
    if (user.role === UserRole.SUPER_ADMIN && currentUserRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Vous ne pouvez pas désactiver un super administrateur');
    }

    // Inverser le statut actif/inactif
    await this.userRepository.update(id, { isActive: !user.isActive });
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * Supprimer un utilisateur (super admin seulement)
   */
  async deleteUser(id: string, currentUserRole: UserRole, currentUserId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Un simple admin ne peut pas supprimer un super admin
    if (user.role === UserRole.SUPER_ADMIN && currentUserRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer un super administrateur');
    }

    // Supprimer la photo de profil si elle existe
    if (user.avatar_url) {
      const oldFilePath = path.join(process.cwd(), 'uploads', 'profiles', path.basename(user.avatar_url));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    await this.userRepository.delete(id);
    return {
      success: true,
      message: 'Utilisateur supprimé avec succès',
    };
  }
}