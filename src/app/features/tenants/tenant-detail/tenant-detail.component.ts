import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { EMPTY } from 'rxjs';
import { TenantService } from '../services/tenant.service';

@Component({
  selector: 'app-tenant-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslocoPipe,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatCardModule,
  ],
  template: `
    <div class="detail-container">
      <div class="detail-header">
        <button mat-icon-button routerLink="/tenants"><mat-icon>arrow_back</mat-icon></button>
        <h2>{{ 'tenants.detail.title' | transloco }}</h2>
      </div>

      @if (tenantResource.isLoading()) {
        <div class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (tenantResource.error()) {
        <div class="error">{{ 'common.error.loadFailed' | transloco }}</div>
      } @else if (tenantResource.value(); as tenant) {
        <mat-card>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-row">
                <span class="label">{{ 'tenants.form.name' | transloco }}</span>
                <span class="value">{{ tenant.name }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ 'tenants.form.email' | transloco }}</span>
                <span class="value">{{ tenant.email }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ 'tenants.form.phone' | transloco }}</span>
                <span class="value">{{ tenant.phone ?? '—' }}</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <a mat-raised-button color="primary" [routerLink]="['/tenants', tenant.id, 'edit']">
              <mat-icon>edit</mat-icon>
              {{ 'common.edit' | transloco }}
            </a>
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .detail-container { max-width: 600px; margin: 0 auto; padding: 16px; }
    .detail-header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .error { color: red; padding: 16px; }
    .info-grid { display: flex; flex-direction: column; gap: 12px; }
    .info-row { display: flex; gap: 16px; }
    .label { font-weight: 600; min-width: 120px; color: var(--mat-sys-on-surface-variant); }
    .value { flex: 1; }
  `],
})
export class TenantDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tenantService = inject(TenantService);

  tenantId = signal<string | null>(null);

  tenantResource = rxResource({
    params: () => this.tenantId(),
    stream: ({ params: id }) => id ? this.tenantService.getById(id) : EMPTY,
  });

  ngOnInit(): void {
    const id = this.route.snapshot.params['tenantId'];
    if (id) this.tenantId.set(id);
  }
}
