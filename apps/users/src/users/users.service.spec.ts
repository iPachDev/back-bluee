import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

describe('UsersService', () => {
  let service: UsersService;
  const modelMock = {
    exists: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: modelMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    modelMock.exists.mockReset();
    modelMock.create.mockReset();
    modelMock.findByIdAndUpdate.mockReset();
    modelMock.findById.mockReset();
    modelMock.findOne.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create strips _id and creates document', async () => {
    modelMock.create.mockResolvedValue({ ok: true });
    const payload = { _id: '123', name: 'test' };

    await service.create(payload);

    expect(modelMock.create).toHaveBeenCalledWith({ name: 'test' });
  });

  it('create throws if employeeNumber already exists', async () => {
    modelMock.exists.mockResolvedValue(true);
    const payload = { employment: { employeeNumber: 'A-1' } };

    await expect(service.create(payload)).rejects.toThrow(
      'ya existe un usuario con ese employeeNumber',
    );
  });

  it('update throws if _id missing', async () => {
    await expect(service.update({})).rejects.toThrow(
      'el _id es requerido para actualizar el usuario',
    );
  });

  it('update returns updated document', async () => {
    modelMock.findByIdAndUpdate.mockResolvedValue({ _id: '1', ok: true });

    const result = await service.update({ _id: '1', name: 'test' });

    expect(modelMock.findByIdAndUpdate).toHaveBeenCalledWith(
      '1',
      { _id: '1', name: 'test' },
      { new: true },
    );
    expect(result).toEqual({ _id: '1', ok: true });
  });

  it('removeById throws if id missing', async () => {
    await expect(service.removeById('')).rejects.toThrow(
      'el _id es requerido para eliminar el usuario',
    );
  });

  it('removeById updates status to eliminated', async () => {
    modelMock.findByIdAndUpdate.mockResolvedValue({
      _id: '1',
      status: 'eliminated',
    });

    const result = await service.removeById('1');

    expect(modelMock.findByIdAndUpdate).toHaveBeenCalledWith(
      '1',
      { status: 'eliminated' },
      { new: true },
    );
    expect(result).toEqual({ _id: '1', status: 'eliminated' });
  });

  it('findByIdOrEmployeeNumber finds by id', async () => {
    modelMock.findById.mockResolvedValue({ _id: '1' });

    const result = await service.findByIdOrEmployeeNumber({ id: '1' });

    expect(modelMock.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual({ _id: '1' });
  });

  it('findByIdOrEmployeeNumber finds by employeeNumber', async () => {
    modelMock.findOne.mockResolvedValue({ _id: '1' });

    const result = await service.findByIdOrEmployeeNumber({
      employeeNumber: 'A-1',
    });

    expect(modelMock.findOne).toHaveBeenCalledWith({
      'employment.employeeNumber': 'A-1',
    });
    expect(result).toEqual({ _id: '1' });
  });

  it('findByIdOrEmployeeNumber throws if no params', async () => {
    await expect(service.findByIdOrEmployeeNumber({})).rejects.toThrow(
      'debes enviar _id o employeeNumber',
    );
  });
});
