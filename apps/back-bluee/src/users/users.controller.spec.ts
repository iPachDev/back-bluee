import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const serviceMock = {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
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
    serviceMock.remove.mockReset();
    serviceMock.find.mockReset();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates to service', async () => {
    serviceMock.create.mockResolvedValue({
      headers: {
        transactionId: 'tx-1',
        isSuccess: true,
        statusCode: 200,
        trazability: [],
      },
      data: { ok: true },
      errors: [],
    });
    const payload = { name: 'test' };
    const res = { status: jest.fn().mockReturnThis() } as any;
    const req = { transactionId: 'tx-1' } as any;

    const response = await controller.create(payload, req, res);

    expect(service.create).toHaveBeenCalled();
    expect(response.headers.isSuccess).toBe(true);
  });

  it('update delegates to service', async () => {
    serviceMock.update.mockResolvedValue({
      headers: {
        transactionId: 'tx-1',
        isSuccess: true,
        statusCode: 200,
        trazability: [],
      },
      data: { ok: true },
      errors: [],
    });
    const payload = { _id: '1', name: 'test' };
    const res = { status: jest.fn().mockReturnThis() } as any;
    const req = { transactionId: 'tx-1' } as any;

    const response = await controller.update(payload, req, res);

    expect(service.update).toHaveBeenCalled();
    expect(response.headers.isSuccess).toBe(true);
  });

  it('remove delegates to service', async () => {
    serviceMock.remove.mockResolvedValue({
      headers: {
        transactionId: 'tx-1',
        isSuccess: true,
        statusCode: 200,
        trazability: [],
      },
      data: { ok: true },
      errors: [],
    });
    const res = { status: jest.fn().mockReturnThis() } as any;
    const req = { transactionId: 'tx-1' } as any;

    const response = await controller.remove('abc', req, res);

    expect(service.remove).toHaveBeenCalled();
    expect(response.headers.isSuccess).toBe(true);
  });

  it('getById delegates to service', async () => {
    serviceMock.find.mockResolvedValue({
      headers: {
        transactionId: 'tx-1',
        isSuccess: true,
        statusCode: 200,
        trazability: [],
      },
      data: { ok: true },
      errors: [],
    });
    const res = { status: jest.fn().mockReturnThis() } as any;
    const req = { transactionId: 'tx-1' } as any;

    const response = await controller.getById('abc', req, res);

    expect(service.find).toHaveBeenCalled();
    expect(response.headers.isSuccess).toBe(true);
  });

  it('getByEmployeeNumber delegates to service', async () => {
    serviceMock.find.mockResolvedValue({
      headers: {
        transactionId: 'tx-1',
        isSuccess: true,
        statusCode: 200,
        trazability: [],
      },
      data: { ok: true },
      errors: [],
    });
    const res = { status: jest.fn().mockReturnThis() } as any;
    const req = { transactionId: 'tx-1' } as any;

    const response = await controller.getByEmployeeNumber('A-1', req, res);

    expect(service.find).toHaveBeenCalled();
    expect(response.headers.isSuccess).toBe(true);
  });
});
