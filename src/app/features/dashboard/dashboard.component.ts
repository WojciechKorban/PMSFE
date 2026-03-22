import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { PropertyService } from '../properties/services/property.service';
import { PropertyResponse } from '../properties/models/property.models';
import { AuthService } from '../../core/auth/auth.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'pms-dashboard',
  imports: [
    MatCardModule, MatButtonModule, MatIconModule,
    TranslocoModule, EmptyStateComponent, SkeletonLoaderComponent,
    PageHeaderComponent,
  ],
  template: `
    <pms-page-header [title]="welcomeMessage()" />

    <div class="dashboard-content">
      @if (propertiesResource.isLoading()) {
        <pms-skeleton-loader type="card" [rowCount]="2" />
      } @else if (propertiesResource.error()) {
        <p class="error-text">{{ 'properties.list.loadError' | transloco }}</p>
      } @else if ((propertiesResource.value() ?? []).length === 0) {
        <pms-empty-state
          icon="home"
          [title]="'dashboard.emptyState.title' | transloco"
          [description]="'dashboard.emptyState.description' | transloco"
          [actionLabel]="'dashboard.emptyState.action' | transloco"
          (actionClick)="router.navigate(['/properties/new'])"
        />
      } @else {
        <div class="summary-cards">
          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-stat">
                <mat-icon>home</mat-icon>
                <div>
                  <div class="stat-number">{{ propertiesResource.value()!.length }}</div>
                  <div class="stat-label">{{ 'nav.properties' | transloco }}</div>
                </div>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" (click)="router.navigate(['/properties'])">
                {{ 'buttons.manage' | transloco }}
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-content { padding: 0 24px 24px; }
    .summary-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
    .summary-card { cursor: default; }
    .card-stat { display: flex; align-items: center; gap: 16px; padding: 8px 0; }
    mat-icon { font-size: 36px; width: 36px; height: 36px; color: var(--mat-sys-primary); }
    .stat-number { font-size: 2rem; font-weight: 700; line-height: 1; }
    .stat-label { color: var(--mat-sys-on-surface-variant); font-size: 0.9rem; margin-top: 4px; }
    .error-text { color: var(--mat-sys-error); padding: 24px; }
  `],
})
export class DashboardComponent {
  protected readonly router = inject(Router);
  private readonly propertyService = inject(PropertyService);
  private readonly authService = inject(AuthService);
  private readonly transloco = inject(TranslocoService);

  readonly propertiesResource = rxResource<PropertyResponse[], void>({
    stream: () => this.propertyService.getAll(),
  });

  readonly welcomeMessage = computed(() => {
    const email = this.authService.currentUser()?.email;
    if (email) {
      return this.transloco.translate('dashboard.welcome', { name: email });
    }
    return this.transloco.translate('dashboard.welcomeGeneric');
  });
}
