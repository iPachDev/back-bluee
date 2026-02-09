import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AccessTokenDocument = AccessToken & Document;

@Schema({
  collection: 'access_tokens',
  timestamps: true,
})
export class AccessToken {
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
}

export const AccessTokenSchema = SchemaFactory.createForClass(AccessToken);

AccessTokenSchema.index({ userId: 1 });
AccessTokenSchema.index({ expiresAt: 1 });
