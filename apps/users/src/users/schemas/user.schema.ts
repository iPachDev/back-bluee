import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  collection: 'users',
  timestamps: true,
  strict: false,
})
export class User {
  @Prop({ type: String })
  status?: string;

  @Prop({ type: String })
  tenantId?: string;

  @Prop({ type: String, select: false })
  password?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  personal?: Record<string, unknown>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  contact?: Record<string, unknown>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  address?: Record<string, unknown>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  employment?: Record<string, unknown>;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ tenantId: 1 });
UserSchema.add({
  employment: {
    employeeNumber: { type: String, immutable: true },
  },
});
UserSchema.index({ 'employment.employeeNumber': 1 }, { unique: true });
UserSchema.index({ status: 1 });
