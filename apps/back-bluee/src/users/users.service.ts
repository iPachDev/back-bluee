import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(@Inject('USERS_SERVICE') private readonly client: ClientProxy) {}

  create(payload: Record<string, unknown>) {
    return firstValueFrom(this.client.send({ cmd: 'users.create' }, payload));
  }

  update(payload: Record<string, unknown>) {
    return firstValueFrom(this.client.send({ cmd: 'users.update' }, payload));
  }

  remove(_id: string) {
    return firstValueFrom(this.client.send({ cmd: 'users.delete' }, { _id }));
  }

  find(params: { _id?: string; employeeNumber?: string }) {
    return firstValueFrom(this.client.send({ cmd: 'users.get' }, params));
  }
}
