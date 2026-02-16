export const REQUISITION_PUBLIC_STATUSES = [
  'draft',
  'submitted',
  'approved',
  'recruiting',
  'closed',
] as const;

export const REQUISITION_TYPES = [
  'new_position',
  'replacement',
  'temporary',
  'internship',
] as const;

export const REQUISITION_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

export const CONTRACT_TYPES = [
  'full_time',
  'part_time',
  'contract',
  'temporary',
  'internship',
] as const;

export const WORKDAY_TYPES = ['full_time', 'part_time', 'mixed'] as const;
export const SCHEDULE_TYPES = ['fixed', 'flex'] as const;
export const WEEK_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
export const MODALITIES = ['onsite', 'remote', 'hybrid'] as const;
export const SENIORITIES = ['junior', 'mid', 'senior', 'lead'] as const;
export const LANGUAGE_LEVELS = ['basic', 'intermediate', 'advanced', 'native'] as const;
export const APPROVAL_STATUSES = [
  'pending',
  'approved',
  'review_requested',
  'declined',
] as const;
export const APPROVAL_THREAD_ACTIONS = [...APPROVAL_STATUSES, 'comment'] as const;
export const PUBLICATION_CHANNELS = ['site_web', 'linkedin', 'occ'] as const;

export type RequisitionPublicStatus = (typeof REQUISITION_PUBLIC_STATUSES)[number];
export type RequisitionType = (typeof REQUISITION_TYPES)[number];
export type RequisitionPriority = (typeof REQUISITION_PRIORITIES)[number];

export interface JobRequisitionDto {
  _id?: string;
  id?: string;
  tenantId: string;
  status: RequisitionPublicStatus;
  type: RequisitionType;
  priority: RequisitionPriority;
  position: {
    title: string;
    department: string;
    area: string;
    reportsTo: string;
    positionsOpen: number;
    justification: string;
  };
  replacementInfo?: {
    isReplacement: boolean;
    replacesEmployeeId: string;
    replacementReason: string;
  };
  employment: {
    contractType: (typeof CONTRACT_TYPES)[number];
    workdayType: (typeof WORKDAY_TYPES)[number];
    schedule: {
      type: (typeof SCHEDULE_TYPES)[number];
      days: Array<(typeof WEEK_DAYS)[number]>;
      startTime: string;
      endTime: string;
      timezone: string;
    };
    modality: (typeof MODALITIES)[number];
  };
  location: {
    country: string;
    city: string;
    office: string;
    remoteAllowed: boolean;
  };
  salary: {
    currency: string;
    rangeMin: number;
    rangeMax: number;
    isConfidential: boolean;
    bonus?: {
      hasBonus: boolean;
      type: string;
      percentage: number;
    };
  };
  budget: {
    costCenter: string;
    approvedBudget: number;
    budgetOwner: string;
  };
  candidateProfile: {
    seniority: (typeof SENIORITIES)[number];
    yearsExperienceMin: number;
    education: string[];
    skillsRequired: string[];
    skillsNiceToHave: string[];
    languages: Array<{
      language: string;
      level: (typeof LANGUAGE_LEVELS)[number];
    }>;
  };
  jobPost: {
    descriptionMarkdown: string;
    requirementsMarkdown: string;
  };
  benefits: string[];
  hiringProcess: {
    expectedStartDate: string;
    targetHireDate: string;
    recruiterAssigned: string;
  };
  approvalFlow: {
    requestedBy: string;
    approvals: Array<{
      approverUserId: string;
      approverName?: string;
      status: (typeof APPROVAL_STATUSES)[number];
      actedAt?: string;
      comment?: string;
    }>;
    conversationThread: Array<{
      approverUserId: string;
      approverName?: string;
      action: (typeof APPROVAL_THREAD_ACTIONS)[number];
      comment: string;
      createdAt: string;
      likes?: Array<{
        userId: string;
        userName?: string;
      }>;
    }>;
  };
  publications?: Array<{
    channel: (typeof PUBLICATION_CHANNELS)[number];
    publishedAt?: string;
  }>;
  audit?: {
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
    version?: number;
  };
}

export type CreateRequisitionDto = Omit<JobRequisitionDto, '_id' | 'id'>;
export type UpdateRequisitionDto = Partial<CreateRequisitionDto> & { _id: string };
