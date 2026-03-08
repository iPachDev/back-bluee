import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import {
  CandidateApplication,
  CandidateApplicationSchema,
} from './schemas/candidate-application.schema';
import { Requisition, RequisitionSchema } from '../requisitions/schemas/requisition.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CandidateApplication.name, schema: CandidateApplicationSchema },
      { name: Requisition.name, schema: RequisitionSchema },
    ]),
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
            throw new Error('no se a definido el nombre del microservicio users');
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
  controllers: [CandidatesController],
  providers: [CandidatesService],
  exports: [CandidatesService],
})
export class CandidatesModule {}
