import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TalentController } from './talent.controller';
import { TalentService } from './talent.service';
import { RequisitionsModule } from './requisitions/requisitions.module';
import { DatabaseModule } from './database/database.module';
import { TraceInterceptor } from './common/trace.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    RequisitionsModule,
  ],
  controllers: [TalentController],
  providers: [
    TalentService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TraceInterceptor,
    },
  ],
})
export class TalentModule {}
