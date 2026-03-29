import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Tenant,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantFilter,
} from '../models/tenant.models';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private http = inject(HttpClient);

  getAll(filter?: TenantFilter): Observable<Tenant[]> {
    let params = new HttpParams();
    if (filter?.search) params = params.set('search', filter.search);
    if (filter?.status) params = params.set('status', filter.status);
    if (filter?.propertyId) params = params.set('propertyId', filter.propertyId);
    if (filter?.page !== undefined) params = params.set('page', filter.page);
    if (filter?.size !== undefined) params = params.set('size', filter.size);
    return this.http.get<Tenant[]>('/api/v1/tenants', { params });
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

  getPropertyTenants(propertyId: string): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(`/api/v1/properties/${propertyId}/tenants`);
  }

  assignOccupancy(propertyId: string, tenantId: string, data: { startDate: string }): Observable<void> {
    return this.http.post<void>(`/api/v1/properties/${propertyId}/occupancies`, { tenantId, ...data });
  }

  removeOccupancy(propertyId: string, tenantId: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/properties/${propertyId}/occupancies/${tenantId}`);
  }
}
