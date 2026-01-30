import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ResponseEnvelope, RmqRequest } from '../common/response.interface';

@Injectable()
export class UsersService {
  constructor(@Inject('USERS_SERVICE') private readonly client: ClientProxy) {}

  create(payload: Record<string, unknown>, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send({ cmd: 'users.create' }, { data: payload, meta }),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  update(payload: Record<string, unknown>, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send({ cmd: 'users.update' }, { data: payload, meta }),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  remove(_id: string, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send({ cmd: 'users.delete' }, { data: { _id }, meta }),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  find(
    params: { _id?: string; employeeNumber?: string },
    meta: RmqRequest<unknown>['meta'],
  ) {
    return firstValueFrom(
      this.client.send({ cmd: 'users.get' }, { data: params, meta }),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }
}
