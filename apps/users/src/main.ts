import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { UsersModule } from './users.module';

async function bootstrap() {
  dotenv.config();
  const rabbitUrl = process.env.RABBITMQ_CONNECTION;
  if (!rabbitUrl) {
    throw new Error('RABBITMQ_CONNECTION is not set');
  }
  const queueName = process.env.MS_NAME_USERS;
  if (!queueName) {
    throw new Error('no se a definido el nombre del microservicio users');
  }
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
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
