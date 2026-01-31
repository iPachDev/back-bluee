import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Requisition, RequisitionDocument } from './schemas/requisition.schema';

@Injectable()
export class RequisitionsService {
  constructor(
    @InjectModel(Requisition.name)
    private readonly requisitionModel: Model<RequisitionDocument>,
  ) {}

  async create(payload: Record<string, unknown>) {
    if (!payload?.tenantId) {
      throw new Error('tenantId requerido');
    }
    const now = new Date().toISOString();
    const audit = (payload.audit as Record<string, unknown> | undefined) ?? {};
    const toCreate = {
      status: payload.status ?? 'draft',
      ...payload,
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

  async update(payload: Record<string, unknown>) {
    const id = payload?._id as string | undefined;
    if (!id) {
      throw new Error('el _id es requerido para actualizar la requisición');
    }
    const current = await this.requisitionModel.findById(id);
    if (!current || current.status === 'deleted') {
      throw new Error('requisición no encontrada');
    }
    const now = new Date().toISOString();
    const currentAudit =
      (current.audit as Record<string, unknown> | undefined) ?? {};
    const audit = (payload.audit as Record<string, unknown> | undefined) ?? {};
    const updated = await this.requisitionModel.findByIdAndUpdate(
      id,
      {
        ...payload,
        audit: {
          ...currentAudit,
          updatedAt: now,
          updatedBy: audit.updatedBy ?? 'system',
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
