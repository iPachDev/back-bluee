import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AddContactDto,
  AddNoteDto,
  ApplicationListFiltersDto,
  CreateApplicationDto,
  UpdateStatusDto,
} from './dto/candidates.dto';
import { APPLICATION_STATUSES } from './dto/application.enums';
import {
  CandidateApplication,
  CandidateApplicationDocument,
} from './schemas/candidate-application.schema';
import { Requisition, RequisitionDocument } from '../requisitions/schemas/requisition.schema';

const STATUS_ORDER: Record<(typeof APPLICATION_STATUSES)[number], number> = {
  applied: 0,
  screening: 1,
  contacted: 2,
  hr_interview: 3,
  technical_interview: 4,
  final_interview: 5,
  offer_sent: 6,
  hired: 7,
  rejected: 8,
};

@Injectable()
export class CandidatesService {
  constructor(
    @InjectModel(CandidateApplication.name)
    private readonly candidateApplicationModel: Model<CandidateApplicationDocument>,
    @InjectModel(Requisition.name)
    private readonly requisitionModel: Model<RequisitionDocument>,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  private ensureObjectId(value: string, field: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw new Error(`${field} inválido`);
    }
    return new Types.ObjectId(value);
  }

  private ensureTransition(currentStatus: string, nextStatus: string) {
    if (currentStatus === 'rejected') {
      throw new Error('la aplicación está rechazada y no permite más cambios');
    }
    if (nextStatus === 'hired' && currentStatus !== 'offer_sent') {
      throw new Error('no se puede pasar a hired sin pasar por offer_sent');
    }

    const currentOrder = STATUS_ORDER[currentStatus as keyof typeof STATUS_ORDER];
    const nextOrder = STATUS_ORDER[nextStatus as keyof typeof STATUS_ORDER];
    if (nextOrder < currentOrder && nextStatus !== 'rejected') {
      throw new Error(`transición inválida: ${currentStatus} -> ${nextStatus}`);
    }
  }

  async create(payload: CreateApplicationDto, actorId: string) {
    const tenantId = payload.tenantId?.trim();
    if (!tenantId) throw new Error('tenantId requerido');

    const requisitionId = this.ensureObjectId(payload.requisitionId, 'requisitionId');
    const candidateId = this.ensureObjectId(payload.candidateId, 'candidateId');
    const recruiterId = payload.recruiterId
      ? this.ensureObjectId(payload.recruiterId, 'recruiterId')
      : undefined;

    const existing = await this.candidateApplicationModel.findOne({
      tenantId,
      requisitionId,
      candidateId,
    });
    if (existing) {
      if (existing.status === 'rejected') {
        throw new Error('la postulación fue rechazada y no puede reaplicarse');
      }
      return existing;
    }

    const now = new Date().toISOString();
    return this.candidateApplicationModel.create({
      tenantId,
      requisitionId,
      candidateId,
      userId: String(candidateId),
      recruiterId,
      status: 'applied',
      stageHistory: [
        {
          fromStatus: 'applied',
          toStatus: 'applied',
          changedAt: now,
          changedBy: actorId || String(candidateId),
          note: payload.note,
        },
      ],
      notes: payload.note
        ? [
            {
              text: payload.note,
              createdAt: now,
              createdBy: actorId || String(candidateId),
              visibility: 'internal',
            },
          ]
        : [],
      contacts: [],
    });
  }

  async findById(id: string) {
    const _id = this.ensureObjectId(id, 'applicationId');
    const item = await this.candidateApplicationModel.findById(_id);
    if (!item) throw new Error('aplicación no encontrada');
    return item;
  }

  async list(filters: ApplicationListFiltersDto) {
    const tenantId = filters.tenantId?.trim();
    if (!tenantId) throw new Error('tenantId requerido');

    const page = Math.max(1, Number(filters.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(filters.limit ?? 10)));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { tenantId };

    if (filters.jobId) {
      query.requisitionId = this.ensureObjectId(filters.jobId, 'jobId');
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.recruiterId) {
      query.recruiterId = this.ensureObjectId(filters.recruiterId, 'recruiterId');
    }
    if (filters.candidateId) {
      query.candidateId = this.ensureObjectId(filters.candidateId, 'candidateId');
    }

    const [items, total] = await Promise.all([
      this.candidateApplicationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.candidateApplicationModel.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async updateStatus(
    id: string,
    payload: UpdateStatusDto,
    actorId: string,
  ) {
    const item = await this.findById(id);
    this.ensureTransition(item.status, payload.status);

    if (payload.status === 'rejected' && !payload.rejectionReason?.reasonCategory) {
      throw new Error('reasonCategory es requerido cuando status=rejected');
    }

    const now = new Date().toISOString();
    item.stageHistory = [
      ...(item.stageHistory ?? []),
      {
        fromStatus: item.status,
        toStatus: payload.status,
        fromSubStatus: item.subStatus,
        toSubStatus: payload.subStatus,
        changedAt: now,
        changedBy: actorId,
        note: payload.note,
      },
    ];

    const previousStatus = item.status;
    item.status = payload.status;
    item.subStatus = payload.subStatus;

    if (payload.rejectionReason) {
      item.rejectionReason = payload.rejectionReason as unknown as Record<string, unknown>;
    }

    if (payload.note) {
      item.notes = [
        ...(item.notes ?? []),
        {
          text: payload.note,
          createdAt: now,
          createdBy: actorId,
          visibility: 'internal',
        },
      ];
    }

    await item.save();

    if (payload.status === 'hired' && previousStatus !== 'hired') {
      const requisition = await this.requisitionModel.findById(item.requisitionId);
      if (requisition?.position && typeof requisition.position === 'object') {
        const current = Number((requisition.position as Record<string, unknown>).positionsOpen ?? 0);
        const next = Math.max(0, current - 1);
        const positionSnapshot = {
          title: String((requisition.position as Record<string, unknown>).title ?? ''),
          department: String((requisition.position as Record<string, unknown>).department ?? ''),
          area: String((requisition.position as Record<string, unknown>).area ?? ''),
          reportsTo: String((requisition.position as Record<string, unknown>).reportsTo ?? ''),
          requisitionId: String(requisition._id ?? ''),
          hiredAt: new Date().toISOString(),
        };
        requisition.position = {
          ...(requisition.position as Record<string, unknown>),
          positionsOpen: next,
        };
        if (next === 0) {
          requisition.status = 'closed';
        }
        await requisition.save();

        await firstValueFrom(
          this.usersClient.send(
            { cmd: 'users.promote-candidate' },
            { data: { userId: String(item.candidateId), position: positionSnapshot }, meta: { transactionId: '', source: 'talent' } },
          ),
        );
      }
    }

    return item;
  }

  async addNote(id: string, payload: AddNoteDto, actorId: string) {
    const item = await this.findById(id);
    if (item.status === 'rejected') {
      throw new Error('la aplicación está rechazada y no permite más cambios');
    }

    item.notes = [
      ...(item.notes ?? []),
      {
        text: payload.text,
        createdAt: new Date().toISOString(),
        createdBy: actorId,
        visibility: payload.visibility,
      },
    ];

    await item.save();
    return item;
  }

  async addContact(id: string, payload: AddContactDto, actorId: string) {
    const item = await this.findById(id);
    if (item.status === 'rejected') {
      throw new Error('la aplicación está rechazada y no permite más cambios');
    }

    item.contacts = [
      ...(item.contacts ?? []),
      {
        channel: payload.channel,
        to: payload.to,
        message: payload.message,
        outcome: payload.outcome,
        createdAt: new Date().toISOString(),
        createdBy: actorId,
      },
    ];

    await item.save();
    return item;
  }

  async reject(
    id: string,
    payload: {
      reasonCategory: 'we_rejected_them' | 'they_rejected_us' | 'none_specified';
      reasonCode: string;
      reasonText?: string;
      note?: string;
    },
    actorId: string,
  ) {
    return this.updateStatus(
      id,
      {
        status: 'rejected',
        note: payload.note,
        rejectionReason: {
          reasonCategory: payload.reasonCategory,
          reasonCode: payload.reasonCode,
          reasonText: payload.reasonText,
        },
      },
      actorId,
    );
  }

  async withdraw(id: string, actorId: string, note?: string) {
    const item = await this.findById(id);
    if (item.status === 'rejected') {
      return item;
    }
    return this.updateStatus(
      id,
      {
        status: 'rejected',
        subStatus: 'candidate_withdraw',
        note,
        rejectionReason: {
          reasonCategory: 'they_rejected_us',
          reasonCode: 'candidate_withdraw',
          reasonText: note,
        },
      },
      actorId,
    );
  }
}
