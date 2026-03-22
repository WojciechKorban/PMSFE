import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tariff, AddTariffRequest } from '../models/meter.models';

@Injectable({ providedIn: 'root' })
export class TariffService {
  private http = inject(HttpClient);

  getAll(propertyId: string): Observable<Tariff[]> {
    return this.http.get<Tariff[]>(`/api/v1/properties/${propertyId}/tariffs`);
  }

  create(propertyId: string, data: AddTariffRequest): Observable<Tariff> {
    return this.http.post<Tariff>(`/api/v1/properties/${propertyId}/tariffs`, data);
  }

  delete(propertyId: string, tariffId: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/properties/${propertyId}/tariffs/${tariffId}`);
  }
}
