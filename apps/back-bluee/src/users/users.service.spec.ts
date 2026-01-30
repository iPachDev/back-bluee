import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let client: ClientProxy;

  const clientMock = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'USERS_SERVICE',
          useValue: clientMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    client = module.get<ClientProxy>('USERS_SERVICE');
    clientMock.send.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create sends users.create with payload and meta', async () => {
    clientMock.send.mockReturnValue(of({ ok: true }));
    const payload = { name: 'test' };
    const meta = { transactionId: 'tx-1', source: 'back-bluee' };

    await service.create(payload, meta);

    expect(client.send).toHaveBeenCalledWith(
      { cmd: 'users.create' },
      { data: payload, meta },
    );
  });

  it('update sends users.update with payload and meta', async () => {
    clientMock.send.mockReturnValue(of({ ok: true }));
    const payload = { _id: '1', name: 'test' };
    const meta = { transactionId: 'tx-1', source: 'back-bluee' };

    await service.update(payload, meta);

    expect(client.send).toHaveBeenCalledWith(
      { cmd: 'users.update' },
      { data: payload, meta },
    );
  });

  it('remove sends users.delete with id and meta', async () => {
    clientMock.send.mockReturnValue(of({ ok: true }));
    const meta = { transactionId: 'tx-1', source: 'back-bluee' };

    await service.remove('abc', meta);

    expect(client.send).toHaveBeenCalledWith(
      { cmd: 'users.delete' },
      { data: { _id: 'abc' }, meta },
    );
  });

  it('find sends users.get with params and meta', async () => {
    clientMock.send.mockReturnValue(of({ ok: true }));
    const params = { employeeNumber: 'A-1' };
    const meta = { transactionId: 'tx-1', source: 'back-bluee' };

    await service.find(params, meta);

    expect(client.send).toHaveBeenCalledWith(
      { cmd: 'users.get' },
      { data: params, meta },
    );
  });
});
