import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { REQUISITION_APPLICATION_STATUSES } from '../dto/requisition-application.dto';

export type RequisitionApplicationDocument = RequisitionApplication & Document;

@Schema({
  collection: 'requisition_applications',
  timestamps: true,
  strict: true,
  versionKey: false,
})
export class RequisitionApplication {
  @Prop({ type: String, required: true, index: true })
  tenantId!: string;

  @Prop({ type: String, required: true, index: true })
  requisitionId!: string;

  @Prop({ type: String, required: true, index: true })
  userId!: string;

  @Prop({ type: String, required: false })
  candidateName?: string;

  @Prop({ type: String, required: false })
  candidateEmail?: string;

  @Prop({
    type: String,
    enum: REQUISITION_APPLICATION_STATUSES,
    default: 'applied',
  })
  status!: (typeof REQUISITION_APPLICATION_STATUSES)[number];

  @Prop({ type: String, default: 'site_web' })
  source!: 'site_web';

  @Prop({ type: String, required: true })
  appliedAt!: string;
}

export const RequisitionApplicationSchema = SchemaFactory.createForClass(
  RequisitionApplication,
);

RequisitionApplicationSchema.index(
  { tenantId: 1, requisitionId: 1, userId: 1 },
  { unique: true },
);
RequisitionApplicationSchema.index({ tenantId: 1, requisitionId: 1, appliedAt: -1 });
RequisitionApplicationSchema.index({ tenantId: 1, userId: 1, appliedAt: -1 });
