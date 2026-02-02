import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export type OrganizationDocument = Organization & Document;

@Schema({
  collection: 'organizations',
  timestamps: true,
  strict: false,
})
export class Organization {
  @Prop({ type: String, default: 'active' })
  status?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  identity?: Record<string, unknown>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  contact?: Record<string, unknown>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  settings?: Record<string, unknown>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  branding?: Record<string, unknown>;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

OrganizationSchema.index({ status: 1 });
OrganizationSchema.index({ 'identity.slug': 1 });
