import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(payload: Record<string, unknown>) {
    if (payload && '_id' in payload) {
      delete (payload as Record<string, unknown>)._id;
    }
    const password = payload?.password as string | undefined;
    if (password && !password.startsWith('$2')) {
      (payload as Record<string, unknown>).password = await bcrypt.hash(
        password,
        10,
      );
    }
    const employeeNumber = (
      payload?.employment as Record<string, unknown> | undefined
    )?.employeeNumber as string | undefined;
    if (employeeNumber) {
      const exists = await this.userModel.exists({
        'employment.employeeNumber': employeeNumber,
      });
      if (exists) {
        throw new Error('ya existe un usuario con ese employeeNumber');
      }
    }
    return this.userModel.create(payload);
  }

  async update(payload: Record<string, unknown>) {
    const id = payload?._id as string | undefined;
    if (!id) {
      throw new Error('el _id es requerido para actualizar el usuario');
    }
    const password = payload?.password as string | undefined;
    if (password && !password.startsWith('$2')) {
      (payload as Record<string, unknown>).password = await bcrypt.hash(
        password,
        10,
      );
    }
    const updated = await this.userModel.findByIdAndUpdate(id, payload, {
      new: true,
    });
    if (!updated) {
      throw new Error('usuario no encontrado');
    }
    return updated;
  }

  async removeById(id: string) {
    if (!id) {
      throw new Error('el _id es requerido para eliminar el usuario');
    }
    const updated = await this.userModel.findByIdAndUpdate(
      id,
      { status: 'eliminated' },
      { new: true },
    );
    if (!updated) {
      throw new Error('usuario no encontrado');
    }
    return updated;
  }

  async findByIdOrEmployeeNumber(params: {
    id?: string;
    employeeNumber?: string;
  }) {
    if (params.id) {
      const byId = await this.userModel.findById(params.id).select('-password');
      if (!byId) {
        throw new Error('usuario no encontrado');
      }
      return byId;
    }
    if (params.employeeNumber) {
      const byEmployeeNumber = await this.userModel
        .findOne({
          'employment.employeeNumber': params.employeeNumber,
        })
        .select('-password');
      if (!byEmployeeNumber) {
        throw new Error('usuario no encontrado');
      }
      return byEmployeeNumber;
    }
    throw new Error('debes enviar _id o employeeNumber');
  }

  async findByEmail(email: string, includePassword = false) {
    if (!email) {
      throw new Error('email requerido');
    }
    const query = this.userModel.findOne({
      $or: [{ email }, { 'contact.emails.value': email }],
    });
    if (includePassword) {
      return query.select('+password').exec();
    }
    return query.select('-password').exec();
  }

  async findByIdWithPassword(id: string) {
    if (!id) {
      throw new Error('el _id es requerido');
    }
    return this.userModel.findById(id).select('+password').exec();
  }

  async getTokenVersion(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('tokenVersion')
      .exec();
    return user?.tokenVersion ?? 0;
  }

  async bumpTokenVersion(id: string) {
    if (!id) {
      throw new Error('el _id es requerido');
    }
    await this.userModel.updateOne({ _id: id }, { $inc: { tokenVersion: 1 } });
    return { ok: true };
  }

  async addOrganization(userId: string, organizationId: string) {
    if (!userId || !organizationId) {
      throw new Error('datos incompletos');
    }
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { tenantId: organizationId } },
    );
    return { ok: true };
  }
}
