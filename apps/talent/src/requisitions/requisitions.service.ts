import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Requisition, RequisitionDocument } from './schemas/requisition.schema';
import {
  APPROVAL_THREAD_ACTIONS,
  APPROVAL_STATUSES,
  REQUISITION_PUBLIC_STATUSES,
  type CreateRequisitionDto,
  type JobRequisitionDto,
  type RequisitionPublicStatus,
  type UpdateRequisitionDto,
} from './dto/requisition.dto';

const STATUS_ORDER: Record<RequisitionPublicStatus, number> = {
  draft: 0,
  submitted: 1,
  approved: 2,
  recruiting: 3,
  closed: 4,
};

function isPublicStatus(value: unknown): value is RequisitionPublicStatus {
  return (
    typeof value === 'string' &&
    (REQUISITION_PUBLIC_STATUSES as readonly string[]).includes(value)
  );
}

type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];
type ApprovalThreadAction = (typeof APPROVAL_THREAD_ACTIONS)[number];
type ApprovalItem = JobRequisitionDto['approvalFlow']['approvals'][number];
type ApprovalThreadItem = JobRequisitionDto['approvalFlow']['conversationThread'][number];
const LEGACY_APPROVER_KEYS = new Set(['direct_manager', 'hr', 'finance']);

function isApprovalStatus(value: unknown): value is ApprovalStatus {
  return (
    typeof value === 'string' &&
    (APPROVAL_STATUSES as readonly string[]).includes(value)
  );
}

function isThreadAction(value: unknown): value is ApprovalThreadAction {
  return (
    typeof value === 'string' &&
    (APPROVAL_THREAD_ACTIONS as readonly string[]).includes(value)
  );
}

function isIsoDate(value: string) {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
}

function normalizeApprovalFlow(
  flow: JobRequisitionDto['approvalFlow'] | undefined,
): JobRequisitionDto['approvalFlow'] {
  const approvals: ApprovalItem[] = (flow?.approvals ?? [])
    .map((item) => {
      const legacy = item as ApprovalItem & { approvedAt?: string; status?: string };
      const legacyStatus = legacy.status as string | undefined;
      const normalizedStatus =
        legacyStatus === 'rejected' ? 'declined' : legacyStatus;
      return {
        approverUserId: (legacy.approverUserId ?? '').trim(),
        approverName: legacy.approverName?.trim() || undefined,
        status: isApprovalStatus(normalizedStatus)
          ? normalizedStatus
          : ('pending' as const),
        actedAt: legacy.actedAt ?? legacy.approvedAt,
        comment: legacy.comment?.trim() || undefined,
      };
    })
    .filter(
      (item) =>
        item.approverUserId && !LEGACY_APPROVER_KEYS.has(item.approverUserId),
    );

  const conversationThread: ApprovalThreadItem[] = (flow?.conversationThread ?? [])
    .map((item) => {
      const rawAction = item.action as string | undefined;
      const normalizedAction = rawAction === 'rejected' ? 'declined' : rawAction;
      return {
        approverUserId: (item.approverUserId ?? '').trim(),
        approverName: item.approverName?.trim() || undefined,
        action: isApprovalStatus(normalizedAction)
          ? normalizedAction
          : isThreadAction(normalizedAction)
          ? normalizedAction
          : ('pending' as const),
        comment: (item.comment ?? '').trim(),
        createdAt: item.createdAt,
        likes: (item.likes ?? [])
          .map((like) => ({
            userId: (like.userId ?? '').trim(),
            userName: like.userName?.trim() || undefined,
          }))
          .filter((like) => like.userId)
          .filter(
            (like, index, arr) =>
              arr.findIndex((entry) => entry.userId === like.userId) === index,
          ),
      };
    })
    .filter((item) => item.approverUserId);

  return {
    requestedBy: (flow?.requestedBy ?? '').trim(),
    approvals,
    conversationThread,
  };
}

function validateApprovalFlow(flow: JobRequisitionDto['approvalFlow']) {
  if (!flow.requestedBy) {
    throw new Error('approvalFlow.requestedBy es requerido');
  }

  if (!flow.approvals.length) {
    throw new Error('approvalFlow.approvals requiere al menos un aprobador');
  }

  const approverIds = flow.approvals.map((item) => item.approverUserId);
  if (new Set(approverIds).size !== approverIds.length) {
    throw new Error('approvalFlow.approvals contiene aprobadores duplicados');
  }

  flow.approvals.forEach((item) => {
    if (!item.approverUserId) {
      throw new Error('approvalFlow.approvals.approverUserId es requerido');
    }

    if (!isApprovalStatus(item.status)) {
      throw new Error('approvalFlow.approvals.status inválido');
    }

    if (item.status !== 'pending') {
      if (!item.comment) {
        throw new Error('cada acción de aprobación requiere comentario');
      }
      if (!item.actedAt || !isIsoDate(item.actedAt)) {
        throw new Error('cada acción de aprobación requiere fecha ISO válida');
      }
    }
  });

  flow.conversationThread.forEach((item) => {
    if (!item.approverUserId) {
      throw new Error('approvalFlow.conversationThread.approverUserId es requerido');
    }
    if (!isThreadAction(item.action)) {
      throw new Error('approvalFlow.conversationThread.action inválido');
    }
    if (!item.comment) {
      throw new Error('approvalFlow.conversationThread.comment es requerido');
    }
    if (!item.createdAt || !isIsoDate(item.createdAt)) {
      throw new Error('approvalFlow.conversationThread.createdAt debe ser fecha ISO válida');
    }
    const likeIds = (item.likes ?? []).map((like) => like.userId);
    if (new Set(likeIds).size !== likeIds.length) {
      throw new Error('approvalFlow.conversationThread.likes contiene usuarios duplicados');
    }
  });
}

function isLikesOnlyThreadUpdate(
  currentFlow: JobRequisitionDto['approvalFlow'],
  nextFlow: JobRequisitionDto['approvalFlow'],
) {
  if (currentFlow.conversationThread.length !== nextFlow.conversationThread.length) {
    return false;
  }

  return nextFlow.conversationThread.every((item, index) => {
    const currentItem = currentFlow.conversationThread[index];
    if (!currentItem) return false;
    const sameBase =
      currentItem.approverUserId === item.approverUserId &&
      (currentItem.approverName ?? '') === (item.approverName ?? '') &&
      currentItem.action === item.action &&
      currentItem.comment === item.comment &&
      currentItem.createdAt === item.createdAt;
    if (!sameBase) return false;
    return true;
  });
}

function appendMissingThreadEvents(
  currentFlow: JobRequisitionDto['approvalFlow'],
  nextFlow: JobRequisitionDto['approvalFlow'],
): JobRequisitionDto['approvalFlow'] {
  const thread = [...(nextFlow.conversationThread ?? [])];
  const hasEvent = (item: {
    approverUserId: string;
    action: string;
    comment: string;
    createdAt: string;
  }) =>
    thread.some(
      (event) =>
        event.approverUserId === item.approverUserId &&
        event.action === item.action &&
        event.comment === item.comment &&
        event.createdAt === item.createdAt,
    );

  nextFlow.approvals.forEach((nextApproval) => {
    const currentApproval = currentFlow.approvals.find(
      (item) => item.approverUserId === nextApproval.approverUserId,
    );
    const changed =
      !currentApproval ||
      currentApproval.status !== nextApproval.status ||
      (currentApproval.comment ?? '') !== (nextApproval.comment ?? '') ||
      (currentApproval.actedAt ?? '') !== (nextApproval.actedAt ?? '');

    if (!changed) return;
    if (nextApproval.status === 'pending') return;
    if (!nextApproval.comment || !nextApproval.actedAt) return;

    const event = {
      approverUserId: nextApproval.approverUserId,
      approverName: nextApproval.approverName,
      action: nextApproval.status,
      comment: nextApproval.comment,
      createdAt: nextApproval.actedAt,
    };
    if (!hasEvent(event)) {
      thread.push(event);
    }
  });

  return {
    ...nextFlow,
    conversationThread: thread,
  };
}

@Injectable()
export class RequisitionsService {
  constructor(
    @InjectModel(Requisition.name)
    private readonly requisitionModel: Model<RequisitionDocument>,
  ) {}

  async create(payload: CreateRequisitionDto) {
    if (!payload?.tenantId) {
      throw new Error('tenantId requerido');
    }

    const status = payload.status ?? 'draft';
    if (!isPublicStatus(status)) {
      throw new Error('status de requisición inválido');
    }

    if (!['draft', 'submitted'].includes(status)) {
      throw new Error('en creación solo se permite status draft o submitted');
    }

    const approvalFlow = normalizeApprovalFlow(payload.approvalFlow);
    validateApprovalFlow(approvalFlow);

    const now = new Date().toISOString();
    const audit = payload.audit ?? {};
    const toCreate = {
      ...payload,
      status,
      approvalFlow,
      audit: {
        createdAt: audit.createdAt ?? now,
        createdBy: audit.createdBy ?? 'system',
        updatedAt: now,
        updatedBy: audit.updatedBy ?? 'system',
        version: audit.version ?? 1,
      },
    };

    return this.requisitionModel.create(toCreate);
  }

  async update(payload: UpdateRequisitionDto) {
    const id = payload?._id;
    if (!id) {
      throw new Error('el _id es requerido para actualizar la requisición');
    }

    const current = await this.requisitionModel.findById(id);
    if (!current || current.status === 'deleted') {
      throw new Error('requisición no encontrada');
    }

    const currentStatus = (current.status ?? 'draft') as string;
    if (!isPublicStatus(currentStatus)) {
      throw new Error('status actual de requisición inválido');
    }
    if (currentStatus === 'closed') {
      throw new Error('requisición cancelada: no se permiten más cambios');
    }

    const actorId = (payload.audit?.updatedBy ?? '').trim();
    const currentApprovalFlow = normalizeApprovalFlow(
      (current.approvalFlow ?? undefined) as JobRequisitionDto['approvalFlow'],
    );

    if (payload.status !== undefined) {
      if (!isPublicStatus(payload.status)) {
        throw new Error('status de requisición inválido');
      }

      const isReturningToDraft =
        currentStatus !== 'draft' && payload.status === 'draft';
      if (isReturningToDraft) {
        const incomingApprovalFlow = payload.approvalFlow
          ? normalizeApprovalFlow(payload.approvalFlow as JobRequisitionDto['approvalFlow'])
          : currentApprovalFlow;
        const actorRequestedReview = incomingApprovalFlow.approvals.some(
          (item) =>
            item.approverUserId === actorId &&
            item.status === 'review_requested',
        );
        if (
          !actorRequestedReview &&
          (!actorId || actorId !== currentApprovalFlow.requestedBy)
        ) {
          throw new Error(
            'solo quien levantó la requisición puede regresarla a borrador',
          );
        }
      } else {
        const from = STATUS_ORDER[currentStatus];
        const to = STATUS_ORDER[payload.status];
        if (to < from) {
          throw new Error(
            `transición de status inválida: ${currentStatus} -> ${payload.status}`,
          );
        }
      }
    }

    const isReturningToDraft =
      currentStatus !== 'draft' && payload.status === 'draft';
    const nextApprovalFlow = isReturningToDraft
      ? {
          ...currentApprovalFlow,
          approvals: currentApprovalFlow.approvals.map((item) => ({
            ...item,
            status: 'pending' as const,
            actedAt: undefined,
            comment: undefined,
          })),
          conversationThread: [],
        }
      : payload.approvalFlow
      ? normalizeApprovalFlow(payload.approvalFlow as JobRequisitionDto['approvalFlow'])
      : currentApprovalFlow;
    const enrichedApprovalFlow = appendMissingThreadEvents(
      currentApprovalFlow,
      nextApprovalFlow,
    );
    validateApprovalFlow(enrichedApprovalFlow);

    const nonApprovalPatchKeys = Object.keys(payload).filter(
      (key) => !['_id', 'status', 'approvalFlow', 'audit'].includes(key),
    );
    const onlyPublicationsPatch =
      nonApprovalPatchKeys.length > 0 &&
      nonApprovalPatchKeys.every((key) => key === 'publications');
    const onlyJobPostPatch =
      nonApprovalPatchKeys.length > 0 &&
      nonApprovalPatchKeys.every((key) => key === 'jobPost');
    if (
      currentStatus !== 'draft' &&
      !onlyJobPostPatch &&
      !(currentStatus === 'recruiting' && onlyPublicationsPatch) &&
      nonApprovalPatchKeys.length > 0
    ) {
      throw new Error(
        'en estados enviados no se permite editar campos fuera del flujo de aprobación',
      );
    }

    if (!isReturningToDraft && currentStatus !== 'draft' && payload.approvalFlow) {
      const currentApproverIds = currentApprovalFlow.approvals
        .map((item) => item.approverUserId)
        .sort();
      const nextApproverIds = enrichedApprovalFlow.approvals
        .map((item) => item.approverUserId)
        .sort();
      if (JSON.stringify(currentApproverIds) !== JSON.stringify(nextApproverIds)) {
        throw new Error('solo en borrador se puede cambiar la lista de aprobadores');
      }

      const changedByOtherApprover = enrichedApprovalFlow.approvals.some((item) => {
        const currentItem = currentApprovalFlow.approvals.find(
          (x) => x.approverUserId === item.approverUserId,
        );
        const changed =
          !currentItem ||
          currentItem.status !== item.status ||
          (currentItem.comment ?? '') !== (item.comment ?? '') ||
          (currentItem.actedAt ?? '') !== (item.actedAt ?? '');
        return changed && item.approverUserId !== actorId;
      });

      if (changedByOtherApprover) {
        throw new Error(
          'cada usuario solo puede actualizar su propia aprobación',
        );
      }

      const approvalsChanged = enrichedApprovalFlow.approvals.some((item) => {
        const currentItem = currentApprovalFlow.approvals.find(
          (x) => x.approverUserId === item.approverUserId,
        );
        return (
          !currentItem ||
          currentItem.status !== item.status ||
          (currentItem.comment ?? '') !== (item.comment ?? '') ||
          (currentItem.actedAt ?? '') !== (item.actedAt ?? '')
        );
      });
      const threadChanged =
        JSON.stringify(enrichedApprovalFlow.conversationThread) !==
        JSON.stringify(currentApprovalFlow.conversationThread);
      const likesOnlyThreadUpdate =
        threadChanged &&
        !approvalsChanged &&
        isLikesOnlyThreadUpdate(currentApprovalFlow, enrichedApprovalFlow);
      const isActorApprover = currentApprovalFlow.approvals.some(
        (item) => item.approverUserId === actorId,
      );
      if (
        threadChanged &&
        !approvalsChanged &&
        !likesOnlyThreadUpdate &&
        actorId !== currentApprovalFlow.requestedBy &&
        !isActorApprover
      ) {
        throw new Error(
          'solo el solicitante o los aprobadores pueden responder al hilo de comentarios',
        );
      }
    }

    const hasReviewRequested = enrichedApprovalFlow.approvals.some(
      (item) => item.status === 'review_requested',
    );
    const normalizedApprovalFlow =
      currentStatus === 'submitted' && hasReviewRequested
        ? {
            ...enrichedApprovalFlow,
            approvals: enrichedApprovalFlow.approvals.map((item) => ({
              ...item,
              status: 'pending' as const,
              actedAt: undefined,
              comment: undefined,
            })),
          }
        : enrichedApprovalFlow;
    const hasDeclined = normalizedApprovalFlow.approvals.some(
      (item) => item.status === 'declined',
    );
    const allApproved =
      normalizedApprovalFlow.approvals.length > 0 &&
      normalizedApprovalFlow.approvals.every((item) => item.status === 'approved');
    let nextStatus = payload.status ?? (currentStatus as RequisitionPublicStatus);
    if (!isReturningToDraft && currentStatus === 'submitted' && hasDeclined) {
      nextStatus = 'closed';
    } else if (!isReturningToDraft && currentStatus === 'submitted' && hasReviewRequested) {
      nextStatus = 'draft';
    } else if (!isReturningToDraft && currentStatus === 'submitted' && allApproved) {
      nextStatus = 'approved';
    }

    if (nextStatus === 'approved') {
      if (!allApproved) {
        throw new Error(
          'para pasar a approved todos los aprobadores deben confirmar',
        );
      }
    }

    const now = new Date().toISOString();
    const currentAudit =
      (current.audit as Record<string, unknown> | undefined) ?? {};
    const audit = payload.audit ?? {};

    const updated = await this.requisitionModel.findByIdAndUpdate(
      id,
      {
        ...payload,
        status: nextStatus,
        approvalFlow: normalizedApprovalFlow,
        audit: {
          ...currentAudit,
          updatedAt: now,
          updatedBy: audit.updatedBy ?? 'system',
          version: Number(currentAudit.version ?? 1) + 1,
        },
      },
      { new: true, runValidators: true },
    );

    if (!updated) {
      throw new Error('requisición no encontrada');
    }

    return updated;
  }

  async removeById(id: string) {
    if (!id) {
      throw new Error('el _id es requerido para eliminar la requisición');
    }

    const current = await this.requisitionModel.findById(id);
    if (!current || current.status === 'deleted') {
      throw new Error('requisición no encontrada');
    }

    const now = new Date().toISOString();
    const currentAudit =
      (current.audit as Record<string, unknown> | undefined) ?? {};

    const updated = await this.requisitionModel.findByIdAndUpdate(
      id,
      {
        status: 'deleted',
        audit: {
          ...currentAudit,
          updatedAt: now,
          updatedBy: 'system',
          version: Number(currentAudit.version ?? 1) + 1,
        },
      },
      { new: true },
    );

    if (!updated) {
      throw new Error('requisición no encontrada');
    }

    return updated;
  }

  async findById(id: string) {
    if (!id) {
      throw new Error('el _id es requerido');
    }

    const requisition = await this.requisitionModel.findOne({
      _id: id,
      status: { $ne: 'deleted' },
    });

    if (!requisition) {
      throw new Error('requisición no encontrada');
    }

    return requisition;
  }

  async listByTenant(tenantId: string) {
    if (!tenantId) {
      throw new Error('tenantId requerido');
    }

    return this.requisitionModel
      .find({ tenantId, status: { $ne: 'deleted' } })
      .sort({ createdAt: -1 })
      .limit(50);
  }
}
