import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { UsersFeatureModule } from './users/users.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TraceInterceptor } from './common/trace.interceptor';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DatabaseModule, UsersFeatureModule, AuthModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TraceInterceptor,
    },
  ],
})
export class UsersModule {}
