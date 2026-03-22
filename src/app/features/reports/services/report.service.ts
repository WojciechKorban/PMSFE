import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, takeWhile } from 'rxjs';
import { ReportRequest, ReportType } from '../models/report.models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);

  downloadCsv(propertyId: string, from: string, to: string): Observable<Blob> {
    return this.http.get(
      `/api/v1/properties/${propertyId}/reports/meter-readings/csv`,
      { params: { from, to }, responseType: 'blob' }
    );
  }

  downloadProfitabilityPdf(propertyId: string, from: string, to: string): Observable<Blob> {
    return this.http.get(
      `/api/v1/properties/${propertyId}/reports/profitability/pdf`,
      { params: { from, to }, responseType: 'blob' }
    );
  }

  downloadComparisonPdf(propertyId: string, periods: string): Observable<Blob> {
    return this.http.get(
      `/api/v1/properties/${propertyId}/reports/profitability/comparison`,
      { params: { periods }, responseType: 'blob' }
    );
  }

  requestAsync(
    propertyId: string,
    reportType: ReportType,
    fromDate: string,
    toDate: string
  ): Observable<ReportRequest> {
    return this.http.post<ReportRequest>(
      `/api/v1/properties/${propertyId}/reports/async`,
      { reportType, fromDate, toDate }
    );
  }

  // Poll every 3 seconds until COMPLETE or FAILED (inclusive — true as second takeWhile arg)
  pollStatus(propertyId: string, reportRequestId: string): Observable<ReportRequest> {
    return interval(3000).pipe(
      switchMap(() =>
        this.http.get<ReportRequest>(
          `/api/v1/properties/${propertyId}/reports/${reportRequestId}`
        )
      ),
      takeWhile(r => r.status === 'PENDING' || r.status === 'PROCESSING', true)
    );
  }

  triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
