import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  CreatePropertyRequest,
  PropertyResponse,
  PropertySummary,
  UpdatePropertyRequest,
} from '../models/property.models';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/properties';

  getAll(): Observable<PropertySummary[]> {
    return this.http.get<PropertyResponse[]>(this.base).pipe(
      map(props => props.map(p => ({
        ...p,
        meterCount: 0,
        activeTenantCount: 0,
        activeContractCount: 0,
        lastProfitability: null,
      } as PropertySummary)))
    );
  }

  getById(id: string): Observable<PropertyResponse> {
    return this.http.get<PropertyResponse>(`${this.base}/${id}`);
  }

  create(request: CreatePropertyRequest): Observable<PropertyResponse> {
    return this.http.post<PropertyResponse>(this.base, request);
  }

  update(id: string, request: UpdatePropertyRequest): Observable<PropertyResponse> {
    return this.http.put<PropertyResponse>(`${this.base}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
