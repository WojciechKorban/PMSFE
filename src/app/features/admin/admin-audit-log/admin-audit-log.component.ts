import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminService } from '../services/admin.service';
import { AuditAction, ALL_AUDIT_ACTIONS } from '../models/admin.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-admin-audit-log',
  standalone: true,
  imports: [
    CommonModule, TranslocoPipe,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatTableModule, MatTooltipModule, SkeletonLoaderComponent
  ],
  template: `
    <div class="audit-container">
      <div class="audit-header">
        <h2>{{ 'admin.auditLog.title' | transloco }}</h2>
        @if (selectedActions().size > 0) {
          <button mat-stroked-button (click)="clearFilters()">
            <mat-icon>filter_alt_off</mat-icon>
            {{ 'admin.auditLog.clearFilters' | transloco }}
          </button>
        }
      </div>

      <div class="filter-chips">
        @for (action of allActions; track action) {
          <button
            mat-stroked-button
            [class.active-filter]="selectedActions().has(action)"
            (click)="toggleAction(action)"
            class="filter-chip">
            {{ ('admin.actions.' + action) | transloco }}
          </button>
        }
      </div>

      @if (auditResource.isLoading()) {
        <pms-skeleton-loader type="list" [rowCount]="6" />
      } @else {
        <table mat-table [dataSource]="auditResource.value()?.content ?? []" class="audit-table">
          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef>{{ 'admin.auditLog.action' | transloco }}</th>
            <td mat-cell *matCellDef="let e">{{ ('admin.actions.' + e.action) | transloco }}</td>
          </ng-container>
          <ng-container matColumnDef="entityType">
            <th mat-header-cell *matHeaderCellDef>{{ 'admin.auditLog.entityType' | transloco }}</th>
            <td mat-cell *matCellDef="let e">{{ e.entityType ?? '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="userId">
            <th mat-header-cell *matHeaderCellDef>{{ 'admin.auditLog.user' | transloco }}</th>
            <td mat-cell *matCellDef="let e" [matTooltip]="e.userId">{{ e.userId | slice:0:8 }}…</td>
          </ng-container>
          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>{{ 'admin.auditLog.timestamp' | transloco }}</th>
            <td mat-cell *matCellDef="let e">{{ e.createdAt | date:'dd.MM.yyyy HH:mm' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>

        <div class="pagination">
          <button mat-icon-button [disabled]="!auditResource.value()?.hasPrevious" (click)="page.set(page() - 1)">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <span>{{ 'common.pagination' | transloco: { page: ((auditResource.value()?.page ?? 0) + 1), total: (auditResource.value()?.totalPages ?? 1) } }}</span>
          <button mat-icon-button [disabled]="!auditResource.value()?.hasNext" (click)="page.set(page() + 1)">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .audit-container { max-width: 1100px; margin: 0 auto; padding: 16px; }
    .audit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .filter-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
    .filter-chip { font-size: 0.75rem; padding: 4px 8px; min-width: unset; height: 28px; line-height: 28px; }
    .filter-chip.active-filter { background-color: #1976d2; color: white; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .audit-table { width: 100%; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; }
  `]
})
export class AdminAuditLogComponent {
  private adminService = inject(AdminService);

  page = signal(0);
  selectedActions = signal(new Set<AuditAction>());
  allActions = ALL_AUDIT_ACTIONS;
  columns = ['action', 'entityType', 'userId', 'createdAt'];

  auditResource = rxResource({
    params: () => ({ page: this.page(), actions: [...this.selectedActions()] as AuditAction[] }),
    stream: ({ params: { page, actions } }) => this.adminService.getAuditLog(actions, page, 50)
  });

  toggleAction(action: AuditAction): void {
    const s = new Set(this.selectedActions());
    s.has(action) ? s.delete(action) : s.add(action);
    this.selectedActions.set(s);
    this.page.set(0);
  }

  clearFilters(): void {
    this.selectedActions.set(new Set());
    this.page.set(0);
  }
}
