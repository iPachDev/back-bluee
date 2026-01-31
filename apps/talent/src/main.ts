import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { TalentModule } from './talent.module';

async function bootstrap() {
  dotenv.config();
  const rabbitUrl = process.env.RABBITMQ_CONNECTION;
  if (!rabbitUrl) {
    throw new Error('RABBITMQ_CONNECTION is not set');
  }
  const queueName = process.env.MS_NAME_TALENT;
  if (!queueName) {
    throw new Error('no se a definido el nombre del microservicio talent');
  }
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    TalentModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitUrl],
        queue: queueName,
        queueOptions: {
          durable: true,
        },
      },
    },
  );
  await app.listen();
}
bootstrap();
