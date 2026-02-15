import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JobApplicationsService } from './job-applications.service';
import { RmqRequest } from '../common/response.interface';
import { normalizeRmqPayload } from '../common/rmq.utils';

@Controller()
export class JobApplicationsController {
  constructor(private readonly jobApplicationsService: JobApplicationsService) {}

  @MessagePattern({ cmd: 'job-applications.create' })
  create(
    @Payload()
    payload: RmqRequest<Record<string, unknown>> | Record<string, unknown>,
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.jobApplicationsService.create(data);
  }

  @MessagePattern({ cmd: 'job-applications.update' })
  update(
    @Payload()
    payload: RmqRequest<Record<string, unknown>> | Record<string, unknown>,
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.jobApplicationsService.update(data);
  }

  @MessagePattern({ cmd: 'job-applications.delete' })
  remove(
    @Payload()
    payload:
      | RmqRequest<{ _id?: string; tenantId?: string }>
      | { _id?: string; tenantId?: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.jobApplicationsService.removeByIdAndTenant(
      data?._id ?? '',
      data?.tenantId ?? '',
    );
  }

  @MessagePattern({ cmd: 'job-applications.get' })
  getByTenant(
    @Payload()
    payload: RmqRequest<{ tenantId?: string }> | { tenantId?: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.jobApplicationsService.findByTenant(data?.tenantId ?? '');
  }
}
