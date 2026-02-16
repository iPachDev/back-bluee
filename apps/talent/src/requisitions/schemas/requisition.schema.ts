import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  APPROVAL_STATUSES,
  APPROVAL_THREAD_ACTIONS,
  CONTRACT_TYPES,
  LANGUAGE_LEVELS,
  MODALITIES,
  PUBLICATION_CHANNELS,
  REQUISITION_ALL_STATUSES,
  REQUISITION_PRIORITIES,
  REQUISITION_TYPES,
  SCHEDULE_TYPES,
  SENIORITIES,
  WEEK_DAYS,
  WORKDAY_TYPES,
} from '../dto/requisition.dto';

export type RequisitionDocument = Requisition & Document;

@Schema({
  collection: 'requisitions',
  timestamps: true,
  strict: true,
})
export class Requisition {
  @Prop({ type: String, required: true })
  tenantId!: string;

  @Prop({ type: String, enum: REQUISITION_ALL_STATUSES, default: 'draft' })
  status?: (typeof REQUISITION_ALL_STATUSES)[number];

  @Prop({ type: String, enum: REQUISITION_TYPES, required: true })
  type!: (typeof REQUISITION_TYPES)[number];

  @Prop({ type: String, enum: REQUISITION_PRIORITIES, required: true })
  priority!: (typeof REQUISITION_PRIORITIES)[number];

  @Prop(
    raw({
      title: { type: String, required: true },
      department: { type: String, required: true },
      area: { type: String, required: true },
      reportsTo: { type: String, required: true },
      positionsOpen: { type: Number, required: true, min: 1 },
      justification: { type: String, required: true },
    }),
  )
  position!: Record<string, unknown>;

  @Prop(
    raw({
      isReplacement: { type: Boolean, required: false },
      replacesEmployeeId: { type: String, required: false },
      replacementReason: { type: String, required: false },
    }),
  )
  replacementInfo?: Record<string, unknown>;

  @Prop(
    raw({
      contractType: { type: String, enum: CONTRACT_TYPES, required: true },
      workdayType: { type: String, enum: WORKDAY_TYPES, required: true },
      schedule: {
        type: {
          type: String,
          enum: SCHEDULE_TYPES,
          required: true,
        },
        days: {
          type: [String],
          enum: WEEK_DAYS,
          required: true,
          default: [],
        },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        timezone: { type: String, required: true },
      },
      modality: { type: String, enum: MODALITIES, required: true },
    }),
  )
  employment!: Record<string, unknown>;

  @Prop(
    raw({
      country: { type: String, required: true },
      city: { type: String, required: true },
      office: { type: String, required: true },
      remoteAllowed: { type: Boolean, required: true },
    }),
  )
  location!: Record<string, unknown>;

  @Prop(
    raw({
      currency: { type: String, required: true },
      rangeMin: { type: Number, required: true, min: 0 },
      rangeMax: { type: Number, required: true, min: 0 },
      isConfidential: { type: Boolean, required: true },
      bonus: {
        hasBonus: { type: Boolean, required: false },
        type: { type: String, required: false },
        percentage: { type: Number, required: false, min: 0, max: 100 },
      },
    }),
  )
  salary!: Record<string, unknown>;

  @Prop(
    raw({
      costCenter: { type: String, required: true },
      approvedBudget: { type: Number, required: true, min: 0 },
      budgetOwner: { type: String, required: true },
    }),
  )
  budget!: Record<string, unknown>;

  @Prop(
    raw({
      seniority: { type: String, enum: SENIORITIES, required: true },
      yearsExperienceMin: { type: Number, required: true, min: 0 },
      education: { type: [String], required: true, default: [] },
      skillsRequired: { type: [String], required: true, default: [] },
      skillsNiceToHave: { type: [String], required: true, default: [] },
      languages: {
        type: [
          {
            language: { type: String, required: true },
            level: { type: String, enum: LANGUAGE_LEVELS, required: true },
          },
        ],
        required: true,
        default: [],
      },
    }),
  )
  candidateProfile!: Record<string, unknown>;

  @Prop(
    raw({
      descriptionMarkdown: { type: String, required: true, default: '' },
      requirementsMarkdown: { type: String, required: true, default: '' },
    }),
  )
  jobPost!: Record<string, unknown>;

  @Prop({ type: [String], default: [] })
  benefits?: string[];

  @Prop(
    raw({
      expectedStartDate: { type: String, required: true },
      targetHireDate: { type: String, required: true },
      recruiterAssigned: { type: String, required: false },
    }),
  )
  hiringProcess!: Record<string, unknown>;

  @Prop(
    raw({
      requestedBy: { type: String, required: true },
      approvals: {
        type: [
          {
            approverUserId: { type: String, required: true },
            approverName: { type: String, required: false },
            status: { type: String, enum: APPROVAL_STATUSES, required: true },
            actedAt: { type: String, required: false },
            comment: { type: String, required: false },
          },
        ],
        required: true,
        default: [],
      },
      conversationThread: {
        type: [
          {
            approverUserId: { type: String, required: true },
            approverName: { type: String, required: false },
            action: { type: String, enum: APPROVAL_THREAD_ACTIONS, required: true },
            comment: { type: String, required: true },
            createdAt: { type: String, required: true },
            likes: {
              type: [
                {
                  userId: { type: String, required: true },
                  userName: { type: String, required: false },
                },
              ],
              required: false,
              default: [],
            },
          },
        ],
        required: true,
        default: [],
      },
    }),
  )
  approvalFlow!: Record<string, unknown>;

  @Prop({
    type: [
      {
        channel: { type: String, enum: PUBLICATION_CHANNELS, required: true },
        publishedAt: { type: String, required: false },
      },
    ],
    default: [],
  })
  publications?: Array<{
    channel: (typeof PUBLICATION_CHANNELS)[number];
    publishedAt?: string;
  }>;

  @Prop(
    raw({
      createdBy: { type: String, required: false },
      updatedBy: { type: String, required: false },
      createdAt: { type: String, required: false },
      updatedAt: { type: String, required: false },
      version: { type: Number, required: false },
    }),
  )
  audit?: Record<string, unknown>;
}

export const RequisitionSchema = SchemaFactory.createForClass(Requisition);

RequisitionSchema.index({ tenantId: 1 });
RequisitionSchema.index({ status: 1 });
RequisitionSchema.index({ type: 1 });
RequisitionSchema.index({ 'position.area': 1 });
RequisitionSchema.index({ 'approvalFlow.requestedBy': 1 });
