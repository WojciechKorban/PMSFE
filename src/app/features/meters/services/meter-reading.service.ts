import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reading, CreateReadingRequest } from '../models/meter.models';

@Injectable({ providedIn: 'root' })
export class MeterReadingService {
  private http = inject(HttpClient);

  getAll(propertyId: string, meterId: string): Observable<Reading[]> {
    return this.http.get<Reading[]>(`/api/v1/properties/${propertyId}/meters/${meterId}/readings`);
  }

  create(propertyId: string, meterId: string, data: CreateReadingRequest): Observable<Reading> {
    return this.http.post<Reading>(`/api/v1/properties/${propertyId}/meters/${meterId}/readings`, data);
  }
}
