import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FixedCost, AddFixedCostRequest, UpdateFixedCostRequest } from '../models/fixed-cost.models';

@Injectable({ providedIn: 'root' })
export class FixedCostService {
  private http = inject(HttpClient);

  getAll(propertyId: string): Observable<FixedCost[]> {
    return this.http.get<FixedCost[]>(`/api/v1/properties/${propertyId}/fixed-costs`);
  }

  create(propertyId: string, data: AddFixedCostRequest): Observable<FixedCost> {
    return this.http.post<FixedCost>(`/api/v1/properties/${propertyId}/fixed-costs`, data);
  }

  update(propertyId: string, costId: string, data: UpdateFixedCostRequest): Observable<FixedCost> {
    return this.http.put<FixedCost>(`/api/v1/properties/${propertyId}/fixed-costs/${costId}`, data);
  }

  deactivate(propertyId: string, costId: string): Observable<FixedCost> {
    // Backend returns updated FixedCostResponse (NOT 204)
    return this.http.delete<FixedCost>(`/api/v1/properties/${propertyId}/fixed-costs/${costId}`);
  }
}
