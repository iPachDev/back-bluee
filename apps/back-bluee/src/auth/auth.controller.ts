import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { ResponseEnvelope } from '../common/response.interface';
import { TransactionRequest } from '../common/transaction.middleware';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Req() req: TransactionRequest & Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, async () => {
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
    });
  }

  @Post('refresh')
  async refresh(
    @Req() req: TransactionRequest & Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, async () => {
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
    });
  }

  @Post('logout')
  async logout(
    @Req() req: TransactionRequest & Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, async () => {
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
    });
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() body: { currentPassword: string; newPassword: string },
    @Req() req: TransactionRequest & Request & { user?: { sub: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, async () => {
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
    });
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async sessions(
    @Req() req: TransactionRequest & Request & { user?: { sub: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, async () => {
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
    });
  }

  @Post('sessions/revoke')
  @UseGuards(JwtAuthGuard)
  async revokeSession(
    @Body() body: { sessionId: string },
    @Req() req: TransactionRequest & Request & { user?: { sub: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, async () => {
      const userId = req.user?.sub ?? '';
      const result = await this.authService.revokeSession(
        { userId, sessionId: body.sessionId },
        { transactionId, source: 'back-bluee' },
      );
      if (!result.headers?.isSuccess) {
        throw new Error(result.errors?.[0] || 'error inesperado');
      }
      return { data: { ok: true }, trace: result.headers?.trazability ?? [] };
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(
    @Req() req: TransactionRequest & Request & { user?: { sub: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, async () => {
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
    });
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

  private async handleResponse<T>(
    res: Response,
    transactionId: string,
    action: () => Promise<{ data: T; trace?: any[] }>,
  ): Promise<ResponseEnvelope<T>> {
    const start = new Date().toISOString();
    try {
      const result = await action();
      const end = new Date().toISOString();
      const statusCode = 200;
      res.status(statusCode);
      const trace = result.trace ?? [];
      trace.push({
        from: 'client',
        to: 'back-bluee',
        timestart: start,
        timeend: end,
        signature: 'back-bluee',
      });
      return {
        headers: {
          transactionId,
          isSuccess: true,
          statusCode,
          trazability: trace,
        },
        data: result.data ?? null,
        errors: [],
      };
    } catch (error) {
      const end = new Date().toISOString();
      const message = this.normalizeError(error);
      const statusCode = this.mapErrorToStatus(message);
      res.status(statusCode);
      return {
        headers: {
          transactionId,
          isSuccess: false,
          statusCode,
          trazability: [
            {
              from: 'client',
              to: 'back-bluee',
              timestart: start,
              timeend: end,
              signature: 'back-bluee',
            },
          ],
        },
        data: null,
        errors: [message],
      };
    }
  }

  private mapErrorToStatus(message: string): number {
    if (message.includes('demasiadas solicitudes')) {
      return 429;
    }
    if (message.includes('no autorizado') || message.includes('credenciales')) {
      return 401;
    }
    if (message.includes('no encontrado')) {
      return 404;
    }
    return 400;
  }

  private normalizeError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'error inesperado';
  }
}
