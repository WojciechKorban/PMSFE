import { Component, inject, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MeterService } from '../services/meter.service';
import { MeterCardComponent } from '../meter-card/meter-card.component';
import { Meter, UtilityType } from '../models/meter.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-meter-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslocoPipe,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatSelectModule, MatFormFieldModule,
    MeterCardComponent, SkeletonLoaderComponent
  ],
  template: `
    <div class="meter-list-header">
      <h2>{{ 'meters.title' | transloco }}</h2>
      <div class="header-actions">
        <mat-form-field appearance="outline" class="filter-select">
          <mat-label>{{ 'meters.filter.utilityType' | transloco }}</mat-label>
          <mat-select [value]="filterType()" (selectionChange)="onFilterChange($event.value)">
            <mat-option [value]="null">{{ 'common.all' | transloco }}</mat-option>
            @for (type of utilityTypes; track type) {
              <mat-option [value]="type">{{ ('meters.utilityType.' + type) | transloco }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <a mat-raised-button color="primary" [routerLink]="['new']">
          <mat-icon>add</mat-icon>
          {{ 'meters.addMeter' | transloco }}
        </a>
      </div>
    </div>

    @if (metersResource.isLoading()) {
      <pms-skeleton-loader type="list" [rowCount]="4" />
    } @else if (metersResource.error()) {
      <div class="error-message">{{ 'common.error.loadFailed' | transloco }}</div>
    } @else {
      @if (filteredMeters().length === 0) {
        <div class="empty-state">
          <mat-icon>electric_meter</mat-icon>
          <p>{{ 'meters.empty' | transloco }}</p>
          <a mat-raised-button color="primary" [routerLink]="['new']">
            {{ 'meters.addMeter' | transloco }}
          </a>
        </div>
      } @else {
        <div class="meters-grid">
          @for (meter of filteredMeters(); track meter.id) {
            <app-meter-card
              [meter]="meter"
              (deleted)="onMeterDeleted(meter.id)"
            />
          }
        </div>
      }
    }
  `,
  styles: [`
    .meter-list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
    .header-actions { display: flex; align-items: center; gap: 8px; }
    .filter-select { width: 200px; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .error-message { color: red; padding: 16px; }
    .empty-state { text-align: center; padding: 48px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; }
    .meters-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
  `]
})
export class MeterListComponent {
  propertyId = input.required<string>();

  private meterService = inject(MeterService);

  filterType = signal<UtilityType | null>(null);

  readonly utilityTypes: UtilityType[] = ['ELECTRICITY', 'GAS', 'WATER', 'HEAT', 'OTHER'];

  metersResource = rxResource({
    params: () => this.propertyId(),
    stream: ({ params: pid }) => this.meterService.getAll(pid)
  });

  filteredMeters = computed(() => {
    const meters = this.metersResource.value() ?? [];
    const filter = this.filterType();
    return filter ? meters.filter((m: Meter) => m.utilityType === filter) : meters;
  });

  onFilterChange(value: UtilityType | null): void {
    this.filterType.set(value);
  }

  onMeterDeleted(_meterId: string): void {
    this.metersResource.reload();
  }
}
