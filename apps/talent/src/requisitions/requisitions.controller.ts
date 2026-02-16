import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequisitionsService } from './requisitions.service';
import { RmqRequest } from '../common/response.interface';
import { normalizeRmqPayload } from '../common/rmq.utils';
import {
  type CreateRequisitionDto,
  type UpdateRequisitionDto,
} from './dto/requisition.dto';

@Controller()
export class RequisitionsController {
  constructor(private readonly requisitionsService: RequisitionsService) {}

  @MessagePattern({ cmd: 'requisitions.create' })
  create(
    @Payload()
    payload: RmqRequest<CreateRequisitionDto> | CreateRequisitionDto,
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.requisitionsService.create(data);
  }

  @MessagePattern({ cmd: 'requisitions.update' })
  update(
    @Payload()
    payload: RmqRequest<UpdateRequisitionDto> | UpdateRequisitionDto,
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.requisitionsService.update(data);
  }

  @MessagePattern({ cmd: 'requisitions.delete' })
  remove(
    @Payload()
    payload: RmqRequest<{ _id?: string }> | { _id?: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.requisitionsService.removeById(data?._id ?? '');
  }

  @MessagePattern({ cmd: 'requisitions.get' })
  get(
    @Payload()
    payload: RmqRequest<{ _id?: string }> | { _id?: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.requisitionsService.findById(data?._id ?? '');
  }

  @MessagePattern({ cmd: 'requisitions.list' })
  list(
    @Payload()
    payload: RmqRequest<{ tenantId?: string }> | { tenantId?: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.requisitionsService.listByTenant(data?.tenantId ?? '');
  }
}
