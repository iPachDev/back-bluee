import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const serviceMock = {
    create: jest.fn(),
    update: jest.fn(),
    removeById: jest.fn(),
    findByIdOrEmployeeNumber: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    serviceMock.create.mockReset();
    serviceMock.update.mockReset();
    serviceMock.removeById.mockReset();
    serviceMock.findByIdOrEmployeeNumber.mockReset();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates to service', async () => {
    serviceMock.create.mockResolvedValue({ ok: true });
    const payload = { name: 'test' };

    const response = await controller.create({
      data: payload,
      meta: { transactionId: 'tx-1', source: 'back-bluee' },
    });

    expect(service.create).toHaveBeenCalledWith(payload);
    expect(response).toEqual({ ok: true });
  });

  it('update delegates to service', async () => {
    serviceMock.update.mockResolvedValue({ ok: true });
    const payload = { _id: '1', name: 'test' };

    const response = await controller.update({
      data: payload,
      meta: { transactionId: 'tx-1', source: 'back-bluee' },
    });

    expect(service.update).toHaveBeenCalledWith(payload);
    expect(response).toEqual({ ok: true });
  });

  it('remove delegates to service', async () => {
    serviceMock.removeById.mockResolvedValue({ ok: true });

    const response = await controller.remove({
      data: { _id: '1' },
      meta: { transactionId: 'tx-1', source: 'back-bluee' },
    });

    expect(service.removeById).toHaveBeenCalledWith('1');
    expect(response).toEqual({ ok: true });
  });

  it('get delegates to service', async () => {
    serviceMock.findByIdOrEmployeeNumber.mockResolvedValue({ ok: true });

    const response = await controller.get({
      data: { employeeNumber: 'A-1' },
      meta: { transactionId: 'tx-1', source: 'back-bluee' },
    });

    expect(service.findByIdOrEmployeeNumber).toHaveBeenCalledWith({
      id: undefined,
      employeeNumber: 'A-1',
    });
    expect(response).toEqual({ ok: true });
  });
});
