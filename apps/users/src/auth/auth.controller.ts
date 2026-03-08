import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RmqRequest } from '../common/response.interface';
import { normalizeRmqPayload } from '../common/rmq.utils';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'auth.login' })
  login(
    @Payload()
    payload:
      | RmqRequest<{ email: string; password: string; ip: string }>
      | { email: string; password: string; ip: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.authService.login(data);
  }

  @MessagePattern({ cmd: 'auth.refresh' })
  refresh(
    @Payload()
    payload:
      | RmqRequest<{ refreshToken?: string; ip: string }>
      | { refreshToken?: string; ip: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.authService.refresh(data);
  }

  @MessagePattern({ cmd: 'auth.logout' })
  logout(
    @Payload()
    payload:
      | RmqRequest<{ refreshToken?: string; ip: string }>
      | { refreshToken?: string; ip: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.authService.logout(data);
  }

  @MessagePattern({ cmd: 'auth.me' })
  me(
    @Payload()
    payload: RmqRequest<{ userId: string }> | { userId: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.authService.me(data);
  }

  @MessagePattern({ cmd: 'auth.change-password' })
  changePassword(
    @Payload()
    payload:
      | RmqRequest<{
          userId: string;
          currentPassword: string;
          newPassword: string;
        }>
      | { userId: string; currentPassword: string; newPassword: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.authService.changePassword(data);
  }

  @MessagePattern({ cmd: 'auth.sessions' })
  sessions(
    @Payload()
    payload: RmqRequest<{ userId: string }> | { userId: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.authService.listSessions(data);
  }

  @MessagePattern({ cmd: 'auth.revoke-session' })
  revokeSession(
    @Payload()
    payload:
      | RmqRequest<{ userId: string; sessionId: string }>
      | { userId: string; sessionId: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.authService.revokeSession(data);
  }

  @MessagePattern({ cmd: 'auth.token-version' })
  tokenVersion(
    @Payload()
    payload: RmqRequest<{ userId: string }> | { userId: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.authService.getTokenVersion(data);
  }

  @MessagePattern({ cmd: 'auth.access-check' })
  accessCheck(
    @Payload()
    payload:
      | RmqRequest<{ userId: string; jti: string; tokenHash: string }>
      | { userId: string; jti: string; tokenHash: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.authService.checkAccessToken(data);
  }

  @MessagePattern({ cmd: 'auth.signup' })
  signup(
    @Payload()
    payload:
      | RmqRequest<{ email: string; name: string; password: string }>
      | { email: string; name: string; password: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.authService.signup(data);
  }

  @MessagePattern({ cmd: 'auth.signup-candidate' })
  signupCandidate(
    @Payload()
    payload:
      | RmqRequest<{
          email: string;
          name: string;
          password: string;
          tenantId: string;
        }>
      | {
          email: string;
          name: string;
          password: string;
          tenantId: string;
        },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.authService.signupCandidate(data);
  }

  @MessagePattern({ cmd: 'auth.update-candidate-profile' })
  updateCandidateProfile(
    @Payload()
    payload:
      | RmqRequest<{
          userId: string;
          personal?: Record<string, unknown>;
          candidateProfile?: Record<string, unknown>;
          cvData?: Record<string, unknown>;
        }>
      | {
          userId: string;
          personal?: Record<string, unknown>;
          candidateProfile?: Record<string, unknown>;
          cvData?: Record<string, unknown>;
        },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.authService.updateCandidateProfile(data);
  }

  @MessagePattern({ cmd: 'auth.candidate-applications' })
  candidateApplications(
    @Payload()
    payload: RmqRequest<{ userId: string }> | { userId: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.authService.listCandidateApplications(data);
  }
}
