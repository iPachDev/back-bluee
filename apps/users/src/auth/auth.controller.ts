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
}
