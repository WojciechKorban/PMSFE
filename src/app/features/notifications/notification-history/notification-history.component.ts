import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notification-history',
  standalone: true,
  imports: [
    CommonModule, TranslocoPipe,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTableModule
  ],
  template: `
    <div class="history-container">
      <h2>{{ 'notifications.history.title' | transloco }}</h2>

      @if (historyResource.isLoading()) {
        <div class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (historyResource.error()) {
        <div class="error">{{ 'common.error.loadFailed' | transloco }}</div>
      } @else if ((historyResource.value()?.content ?? []).length === 0) {
        <div class="empty-state">
          <mat-icon>notifications_none</mat-icon>
          <p>{{ 'notifications.history.empty' | transloco }}</p>
        </div>
      } @else {
        <table mat-table [dataSource]="historyResource.value()!.content" class="history-table">
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>{{ 'notifications.history.status' | transloco }}</th>
            <td mat-cell *matCellDef="let log">
              <span [class]="'status-chip status-' + log.status.toLowerCase()">
                {{ ('notifications.status.' + log.status) | transloco }}
              </span>
            </td>
          </ng-container>
          <ng-container matColumnDef="template">
            <th mat-header-cell *matHeaderCellDef>{{ 'notifications.history.template' | transloco }}</th>
            <td mat-cell *matCellDef="let log">{{ templateKeyToI18n(log.templateKey) | transloco }}</td>
          </ng-container>
          <ng-container matColumnDef="subject">
            <th mat-header-cell *matHeaderCellDef>{{ 'notifications.history.subject' | transloco }}</th>
            <td mat-cell *matCellDef="let log">{{ log.subject }}</td>
          </ng-container>
          <ng-container matColumnDef="sentAt">
            <th mat-header-cell *matHeaderCellDef>{{ 'notifications.history.sentAt' | transloco }}</th>
            <td mat-cell *matCellDef="let log">{{ log.sentAt ? (log.sentAt | date:'dd.MM.yyyy HH:mm') : '—' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>

        <div class="pagination">
          <button mat-icon-button
            [disabled]="!historyResource.value()!.hasPrevious"
            (click)="page.set(page() - 1)">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <span>{{ 'common.pagination' | transloco: { page: (historyResource.value()!.page + 1), total: historyResource.value()!.totalPages } }}</span>
          <button mat-icon-button
            [disabled]="!historyResource.value()!.hasNext"
            (click)="page.set(page() + 1)">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .history-container { max-width: 900px; margin: 0 auto; padding: 16px; }
    .loading-center, .empty-state { display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 48px; gap: 8px; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; }
    .history-table { width: 100%; }
    .status-chip { padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; }
    .status-sent { background: #e8f5e9; color: #2e7d32; }
    .status-failed { background: #fce4ec; color: #880e4f; }
    .status-pending { background: #fff8e1; color: #f57f17; }
    .status-skipped { background: #f5f5f5; color: #616161; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; }
    .error { color: red; padding: 16px; }
  `]
})
export class NotificationHistoryComponent {
  private notificationService = inject(NotificationService);

  page = signal(0);
  columns = ['status', 'template', 'subject', 'sentAt'];

  historyResource = rxResource({
    params: () => this.page(),
    stream: ({ params: p }) => this.notificationService.getHistory(p, 20)
  });

  templateKeyToI18n(key: string): string {
    return 'notifications.template.' + key.replace(/-/g, '_');
  }
}
