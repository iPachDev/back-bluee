import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ResponseEnvelope, RmqRequest } from '../common/response.interface';
import {
  type CreateRequisitionDto,
  type JobRequisitionDto,
  type UpdateRequisitionDto,
} from './dto/requisition.dto';
import {
  type RequisitionApplicationDto,
  type RequisitionApplicationsPageDto,
} from './dto/requisition-application.dto';

@Injectable()
export class RequisitionsService {
  constructor(@Inject('TALENT_SERVICE') private readonly client: ClientProxy) {}

  private isPublishedOnSiteWeb(item: JobRequisitionDto) {
    if (item.status !== 'recruiting') return false;
    return Boolean(
      item.publications?.some(
        (publication) =>
          publication.channel === 'site_web' && Boolean(publication.publishedAt),
      ),
    );
  }

  create(
    payload: CreateRequisitionDto,
    meta: RmqRequest<unknown>['meta'],
  ) {
    return firstValueFrom(
      this.client.send({ cmd: 'requisitions.create' }, { data: payload, meta }),
    ) as Promise<ResponseEnvelope<JobRequisitionDto>>;
  }

  update(
    payload: UpdateRequisitionDto,
    meta: RmqRequest<unknown>['meta'],
  ) {
    return firstValueFrom(
      this.client.send({ cmd: 'requisitions.update' }, { data: payload, meta }),
    ) as Promise<ResponseEnvelope<JobRequisitionDto>>;
  }

  remove(_id: string, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send({ cmd: 'requisitions.delete' }, { data: { _id }, meta }),
    ) as Promise<ResponseEnvelope<JobRequisitionDto>>;
  }

  getById(_id: string, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send({ cmd: 'requisitions.get' }, { data: { _id }, meta }),
    ) as Promise<ResponseEnvelope<JobRequisitionDto>>;
  }

  listByTenant(tenantId: string, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send(
        { cmd: 'requisitions.list' },
        { data: { tenantId }, meta },
      ),
    ) as Promise<ResponseEnvelope<JobRequisitionDto[]>>;
  }

  async listPublicByTenant(
    tenantId: string,
    meta: RmqRequest<unknown>['meta'],
  ): Promise<ResponseEnvelope<JobRequisitionDto[]>> {
    const response = await this.listByTenant(tenantId, meta);
    if (!response.headers.isSuccess || !response.data) {
      return response;
    }

    return {
      ...response,
      data: response.data.filter((item) => this.isPublishedOnSiteWeb(item)),
    };
  }

  async getPublicById(
    _id: string,
    tenantId: string,
    meta: RmqRequest<unknown>['meta'],
  ): Promise<ResponseEnvelope<JobRequisitionDto>> {
    const response = await this.getById(_id, meta);
    if (!response.headers.isSuccess || !response.data) {
      return response;
    }

    const item = response.data;
    if (item.tenantId !== tenantId || !this.isPublishedOnSiteWeb(item)) {
      return {
        ...response,
        headers: {
          ...response.headers,
          isSuccess: false,
          statusCode: 404,
        },
        data: null,
        errors: ['vacante pública no encontrada'],
      };
    }

    return response;
  }

  applyToRequisition(
    payload: {
      tenantId: string;
      requisitionId: string;
      userId: string;
      candidateName?: string;
      candidateEmail?: string;
      source?: 'site_web';
    },
    meta: RmqRequest<unknown>['meta'],
  ) {
    return firstValueFrom(
      this.client.send({ cmd: 'requisitions.apply' }, { data: payload, meta }),
    ) as Promise<ResponseEnvelope<RequisitionApplicationDto>>;
  }

  getMyApplication(
    payload: { tenantId: string; requisitionId: string; userId: string },
    meta: RmqRequest<unknown>['meta'],
  ) {
    return firstValueFrom(
      this.client.send(
        { cmd: 'requisitions.application.by-user' },
        { data: payload, meta },
      ),
    ) as Promise<ResponseEnvelope<RequisitionApplicationDto | null>>;
  }

  listApplicationsByRequisition(
    payload: { tenantId: string; requisitionId: string; page?: number; limit?: number },
    meta: RmqRequest<unknown>['meta'],
  ) {
    return firstValueFrom(
      this.client.send(
        { cmd: 'requisitions.applications.by-requisition' },
        { data: payload, meta },
      ),
    ) as Promise<ResponseEnvelope<RequisitionApplicationsPageDto>>;
  }

  listApplicationsByUser(
    payload: { tenantId: string; userId: string; page?: number; limit?: number },
    meta: RmqRequest<unknown>['meta'],
  ) {
    return firstValueFrom(
      this.client.send(
        { cmd: 'requisitions.applications.by-user' },
        { data: payload, meta },
      ),
    ) as Promise<ResponseEnvelope<RequisitionApplicationsPageDto>>;
  }

  getMetrics(
    payload: { tenantId: string; requisitionId: string },
    meta: RmqRequest<unknown>['meta'],
  ) {
    return firstValueFrom(
      this.client.send({ cmd: 'requisitions.metrics' }, { data: payload, meta }),
    ) as Promise<ResponseEnvelope<{ totalCandidates: number }>>;
  }

}

