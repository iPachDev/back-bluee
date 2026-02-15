import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JobApplicationsService } from './job-applications.service';
import { JobApplicationsController } from './job-applications.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule.registerAsync([
      {
        name: 'TALENT_SERVICE',
        useFactory: async () => {
          const rabbitUrl = process.env.RABBITMQ_CONNECTION;
          const queueName = process.env.MS_NAME_TALENT;
          if (!rabbitUrl) {
            throw new Error('RABBITMQ_CONNECTION is not set');
          }
          if (!queueName) {
            throw new Error(
              'no se a definido el nombre del microservicio talent',
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
  controllers: [JobApplicationsController],
  providers: [JobApplicationsService],
})
export class JobApplicationsModule {}
