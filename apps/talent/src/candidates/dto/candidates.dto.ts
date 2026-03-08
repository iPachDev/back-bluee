import {
  ApplicationStatus,
  ApplicationSubStatus,
  ContactChannel,
  ContactOutcome,
  NoteVisibility,
  RejectionReasonCategory,
} from './application.enums';

export interface ApplicationRejectionReason {
  reasonCategory: RejectionReasonCategory;
  reasonCode?: string;
  reasonText?: string;
}

export interface ApplicationStageHistoryItem {
  fromStatus: ApplicationStatus;
  toStatus: ApplicationStatus;
  fromSubStatus?: ApplicationSubStatus;
  toSubStatus?: ApplicationSubStatus;
  changedAt: string;
  changedBy: string;
  note?: string;
}

export interface ApplicationNote {
  text: string;
  createdAt: string;
  createdBy: string;
  visibility: NoteVisibility;
}

export interface ApplicationContact {
  channel: ContactChannel;
  to: string;
  message?: string;
  outcome: ContactOutcome;
  createdAt: string;
  createdBy: string;
}

export interface ApplicationScores {
  hrScore?: number;
  techScore?: number;
  finalScore?: number;
}

export interface CandidateApplication {
  _id?: string;
  tenantId: string;
  requisitionId: string;
  candidateId: string;
  userId?: string;
  recruiterId?: string;
  status: ApplicationStatus;
  subStatus?: ApplicationSubStatus;
  stageHistory: ApplicationStageHistoryItem[];
  notes: ApplicationNote[];
  contacts: ApplicationContact[];
  scores?: ApplicationScores;
  rejectionReason?: ApplicationRejectionReason;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateApplicationDto {
  tenantId: string;
  requisitionId: string;
  candidateId: string;
  recruiterId?: string;
  note?: string;
}

export interface UpdateStatusDto {
  status: ApplicationStatus;
  subStatus?: ApplicationSubStatus;
  note?: string;
  rejectionReason?: ApplicationRejectionReason;
}

export interface AddNoteDto {
  text: string;
  visibility: NoteVisibility;
}

export interface AddContactDto {
  channel: ContactChannel;
  to: string;
  message?: string;
  outcome: ContactOutcome;
}

export interface ApplicationListFiltersDto {
  tenantId: string;
  jobId?: string;
  status?: ApplicationStatus;
  recruiterId?: string;
  candidateId?: string;
  page?: number;
  limit?: number;
}
