import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Organization, OrganizationDocument } from './organizations/schemas/organization.schema';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<OrganizationDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(payload: Record<string, unknown>) {
    const userId = String(payload.userId ?? '');
    if (!userId) {
      throw new Error('userId requerido');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('userId inválido');
    }
    const user = await this.connection
      .collection('users')
      .findOne({ _id: new Types.ObjectId(userId) });
    if (!user || (user as any).status !== 'active') {
      throw new Error('usuario no activo');
    }
    const status = (payload.status as string | undefined) ?? 'active';
    const created = await this.organizationModel.create({ ...payload, status });
    await this.connection.collection('users').updateOne(
      { _id: new Types.ObjectId(userId) },
      { $addToSet: { organizations: created._id } },
    );
    return created;
  }

  async update(payload: Record<string, unknown>) {
    const id = payload?._id as string | undefined;
    if (!id) {
      throw new Error('el _id es requerido para actualizar la organización');
    }
    const current = await this.organizationModel.findById(id);
    if (!current || current.status === 'deleted') {
      throw new Error('organización no encontrada');
    }
    const updated = await this.organizationModel.findByIdAndUpdate(id, payload, {
      new: true,
    });
    if (!updated) {
      throw new Error('organización no encontrada');
    }
    return updated;
  }

  async removeById(id: string) {
    if (!id) {
      throw new Error('el _id es requerido para eliminar la organización');
    }
    const current = await this.organizationModel.findById(id);
    if (!current || current.status === 'deleted') {
      throw new Error('organización no encontrada');
    }
    const updated = await this.organizationModel.findByIdAndUpdate(
      id,
      { status: 'deleted' },
      { new: true },
    );
    if (!updated) {
      throw new Error('organización no encontrada');
    }
    return updated;
  }

  async findById(id: string) {
    if (!id) {
      throw new Error('el _id es requerido');
    }
    const org = await this.organizationModel.findOne({
      _id: id,
      status: { $ne: 'deleted' },
    });
    if (!org) {
      throw new Error('organización no encontrada');
    }
    return org;
  }

  async list() {
    return this.organizationModel
      .find({ status: { $ne: 'deleted' } })
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async listByUserId(userId: string) {
    if (!userId) {
      throw new Error('userId requerido');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('userId inválido');
    }
    const user = await this.connection
      .collection('users')
      .findOne({ _id: new Types.ObjectId(userId) });
    if (!user) {
      throw new Error('usuario no encontrado');
    }
    const orgIds = ((user as any).organizations ?? []).map(
      (id: any) => new Types.ObjectId(id),
    );
    if (orgIds.length === 0) {
      return [];
    }
    return this.organizationModel
      .find({ _id: { $in: orgIds }, status: { $ne: 'deleted' } })
      .sort({ createdAt: -1 })
      .limit(50);
  }
}
