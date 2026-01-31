import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export type RequisitionDocument = Requisition & Document;

@Schema({
  collection: 'requisitions',
  timestamps: true,
  strict: false,
})
export class Requisition {
  @Prop({ type: String, required: true })
  tenantId!: string;

  @Prop({ type: String, default: 'draft' })
  status?: string;

  @Prop({ type: String })
  title?: string;

  @Prop({ type: String })
  category?: string;

  @Prop({ type: String })
  seniority?: string;

  @Prop({ type: String })
  employmentType?: string;

  @Prop({ type: String })
  workMode?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  location?: Record<string, unknown>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  company?: Record<string, unknown>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  description?: Record<string, unknown>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  skills?: Record<string, unknown>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  experience?: Record<string, unknown>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  compensation?: Record<string, unknown>;

  @Prop({ type: [String], default: [] })
  benefits?: string[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  hiring?: Record<string, unknown>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  publication?: Record<string, unknown>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  audit?: Record<string, unknown>;

  @Prop({ type: [String], default: [] })
  approvers?: string[];
}

export const RequisitionSchema = SchemaFactory.createForClass(Requisition);

RequisitionSchema.index({ tenantId: 1 });
RequisitionSchema.index({ status: 1 });
RequisitionSchema.index({ approvers: 1 });
