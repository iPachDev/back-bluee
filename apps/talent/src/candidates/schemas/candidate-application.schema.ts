import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import {
  APPLICATION_STATUSES,
  APPLICATION_SUB_STATUSES,
  CONTACT_CHANNELS,
  CONTACT_OUTCOMES,
  NOTE_VISIBILITIES,
  REJECTION_REASON_CATEGORIES,
} from '../dto/application.enums';

export type CandidateApplicationDocument = CandidateApplication & Document;

@Schema({
  collection: 'requisition_applications',
  timestamps: true,
  strict: true,
  versionKey: false,
})
export class CandidateApplication {
  @Prop({ type: String, required: true, index: true })
  tenantId!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
  requisitionId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
  candidateId!: Types.ObjectId;

  @Prop({ type: String, required: false, index: true })
  userId?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: false, index: true })
  recruiterId?: Types.ObjectId;

  @Prop({ type: String, enum: APPLICATION_STATUSES, required: true, default: 'applied' })
  status!: (typeof APPLICATION_STATUSES)[number];

  @Prop({ type: String, enum: APPLICATION_SUB_STATUSES, required: false })
  subStatus?: (typeof APPLICATION_SUB_STATUSES)[number];

  @Prop(
    raw([
      {
        fromStatus: { type: String, enum: APPLICATION_STATUSES, required: true },
        toStatus: { type: String, enum: APPLICATION_STATUSES, required: true },
        fromSubStatus: { type: String, enum: APPLICATION_SUB_STATUSES, required: false },
        toSubStatus: { type: String, enum: APPLICATION_SUB_STATUSES, required: false },
        changedAt: { type: String, required: true },
        changedBy: { type: String, required: true },
        note: { type: String, required: false },
      },
    ]),
  )
  stageHistory!: Array<Record<string, unknown>>;

  @Prop(
    raw([
      {
        text: { type: String, required: true },
        createdAt: { type: String, required: true },
        createdBy: { type: String, required: true },
        visibility: { type: String, enum: NOTE_VISIBILITIES, required: true },
      },
    ]),
  )
  notes!: Array<Record<string, unknown>>;

  @Prop(
    raw([
      {
        channel: { type: String, enum: CONTACT_CHANNELS, required: true },
        to: { type: String, required: true },
        message: { type: String, required: false },
        outcome: { type: String, enum: CONTACT_OUTCOMES, required: true },
        createdAt: { type: String, required: true },
        createdBy: { type: String, required: true },
      },
    ]),
  )
  contacts!: Array<Record<string, unknown>>;

  @Prop(
    raw({
      hrScore: { type: Number, min: 1, max: 5, required: false },
      techScore: { type: Number, min: 1, max: 5, required: false },
      finalScore: { type: Number, min: 1, max: 5, required: false },
    }),
  )
  scores?: Record<string, unknown>;

  @Prop(
    raw({
      reasonCategory: {
        type: String,
        enum: REJECTION_REASON_CATEGORIES,
        required: false,
      },
      reasonCode: { type: String, required: false },
      reasonText: { type: String, required: false },
    }),
  )
  rejectionReason?: Record<string, unknown>;
}

export const CandidateApplicationSchema = SchemaFactory.createForClass(
  CandidateApplication,
);

CandidateApplicationSchema.index(
  { tenantId: 1, requisitionId: 1, candidateId: 1 },
  { unique: true },
);
CandidateApplicationSchema.index({ tenantId: 1, requisitionId: 1, status: 1 });
CandidateApplicationSchema.index({ tenantId: 1, recruiterId: 1, status: 1 });
CandidateApplicationSchema.index({ tenantId: 1, candidateId: 1, createdAt: -1 });
