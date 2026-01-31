import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ResponseEnvelope, RmqRequest } from '../common/response.interface';

@Injectable()
export class RequisitionsService {
  constructor(@Inject('TALENT_SERVICE') private readonly client: ClientProxy) {}

  create(payload: Record<string, unknown>, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send({ cmd: 'requisitions.create' }, { data: payload, meta }),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  update(payload: Record<string, unknown>, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send({ cmd: 'requisitions.update' }, { data: payload, meta }),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  remove(_id: string, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send({ cmd: 'requisitions.delete' }, { data: { _id }, meta }),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  getById(_id: string, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send({ cmd: 'requisitions.get' }, { data: { _id }, meta }),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  listByTenant(tenantId: string, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send(
        { cmd: 'requisitions.list' },
        { data: { tenantId }, meta },
      ),
    ) as Promise<ResponseEnvelope<Record<string, unknown>[]>>;
  }
}
