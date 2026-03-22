import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-user-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslocoPipe,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="detail-container">
      <div class="detail-header">
        <a mat-icon-button routerLink="/admin/users"><mat-icon>arrow_back</mat-icon></a>
        @if (userResource.value()) {
          <h2>{{ userResource.value()!.email }}</h2>
        }
      </div>

      @if (userResource.isLoading()) {
        <div class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (userResource.value()) {
        <div class="info-grid">
          <mat-card>
            <mat-card-content>
              <div class="info-row"><span class="label">Email:</span><span>{{ userResource.value()!.email }}</span></div>
              <div class="info-row"><span class="label">Roles:</span><span>{{ userResource.value()!.roles.join(', ') }}</span></div>
              <div class="info-row"><span class="label">Status:</span><span>{{ userResource.value()!.accountStatus }}</span></div>
              <div class="info-row"><span class="label">Email verified:</span><span>{{ userResource.value()!.emailVerified }}</span></div>
              <div class="info-row"><span class="label">Created:</span><span>{{ userResource.value()!.createdAt | date:'dd.MM.yyyy HH:mm' }}</span></div>
            </mat-card-content>
          </mat-card>

          @if (userResource.value()!.properties.length > 0) {
            <mat-card>
              <mat-card-header><mat-card-title>Properties</mat-card-title></mat-card-header>
              <mat-card-content>
                @for (p of userResource.value()!.properties; track p.id) {
                  <div class="property-row">{{ p.name }}, {{ p.city }}</div>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>

        <h3>{{ 'admin.auditLog.title' | transloco }}</h3>
        @if (auditResource.isLoading()) {
          <mat-spinner diameter="32"></mat-spinner>
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
            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>{{ 'admin.auditLog.timestamp' | transloco }}</th>
              <td mat-cell *matCellDef="let e">{{ e.createdAt | date:'dd.MM.yyyy HH:mm' }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="auditColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: auditColumns"></tr>
          </table>
          <div class="pagination">
            <button mat-icon-button [disabled]="!auditResource.value()?.hasPrevious" (click)="auditPage.set(auditPage() - 1)">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <span>{{ 'common.pagination' | transloco: { page: ((auditResource.value()?.page ?? 0) + 1), total: (auditResource.value()?.totalPages ?? 1) } }}</span>
            <button mat-icon-button [disabled]="!auditResource.value()?.hasNext" (click)="auditPage.set(auditPage() + 1)">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .detail-container { max-width: 900px; margin: 0 auto; padding: 16px; }
    .detail-header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .info-grid { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
    .info-row { display: flex; gap: 16px; padding: 4px 0; }
    .label { color: #666; min-width: 140px; }
    .property-row { padding: 4px 0; border-bottom: 1px solid #eee; }
    .audit-table { width: 100%; margin-top: 8px; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; }
  `]
})
export class AdminUserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private adminService = inject(AdminService);

  userId = signal('');
  auditPage = signal(0);
  auditColumns = ['action', 'entityType', 'createdAt'];

  userResource = rxResource({
    params: () => this.userId(),
    stream: ({ params: id }) => id ? this.adminService.getUserDetail(id) : EMPTY
  });

  auditResource = rxResource({
    params: () => ({ userId: this.userId(), page: this.auditPage() }),
    stream: ({ params: { userId, page } }) =>
      userId ? this.adminService.getUserAuditLog(userId, page, 50) : EMPTY
  });

  ngOnInit(): void {
    this.userId.set(this.route.snapshot.params['userId'] ?? '');
  }
}
