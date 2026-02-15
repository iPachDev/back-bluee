import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class JobApplication {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  displayName: string;

  @Prop({ type: String, required: true })
  tenantId: string;

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  sections: Record<string, unknown>[];

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export type JobApplicationDocument = JobApplication & Document;

export const JobApplicationSchema =
  SchemaFactory.createForClass(JobApplication);
