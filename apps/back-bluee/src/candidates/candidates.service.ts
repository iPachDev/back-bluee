import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RmqRequest, ResponseEnvelope } from '../common/response.interface';
import { AddContactDto } from './dto/add-contact.dto';
import { AddNoteDto } from './dto/add-note.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import {
  RejectApplicationDto,
  UpdateStatusDto,
  WithdrawApplicationDto,
} from './dto/update-status.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';

@Injectable()
export class CandidatesService {
  constructor(@Inject('TALENT_SERVICE') private readonly client: ClientProxy) {}

  create(data: CreateApplicationDto, actorId: string, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send(
        { cmd: 'applications.create' },
        { data: { data, actorId }, meta },
      ),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  get(id: string, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send({ cmd: 'applications.get' }, { data: { id }, meta }),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  list(filters: QueryApplicationsDto, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send({ cmd: 'applications.list' }, { data: filters, meta }),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  updateStatus(
    id: string,
    data: UpdateStatusDto,
    actorId: string,
    meta: RmqRequest<unknown>['meta'],
  ) {
    return (async () => {
      const result = (await firstValueFrom(
        this.client.send(
          { cmd: 'applications.update-status' },
          { data: { id, data, actorId }, meta },
        ),
      )) as ResponseEnvelope<Record<string, unknown>>;

      return result;
    })();
  }

  addNote(id: string, data: AddNoteDto, actorId: string, meta: RmqRequest<unknown>['meta']) {
    return firstValueFrom(
      this.client.send(
        { cmd: 'applications.add-note' },
        { data: { id, data, actorId }, meta },
      ),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  addContact(
    id: string,
    data: AddContactDto,
    actorId: string,
    meta: RmqRequest<unknown>['meta'],
  ) {
    return firstValueFrom(
      this.client.send(
        { cmd: 'applications.add-contact' },
        { data: { id, data, actorId }, meta },
      ),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  reject(
    id: string,
    data: RejectApplicationDto,
    actorId: string,
    meta: RmqRequest<unknown>['meta'],
  ) {
    return firstValueFrom(
      this.client.send(
        { cmd: 'applications.reject' },
        { data: { id, data, actorId }, meta },
      ),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }

  withdraw(
    id: string,
    data: WithdrawApplicationDto,
    actorId: string,
    meta: RmqRequest<unknown>['meta'],
  ) {
    return firstValueFrom(
      this.client.send(
        { cmd: 'applications.withdraw' },
        { data: { id, ...data, actorId }, meta },
      ),
    ) as Promise<ResponseEnvelope<Record<string, unknown>>>;
  }
}
