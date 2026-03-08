import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import {
  type CreateUserDto,
  type ListUsersQueryDto,
  type ListUsersResultDto,
  type UpdateUserDto,
} from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(payload: CreateUserDto) {
    const toCreate: Record<string, unknown> = { ...(payload ?? {}) };

    if ('_id' in toCreate) {
      delete toCreate._id;
    }

    const password = toCreate.password as string | undefined;
    if (password && !password.startsWith('$2')) {
      toCreate.password = await bcrypt.hash(password, 10);
    }

    const employment = toCreate.employment as
      | { employeeNumber?: string }
      | undefined;
    const employeeNumber = employment?.employeeNumber;
    if (employment && !employeeNumber) {
      delete (employment as Record<string, unknown>).employeeNumber;
      if (Object.keys(employment).length === 0) {
        delete toCreate.employment;
      }
    }
    if (employeeNumber) {
      const exists = await this.userModel.exists({
        'employment.employeeNumber': employeeNumber,
      });
      if (exists) {
        throw new Error('ya existe un usuario con ese employeeNumber');
      }
    }

    return this.userModel.create(toCreate);
  }

  async update(payload: UpdateUserDto) {
    const id = payload?._id;
    if (!id) {
      throw new Error('el _id es requerido para actualizar el usuario');
    }

    const toUpdate: Record<string, unknown> = { ...(payload ?? {}) };
    const password = toUpdate.password as string | undefined;
    if (password && !password.startsWith('$2')) {
      toUpdate.password = await bcrypt.hash(password, 10);
    }

    const updated = await this.userModel.findByIdAndUpdate(id, toUpdate, {
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

  async listByTenant(query: ListUsersQueryDto): Promise<ListUsersResultDto> {
    const tenantId = query.tenantId;
    if (!tenantId) {
      throw new Error('tenantId requerido');
    }

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(query.limit ?? 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { tenantId };

    if (query.status) {
      filter.status = query.status;
    } else {
      filter.status = { $ne: 'eliminated' };
    }

    const search = query.search?.trim();
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        {
          'personal.legalName.firstName': {
            $regex: search,
            $options: 'i',
          },
        },
        {
          'personal.legalName.lastName': {
            $regex: search,
            $options: 'i',
          },
        },
        {
          'employment.employeeNumber': {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.userModel.countDocuments(filter),
    ]);

    return {
      items: items as unknown as Record<string, unknown>[],
      total,
      page,
      limit,
    };
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

  async updateCandidateProfile(payload: {
    userId: string;
    personal?: Record<string, unknown>;
    candidateProfile?: Record<string, unknown>;
    cvData?: Record<string, unknown>;
  }) {
    if (!payload.userId) {
      throw new Error('userId requerido');
    }

    const update: Record<string, unknown> = {};
    if (payload.personal) {
      update.personal = payload.personal;
    }
    if (payload.candidateProfile) {
      update.candidateProfile = payload.candidateProfile;
    }
    if (payload.cvData) {
      update.cvData = payload.cvData;
    }

    const updated = await this.userModel
      .findByIdAndUpdate(payload.userId, { $set: update }, { new: true })
      .select('-password');
    if (!updated) {
      throw new Error('usuario no encontrado');
    }
    return updated;
  }

  async listCandidateApplications(userId: string) {
    if (!userId) {
      throw new Error('userId requerido');
    }
    const user = await this.userModel
      .findById(userId)
      .select('candidateApplications')
      .exec();
    if (!user) {
      throw new Error('usuario no encontrado');
    }
    const applications =
      ((user as unknown as { candidateApplications?: unknown[] })
        .candidateApplications ?? []) as unknown[];
    return { applications };
  }

  private async generateEmployeeNumber(): Promise<string> {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const value = String(Math.floor(10000 + Math.random() * 90000));
      const exists = await this.userModel.exists({ 'employment.employeeNumber': value });
      if (!exists) {
        return value;
      }
    }
    throw new Error('no fue posible generar employeeNumber');
  }

  async promoteCandidateToEmployed(userId: string, position?: Record<string, unknown>) {
    if (!userId) {
      throw new Error('userId requerido');
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new Error('usuario no encontrado');
    }

    const roles = new Set((user.roles ?? []) as string[]);
    roles.delete('candidate');
    roles.add('employed');

    const currentEmployment = (user.employment ?? {}) as Record<string, unknown>;
    const hasEmployeeNumber = Boolean(currentEmployment.employeeNumber);
    const employeeNumber = hasEmployeeNumber
      ? String(currentEmployment.employeeNumber)
      : await this.generateEmployeeNumber();

    const history = Array.isArray(currentEmployment.positionHistory)
      ? [...(currentEmployment.positionHistory as Record<string, unknown>[])]
      : [];
    const nextPosition = position ? { ...position } : undefined;
    const nextHistory = nextPosition ? [nextPosition, ...history] : history;

    user.roles = Array.from(roles);
    user.employment = {
      ...currentEmployment,
      employeeNumber,
      ...(nextPosition ? { position: nextPosition } : {}),
      positionHistory: nextHistory,
    };

    await user.save();
    return user;
  }
}
