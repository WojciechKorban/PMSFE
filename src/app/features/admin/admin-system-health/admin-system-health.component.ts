import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-system-health',
  standalone: true,
  imports: [
    CommonModule, TranslocoPipe,
    MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="health-container">
      <div class="header-row">
        <h2>{{ 'admin.system.title' | transloco }}</h2>
        <button mat-stroked-button (click)="refresh()" [disabled]="healthResource.isLoading()">
          <mat-icon>refresh</mat-icon>
          {{ 'admin.system.refresh' | transloco }}
        </button>
      </div>

      @if (healthResource.isLoading()) {
        <div class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (healthResource.value()) {
        <div class="stats-grid">
          <mat-card class="stat-card" [class.warn]="healthResource.value()!.pendingOutboxEvents > 0">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon [class.amber]="healthResource.value()!.pendingOutboxEvents > 0">schedule</mat-icon>
              </div>
              <div class="stat-value">{{ healthResource.value()!.pendingOutboxEvents }}</div>
              <div class="stat-label">{{ 'admin.system.stats.pendingOutbox' | transloco }}</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card" [class.danger]="healthResource.value()!.failedOutboxEvents > 0">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon [class.red]="healthResource.value()!.failedOutboxEvents > 0">error</mat-icon>
              </div>
              <div class="stat-value">{{ healthResource.value()!.failedOutboxEvents }}</div>
              <div class="stat-label">{{ 'admin.system.stats.failedOutbox' | transloco }}</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon>people</mat-icon>
              </div>
              <div class="stat-value">{{ healthResource.value()!.totalUsers }}</div>
              <div class="stat-label">{{ 'admin.system.stats.totalUsers' | transloco }}</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon>home</mat-icon>
              </div>
              <div class="stat-value">{{ healthResource.value()!.totalProperties }}</div>
              <div class="stat-label">{{ 'admin.system.stats.totalProperties' | transloco }}</div>
            </mat-card-content>
          </mat-card>
        </div>

        @if ((healthResource.value()?.failedOutboxEvents ?? 0) > 0) {
          <div class="replay-section">
            <button
              mat-raised-button
              color="warn"
              [disabled]="healthResource.isLoading()"
              (click)="replayAllFailed()"
            >
              <mat-icon>replay</mat-icon>
              {{ 'admin.system.replayFailed' | transloco }}
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .health-container { max-width: 900px; margin: 0 auto; padding: 16px; }
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .stat-card { text-align: center; }
    .stat-card.warn { border-left: 4px solid #ff9800; }
    .stat-card.danger { border-left: 4px solid #f44336; }
    .stat-header { margin-bottom: 8px; }
    .stat-header mat-icon { font-size: 32px; width: 32px; height: 32px; color: #555; }
    .stat-header mat-icon.amber { color: #ff9800; }
    .stat-header mat-icon.red { color: #f44336; }
    .stat-value { font-size: 2rem; font-weight: 700; }
    .stat-label { font-size: 0.875rem; color: #666; margin-top: 4px; }
    .replay-section { margin-top: 20px; }
  `]
})
export class AdminSystemHealthComponent {
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);

  refreshTrigger = signal(0);

  healthResource = rxResource({
    params: () => this.refreshTrigger(),
    stream: () => this.adminService.getSystemHealth()
  });

  refresh(): void {
    this.refreshTrigger.update(v => v + 1);
  }

  replayAllFailed(): void {
    this.snackBar.open('admin.system.replayNote', 'OK', { duration: 5000 });
  }
}
