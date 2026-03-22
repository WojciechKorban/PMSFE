import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationPreferences, NotificationLog } from '../models/notification.models';
import { PageResponse } from '../../admin/models/admin.models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);

  getPreferences(): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>('/api/v1/notifications/preferences');
  }

  updatePreferences(data: NotificationPreferences): Observable<NotificationPreferences> {
    return this.http.put<NotificationPreferences>('/api/v1/notifications/preferences', data);
  }

  getHistory(page = 0, size = 20): Observable<PageResponse<NotificationLog>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<NotificationLog>>('/api/v1/notifications/history', { params });
  }
}
