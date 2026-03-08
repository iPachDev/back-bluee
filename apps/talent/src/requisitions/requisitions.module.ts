import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequisitionsService } from './requisitions.service';
import { RequisitionsController } from './requisitions.controller';
import { Requisition, RequisitionSchema } from './schemas/requisition.schema';
import {
  RequisitionApplication,
  RequisitionApplicationSchema,
} from './schemas/requisition-application.schema';
import {
  CandidateApplication,
  CandidateApplicationSchema,
} from '../candidates/schemas/candidate-application.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Requisition.name, schema: RequisitionSchema },
      {
        name: RequisitionApplication.name,
        schema: RequisitionApplicationSchema,
      },
      { name: CandidateApplication.name, schema: CandidateApplicationSchema },
    ]),
  ],
  controllers: [RequisitionsController],
  providers: [RequisitionsService],
})
export class RequisitionsModule {}
