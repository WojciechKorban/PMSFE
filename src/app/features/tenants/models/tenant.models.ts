export type TenantStatus = 'ACTIVE' | 'INACTIVE';

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: TenantStatus;
  currentOccupancy?: OccupancyPeriod | null;
  occupancyHistory?: OccupancyPeriod[];
}

export interface OccupancyPeriod {
  id: string;
  propertyId: string;
  propertyAddress: string;
  startDate: string;
  endDate?: string | null;
  monthlyAmount?: number;
  currency?: string;
}

export interface TenantDocument {
  id: string;
  filename: string;
  uploadedAt: string;
  fileSize: number;
}

export interface CreateTenantRequest {
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateTenantRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export interface TenantFilter {
  search?: string;
  status?: string;
  propertyId?: string;
  page?: number;
  size?: number;
}
