import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { PropertyService } from '../services/property.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { TranslatedDatePipe } from '../../../core/i18n/translated-date.pipe';
import { formatAddress, PropertyResponse } from '../models/property.models';
import { MeterListComponent } from '../../meters/meter-list/meter-list.component';
import { TariffListComponent } from '../../meters/tariff-list/tariff-list.component';
import { OccupancyAssignComponent } from '../../tenants/occupancy-assign/occupancy-assign.component';
import { OccupancyRemoveDialogComponent } from '../../tenants/occupancy-remove-dialog/occupancy-remove-dialog.component';
import { ContractListComponent } from '../../contracts/contract-list/contract-list.component';
import { TenantService } from '../../tenants/services/tenant.service';
import { CommonModule } from '@angular/common';
import { FixedCostListComponent } from '../../fixed-costs/fixed-cost-list/fixed-cost-list.component';
import { ProfitabilityDashboardComponent } from '../../reports/profitability-dashboard/profitability-dashboard.component';

@Component({
  selector: 'pms-property-detail',
  imports: [
    CommonModule, MatTabsModule, MatButtonModule, MatIconModule, RouterModule,
    TranslocoModule, PageHeaderComponent,
    SkeletonLoaderComponent, TranslatedDatePipe,
    MeterListComponent, TariffListComponent,
    OccupancyAssignComponent, ContractListComponent,
    FixedCostListComponent, ProfitabilityDashboardComponent,
  ],
  template: `
    @if (propertyResource.isLoading()) {
      <pms-skeleton-loader type="detail" />
    } @else if (propertyResource.value(); as property) {
      <pms-page-header [title]="property.name">
        <button mat-stroked-button
                (click)="router.navigate(['/properties', property.id, 'edit'])">
          <mat-icon>edit</mat-icon>
          {{ 'properties.detail.editButton' | transloco }}
        </button>
        <button mat-stroked-button color="warn" (click)="onDelete(property.id, property.name)">
          <mat-icon>delete</mat-icon>
          {{ 'properties.detail.deleteButton' | transloco }}
        </button>
      </pms-page-header>

      <div class="detail-content">
        <mat-tab-group>
          <mat-tab [label]="'properties.detail.tabs.overview' | transloco">
            <div class="tab-content">
              <div class="info-section">
                <h3>{{ 'properties.detail.address' | transloco }}</h3>
                <p>{{ addressText(property) || ('properties.detail.noAddress' | transloco) }}</p>
              </div>
              <div class="info-section">
                <h3>{{ 'properties.detail.description' | transloco }}</h3>
                <p>{{ property.description || ('properties.detail.noDescription' | transloco) }}</p>
              </div>
              <div class="info-section meta">
                <span>{{ 'properties.detail.addedOn' | transloco }}: {{ property.createdAt | translatedDate }}</span>
                <span>{{ 'properties.detail.lastUpdated' | transloco }}: {{ property.updatedAt | translatedDate }}</span>
              </div>
            </div>
          </mat-tab>

          <mat-tab [label]="'properties.detail.tabs.meters' | transloco">
            <div class="tab-content">
              <app-meter-list [propertyId]="propertyId" />
            </div>
          </mat-tab>

          <mat-tab [label]="'properties.detail.tabs.tariffs' | transloco">
            <div class="tab-content">
              <app-tariff-list [propertyId]="propertyId" />
            </div>
          </mat-tab>

          <mat-tab [label]="'properties.detail.tabs.tenants' | transloco">
            <div class="tab-content">
              <app-occupancy-assign
                [propertyId]="propertyId"
                (assigned)="occupanciesResource.reload()"
              />
              <div class="occupancy-list">
                @if (occupanciesResource.isLoading()) {
                  <p>Loading...</p>
                } @else {
                  @for (occ of occupanciesResource.value() ?? []; track occ.id) {
                    <div class="occupancy-row">
                      <div class="occupancy-info">
                        <span>{{ occ.tenantId }}</span>
                        <span class="occ-dates">
                          {{ occ.startDate | date:'dd.MM.yyyy' }} –
                          {{ occ.endDate ? (occ.endDate | date:'dd.MM.yyyy') : ('tenants.occupancy.active' | transloco) }}
                        </span>
                      </div>
                      @if (!occ.endDate) {
                        <button mat-icon-button color="warn" (click)="removeOccupancy(occ.tenantId)">
                          <mat-icon>person_remove</mat-icon>
                        </button>
                      }
                    </div>
                  } @empty {
                    <p class="empty-occupancy">{{ 'tenants.empty' | transloco }}</p>
                  }
                }
              </div>
            </div>
          </mat-tab>

          <mat-tab [label]="'properties.detail.tabs.contracts' | transloco">
            <div class="tab-content">
              <app-contract-list [propertyId]="propertyId" />
            </div>
          </mat-tab>

          <mat-tab [label]="'fixedCosts.title' | transloco">
            <div class="tab-content">
              <app-fixed-cost-list [propertyId]="propertyId" />
            </div>
          </mat-tab>

          <mat-tab [label]="'reports.profitability.navLabel' | transloco">
            <div class="tab-content">
              <app-profitability-dashboard />
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    } @else {
      <p class="error-text">{{ 'common.errors.notFound' | transloco }}</p>
    }
  `,
  styles: [`
    .detail-content { padding: 0 24px 24px; }
    .tab-content { padding: 24px 0; }
    .info-section { margin-bottom: 24px; }
    .info-section h3 { margin: 0 0 8px; font-size: 0.9rem; font-weight: 600;
                       text-transform: uppercase; letter-spacing: 0.05em;
                       color: var(--mat-sys-on-surface-variant); }
    .info-section p { margin: 0; }
    .meta { display: flex; gap: 24px; font-size: 0.85rem;
            color: var(--mat-sys-on-surface-variant); }
    .error-text { padding: 24px; color: var(--mat-sys-error); }
    .occupancy-list { margin-top: 16px; }
    .occupancy-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .occupancy-info { display: flex; flex-direction: column; gap: 2px; }
    .occ-dates { font-size: 0.85rem; color: var(--mat-sys-on-surface-variant); }
    .empty-occupancy { color: var(--mat-sys-on-surface-variant); font-style: italic; }
  `],
})
export class PropertyDetailComponent {
  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly propertyService = inject(PropertyService);
  private readonly tenantService = inject(TenantService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(SnackbarService);
  private readonly transloco = inject(TranslocoService);

  readonly propertyId = this.route.snapshot.paramMap.get('propertyId')!;

  readonly propertyResource = rxResource<PropertyResponse, void>({
    stream: () => this.propertyService.getById(this.propertyId),
  });

  readonly occupanciesResource = rxResource({
    stream: () => this.tenantService.getPropertyTenants(this.propertyId),
  });

  protected addressText(property: PropertyResponse): string {
    return formatAddress(property);
  }

  removeOccupancy(tenantId: string): void {
    const ref = this.dialog.open(OccupancyRemoveDialogComponent, {
      data: {
        propertyId: this.propertyId,
        tenantId,
        tenantName: tenantId,
      },
      width: '400px',
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.occupanciesResource.reload();
    });
  }

  onDelete(id: string, name: string): void {
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: this.transloco.translate('properties.delete.confirmTitle'),
        message: this.transloco.translate('properties.delete.confirmMessage', { name }),
        confirmLabel: this.transloco.translate('properties.delete.confirmButton'),
        cancelLabel: this.transloco.translate('buttons.cancel'),
        dangerous: true,
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.propertyService.delete(id).subscribe({
        next: () => {
          this.snackbar.success('properties.delete.success');
          this.router.navigate(['/properties']);
        },
      });
    });
  }
}
