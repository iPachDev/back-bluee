import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ResponseEnvelope, RmqRequest } from '../common/response.interface';

@Injectable()
export class AuthService {
  private readonly attempts = new Map<
    string,
    { count: number; resetAt: number }
  >();

  constructor(@Inject('USERS_SERVICE') private readonly client: ClientProxy) {}

  private checkRateLimit(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    const entry = this.attempts.get(key);
    if (!entry || entry.resetAt <= now) {
      this.attempts.set(key, { count: 1, resetAt: now + windowMs });
      return;
    }
    if (entry.count >= limit) {
      throw new Error('demasiadas solicitudes');
    }
    entry.count += 1;
  }

  async login(
    payload: { email: string; password: string; ip: string },
    meta: RmqRequest<unknown>['meta'],
  ) {
    const key = `login:${payload.ip}:${payload.email}`;
    this.checkRateLimit(key, 5, 60_000);
    return (await firstValueFrom(
      this.client.send({ cmd: 'auth.login' }, { data: payload, meta }),
    )) as ResponseEnvelope<{
      accessToken: string;
      refreshToken: string;
      user: { id: string; email: string };
      tenantId?: string;
      roles?: string[];
      permissions?: string[];
      employeeProfile?: Record<string, unknown> | null;
    }>;
  }

  async refresh(
    payload: { refreshToken: string; ip: string },
    meta: RmqRequest<unknown>['meta'],
  ) {
    const key = `refresh:${payload.ip}`;
    this.checkRateLimit(key, 10, 60_000);
    return (await firstValueFrom(
      this.client.send({ cmd: 'auth.refresh' }, { data: payload, meta }),
    )) as ResponseEnvelope<{
      accessToken: string;
      refreshToken: string;
      user: { id: string; email: string };
      tenantId?: string;
      roles?: string[];
      permissions?: string[];
      employeeProfile?: Record<string, unknown> | null;
    }>;
  }

  async logout(
    payload: { refreshToken?: string; ip: string },
    meta: RmqRequest<unknown>['meta'],
  ) {
    return (await firstValueFrom(
      this.client.send({ cmd: 'auth.logout' }, { data: payload, meta }),
    )) as ResponseEnvelope<{ ok: true }>;
  }

  async me(payload: { userId: string }, meta: RmqRequest<unknown>['meta']) {
    return (await firstValueFrom(
      this.client.send({ cmd: 'auth.me' }, { data: payload, meta }),
    )) as ResponseEnvelope<{
      user: Record<string, unknown>;
      roles: string[];
      permissions: string[];
      employeeProfile?: Record<string, unknown> | null;
    }>;
  }

  async changePassword(
    payload: { userId: string; currentPassword: string; newPassword: string },
    meta: RmqRequest<unknown>['meta'],
  ) {
    return (await firstValueFrom(
      this.client.send(
        { cmd: 'auth.change-password' },
        { data: payload, meta },
      ),
    )) as ResponseEnvelope<{ ok: true }>;
  }

  async getTokenVersion(userId: string) {
    return (await firstValueFrom(
      this.client.send(
        { cmd: 'auth.token-version' },
        { data: { userId }, meta: { transactionId: '', source: 'back-bluee' } },
      ),
    )) as ResponseEnvelope<{ tokenVersion: number }>;
  }

  async listSessions(
    payload: { userId: string },
    meta: RmqRequest<unknown>['meta'],
  ) {
    return (await firstValueFrom(
      this.client.send({ cmd: 'auth.sessions' }, { data: payload, meta }),
    )) as ResponseEnvelope<{
      active: Array<{
        id: string;
        ip?: string;
        createdAt: string;
        expiresAt: string;
      }>;
    }>;
  }

  async revokeSession(
    payload: { userId: string; sessionId: string },
    meta: RmqRequest<unknown>['meta'],
  ) {
    return (await firstValueFrom(
      this.client.send({ cmd: 'auth.revoke-session' }, { data: payload, meta }),
    )) as ResponseEnvelope<{ ok: true }>;
  }
}
