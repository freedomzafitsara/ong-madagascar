// backend/src/modules/auth/auth.module.ts
// Version finale corrigée - Soutenance DTS 2025

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    // Configuration des variables d'environnement
    ConfigModule,

    // TypeORM - Entité User
    TypeOrmModule.forFeature([User]),

    // Passport - Stratégie d'authentification
    PassportModule.register({ 
      defaultStrategy: 'jwt',
      session: false,
    }),

    // ✅ JWT - Configuration CORRIGÉE
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // ✅ Récupérer la valeur de expiresIn (string ou nombre)
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '7d';
        
        return {
          secret: configService.get<string>('JWT_SECRET') || 'y_mad_super_secret_key_2025',
          signOptions: { 
            expiresIn: expiresIn as any, // ✅ Cast pour éviter l'erreur TypeScript
            algorithm: 'HS256' as const,
          },
          verifyOptions: {
            ignoreExpiration: false,
          },
        };
      },
    }),
  ],

  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}