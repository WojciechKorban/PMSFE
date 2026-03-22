import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  UserSummary, AdminUserDetail, PropertyWithOwner,
  AuditLogEntry, SystemHealth, PageResponse, AuditAction
} from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  getUsers(page = 0, size = 20): Observable<PageResponse<UserSummary>> {
    const params = new HttpParams()
      .set('page', page).set('size', size).set('sort', 'createdAt,desc');
    return this.http.get<PageResponse<UserSummary>>('/api/v1/admin/users', { params });
  }

  getUserDetail(userId: string): Observable<AdminUserDetail> {
    return this.http.get<AdminUserDetail>(`/api/v1/admin/users/${userId}`);
  }

  getUserAuditLog(userId: string, page = 0, size = 50): Observable<PageResponse<AuditLogEntry>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<AuditLogEntry>>(
      `/api/v1/admin/users/${userId}/audit-log`, { params }
    );
  }

  getProperties(page = 0, size = 20): Observable<PageResponse<PropertyWithOwner>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<PropertyWithOwner>>('/api/v1/admin/properties', { params });
  }

  getAuditLog(actions: AuditAction[] = [], page = 0, size = 50): Observable<PageResponse<AuditLogEntry>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (actions.length > 0) params = params.set('actions', actions.join(','));
    return this.http.get<PageResponse<AuditLogEntry>>('/api/v1/admin/audit-log', { params });
  }

  replayEvent(eventId: string): Observable<void> {
    return this.http.post<void>(`/api/v1/admin/events/${eventId}/replay`, null);
  }

  getSystemHealth(): Observable<SystemHealth> {
    return this.http.get<SystemHealth>('/api/v1/admin/system/health-detailed');
  }
}
