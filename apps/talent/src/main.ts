import { NestFactory } from '@nestjs/core';
import { TalentModule } from './talent.module';

async function bootstrap() {
  const app = await NestFactory.create(TalentModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
