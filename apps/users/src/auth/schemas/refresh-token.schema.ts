import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({
  collection: 'refresh_tokens',
  timestamps: true,
})
export class RefreshToken {
  @Prop({ type: String, required: true })
  userId!: string;

  @Prop({ type: String, required: true, unique: true })
  jti!: string;

  @Prop({ type: String, required: true })
  tokenHash!: string;

  @Prop({ type: Date, required: true })
  expiresAt!: Date;

  @Prop({ type: Date })
  revokedAt?: Date | null;

  @Prop({ type: String })
  ip?: string;

  // Added by Mongoose when `timestamps: true`
  createdAt?: Date;

  // Added by Mongoose when `timestamps: true`
  updatedAt?: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

RefreshTokenSchema.index({ userId: 1 });
RefreshTokenSchema.index({ expiresAt: 1 });
