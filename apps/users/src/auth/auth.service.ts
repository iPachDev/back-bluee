import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';
import {
  AccessToken,
  AccessTokenDocument,
} from './schemas/access-token.schema';
import { UsersService } from '../users/users.service';
import { AuthUserPayload } from '../common/response.interface';

@Injectable()
export class AuthService {
  private readonly accessTtl = '15m';
  private readonly accessTtlMs = 15 * 60 * 1000;
  private readonly refreshTtlMs = 7 * 24 * 60 * 60 * 1000;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(RefreshToken.name)
    private readonly refreshModel: Model<RefreshTokenDocument>,
    @InjectModel(AccessToken.name)
    private readonly accessModel: Model<AccessTokenDocument>,
  ) {}

  async login(payload: { email: string; password: string; ip: string }) {
    const user = await this.findUserByEmail(payload.email, true);
    if (!user) {
      throw new Error('credenciales inválidas');
    }
    const ok = await bcrypt.compare(payload.password, user.password || '');
    if (!ok) {
      throw new Error('credenciales inválidas');
    }
    const accessToken = await this.signAccessToken(user);
    const { refreshToken, jti, tokenHash, expiresAt } =
      this.generateRefreshToken();
    await this.refreshModel.create({
      userId: String(user._id),
      jti,
      tokenHash,
      expiresAt,
      ip: payload.ip,
    });
    return {
      accessToken,
      refreshToken,
      user: { id: String(user._id), email: payload.email },
      tenantId: user.tenantId,
      roles: user.roles,
      permissions: user.permissions,
      employeeProfile: user.employeeId ? (user.employment ?? null) : null,
    };
  }

  async refresh(payload: { refreshToken?: string; ip: string }) {
    if (!payload.refreshToken) {
      throw new Error('no autorizado');
    }
    const parsed = this.parseRefreshToken(payload.refreshToken);
    const tokenDoc = await this.refreshModel.findOne({
      jti: parsed.jti,
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });
    if (!tokenDoc) {
      throw new Error('no autorizado');
    }
    const hash = this.hashToken(parsed.token);
    if (tokenDoc.tokenHash !== hash) {
      throw new Error('no autorizado');
    }
    tokenDoc.revokedAt = new Date();
    await tokenDoc.save();

    const user = await this.usersService.findByIdOrEmployeeNumber({
      id: tokenDoc.userId,
    });
    const email = this.getPrimaryEmail(user as any);
    const accessToken = await this.signAccessToken(user as any);
    const { refreshToken, jti, tokenHash, expiresAt } =
      this.generateRefreshToken();
    await this.refreshModel.create({
      userId: tokenDoc.userId,
      jti,
      tokenHash,
      expiresAt,
      ip: payload.ip,
    });
    return {
      accessToken,
      refreshToken,
      user: { id: String(tokenDoc.userId), email },
      tenantId: (user as any)?.tenantId,
      roles: (user as any)?.roles ?? ['user'],
      permissions: (user as any)?.permissions ?? [],
      employeeProfile: (user as any)?.employeeId
        ? ((user as any)?.employment ?? null)
        : null,
    };
  }

  async logout(payload: { refreshToken?: string; ip: string }) {
    if (!payload.refreshToken) {
      return { ok: true };
    }
    const parsed = this.parseRefreshToken(payload.refreshToken);
    const doc = await this.refreshModel.findOne({ jti: parsed.jti });
    await this.refreshModel.updateOne(
      { jti: parsed.jti },
      { $set: { revokedAt: new Date() } },
    );
    if (doc?.userId) {
      await this.revokeAccessTokens(doc.userId);
      await this.usersService.bumpTokenVersion(doc.userId);
    }
    return { ok: true };
  }

  async me(payload: { userId: string }) {
    const user = await this.usersService.findByIdOrEmployeeNumber({
      id: payload.userId,
    });
    if (!user) {
      throw new Error('usuario no encontrado');
    }
    return {
      user,
      roles: (user as any)?.roles ?? ['user'],
      permissions: (user as any)?.permissions ?? [],
      employeeProfile: (user as any)?.employeeId
        ? ((user as any)?.employment ?? null)
        : null,
    };
  }

  async signup(payload: { email: string; name: string; password: string }) {
    if (!payload.email || !payload.name || !payload.password) {
      throw new Error('datos incompletos');
    }
    const existing = await this.usersService.findByEmail(payload.email, false);
    if (existing) {
      throw new Error('el email ya está registrado');
    }
    const created = await this.usersService.create({
      status: 'active',
      email: payload.email,
      password: payload.password,
      roles: ['owner'],
      personal: {
        legalName: {
          firstName: payload.name,
          lastName: '',
        },
        preferredName: payload.name,
      },
      contact: {
        emails: [
          {
            type: 'primary',
            value: payload.email,
            isPrimary: true,
          },
        ],
      },
    });
    return {
      user: { id: String((created as any)._id), email: payload.email },
    };
  }

  async getTokenVersion(payload: { userId: string }) {
    const tokenVersion = await this.usersService.getTokenVersion(
      payload.userId,
    );
    return { tokenVersion };
  }

  async changePassword(payload: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }) {
    if (!payload.userId || !payload.currentPassword || !payload.newPassword) {
      throw new Error('datos incompletos');
    }
    const user = await this.usersService.findByIdWithPassword(payload.userId);
    if (!user) {
      throw new Error('usuario no encontrado');
    }
    const ok = await bcrypt.compare(
      payload.currentPassword,
      user.password || '',
    );
    if (!ok) {
      throw new Error('credenciales inválidas');
    }
    await this.usersService.update({
      _id: payload.userId,
      password: payload.newPassword,
    });
    await this.revokeAccessTokens(payload.userId);
    await this.usersService.bumpTokenVersion(payload.userId);
    await this.refreshModel.updateMany(
      { userId: String(payload.userId), revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } },
    );
    return { ok: true };
  }

  async listSessions(payload: { userId: string }) {
    if (!payload.userId) {
      throw new Error('usuario no encontrado');
    }
    const now = new Date();
    const activeDocs = await this.refreshModel
      .find({
        userId: String(payload.userId),
        revokedAt: { $exists: false },
        expiresAt: { $gt: now },
      })
      .sort({ createdAt: -1 })
      .limit(10);
    const recentDocs = await this.refreshModel
      .find({ userId: String(payload.userId) })
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      active: activeDocs.map((doc) => ({
        id: doc.jti,
        ip: doc.ip,
        createdAt: doc.createdAt?.toISOString?.() || '',
        expiresAt: doc.expiresAt?.toISOString?.() || '',
      })),
    };
  }

  async revokeSession(payload: { userId: string; sessionId: string }) {
    if (!payload.userId || !payload.sessionId) {
      throw new Error('datos incompletos');
    }
    const result = await this.refreshModel.updateOne(
      { userId: String(payload.userId), jti: payload.sessionId },
      { $set: { revokedAt: new Date() } },
    );
    if (result.matchedCount === 0) {
      throw new Error('sesión no encontrada');
    }
    await this.revokeAccessTokens(payload.userId);
    await this.usersService.bumpTokenVersion(payload.userId);
    return { ok: true };
  }

  async checkAccessToken(payload: {
    userId: string;
    jti: string;
    tokenHash: string;
  }) {
    const token = await this.accessModel.findOne({
      userId: String(payload.userId),
      jti: payload.jti,
      tokenHash: payload.tokenHash,
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });
    if (!token) {
      throw new Error('no autorizado');
    }
    return { ok: true };
  }

  private async findUserByEmail(email: string, includePassword = false) {
    return this.usersService.findByEmail(email, includePassword);
  }

  private async signAccessToken(user: any) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not set');
    }
    const jti = randomBytes(16).toString('hex');
    const payload: AuthUserPayload = {
      sub: String(user._id),
      email: user.email || this.getPrimaryEmail(user),
      tenantId: user.tenantId,
      roles: user.roles ?? ['user'],
      permissions: user.permissions ?? [],
      employeeId: user.employeeId,
      tokenVersion: user.tokenVersion ?? 0,
      jti,
    };
    const token = this.jwtService.sign(payload, {
      secret,
      expiresIn: this.accessTtl,
    });
    await this.accessModel.create({
      userId: String(user._id),
      jti,
      tokenHash: this.hashToken(token),
      expiresAt: new Date(Date.now() + this.accessTtlMs),
    });
    return token;
  }

  private getPrimaryEmail(user: any): string {
    const emails = user.contact?.emails || [];
    const primary = emails.find((e: any) => e.isPrimary) || emails[0];
    return primary?.value || '';
  }

  private generateRefreshToken() {
    const jti = randomBytes(16).toString('hex');
    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + this.refreshTtlMs);
    return {
      refreshToken: `${jti}.${token}`,
      jti,
      tokenHash,
      expiresAt,
    };
  }

  private parseRefreshToken(refreshToken: string) {
    const parts = refreshToken.split('.');
    if (parts.length !== 2) {
      throw new Error('no autorizado');
    }
    return { jti: parts[0], token: parts[1] };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async revokeAccessTokens(userId: string) {
    await this.accessModel.updateMany(
      { userId: String(userId), revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } },
    );
  }
}
