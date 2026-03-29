import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Meter,
  MeterReading,
  CreateMeterRequest,
  UpdateMeterRequest,
  SubmitReadingRequest,
  ReplaceMeterRequest,
  ReadingFilter,
  PageResponse,
} from '../models/meter.models';

@Injectable({ providedIn: 'root' })
export class MeterService {
  private http = inject(HttpClient);

  getMetersByProperty(propertyId: string): Observable<Meter[]> {
    return this.http.get<Meter[]>(`/api/v1/properties/${propertyId}/meters`);
  }

  getMeter(meterId: string): Observable<Meter> {
    return this.http.get<Meter>(`/api/v1/meters/${meterId}`);
  }

  addMeter(propertyId: string, data: CreateMeterRequest): Observable<Meter> {
    return this.http.post<Meter>(`/api/v1/properties/${propertyId}/meters`, data);
  }

  getReadings(meterId: string, filter?: ReadingFilter): Observable<PageResponse<MeterReading>> {
    let params = new HttpParams();
    if (filter?.page !== undefined) params = params.set('page', filter.page);
    if (filter?.size !== undefined) params = params.set('size', filter.size);
    return this.http.get<PageResponse<MeterReading>>(`/api/v1/meters/${meterId}/readings`, { params });
  }

  submitReading(meterId: string, data: SubmitReadingRequest): Observable<MeterReading> {
    return this.http.post<MeterReading>(`/api/v1/meters/${meterId}/readings`, data);
  }

  getReadingUploadUrl(readingId: string): Observable<{ uploadUrl: string; key: string }> {
    return this.http.get<{ uploadUrl: string; key: string }>(`/api/v1/readings/${readingId}/photo/upload-url`);
  }

  confirmPhotoUpload(readingId: string, key: string): Observable<void> {
    return this.http.post<void>(`/api/v1/readings/${readingId}/photo/confirm`, { key });
  }

  uploadPhotoToS3(uploadUrl: string, file: File, onProgress: (pct: number) => void): Observable<void> {
    return new Observable<void>(observer => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          observer.next();
          observer.complete();
        } else {
          observer.error(new Error(`Upload failed: ${xhr.status}`));
        }
      };
      xhr.onerror = () => observer.error(new Error('Upload network error'));
      xhr.send(file);
    });
  }

  replaceMeter(meterId: string, data: ReplaceMeterRequest): Observable<void> {
    return this.http.post<void>(`/api/v1/meters/${meterId}/replace`, data);
  }

  // Legacy compatibility methods (used by existing components)
  getAll(propertyId: string): Observable<Meter[]> {
    return this.getMetersByProperty(propertyId);
  }

  getById(propertyId: string, meterId: string): Observable<Meter> {
    return this.http.get<Meter>(`/api/v1/properties/${propertyId}/meters/${meterId}`);
  }

  create(propertyId: string, data: CreateMeterRequest): Observable<Meter> {
    return this.addMeter(propertyId, data);
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
