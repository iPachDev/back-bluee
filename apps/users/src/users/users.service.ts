import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(payload: Record<string, unknown>) {
    if (payload && '_id' in payload) {
      delete (payload as Record<string, unknown>)._id;
    }
    return this.userModel.create(payload);
  }

  async update(payload: Record<string, unknown>) {
    const id = payload?._id as string | undefined;
    if (!id) {
      throw new Error('el _id es requerido para actualizar el usuario');
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
      const byId = await this.userModel.findById(params.id);
      if (!byId) {
        throw new Error('usuario no encontrado');
      }
      return byId;
    }
    if (params.employeeNumber) {
      const byEmployeeNumber = await this.userModel.findOne({
        'employment.employeeNumber': params.employeeNumber,
      });
      if (!byEmployeeNumber) {
        throw new Error('usuario no encontrado');
      }
      return byEmployeeNumber;
    }
    throw new Error('debes enviar _id o employeeNumber');
  }
}
