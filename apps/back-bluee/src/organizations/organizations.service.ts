import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ResponseEnvelope, RmqRequest } from '../common/response.interface';

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject('ORGANIZATIONS_SERVICE') private readonly client: ClientProxy,
  ) {}

  create(payload: Record<string, unknown>, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send({ cmd: 'organizations.create' }, { data: payload, meta }),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  update(payload: Record<string, unknown>, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send({ cmd: 'organizations.update' }, { data: payload, meta }),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  remove(_id: string, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send(
        { cmd: 'organizations.delete' },
        { data: { _id }, meta },
      ),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  getById(_id: string, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send(
        { cmd: 'organizations.get' },
        { data: { _id }, meta },
      ),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  list(meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send(
        { cmd: 'organizations.list' },
        { data: {}, meta },
      ),
    ) as Promise<ResponseEnvelope<Record<string, unknown>[]>>;
  }

  listByUserId(userId: string, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send(
        { cmd: 'organizations.list-by-user' },
        { data: { userId }, meta },
      ),
    ) as Promise<ResponseEnvelope<Record<string, unknown>[]>>;
  }
}
