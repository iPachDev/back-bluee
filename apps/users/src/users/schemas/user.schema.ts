import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type UserDocument = User & Document;

@Schema({
  collection: 'users',
  timestamps: true,
  strict: false,
})
export class User {
  @Prop({ type: String })
  status?: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'organizations',
  })
  tenantId?: string;

  @Prop({ type: String })
  email?: string;

  @Prop({ type: String, select: false })
  password?: string;

  @Prop({ type: [String] })
  roles?: string[];

  @Prop({ type: [String] })
  permissions?: string[];

  @Prop({ type: String })
  employeeId?: string;

  @Prop({ type: Number, default: 0 })
  tokenVersion?: number;

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

UserSchema.pre('save', async function hashPassword(next) {
  const doc = this as unknown as {
    password?: string;
    isModified: (field: string) => boolean;
  };
  if (!doc.password || !doc.isModified('password')) {
    return next();
  }
  if (doc.password.startsWith('$2')) {
    return next();
  }
  doc.password = await bcrypt.hash(doc.password, 10);
  return next();
});

UserSchema.pre('findOneAndUpdate', async function hashPasswordInUpdate(next) {
  const update = this.getUpdate() as
    | { password?: string; $set?: { password?: string } }
    | undefined;
  if (!update) {
    return next();
  }
  const password = update.password ?? update.$set?.password;
  if (!password || password.startsWith('$2')) {
    return next();
  }
  const hashed = await bcrypt.hash(password, 10);
  if (update.password) {
    update.password = hashed;
  } else if (update.$set) {
    update.$set.password = hashed;
  } else {
    (update as any).password = hashed;
  }
  this.setUpdate(update);
  return next();
});

UserSchema.index({ tenantId: 1 });
UserSchema.add({
  employment: {
    employeeNumber: { type: String, immutable: true },
  },
});
UserSchema.index({ 'employment.employeeNumber': 1 }, { unique: true });
UserSchema.index({ status: 1 });
