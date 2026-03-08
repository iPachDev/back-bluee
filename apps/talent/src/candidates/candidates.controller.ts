import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { normalizeRmqPayload } from '../common/rmq.utils';
import { RmqRequest } from '../common/response.interface';
import { CandidatesService } from './candidates.service';
import {
  AddContactDto,
  AddNoteDto,
  ApplicationListFiltersDto,
  CreateApplicationDto,
  UpdateStatusDto,
} from './dto/candidates.dto';

@Controller()
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @MessagePattern({ cmd: 'applications.create' })
  create(
    @Payload()
    payload:
      | RmqRequest<{ data: CreateApplicationDto; actorId: string }>
      | { data: CreateApplicationDto; actorId: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.candidatesService.create(data.data, data.actorId);
  }

  @MessagePattern({ cmd: 'applications.get' })
  get(
    @Payload()
    payload: RmqRequest<{ id: string }> | { id: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.candidatesService.findById(data.id);
  }

  @MessagePattern({ cmd: 'applications.list' })
  list(
    @Payload()
    payload: RmqRequest<ApplicationListFiltersDto> | ApplicationListFiltersDto,
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.candidatesService.list(data);
  }

  @MessagePattern({ cmd: 'applications.update-status' })
  updateStatus(
    @Payload()
    payload:
      | RmqRequest<{ id: string; data: UpdateStatusDto; actorId: string }>
      | { id: string; data: UpdateStatusDto; actorId: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.candidatesService.updateStatus(data.id, data.data, data.actorId);
  }

  @MessagePattern({ cmd: 'applications.add-note' })
  addNote(
    @Payload()
    payload:
      | RmqRequest<{ id: string; data: AddNoteDto; actorId: string }>
      | { id: string; data: AddNoteDto; actorId: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.candidatesService.addNote(data.id, data.data, data.actorId);
  }

  @MessagePattern({ cmd: 'applications.add-contact' })
  addContact(
    @Payload()
    payload:
      | RmqRequest<{ id: string; data: AddContactDto; actorId: string }>
      | { id: string; data: AddContactDto; actorId: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.candidatesService.addContact(data.id, data.data, data.actorId);
  }

  @MessagePattern({ cmd: 'applications.reject' })
  reject(
    @Payload()
    payload:
      | RmqRequest<{
          id: string;
          data: {
            reasonCategory: 'we_rejected_them' | 'they_rejected_us' | 'none_specified';
            reasonCode: string;
            reasonText?: string;
            note?: string;
          };
          actorId: string;
        }>
      | {
          id: string;
          data: {
            reasonCategory: 'we_rejected_them' | 'they_rejected_us' | 'none_specified';
            reasonCode: string;
            reasonText?: string;
            note?: string;
          };
          actorId: string;
        },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.candidatesService.reject(data.id, data.data, data.actorId);
  }

  @MessagePattern({ cmd: 'applications.withdraw' })
  withdraw(
    @Payload()
    payload:
      | RmqRequest<{ id: string; note?: string; actorId: string }>
      | { id: string; note?: string; actorId: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.candidatesService.withdraw(data.id, data.actorId, data.note);
  }
}
