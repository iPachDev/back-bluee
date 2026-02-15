import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  JobApplication,
  JobApplicationDocument,
} from './schemas/job-application.schema';

@Injectable()
export class JobApplicationsService {
  constructor(
    @InjectModel(JobApplication.name)
    private readonly jobApplicationModel: Model<JobApplicationDocument>,
  ) {}

  async create(payload: Record<string, unknown>) {
    if (!payload?.tenantId) {
      throw new Error('tenantId requerido');
    }
    const toCreate = { ...payload, isActive: true };
    delete (toCreate as { _id?: unknown })._id;
    return this.jobApplicationModel.create(toCreate);
  }

  async update(payload: Record<string, unknown>) {
    const id = payload?._id as string | undefined;
    const tenantId = payload?.tenantId as string | undefined;
    if (!id || !tenantId) {
      throw new Error('tenantId y _id son requeridos para actualizar');
    }
    const { _id, isActive, tenantId: _tenantId, ...rest } = payload;
    const updated = await this.jobApplicationModel.findOneAndUpdate(
      { _id: id, tenantId, isActive: true },
      { ...rest },
      { new: true },
    );
    if (!updated) {
      throw new Error('configuración no encontrada');
    }
    return updated;
  }

  async removeByIdAndTenant(id: string, tenantId: string) {
    if (!id || !tenantId) {
      throw new Error('tenantId y _id son requeridos para eliminar');
    }
    const updated = await this.jobApplicationModel.findOneAndUpdate(
      { _id: id, tenantId, isActive: true },
      { isActive: false },
      { new: true },
    );
    if (!updated) {
      throw new Error('configuración no encontrada');
    }
    return updated;
  }

  async findByTenant(tenantId: string) {
    if (!tenantId) {
      throw new Error('tenantId requerido');
    }
    const config = await this.jobApplicationModel.findOne({
      tenantId,
      isActive: true,
    });
    if (!config) {
      throw new Error('configuración no encontrada');
    }
    return config;
  }
}
