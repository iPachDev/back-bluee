import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'USERS_SERVICE',
        useFactory: async () => {
          const rabbitUrl = process.env.RABBITMQ_CONNECTION;
          const queueName = process.env.MS_NAME_USERS;
          if (!rabbitUrl) {
            throw new Error('RABBITMQ_CONNECTION is not set');
          }
          if (!queueName) {
            throw new Error(
              'no se a definido el nombre del microservicio users',
            );
          }
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitUrl],
              queue: queueName,
              queueOptions: {
                durable: true,
              },
            },
          };
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
