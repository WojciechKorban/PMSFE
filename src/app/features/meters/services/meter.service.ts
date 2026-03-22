import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meter, CreateMeterRequest, UpdateMeterRequest, ReplaceMeterRequest } from '../models/meter.models';

@Injectable({ providedIn: 'root' })
export class MeterService {
  private http = inject(HttpClient);

  getAll(propertyId: string): Observable<Meter[]> {
    return this.http.get<Meter[]>(`/api/v1/properties/${propertyId}/meters`);
  }

  getById(propertyId: string, meterId: string): Observable<Meter> {
    return this.http.get<Meter>(`/api/v1/properties/${propertyId}/meters/${meterId}`);
  }

  create(propertyId: string, data: CreateMeterRequest): Observable<Meter> {
    return this.http.post<Meter>(`/api/v1/properties/${propertyId}/meters`, data);
  }

  update(propertyId: string, meterId: string, data: UpdateMeterRequest): Observable<Meter> {
    return this.http.put<Meter>(`/api/v1/properties/${propertyId}/meters/${meterId}`, data);
  }

  delete(propertyId: string, meterId: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/properties/${propertyId}/meters/${meterId}`);
  }

  replace(propertyId: string, meterId: string, data: ReplaceMeterRequest): Observable<Meter> {
    return this.http.post<Meter>(`/api/v1/properties/${propertyId}/meters/${meterId}/replace`, data);
  }
}
