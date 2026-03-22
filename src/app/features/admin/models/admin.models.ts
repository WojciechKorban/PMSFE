export interface UserSummary {
  id: string;
  email: string;
  roles: string[];
  createdAt: string;
  propertyCount: number;
  deleted: boolean;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  roles: string[];
  createdAt: string;
  emailVerified: boolean;
  accountStatus: string;
  properties: { id: string; name: string; city: string }[];
}

export interface PropertyWithOwner {
  id: string;
  name: string;
  city: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  requestId: string | null;
  createdAt: string;
  newData: string | null;
}

export interface SystemHealth {
  pendingOutboxEvents: number;
  failedOutboxEvents: number;
  totalUsers: number;
  totalProperties: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type AuditAction =
  | 'USER_REGISTERED' | 'EMAIL_VERIFIED' | 'LOGIN_SUCCESS' | 'LOGIN_FAILED'
  | 'PASSWORD_RESET_REQUESTED' | 'PASSWORD_RESET_COMPLETED'
  | 'REFRESH_TOKEN_ROTATED' | 'TOKEN_FAMILY_REVOKED' | 'LOGOUT' | 'LOGOUT_ALL'
  | 'PROPERTY_CREATED' | 'PROPERTY_UPDATED' | 'PROPERTY_DELETED' | 'PROPERTY_ACCESSED_BY_ADMIN'
  | 'METER_CREATED' | 'METER_REPLACED' | 'METER_READING_RECORDED'
  | 'TENANT_CREATED' | 'TENANT_ASSIGNED' | 'TENANT_REMOVED'
  | 'CONTRACT_CREATED' | 'CONTRACT_TERMINATED'
  | 'TARIFF_CREATED' | 'FIXED_COST_CREATED' | 'FIXED_COST_CHANGED' | 'PROFITABILITY_CALCULATED'
  | 'ADMIN_USER_VIEWED' | 'ADMIN_PROPERTY_ACCESSED' | 'ADMIN_RATE_LIMIT_RESET'
  | 'RATE_LIMIT_VIOLATED' | 'UNAUTHORIZED_ACCESS_ATTEMPT';

export const ALL_AUDIT_ACTIONS: AuditAction[] = [
  'USER_REGISTERED', 'EMAIL_VERIFIED', 'LOGIN_SUCCESS', 'LOGIN_FAILED',
  'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED',
  'REFRESH_TOKEN_ROTATED', 'TOKEN_FAMILY_REVOKED', 'LOGOUT', 'LOGOUT_ALL',
  'PROPERTY_CREATED', 'PROPERTY_UPDATED', 'PROPERTY_DELETED', 'PROPERTY_ACCESSED_BY_ADMIN',
  'METER_CREATED', 'METER_REPLACED', 'METER_READING_RECORDED',
  'TENANT_CREATED', 'TENANT_ASSIGNED', 'TENANT_REMOVED',
  'CONTRACT_CREATED', 'CONTRACT_TERMINATED',
  'TARIFF_CREATED', 'FIXED_COST_CREATED', 'FIXED_COST_CHANGED', 'PROFITABILITY_CALCULATED',
  'ADMIN_USER_VIEWED', 'ADMIN_PROPERTY_ACCESSED', 'ADMIN_RATE_LIMIT_RESET',
  'RATE_LIMIT_VIOLATED', 'UNAUTHORIZED_ACCESS_ATTEMPT'
];
