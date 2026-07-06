// backend/src/modules/auth/strategies/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    const user = await this.authService.getProfile(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouve');
    }
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      first_name: payload.first_name,
      last_name: payload.last_name,
    };
  }
}