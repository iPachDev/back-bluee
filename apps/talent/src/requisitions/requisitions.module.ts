import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequisitionsService } from './requisitions.service';
import { RequisitionsController } from './requisitions.controller';
import { Requisition, RequisitionSchema } from './schemas/requisition.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Requisition.name, schema: RequisitionSchema },
    ]),
  ],
  controllers: [RequisitionsController],
  providers: [RequisitionsService],
})
export class RequisitionsModule {}
