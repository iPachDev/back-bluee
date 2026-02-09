export interface TraceEntry {
  from: string;
  to: string;
  timestart: string;
  timeend: string;
  signature: string;
}

export interface ResponseHeaders {
  transactionId: string;
  isSuccess: boolean;
  statusCode: number;
  trazability: TraceEntry[];
}

export interface ResponseEnvelope<T> {
  headers: ResponseHeaders;
  data: T | null;
  errors: string[];
}

export interface RmqRequest<T> {
  data: T;
  meta: {
    transactionId: string;
    source: string;
    trazability?: TraceEntry[];
  };
}

export interface AuthUserPayload {
  sub: string;
  email: string;
  tenantId?: string;
  roles?: string[];
  permissions?: string[];
  employeeId?: string;
  tokenVersion?: number;
  jti?: string;
}
