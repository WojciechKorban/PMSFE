import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { AdminService } from '../services/admin.service';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-admin-user-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslocoPipe,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTableModule,
    SkeletonLoaderComponent
  ],
  template: `
    <div class="list-container">
      <div class="list-header">
        <h2>{{ 'admin.users.title' | transloco }}</h2>
      </div>

      @if (usersResource.isLoading()) {
        <pms-skeleton-loader type="list" [rowCount]="5" />
      } @else {
        <table mat-table [dataSource]="usersResource.value()?.content ?? []" class="users-table">
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>{{ 'admin.users.email' | transloco }}</th>
            <td mat-cell *matCellDef="let u">
              {{ u.email }}
              @if (u.deleted) {
                <span class="deleted-badge">{{ 'admin.users.deleted' | transloco }}</span>
              }
            </td>
          </ng-container>
          <ng-container matColumnDef="roles">
            <th mat-header-cell *matHeaderCellDef>{{ 'admin.users.roles' | transloco }}</th>
            <td mat-cell *matCellDef="let u">{{ u.roles.join(', ') }}</td>
          </ng-container>
          <ng-container matColumnDef="propertyCount">
            <th mat-header-cell *matHeaderCellDef>{{ 'admin.users.properties' | transloco }}</th>
            <td mat-cell *matCellDef="let u">{{ u.propertyCount }}</td>
          </ng-container>
          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>{{ 'admin.users.createdAt' | transloco }}</th>
            <td mat-cell *matCellDef="let u">{{ u.createdAt | date:'dd.MM.yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let u">
              <a mat-icon-button [routerLink]="['/admin/users', u.id]">
                <mat-icon>visibility</mat-icon>
              </a>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>

        <div class="pagination">
          <button mat-icon-button [disabled]="!usersResource.value()?.hasPrevious" (click)="page.set(page() - 1)">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <span>{{ 'common.pagination' | transloco: { page: ((usersResource.value()?.page ?? 0) + 1), total: (usersResource.value()?.totalPages ?? 1) } }}</span>
          <button mat-icon-button [disabled]="!usersResource.value()?.hasNext" (click)="page.set(page() + 1)">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .list-container { max-width: 900px; margin: 0 auto; padding: 16px; }
    .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .users-table { width: 100%; }
    .deleted-badge { margin-left: 8px; padding: 2px 6px; background: #fce4ec; color: #880e4f; border-radius: 4px; font-size: 0.75rem; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; }
  `]
})
export class AdminUserListComponent {
  private adminService = inject(AdminService);
  page = signal(0);
  columns = ['email', 'roles', 'propertyCount', 'createdAt', 'actions'];

  usersResource = rxResource({
    params: () => this.page(),
    stream: ({ params: p }) => this.adminService.getUsers(p, 20)
  });
}
