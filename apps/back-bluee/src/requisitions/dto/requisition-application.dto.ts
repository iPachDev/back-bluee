export type RequisitionApplicationStatus = 'applied';

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

export interface RequisitionApplicationsPageDto {
  items: RequisitionApplicationDto[];
  total: number;
  page: number;
  limit: number;
}
