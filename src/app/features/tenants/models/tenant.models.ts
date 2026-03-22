export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  notes: string | null;
  createdAt: string;
}

export interface TenantOccupancy {
  id: string;
  tenantId: string;
  propertyId: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export interface CreateTenantRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
}

export type UpdateTenantRequest = CreateTenantRequest;

export interface AssignTenantRequest {
  startDate: string; // YYYY-MM-DD
}
