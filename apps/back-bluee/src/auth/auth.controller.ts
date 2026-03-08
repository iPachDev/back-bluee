import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { TransactionRequest } from '../common/transaction.middleware';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Role } from './enums/role.enum';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private ensureCandidate(user: { roles?: string[] } | undefined) {
    const roles = user?.roles ?? [];
    if (!roles.includes(Role.Candidate)) {
      throw new Error('acceso solo para candidatos');
    }
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Req() req: TransactionRequest & Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    const result = await this.authService.login(
      { ...body, ip: req.ip },
      { transactionId, source: 'back-bluee' },
    );
    if (!result.headers?.isSuccess) {
      throw new Error(result.errors?.[0] || 'error inesperado');
    }
    this.setAuthCookies(
      res,
      result.data?.accessToken,
      result.data?.refreshToken,
    );
    return {
      data: {
        ok: true,
        data: {
          user: result.data?.user,
          tenantId: result.data?.tenantId,
        },
      },
      trace: result.headers?.trazability ?? [],
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req: TransactionRequest & Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    const refreshToken = req.cookies?.refresh_token;
    const result = await this.authService.refresh(
      { refreshToken, ip: req.ip },
      { transactionId, source: 'back-bluee' },
    );
    if (!result.headers?.isSuccess) {
      throw new Error(result.errors?.[0] || 'error inesperado');
    }
    this.setAuthCookies(
      res,
      result.data?.accessToken,
      result.data?.refreshToken,
    );
    return {
      data: { ok: true },
      trace: result.headers?.trazability ?? [],
    };
  }

  @Post('logout')
  async logout(
    @Req() req: TransactionRequest & Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    const refreshToken = req.cookies?.refresh_token;
    const result = await this.authService.logout(
      { refreshToken, ip: req.ip },
      { transactionId, source: 'back-bluee' },
    );
    if (!result.headers?.isSuccess) {
      throw new Error(result.errors?.[0] || 'error inesperado');
    }
    this.clearAuthCookies(res);
    return { data: { ok: true }, trace: result.headers?.trazability ?? [] };
  }

  @Post('signup')
  async signup(
    @Body() body: { email: string; name: string; password: string },
    @Req() req: TransactionRequest & Request,
  ) {
    const transactionId = req.transactionId;
    const result = await this.authService.signup(body, {
      transactionId,
      source: 'back-bluee',
    });
    if (!result.headers?.isSuccess) {
      throw new Error(result.errors?.[0] || 'error inesperado');
    }
    return {
      data: result.data ?? null,
      trace: result.headers?.trazability ?? [],
    };
  }

  @Post('jobs/signup')
  async jobsSignup(
    @Body() body: { email: string; name: string; password: string; tenantId: string },
    @Req() req: TransactionRequest & Request,
  ) {
    const transactionId = req.transactionId;
    const result = await this.authService.signupCandidate(body, {
      transactionId,
      source: 'back-bluee',
    });
    if (!result.headers?.isSuccess) {
      throw new Error(result.errors?.[0] || 'error inesperado');
    }
    return {
      data: result.data ?? null,
      trace: result.headers?.trazability ?? [],
    };
  }

  @Post('jobs/login')
  async jobsLogin(
    @Body() body: { email: string; password: string },
    @Req() req: TransactionRequest & Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    const result = await this.authService.login(
      { ...body, ip: req.ip },
      { transactionId, source: 'back-bluee' },
    );
    if (!result.headers?.isSuccess) {
      throw new Error(result.errors?.[0] || 'error inesperado');
    }
    const roles = result.data?.roles ?? [];
    if (!roles.includes(Role.Candidate)) {
      throw new Error('acceso solo para candidatos');
    }
    this.setAuthCookies(
      res,
      result.data?.accessToken,
      result.data?.refreshToken,
    );
    return {
      data: {
        ok: true,
        data: {
          user: result.data?.user,
          tenantId: result.data?.tenantId,
          roles: result.data?.roles ?? [],
        },
      },
      trace: result.headers?.trazability ?? [],
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() body: { currentPassword: string; newPassword: string },
    @Req() req: TransactionRequest & Request & { user?: { sub: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    const userId = req.user?.sub ?? '';
    const result = await this.authService.changePassword(
      { userId, ...body },
      { transactionId, source: 'back-bluee' },
    );
    if (!result.headers?.isSuccess) {
      throw new Error(result.errors?.[0] || 'error inesperado');
    }
    res.clearCookie('refresh_token', this.cookieOptions());
    return { data: { ok: true }, trace: result.headers?.trazability ?? [] };
  }

  @Get('sessions')
  @Roles(Role.Owner, Role.HumanResource)
  @UseGuards(JwtAuthGuard)
  async sessions(
    @Req() req: TransactionRequest & Request & { user?: { sub: string } },
  ) {
    const transactionId = req.transactionId;
    const userId = req.user?.sub ?? '';
    const result = await this.authService.listSessions(
      { userId },
      { transactionId, source: 'back-bluee' },
    );
    if (!result.headers?.isSuccess) {
      throw new Error(result.errors?.[0] || 'error inesperado');
    }
    return {
      data: result.data ?? null,
      trace: result.headers?.trazability ?? [],
    };
  }

  @Post('sessions/revoke')
  @UseGuards(JwtAuthGuard)
  async revokeSession(
    @Body() body: { sessionId: string },
    @Req() req: TransactionRequest & Request & { user?: { sub: string } },
  ) {
    const transactionId = req.transactionId;
    const userId = req.user?.sub ?? '';
    const result = await this.authService.revokeSession(
      { userId, sessionId: body.sessionId },
      { transactionId, source: 'back-bluee' },
    );
    if (!result.headers?.isSuccess) {
      throw new Error(result.errors?.[0] || 'error inesperado');
    }
    return { data: { ok: true }, trace: result.headers?.trazability ?? [] };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(
    @Req() req: TransactionRequest & Request & { user?: { sub: string } },
  ) {
    const transactionId = req.transactionId;
    const userId = req.user?.sub ?? '';
    const result = await this.authService.me(
      { userId },
      { transactionId, source: 'back-bluee' },
    );
    if (!result.headers?.isSuccess) {
      throw new Error(result.errors?.[0] || 'error inesperado');
    }
    return {
      data: result.data ?? null,
      trace: result.headers?.trazability ?? [],
    };
  }

  @Get('jobs/me')
  @UseGuards(JwtAuthGuard)
  async jobsMe(
    @Req() req: TransactionRequest & Request & { user?: { sub: string; roles?: string[] } },
  ) {
    this.ensureCandidate(req.user);
    const transactionId = req.transactionId;
    const userId = req.user?.sub ?? '';
    const result = await this.authService.me(
      { userId },
      { transactionId, source: 'back-bluee' },
    );
    if (!result.headers?.isSuccess) {
      throw new Error(result.errors?.[0] || 'error inesperado');
    }
    return {
      data: result.data ?? null,
      trace: result.headers?.trazability ?? [],
    };
  }

  @Put('jobs/profile')
  @UseGuards(JwtAuthGuard)
  async updateJobsProfile(
    @Body()
    body: {
      personal?: Record<string, unknown>;
      candidateProfile?: Record<string, unknown>;
      cvData?: Record<string, unknown>;
    },
    @Req() req: TransactionRequest & Request & { user?: { sub: string; roles?: string[] } },
  ) {
    this.ensureCandidate(req.user);
    const transactionId = req.transactionId;
    const userId = req.user?.sub ?? '';
    const result = await this.authService.updateCandidateProfile(
      { userId, ...body },
      { transactionId, source: 'back-bluee' },
    );
    if (!result.headers?.isSuccess) {
      throw new Error(result.errors?.[0] || 'error inesperado');
    }
    return {
      data: result.data ?? null,
      trace: result.headers?.trazability ?? [],
    };
  }

  @Get('jobs/applications')
  @UseGuards(JwtAuthGuard)
  async jobsApplications(
    @Req() req: TransactionRequest & Request & { user?: { sub: string; roles?: string[] } },
  ) {
    this.ensureCandidate(req.user);
    const transactionId = req.transactionId;
    const userId = req.user?.sub ?? '';
    const result = await this.authService.listCandidateApplications(
      { userId },
      { transactionId, source: 'back-bluee' },
    );
    if (!result.headers?.isSuccess) {
      throw new Error(result.errors?.[0] || 'error inesperado');
    }
    return {
      data: result.data ?? null,
      trace: result.headers?.trazability ?? [],
    };
  }

  private cookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    const sameSite = (process.env.COOKIE_SAMESITE || 'lax') as
      | 'lax'
      | 'strict'
      | 'none';
    const domain = process.env.COOKIE_DOMAIN || undefined;
    return {
      httpOnly: true,
      secure: isProd,
      sameSite,
      path: '/',
      domain,
    };
  }

  private setAuthCookies(
    res: Response,
    accessToken?: string,
    refreshToken?: string,
  ) {
    const options = this.cookieOptions();
    if (accessToken) {
      res.cookie('access_token', accessToken, options);
    }
    if (refreshToken) {
      res.cookie('refresh_token', refreshToken, options);
    }
  }

  private clearAuthCookies(res: Response) {
    const options = this.cookieOptions();
    res.clearCookie('access_token', options);
    res.clearCookie('refresh_token', options);
  }
}
