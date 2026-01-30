import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT_BACK) || 4000;
  await app.listen(port);
}
bootstrap();
