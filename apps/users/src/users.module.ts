import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UsersFeatureModule } from './users/users.module';

@Module({
  imports: [DatabaseModule, UsersFeatureModule],
})
export class UsersModule {}
