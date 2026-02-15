import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ResponseEnvelope, RmqRequest } from '../common/response.interface';

@Injectable()
export class JobApplicationsService {
  constructor(@Inject('TALENT_SERVICE') private readonly client: ClientProxy) {}

  create(payload: Record<string, unknown>, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send(
        { cmd: 'job-applications.create' },
        { data: payload, meta },
      ),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  update(payload: Record<string, unknown>, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send(
        { cmd: 'job-applications.update' },
        { data: payload, meta },
      ),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  remove(_id: string, tenantId: string, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send(
        { cmd: 'job-applications.delete' },
        { data: { _id, tenantId }, meta },
      ),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  getByTenant(tenantId: string, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send(
        { cmd: 'job-applications.get' },
        { data: { tenantId }, meta },
      ),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }
}
