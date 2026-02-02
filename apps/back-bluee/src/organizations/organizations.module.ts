import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule.registerAsync([
      {
        name: 'ORGANIZATIONS_SERVICE',
        useFactory: async () => {
          const rabbitUrl = process.env.RABBITMQ_CONNECTION;
          const queueName = process.env.MS_NAME_ORGANIZATIONS;
          if (!rabbitUrl) {
            throw new Error('RABBITMQ_CONNECTION is not set');
          }
          if (!queueName) {
            throw new Error(
              'no se a definido el nombre del microservicio organizations',
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
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
})
export class OrganizationsModule {}
