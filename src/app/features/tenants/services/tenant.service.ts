import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Tenant,
  TenantOccupancy,
  CreateTenantRequest,
  UpdateTenantRequest,
  AssignTenantRequest,
} from '../models/tenant.models';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private http = inject(HttpClient);

  getAll(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>('/api/v1/tenants');
  }

  getById(id: string): Observable<Tenant> {
    return this.http.get<Tenant>(`/api/v1/tenants/${id}`);
  }

  create(data: CreateTenantRequest): Observable<Tenant> {
    return this.http.post<Tenant>('/api/v1/tenants', data);
  }

  update(id: string, data: UpdateTenantRequest): Observable<Tenant> {
    return this.http.put<Tenant>(`/api/v1/tenants/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/tenants/${id}`);
  }

  getPropertyTenants(propertyId: string): Observable<TenantOccupancy[]> {
    return this.http.get<TenantOccupancy[]>(`/api/v1/properties/${propertyId}/tenants`);
  }

  assign(propertyId: string, tenantId: string, data: AssignTenantRequest): Observable<TenantOccupancy> {
    return this.http.post<TenantOccupancy>(
      `/api/v1/properties/${propertyId}/tenants/${tenantId}/assign`,
      data
    );
  }

  remove(propertyId: string, tenantId: string): Observable<TenantOccupancy> {
    return this.http.post<TenantOccupancy>(
      `/api/v1/properties/${propertyId}/tenants/${tenantId}/remove`,
      {}
    );
  }
}
