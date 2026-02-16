export const USER_STATUSES = ['active', 'inactive', 'eliminated'] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export interface CreateUserDto {
  tenantId?: string;
  email?: string;
  password?: string;
  roles?: string[];
  status?: UserStatus;
  personal?: {
    legalName?: {
      firstName?: string;
      lastName?: string;
    };
    preferredName?: string;
  };
  employment?: {
    employeeNumber?: string;
    company?: {
      areaId?: string;
      departmentId?: string;
    };
  };
  contact?: unknown;
  [key: string]: unknown;
}

export interface UpdateUserDto {
  _id?: string;
  email?: string;
  password?: string;
  roles?: string[];
  status?: UserStatus;
  personal?: {
    legalName?: {
      firstName?: string;
      lastName?: string;
    };
    preferredName?: string;
  };
  employment?: {
    employeeNumber?: string;
    company?: {
      areaId?: string;
      departmentId?: string;
    };
  };
  [key: string]: unknown;
}

export interface ListUsersQueryDto {
  tenantId: string;
  page?: number;
  limit?: number;
  status?: UserStatus;
  search?: string;
}

export interface ListUsersResultDto {
  items: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
}
