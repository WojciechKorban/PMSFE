import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslocoPipe,
    MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="admin-container">
      <h2>{{ 'admin.title' | transloco }}</h2>

      <div class="nav-links">
        <a mat-stroked-button routerLink="/admin/users">
          <mat-icon>people</mat-icon> {{ 'admin.nav.users' | transloco }}
        </a>
        <a mat-stroked-button routerLink="/admin/audit-log">
          <mat-icon>history</mat-icon> {{ 'admin.nav.auditLog' | transloco }}
        </a>
      </div>

      @if (healthResource.isLoading()) {
        <div class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (healthResource.value()) {
        <h3>{{ 'admin.health.title' | transloco }}</h3>

        @if (healthResource.value()!.failedOutboxEvents > 0) {
          <div class="warning-banner">
            <mat-icon color="warn">warning</mat-icon>
            <span>{{ 'admin.health.failedWarning' | transloco }}</span>
          </div>
        }

        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-value">{{ healthResource.value()!.totalUsers }}</div>
              <div class="stat-label">{{ 'admin.health.totalUsers' | transloco }}</div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-value">{{ healthResource.value()!.totalProperties }}</div>
              <div class="stat-label">{{ 'admin.health.totalProperties' | transloco }}</div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card" [class.warn]="healthResource.value()!.pendingOutboxEvents > 0">
            <mat-card-content>
              <div class="stat-value">{{ healthResource.value()!.pendingOutboxEvents }}</div>
              <div class="stat-label">{{ 'admin.health.pendingEvents' | transloco }}</div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card" [class.danger]="healthResource.value()!.failedOutboxEvents > 0">
            <mat-card-content>
              <div class="stat-value">{{ healthResource.value()!.failedOutboxEvents }}</div>
              <div class="stat-label">{{ 'admin.health.failedEvents' | transloco }}</div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-container { max-width: 900px; margin: 0 auto; padding: 16px; }
    .nav-links { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-top: 16px; }
    .stat-card { text-align: center; }
    .stat-card.warn { border-left: 4px solid #ff9800; }
    .stat-card.danger { border-left: 4px solid #f44336; }
    .stat-value { font-size: 2rem; font-weight: 700; }
    .stat-label { font-size: 0.875rem; color: #666; margin-top: 4px; }
    .warning-banner { display: flex; align-items: center; gap: 8px; padding: 12px; background: #fff3e0; border-radius: 4px; margin-bottom: 16px; }
    h3 { margin-top: 24px; }
  `]
})
export class AdminDashboardComponent {
  private adminService = inject(AdminService);

  healthResource = rxResource({
    stream: () => this.adminService.getSystemHealth()
  });
}
