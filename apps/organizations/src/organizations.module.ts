import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import {
  Organization,
  OrganizationSchema,
} from './organizations/schemas/organization.schema';
import { DatabaseModule } from './database/database.module';
import { TraceInterceptor } from './common/trace.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
    ]),
  ],
  controllers: [OrganizationsController],
  providers: [
    OrganizationsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TraceInterceptor,
    },
  ],
})
export class OrganizationsModule {}
