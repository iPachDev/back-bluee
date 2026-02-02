import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrganizationsService } from './organizations.service';
import { RmqRequest } from './common/response.interface';
import { normalizeRmqPayload } from './common/rmq.utils';

@Controller()
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @MessagePattern({ cmd: 'organizations.create' })
  create(
    @Payload()
    payload: RmqRequest<Record<string, unknown>> | Record<string, unknown>,
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.organizationsService.create(data);
  }

  @MessagePattern({ cmd: 'organizations.update' })
  update(
    @Payload()
    payload: RmqRequest<Record<string, unknown>> | Record<string, unknown>,
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.organizationsService.update(data);
  }

  @MessagePattern({ cmd: 'organizations.delete' })
  remove(
    @Payload()
    payload: RmqRequest<{ _id?: string }> | { _id?: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.organizationsService.removeById(data?._id ?? '');
  }

  @MessagePattern({ cmd: 'organizations.get' })
  get(
    @Payload()
    payload: RmqRequest<{ _id?: string }> | { _id?: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.organizationsService.findById(data?._id ?? '');
  }

  @MessagePattern({ cmd: 'organizations.list' })
  list(
    @Payload()
    payload: RmqRequest<Record<string, unknown>> | Record<string, unknown>,
  ) {
    return this.organizationsService.list();
  }

  @MessagePattern({ cmd: 'organizations.list-by-user' })
  listByUser(
    @Payload()
    payload: RmqRequest<{ userId?: string }> | { userId?: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.organizationsService.listByUserId(data?.userId ?? '');
  }
}
