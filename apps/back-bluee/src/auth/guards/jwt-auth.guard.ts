import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthUserPayload } from '../../common/response.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
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
      req.user = payload;
      return true;
    } catch {
      throw new Error('no autorizado');
    }
  }
}
