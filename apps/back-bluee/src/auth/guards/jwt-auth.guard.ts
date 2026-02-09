import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthUserPayload } from '../../common/response.interface';
import { AuthService } from '../auth.service';
import { createHash } from 'crypto';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUserPayload }>();
    const token = req.cookies?.access_token;
    if (!token) {
      throw new Error('no autorizado');
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not set');
    }
    try {
      const payload = this.jwtService.verify<AuthUserPayload>(token, {
        secret,
      });
      const result = await this.authService.getTokenVersion(payload.sub);
      const dbVersion = result.data?.tokenVersion ?? 0;
      if ((payload.tokenVersion ?? 0) !== dbVersion) {
        throw new Error('no autorizado');
      }
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const accessCheck = await this.authService.checkAccessToken(
        payload.sub,
        payload.jti ?? '',
        tokenHash,
      );
      if (!accessCheck?.data) {
        throw new Error('no autorizado');
      }
      req.user = payload;
      return true;
    } catch {
      throw new Error('no autorizado');
    }
  }
}
