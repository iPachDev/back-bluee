import { Module } from '@nestjs/common';
import { RequisitionsService } from './requisitions.service';
import { RequisitionsController } from './requisitions.controller';

@Module({
  controllers: [RequisitionsController],
  providers: [RequisitionsService],
})
export class RequisitionsModule {}
