// backend/src/modules/auth/auth.service.ts

import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: any }> {
    const { email, password } = loginDto;

    // ✅ NE PAS sélectionner les colonnes qui n'existent pas
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      this.logger.warn(`Tentative de connexion echouee: ${email} - Utilisateur inexistant`);
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Compte desactive');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Tentative de connexion echouee: ${email} - Mot de passe incorrect`);
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    user.last_login = new Date();
    await this.userRepository.save(user);

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    this.logger.log(`Connexion reussie: ${email}`);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<any> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Cet email est deja utilise');
    }

    const user = this.userRepository.create({
      email: registerDto.email,
      password: registerDto.password,
      first_name: registerDto.first_name,
      last_name: registerDto.last_name,
      role: registerDto.role || 'admin',
      is_active: true,
    });

    const savedUser = await this.userRepository.save(user);
    this.logger.log(`Nouvel admin cree: ${savedUser.email}`);

    const { password, ...result } = savedUser;
    return result;
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouve');
    }

    const { password, ...result } = user;
    return result;
  }

  async validateUser(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async findAll(): Promise<any[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'last_login', 'created_at'],
      order: { created_at: 'DESC' },
    });
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
    this.logger.log(`Admin supprime: ${id}`);
  }

  async toggleStatus(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouve');
    }
    user.is_active = !user.is_active;
    return this.userRepository.save(user);
  }
}