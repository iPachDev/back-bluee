export const REQUISITION_APPLICATION_STATUSES = ['applied'] as const;

export type RequisitionApplicationStatus =
  (typeof REQUISITION_APPLICATION_STATUSES)[number];

export interface RequisitionApplicationDto {
  _id?: string;
  tenantId: string;
  requisitionId: string;
  userId: string;
  candidateName?: string;
  candidateEmail?: string;
  status: RequisitionApplicationStatus;
  source: 'site_web';
  appliedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplyRequisitionDto {
  tenantId: string;
  requisitionId: string;
  userId: string;
  candidateName?: string;
  candidateEmail?: string;
  source?: 'site_web';
}

export interface GetRequisitionApplicationByUserDto {
  tenantId: string;
  requisitionId: string;
  userId: string;
}

export interface ListRequisitionApplicationsDto {
  tenantId: string;
  requisitionId: string;
  page?: number;
  limit?: number;
}

export interface ListUserRequisitionApplicationsDto {
  tenantId: string;
  userId: string;
  page?: number;
  limit?: number;
}

export interface RequisitionApplicationsPageDto {
  items: RequisitionApplicationDto[];
  total: number;
  page: number;
  limit: number;
}
