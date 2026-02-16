import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { RmqRequest } from '../common/response.interface';
import { normalizeRmqPayload } from '../common/rmq.utils';
import {
  type CreateUserDto,
  type ListUsersQueryDto,
  type UpdateUserDto,
} from './dto/user.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'users.create' })
  create(@Payload() payload: RmqRequest<CreateUserDto> | CreateUserDto) {
    const { data } = normalizeRmqPayload(payload);
    return this.usersService.create(data);
  }

  @MessagePattern({ cmd: 'users.update' })
  update(@Payload() payload: RmqRequest<UpdateUserDto> | UpdateUserDto) {
    const { data } = normalizeRmqPayload(payload);
    return this.usersService.update(data);
  }

  @MessagePattern({ cmd: 'users.delete' })
  remove(@Payload() payload: RmqRequest<{ _id?: string }> | { _id?: string }) {
    const { data } = normalizeRmqPayload(payload);
    return this.usersService.removeById(data?._id ?? '');
  }

  @MessagePattern({ cmd: 'users.get' })
  get(
    @Payload()
    payload:
      | RmqRequest<{ _id?: string; employeeNumber?: string }>
      | { _id?: string; employeeNumber?: string },
  ) {
    const { data } = normalizeRmqPayload(payload);
    return this.usersService.findByIdOrEmployeeNumber({
      id: data?._id,
      employeeNumber: data?.employeeNumber,
    });
  }

  @MessagePattern({ cmd: 'users.list' })
  list(@Payload() payload: RmqRequest<ListUsersQueryDto> | ListUsersQueryDto) {
    const { data } = normalizeRmqPayload(payload);
    return this.usersService.listByTenant(data);
  }
}
